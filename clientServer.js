const express = require("express");
const webclient = require("request");
const { JSDOM } = require("jsdom");
const iconv = require("iconv-lite");
const app = express();


const server = app.listen(3000, async () => {
    console.log(`Node.js is listening to PORT: ${server.address().port}`);

    webclient.post({
        url: "http://timetable.sic.shibaura-it.ac.jp/",
        headers: {
            "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
            //"Content-Type": "text/html; charset=euc-jp",
            encoding: null
        },
        body: null
    }, (err, res, body) => {
        //console.log(body);

        const dom = new JSDOM(iconv.decode(body, "eucjp")),
            window = dom.window,
            document = window.document;
        console.log(document.body.innerHTML);
    });
    
    //const data = await (await fetch("http://timetable.sic.shibaura-it.ac.jp/")).text();
});
