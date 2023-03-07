var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  const data = {
    name: 'John Doe',
    age: 30
  }
  res.send({
    status: 'success',
    data: data
  });
});

module.exports = router;
