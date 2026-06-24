output "app_insights_connection_string" {
  value     = azurerm_application_insights.petradar_ai.connection_string
  sensitive = true
}

output "public_ip" {
  value = azurerm_linux_virtual_machine.petradar_vm.public_ip_address
}

output "resource_group_name" {
  value = azurerm_resource_group.petradar_rg.name
}
