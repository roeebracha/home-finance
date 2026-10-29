variable "project_id" {
  description = "Globally unique GCP project id. No organization parent; this is a personal account."
  type        = string

  validation {
    condition     = can(regex("^[a-z][a-z0-9-]{4,28}[a-z0-9]$", var.project_id))
    error_message = "project_id must be 6-30 characters: start with a letter, then lowercase letters, digits, or hyphens."
  }
}

variable "project_name" {
  description = "Display name of the GCP project."
  type        = string
  default     = "home-finance"
}

variable "billing_account" {
  description = "Billing account id (XXXXXX-XXXXXX-XXXXXX). Required so the Sheets API can be enabled."
  type        = string

  validation {
    condition     = can(regex("^[A-Z0-9]{6}-[A-Z0-9]{6}-[A-Z0-9]{6}$", var.billing_account))
    error_message = "billing_account must look like XXXXXX-XXXXXX-XXXXXX."
  }
}

variable "google_sheet_id" {
  description = "Spreadsheet id from the sheet URL, written to Vercel as GOOGLE_SHEET_ID."
  type        = string

  validation {
    condition     = length(var.google_sheet_id) > 10
    error_message = "google_sheet_id looks too short."
  }
}

variable "vercel_project_name" {
  description = "Vercel project name. Created, or read, depending on vercel_project_exists."
  type        = string
  default     = "home-finance"
}

variable "vercel_project_exists" {
  description = "When true, read the Vercel project with a data source instead of creating it."
  type        = bool
  default     = false
}

variable "vercel_team_id" {
  description = "Vercel team slug or id. Leave null for a personal account."
  type        = string
  default     = null
}
