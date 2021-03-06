if (process.env.NODE_ENV !== 'production') {
  // Per leggere il file .env
  // In produzione andrà sostituito con le variabili di ambiente
  require('dotenv').config();
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet'); // Security Middleware
const morgan = require('morgan'); // Logging functionality

var corsOptions = {
  origin: ['http://localhost:3000'],
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

const { handleRegister } = require('./controllers/register');
const { handleSignIn, handleSignOut } = require('./controllers/signin');
const { getProfile, updateProfile, updatePassword } = require('./controllers/profile');
const { requireAuth } = require('./middlewares/auth');

const app = express();
app.use(morgan('combined'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors(corsOptions));
app.use(helmet());

// Manage Users
app.post('/register', handleRegister);
app.post('/signin', handleSignIn);
app.post('/signout', requireAuth, handleSignOut);
app.get('/profile/:id', requireAuth, getProfile);
app.put('/profile/:id', requireAuth, updateProfile);
app.put('/changepwd/:id', requireAuth, updatePassword);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Briciole API listening on port ${PORT}`);
});