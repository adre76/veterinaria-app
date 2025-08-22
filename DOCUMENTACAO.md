# Sistema de Gestão Veterinária - LiviaVet

## Visão Geral

O Sistema de Gestão Veterinária LiviaVet é uma aplicação web completa desenvolvida em Python Flask com banco de dados PostgreSQL, projetada para gerenciar atendimentos veterinários de forma eficiente e organizada.

## Funcionalidades

### Autenticação
- Login fixo com credenciais predefinidas
- Usuário: `liviavet`
- Senha: `Gorete00`
- Controle de sessão com logout

### Módulos do Sistema

#### 1. Cadastro de Proprietários
- Nome completo
- Telefone de contato
- Endereço completo
- Campo de observações
- Listagem e exclusão de registros

#### 2. Cadastro de Medicamentos
- Nome do medicamento
- Laboratório fabricante
- Apresentação (caixa, ampola, comprimido)
- Valor de compra
- Margem de lucro (%)
- Cálculo automático do valor de venda
- Listagem e exclusão de registros

#### 3. Cadastro de Animais
- Nome do animal
- Raça
- Proprietário (seleção via dropdown)
- Data de nascimento
- Campo de observações
- Listagem e exclusão de registros

#### 4. Registro de Consultas
- Data da consulta (padrão: data atual)
- Animal (seleção via dropdown)
- Proprietário (preenchimento automático)
- Observações da consulta
- Medicamentos e procedimentos com dosagens
- Listagem e exclusão de registros

## Arquitetura Técnica

### Backend
- **Framework**: Flask 3.1.1
- **Banco de Dados**: PostgreSQL 15
- **ORM**: SQLAlchemy
- **Autenticação**: Flask Sessions
- **CORS**: Flask-CORS para integração frontend/backend

### Frontend
- **Interface**: HTML5, CSS3, JavaScript (Vanilla)
- **Design**: Responsivo com gradientes e animações
- **UX**: Single Page Application (SPA) com navegação dinâmica

### Banco de Dados
Estrutura das tabelas:

#### Proprietários
- id (Primary Key)
- nome (VARCHAR 255)
- telefone (VARCHAR 20)
- endereco (TEXT)
- observacao (TEXT)

#### Medicamentos
- id (Primary Key)
- nome (VARCHAR 255)
- laboratorio (VARCHAR 255)
- apresentacao (VARCHAR 50)
- valor_compra (DECIMAL 10,2)
- margem_lucro (DECIMAL 5,2)
- valor_venda (DECIMAL 10,2)

#### Animais
- id (Primary Key)
- nome (VARCHAR 255)
- raca (VARCHAR 255)
- observacao (TEXT)
- data_nascimento (DATE)
- proprietario_id (Foreign Key)

#### Consultas
- id (Primary Key)
- data_consulta (DATE)
- animal_id (Foreign Key)
- observacoes (TEXT)
- medicamentos_procedimentos (TEXT)

## Deployment no Kubernetes

### Pré-requisitos
- Cluster Kubernetes (Rancher RKE2)
- kubectl configurado
- StorageClass `local-path` disponível
- Nginx Ingress Controller

### Componentes do Deployment

#### 1. Namespace
- Nome: `veterinaria`
- Isolamento de recursos

#### 2. PostgreSQL
- **Deployment**: postgres
- **Service**: postgres-service (ClusterIP)
- **PVC**: postgres-pvc (5Gi, local-path)
- **Credenciais**:
  - Database: veterinaria_db
  - User: veterinaria_user
  - Password: veterinaria_password

#### 3. Aplicação Flask
- **Deployment**: veterinaria-app (2 réplicas)
- **Service**: veterinaria-service (ClusterIP)
- **ConfigMap**: veterinaria-config
- **Porta**: 8080

#### 4. Ingress
- **Host**: veterinaria.local
- **Controller**: nginx
- **SSL**: Desabilitado (desenvolvimento)

### Recursos e Limites
```yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "250m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

### Health Checks
- **Liveness Probe**: HTTP GET / (porta 8080)
- **Readiness Probe**: HTTP GET / (porta 8080)

## Instruções de Deploy

### 1. Construir a Imagem Docker
```bash
cd veterinaria_app
docker build -t veterinaria-app:latest .
```

### 2. Fazer Push da Imagem
```bash
# Tag para seu registry
docker tag veterinaria-app:latest seu-registry/veterinaria-app:latest
docker push seu-registry/veterinaria-app:latest
```

### 3. Atualizar o Deployment
Edite o arquivo `kubernetes/veterinaria-deployment.yaml` e altere a imagem:
```yaml
image: seu-registry/veterinaria-app:latest
```

### 4. Executar o Deploy
```bash
cd kubernetes
chmod +x deploy.sh
./deploy.sh
```

### 5. Configurar Acesso
Adicione ao `/etc/hosts`:
```
<IP_DO_CLUSTER> veterinaria.local
```

### 6. Verificar o Deploy
```bash
kubectl get pods -n veterinaria
kubectl get services -n veterinaria
kubectl get ingress -n veterinaria
```

## Acesso à Aplicação

### URL
- **Desenvolvimento**: http://localhost:8080
- **Produção**: http://veterinaria.local

### Credenciais
- **Usuário**: liviavet
- **Senha**: Gorete00

## Estrutura de Arquivos

```
veterinaria_app/
├── backend/
│   └── veterinaria_api/
│       ├── src/
│       │   ├── models/          # Modelos SQLAlchemy
│       │   ├── routes/          # Rotas da API
│       │   ├── static/          # Frontend (HTML, CSS, JS)
│       │   ├── main.py          # Aplicação principal (SQLite)
│       │   └── main_postgres.py # Aplicação principal (PostgreSQL)
│       ├── venv/                # Ambiente virtual Python
│       └── requirements.txt     # Dependências Python
├── kubernetes/
│   ├── namespace.yaml           # Namespace
│   ├── configmap.yaml          # Configurações
│   ├── postgres-pvc.yaml       # PVC PostgreSQL
│   ├── postgres-deployment.yaml # Deployment PostgreSQL
│   ├── postgres-service.yaml   # Service PostgreSQL
│   ├── veterinaria-deployment.yaml # Deployment App
│   ├── veterinaria-service.yaml    # Service App
│   ├── ingress.yaml            # Ingress
│   └── deploy.sh               # Script de deploy
├── Dockerfile                  # Imagem Docker
└── README.md                   # Documentação básica
```

## Monitoramento e Logs

### Verificar Logs
```bash
# Logs da aplicação
kubectl logs -f deployment/veterinaria-app -n veterinaria

# Logs do PostgreSQL
kubectl logs -f deployment/postgres -n veterinaria
```

### Verificar Status
```bash
# Status dos pods
kubectl get pods -n veterinaria -w

# Descrição detalhada
kubectl describe pod <pod-name> -n veterinaria
```

## Backup e Restore

### Backup do Banco
```bash
kubectl exec -it deployment/postgres -n veterinaria -- pg_dump -U veterinaria_user veterinaria_db > backup.sql
```

### Restore do Banco
```bash
kubectl exec -i deployment/postgres -n veterinaria -- psql -U veterinaria_user veterinaria_db < backup.sql
```

## Troubleshooting

### Problemas Comuns

#### 1. Pod não inicia
- Verificar logs: `kubectl logs <pod-name> -n veterinaria`
- Verificar recursos disponíveis
- Verificar se a imagem existe

#### 2. Banco não conecta
- Verificar se o PostgreSQL está rodando
- Verificar credenciais no ConfigMap
- Verificar conectividade de rede

#### 3. Ingress não funciona
- Verificar se o Nginx Ingress está instalado
- Verificar configuração do DNS/hosts
- Verificar se o service está expondo a porta correta

### Comandos Úteis
```bash
# Reiniciar deployment
kubectl rollout restart deployment/veterinaria-app -n veterinaria

# Escalar aplicação
kubectl scale deployment/veterinaria-app --replicas=3 -n veterinaria

# Acessar shell do pod
kubectl exec -it <pod-name> -n veterinaria -- /bin/bash

# Port forward para teste local
kubectl port-forward service/veterinaria-service 8080:80 -n veterinaria
```

## Segurança

### Considerações de Segurança
- Credenciais hardcoded apenas para desenvolvimento
- Em produção, usar Secrets do Kubernetes
- Implementar HTTPS com certificados TLS
- Configurar Network Policies
- Implementar RBAC adequado

### Melhorias Futuras
- Autenticação com JWT
- Criptografia de senhas
- Auditoria de ações
- Backup automático
- Monitoramento com Prometheus/Grafana

## Suporte

Para suporte técnico ou dúvidas sobre o sistema, consulte:
- Documentação do código nos arquivos fonte
- Logs da aplicação
- Esta documentação

---

**Sistema desenvolvido para gestão veterinária com foco em simplicidade e eficiência.**

