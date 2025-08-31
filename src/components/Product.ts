import { IProduct } from "../types";
import { cloneTemplate, createElement, ensureElement } from "../utils/utils";
import { IEvents } from "./base/events";
import { Component } from "./base/Component";

interface IProductActions {
  onClick: (event: MouseEvent) => void;
}

export class Product extends Component<IProduct> {
  protected events: IEvents;

  protected productId: string;
  protected productButton: HTMLButtonElement;
  protected productContainerButton: HTMLButtonElement;
  protected productCategory: HTMLElement;
  protected productImage: HTMLImageElement;
  protected productTitle: HTMLElement;
  protected productDescription: HTMLElement;
  protected productPrice: HTMLElement;

  constructor(protected container: HTMLElement, events: IEvents) {
    super(container);
    this.events = events;

    this.productButton = this.container.querySelector('.card__button') as HTMLButtonElement;
    this.productCategory = this.container.querySelector('.card__category');
    this.productImage = this.container.querySelector('.card__image');
    this.productTitle = this.container.querySelector('.card__title');
    this.productDescription = this.container.querySelector('.card__text');
    this.productPrice = this.container.querySelector('.card__price');
  }

  set button(text: string) {
    this.productButton.textContent = text;
  }

  set price(price: string) {
    if (price) {
      this.productPrice.textContent = price.toString() + ' синапсов'
    } else {
      this.productPrice.textContent = 'Бесценно';
    }
  }

  set description(description: string) {
    if (this.productDescription) {
      this.productDescription.textContent = description;
    }
  }

  set title(title: string) {
    this.productTitle.textContent = title;
  }

  set image(image: string) {
    this.productImage.src = image;
  }

  set category(category: string) {
    this.productCategory.textContent = category;
    this.productCategory.classList.add(this.categoryToCss(category));
  }

  set id(id: string) {
    this.productId = id;
  }

  get id() {
    return this.productId;
  }

  deleteProduct() {
    this.container.remove();
    this.container = null;
  }

  private categoryToCss(category: string) {
    switch (category) {
      case 'софт-скил': return 'card__category_soft';
      case 'хард-скил': return 'card__category_hard';
      case 'кнопка': return 'card__category_button';
      case 'дополнительное': return 'card__category_additional';
      case 'другое': return 'card__category_other';
      default: return 'card__category_other';
    }
  }
}

export class CatalogProduct extends Product {
  constructor(container: HTMLElement, events: IEvents) {
    super(container, events);
    this.productContainerButton = this.container as HTMLButtonElement;

    this.productContainerButton?.addEventListener('click', () => {
      this.events.emit('product:select', { product: this });
    })
  }
}

export class PreviewProduct extends Product {
  constructor(buttonState: boolean, container: HTMLElement, events: IEvents) {
    super(container, events);
    if (buttonState) {
      this.button = 'Удалить из корзины';
      this.attachRemoveOnce()
    } else {
      this.button = 'В корзину';
      this.attachAddOnce();
    }
  }

  private attachAddOnce() {
    this.productButton.addEventListener('click', this.onAdd, { once: true });
  }

  private attachRemoveOnce() {
    this.productButton.addEventListener('click', this.onDelete, { once: true });
  }

  private onAdd = () => {
    this.events.emit('product:add', { productId: this.productId });
    this.button = 'Удалить из корзины';
    this.attachRemoveOnce();
  };

  private onDelete = () => {
    this.events.emit('product:delete', { productId: this.productId });
    this.button = 'В корзину';
    this.attachAddOnce();
  };
}


export class BasketProduct extends Product {
  protected _index: HTMLElement;

  constructor(container: HTMLElement, events: IEvents) {
    super(container, events);

    this._index = ensureElement<HTMLElement>(`.basket__item-index`, container);
    this.productButton.addEventListener('click', () => {
      this.events.emit('product:delete', { productId: this.productId });
    })
  }

  set index(index: number) {
    this._index.textContent = index.toString();
  }
}