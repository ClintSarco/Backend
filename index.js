
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config(); 

const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

app.post('/api/register', async (req, res) => {
  console.log('Register Request Body:', req.body);

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Hashed Password:', hashedPassword);

    const result = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
      [username, hashedPassword]
    );

    console.log('Insert Result:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Registration error:', error); 
    res.status(500).json({ error: 'Server error, please try again later' });
  }
});


app.post('/api/login', async (req, res) => {
  console.log('Login Request Body:', req.body);

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    console.log('Query Result:', result.rows); 
    const user = result.rows[0];

    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      console.log('Password Match:', isMatch); 
      if (isMatch) {
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token })
      } else {
        res.status(400).json({ error: 'Invalid credentials' });
      }
    } else {
      res.status(400).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error, please try again later' });
  }
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
