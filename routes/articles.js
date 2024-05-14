const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./dev.sqlite3', (err) => {
  if (err) {
    console.error('Błąd podczas połączenia z bazą danych:', err.message);
  } else {
    console.log('Połączono z bazą danych SQLite');
  }
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS post (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    descritopn TEXT,
    date TEXT,
    contents TEXT,
    user TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS comment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user TEXT,
    postId INTEGER,
    text TEXT
  )`);
});

router.get('/new', (req, res) => {
  res.render('articles/new', { article: {} });
});

router.get('/edit/:id', (req, res) => {
  const id = req.params.id;
  db.get(`SELECT * FROM post WHERE id = ?`, [id], (err, row) => {
    if (err) {
      console.error('Błąd podczas pobierania artykułu do edycji:', err.message);
      res.redirect('/');
    } else {
      res.render('articles/edit', { article: row });
    }
  });
});

router.post('/new', async (req, res) => {
  const title = req.body.title;
  const descritopn = req.body.descritopn;
  const contents = req.body.contents;

  const date = new Date().toISOString().slice(0, 10);
  const username = req.session.user;

  db.run(`INSERT INTO post (title, date, descritopn, contents, user) VALUES (?, ?, ?, ?, ?)`, [title, date, descritopn, contents, username], function(err) {
    if (err) {
      console.error('Błąd podczas dodawania artykułu:', err.message);
      res.render('articles/new', { article: { title, descritopn, contents } });
    } else {
      console.log(`Dodano nowy artykuł o ID ${this.lastID}`);
      res.redirect(`/articles/${this.lastID}`);
    }
  });
});






router.post('/:id', (req, res) => {
  const id = req.params.id;
  db.run(`DELETE FROM post WHERE id = ?`, [id], function(err) {
    if (err) {
      console.error('Błąd podczas usuwania artykułu:', err.message);
      res.status(500).send('Internal Server Error');
    } else {
      console.log(`Usunięto artykuł o ID ${id}`);
      res.redirect('/');
    }
  });
});

router.post('/update/:id', (req, res) => {
  const id = req.params.id;
  const { title, descritopn, contents } = req.body; 

  db.run(`UPDATE post SET title = ?, descritopn = ?, contents = ? WHERE id = ?`, [title, descritopn, contents, id], function(err) {
    if (err) {
      console.error('Błąd podczas aktualizacji artykułu:', err.message);
      res.render('articles/edit', { article: { id, title, descritopn, contents }, error: 'Błąd podczas aktualizacji artykułu' });
    } else {
      console.log(`Zaktualizowano artykuł o ID ${id}`);
      res.redirect(`/articles/${id}`);
    }
  });
});

router.get('/:id', (req, res) => {
  const id = req.params.id;
  db.get(`SELECT * FROM post WHERE id = ?`, [id], (err, row) => {
    if (err) {
      console.error('Błąd podczas pobierania artykułu:', err.message);
      res.redirect('/');
    } else {
      console.log(`Pobieranie artykułu o ID ${id}`);
      db.all(`SELECT * FROM comment WHERE postId = ?`, [id], (err, comments) => {
        if (err) {
          console.error('Błąd podczas pobierania komentarzy:', err.message);
          comments = [];
        }
        res.locals.userName = req.session.user || 'Nieznany użytkownik'; 
        res.render('articles/show', { post: row, comments });
      });
    }
  });
});

router.post('/:id/comment', (req, res) => {
  const postId = req.params.id;
  const user = req.session.user;
  const text = req.body.text;

  db.run(`INSERT INTO comment (user, postId, text) VALUES (?, ?, ?)`, [user, postId, text], function(err) {
    if (err) {
      console.error('Błąd podczas dodawania komentarza:', err.message);
    }
    res.redirect(`/articles/${postId}`);
  });
});

module.exports = router;
