"use strict";

const http = require('http')
const url = require("url");
const cheerio = require('cheerio');
const httpRequest = require("request");
const async = require('async');
const fetch = require('node-fetch');
const port = 3000

const requestHandler = (request, response) => {

    const requiredHtmlResponse = (titles) => {
        let innerHtml = '';
        titles.forEach((element) => {
        innerHtml = `${innerHtml}<li>${element.url} -  "${element.title}" </li>`;
        })
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end('<html><body><h1> Following are the titles of given websites: </h1><ul>' + innerHtml +'</ul></body></html>');
        return;
    }
    
    var path = url.parse(request.url).pathname;

    if (request.method === "GET" && path === '/I/want/title/') {
        var params = url.parse(request.url, true).query;
        if (params.address) {
            const urls = [];
            if (typeof params.address ==='string'){
                urls.push(params.address);
            } else {
                params.address.forEach(element => {
                    urls.push(element);
                })
                //
                async.mapLimit(urls, urls.length, async function(elementUrl) {
                    const regex = /(http(s?))\:\/\//gi;
                    if (!regex.test(elementUrl)) {
                        elementUrl = `http://${elementUrl}`;
                    }
                    const response = await fetch(elementUrl);
                    return response.text();
                }, (err, results) => {
                        if (err) throw err
                        let count = 0;
                        const titles= [];
                        results.forEach((data) => {
                            var $ = cheerio.load(data);
                            var title = $("title");
                            titles.push({url:urls[count], title: (title.html()) || 'No title found'})
                            count +=1;
                        });
                        requiredHtmlResponse(titles);
                });
            }
            
        } else {
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