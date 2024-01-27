const Koa = require("koa");
const serve = require("koa-static");

// Server
const SERVER_PORT = 4762;
const app = new Koa();
console.log(`Server listening on port http://localhost:${SERVER_PORT}`);
app.use(serve("./www"));
app.listen(SERVER_PORT);
