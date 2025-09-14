import 'dotenv/config';
import { App, Stack, StackProps } from 'aws-cdk-lib';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { ApplicationTargetGroup, ApplicationProtocol, ListenerAction, ListenerCondition, TargetType } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Cluster, Ec2Service, Ec2TaskDefinition, ContainerImage, Protocol } from 'aws-cdk-lib/aws-ecs';
import * as ecs from 'aws-cdk-lib/aws-ecs';

class ServiceStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);
    const stage = process.env.STAGE || 'dev';
    const clusterArn = ssm.StringParameter.valueForStringParameter(this, `/game/${stage}/ecs/clusterArn`);
    const listenerArn = ssm.StringParameter.valueForStringParameter(this, `/game/${stage}/alb/listenerArn`);
    const cluster = Cluster.fromClusterArn(this, 'Cluster', clusterArn);
    const task = new Ec2TaskDefinition(this, 'TaskDef');
    const container = task.addContainer('c', {
      image: ContainerImage.fromRegistry('public.ecr.aws/docker/library/nginx:latest'),
      memoryLimitMiB: 256, cpu: 128, logging: ecs.LogDriver.awsLogs({ streamPrefix: 'db' })
    });
    container.addPortMappings({ containerPort: 4010, protocol: Protocol.TCP });
    const service = new Ec2Service(this, 'Service', { cluster, taskDefinition: task, desiredCount: 1 });
    const { ApplicationListener } = require('aws-cdk-lib/aws-elasticloadbalancingv2');
    const tg = new ApplicationTargetGroup(this, 'Tg', { protocol: ApplicationProtocol.HTTP, port: 4010, vpc: (cluster as any).vpc, targetType: TargetType.INSTANCE });
    (service.node.defaultChild as any).addPropertyOverride('LoadBalancers', [{ ContainerName: 'c', ContainerPort: 4010, TargetGroupArn: tg.targetGroupArn }]);
    const listener = ApplicationListener.fromApplicationListenerArn(this, 'L', listenerArn);
    listener.addAction('route-db-4010', {
      action: ListenerAction.forward([tg]),
      conditions: [ListenerCondition.pathPatterns(['/db/*'])],
      priority: Math.floor(Math.random()*2000)+1
    });
  }
}
const app = new App();
new ServiceStack(app, `DbStack-${process.env.STAGE || 'dev'}`);
