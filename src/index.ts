import express from "express";
import { PromoGroups, Promo, Cart } from "./interfaces";
import fs from "fs";
import processPromos from "./processPromos";
import _ from "lodash";

const app = express();
const port = 4000;

app.get("/promos", async (req, res) => {
  console.log("Leyendo archivos");
  let rawdataCart = fs.readFileSync(`${__dirname}/testCart.json`);
  let rawdataGroups = fs.readFileSync(`${__dirname}/promoGroups.json`);
  let rawdataPromos = fs.readFileSync(`${__dirname}/promos.json`);
  let promoGroups: PromoGroups = JSON.parse(rawdataGroups.toString());
  let promos: Promo[] = JSON.parse(rawdataPromos.toString());
  let cart: Cart = JSON.parse(rawdataCart.toString());
  let processRes = processPromos(
    cart,
    promoGroups.Buy,
    promoGroups.Get,
    promos,
    true,
    5
  );
  res.send(`<pre>${JSON.stringify(processRes, null, 4)}</pre>`);
});

app.listen(port, () => console.log(`Running on port ${port}`));
