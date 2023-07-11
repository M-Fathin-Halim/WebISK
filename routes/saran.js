const { WebhookClient } = require("discord.js");
const express = require("express");

const app = express.Router();

const webhookSaran = {
  saranDiscord: new WebhookClient({ url: process.env.WEBHOOK_SARAN_DISCORD }),
  saranYoutube: new WebhookClient({ url: process.env.WEBHOOK_SARAN_YOUTUBE }),
  saranWebsite: new WebhookClient({ url: process.env.WEBHOOK_SARAN_WEBSITE }),
}

function homeCtrl(req, res) {
  res.render("saran", { title: "Saran", webhookSaran, success: req.success || false, err: req.err || "" });
}

function postCtrl(req, res, next) {
  const jenis = req.body.jenis;
  const name = req.body.nama || "Seseorang";
  const saran = req.body.saran;

  if (!jenis) {
    req.err = "jenis kosong"
    return next()
  }

  const webhook =
    jenis == "discord"
      ? webhookSaran.saranDiscord
      : jenis == "youtube"
      ? webhookSaran.saranYoutube
      : jenis == "website"
      ? webhookSaran.saranWebsite
      : undefined;

  if (!webhook) {
    req.err = `no webhook ${jenis}`;
    return next();
  }

  if (!saran) {
    req.err = "saran kosong"
    return next()
  }

  webhook
    .send({ username: name, content: saran })
    .then(() => {
      req.success = true;
      next();
    })
    .catch((e) => {
      console.error("Cannot send suggest to discord", e);
      req.err = "cannot send";
      next();
    });
}
app.get("/", homeCtrl);

app.post("/", postCtrl, homeCtrl);

module.exports = app;