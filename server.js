const fs = require('fs');
const http = require('http');
const url = require('url');
const replaceTemplate = require('./modules/replaceTemplate');
const slugify = require('slugify');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

//////////////////////////////////////////////////
// Building Simple API

const tempCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, 'utf-8');
const tempOverview = fs.readFileSync(`${__dirname}/templates/template-overview.html`, 'utf-8');
const tempProduct = fs.readFileSync(`${__dirname}/templates/template-product.html`, 'utf-8');

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObj = JSON.parse(data);

dataObj.map(
  (el) =>
    (el.slug = slugify(el.productName, {
      replacement: '-', // replace spaces with replacement character, defaults to `-`
      lower: true, // convert to lower case, defaults to `false`
    }))
);

const server = http.createServer((req, res) => {
  console.log(url.parse(req.url, true));
  const { query, pathname } = url.parse(req.url, true);

  // Overview Page
  if (pathname === '/' || pathname === '/overview') {
    res.writeHead('200', {
      'Content-Type': 'text/html',
    });

    const cardsHtml = dataObj.map((el) => replaceTemplate(tempCard, el)).join('');
    const output = tempOverview.replace(/{%PRODUCT_CARDS%}/g, cardsHtml);

    res.end(output);

    // Product Page
  } else if (pathname === '/product') {
    const product = dataObj[query.id];
    const output = replaceTemplate(tempProduct, product);
    res.end(output);

    // API
  } else if (pathname === '/api') {
    res.writeHead('200', {
      'Content-Type': 'application/json',
    });
    res.end(data);

    // Page Not Found
  } else {
    res.writeHead('404', {
      'Content-Type': 'text/html',
    });
    res.end('<h1>Page not Found!</h1');
  }
});

const port = process.env.PORT || 3000;
server.listen(port, '127.0.0.1', () => {
  console.log('Listening to the request on port 8000');
});
