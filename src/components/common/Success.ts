import { ensureElement } from '../../utils/utils';
import { Component } from '../base/Component';
import { IEvents } from '../base/events';

interface ISuccess {
	total: number;
}

interface ISuccessActions {
	onClick: () => void;
}

export class Success extends Component<ISuccess> {
	protected _close: HTMLButtonElement;
	protected _total: HTMLElement;

	constructor(
		container: HTMLElement,
		events: IEvents,
		actions: ISuccessActions
	) {
		super(container);

		this._close = ensureElement<HTMLButtonElement>('.order-success__close', this.container);
		this._total = ensureElement<HTMLElement>('.order-success__description', this.container);

		if (actions?.onClick) {
			this._close.addEventListener('click', actions.onClick);
			events.emit('success:submit');
		}
	}

	set total(value: number) {
		this._total.textContent = `Списано ${value} синапсов`;
	}
}
