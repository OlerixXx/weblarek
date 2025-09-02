export interface IApi {
  baseUrl: string;
  get<T>(uri: string): Promise<T>;
  post<T>(uri: string, data: object, method?: ApiPostMethods): Promise<T>;
}

export interface IProduct {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  price: number;
}

export interface IProductsData {
  products: IProduct[];
  addProduct(productId: string): void;
  deleteProduct(productId: string, payload: Function | null): void;
  getProduct(productId: string): IProduct;
}

export interface IBasket {
  items: Map<string, number>;
}

export interface IOrder extends IOrderForm, IContactsForm {
  items: string[],
  total: number
}

export interface IOrderResult {
  id: string;
  total: number;
}

export interface IOrderForm {
  payment: string;
  address: string;
}

export interface IContactsForm {
  email: string;
  phone: string;
}

export type OrderFormErrors = Partial<Record<keyof IOrderForm, string>>;
export type ContactsFormErrors = Partial<Record<keyof IContactsForm, string>>;

export type ApiPostMethods = 'POST' | 'PUT' | 'DELETE' | 'PATCH'