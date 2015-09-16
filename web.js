var http = require('http');
var express = require('express');
var jackrabbit = require('jackrabbit');
var parallel = require('./express-parallel');
var _ = require('lodash');

var PORT = process.env.PORT || 3000;
var RENDER_TIMEOUT = process.env.RENDER_TIMEOUT || 1000;

var rabbit = jackrabbit(process.env.CLOUDAMQP_URL);
var exchange = rabbit.default();

app().listen(PORT, function() {
  console.log('Listening on port', PORT);
});

function app() {
  return express()
    .set('view engine', 'jade')
    .set('views', __dirname)
    .set('view cache', true)
    .get('/products/:productId', createProduct, collectProduct(RENDER_TIMEOUT), showProduct)
    .get('/', redirect);

  function redirect(req, res) {
    res.redirect('/products/1');
  }

  function createProduct(req, res, next) {
    res.locals.product = {};
    next();
  }

  function collectProduct(timeout) {
    return parallel([getProduct, getInventory, getReviews], timeout);
  }

  function getProduct(req, res, next) {
    exchange.publish({ id: req.params.productId }, {
      key: 'product.get',
      reply: function(data) {
        _.extend(res.locals.product, data);
        next();
      }
    });
  }

  function getInventory(req, res, next) {
    exchange.publish({ id: req.params.productId }, {
      key: 'inventory.get',
      reply: function(data) {
        _.extend(res.locals.product, data);
        next();
      }
    });
  }

  function getReviews(req, res, next) {
    exchange.publish({ id: req.params.productId }, {
      key: 'reviews.get',
      reply: function(data) {
        _.extend(res.locals.product, { reviews: data });
        next();
      }
    });
  }

  function showProduct(req, res) {
    var p = res.locals.product
    if (p.name && p.price) res.render('product');
    else res.render('product-fail');
  }
}
