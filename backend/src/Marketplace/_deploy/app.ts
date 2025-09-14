import 'dotenv/config';
import { App, Stack, StackProps, Duration } from 'aws-cdk-lib';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { ApplicationTargetGroup, ApplicationProtocol, ListenerAction, ListenerCondition, TargetType } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Cluster, Ec2Service, Ec2TaskDefinition, ContainerImage, Compatibility, Protocol } from 'aws-cdk-lib/aws-ecs';
import { fromApplicationTargetGroupAttributes } from 'aws-cdk-lib/aws-elasticloadbalancingv2-targets';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

class ServiceStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);
    const stage = process.env.STAGE || 'dev';
    const clusterArn = ssm.StringParameter.valueForStringParameter(this, `/game/${stage}/ecs/clusterArn`);
    const listenerArn = ssm.StringParameter.valueForStringParameter(this, `/game/${stage}/alb/listenerArn`);
    const cluster = Cluster.fromClusterArn(this, 'Cluster', clusterArn);
    // NOTE: This is a skeleton; you must wire EC2 capacity externally in GlobalStack.
    const task = new Ec2TaskDefinition(this, 'TaskDef');
    const container = task.addContainer('c', {
      image: ContainerImage.fromRegistry('public.ecr.aws/docker/library/nginx:latest'),
      memoryLimitMiB: 256, cpu: 128, logging: ecs.LogDriver.awsLogs({ streamPrefix: 'marketplace' })
    });
    container.addPortMappings({ containerPort: 4003, protocol: Protocol.TCP });
    const service = new Ec2Service(this, 'Service', { cluster, taskDefinition: task, desiredCount: 1 });
    // Target group + listener rule
    const tg = new ApplicationTargetGroup(this, 'Tg', {
      protocol: ApplicationProtocol.HTTP, port: 4003, vpc: (cluster as any).vpc, targetType: TargetType.INSTANCE
    });
    (service.node.defaultChild as any).addPropertyOverride('LoadBalancers', [{ ContainerName: 'c', ContainerPort: 4003, TargetGroupArn: tg.targetGroupArn }]);
    const listener = (require('aws-cdk-lib/aws-elasticloadbalancingv2')).ApplicationListener.fromApplicationListenerArn(this, 'L', listenerArn);
    listener.addAction('route-marketplace-4003', {
      action: ListenerAction.forward([tg]),
      conditions: [ListenerCondition.pathPatterns(['/marketplace/*'])],
      priority: Math.floor(Math.random()*2000)+1
    });
  }
}

const app = new App();
new ServiceStack(app, `MarketplaceStack-${process.env.STAGE || 'dev'}`);
