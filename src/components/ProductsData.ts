import { ContactsFormErrors, IContacts, IContactsForm, IOrder, IOrderAndContacts, IOrderForm, IProduct, IProductsData, OrderFormErrors, TProductInfo } from "../types";
import { IEvents } from "./base/events";
import { Model } from "./common/Model";

export class ProductData implements IProductsData {
  protected _products: IProduct[];
  protected _basket: string[];
  protected _preview: string | null;
  protected events: IEvents;
  order: IOrder = {
    payment: '',
    address: '',
    email: '',
    phone: '',
    total: 0,
    items: []
  };
  orderFormErrors: OrderFormErrors = {};
  contactsFormErrors: ContactsFormErrors = {};

  constructor(events: IEvents) {
    this.events = events;
    this._products = [];
    this._basket = [];
  }

  set products(products: IProduct[]) {
    this._products = products;
    this.events.emit('products:changed');
  }

  get products() {
    return this._products;
  }

  get basket() {
    return this._basket;
  }

  setProducts(products: IProduct[]): void {
    this._products = products;
    this.events.emit('products:changed');
  }

  getProduct(productId: string): IProduct {
    return this._products.find(item => item.id === productId);
  }

  addProduct(productId: string) {
    this._basket.push(productId);
    this.events.emit('basket:changed')
  }

  deleteProduct(productId: string) {
    this._basket = this._basket.filter(product => product !== productId);
    this.events.emit('basket:changed')
  }

  clearBasket() {
    this._basket = [];
  }

  setOrderField<K extends keyof IOrderForm>(isContactsOrder: false, field: K, value: IOrderForm[K]): void;

  setOrderField<K extends keyof IContactsForm>(isContactsOrder: true, field: K, value: IContactsForm[K]): void;

  setOrderField(isContactsOrder: boolean, field: string, value: string) {
    if (isContactsOrder) {
      this.contacts[field as keyof IContactsForm] = value;
      if (this.validateOrder(isContactsOrder)) {
        this.events.emit('contacts:ready', this.contacts);
      }
    } else {
      this.order[field as keyof IOrderForm] = value;
      if (this.validateOrder(isContactsOrder)) {
        this.events.emit('order:ready', this.order);
      }
    }
  }


  validateOrder(isContactsOrder: boolean): boolean {  
    if (isContactsOrder) {
      const errors: ContactsFormErrors = {};
      if (!this.contacts.email) {        
        errors.email = 'Необходимо указать почту';
      }
      if (!this.contacts.phone) {
        errors.phone = 'Необходимо указать номер телефона';
      }
      this.contactsFormErrors = errors;
      this.events.emit('formErrors.contacts:change', errors);
      return Object.keys(errors).length === 0;
    } else {
      const errors: OrderFormErrors = {};
      if (!this.order.payment) {
        errors.payment = 'Необходимо указать метод оплаты';
      }
      if (!this.order.address) {
        errors.address = 'Необходимо указать адрес';
      }
      this.orderFormErrors = errors;
      this.events.emit('formErrors.order:change', errors);
      return Object.keys(errors).length === 0;
    }
  }

  getOrderData(): IOrderAndContacts {
    return {
      payment: this.order.payment,
      address: this.order.address,
      email: this.contacts.email,
      phone: this.contacts.phone,
      total: undefined,
      items: this.basket
    }
  }
}