variable "aws_region" {
  description = "AWS region for Cognito resources"
  type        = string
  default     = "ap-northeast-1"
}

variable "aws_profile" {
  description = "AWS shared credentials/config profile name used by Terraform"
  type        = string
  default     = "reacttodo-tf"
}

variable "default_tags" {
  description = "Tags currently applied by Amplify and kept after migration"
  type        = map(string)
  default = {
    "user:Application" = "ReactTodo"
    "user:Stack"       = "main"
  }
}

variable "user_pool_name" {
  description = "Existing Cognito User Pool name"
  type        = string
  default     = "reacttodod4d788e2_userpool_d4d788e2-main"
}

variable "identity_pool_name" {
  description = "Existing Cognito Identity Pool name"
  type        = string
  default     = "reacttodod4d788e2_identitypool_d4d788e2__main"
}

variable "web_client_name" {
  description = "Existing Cognito User Pool web app client name"
  type        = string
  default     = "reacttd4d788e2_app_clientWeb"
}

variable "native_client_name" {
  description = "Existing Cognito User Pool native app client name"
  type        = string
  default     = "reacttd4d788e2_app_client"
}

variable "auth_role_name" {
  description = "IAM role name for authenticated identities"
  type        = string
  default     = "amplify-reacttodo-main-ed9ee-authRole"
}

variable "unauth_role_name" {
  description = "IAM role name for unauthenticated identities"
  type        = string
  default     = "amplify-reacttodo-main-ed9ee-unauthRole"
}

variable "aws_account_id" {
  description = "AWS account ID used for ARN construction"
  type        = string
  default     = "108609831775"
}

variable "dev_tags" {
  description = "Tags for resources currently running in the dev stack"
  type        = map(string)
  default = {
    "user:Application" = "ReactTodo"
    "user:Stack"       = "dev"
  }
}

variable "todo_api_id" {
  description = "Existing API Gateway REST API ID"
  type        = string
  default     = "3nwhuyy8k3"
}

variable "todo_api_name" {
  description = "REST API name"
  type        = string
  default     = "todoapi"
}

variable "todo_api_stage_name" {
  description = "REST API stage name"
  type        = string
  default     = "dev"
}

variable "todo_api_deployment_id" {
  description = "Current API Gateway deployment ID"
  type        = string
  default     = "u2cc5w"
}

variable "todo_lambda_function_name" {
  description = "Lambda function backing the todo API"
  type        = string
  default     = "reactTodoApi-dev"
}

variable "todo_lambda_role_name" {
  description = "IAM role name used by the todo API Lambda"
  type        = string
  default     = "reacttodoLambdaRole6cc17f6e-dev"
}

variable "todo_table_name" {
  description = "DynamoDB table name for todo items"
  type        = string
  default     = "todos"
}

variable "todo_env_name" {
  description = "ENV variable value passed to the Lambda function"
  type        = string
  default     = "dev"
}

variable "legacy_execute_api_id" {
  description = "Legacy API Gateway ID still present in Lambda invoke policy"
  type        = string
  default     = "6x4vw0ehvd"
}

variable "amplify_app_id" {
  description = "Amplify app ID"
  type        = string
  default     = "d2106vo77pbpbv"
}

variable "amplify_app_name" {
  description = "Amplify app name"
  type        = string
  default     = "React-Todo"
}

variable "amplify_repository" {
  description = "Repository connected to Amplify Hosting"
  type        = string
  default     = "https://github.com/Yuuuki2003/React-Todo"
}

variable "amplify_service_role_name" {
  description = "IAM service role name used by Amplify Hosting"
  type        = string
  default     = "amplify-react-todo-deploy-role"
}

variable "amplify_branch_name" {
  description = "Amplify Hosting branch managed by Terraform"
  type        = string
  default     = "main"
}

variable "amplify_backend_environment_name" {
  description = "Amplify backend environment name"
  type        = string
  default     = "main"
}

variable "amplify_backend_stack_name" {
  description = "CloudFormation backend stack name attached to Amplify"
  type        = string
  default     = "amplify-reacttodo-main-ed9ee"
}

variable "amplify_backend_deployment_artifacts" {
  description = "Deployment artifacts bucket for Amplify backend environment"
  type        = string
  default     = "amplify-reacttodo-main-ed9ee-deployment"
}

variable "amplify_app_environment_variables" {
  description = "Environment variables configured on Amplify app"
  type        = map(string)
  default = {
    "VITE_API_BASE" = "https://3nwhuyy8k3.execute-api.ap-northeast-1.amazonaws.com/dev"
    "_LIVE_UPDATES" = "[{\"name\":\"Amplify CLI\",\"pkg\":\"@aws-amplify/cli\",\"type\":\"npm\",\"version\":\"latest\"}]"
  }
}
