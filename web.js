var http = require('http');
var express = require('express');
var jackrabbit = require('jackrabbit');

var PORT = process.env.PORT || 3000;
var RENDER_TIMEOUT = process.env.RENDER_TIMEOUT || 1000;

var rabbit = jackrabbit(process.env.RABBIT_URL);
var productExchange = rabbit.topic('product');

app().listen(PORT, onListen);

function onListen(err) {
  console.log('Listening on port', PORT);
}

function app() {
  return express()
    .set('view engine', 'jade')
    .set('views', __dirname)
    .get('/', showProduct);

  function showProduct(req, res) {
    res.render('product');
  }
}
