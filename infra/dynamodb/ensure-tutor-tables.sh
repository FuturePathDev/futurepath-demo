#!/usr/bin/env bash
set -euo pipefail

REGION="${AWS_REGION:-us-east-1}"
echo "Using region: $REGION"

create_if_missing() {
  local name="$1"; shift
  if aws dynamodb describe-table --region "$REGION" --table-name "$name" >/dev/null 2>&1; then
    echo "✓ $name exists"
  else
    echo "→ creating $name ..."
    aws dynamodb create-table --region "$REGION" --table-name "$name" "$@"
  fi
}

# 1) FuturePathTutors (PK = tutorId)
create_if_missing FuturePathTutors \
  --attribute-definitions AttributeName=tutorId,AttributeType=S \
  --key-schema AttributeName=tutorId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST

# 2) FuturePathTutorAssignments (PK = studentId, SK = tutorId) + GSI tutorId-index
create_if_missing FuturePathTutorAssignments \
  --attribute-definitions AttributeName=studentId,AttributeType=S AttributeName=tutorId,AttributeType=S \
  --key-schema AttributeName=studentId,KeyType=HASH AttributeName=tutorId,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --global-secondary-indexes '[
    {"IndexName":"tutorId-index","KeySchema":[{"AttributeName":"tutorId","KeyType":"HASH"},{"AttributeName":"studentId","KeyType":"RANGE"}],"Projection":{"ProjectionType":"ALL"}}
  ]'

# 3) FuturePathTutorSessions (PK = sessionId) + GSIs
create_if_missing FuturePathTutorSessions \
  --attribute-definitions AttributeName=sessionId,AttributeType=S AttributeName=tutorId,AttributeType=S AttributeName=studentId,AttributeType=S AttributeName=startIso,AttributeType=S \
  --key-schema AttributeName=sessionId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --global-secondary-indexes '[
    {"IndexName":"tutorId-index","KeySchema":[{"AttributeName":"tutorId","KeyType":"HASH"},{"AttributeName":"startIso","KeyType":"RANGE"}],"Projection":{"ProjectionType":"ALL"}},
    {"IndexName":"studentId-index","KeySchema":[{"AttributeName":"studentId","KeyType":"HASH"},{"AttributeName":"startIso","KeyType":"RANGE"}],"Projection":{"ProjectionType":"ALL"}}
  ]'

echo "Waiting for ACTIVE..."
aws dynamodb wait table-exists --region "$REGION" --table-name FuturePathTutors
aws dynamodb wait table-exists --region "$REGION" --table-name FuturePathTutorAssignments
aws dynamodb wait table-exists --region "$REGION" --table-name FuturePathTutorSessions

echo "Status:"
aws dynamodb describe-table --region "$REGION" --table-name FuturePathTutors           --query "Table.[TableName,TableStatus]" --output table
aws dynamodb describe-table --region "$REGION" --table-name FuturePathTutorAssignments --query "Table.[TableName,TableStatus,GlobalSecondaryIndexes[].IndexName]" --output table
aws dynamodb describe-table --region "$REGION" --table-name FuturePathTutorSessions    --query "Table.[TableName,TableStatus,GlobalSecondaryIndexes[].IndexName]" --output table
