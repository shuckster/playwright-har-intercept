const Koa = require("koa");
const serve = require("koa-static");

// Server
const SERVER_PORT = 4762;
const app = new Koa();
app.use(serve("./www"));
app.listen(SERVER_PORT);
