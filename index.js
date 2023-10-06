const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const app = express();
const port = 8000;

app.use(bodyParser.json());

// Initialize user balance and transactions
var userTotalPoints = 0;
var userBalance = {};
var userTransactions = []; // stack of transactions sorted by timestamp

// Add transaction to userTransactions and update userBalance
// Time complexity: O(log n)

function addPoints(req, res) {
    // validate request body
    if (!req.body.payer || !req.body.points || !req.body.timestamp) {
        return res.status(400).send('Invalid request body');
    }
    if (typeof req.body.payer !== 'string' || typeof req.body.points !== 'number' || typeof req.body.timestamp !== 'string') {
        return res.status(400).send('Invalid request body');
    }
    if (req.body.points < 0) {
        // spend the points if we are trying to add negative points
        spendPoints({ body: { points: -1 * req.body.points } }, res);
        return
    }

    const { payer, points, timestamp } = req.body;
    var timestampDate = new Date(Date.parse(timestamp));
    const transaction = { payer, points, timestampDate };

    // binary search O(log n)
    // we keep the array sorted by timestampDate so when we go to spend points 
    // we can spend the oldest points first
    var low = 0;
    var high = userTransactions.length - 1;
    var mid = 0;

    // be dont need binary search if there are 0 transactions
    if (userTransactions.length > 0) {
        while (low <= high) {
            mid = Math.floor(low + (high - low) / 2);
            if (userTransactions[mid].timestampDate === timestampDate) {
                break;
            } else if (userTransactions[mid].timestampDate > timestampDate) {
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
        mid = userTransactions[mid].timestampDate >= timestampDate ? mid + 1 : mid;
    }

    userTransactions.splice(mid, 0, transaction);
    userBalance[payer] = (userBalance[payer] || 0) + points;
    userTotalPoints += points;

    res.sendStatus(200);
}


function spendPoints(req, res) {
    // validate request body
    if (!req.body.points) {
        return res.status(400).send('Invalid request body');
    }
    if (typeof req.body.points !== 'number') {
        return res.status(400).send('Invalid request body');
    }
    if (req.body.points < 0) {
        // we assume the user is trying to spend points
        // if we want to add points to the user, we need to use the add function
        req.body.points = -1 * req.body.points;
    }
    if (req.body.points > userTotalPoints) {
        return res.status(400).send('User does not have enough points');
    }

    const spendPoints = req.body.points;
    userTotalPoints -= spendPoints;
    var spendTransactions = [];
    var spendPointsRemaining = spendPoints;

    // spend points from oldest to newest
    // Time complexity: O(n)

    // start at end of the stack and work backwards
    for (var i = userTransactions.length - 1; i >= 0; i--) {
        var transaction = userTransactions[i];
        var payer = transaction.payer;
        var points = transaction.points;
        transaction.points = -1 * transaction.points; // points are returned as negative

        if (points <= spendPointsRemaining) {
            spendTransactions.push({
                payer, points: transaction.points,
            });
            spendPointsRemaining -= points;
            userTransactions.pop(i);
            userBalance[payer] -= points;
        } else {
            spendTransactions.push({
                payer, points: -1 * spendPointsRemaining,
            }); // points are returned as negative

            // points no longer need to be negative
            transaction.points = -1 * transaction.points;

            userTransactions[i].points -= spendPointsRemaining;
            userBalance[payer] -= spendPointsRemaining;
            break;
        }
    }

    res.json(spendTransactions);
}

// routes

app.post('/add', (req, res) => {
    addPoints(req, res);
});

app.post('/spend', (req, res) => {
    spendPoints(req, res);
});

app.get('/balance', (req, res) => {
    res.json(userBalance);
});

// returns the total points the user has
app.get('/total', (req, res) => {
    res.json(userTotalPoints);
});

// returns the transactions stack
app.get('/transactions', (req, res) => {
    res.json(userTransactions);
});

app.get('/', (req, res) => {
    res.json(userBalance);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
