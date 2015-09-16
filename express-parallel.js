module.exports = function parallel(middlewares, time) {

  return function(req, res, next) {
    var completed = false;
    var pending = middlewares.length;
    var timeout = setTimeout(complete, time);

    middlewares.forEach(function(middleware) {
      middleware(req, res, onProgress);
    });

    function onProgress(err) {
      pending--;
      if (err) return complete(err);
      if (pending === 0) complete();
    }

    function complete(err) {
      if (completed) return;
      completed = true;
      clearTimeout(timeout);
      next(err);
    }
  };
};
