export interface ProdBy {
  productos: any[];
  name: string;
  parentName: string;
  type: "Pasillo" | "Categoría" | "Subcategoria" | "Brand";
}

export interface Promos {
  [storeID: string]: Promo[];
}

export interface Promo {
  BuyAmount_AMT: number;
  DiscountAmount_AMT: number;
  EndDateNumber: number;
  Enddate: string;
  Priority: number;
  ProductBuy_QTY: number;
  ProductGet_QTY: number;
  ProductGroupBuy_ID: number;
  ProductGroupGet_ID: number;
  PromoDescr: string;
  PromoId: number;
  PromoType: string;
  PromoType_Tag: string;
  RegularPrice_AMT: number;
  SalePrice_AMT: number;
  ChargebackDept?: number;
  Saving_AMT: number;
  StartDateNumber: number;
  Startdate: string;
  Subpriority: number;
  store_id: number;
}

export interface PromoStoreProds {
  [storeId: string]: PromoProds;
}

export interface PromoProds {
  [promoType: string]: PromoProd;
}

export interface PromoProd {
  PromoType: string;
  Promotions: Promotion[];
}

export interface Promotion {
  products?: Product[];
  ProductGet?: Product[];
  ProductBuy?: Product[];
  ProductBuy_QTY?: number;
  ProductGet_QTY?: number;
  Saving_AMT?: number;
  PromoType_Tag: string;
  EndDate: number;
  StartDate: number;
  BuyAmount_AMT: number;
  DiscountAmount_AMT: number;
  PromoDescr: string;
}

export interface PromoGroups {
  Buy: PromoGroup;
  Get: PromoGroup;
}
export interface PromoGroup {
  [groupID: string]: number[];
}

export interface Catalog {
  [productId: string]: Product; // productId = UPC
}

export interface Product {
  Cat_Site: string;
  Brand: string;
  Cover: ProductCover;
  Dep_site: string;
  Description: string;
  Hierarchy_ID: string;
  Precios: Price;
  Image_original: string;
  Name: string;
  SKU: number;
  Subcat_Site: string;
  UOM: string;
  UPC: string;
  Weight_Each: number;
}
export interface ProductCover {
  bg: string;
  md: string;
  sm: string;
}
export interface Price {
  [key: number]: {
    Price: number;
    PriceDueDate?: string;
    QTY: number;
    Regular_Price: number;
    SKU: number;
    Store_ID: number;
  };
}
export interface ProductPrice {
  Nombre: string;
  PrecioRegular?: number;
  PrecioVenta: number;
  Short_name: string;
}

export interface PasilloNode {
  DisplayName: string;
  Nombre: string;
  order: number;
}

export interface Pasillo {
  DisplayName: string;
  Nombre: string;
  order: number;
  Categorias: Categorias;
}

export interface Pasillos {
  [key: string]: Pasillo;
}

export interface Categoria {
  Nombre: string;
  Photo: string;
  order: number;
}

export interface Categorias {
  [key: string]: Categoria;
}

export interface CategoriaNode {
  cat_group: string;
  Nombre: string;
  Photo: string;
  order: number;
}

export interface Cart {
  original: Carrito;
  final: Carrito; // ya se aplicaron las promos
}

export interface CartItem {
  quantity: number;
  Presentacion: string;
  productId: string;
  Weight_Each?: number;
  productName: string;
  productPrice: number;
  alternPrice?: number;
  isGetItem?: boolean;
  isPromoItem?: boolean;
  isAlternPrice?: boolean;
  preciazoDisc?: number;
  saving?: number;
  SKU: string;
  replacing?: CartItem;
  Price?: number;
  replaceComment?: string;
  hasPromo?: boolean;
  isAvailable?: boolean;
  photo?: string;
}

export interface Carrito {
  total: number;
  items: CartItem[];
  countItems: number;
  deliveryFee: number;
  deliveryDate: string;
  replaceOpt?: number;
  promos?: AppliedPromo[];
}
export interface AppliedPromo {
  id?: string;
  tag: string; // "Por cada 100 ahorra 25"
  promoDescr?: string;
  savings: number;
  promoType: string;
  items: CartItem[] | string[];
  productBuyQTY?: number;
  pASavingQty?: number;
  productGetQTY?: number;
  offer_id?: number;
  ChargebackDept?: number;
  DiscountAmount_AMT?: number;
}

export interface UData {
  pKey: string;
  password: string;
  username: string;
}

export interface UsersNew {
  [rfc: string]: UDNew;
}

export interface UDNew {
  username: string;
  cuentas: { [cuenta: string]: boolean };
}

export interface UserRecord {
  nombres: string;
  apellido: string;
  email: string;
  telefono: string;
  uid: number;
}
