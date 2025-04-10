# Node.js Microservice API (Serverless Framework)

### Overview

This project is a serverless backend API built with Node.js, designed to manage user accounts, authentication, and multi-tenant support. It runs on AWS Lambda with DynamoDB as the primary datastore, and is orchestrated using the Serverless Framework.

The codebase is modular, with business logic organized by domain (auth, tenants, users) and reusable functionality abstracted into Lambda Layers.
📁 Project Structure

```python
backend/
├── src/
│ ├── layers/ # Shared logic grouped in layers
│ │ ├── authLayer/ # (JWT, password)
│ │ ├── awsLayer/
│ │ ├── excelLayer/
│ │ └── utilsLayer/
│ └── stacks/ # Domain-specific Lambda functions
│ ├── auth/
│ ├── tenants/
│ └── users/
├── docs/
├── infrastructure/ # Infrastructure and Serverless config
├── .gitignore
├── package.json
└── README.md
```

## 🚀 Deploy Instructions

Deployment is handled using the Serverless Framework.
The default deployment stage is prod.

### 🔐 Required Setup

Before deploying, ensure the following:

1. **Node.js** version 16+
2. AWS CLI configured

```bash
aws configure
```

3. Serverless CLI installed globally

```bash
npm install -g serverless
```

### 📦 Deploy Command

```bash
serverless deploy --stage prod --verbose
```

Or, for the infrastructure stack:

```bash
TOKEN_SECRET=xxx serverless deploy --stage prod --verbose
```

## 🧪 Running Tests

Tests are written using Mocha and Chai, using CommonJS (require) modules.

Run tests with:

```bash
cd backend
npm install
npm run test
```

Each Lambda handler has its own test file under the corresponding stack directory.

## ⚙️ Technologies Used

![NodeJS](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![Serverless](https://img.shields.io/badge/Serverless-FD5750?style=flat&logo=serverless&logoColor=white)
![AWS](https://img.shields.io/badge/Amazon_AWS-232F3E?style=flat&logo=amazon-web-services&logoColor=white)
![AmazonDynamoDB](https://img.shields.io/badge/Amazon%20DynamoDB-4053D6?style=flat&logo=amazon-dynamodb&logoColor=white)
![API Gateway](https://img.shields.io/badge/AWS%20API%20Gateway-FF4F8B?style=flat&logo=amazon-api-gateway&logoColor=white)
![AWS Lambda](https://img.shields.io/badge/AWS%20Lambda-F58536?style=flat&logo=aws-lambda&logoColor=white)
![Mocha](https://img.shields.io/badge/Mocha-8D6748?style=flat&logo=mocha&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=flat&logo=jsonwebtokens&logoColor=white)
