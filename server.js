'use strict';

const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');

const  Post = require('./models');
const { DATABASE_URL, PORT } = require('./config');
const app = express();

app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  next();
});

mongoose.Promise = global.Promise;

const path = require('path');

// app.get('*', function (request, response){
//   response.sendFile(path.resolve(__dirname, 'public', 'index.html'));
// });


// GET all
app.get('/', (req, res) => {
  Post  
    .find()
    .exec()
    .then(posts => {
      res.status(200).json(posts);
    })
    .catch(err => {
      console.log('Get failed!');
      res.status(500).json({message: 'Internal error from GET'});
    });
});

// GET by ID
// app.get('/posts/:id', (req, res) => {
//   Post
//     // this is a convenience method Mongoose provides for searching
//     // by the object _id property
//     .findById(req.params.id)
//     .then(post =>res.json(post.apiRepr()))
//     .catch(err => {
//       console.error(err);
//       res.status(500).json({message: 'Internal server error'});
//     });
// });

// Post new post
app.post('/post', (req, res) => {
  console.log(req.body.text)
  Post
    .create({
      text: req.body.text
    })
    .then(post => {
      console.log('Post: ', post.apiRepr());
      Post  
        .find()
        .exec()
        .then(posts => {
          res.status(200).json(posts);
        })
        .catch(err => {
          console.log('Get failed!');
          res.status(500).json({message: 'Internal error from GET'});
        })
    })
    .catch(err => {
      console.log('Post failed!');
      res.status(500).json({ message: 'Internal error from POST' });
    });
});

// Edit post by ID
app.put('/post/:id', (req, res) => {
  const requiredFields = ['text'];
  for (let i=0; i<requiredFields.length; i++) {
    const post = requiredFields[i];
    if (!(post in req.body)) {
      const message = `Missing \`${post}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }
  if (req.params.id !== req.body.id) {
    const message = `Request path id (${req.params.id}) and request body id (${req.body.id}) must match`;
    console.error(message);
    return res.status(400).send(message);
  }
  console.log(`Updating post list \`${req.params.id}\``);

  Post.findOneAndUpdate(
    {_id: req.params.id},
    {text: req.body.text}
  )
  
  .then(post => {
    console.log('what i edited: ', post);
    res.status(201).json(post.apiRepr());    
  })
  .catch(err => {
    console.log('Put failed!', err);
    res.status(500).json({ message: 'Internal error from PUT' });    
  });
  // res.status(204).end();
});

// Delete post by ID
app.delete('/post/:id', (req, res) => {
  console.log('app.delete\'s id', req.params.id);
  Post
    .findByIdAndRemove(req.params.id)
    .then(post => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

let server;

function runServer(databaseUrl=DATABASE_URL, port=PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer().catch(err => console.error(err));
}

module.exports = { runServer, closeServer, app };