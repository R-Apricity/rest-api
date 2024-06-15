import express from 'express'
import { parse, stringify } from 'flatted'
import {inspect} from "util";

const app = express()
const port = 3000

app.get('/', (req, res) => {
//   res.send('Hello World!')
// console.log(JSON.stringify(req))
// res.json(parse(stringify(req)));
// console.log(inspect(req));
res.send(inspect(req))
// res.send(JSON.stringify(req, censor(req), 2))
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
function censor(censor) {
  var i = 0;
  
  return function(key, value) {
    if(i !== 0 && typeof(censor) === 'object' && typeof(value) == 'object' && censor == value) 
      return '[Circular]'; 
    
    if(i >= 29) // seems to be a harded maximum of 30 serialized objects?
      return '[Unknown]';
    
    ++i; // so we know we aren't using the original object anymore
    
    return value;  
  }
}
