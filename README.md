# Sistema de Gestão Veterinária

Este projeto consiste em um sistema de gestão veterinária com frontend em Flask e backend utilizando PostgreSQL. O sistema permite o cadastro de proprietários, medicamentos, animais e o registro de consultas.

## Estrutura do Projeto

- `backend/`: Contém o código da aplicação Flask (backend).
- `frontend/`: Contém os templates HTML e arquivos estáticos (CSS, JS) do frontend.
- `kubernetes/`: Contém os arquivos YAML para deployment no Kubernetes.

## Funcionalidades

- **Autenticação**: Login fixo para acesso à tela de administração.
- **Cadastro de Proprietário**: Nome, telefone, endereço, observação.
- **Cadastro de Medicamentos**: Nome, laboratório, apresentação, valor de compra, margem de lucro, valor de venda.
- **Cadastro de Animais**: Nome, raça, observação, proprietário (dropdown), data de nascimento.
- **Registro de Consulta**: Data, animal (dropdown), proprietário (auto-preenchido), texto livre, lançamento de medicamentos e procedimentos com quantidade e dosagem.

## Tecnologias Utilizadas

- **Backend**: Python, Flask, Gunicorn, SQLAlchemy, Psycopg2
- **Banco de Dados**: PostgreSQL
- **Frontend**: HTML, CSS, JavaScript (básico)
- **Orquestração**: Kubernetes, Rancher RKE2

## Deployment

Os arquivos YAML para deployment no Kubernetes estão localizados na pasta `kubernetes/` e são configurados para utilizar `local-path` como StorageClass para persistência de dados.

