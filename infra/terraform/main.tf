locals {
  cognito_provider_name = "cognito-idp.${var.aws_region}.amazonaws.com/${aws_cognito_user_pool.main.id}"
}

resource "aws_cognito_user_pool" "main" {
  name                       = var.user_pool_name
  auto_verified_attributes   = ["email"]
  email_verification_subject = "Your verification code"
  email_verification_message = "Your verification code is {####}"
  mfa_configuration          = "OFF"
  username_attributes        = ["email"]

  password_policy {
    minimum_length                   = 8
    require_lowercase                = false
    require_numbers                  = false
    require_symbols                  = false
    require_uppercase                = false
    temporary_password_validity_days = 7
  }

  schema {
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    name                     = "email"
    required                 = true

    string_attribute_constraints {
      min_length = 0
      max_length = 2048
    }
  }

  user_attribute_update_settings {
    attributes_require_verification_before_update = ["email"]
  }

  username_configuration {
    case_sensitive = false
  }

  tags = var.default_tags

  lifecycle {
    prevent_destroy = true
    ignore_changes  = [schema]
  }
}

resource "aws_cognito_user_pool_client" "web" {
  name                   = var.web_client_name
  user_pool_id           = aws_cognito_user_pool.main.id
  refresh_token_validity = 30

  lifecycle {
    prevent_destroy = true
    ignore_changes  = [token_validity_units]
  }
}

resource "aws_cognito_user_pool_client" "native" {
  name                   = var.native_client_name
  user_pool_id           = aws_cognito_user_pool.main.id
  refresh_token_validity = 30

  lifecycle {
    prevent_destroy = true
    ignore_changes  = [token_validity_units]
  }
}

resource "aws_cognito_identity_pool" "main" {
  identity_pool_name               = var.identity_pool_name
  allow_unauthenticated_identities = false

  cognito_identity_providers {
    client_id     = aws_cognito_user_pool_client.native.id
    provider_name = local.cognito_provider_name
  }

  cognito_identity_providers {
    client_id     = aws_cognito_user_pool_client.web.id
    provider_name = local.cognito_provider_name
  }

  tags = var.default_tags

  lifecycle {
    prevent_destroy = true
  }
}

data "aws_iam_policy_document" "auth_assume" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = ["cognito-identity.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "cognito-identity.amazonaws.com:aud"
      values   = [aws_cognito_identity_pool.main.id]
    }

    condition {
      test     = "ForAnyValue:StringLike"
      variable = "cognito-identity.amazonaws.com:amr"
      values   = ["authenticated"]
    }
  }
}

data "aws_iam_policy_document" "unauth_assume" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = ["cognito-identity.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "cognito-identity.amazonaws.com:aud"
      values   = [aws_cognito_identity_pool.main.id]
    }

    condition {
      test     = "ForAnyValue:StringLike"
      variable = "cognito-identity.amazonaws.com:amr"
      values   = ["unauthenticated"]
    }
  }
}

resource "aws_iam_role" "auth" {
  name               = var.auth_role_name
  assume_role_policy = data.aws_iam_policy_document.auth_assume.json
  tags               = var.default_tags

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_iam_role" "unauth" {
  name               = var.unauth_role_name
  assume_role_policy = data.aws_iam_policy_document.unauth_assume.json
  tags               = var.default_tags

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_cognito_identity_pool_roles_attachment" "main" {
  identity_pool_id = aws_cognito_identity_pool.main.id

  roles = {
    authenticated   = aws_iam_role.auth.arn
    unauthenticated = aws_iam_role.unauth.arn
  }
}
