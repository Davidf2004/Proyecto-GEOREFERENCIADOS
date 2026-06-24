resource "azurerm_resource_group" "petradar_rg" {
  name     = "davidpetsradar-rg-${var.ENVIRONMENT}"
  location = var.LOCATION
}

resource "azurerm_application_insights" "petradar_ai" {
  name                = "davidpetsradar-telemetry-${var.ENVIRONMENT}"
  location            = var.LOCATION
  resource_group_name = azurerm_resource_group.petradar_rg.name
  application_type    = "web"
}
