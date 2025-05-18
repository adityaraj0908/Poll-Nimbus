// server.js - Main Entry Point
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();

// Set up EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// In-memory storage for polls (in a real app, you'd use a database)
const polls = [];

// Routes
app.get('/', (req, res) => {
  res.render('index', { polls });
});

app.get('/create', (req, res) => {
  res.render('create-poll');
});

app.post('/create', (req, res) => {
  const { title, options } = req.body;
  const optionsArray = options.split('\n').filter(option => option.trim() !== '');
  
  const poll = {
    id: Date.now().toString(),
    title,
    options: optionsArray.map(option => ({
      text: option,
      votes: 0
    })),
    created: new Date()
  };
  
  polls.push(poll);
  res.redirect(`/vote/${poll.id}`);
});

app.get('/vote/:id', (req, res) => {
  const poll = polls.find(p => p.id === req.params.id);
  if (!poll) {
    return res.status(404).send('Poll not found');
  }
  res.render('vote', { poll });
});

app.post('/vote/:id', (req, res) => {
  const poll = polls.find(p => p.id === req.params.id);
  if (!poll) {
    return res.status(404).json({ error: 'Poll not found' });
  }
  
  const optionIndex = req.body.option;
  if (poll.options[optionIndex]) {
    poll.options[optionIndex].votes++;
    res.redirect(`/results/${poll.id}`);
  } else {
    res.status(400).json({ error: 'Invalid option' });
  }
});

app.get('/results/:id', (req, res) => {
  const poll = polls.find(p => p.id === req.params.id);
  if (!poll) {
    return res.status(404).send('Poll not found');
  }
  res.render('results', { poll });
});

// API routes for AJAX operations
app.get('/api/polls', (req, res) => {
  res.json(polls);
});

app.get('/api/poll/:id', (req, res) => {
  const poll = polls.find(p => p.id === req.params.id);
  if (!poll) {
    return res.status(404).json({ error: 'Poll not found' });
  }
  res.json(poll);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Poll Nimbus server running on port ${PORT}`);
});