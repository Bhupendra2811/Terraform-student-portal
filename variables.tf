# Input variable definitions

variable "aws_region" {
  description = "AWS region for all resources."
  type        = string
  default     = "ap-south-1"
}

variable "env" {
  description = "Depolyment environment"
  default     = "dev"
}

variable "repository_branch" {
  description = "Repository branch to connect to"
  default     = "develop"
}

variable "repository_owner" {
  description = "GitHub repository owner"
  default     = "stojce"
}

variable "repository_name" {
  description = "GitHub repository name"
  default     = "static-web-example"
}

variable "static_web_bucket_name" {
  description = "S3 Bucket to deploy to"
  default     = "static-web-example-bucket"
}

variable "artifacts_bucket_name" {
  description = "S3 Bucket for storing artifacts"
  default     = "artifacts-bucket"
}
variable "production_endpoint" {
    description = "value"
    default = "xxxx"

}


variable "api_endpoint" {
    description = "value"
    default = "xxxx"

}


variable "userpool_client_id" {
    description = "value"
    default = "xxxx"

}

variable "userpool_id" {
    description = "value"
    default = "xxxx"

}