if (process.env.NODE_ENV !== 'production') {
  // Per leggere il file .env
  // In produzione andrà sostituito con le variabili di ambiente
  require('dotenv').config();
}

const express = require('express');
const cors = require('cors');

const { handleRegister } = require('./controllers/register');
const { handleSignIn } = require('./controllers/signin');
const { addBookmark, getBookmarks } = require('./controllers/bookmarks');

const app = express();
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors());

// Manage Users
app.post('/register', handleRegister);
app.post('/signin', handleSignIn);

// Bookmarks
app.post('/bookmarks', addBookmark);
app.get('/bookmarks/:userid', getBookmarks);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Briciole API listening on port ${PORT}`);
});