terraform {
  required_version = ">= 1.9.0"

  # State stays in infra/terraform.tfstate. There is no remote backend.
  backend "local" {
    path = "terraform.tfstate"
  }

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 8.7"
    }
    vercel = {
      source  = "vercel/vercel"
      version = "~> 5.22"
    }
  }
}

provider "google" {
  # Credentials come from `gcloud auth application-default login`.
  # No project is set here: this config creates the project.
}

provider "vercel" {
  # Token comes from the VERCEL_API_TOKEN environment variable.
  # Null means a personal account, not a team.
  team = var.vercel_team_id
}
