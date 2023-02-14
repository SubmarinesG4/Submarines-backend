# Serverless - AWS Node.js Typescript

Progetto generato usando il template `aws-nodejs-typescript` di [Serverless framework](https://www.serverless.com/).

> **Requirements**: NodeJS e Java

## Installazione

- Usare `npm i` per installare le dipendenze
- Usare `npm run installDynamo` per installare una versione locale di DynamoDB (richiede Java)
- Usare `npm run dev` per far partire un server locale di sviluppo

A seguito dell'esecuzione di questi comandi verrà avviato una versione di sviluppo utilizzabile in locale dell'applicativo,
raggiungibile all'indirizzo di base `localhost:3000`

### Guida directory

- `serverless.ts` contiene la configurazione del framework
- `src/environment` contiene un file di configurazione utile a tutto l'applicativo
- `src/functions` contiene le cartelle che definiscono gli handler delle varie function assieme alla definizione delle varie path
- `src/middleware` contiene le funzioni che gestiscono l'autorizzazione alle varie functions
- `src/types` contiene i tipi generali utili a tutto l'applicativo
- `src/services/dynamodb` contiene la configurazione e le funzioni riguardanti il client DynamoDB per l'esecuzione delle query

### Dipendenze importanti

- `serverless-dynamodb-local` plugin che permette l'utilizzo di una versione locale di DynamoDB
- `serverless-offline` plugin che permette l'utilizzo locale del framework serverless
