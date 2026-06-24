resource "azurerm_linux_virtual_machine" "petradar_vm" {
  name                = "612-vm-petradar-api-${var.ENVIRONMENT}"
  resource_group_name = azurerm_resource_group.petradar_rg.name
  location            = var.LOCATION
  size                = var.VM_SIZE
  admin_username      = "adminuser"
  custom_data         = filebase64("./scripts/docker-install.tpl")
  network_interface_ids = [
    azurerm_network_interface.petradar_nic.id,
  ]

  admin_ssh_key {
    username   = "adminuser"
    public_key = file("./keys/petradar_key.pub")
  }

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts-gen2"
    version   = "latest"
  }
}
