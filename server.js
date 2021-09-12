const express = require("express");
const fs = require("fs");
const app = express();

const server = app.listen(3000, async () => {
    console.log(`Node.js is listening to PORT: ${server.address().port}`);
});

server.get("/", (request, response) => {
    console.log("requested:", request);

    let data;
    try {
        data = fs.readFileSync(request.address);
    } catch(e) {
        return response.status(404).send();
    }
    response.status(200).send(data);
});
