import _ from "lodash";
import { Carrito, CartItem, Promo } from "../../interfaces";

const pkt = (
  carrito: Carrito,
  skus_y_su_grupo_condicion: { [sku: string]: string[] },
  skus_y_su_grupo_regalo: { [sku: string]: string[] },
  promos: Array<Promo>,
  maxPromo?: number
): Carrito => {
  //Cuántos elementos llevamos de cada grupo_condicion?
  let arr: CustomType[] = [];
  let newItems: any[] = [];
  const gruposQueTraemosBuy: string[] = [];
  const gruposQueTraemosGet: string[] = [];
  let alternItems: any = [];

  for (let item of carrito.items) {
    const b = skus_y_su_grupo_condicion[item.SKU];
    const g = skus_y_su_grupo_regalo[item.SKU];
    arr.push({
      sku: item.SKU,
      groupsBuy: b,
      groupsGet: g,
      qtyInCart: item.quantity,
      withPromo: 0,
      price: item.productPrice,
    });
    gruposQueTraemosBuy.push(...b);
    gruposQueTraemosGet.push(...g);
  }

  const promosQueNosAplican: Promo[] = promos.filter(
    (x) =>
      gruposQueTraemosBuy.includes(x.ProductGroupBuy_ID.toString()) &&
      gruposQueTraemosGet.includes(x.ProductGroupGet_ID.toString())
  );

  //Cuántos van gratis de cada grupo_regalo?
  var appliedPromos: CustomPromo[] = [];
  let promoItems: { [promoType: string]: CartItem[] } = {};
  let promoItemsHelp: { [promoType: string]: CartItem[] } = {};
  const alreadyPromos = [];

  let promocionCartItems: CartItem[] = [];
  for (let p of promosQueNosAplican) {
    const { ProductGroupBuy_ID: buy, ProductGroupGet_ID: get } = p;

    //Dame los productos del carrito que son condición, a partir de su grupo
    let cond = arr.filter((x) => x.groupsBuy.includes(buy.toString()));
    //Suma cuántos traemos
    let traemos = 0;
    for (let _i of cond) {
      traemos += _i.qtyInCart;
    }
    console.log("p", p);
    //Sacar el límite de cuántos podemos regalar
    const lim = Math.trunc(traemos / p.ProductBuy_QTY) * p.ProductGet_QTY;

    //Dame ahora los productos que van gratis, a partir de su grupo
    let promocion = arr.filter((x) => x.groupsGet.includes(get.toString()));
    let regalados = 0;
    let ahorro = 0;
    let spliced = false;
    for (let i = 0; i < promocion.length; i++) {
      const candidato = promocion[i];
      const idxInPromos = promocionCartItems.findIndex(
        (p) => p.SKU === candidato.sku
      );
      if (idxInPromos !== -1) {
        if (
          candidato.qtyInCart === p.ProductBuy_QTY ||
          candidato.qtyInCart % p.ProductBuy_QTY === 0
        ) {
          promocionCartItems = promocionCartItems.filter(
            (p) => p.SKU !== candidato.sku
          );
          appliedPromos = appliedPromos.filter(
            (ap) =>
              ap.getItems[0] &&
              ap.getItems[0].SKU !== candidato.sku &&
              ap.productBuyQTY > p.ProductBuy_QTY
          );
          spliced = true;
        } else {
          spliced = false;
        }
      } else {
        if (candidato.qtyInCart >= p.ProductBuy_QTY) {
          spliced = true;
        } else {
          spliced = false;
        }
      }
      // if (
      //   spliced ||
      //   (idxInPromos === -1 && candidato.qtyInCart === p.ProductBuy_QTY) ||
      //   !p.DiscountAmount_AMT ||
      //   candidato.qtyInCart % p.ProductBuy_QTY === 0
      // ) {
      //Checar que no nos hayamos pasado del límite de regalos
      if (regalados < lim) {
        //Podemos regalar más
        const quedan = lim - regalados;
        let precioCalculado = 0;
        //*Hay diferentes tipos de PKT-Ahorre$
        if (p.DiscountAmount_AMT > 0) {
          //! Promo del tipo 2 x $110
          precioCalculado = p.DiscountAmount_AMT / p.ProductGet_QTY;

          let cant =
            quedan > candidato.qtyInCart ? candidato.qtyInCart : quedan;

          if (quedan < candidato.qtyInCart) {
            //hay algunos que no llevan promo
            //Estos sí llevan
            const ncant =
              Math.ceil(candidato.qtyInCart / p.ProductBuy_QTY) *
              p.ProductGet_QTY;
            // console.log("cant", ncant);
            var helper: CartItem = {
              ...carrito.items.filter((x) => x.SKU === candidato.sku)[0],
              productPrice: precioCalculado,
              quantity: ncant,
              hasPromo: true,
              Price: candidato.price,
              isPromoItem: true,
            };
            if (
              precioCalculado <
              carrito.items.filter((x) => x.SKU === candidato.sku)[0]
                .productPrice
            ) {
              helper.isGetItem = true;
            }
            regalados += ncant;
            let thisSavings =
              candidato.price * candidato.qtyInCart - precioCalculado * ncant;
            thisSavings -= candidato.price * (candidato.qtyInCart - ncant);
            ahorro += thisSavings;
            promocionCartItems.push(helper);

            if (promoItems[`${p.PromoDescr}`]) {
              promoItems[`${p.PromoDescr}`].push(helper);
            } else {
              promoItems[`${p.PromoDescr}`] = [helper];
            }

            //Estos no llevan
            //eslint-disable-next-line
            var helper2: CartItem = {
              ...carrito.items.filter((x) => x.SKU === candidato.sku)[0],
              quantity:
                candidato.qtyInCart - ncant > 0
                  ? candidato.qtyInCart - ncant
                  : 1,
              isGetItem: true,
              hasPromo: true,
              Price: candidato.price,
            };

            if (promoItems[`${p.PromoDescr}`]) {
              promoItems[`${p.PromoDescr}`].push(helper2);
            } else {
              promoItems[`${p.PromoDescr}`] = [helper2];
            }
            alreadyPromos.push(p);
            promocionCartItems.push(helper2);
          } else {
            // -Todos llevan promo
            //eslint-disable-next-line
            var helper: CartItem = {
              ...carrito.items.filter((x) => x.SKU === candidato.sku)[0],
              productPrice: precioCalculado,
              quantity: candidato.qtyInCart,
              hasPromo: true,
              Price: candidato.price,
              isPromoItem: true,
            };
            if (
              precioCalculado <
              carrito.items.filter((x) => x.SKU === candidato.sku)[0]
                .productPrice
            ) {
              helper.isGetItem = true;
            }

            regalados += candidato.qtyInCart;
            let thisSavings =
              candidato.price * candidato.qtyInCart -
              precioCalculado * candidato.qtyInCart;
            ahorro += thisSavings;
            promocionCartItems.push(helper);
            alreadyPromos.push(p);

            if (promoItems[`${p.PromoDescr}`]) {
              promoItems[`${p.PromoDescr}`].push(helper);
            } else {
              promoItems[`${p.PromoDescr}`] = [helper];
            }
          }
        } else {
          //De estos otros tipos de promo, el algoritmo es el mismo, solo cambia el cálculo del precio
          precioCalculado = candidato.price * (p.Saving_AMT / 100);
          console.log("quedna", quedan);
          console.log("cQTY", candidato.qtyInCart);
          if (quedan < candidato.qtyInCart) {
            //hay algunos que no llevan promo
            //Estos sí llevan
            //eslint-disable-next-line
            const ncant =
              Math.ceil(candidato.qtyInCart / p.ProductBuy_QTY) *
              p.ProductGet_QTY;
            var helper: CartItem = {
              ...carrito.items.filter((x) => x.SKU === candidato.sku)[0],
              productPrice: precioCalculado,
              quantity: ncant,
              hasPromo: true,
              Price: candidato.price,
              isPromoItem: true,
            };
            // console.log("helper", helper);

            if (
              precioCalculado <
              carrito.items.filter((x) => x.SKU === candidato.sku)[0]
                .productPrice
            ) {
              helper.isGetItem = true;
            }

            regalados += ncant;
            let thisSavings =
              precioCalculado > 0
                ? precioCalculado * ncant
                : candidato.price * ncant;
            ahorro += thisSavings;
            promocionCartItems.push(helper);

            if (promoItems[`${p.PromoDescr}`]) {
              promoItems[`${p.PromoDescr}`].push(helper);
            } else {
              promoItems[`${p.PromoDescr}`] = [helper];
            }

            //Estos no llevan
            //eslint-disable-next-line
            var helper2: CartItem = {
              ...carrito.items.filter((x) => x.SKU === candidato.sku)[0],
              quantity:
                candidato.qtyInCart - ncant > 0
                  ? candidato.qtyInCart - ncant
                  : 1,
              isGetItem: true,
              hasPromo: true,
              Price: candidato.price,
            };

            // console.log("helper2", helper2);
            if (promoItems[`${p.PromoDescr}`]) {
              promoItems[`${p.PromoDescr}`].push(helper2);
            } else {
              promoItems[`${p.PromoDescr}`] = [helper2];
            }
            alreadyPromos.push(p);
            promocionCartItems.push(helper2);
          } else {
            // -Todos llevan promo
            const ncant = candidato.qtyInCart;
            console.log("todos llevan promo", ncant);
            //eslint-disable-next-line
            var helper: CartItem = {
              ...carrito.items.filter((x) => x.SKU === candidato.sku)[0],
              productPrice: precioCalculado,
              quantity: ncant,
              hasPromo: true,
              Price: candidato.price,
              isPromoItem: true,
            };

            // console.log("helper todos", helper);
            if (
              precioCalculado <
              carrito.items.filter((x) => x.SKU === candidato.sku)[0]
                .productPrice
            ) {
              helper.isGetItem = true;
            }

            regalados += ncant;
            let thisSavings =
              precioCalculado > 0
                ? precioCalculado * ncant
                : candidato.price * ncant;
            ahorro += thisSavings;
            promocionCartItems.push(helper);
            alreadyPromos.push(p);
            if (promoItems[`${p.PromoDescr}`]) {
              promoItems[`${p.PromoDescr}`].push(helper);
            } else {
              promoItems[`${p.PromoDescr}`] = [helper];
            }
          }
        }
      } else {
        //Se queda al precio original

        //eslint-disable-next-line
        var helper: CartItem = {
          ...carrito.items.filter((x) => x.SKU === candidato.sku)[0],
          productPrice: candidato.price,
          quantity: candidato.qtyInCart,
          Price: candidato.price,
          hasPromo: true,
        };
        // console.log("original", helper);

        //Checar que no esté ya porque el item se repite en otra promoción
        //eslint-disable-next-line
        let idx = promocionCartItems.findIndex(
          (i) =>
            i.SKU === helper.SKU &&
            i.productPrice === helper.productPrice &&
            i.quantity === helper.quantity
        );
        if (idx === -1) {
          promocionCartItems.push(helper);
          if (promoItemsHelp[`${p.PromoDescr}`]) {
            promoItemsHelp[`${p.PromoDescr}`].push(helper);
          } else {
            promoItemsHelp[`${p.PromoDescr}`] = [helper];
          }
        }
      }
      // }
    }

    let getskus: string[] = [];

    if (promoItems[`${p.PromoDescr}`]) {
      getskus = promoItems[`${p.PromoDescr}`].map((_c) => _c.SKU);
    }
    if (promoItemsHelp[`${p.PromoDescr}`]) {
      getskus = getskus.concat(
        promoItemsHelp[`${p.PromoDescr}`].map((_c) => _c.SKU)
      );
    }

    const getItems = promoItems[`${p.PromoDescr}`]
      ? promoItemsHelp[`${p.PromoDescr}`]
        ? promoItems[`${p.PromoDescr}`].concat(
            promoItemsHelp[`${p.PromoDescr}`]
          )
        : promoItems[`${p.PromoDescr}`]
      : [];
    // console.log("gI", getItems);

    //Armar appliedpromos en base a los items actualizados con precios de promo
    getItems.forEach((gI) => {
      let existAlreadyP = false;
      let inCand = promocion.find((ca) => ca.sku === gI.SKU);
      if (inCand.price !== gI.productPrice) {
        // console.log("Aquí hubo una promoción");
        let ahorro = 0;
        if (p.DiscountAmount_AMT > 0) {
          ahorro =
            inCand.price * inCand.qtyInCart - gI.productPrice * gI.quantity;
        } else {
          ahorro =
            gI.productPrice === 0
              ? inCand.price * gI.quantity
              : gI.productPrice * gI.quantity;
        }
        // console.log("Con ahorro", ahorro, " ", gI.productName);
        let items: any[] = [];
        if (inCand.qtyInCart - gI.quantity <= 0) {
          let already = appliedPromos.find((p) => {
            let alrItem = p.getItems.find(
              (i) => i.SKU === inCand.sku && i.quantity === i.quantity
            );
            return alrItem !== undefined;
          });
          if (already !== undefined) {
            existAlreadyP = true;
          }
          items = getItems.filter((i) => {
            let gbuy = skus_y_su_grupo_condicion[i.SKU];
            let gget = skus_y_su_grupo_regalo[i.SKU];
            if (p.DiscountAmount_AMT > 0) {
              return (
                _.isEqual(inCand.groupsBuy, gbuy) &&
                _.isEqual(inCand.groupsGet, gget) &&
                i.alternPrice !== i.productPrice
              );
            } else {
              return (
                _.isEqual(inCand.groupsBuy, gbuy) &&
                _.isEqual(inCand.groupsGet, gget)
              );
            }
          });
          alternItems = alternItems.concat(
            getItems.filter((i) => {
              let gbuy = skus_y_su_grupo_condicion[i.SKU];
              let gget = skus_y_su_grupo_regalo[i.SKU];
              return (
                _.isEqual(inCand.groupsBuy, gbuy) &&
                _.isEqual(inCand.groupsGet, gget) &&
                i.alternPrice === i.productPrice
              );
            })
          );
          if (!existAlreadyP) {
            newItems = newItems.concat(getItems);
          }
        } else {
          items.push(gI);
          let newI = carrito.items.find((c) => c.SKU === gI.SKU);
          newI.quantity = inCand.qtyInCart - gI.quantity;
          items.push(newI);
          newItems = newItems.concat([gI, newI]);
        }
        const id = `${p.PromoDescr}${gI.SKU}`;
        console.log(gI);
        console.log(ahorro);
        if (ahorro > 0 && !existAlreadyP) {
          if (p.DiscountAmount_AMT > 0 && items.length > 1) {
            let added = 0;
            items.forEach((i: CartItem) => {
              if (
                i.quantity !== p.ProductBuy_QTY &&
                i.quantity % p.ProductBuy_QTY !== 0
              ) {
                added++;
              } else {
                const ahorro =
                  i.alternPrice * i.quantity - i.productPrice * i.quantity;
                appliedPromos.push({
                  tag: p.PromoDescr,
                  DiscountAmount_AMT: p.DiscountAmount_AMT,
                  id: id,
                  promoType: "PKT Ahorre$",
                  // condItems: condCartItems,
                  condItems: [],
                  getItems: [i],
                  productBuyQTY: p.ProductBuy_QTY,
                  productGetQTY: p.ProductGet_QTY,
                  getSKUs: getskus,
                  savings: ahorro,
                  offer_id: p.PromoId,
                  ChargebackDept: p.ChargebackDept,
                });
              }
            });
            if (added === items.length) {
              appliedPromos.push({
                tag: p.PromoDescr,
                DiscountAmount_AMT: p.DiscountAmount_AMT,
                id: id,
                promoType: "PKT Ahorre$",
                // condItems: condCartItems,
                condItems: [],
                getItems: items,
                productBuyQTY: p.ProductBuy_QTY,
                productGetQTY: p.ProductGet_QTY,
                getSKUs: getskus,
                savings: ahorro,
                offer_id: p.PromoId,
                ChargebackDept: p.ChargebackDept,
              });
            }
          } else {
            console.log("aqui agrega", items);
            appliedPromos.push({
              tag: p.PromoDescr,
              DiscountAmount_AMT: p.DiscountAmount_AMT,
              id: id,
              promoType: "PKT Ahorre$",
              // condItems: condCartItems,
              condItems: [],
              getItems: items,
              productBuyQTY: p.ProductBuy_QTY,
              productGetQTY: p.ProductGet_QTY,
              getSKUs: getskus,
              savings: ahorro,
              offer_id: p.PromoId,
              ChargebackDept: p.ChargebackDept,
            });
          }
        }
      }
    });
  }
  // }

  // appliedPromos.forEach((promo, indx) => {
  //   let inPromoQTY = 0;
  //   promo.getItems.forEach((item) => {
  //     inPromoQTY += item.quantity;
  //   });
  //   if (promo && promo.productBuyQTY && inPromoQTY > promo.productBuyQTY) {
  //     let freeItem = promo.getItems.find((item) => item.productPrice === 0);
  //     if (freeItem) {
  //       let FreeItem = freeItem as CartItem;
  //       let idx = promo.getItems.findIndex((item) => item.SKU !== FreeItem.SKU);
  //       if (idx !== -1) {
  //         promo.getItems.splice(idx, 1);
  //       }
  //     }
  //   }
  // });

  //Armar de nuevo el carrito
  var newCarrito: Carrito = JSON.parse(JSON.stringify(carrito));

  //Rescatar las promos viejas (de los otros procesadores de promos)
  newCarrito.promos = newCarrito.promos === undefined ? [] : newCarrito.promos;

  let extrapromos = appliedPromos.map((i) => {
    return {
      tag: i.tag,
      id: i.id,
      savings: i.savings,
      promoType: i.promoType,
      productBuyQTY: i.productBuyQTY,
      productGetQTY: i.productGetQTY,
      DiscountAmount_AMT: i.DiscountAmount_AMT,
      items: [...i.condItems, ...i.getItems],
      offer_id: i.offer_id,
      ChargebackDept: i.ChargebackDept,
    };
  });

  newCarrito.promos = [...newCarrito.promos!, ...extrapromos];
  newCarrito.items = newItems;
  newCarrito.items.concat(newCarrito.items, alternItems);

  return newCarrito;
};

interface CustomType {
  sku: string;
  qtyInCart: number;
  groupsBuy: string[];
  groupsGet: string[];
  withPromo: number;
  price: number;
}

interface CustomPromo {
  id?: string;
  tag: string; // "Por cada 100 ahorra 25"
  savings: number;
  promoType: string;
  condItems: CartItem[];
  productBuyQTY?: number;
  productGetQTY?: number;
  offer_id?: number;
  ChargebackDept?: number;
  DiscountAmount_AMT?: number;
  getItems: CartItem[];
  getSKUs: string[];
}

export default pkt;
