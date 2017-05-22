import express from 'express';
import path from 'path';
import open from 'open';
import webpack from 'webpack';
import config from '../webpack.config.dev';
import bear from '../routes/bear';
import bodyParser from 'body-parser';

const port = 3000;
const app = express();
const compiler = webpack(config);

app.use(require('webpack-dev-middleware')(compiler, {
    noInfo: true,
    publicPath: config.output.publicPath
}));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '../src/index.html'));
});

// add a router from a separate file
app.use('/api', bear);

// simple add of a router to main app
app.route('/api/book')
  .get(function (req, res) {
    res.send('Get a random book');
  })
  .post(function (req, res) {
    res.send('Add a book');
  })
  .put(function (req, res) {
    res.send('Update the book');
  });

app.listen(port, function(err) {
   if (err) {
       console.log(err); //eslint-disable-line no-console
   } else {
       open('http://localhost:' + port);
   }
});
