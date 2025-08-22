#!/bin/bash

# Script para deploy do Sistema Veterinária no Kubernetes (Rancher RKE2)

echo "=== Deploy do Sistema Veterinária ==="

# Aplicar namespace
echo "Criando namespace..."
kubectl apply -f namespace.yaml

# Aplicar ConfigMap
echo "Aplicando ConfigMap..."
kubectl apply -f configmap.yaml

# Aplicar PVC para PostgreSQL
echo "Criando PVC para PostgreSQL..."
kubectl apply -f postgres-pvc.yaml

# Deploy PostgreSQL
echo "Fazendo deploy do PostgreSQL..."
kubectl apply -f postgres-deployment.yaml
kubectl apply -f postgres-service.yaml

# Aguardar PostgreSQL estar pronto
echo "Aguardando PostgreSQL estar pronto..."
kubectl wait --for=condition=ready pod -l app=postgres -n veterinaria --timeout=300s

# Deploy da aplicação
echo "Fazendo deploy da aplicação..."
kubectl apply -f veterinaria-deployment.yaml
kubectl apply -f veterinaria-service.yaml

# Aplicar Ingress
echo "Aplicando Ingress..."
kubectl apply -f ingress.yaml

# Aguardar aplicação estar pronta
echo "Aguardando aplicação estar pronta..."
kubectl wait --for=condition=ready pod -l app=veterinaria-app -n veterinaria --timeout=300s

echo "=== Deploy concluído! ==="
echo ""
echo "Para acessar a aplicação:"
echo "1. Adicione 'veterinaria.local' ao seu /etc/hosts apontando para o IP do cluster"
echo "2. Acesse http://veterinaria.local"
echo ""
echo "Credenciais de login:"
echo "Usuário: liviavet"
echo "Senha: Gorete00"
echo ""
echo "Para verificar o status:"
echo "kubectl get pods -n veterinaria"
echo "kubectl get services -n veterinaria"
echo "kubectl get ingress -n veterinaria"

