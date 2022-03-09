const express = require('express') 
const app = express() 
app.get('/', function (req, res) 
{ 
    const oper = req.query.oper;
  const l1 = req.query.l1;
  const l2 = req.query.l2;

  switch (oper) {
    case 'add':
        res.send({'result = ': (l1 + l2)});
        break;
    case 'multiply':
        res.send({'result = ': (l1 * l2)});
        break;
    case 'divide':
        res.send({'result = ': (l1 / l2)});
        break;
    case 'minus':
        res.send({'result = ': (l1 - l2)});
        break;
    default:
        res.send('Hello World')
  } 
}
) 
app.listen(3000)