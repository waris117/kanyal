"use strict";

const http = require('http')
const url = require("url");
const cheerio = require('cheerio');
const httpRequest = require("request");
const port = 3000
const titles= [];
let count = 0;

const requestHandler = (request, response) => {

    const requiredHtmlResponse = () => {
        let innerHtml = '';
        titles.forEach((element) => {
        innerHtml = `${innerHtml}<li>${element.url} -  "${element.title}" </li>`;
        })
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end('<html><body><h1> Following are the titles of given websites: </h1><ul>' + innerHtml +'</ul></body></html>');
        return;
    }

    const crawler = (elementUrl) => {
        const regex = /(http(s?))\:\/\//gi;
        let absoluteUrl = elementUrl;
        if (!regex.test(elementUrl)) {
            absoluteUrl = `http://${elementUrl}`;
        }
        httpRequest(absoluteUrl, { json: true }, (error, response, body) => {
            if (error) {
                titles.push({url:elementUrl, title: `Error: ${error.host} not found`});
                if (titles.length === count) {
                    requiredHtmlResponse();
                }
            } else {
                var $ = cheerio.load(body);
                var title = $("title");
                titles.push({url:elementUrl, title: (title.html()) || 'No title found'});
                if(titles.length === count) {
                    requiredHtmlResponse();
                }
            }
        }); 
    }

    var path = url.parse(request.url).pathname;

    if(request.method === "GET" && path === '/I/want/title/') {
        var params = url.parse(request.url, true).query;
        if (params.address) {
            
            if (typeof params.address ==='string') {
                crawler(params.address);
                count = 1;
            } else {
                params.address.forEach(element => {
                    count +=1;
                    crawler(element);
                })
            }
        }
        else {
            response.writeHead(404, { 'Content-Type': 'text/html' });
            response.write('404: Address should be there in params');
            response.end();
        }
    } else {
        response.writeHead(404, { 'Content-Type': 'text/html' });
        response.write('404: No support for path you used.');
        response.end();
    }
  }
  
  const server = http.createServer(requestHandler)
  
  server.listen(port, (err) => {
    if (err) {
      return console.log('something bad happened', err)
    }
  
    console.log(`server is listening on ${port}`)
  })