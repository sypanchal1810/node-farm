const dotenv = require('dotenv');
const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');
const slugify = require('slugify');
const url = require('url');

const replaceTemplate = require('./modules/replaceTemplate');

dotenv.config({ path: './config.env' });

const publicPath = path.join(__dirname, 'templates');

const getFileData = (fileName) => {
  return path.join(publicPath, fileName);
};

//////////////////////////////////////////////////
// Building Simple API

const tempCard = fs.readFileSync(getFileData('template-card.html'), 'utf-8');
const tempOverview = fs.readFileSync(getFileData('template-overview.html'), 'utf-8');
const tempProduct = fs.readFileSync(getFileData('template-product.html'), 'utf-8');

// const fileUrl = new URL('file://github.com/sypanchal1810/node-farm/blob/master/templates/template-card.html');

// const tempCardurl = fs.readFileSync(fileUrl, 'utf-8');

// const giturl = 'https://raw.githubusercontent.com/sypanchal1810/node-farm/master/templates/template-card.html';

// https
//   .get(giturl, (res) => {
//     let data = '';

//     res.on('data', (chunk) => {
//       data += chunk;
//     });

//     res.on('end', () => {
//       console.log(data);
//     });
//   })
//   .on('error', (err) => {
//     console.log('Error: ', err.message);
//   });

// console.log(tempCardurl);

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
