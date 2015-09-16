module.exports = function expressTime(middleware, time) {
  return function(req, res, next) {
    var completed = false;
    var timeout = setTimeout(complete, time);

    middleware(req, res, complete);

    function complete(err) {
      if (completed) return;
      completed = true;
      next(err);
    }
  }
}
