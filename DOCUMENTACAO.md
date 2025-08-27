"""
# Documento de Instruções de Deploy

Este documento fornece instruções detalhadas para o deploy do sistema de gestão veterinária, tanto localmente com Docker quanto em um cluster Kubernetes (Rancher RKE2).

## Estrutura do Projeto

```
veterinaria_app/
├── backend/
│   └── veterinaria_api/
│       ├── src/
│       │   ├── models/          # Modelos SQLAlchemy
│       │   ├── routes/          # Rotas da API
│       │   ├── static/          # Conteúdo estático do frontend (HTML, CSS, JS)
│       │   ├── main.py          # Aplicação principal (SQLite)
│       │   └── main_postgres.py # Aplicação principal (PostgreSQL)
│       ├── venv/                # Ambiente virtual Python
│       └── requirements.txt     # Dependências Python
├── kubernetes/
│   ├── namespace.yaml           # Namespace
│   ├── configmap.yaml          # Configurações
│   ├── postgres-pvc.yaml       # PVC PostgreSQL
│   ├── postgres-deployment.yaml # Deployment PostgreSQL
│   ├── postgres-service.yaml    # Service PostgreSQL
│   ├── veterinaria-deployment.yaml # Deployment App
│   ├── veterinaria- Linter.yaml    # Service App
│   ├── ingress.yaml            # Ingress
│   └── deploy.sh               # Script de deploy
├── Dockerfile                  # Imagem Docker
└── README.md                   # Documentação básica
```

## Instruções de Deploy Detalhadas

### Cenário 1: Deploy Local com Docker

Se você deseja testar a aplicação localmente usando Docker, siga os passos abaixo. Certifique-se de estar no diretório raiz do projeto (`/home/ubuntu/veterinaria_app`).

#### 1. Construir a Imagem Docker

Navegue até o diretório raiz do projeto e execute o comando para construir a imagem Docker. Este comando lerá o `Dockerfile` e criará uma imagem chamada `veterinaria-app` com a tag `latest`.

```bash
docker build -t veterinaria-app:latest .
```

#### 2. Rodar o Contêiner PostgreSQL

Agora, inicie o contêiner do PostgreSQL. Este contêiner será o banco de dados para a sua aplicação Flask.

```bash
$ docker run -d --name veterinaria-postgres \
  -e POSTGRES_DB=veterinaria_db \
  -e POSTGRES_USER=veterinaria_user \
  -e POSTGRES_PASSWORD=veterinaria_password \
  -p 5432:5432 \
  postgres:15
```

#### 3. Rodar o Contêiner da Aplicação Flask

Em seguida, inicie o contêiner da sua aplicação Flask, conectando-o à rede do PostgreSQL. A aplicação Flask se conectará ao banco de dados usando o nome do serviço `postgres-service` (que será resolvido para o IP do contêiner PostgreSQL dentro da rede Docker).

```bash
$ docker run -d --name veterinaria-flask \
  --link veterinaria-postgres:postgres-service \
  -e DATABASE_URL="postgresql://veterinaria_user:veterinaria_password@postgres-service:5432/veterinaria_db" \
  -p 8080:8080 \
  veterinaria-app:latest
```

#### 4. Acessar a Aplicação

Após os contêineres estarem rodando, você pode acessar a aplicação no seu navegador:

```
http://localhost:8080
```

**Credenciais de Login:**
- **Usuário**: `liviavet`
- **Senha**: `Gorete00`

### Cenário 2: Deploy no Kubernetes (Rancher RKE2)

Para o deploy no Kubernetes, você precisará de um cluster Rancher RKE2 configurado e o `kubectl` apontando para ele. Certifique-se de que o `StorageClass` `local-path` esteja disponível no seu cluster.

#### 1. Fazer Push da Imagem Docker para um Registry

Seu cluster Kubernetes precisará acessar a imagem Docker. Você deve fazer o push da imagem construída localmente para um registry (por exemplo, Docker Hub, Google Container Registry, etc.).

```bash
docker tag veterinaria-app:latest seu-registry/veterinaria-app:latest
docker push seu-registry/veterinaria-app:latest
```

**Importante**: Edite o arquivo `kubernetes/veterinaria-deployment.yaml` e altere a linha `image: veterinaria-app:latest` para `image: seu-registry/veterinaria-app:latest` com o caminho completo da sua imagem no registry.

#### 2. Executar o Script de Deploy

Navegue até o diretório `kubernetes` dentro do seu projeto e execute o script de deploy. Este script aplicará todos os arquivos YAML necessários para criar o namespace, o banco de dados PostgreSQL, a aplicação Flask e o Ingress.

```bash
./deploy.sh
```

#### 3. Configurar Acesso (Ingress)

Para acessar a aplicação de fora do cluster, você precisará configurar o Ingress. O arquivo `ingress.yaml` já está configurado para usar o host `veterinaria.local`. Você precisará adicionar uma entrada no seu arquivo `/etc/hosts` (no seu computador local, não no servidor do Kubernetes) que aponte `veterinaria.local` para o IP do seu Ingress Controller (ou o IPs dos nós do seu cluster, se você estiver usando um LoadBalancer ou NodePort para o Ingress Controller).

Exemplo de entrada no `/etc/hosts`:

```
<IP_DO_SEU_CLUSTER> veterinaria.local
```

Para encontrar o IP do seu cluster, você pode usar:
```bash
kubectl get nodes -l topology.kubernetes.io/zone=control-plane-zone -o wide
```
Ou, se você tiver um serviço Ingress com um IP externo:
```bash
kubectl get services -n ingress-nginx
```

#### 4. Verificar o Status do Deploy

Você pode verificar o status dos seus pods, serviços e ingress com os seguintes comandos:

```bash
kubectl get pods -n veterinaria
kubectl get services -n veterinaria
kubectl get ingress -n veterinaria
```

#### 5. Acessar a Aplicação no Modo Kubernetes

Após a configuração do `/etc/hosts` e o deploy bem-sucedido, o sistema estará acessível no seu navegador:

```
http://ubuntu-master.com
```

**Credenciais de Login (as mesmas do deploy local):**
- **Usuário**: `liviavet`
- **Senha**: `Gorete00`

"""



