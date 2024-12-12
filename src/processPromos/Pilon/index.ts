import { Carrito, CartItem, Promo } from "../../interfaces";

const pilon = (
  carrito: Carrito,
  skus_y_su_grupo_condicion: { [sku: string]: string[] },
  skus_y_su_grupo_regalo: { [sku: string]: string[] },
  promos: Array<Promo>
): Carrito => {
  //Cuántos elementos llevamos de cada grupo_condicion?
  let arr: CustomType[] = [];
  const gruposQueTraemosBuy: string[] = [];
  const gruposQueTraemosGet: string[] = [];

  for (let item of carrito.items) {
    const b = skus_y_su_grupo_condicion[item.SKU];
    const g = skus_y_su_grupo_regalo[item.SKU];
    arr.push({
      sku: item.SKU,
      groupsBuy: b,
      groupsGet: g,
      qtyInCart: item.quantity,
      free: 0,
      price: item.productPrice,
    });
    gruposQueTraemosBuy.push(...b);
    gruposQueTraemosGet.push(...g);
  }

  const promosQueNosAplican = promos.filter(
    (x) =>
      gruposQueTraemosBuy.includes(x.ProductGroupBuy_ID.toString()) &&
      gruposQueTraemosGet.includes(x.ProductGroupGet_ID.toString())
  );

  //Cuántos van gratis de cada grupo_regalo?
  var appliedPromos: CustomPromo[] = [];
  for (let p of promosQueNosAplican) {
    const { ProductGroupBuy_ID: buy, ProductGroupGet_ID: get } = p;

    //Dame los productos del carrito que son condición, a partir de su grupo
    let cond = arr.filter((x) => x.groupsBuy.includes(buy.toString()));
    //Suma cuántos traemos
    let traemos = 0;
    for (let _i of cond) {
      traemos += _i.qtyInCart;
    }

    //Sacar el límite de cuántos podemos regalar
    const lim = Math.ceil(traemos / p.ProductBuy_QTY) * p.ProductGet_QTY;

    //Dame ahora los productos que van gratis, a partir de su grupo
    const promocionCartItems: CartItem[] = [];
    let promocion = arr.filter((x) => x.groupsGet.includes(get.toString()));
    let regalados = 0;
    let ahorro = 0;
    for (let candidato of promocion) {
      // console.log(candidato);
      if (regalados < lim) {
        //Podemos regalar más
        const diff = lim - regalados;
        if (candidato.qtyInCart <= diff) {
          //Podemos regalar todos
          candidato.free = candidato.qtyInCart;
          regalados += candidato.qtyInCart;
          ahorro += candidato.price * candidato.qtyInCart;
          var helper: CartItem = {
            ...carrito.items.filter((x) => x.SKU === candidato.sku)[0],
            productPrice: 0,
            Price: candidato.price,
            quantity: candidato.qtyInCart,
            isPromoItem: true,
          };
          promocionCartItems.push(helper);
        } else {
          //solo podemos regalar algunos
          candidato.free = diff;
          regalados += diff;
          ahorro += candidato.price * diff;
          //eslint-disable-next-line
          var helper: CartItem = {
            ...carrito.items.filter((x) => x.SKU === candidato.sku)[0],
            productPrice: 0,
            Price: candidato.price,
            quantity: diff,
            isPromoItem: true,
          };
          promocionCartItems.push(helper);
        }
      }
    }

    let condCartItems = cond.map((_c) => {
      return carrito.items.filter((x) => x.SKU === _c.sku)[0];
    });

    let newCond: any = [];
    condCartItems.forEach((_c) => {
      if (_c.quantity === p.ProductBuy_QTY) {
        let already = newCond.find(
          (x: any) => x.SKU !== _c.SKU && x.quantity === p.ProductBuy_QTY
        );
        if (!already) {
          newCond.push(_c);
        }
      }
    });
    // condCartItems = [...newCond];

    const getskus = promocionCartItems.map((_c) => {
      return _c.SKU;
    });

    appliedPromos.push({
      tag: p.PromoDescr,
      promoType: "Pilón",
      promoDescr: p.PromoDescr,
      condItems: condCartItems,
      productBuyQTY: p.ProductBuy_QTY,
      productGetQTY: p.ProductGet_QTY,
      getItems: promocionCartItems,
      getSKUs: getskus,
      savings: ahorro,
      offer_id: p.PromoId,
      ChargebackDept: p.ChargebackDept,
    });
  }

  //Armar de nuevo el carrito
  var newCarrito: Carrito = JSON.parse(JSON.stringify(carrito));
  var newItems: CartItem[] = [];
  //eslint-disable-next-line
  var ahorro = 0;
  for (let i of newCarrito!.items) {
    const partida = arr.filter((x) => x.sku === i.SKU)[0];

    if (partida.free > 0) {
      if (partida.qtyInCart === partida.free) {
        //La partida entera es gratis
        //eslint-disable-next-line
        ahorro += partida.qtyInCart * i.productPrice;
        newItems.push({
          ...i,
          productPrice: 0,
          Price: i.productPrice,
          hasPromo: true,
        });
      } else {
        //La partida es PARCIALMENTE gratis
        //eslint-disable-next-line
        ahorro += partida.free * i.productPrice;
        newItems.push({
          ...i,
          quantity: partida.free,
          Price: i.productPrice,
          productPrice: 0,
          hasPromo: true,
        });
        newItems.push({
          ...i,
          quantity: partida.qtyInCart - partida.free,
        });
      }
    } else {
      //No hay gratis, agregar todos a precio normal
      newItems.push({
        ...i,
        Price: i.productPrice,
        quantity: partida.qtyInCart,
      });
    }
  }

  //Rescatar las promos viejas (de los otros procesadores de promos)
  newCarrito.promos = newCarrito.promos === undefined ? [] : newCarrito.promos;

  let extrapromos = appliedPromos.map((i) => {
    return {
      tag: i.tag,
      savings: i.savings,
      promoType: i.promoType,
      promoDescr: i.promoDescr,
      items: [...i.condItems, ...i.getItems],
      productBuyQTY: i.productBuyQTY,
      productGetQTY: i.productGetQTY,
      offer_id: i.offer_id,
      ChargebackDept: i.ChargebackDept,
    };
  });

  newCarrito.promos = [...newCarrito.promos!, ...extrapromos];
  newCarrito.items = newItems;

  return newCarrito;
};

interface CustomType {
  sku: string;
  qtyInCart: number;
  groupsBuy: string[];
  groupsGet: string[];
  free: number;
  price: number;
}

interface CustomPromo {
  tag: string; // "Por cada 100 ahorra 25"
  savings: number;
  promoType: string;
  condItems: CartItem[];
  productBuyQTY?: number;
  productGetQTY?: number;
  promoDescr?: string;
  getItems: CartItem[];
  offer_id?: number;
  ChargebackDept?: number;
  getSKUs: string[];
}

export default pilon;
