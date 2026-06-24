variable "ENVIRONMENT" {
  type        = string
  description = "Nombre del ambiente (dev, staging, prod)"
}

variable "LOCATION" {
  type        = string
  description = "Region de Azure (ej. eastus)"
}

variable "VM_SIZE" {
  type        = string
  description = "Tamaño de la VM Linux"
}
