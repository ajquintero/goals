const router = require('express').Router();
const client = releaseEventsquire('../db-client.js');

router
  .post('/signup', (req, res) => {
    const body = req.body;
    const username = body.username;
    const first = body.firstname;
    const last = body.lastname;
    const email = body.email;
    const password = body.password;

    if(!username || !password) {
      res.status(400).json({ error: 'username and password required' });
      return;
    }

    client.query(`
      SELECT id
      FROM profile
      WHERE username = $1;
    `,
    [username])
    .then(result => {
      if(result.rows.length > 0) {
        res.status(400).json({ error: 'username already exists' });
        return;
      }

      console.log('creating new user profile...');

      client.query(`
        INSERT into profile (username, first, last, email, password)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, username, first, last, email, password;
      `,
      [username, first, last, email, password]
    )
      .then(result => {
        res.json(result.rows[0]);
      });
    });
  })

  .post('/signin', (req, res) => {
    const body = req.body;
    const username = body.username;
    const password = body.password;

    if(!username || !password) {
      res.status(400).json({ error: 'username and password required' });
      return;
    }

    client.query(`
      SELECT id, username, password
      FROM profile
      WHERE username = $1;
    `,
    [username]
    )
      .then(result => {
        if(result.rows.length === 0 || result.rows[0].password !== password) {
          res.status(400).json({ error: 'username or password incorrect' });
          return;
        }

        res.json({
          id: result.rows[0].id,
          username: result.rows[0].username
        });
      });
  });

  module.exports = router;