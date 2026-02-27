resource "aws_iam_role" "amplify_deploy" {
  name        = var.amplify_service_role_name
  description = "Allows Amplify Backend Deployment to access AWS resources on your behalf."

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "amplify.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_iam_role_policy_attachment" "amplify_admin_access" {
  role       = aws_iam_role.amplify_deploy.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess-Amplify"
}

resource "aws_amplify_app" "frontend" {
  name                 = var.amplify_app_name
  repository           = var.amplify_repository
  platform             = "WEB"
  iam_service_role_arn = aws_iam_role.amplify_deploy.arn

  environment_variables       = var.amplify_app_environment_variables
  build_spec                  = trimspace(file("${path.module}/amplify-buildspec.yml"))
  enable_branch_auto_build    = false
  enable_branch_auto_deletion = false
  enable_auto_branch_creation = false
  enable_basic_auth           = false

  custom_rule {
    source = "/<*>"
    target = "/index.html"
    status = "404-200"
  }

  cache_config {
    type = "AMPLIFY_MANAGED_NO_COOKIES"
  }

  lifecycle {
    prevent_destroy = true
    ignore_changes  = [build_spec]
  }
}

resource "aws_amplify_backend_environment" "main" {
  app_id               = aws_amplify_app.frontend.id
  environment_name     = var.amplify_backend_environment_name
  stack_name           = var.amplify_backend_stack_name
  deployment_artifacts = var.amplify_backend_deployment_artifacts
}

resource "aws_amplify_branch" "main" {
  app_id      = aws_amplify_app.frontend.id
  branch_name = var.amplify_branch_name

  stage                       = "PRODUCTION"
  display_name                = var.amplify_branch_name
  framework                   = "Web"
  enable_auto_build           = true
  enable_notification         = false
  enable_performance_mode     = false
  enable_pull_request_preview = false
  ttl                         = "5"
  backend_environment_arn     = aws_amplify_backend_environment.main.arn

  environment_variables = {
    AMPLIFY_BACKEND_APP_ID = aws_amplify_app.frontend.id
    USER_BRANCH            = var.amplify_branch_name
  }

  lifecycle {
    prevent_destroy = true
  }
}
