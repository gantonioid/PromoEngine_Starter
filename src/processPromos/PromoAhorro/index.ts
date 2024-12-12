/*
 *   PROMO AHORRO
 *   Por cada X, ahorra Y
 */

import { AppliedPromo, Carrito, CartItem, Promo } from "../../interfaces";

const promoAhorro = (
  carrito: Carrito,
  skus_y_su_grupo: { [sku: string]: string[] },
  promos: Array<Promo>
): Carrito => {
  //Cuánto llevamos de $ por cada grupo?
  let grupos: CustomType = {};

  for (let sku of Object.keys(skus_y_su_grupo)) {
    const gpos = skus_y_su_grupo[sku];
    for (let grp of gpos) {
      if (grupos[grp] === undefined) {
        grupos[grp] = {
          dinero: 0,
          descuento_amt: 0,
          vecesQueAplica: 0,
          skus: [],
        };
      }

      let partida = carrito.items.filter((x) => x.SKU === sku)[0];
      if (partida) {
        grupos[grp].dinero += partida.quantity * partida.productPrice;
        grupos[grp].skus.push(sku);
      }
    }
  }

  //Cuánto hay que descontar por cada grupo?
  var appliedPromos: AppliedPromo[] = [];
  for (let g of Object.keys(grupos)) {
    const g_int = parseInt(g);
    //recuperar la promo
    const promo = promos.filter((x) => x.ProductGroupBuy_ID === g_int)[0];
    if (promo !== undefined) {
      const buyAMT = promo.BuyAmount_AMT;
      const getAMT = promo.DiscountAmount_AMT;

      const vecesQueAplicaLaPromo = grupos[g].dinero / buyAMT;
      if (vecesQueAplicaLaPromo > 0) {
        grupos[g].vecesQueAplica = vecesQueAplicaLaPromo;
        grupos[g].descuento_amt = Math.trunc(vecesQueAplicaLaPromo) * getAMT;

        //Meterlo a appliedPromos para luego asignárselo al campo de 'Cart.promos'
        appliedPromos.push({
          tag: promo.PromoType_Tag,
          promoType: "PromoAhorro",
          items: grupos[g].skus,
          productBuyQTY: promo.BuyAmount_AMT,
          savings: grupos[g].descuento_amt,
          pASavingQty: getAMT,
          offer_id: promo.PromoId,
          ChargebackDept: promo.ChargebackDept,
        });
      }
    }
  }

  //Armar de nuevo el carrito
  var newCarrito: Carrito = JSON.parse(JSON.stringify(carrito));
  for (let i of newCarrito!.items) {
    if (skus_y_su_grupo[i.SKU] !== undefined) {
      const gruposDelProducto = skus_y_su_grupo[i.SKU];
      //cuanto de descuento le toca a esta partida?
      const totalPartida = i.productPrice * i.quantity;
      for (let grupo of gruposDelProducto) {
        if (grupos[grupo]) {
          const totalGrupo = grupos[grupo].dinero;

          // Del total descontado, a esta partida le corresponde un porcentaje debido a su contribución para alcanzar el requisito
          const porcentaje = totalPartida / totalGrupo;

          // Esto es el monto a descontar, que se va a distribuir entre la cantidad de productos que trae esta partida, bajando el precio unitario
          const descuento = grupos[grupo].descuento_amt * porcentaje;
          i.Price = i.productPrice;
          i.productPrice = (totalPartida - descuento) / i.quantity;
          i.hasPromo = true;
          if (descuento) {
            i.isPromoItem = true;
          }
        }
      }
    }
  }

  for (let promo of appliedPromos) {
    let arr: CartItem[] = [];
    for (let item of promo.items) {
      //Son strings (skus)... convertir a CartItems
      arr.push(newCarrito.items.filter((x) => x.SKU === (item as string))[0]);
    }
    promo.items = arr;
  }

  newCarrito.promos = appliedPromos;

  return newCarrito as Carrito;
};

interface CustomType {
  [key: string]: GRP_P;
}

interface GRP_P {
  dinero: number;
  descuento_amt: number;
  vecesQueAplica: number;
  skus: string[];
}

export default promoAhorro;
