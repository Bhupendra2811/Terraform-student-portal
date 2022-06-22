resource "aws_codepipeline" "codepipeline" {
  name     = "sp-pipeline"
  role_arn = aws_iam_role.codepipeline_role.arn

  artifact_store {
    location = aws_s3_bucket.codepipeline_bucket.bucket
    type     = "S3"

  }

  stage {
    name = "Source"

    action {
      name             = "Source"
      category         = "Source"
      owner            = "AWS"
      provider         = "CodeStarSourceConnection"
      version          = "1"
      output_artifacts = ["source_output"]

      configuration = {
        ConnectionArn    = aws_codestarconnections_connection.example.arn
        FullRepositoryId = "Bhupendra2811/student-portal"
        BranchName       = "main"
      }
    }
  }
stage {
    name = "Build"

    action {
      name             = "Build"
      category         = "Build"
      owner            = "AWS"
      provider         = "CodeBuild"
      input_artifacts  = ["source_output"]
      output_artifacts = ["build_output"]
      version          = "1"

      configuration = {
        "EnvironmentVariables" = jsonencode(
          [
            {
            "name" : "REACT_APP_USERPOOLID",
            "value" : var.userpool_id
          },
          {
            "name" : "REACT_APP_CLIENTID",
            "value" : var.userpool_client_id
          },
          {
            "name" : "REACT_APP_API_ENDPOINT",
            "value" : var.api_endpoint
          },
          {
            "name" : "REACT_APP_REGION",
            "value" : var.aws_region
          },
          {
            "name" : "REACT_APP_PRODUCTION_ENDPOINT",
            "value" : var.production_endpoint
          },
          ]
        )
        ProjectName = "student-portal"
      }
    }
  }

  stage {
    name = "Deploy"

    action {
      name            = "Deploy"
      category        = "Deploy"
      owner           = "AWS"
      provider        = "S3"
      input_artifacts = ["build_output"]
      version         = "1"

      configuration = {
        BucketName: "studentportal-frontend-bucket"
        Extract: "true"
      }
    }
  }
}