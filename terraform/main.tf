resource "azurerm_resource_group" "petradar_rg" {
  name     = "612-petradar-rg-${var.ENVIRONMENT}"
  location = var.LOCATION
}

resource "azurerm_application_insights" "petradar_ai" {
  name                = "612-petradar-api-telemetry-${var.ENVIRONMENT}"
  location            = var.LOCATION
  resource_group_name = azurerm_resource_group.petradar_rg.name
  application_type    = "web"
}
