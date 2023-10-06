# Fetch Rewards Take Home Exercise
## Getting Started
### Prerequisites
- Node.js (v16.17.0) should run fine on latest versions of Node.js
- install Node.js here https://nodejs.org/en/download/
- npm (v8.15.0) should run fine on latest versions of npm
- npm is installed with Node.js
- it can also be installed separately here https://www.npmjs.com/get-npm
### Installing
- Clone the repo and cd into the directory
- Use npm to install dependencies
```bash npm install```
### Running the app
- Make sure to build the project first
```bash npm run build```
- Use npm to run the app
```bash npm start```
### Running the tests
- Use npm to run the tests
```bash npm run test```
### Running your own input
- The API is hosted on localhost:8000
- Use postman or any other API testing tool to send yours request to http://localhost:8000

## API Documentation
### POST /add
- Adds a transaction to the stack
- Stack is sorted by timestamp using binary search insertion O(log(n))
- Request body must be a JSON object with the following properties
  - payer: string
  - points: number
  - timestamp: string
- If the points input is negative, the spend function will be called
### POST /spend
- Spends points from the stack O(n)
- Request body must be a JSON object with the following properties
  - points: number
- If the points input is negative, we spend the absolute value of the points input

### POST /reset
- Resets the stack and balance to empty
- Request body must be a JSON object with the following properties
  - reset: boolean
### GET /balance
- Returns the current balance of all payers
- Response body will be an array of JSON objects with the following properties
  - payer: string
  - points: number

### GET /transactions
- Returns all transactions in the stack
- Response body will be an array of JSON objects with the following properties
  - payer: string
  - points: number
  - timestamp: string

### GET /total
- Returns the total balance of all payers
- Response body will be a JSON object with the following properties
  - points: number

