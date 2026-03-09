---
title: "Building a Serverless Postgres-Powered GraphQL API with Prisma ORM and Apollo Server"
description: "Build a scalable, serverless GraphQL API using NeonDB's PostgreSQL, Prisma ORM, and Apollo Server. This guide covers database setup, API implementation, and AWS Lambda deployment with practical code examples."
pubDate: "Feb 08 2024"
---

Serverless architecture is one answer to the demand for scalable, efficient, and easily maintainable solutions in modern web development. NeonDB, a serverless PostgreSQL offering, stands out as a robust choice among the serverless databases available.

In this article, we'll create a powerful and flexible GraphQL API by harnessing the combined capabilities of Prisma ORM, Apollo Server, and NeonDB's serverless PostgreSQL. You can follow along with the [project code](https://github.com/nitishxyz/serverless-neon-prisma-graphql) as we get started.

## Why use NeonDB with Prisma?

NeonDB is an innovative serverless database solution that offers the power of PostgreSQL with the flexibility and cost-effectiveness of serverless computing. It eliminates the need for complex database management tasks, allowing developers to focus on crafting exceptional user experiences.

Leveraging Prisma ORM — a modern, type-safe database toolkit for Node.js and TypeScript — adds a layer of abstraction that simplifies database interactions. Meanwhile, Apollo Server facilitates the seamless integration of our GraphQL API.

So, we'll set up a serverless PostgreSQL database with NeonDB, configure Prisma ORM for efficient data modeling, and implement Apollo Server to expose a GraphQL API.

## Setting up NeonDB's serverless Postgres

It's easy to set up Neon's serverless Postgres. There are just four steps:

1. Sign up for NeonDB
2. Create a new database instance
3. Retrieve connection details
4. Connect to NeonDB

Start by signing up for a NeonDB account. Navigate to the NeonDB website and follow the registration process. Once registered, log in to your NeonDB dashboard.

In your NeonDB dashboard, look for an option to create a new database instance. Provide a name for your database, choose the desired region for deployment, and configure any additional settings according to your project requirements.

Once your Neon database instance is set up, locate the connection details provided by NeonDB. This typically includes the endpoint URL, port, username, and password. You'll need these details to connect your applications and services to the serverless Postgres instance.

A direct connection opens a new connection with the database on every request, while a pooled connection caches the connection so it can be reused by multiple queries. We can only push migrations via direct connections, but to make queries and other requests, we should use a pooled connection.

## Setting up our Prisma and TypeScript project

Create a new directory:

```bash
mkdir serverless-neon-prisma-graphql
```

Inside that directory, initialize a project:

```bash
npm init
```

Then, set the `type` key to `module` in your `package.json` file:

```json
{
  "name": "serverless-neon-prisma-graphql",
  "module": "index.js",
  "type": "module",
  "peerDependencies": {},
  "dependencies": {},
  "devDependencies": {}
}
```

Next, install and initialize TypeScript:

```bash
npm install typescript --save-dev
npx tsc --init
```

Now, install Prisma CLI as a development dependency:

```bash
npm install prisma --save-dev
```

Set up Prisma with the `init` command:

```bash
npx prisma init --datasource-provider postgresql
```

This will create a `.env` file and a `schema.prisma` file with the basic configuration.

Finally, install Prisma Client:

```bash
npm install @prisma/client
```

## Connecting Prisma with NeonDB

Open the `prisma/schema.prisma` file and update it:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_DATABASE_URL")
}
```

We added a `directUrl` key to the `datasource` connector because we will use a pooled connection for client queries and a direct connection for deploying migrations.

Update the `.env` file:

```bash
DATABASE_URL="postgresql://pooler-connection-string-from-neon?sslmode=require&connect_timeout=600&pgbouncer=true"
DIRECT_DATABASE_URL="postgresql://direct-connection-string-from-neon?sslmode=require&connect_timeout=300"
```

Now, add some basic schema definitions:

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  author    User?    @relation(fields: [authorId], references: [id])
  authorId  Int?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Deploy the migrations:

```bash
npx prisma migration dev -n initUserAndPost
```

## Setting up Apollo Server for AWS Lambda

Install Apollo Server, GraphQL, and AWS Lambda integrations:

```bash
npm install @apollo/server graphql @as-integrations/aws-lambda
```

Create `src/server.ts`:

```javascript
import { ApolloServer } from "@apollo/server";
import {
  startServerAndCreateLambdaHandler,
  handlers,
} from "@as-integrations/aws-lambda";

const typeDefs = `#graphql
  type Query {
    test: String
  }
`;

const resolvers = {
  Query: {
    test: () => "Hello World!",
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

export const graphqlHandler = startServerAndCreateLambdaHandler(
  server,
  handlers.createAPIGatewayProxyEventV2RequestHandler()
);
```

## Setting up the Serverless Framework

Create `serverless.yml`:

```yml
service: apollo-lambda
provider:
  name: aws
  region: ${opt:region, 'ap-south-1'}
  runtime: nodejs18.x
  httpApi:
    cors: true
functions:
  graphql:
    handler: src/server.graphqlHandler
    events:
      - httpApi:
          path: /
          method: POST
      - httpApi:
          path: /
          method: GET
plugins:
  - serverless-plugin-typescript
```

Install the TypeScript plugin:

```bash
npm install serverless-plugin-typescript --save-dev
```

Test locally with a `query.json` file:

```json
{
  "version": "2",
  "headers": { "content-type": "application/json" },
  "isBase64Encoded": false,
  "rawQueryString": "",
  "requestContext": { "http": { "method": "POST" } },
  "rawPath": "/",
  "routeKey": "/",
  "body": "{\"operationName\": null, \"variables\": null, \"query\": \"{ test }\"}"
}
```

```bash
serverless invoke local -f graphql -p query.json
```

## Using Prisma to connect Apollo Server to NeonDB

Install the dotenv plugin:

```bash
npm install serverless-dotenv-plugin --save-dev
```

Update `serverless.yml` to include the dotenv plugin and Prisma patterns:

```yml
plugins:
  - serverless-plugin-typescript
  - serverless-dotenv-plugin
package:
  patterns:
    - "!node_modules/.prisma/client/libquery_engine-*"
    - "node_modules/.prisma/client/libquery_engine-rhel-*"
    - "!node_modules/prisma/libquery_engine-*"
    - "!node_modules/@prisma/engines/**"
```

Update `server.ts` with Prisma and full GraphQL schema:

```ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const typeDefs = `#graphql
  type Query {
    fetchUsers: [User]
  }
  type User {
    id: Int!
    name: String!
    email: String!
    posts: [Post]
  }
  type Post {
    id: Int!
    title: String!
    content: String!
    published: Boolean!
  }
  type Mutation {
    createUser(name: String!, email: String!): User!
    createDraft(title: String!, content: String!, authorEmail: String!): Post!
    publish(id: Int!): Post
  }
`;

const resolvers = {
  Query: {
    fetchUsers: async () => {
      const users = await prisma.user.findMany({
        include: { posts: true },
      });
      return users;
    },
  },
  Mutation: {
    createUser: async (parent, args) => {
      const user = await prisma.user.create({
        data: { name: args.name, email: args.email },
      });
      return user;
    },
    createDraft: async (parent, args) => {
      const post = await prisma.post.create({
        data: {
          title: args.title,
          content: args.content,
          published: false,
        },
      });
      return post;
    },
  },
};
```

Update `schema.prisma` to accommodate the AWS Lambda architecture:

```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "rhel-openssl-1.0.x"]
}
```

## Deploying with GitHub Actions

Set up repository secrets in GitHub:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `ENV`

Add deployment scripts to `package.json`:

```json
"scripts": {
    "prisma:generate": "npx prisma generate",
    "build": "tsc",
    "deploy": "npm run prisma:generate && npm run build && npx serverless deploy"
}
```

Create `.github/workflows/deploy.yml`:

```yml
name: CDK Deployment
on:
  push:
    branches:
      - main
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v2
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-south-1
      - name: Install dependencies
        run: npm install
      - name: Deploy infrastructure
        run: |
          export AWS_ACCESS_KEY_ID="${{ secrets.AWS_ACCESS_KEY_ID }}"
          export AWS_SECRET_ACCESS_KEY="${{ secrets.AWS_SECRET_ACCESS_KEY }}"
          echo "${{ secrets.ENV }}" > .env
          source .env
          npm run deploy
```

Push to main and the deployment will begin automatically.

## Conclusion

In this tutorial, we combined NeonDB, Prisma ORM, and Apollo Server within a serverless architecture to achieve a fully functional and scalable GraphQL API. We also used GitHub Actions to ensure seamless automated deployment.

You can check out the [final project's code on GitHub](https://github.com/nitishxyz/serverless-neon-prisma-graphql).
