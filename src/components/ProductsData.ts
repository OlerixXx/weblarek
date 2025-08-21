import { IProduct, IProductsData, TProductInfo } from "../types";
import { IEvents } from "./base/events";

export class ProductData implements IProductsData {
  protected _products: IProduct[];
  protected _preview: string | null;
  protected events: IEvents;

  constructor(events: IEvents) {
    this.events = events;
    this._products = [];
  }

  set products(products: IProduct[]) {
    this._products = products;
    this.events.emit('products:changed');
  }

  get products() {
    return this._products;
  }

  setProducts(products: IProduct[]): void {
    this._products = products;
    this.events.emit('products:changed');
  }

  addProduct(product: IProduct | IProduct): void {
    this._products = [product, ...this._products];
    this.events.emit('products:changed');
  }
  deleteProduct(productId: string, payload: Function | null): void {
    this._products = this._products.filter(product => product.id !== productId);

    if (payload) {
      payload();
    } else {
      this.events.emit('products:changed');
    }
  }
  getProduct(productId: string): TProductInfo {
    return this._products.find(item => item.id === productId);
  }

}