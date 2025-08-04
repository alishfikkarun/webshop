require("dotenv").config();
const { Router } = require("express");
const path = require("path"); // <---- добавляем path
const app = require("./config/express")();
const { Telegraf } = require("telegraf");
const { loader, sleep } = require("./utils");
const { commands } = require("./utils/telegrafProto");
const ws = require("./webSocket");

const bot = new Telegraf(process.env.BOT_ID);

// typeof ws === "function" && ws(app, bot);

loader({ path: "./commands", type: "Bot command" }, bot);
loader(
  { path: "./controllers", type: "Express controller" },
  bot,
  (moduleName) => {
    const router = Router();
    app.use(`/api/${moduleName}`, router);
    return router;
  }
);

bot.telegram.setMyCommands(commands);

bot.use(async (ctx, next) => {
  await next();
});

bot.on("pre_checkout_query", async (ctx, test) => {
  await ctx.answerPreCheckoutQuery(true);
});

bot.catch(console.log);
bot.launch();

// Раздаём фронтенд
app.use(require("express").static(path.join(__dirname, "../client/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});

app.listen(4000, "0.0.0.0", () => {
  console.log("Server is running on http://0.0.0.0:4000");
});
