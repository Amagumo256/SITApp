const express = require("express");
const app = express();

const server = app.listen(3000, async () => {
    console.log(`Node.js is listening to PORT: ${server.address().port}`);
});
