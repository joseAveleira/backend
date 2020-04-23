# Backend

## Configurando o servidor

### Requisitos

- Servidor Linux na nuvem (AWS, DigitalOcean, Google Cloud)
- Subdomínios apontando para o servidor:
    - `api.dominio.com`
    - `broker.dominio.com`
    - `server.dominio.com`

### Passo a passo

1. Conectar ao servidor via SSH:

```bash
ssh root@server.dominio.com
```

2. Instalar o `docker`:

```bash
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu  $(lsb_release -cs)  stable" 

apt update 

apt install docker-ce -y
```

3. Instalar o `docker-compose`:

```bash
curl -L "https://github.com/docker/compose/releases/download/1.25.5/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

chmod +x /usr/local/bin/docker-compose

ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
```


4. Criar um arquivo `docker-compose.yml` na home do usuário:

```bash
nano docker-compose.yml
```

Colar o seguinte conteúdo (alterar as credenciais):

```
version: '3.7'
services:
  backend:
    image: scoreboardtcc/backend
    restart: always
    depends_on:
      - database
      - redis
    environment:
      - NODE_ENV=production
      - DB_HOST=database
      - DB_NAME=<NOME_BANCO>
      - DB_USER=<USUARIO_BANCO>
      - DB_PASSWORD=<SENHA_BANCO>
    ports:
      - 8080:8080
      - 8081:8081
      - 1883:1883

  redis:
    image: redis:alpine
    volumes:
      - redisdata:/bitnami/redis/data
    environment:
      - ALLOW_EMPTY_PASSWORD=yes
    ports:
      - 6379:6379

  database:
    image: postgres
    restart: always
    environment:
      - POSTGRES_DB=<NOME_BANCO>
      - POSTGRES_USER=<USUARIO_BANCO>
      - POSTGRES_PASSWORD=<SENHA_BANCO>
    ports:
      - 5432:5432
    volumes:
      - pgdata:/var/lib/postgresql/data
  
volumes:
  pgdata:
  redisdata:
```

5. Instalar e habilitar o NGINX na inicialização:

```bash
apt install nginx -y
```

6. Criar um arquivo em `/etc/nginx/sites-available/` com o nome `reverse-proxy.conf`:

```bash
nano /etc/nginx/sites-available/reverse-proxy.conf
```

Colar o seguinte conteúdo (alterar o domínio):

```
server {
    server_name api.dominio.tech;

    location / {
        proxy_pass http://127.0.0.1:8080;
    }

    listen 80 ;
}

server {
    server_name broker.dominio.tech;

    location /mqtt {
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
	    proxy_set_header Host $host;
        proxy_pass http://127.0.0.1:8081/;
    }

    listen 80;
}

```

7. Criar link para habilitar a configuração:

```bash
ln -s /etc/nginx/sites-available/reverse-proxy.conf /etc/nginx/sites-enabled/reverse-proxy.conf
```

8. Recarregar o NGINX:

```bash
systemctl reload nginx
```

9. Instalar o `certbot`.

```bash
add-apt-repository ppa:certbot/certbot
apt update
apt install python-certbot-nginx -y
```

10. Obter certificados SSL (alterar domínio)

```bash
certbot --nginx --email <EMAIL> --no-eff-email --agree-tos -d api.dominio.tech -d broker.dominio.tech --redirect
```

11. Executar os containers:

```bash
docker-compose up -d
```

12. No computador local, clonar o repositório e instalar dependências:

```bash
git clone https://github.com/scoreboard-tcc/backend.git

cd backend

yarn
```

13. Navegar para a pasta `scripts/production`

```bash
cd scripts/production
```

14. Renomear o arquivo .env.example para .env e atualizar as credenciais:

```bash
mv .env.example .env
```

15. Executar scripts de migração e seed:

```bash
chmod a+x *.sh

./migrate.sh

./seed.sh
```