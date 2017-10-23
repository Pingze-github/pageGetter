
const http = require('http');
const URL = require('url');
const iconv = require('iconv-lite');

const server = new http.Server();
const port = 9000;

function resJSON(res, obj) {
  res.setHeader('Content-type', 'text/plain');
  res.end(JSON.stringify(obj));
}

server.on('request', (req, res) => {
  try {
    if (!/^\/\?url=(.+)$/.test(req.url)) return resJSON(res, {code: 1, msg: 'No url param', data: ''});
    const url = req.url.match(/^\/\?url=(.+)$/)[1];
    let {protocol} = URL.parse(url);
    if (protocol !== 'http:') return resJSON(res, {code: 2, msg: 'Not supported protocal', data: ''});
    http.get(url, (res1) => {
      const chunks = [];
      let temp = '';
      res1.on('data', (chunk) => {
        chunks.push(chunk);
        temp += chunk;
      });
      res1.on('end', () => {
        let html;
        let charset = temp.match(/charset=["\']{0,1}([a-zA-Z0-9]{3,8})["\']/);
        charset = charset ? charset[1] : 'utf-8';
        if (charset !== 'utf-8') {
          html = iconv.decode(Buffer.concat(chunks), 'gbk');
          html = html.replace(/gbk/g,'utf-8');
        } else {
          html = temp;
        }
        res.setHeader('Content-type', 'text/html');
        res.end(html);
        //resJSON(res, {code:1, msg: 'succeed', data: html});
      })
    });
  } catch (err) {
    console.error(err);
    resJSON(res, {code:3, msg: 'Internal error', data: ''});
  }
});

server.listen(port, () => console.log('Server start @', port));


