import 'dotenv/config';
import { App, Stack, StackProps, Duration, CfnOutput, RemovalPolicy } from 'aws-cdk-lib';
import { Vpc, SubnetType, InstanceType, InstanceClass, InstanceSize, SecurityGroup, Peer, Port } from 'aws-cdk-lib/aws-ec2';
import { Cluster, CapacityProviderStrategy } from 'aws-cdk-lib/aws-ecs';
import { ApplicationLoadBalancer, ApplicationProtocol, ListenerAction } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { DatabaseInstance, DatabaseInstanceEngine, PostgresEngineVersion, Credentials } from 'aws-cdk-lib/aws-rds';
import { RetentionDays, LogGroup } from 'aws-cdk-lib/aws-logs';
import * as ssm from 'aws-cdk-lib/aws-ssm';

class GlobalStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);
    const stage = process.env.STAGE || 'dev';
    const vpc = new Vpc(this, `Vpc-${stage}`, {
      natGateways: 0,
      maxAzs: 2,
      subnetConfiguration: [
        { name: 'public', subnetType: SubnetType.PUBLIC },
      ]
    });
    const cluster = new Cluster(this, `EcsCluster-${stage}`, { vpc, containerInsights: true });
    const alb = new ApplicationLoadBalancer(this, `Alb-${stage}`, { vpc, internetFacing: true });
    const listener = alb.addListener(`HttpListener-${stage}`, { port: 80, protocol: ApplicationProtocol.HTTP, open: true });
    // RDS (dev-sized). For real prod, use private subnets + SGs + IAM auth + Proxy.
    const db = new DatabaseInstance(this, `Rds-${stage}`, {
      vpc, vpcSubnets: { subnetType: SubnetType.PUBLIC },
      engine: DatabaseInstanceEngine.postgres({ version: PostgresEngineVersion.V16 }),
      instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.MICRO),
      credentials: Credentials.fromGeneratedSecret('postgres'),
      multiAz: false, allocatedStorage: 20, deleteAutomatedBackups: true,
      removalPolicy: RemovalPolicy.SNAPSHOT
    });
    // Exports via SSM for per-service stacks
    new ssm.StringParameter(this, `Param-ClusterArn-${stage}`, { parameterName: `/game/${stage}/ecs/clusterArn`, stringValue: cluster.clusterArn });
    new ssm.StringParameter(this, `Param-ListenerArn-${stage}`, { parameterName: `/game/${stage}/alb/listenerArn`, stringValue: listener.listenerArn });
    new ssm.StringParameter(this, `Param-AlbDns-${stage}`, { parameterName: `/game/${stage}/alb/dns`, stringValue: alb.loadBalancerDnsName });
    new ssm.StringParameter(this, `Param-DbEndpoint-${stage}`, { parameterName: `/game/${stage}/db/endpoint`, stringValue: db.dbInstanceEndpointAddress });
    new ssm.StringParameter(this, `Param-DbSecretArn-${stage}`, { parameterName: `/game/${stage}/db/secretArn`, stringValue: db.secret!.secretArn });
    new CfnOutput(this, 'AlbUrl', { value: `http://${alb.loadBalancerDnsName}` });
  }
}

const app = new App();
new GlobalStack(app, `GlobalStack-${process.env.STAGE || 'dev'}`);
