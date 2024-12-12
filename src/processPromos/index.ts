import { Carrito, Cart, CartItem, Promo } from "../interfaces";
import promoAhorro from "./PromoAhorro";
import pilon from "./Pilon";
import pkt from "./PKTAhorre$";
import _ from "lodash";

const processPromos = (
  cart: Cart,
  buy: { [groupID: string]: Array<number> },
  get: { [groupID: string]: Array<number> },
  promos: Array<Promo>,
  validatePromos: boolean,
  maxPromo?: number
) => {
  //Sacar a qué grupo pertenece cada producto, y hacer un diccionario
  const gruposCondicion: { [sku: string]: string[] } = {};
  const gruposPromo: { [sku: string]: string[] } = {};
  for (let _item of cart.original.items) {
    const sku = parseInt(_item.SKU);
    gruposCondicion[_item.SKU] = [];
    for (let _g of Object.keys(buy)) {
      if (buy[_g].includes(sku)) {
        gruposCondicion[_item.SKU].push(_g);
      }
    }

    gruposPromo[_item.SKU] = [];
    for (let _g of Object.keys(get)) {
      if (get[_g].includes(sku)) {
        gruposPromo[_item.SKU].push(_g);
      }
    }
  }

  //Hay productos candidatos para una promoción?
  if (Object.keys(gruposCondicion).length > 0) {
    //Sí, procesar

    //Filtrar las promos, solo las que siguen vigentes
    //eslint-disable-next-line
    const now = new Date().getTime();
    if (validatePromos) {
      promos = promos.filter((x) => isVigente(x, now));
    }

    var auxiliar: Carrito = JSON.parse(JSON.stringify(cart.original));
    /*
     * Ordenar el carrito de menor a mayor precio
     * Porque eso le aplicará la promoción a los de menor precio primero
     */

    auxiliar.items = auxiliar.items.sort(PrecioAsc);

    auxiliar = promoAhorro(
      auxiliar,
      gruposCondicion,
      promos.filter((x) => x.PromoType === "Promo Ahorro")
    );

    auxiliar = pilon(
      auxiliar,
      gruposCondicion,
      gruposPromo,
      promos.filter((x) => x.PromoType === "Pilon")
    );
    let filtrado = _.cloneDeep(auxiliar);

    auxiliar = pkt(
      filtrado,
      gruposCondicion,
      gruposPromo,
      promos.filter((x) => x.PromoType === "PKT Ahorre$"),
      5
    );

    let total = 0;
    let newItems: any[] = [];
    let newCount = 0;
    for (let i of auxiliar.items!) {
      total += i.productPrice * i.quantity;
    }
    auxiliar.total = total;
    cart.final = auxiliar;
    if (cart.final.promos) {
      let newTotal = 0;
      cart.final.items.forEach((item) => {
        newTotal += item.quantity * item.productPrice;
        if (item.quantity > 0) {
          newItems.push(item);
          newCount += item.quantity;
        }
      });
      cart.final.items = newItems;
      cart.final.countItems = newCount;
      cart.final.total = newTotal;
    }
  } else {
    //No hay productos que desencadenen promoción
    cart.final = cart.original;
  }

  return cart;
};

//eslint-disable-next-line
const isVigente = (p: Promo, now: number): boolean => {
  let start = Date.parse(p.Startdate);
  let end = Date.parse(p.Enddate) + 86400000;

  if (now > start && now < end) {
    return true;
  } else {
    return false;
  }
};

const PrecioAsc = (a: CartItem, b: CartItem): number => {
  if (a.productPrice < b.productPrice) {
    return -1;
  }
  if (a.productPrice > b.productPrice) {
    return 1;
  }
  return 0;
};

export default processPromos;
