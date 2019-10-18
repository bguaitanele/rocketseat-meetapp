# Meetapp - Backend node

## Pré-requisitos

Ter instalado:

- Node
- Yarn
- Postgres
- Redis

## Passos para instalação

### Preparando código

- Baixe o projeto do git
- Na raiz do projeto rode:

```
yarn
```

### Definição de variáveis de ambiente

Faça uma cópia do arquivo **.evn.example** na raiz do projeto para **.env**. Essa configuração é essencial para a aplicação se comunicar com o banco de dados do projeto, criando as tabelas necessárias, saber como enviar e-mails, e apontar para arquivos estáticos.

No atributo APP_URL preferencialmente utilize o IP ou DNS. Não utilize localhost, pois as aplicações mobile podem ter problemas para acessar os arquivos estáticos.

## Criação do banco de dados

Esse projeto utiliza os bancos de dados postgres e redis. Vamos ver como configurar cada um deles:

### Postgres

No postgres, crie um novo database.
No Encoding selecione UTF8.
No arquivo **_.env_** inclua as configurações do banco.

Rode na raiz do projeto:

```
yarn sequelize db:migrate
```

Esse procedimento criará as tabelas necessárias para a aplicação

### Redis

Basta configurar no **_.env_** o host e porta onde o redis está rodando em sua máquina.

## Rodando o projeto

Esse projeto roda dois serviços. Um com os serviços REST, e outro responsável pelo controle de fila assíncrona. Para rodar cada um deles:

Aplicação

```
yarn dev
```

Fila

```
yarn queue
```
