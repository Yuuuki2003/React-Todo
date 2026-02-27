locals {
  api_gateway_swagger_body = file("${path.module}/apigateway/todoapi-swagger.json")
  lambda_zip_path          = "${path.module}/../../lambda-deploy/lambda.zip"

  request_schema = jsonencode({
    type = "object"
    required = [
      "request"
    ]
    properties = {
      request = {
        type = "string"
      }
    }
    title = "Request Schema"
  })

  response_schema = jsonencode({
    type = "object"
    required = [
      "response"
    ]
    properties = {
      response = {
        type = "string"
      }
    }
    title = "Response Schema"
  })
}

resource "aws_dynamodb_table" "todos" {
  name         = var.todo_table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "user"
  range_key    = "id"

  attribute {
    name = "user"
    type = "S"
  }

  attribute {
    name = "id"
    type = "S"
  }

  global_secondary_index {
    name            = "user-index"
    hash_key        = "user"
    range_key       = "id"
    projection_type = "ALL"
  }

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_iam_role" "todo_lambda" {
  name = var.todo_lambda_role_name

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = var.dev_tags

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_iam_role_policy" "todo_lambda_execution" {
  name = "lambda-execution-policy"
  role = aws_iam_role.todo_lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:${var.aws_region}:${var.aws_account_id}:log-group:/aws/lambda/${var.todo_lambda_function_name}:log-stream:*"
      }
    ]
  })
}

resource "aws_iam_role_policy" "todo_lambda_dynamodb" {
  name = "TodosTableAccessPolicy"
  role = aws_iam_role.todo_lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query"
        ]
        Resource = [
          aws_dynamodb_table.todos.arn,
          "${aws_dynamodb_table.todos.arn}/index/*"
        ]
      }
    ]
  })
}

resource "aws_cloudwatch_log_group" "todo_lambda" {
  name = "/aws/lambda/${var.todo_lambda_function_name}"

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_lambda_function" "todo_api" {
  function_name = var.todo_lambda_function_name
  role          = aws_iam_role.todo_lambda.arn
  handler       = "index.handler"
  runtime       = "nodejs22.x"
  timeout       = 25
  memory_size   = 128
  architectures = ["x86_64"]

  filename         = local.lambda_zip_path
  source_code_hash = filebase64sha256(local.lambda_zip_path)

  environment {
    variables = {
      ENV    = var.todo_env_name
      REGION = var.aws_region
    }
  }

  tags = var.dev_tags

  depends_on = [
    aws_cloudwatch_log_group.todo_lambda,
    aws_iam_role_policy.todo_lambda_execution,
    aws_iam_role_policy.todo_lambda_dynamodb
  ]

  lifecycle {
    prevent_destroy = true
    ignore_changes = [
      filename,
      source_code_hash
    ]
  }
}

resource "aws_api_gateway_rest_api" "todo_api" {
  name = var.todo_api_name
  body = local.api_gateway_swagger_body

  endpoint_configuration {
    types = ["EDGE"]
  }

  tags = var.dev_tags
}

resource "aws_api_gateway_model" "request_schema" {
  rest_api_id  = aws_api_gateway_rest_api.todo_api.id
  name         = "RequestSchema"
  content_type = "application/json"
  schema       = local.request_schema
}

resource "aws_api_gateway_model" "response_schema" {
  rest_api_id  = aws_api_gateway_rest_api.todo_api.id
  name         = "ResponseSchema"
  content_type = "application/json"
  schema       = local.response_schema
}

resource "aws_api_gateway_deployment" "todo_api" {
  rest_api_id = aws_api_gateway_rest_api.todo_api.id

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_stage" "todo_api_dev" {
  rest_api_id   = aws_api_gateway_rest_api.todo_api.id
  stage_name    = var.todo_api_stage_name
  deployment_id = aws_api_gateway_deployment.todo_api.id
}

resource "aws_lambda_permission" "todo_api_all_methods" {
  statement_id  = "amplify-reacttodo-dev-ea561-apitodoapi-BW440HZUCG-functionreactTodoApiPermissiontodoapi-Xu9Yh6Kg6oo0"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.todo_api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "arn:aws:execute-api:${var.aws_region}:${var.aws_account_id}:${aws_api_gateway_rest_api.todo_api.id}/*/*/*"
}

resource "aws_lambda_permission" "todo_api_get_todos" {
  statement_id  = "efb35aee-55e1-5413-9dbd-67d494070b10"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.todo_api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "arn:aws:execute-api:${var.aws_region}:${var.aws_account_id}:${aws_api_gateway_rest_api.todo_api.id}/*/GET/todos"
}

resource "aws_lambda_permission" "todo_api_post_todos" {
  statement_id  = "e5299934-ecdc-5a44-90b3-e9a38bf68a18"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.todo_api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "arn:aws:execute-api:${var.aws_region}:${var.aws_account_id}:${aws_api_gateway_rest_api.todo_api.id}/*/POST/todos"
}

resource "aws_lambda_permission" "todo_api_put_todos" {
  statement_id  = "627b9a02-cf47-5c39-a5dd-5f5883417dc0"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.todo_api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "arn:aws:execute-api:${var.aws_region}:${var.aws_account_id}:${aws_api_gateway_rest_api.todo_api.id}/*/PUT/todos"
}

resource "aws_lambda_permission" "todo_api_delete_todos" {
  statement_id  = "85fef8f4-71fb-5cfb-b317-0bc9400cfba1"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.todo_api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "arn:aws:execute-api:${var.aws_region}:${var.aws_account_id}:${aws_api_gateway_rest_api.todo_api.id}/*/DELETE/todos"
}

resource "aws_lambda_permission" "todo_api_legacy_get_root" {
  statement_id  = "37c4c264-e14d-5b5f-abb3-6e5946287e47"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.todo_api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "arn:aws:execute-api:${var.aws_region}:${var.aws_account_id}:${var.legacy_execute_api_id}/*/GET/"
}

resource "aws_lambda_permission" "todo_api_put_todos_id" {
  statement_id  = "24838977-2c50-589e-a857-434abf3839d4"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.todo_api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "arn:aws:execute-api:${var.aws_region}:${var.aws_account_id}:${aws_api_gateway_rest_api.todo_api.id}/*/PUT/todos/*"
}

resource "aws_lambda_permission" "todo_api_delete_todos_id" {
  statement_id  = "c4883bac-a6dd-5b78-80d3-db270b94bb85"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.todo_api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "arn:aws:execute-api:${var.aws_region}:${var.aws_account_id}:${aws_api_gateway_rest_api.todo_api.id}/*/DELETE/todos/*"
}
