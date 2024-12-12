import { Carrito, Cart, CartItem, Promo } from "../interfaces";
import _ from "lodash";

const processPromos = (
  cart: Cart,
  buy: { [groupID: string]: Array<number> },
  get: { [groupID: string]: Array<number> },
  promos: Array<Promo>,
  validatePromos: boolean,
  maxPromo?: number
) => {
  
};

export default processPromos;
