#!/usr/bin/env bash
set -euo pipefail
echo "[aws] Listing CloudFormation stacks:"
aws cloudformation list-stacks --query "StackSummaries[?StackStatus!='DELETE_COMPLETE'].{Name:StackName,Status:StackStatus,Updated:LastUpdatedTime}" --output table || true
