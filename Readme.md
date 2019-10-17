# Meetapp - Backend node

## Passos para instalação

## Preparando código

Baixe o projeto do git

### Definição de veriáveis

Faça uma cópia do arquivo **.evn.example** na raiz do projeto para **.env**. Essa configuração é essencial para a aplicação se comunicar com o banco de dados do projeto, criando as tabelas necessárias, saber como enviar e-mails, e apontar para arquivos estáticos.

No atributo APP_URL preferencialmente utilize o IP ou DNS. Não utilize localhost, pois as aplicações mobile podem ter problemas para acessar os arquivos estáticos.

## Criação do banco de dados

Esse projeto utiliza os bancos de dados postgres e redis. Vamos ver como configurar cada um deles:

### Postgres

No postgres cria um novo database. No Encoding selecione UTF8.
No arquivo **_.env_** inclua as configurações do banco:
