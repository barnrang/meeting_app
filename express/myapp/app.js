var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var fs = require('fs');

var session = require('express-session')


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
var sessionParser = session({ secret: 'secret',
resave: false,
saveUninitialized: true})
app.use(sessionParser)
var expressWs = require('express-ws')(app);
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodie

const colors = ['red', 'green', 'blue', 'yellow', 'black']
var colors_av = [1,1,1,1,1]
var connection = {}
var connection_count = 0
var login_users = []
current_log = ''

app.get('/', function(req, res, next) {
  if (!req.session.user){
    console.log('miss ' + req.session.user)
    res.redirect('/login');
  }
  else{
    console.log('corr ' + req.session.user)
    res.render('index', { title: req.session.user });
  }
});

app.get('/login', (req, res, next) => {
  res.render('login')
})

app.get('/nocolor', (req,res,next) => {
  var chosen_color = colors_av.findIndex(el => el == 1)
  if(chosen_color == -1)
  res.render('error', {message: "no more color", error:{
    status: "wait",
    stack:"that fine"
  }});
  else {
    res.redirect('/login')
  }
})

app.post('/login', (req, res) => {
  var user = req.body.uname
  console.log(user)
  if (login_users.findIndex((el) => el === user) != -1){
    res.redirect('/login')
  }
  else {
    req.session.user = user
    login_users.push(user)
    var chosen_color = colors_av.findIndex(el => el == 1)
    if(chosen_color == -1){res.redirect('/nocolor'); return}
    colors_av[chosen_color] = 0
    req.session.color_idx = chosen_color
    req.session.color = colors[chosen_color]
    req.session.save((err) => {
      console.log('save user sess')
      res.redirect('/')
    })
  }
})

app.get('/logout', (req,res,next) => {
  console.log('logout')
  var color_idx = req.session.color_idx;
  colors_av[color_idx] = 1;
  var idx = login_users.findIndex((el) => el === req.session.user)
  login_users.splice(idx)
  req.session.destroy();
  req.session.save((err)=>{
    console.log('session destroy')
    res.render('login')
  })
})

app.ws('/stream', (ws, req) => {
  var client_config = {ws:ws, user: req.session.user}
  // var chosen_color = colors_av.findIndex(el => el == 1)
  // colors_av[chosen_color] = 0
  client_config.color = req.session.color_idx
  connection[connection_count] = client_config
  var idx = connection_count
  console.log(idx + " connect")
  connection_count++;
  ws.send(colors[req.session.color_idx])
  ws.on('message', (msg) => {
    var income_data = JSON.parse(msg)
    var text = income_data.text
    var color = income_data.color
    var user = income_data.user
    for (var key in connection){
      var client = connection[key].ws
      // var user = connection[key].user
      if (ws != client){
        console.log('senddd to ' + key)
        client.send(JSON.stringify({ 
          user: user,
          text: text,
          color:color
        }));
      }
      else {
        current_log += user + ': ' + text + '\n';
        // if(req.session.current_log) req.session.current_log += 'User ' + idx + ': ' + text + '\n';
        // else{
        //   req.session.current_log = 'User ' + idx + ': ' + text + '\n';
        // }
      }
    };
    // req.session.save();
  }
  )
ws.on('close', () => {
  colors_av[client_config.color] = 1
  console.log(idx + " disconnect")
  delete connection[idx]
  })
});

app.post('/reset', (req,res) => {
  console.log('reset')
  current_log = '';
  res.end();
})

app.post('/save', (req,res) => {
  console.log('save')
  console.log(req.session)
  //console.log(req.body.load)
  const textfile = req.body.load
  const save = req.body.save
  const reset = req.body.reset
  if (save === '1') {
    fs.writeFile("logs/" + textfile, current_log, (err) => {
      if(err) return console.log(err)
      console.log('saved!')
      if (reset === '1') {
        current_log = '';
      }
    })
  }
  else {
    if (reset === '1') {
      current_log = '';
    }
  }
  //res.end();
  }
)
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
