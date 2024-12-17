# Bulk Transaction Processing Service

## Overview
This project implements a **bulk transaction processing system** using **NestJS** with **Sequelize ORM** and PostgreSQL as the database. It efficiently processes up to 10,000 transactions, grouping them by `accountId` and applying batch processing for improved performance. The system ensures data integrity with proper error handling using database transactions.

---

## Key Features
- **Grouping Transactions**: Transactions are grouped by `accountId`.
- **Batch Processing**: Groups of transactions are processed in batches to optimize performance.
- **Atomicity**: Each batch runs within a single database transaction, ensuring partial failures do not affect the overall system.
- **Error Handling**: If any error occurs during processing, affected transactions are marked as `Failed` with an appropriate error message.
- **Sequelize ORM**: Used for database interaction with PostgreSQL as the dialect.

---

## Tech Stack
- **NestJS**: Framework for building scalable server-side applications.
- **Sequelize**: ORM for interacting with PostgreSQL.
- **PostgreSQL**: Database for storing accounts and transactions.
- **TypeScript**: Typed language for better code quality.

---

## Project Setup

### Prerequisites
- Node.js (v16+)
- PostgreSQL (Ensure a running instance)
- Yarn or npm (Package Manager)

### Installation Steps
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
   **OR**
   ```bash
   yarn install
   ```

3. Start the application with docker running:
   ```bash
   docker-compose build
   docker-compose up
   ```

4. Start the application without docker if local postgres instance running:
   ```bash
   npm run start:dev
   ```

---

## API Endpoint
### POST `/bulk-transactions`
Processes a list of bulk transactions.

#### Request Body
The request body must be a JSON array of transaction objects:
```json
[
  { "accountId": 1, "amount": 100 },
  { "accountId": 2, "amount": -50 },
  { "accountId": 1, "amount": 200 }
]
```
- `accountId`: ID of the account to apply the transaction to.
- `amount`: Positive or negative amount to adjust the account balance.

#### Response
A list of processed transactions with their statuses:
```json
[
  { "accountId": 1, "amount": 100, "status": "Success" },
  { "accountId": 2, "amount": -50, "status": "Success" },
  { "accountId": 1, "amount": 200, "status": "Success" }
]
```
#### Sample CURL command to test
```bash
   curl -X POST http://localhost:3000/bulk-transactions \
-H "Content-Type: application/json" \
-d '[
    {"accountId": 1, "amount": 100},
    {"accountId": 1, "amount": -50},
    {"accountId": 2, "amount": 200}
]'

```

---

## Assumptions

accountId received in bulk transactions is valid account id and if not already found in **Accounts** table we are creating it to simplify for testing the application

## How It Works
1. **Grouping**: All transactions are grouped by `accountId`.
2. **Batching**: Grouped transactions are processed in batches of **100**.
3. **Processing Logic**:
   - Fetch the account for each group.
   - Calculate the **net total amount** for all transactions in the group.
   - Update the account's balance atomically within a database transaction.
   - Mark each transaction as `Success` or `Failed` depending on processing outcome.
4. **Error Handling**: If an error occurs in a batch:
   - Failed transactions are recorded with the `Failed` status.
   - Successful transactions are committed without being rolled back.

---

## Why Batch Processing?
- **Scalability**: Processing thousands of transactions at once can overwhelm the system. Batching reduces load and ensures manageable chunks are processed.
- **Performance**: Grouping and processing accounts in batches minimizes repetitive queries to the database.
- **Error Isolation**: Errors in one batch do not affect others, ensuring partial processing when errors occur.

---

## Error Handling Strategy
- **Transaction-Level Errors**: Any issue during transaction creation or account update marks the affected transactions as `Failed`.
- **Batch-Level Isolation**: If one batch encounters errors, other batches continue processing without interruption.


## Testing
Run unit tests:
```bash
npm run test
```

