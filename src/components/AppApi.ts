import { IApi, IOrder, IOrderResult, IOrderAndContacts, IProduct } from "../types";
import { ApiListResponse } from "./base/api";

export class AppApi {
  private _baseApi: IApi;
  readonly cdn: string;

  constructor(baseApi: IApi, cdn: string) {
    this._baseApi = baseApi;
    this.cdn = cdn;
  }

  getProductList(): Promise<IProduct[]> {
    return this._baseApi.get(`/product`).then((data: ApiListResponse<IProduct>) =>
      data.items.map((item) => ({
        ...item,
        image: this.cdn + this.convertSvgToPng(item.image)
      }))
    );
  }

  getProduct(productId: string): Promise<IProduct> {
    return this._baseApi.get<IProduct>(`/product/${productId}`).then((data: IProduct) => data);
  }

  setOrder(data: IOrder): Promise<IOrderResult> {
    return this._baseApi.post(`/order`, data).then((order: IOrderResult) => order);
  }

  private convertSvgToPng(url: string) {
    return url.replace(/\.svg(?=$|\?)/i, '.png');
  }

}