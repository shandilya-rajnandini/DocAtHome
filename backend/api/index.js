const express = require('express');
const app = express();

app.use(express.json());

// A simple GET endpoint
app.get('/api/hello', (req, res) => {
  res.status(200).json({ message: 'Hello from the API!' });
});

// A POST endpoint for demonstration
app.post('/api/submit', (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required.' });
  }
  res.status(201).json({ message: `Received data for: ${name}` });
});

module.exports = app;
