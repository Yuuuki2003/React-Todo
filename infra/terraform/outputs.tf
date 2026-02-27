output "user_pool_id" {
  value = aws_cognito_user_pool.main.id
}

output "user_pool_web_client_id" {
  value = aws_cognito_user_pool_client.web.id
}

output "user_pool_native_client_id" {
  value = aws_cognito_user_pool_client.native.id
}

output "identity_pool_id" {
  value = aws_cognito_identity_pool.main.id
}

output "auth_role_arn" {
  value = aws_iam_role.auth.arn
}

output "unauth_role_arn" {
  value = aws_iam_role.unauth.arn
}

output "frontend_amplify_configuration" {
  value = {
    aws_project_region           = var.aws_region
    aws_cognito_identity_pool_id = aws_cognito_identity_pool.main.id
    aws_cognito_region           = var.aws_region
    aws_user_pools_id            = aws_cognito_user_pool.main.id
    aws_user_pools_web_client_id = aws_cognito_user_pool_client.web.id
  }
}

output "todo_api_base_url" {
  value = "https://${aws_api_gateway_rest_api.todo_api.id}.execute-api.${var.aws_region}.amazonaws.com/${aws_api_gateway_stage.todo_api_dev.stage_name}"
}

output "todo_lambda_function_name" {
  value = aws_lambda_function.todo_api.function_name
}

output "todo_dynamodb_table_name" {
  value = aws_dynamodb_table.todos.name
}

output "amplify_app_id" {
  value = aws_amplify_app.frontend.id
}

output "amplify_default_domain" {
  value = aws_amplify_app.frontend.default_domain
}
