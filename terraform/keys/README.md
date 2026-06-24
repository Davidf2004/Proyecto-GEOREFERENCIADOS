# Claves SSH para la VM de Azure

Terraform espera estos archivos en esta carpeta:

- `petradar_key` (privada, no commitear)
- `petradar_key.pub` (publica, usada por compute.tf)

Generar un nuevo par:

```bash
ssh-keygen -t ed25519 -f terraform/keys/petradar_key -C petradar-deploy
```

Conectar a la VM tras el despliegue:

```bash
ssh -i terraform/keys/petradar_key adminuser@<PUBLIC_IP>
```
