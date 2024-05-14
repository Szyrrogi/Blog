const express = require('express');
const articleRouter = require('./routes/articles'); 
const app = express();
const knex = require('knex')(require('./knexfile').development);
const cookieParser = require('cookie-parser');
const session = require('express-session');


app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(session({
    secret: 'verySecretValue',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Ustaw na `true` jeśli używasz HTTPS
}));



app.get('/', async (req, res) => {
    const posts = await knex('post').select('*');
    let userName = 'Nieznajomy'; // Domyślna wartość, jeśli nie ma sesji ani ciasteczka
    if (req.session.user) {
        userName = req.session.user; // Użyj nazwy z sesji, jeśli dostępna
    } else if (req.cookies.username) {
        userName = req.cookies.username; // Użyj nazwy z ciasteczka, jeśli sesja nie istnieje
        req.session.user = userName; // Odtwórz sesję z ciasteczka
    }
    try {
        const users = await knex('user').select('*'); // Pobieranie użytkowników z bazy danych
        res.render('articles/index', { posts: posts, users, userName }); // Przekazanie użytkowników i nazwy użytkownika do szablonu
    } catch (error) {
        console.error(error);
        res.status(500).send('Błąd serwera');
    }

    
    //res.render('articles/index', { posts: posts });
});

app.use('/articles', articleRouter);

app.post('/users', async (req, res) => {
    const { name, age, email } = req.body;
    try {
        await knex('users').insert({ name, age, email });
        res.redirect('/'); // Przekierowanie z powrotem na stronę główną po dodaniu użytkownika
    } catch (error) {
        console.error(error);
        res.status(500).send('Error adding user');
    }
});

const bcrypt = require('bcrypt');

app.get('/login', (req, res) => {
    res.render('login'); 
});

app.get('/register', (req, res) => {
    res.render('register');  
});





app.post('/register', (req, res) => {
  const { username, password, email } = req.body;

  knex('user').where('name', username).first()
    .then(existingUser => {
      if (existingUser) {
        res.status(400).send('Nazwa użytkownika już istnieje');
      } else {
        bcrypt.hash(password, 10, (err, hashedPassword) => {
          if (err) {
            console.error('Błąd podczas hashowania hasła:', err);
            res.status(500).send('Wystąpił błąd podczas rejestracji');
          } else {
            knex('user').insert({ name: username, password: hashedPassword, email: email })
              .then(() => {
                res.redirect('/login');
              })
              .catch(err => {
                console.error('Błąd podczas dodawania użytkownika:', err);
                res.status(500).send('Wystąpił błąd podczas rejestracji');
              });
          }
        });
      }
    })
    .catch(err => {
      console.error('Błąd podczas rejestracji:', err);
      res.status(500).send('Wystąpił błąd podczas rejestracji');
    });
});


app.post('/login', (req, res) => {
  const { username, password } = req.body;

  knex('user').where('name', username).first()
    .then(user => {
      if (user) {
        bcrypt.compare(password, user.password, (err, result) => {
          if (err) {
            console.error('Błąd podczas sprawdzania hasła:', err);
            res.status(500).send('Wystąpił błąd podczas logowania');
          } else if (result) {
            req.session.user = username; 
            res.cookie('username', username, { maxAge: 900000, httpOnly: true });
            res.redirect('/');
          } else {
            res.status(401).send('Nieprawidłowe hasło');
          }
        });
      } else {
        res.status(401).send('Użytkownik nie istnieje');
      }
    })
    .catch(err => {
      console.error('Błąd podczas logowania:', err);
      res.status(500).send('Wystąpił błąd podczas logowania');
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Błąd podczas niszczenia sesji', err);
            return res.status(500).send('Nie udało się wylogować');
        }
        res.clearCookie('username'); // Usuń ciasteczko z nazwą użytkownika
        res.clearCookie('connect.sid'); // Usuń ciasteczko sesji
        res.redirect('/');
    });
});


app.listen(5000);
