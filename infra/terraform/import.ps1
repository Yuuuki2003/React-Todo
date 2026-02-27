param(
  [string]$AwsProfile = "reacttodo-tf",

  [string]$UserPoolId = "ap-northeast-1_v8NUvHFoS",
  [string]$UserPoolWebClientId = "3ppu60ej88o3ksv56at82qf2fa",
  [string]$UserPoolNativeClientId = "38ilk0usj16qk9ni3b701nb9u8",
  [string]$IdentityPoolId = "ap-northeast-1:b6c07328-da28-4cd9-9c38-8805bcddc4cf",
  [string]$AuthRoleName = "amplify-reacttodo-main-ed9ee-authRole",
  [string]$UnauthRoleName = "amplify-reacttodo-main-ed9ee-unauthRole",

  [string]$TodoTableName = "todos",
  [string]$TodoLambdaRoleName = "reacttodoLambdaRole6cc17f6e-dev",
  [string]$TodoLambdaFunctionName = "reactTodoApi-dev",
  [string]$TodoApiId = "bj7lj8jhf4",
  [string]$TodoApiStageName = "dev",
  [string]$TodoApiDeploymentId = "u2cc5w",

  [string]$AmplifyAppId = "d2106vo77pbpbv",
  [string]$AmplifyBranchName = "main",
  [string]$AmplifyBackendEnvironmentName = "main",
  [string]$AmplifyDeployRoleName = "amplify-react-todo-deploy-role"
)

$ErrorActionPreference = "Stop"
$env:AWS_PROFILE = $AwsProfile

function Import-IfMissing {
  param(
    [Parameter(Mandatory = $true)][string]$Address,
    [Parameter(Mandatory = $true)][string]$Id
  )

  try {
    $stateEntries = terraform state list 2>$null
  } catch {
    # First run has no state file yet; treat as empty and continue imports.
    $stateEntries = @()
  }
  if ($stateEntries -contains $Address) {
    Write-Host "Skip import (already in state): $Address"
    return
  }

  terraform import $Address $Id
}

terraform init

# Auth (Cognito + Identity)
Import-IfMissing -Address "aws_cognito_user_pool.main" -Id $UserPoolId
Import-IfMissing -Address "aws_cognito_user_pool_client.web" -Id "$UserPoolId/$UserPoolWebClientId"
Import-IfMissing -Address "aws_cognito_user_pool_client.native" -Id "$UserPoolId/$UserPoolNativeClientId"
Import-IfMissing -Address "aws_cognito_identity_pool.main" -Id $IdentityPoolId
Import-IfMissing -Address "aws_iam_role.auth" -Id $AuthRoleName
Import-IfMissing -Address "aws_iam_role.unauth" -Id $UnauthRoleName
Import-IfMissing -Address "aws_cognito_identity_pool_roles_attachment.main" -Id $IdentityPoolId

# Todo API stack (DynamoDB + Lambda + IAM + API Gateway + CloudWatch)
Import-IfMissing -Address "aws_dynamodb_table.todos" -Id $TodoTableName
Import-IfMissing -Address "aws_iam_role.todo_lambda" -Id $TodoLambdaRoleName
Import-IfMissing -Address "aws_iam_role_policy.todo_lambda_execution" -Id "${TodoLambdaRoleName}:lambda-execution-policy"
Import-IfMissing -Address "aws_iam_role_policy.todo_lambda_dynamodb" -Id "${TodoLambdaRoleName}:TodosTableAccessPolicy"
Import-IfMissing -Address "aws_cloudwatch_log_group.todo_lambda" -Id "/aws/lambda/$TodoLambdaFunctionName"
Import-IfMissing -Address "aws_lambda_function.todo_api" -Id $TodoLambdaFunctionName
Import-IfMissing -Address "aws_api_gateway_rest_api.todo_api" -Id $TodoApiId
Import-IfMissing -Address "aws_api_gateway_model.request_schema" -Id "$TodoApiId/RequestSchema"
Import-IfMissing -Address "aws_api_gateway_model.response_schema" -Id "$TodoApiId/ResponseSchema"
Import-IfMissing -Address "aws_api_gateway_deployment.todo_api" -Id "$TodoApiId/$TodoApiDeploymentId"
Import-IfMissing -Address "aws_api_gateway_stage.todo_api_dev" -Id "$TodoApiId/$TodoApiStageName"

# Existing Lambda invoke permissions
Import-IfMissing -Address "aws_lambda_permission.todo_api_all_methods" -Id "$TodoLambdaFunctionName/amplify-reacttodo-dev-ea561-apitodoapi-BW440HZUCG-functionreactTodoApiPermissiontodoapi-Xu9Yh6Kg6oo0"
Import-IfMissing -Address "aws_lambda_permission.todo_api_get_todos" -Id "$TodoLambdaFunctionName/efb35aee-55e1-5413-9dbd-67d494070b10"
Import-IfMissing -Address "aws_lambda_permission.todo_api_post_todos" -Id "$TodoLambdaFunctionName/e5299934-ecdc-5a44-90b3-e9a38bf68a18"
Import-IfMissing -Address "aws_lambda_permission.todo_api_put_todos" -Id "$TodoLambdaFunctionName/627b9a02-cf47-5c39-a5dd-5f5883417dc0"
Import-IfMissing -Address "aws_lambda_permission.todo_api_delete_todos" -Id "$TodoLambdaFunctionName/85fef8f4-71fb-5cfb-b317-0bc9400cfba1"
Import-IfMissing -Address "aws_lambda_permission.todo_api_legacy_get_root" -Id "$TodoLambdaFunctionName/37c4c264-e14d-5b5f-abb3-6e5946287e47"
Import-IfMissing -Address "aws_lambda_permission.todo_api_put_todos_id" -Id "$TodoLambdaFunctionName/24838977-2c50-589e-a857-434abf3839d4"
Import-IfMissing -Address "aws_lambda_permission.todo_api_delete_todos_id" -Id "$TodoLambdaFunctionName/c4883bac-a6dd-5b78-80d3-db270b94bb85"

# Amplify Hosting
Import-IfMissing -Address "aws_iam_role.amplify_deploy" -Id $AmplifyDeployRoleName
Import-IfMissing -Address "aws_iam_role_policy_attachment.amplify_admin_access" -Id "$AmplifyDeployRoleName/arn:aws:iam::aws:policy/AdministratorAccess-Amplify"
Import-IfMissing -Address "aws_amplify_app.frontend" -Id $AmplifyAppId
Import-IfMissing -Address "aws_amplify_backend_environment.main" -Id "$AmplifyAppId/$AmplifyBackendEnvironmentName"
Import-IfMissing -Address "aws_amplify_branch.main" -Id "$AmplifyAppId/$AmplifyBranchName"

terraform plan
