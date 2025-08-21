import { Component } from "./base/Component";

interface IProductsContainer {
  catalog: HTMLElement[];
}

export class ProductsContainer extends Component<IProductsContainer> {
  protected _catalog: HTMLElement;
  protected container: HTMLElement;

  constructor(container: HTMLElement) {
    super(container);
  }

  set catalog(items: HTMLElement[]) {
    this.container.replaceChildren(...items);
  }
}