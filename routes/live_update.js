exports.subscribe = function(req, res) {
  console.log(req.query);
  res.send(req.query['hub.challenge'])
};