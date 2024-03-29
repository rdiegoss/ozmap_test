## Pré-requisitos:

- Node 20
- Docker versão 20.10.14
- Docker compose versão v2.23.0

# Subindo o projeto:

1. Clone o repositório para sua máquina utilizando o comando:

   `git clone git@github.com:rdiegoss/ozmap_test.git`

2. Entre na pasta do repositório e instale as dependências utilizando o comando:

   `npm install`

4. Crie um arquivo **.env** contendo as mesmas variáveis de ambiente presentes no arquivo **.env.example**, ou use os dados do exemplo abaixo:
<pre>
<code>DB_PORT=27017
API_PORT=3002
MONGODB_URI=mongodb://db:27017/oz-tech-test?authSource=admin
GOOGLE_GEOCODING_REVERSE_URL=https://maps.googleapis.com/maps/api/geocode/json?latlng=
GOOGLE_GEOCODING_URL=https://maps.googleapis.com/maps/api/geocode/json?address=
GOOGLE_API_KEY=AIzaSyAtDC6LxJll8GZ5XY7k4D_i1qYSBOBwWdg
</code></pre>

5. Abra um terminal na **raiz do repositório** e execute o comando <code>docker-compose up</code>;

code>;

## Preview:

#### Documentação 1 (Swagger)
![imgage](https://github.com/rdiegoss/ozmap_test/assets/10976074/17950116-3198-4838-8bd7-5d8a84d0da8b)

#### Cobertura de testes

![image](https://github.com/rdiegoss/ozmap_test/assets/10976074/7934f365-1827-4338-b4db-4df51ca3b87d)

# OZmap Challenge: Construindo a Geolocalização do Futuro

Olá desenvolvedor(a)! Bem-vindo(a) ao Desafio Técnico do OZmap. Este é um projeto que simula um cenário real de nossa empresa, onde você irá desempenhar um papel crucial ao desenvolver uma API RESTful robusta para gerenciar usuários e localizações. Estamos muito animados para ver sua abordagem e solução!

## 🌍 **Visão Geral**

Em um mundo conectado e globalizado, a geolocalização se torna cada vez mais essencial. E aqui no OZmap, buscamos sempre otimizar e melhorar nossos sistemas. Assim, você encontrará um protótipo que precisa de sua experiência para ser corrigido, melhorado e levado ao próximo nível.

## 🛠 **Especificações Técnicas**

- **Node.js**: Versão 20 ou superior.
- **Banco de Dados**: Mongo 7+.
- **ORM**: Mongoose / Typegoose.
- **Linguagem**: Typescript.
- **Formatação e Linting**: Eslint + prettier.
- **Comunicação com MongoDB**: Deve ser feita via container.

## 🔍 **Funcionalidades Esperadas**

### Usuários
- **CRUD** completo para usuários.
- Cada usuário deve ter nome, email, endereço e coordenadas.
- Na criação, o usuário pode fornecer endereço ou coordenadas. Haverá erro caso forneça ambos ou nenhum.
- Uso de serviço de geolocalização para resolver endereço ↔ coordenadas.
- Atualização de endereço ou coordenadas deve seguir a mesma lógica.

### Regiões
- **CRUD** completo para regiões.
- Uma região é definida como um polígono em GeoJSON, um formato padrão para representar formas geográficas. Cada região tem um nome, um conjunto de coordenadas que formam o polígono, e um usuário que será o dono da região.
- Listar regiões contendo um ponto específico.
- Listar regiões a uma certa distância de um ponto, com opção de filtrar regiões não pertencentes ao usuário que fez a requisição.
- Exemplo de um polígono simples em GeoJSON:
  ```json
  {
    "type": "Polygon",
    "coordinates": [
      [
        [longitude1, latitude1],
        [longitude2, latitude2],
        [longitude3, latitude3],
        [longitude1, latitude1] // Fecha o polígono
      ]
    ]
  }
  ```

### Testes
- Unitários e de integração.

## 🌟 **Diferenciais**

- Autenticação não é requisito, podendo então o usuário ser fornecido junto do corpo da requisição. Caso implemente autenticação, o usuário deve ser obtido a partir do token.
- Interface básica de usuário.
- Documentação completa da API.
- Internacionalização.
- Cobertura de código.
- Utilização de mongo session

## ⚖ **Critérios de Avaliação**

1. Organização e clareza do código.
2. Estruturação do projeto.
3. Qualidade e eficiência do código.
4. Cobertura e qualidade de testes.
5. Pontos diferenciais citados acima.
6. Tempo de entrega.
7. Padronização e clareza das mensagens de erro.
8. Organização dos commits.
9. Implementação de logs.
10. Adesão às boas práticas de API RESTful.

## 🚀 **Entrega**

1. Crie um repositório público com a base desse código.
2. Crie uma branch para realizar o seu trabalho.
3. Ao finalizar, faça um pull request para a branch `main` deste repositório.
4. Envie um email para `rh@ozmap.com.br` informando que o teste foi concluído.
5. Aguarde nosso feedback.

---

Estamos ansiosos para ver sua implementação e criatividade em ação! Boa sorte e que a força do código esteja com você! 🚀

