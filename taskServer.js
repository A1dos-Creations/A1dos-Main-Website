// server.js
const express = require('express');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3000;

// Use Express's built-in JSON parser instead of body-parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up a basic Content Security Policy header
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; connect-src 'self' https://a1dos-creations.com; style-src 'self'"
  );
  next();
});

// In-memory storage (for demonstration only)
const users = []; // e.g., { email, password } (password is hashed)
const tasks = []; // e.g., { id, userEmail, title, details, createdAt }

// Registration Endpoint
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password' });
  }
  if (users.find(user => user.email === email)) {
    return res.status(400).json({ error: 'User already exists' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ email, password: hashedPassword });
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error registering user' });
  }
});

// Login Endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password' });
  }
  const user = users.find(user => user.email === email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  try {
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    // For simplicity, we encode the email as the token.
    const token = Buffer.from(email).toString('base64');
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Error during login' });
  }
});

// Middleware to Authenticate Requests
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header provided' });
  }
  const token = authHeader.split(' ')[1];
  const email = Buffer.from(token, 'base64').toString('ascii');
  const user = users.find(user => user.email === email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  req.user = user;
  next();
}

// Task Creation Endpoint
app.post('/api/tasks', authenticate, (req, res) => {
  const { title, details } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Task title is required' });
  }
  const task = {
    id: tasks.length + 1,
    userEmail: req.user.email,
    title,
    details,
    createdAt: new Date()
  };
  tasks.push(task);
  res.status(201).json({ message: 'Task created successfully', task });
});

// Get Tasks Endpoint
app.get('/api/tasks', authenticate, (req, res) => {
  const userTasks = tasks.filter(task => task.userEmail === req.user.email);
  res.json({ tasks: userTasks });
});

// Start the Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
