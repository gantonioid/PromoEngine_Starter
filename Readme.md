# Build a Promo Engine

An ecommerce website wants to implement a new feature related to promos in their website. Make an algorithm that can handle promos to the user’s shopping cart.

All of the promos operate based on [promo groups](./sample/promoGroups.json) and [promo configurations](./sample/promos.json)

## Promo Types

### Pilón
If you buy dishwasher soap, you get a sponge for free

This promo has `"PromoType": "Pilon"`
Promo settings are:
```json
{
    "BuyAmount_AMT": 0,
    "ChargebackDept": 123,
    "DiscountAmount_AMT": 0,
    "EndDateNumber": 0,
    "Enddate": "2025-06-16T00:00:00",
    "Priority": 100,
    "ProductBuy_QTY": 1,
    "ProductGet_QTY": 1,
    "ProductGroupBuy_ID": 757186,
    "ProductGroupGet_ID": 757187,
    "PromoDescr": "TINTE PARA EL CABELLO DE DAMA EN CAJA O SPRAY REGALA CREMA CORPORAL LIQUIDA DE 400 ML",
    "PromoId": 441026,
    "PromoType": "Pilon",
    "PromoType_Tag": "Pilón Variedad",
    "RegularPrice_AMT": 0,
    "SalePrice_AMT": 0,
    "Saving_AMT": 0,
    "StartDateNumber": 0,
    "Startdate": "2022-06-02T00:00:00",
    "Subpriority": 1,
    "store_id": 2920
}
```
Interpretation: Buy `ProductBuy_QTY` items of group `ProductGroupBuy_ID` and get `ProductGet_QTY` items of group `ProductGroupGet_ID` for free

### Promo Ahorro
For every $x.xx spent, get a $y.yy discount

Examples:
- For every $100 save $25

This promo has `"PromoType": "Promo Ahorro"`
Promo settings are:
```json
{
    "BuyAmount_AMT": 100,
    "ChargebackDept": 1473,
    "DiscountAmount_AMT": 25,
    "EndDateNumber": 0,
    "Enddate": "2025-06-16T00:00:00",
    "Priority": 100,
    "ProductBuy_QTY": 0,
    "ProductGet_QTY": 0,
    "ProductGroupBuy_ID": 757184,
    "ProductGroupGet_ID": 757184,
    "PromoDescr": "APARATOS ELECTRICOS PARA EL PEINADO DEL CABELLO",
    "PromoId": 441025,
    "PromoType": "Promo Ahorro",
    "PromoType_Tag": "Por cada $100 ahorra $25",
    "RegularPrice_AMT": 0,
    "SalePrice_AMT": 0,
    "Saving_AMT": 0,
    "StartDateNumber": 0,
    "Startdate": "2022-06-02T00:00:00",
    "Subpriority": 6,
    "store_id": 2920
}
```

Interpretation: for every `BuyAmount_AMT` you buy from items of the group `ProductGroupBuy_ID`, you get a discount of `DiscountAmount_AMT`, this amount you should deduct it evenly from items of `ProductGroupGet` (usually the same group)

### PKT Ahorre$
Buy N items for some $

Examples:
- 2 x $25.00
- 6 x $54.00

This promo has `"PromoType": "PKT Ahorre$"`
Promo settings are:
#### N x M
```json
{
    "BuyAmount_AMT": 0,
    "ChargebackDept": 1979,
    "DiscountAmount_AMT": 0,
    "EndDateNumber": 0,
    "Enddate": "2025-06-09T00:00:00",
    "Priority": 100,
    "ProductBuy_QTY": 4,
    "ProductGet_QTY": 1,
    "ProductGroupBuy_ID": 757192,
    "ProductGroupGet_ID": 757193,
    "PromoDescr": "TODOS LOS ELECTROLITOS ORALES",
    "PromoId": 441029,
    "PromoType": "PKT Ahorre$",
    "PromoType_Tag": "4 x 3",
    "RegularPrice_AMT": 0,
    "SalePrice_AMT": 0,
    "Saving_AMT": 0,
    "StartDateNumber": 0,
    "Startdate": "2022-06-02T00:00:00",
    "Subpriority": 3,
    "store_id": 2920
}
```

Interpretation: If you're getting `ProductBuy_QTY` items of group `ProductGroupBuy_ID`, you pay only for `ProductBuy_QTY - ProductGet_QTY` items of group `ProductGroupGet_ID`... that is if your cart has 4, you only pay for 3

#### N x $
```json
{
    "BuyAmount_AMT": 0,
    "ChargebackDept": 124,
    "DiscountAmount_AMT": 119,
    "EndDateNumber": 0,
    "Enddate": "2025-06-09T00:00:00",
    "Priority": 100,
    "ProductBuy_QTY": 2,
    "ProductGet_QTY": 2,
    "ProductGroupBuy_ID": 757250,
    "ProductGroupGet_ID": 757251,
    "PromoDescr": "PKT Ahorres 2 x $119.00",
    "PromoId": 441058,
    "PromoType": "PKT Ahorre$",
    "PromoType_Tag": "2 x $119.00",
    "RegularPrice_AMT": 0,
    "SalePrice_AMT": 0,
    "Saving_AMT": 0,
    "StartDateNumber": 0,
    "Startdate": "2022-06-02T00:00:00",
    "Subpriority": 2,
    "store_id": 2920
}
````

Interpretation: If you're getting `ProductBuy_QTY` items of group `ProductGroupBuy_ID`, you get `ProductGet_QTY` items of group `ProductGroupGet_ID` paying only `DiscountAmount_AMT`