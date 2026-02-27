# Terraform migration (full stack)

This folder manages the current AWS architecture for this repository with Terraform.

## Scope managed here

- Cognito (User Pool, app clients, Identity Pool, role attachment, auth/unauth roles)
- API Gateway REST API (`todoapi`) including stage/deployment and API models
- Lambda (`reactTodoApi-dev`) and all current API Gateway invoke permissions
- DynamoDB table (`todos`)
- CloudWatch log group for Lambda
- Amplify Hosting (App, Branch, Backend Environment, deploy IAM role)

## Prerequisites

- Terraform `>= 1.5`
- AWS profile configured (`reacttodo-tf` by default)
- Do **not** run `amplify push` for backend resources after cutover

## 1. Import all existing resources

From this folder:

```powershell
./import.ps1
```

The script is idempotent (already-imported resources are skipped).

## 2. Review the plan

```powershell
terraform plan
```

Current expected result after import:

- `0 to add`
- `0 to destroy`
- only in-place updates (currently 3)

Current in-place updates are:

- `aws_api_gateway_rest_api.todo_api`: stores the exported Swagger as Terraform `body`
- `aws_cognito_user_pool_client.web/native`: token validity units normalization (`access_token`/`id_token` shown as `hours`)

## 3. Apply

```powershell
terraform apply
```

## 4. Frontend values

Check values used by frontend:

```powershell
terraform output frontend_amplify_configuration
terraform output todo_api_base_url
```

## 5. Cutover notes

- Backend infra changes should be done via Terraform only
- Keep Amplify Hosting if you still use it, but avoid backend mutations via Amplify CLI

## Files

- `main.tf`: Cognito/Auth
- `todo_stack.tf`: API Gateway/Lambda/DynamoDB/CloudWatch/IAM
- `hosting.tf`: Amplify Hosting + service role
- `apigateway/todoapi-swagger.json`: exported API definition used by Terraform
- `import.ps1`: one-shot import helper
