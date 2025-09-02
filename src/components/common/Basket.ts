import { createElement, ensureElement } from '../../utils/utils';
import { Component } from '../base/Component';
import { EventEmitter } from '../base/events';

interface IBasketView {
	items: HTMLElement[];
	total: number;
}

export class Basket extends Component<IBasketView> {
	protected _list: HTMLElement;
	protected _total: HTMLElement;
	protected _button: HTMLButtonElement;
	protected _totalPrice: number = 0;

	constructor(container: HTMLElement, protected events: EventEmitter) {
		super(container);

		this._list = ensureElement<HTMLElement>('.basket__list', this.container);
		this._total = this.container.querySelector('.basket__price');
		this._button = this.container.querySelector('.basket__button');

		if (this._button) {
			this._button.addEventListener('click', () => {
				events.emit('order:open');
			});
		}

		this.items = [];
	}

	set items(items: HTMLElement[]) {
		if (items.length) {
			this._list.replaceChildren(...items);
		} else {
			this._list.replaceChildren(
				createElement<HTMLParagraphElement>('p', {
					textContent: 'Корзина пуста',
				})
			);
		}
	}

	set total(totalNew: number) {
		if (totalNew !== null && this._total !== null) {
			this._totalPrice = totalNew;
			this.setText(this._total, totalNew.toString() + ' синапсов');
		} else {
			this._totalPrice = null;
			this.setText(this._total, 'Бесценно');
			this.setButtonDisabled(true);
		}
	}

	get total() {
		return this._totalPrice;
	}

	setButtonDisabled(state: boolean): void {
		if (state) {
			this._button.style.opacity = '0.3';
			this._button.disabled = true;
		} else {
			this._button.style.opacity = '1';
			this._button.disabled = false;
		}
	}
}
