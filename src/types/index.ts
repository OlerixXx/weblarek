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
  addProduct(product: IProduct | IProduct): void;
  deleteProduct(productId: string, payload: Function | null): void;
  getProduct(productId: string): TProductInfo;
}

export interface IBasket {
  items: Map<string, number>;
}

export interface IApi {
  baseUrl: string;
  get<T>(uri: string): Promise<T>;
  post<T>(uri: string, data: object, method?: ApiPostMethods): Promise<T>;
}

export type ApiPostMethods = 'POST' | 'PUT' | 'DELETE' | 'PATCH'
export type TProductBaseInfo = Pick<IProduct, 'title' | 'image' | 'category' | 'price'>
export type TProductInfo = Pick<IProduct, 'title' | 'description' | 'image' | 'category' | 'price'>