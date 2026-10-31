resource "google_project" "home_finance" {
  name            = var.project_name
  project_id      = var.project_id
  billing_account = var.billing_account

  # Personal Google account: no organization and no folder.
  # org_id and folder_id are omitted on purpose.

  auto_create_network = false
}

resource "google_project_service" "sheets" {
  project = google_project.home_finance.project_id
  service = "sheets.googleapis.com"

  disable_on_destroy = false
}

resource "google_project_service" "iam" {
  project = google_project.home_finance.project_id
  service = "iam.googleapis.com"

  disable_on_destroy = false
}

resource "google_service_account" "sheets" {
  project      = google_project.home_finance.project_id
  account_id   = "home-finance-sheets"
  display_name = "home-finance-sheets"
  description  = "Server-side access to the household Google Sheet."

  depends_on = [google_project_service.iam]
}

# The private key is base64 JSON. Terraform stores it in local state.
# See infra/README.md before applying.
resource "google_service_account_key" "sheets" {
  service_account_id = google_service_account.sheets.name
}

# Keep until the next apply. destroy = false drops the old project resource
# from state without deleting the live project.
removed {
  from = vercel_project.home_finance

  lifecycle {
    destroy = false
  }
}

data "vercel_project" "home_finance" {
  name = var.vercel_project_name
}

locals {
  vercel_project_id        = data.vercel_project.home_finance.id
  service_account_key_json = base64decode(google_service_account_key.sheets.private_key)
}

resource "vercel_project_environment_variable" "service_account_json" {
  project_id = local.vercel_project_id
  key        = "GOOGLE_SERVICE_ACCOUNT_JSON"
  value      = local.service_account_key_json
  target     = ["production", "preview", "development"]
  sensitive  = true
  comment    = "Decoded JSON key for home-finance-sheets. Also stored in Terraform state."
}

resource "vercel_project_environment_variable" "sheet_id" {
  project_id = local.vercel_project_id
  key        = "GOOGLE_SHEET_ID"
  value      = var.google_sheet_id
  target     = ["production", "preview", "development"]
  sensitive  = false
  comment    = "Household spreadsheet id."
}
