import { IOrderForm } from "../types";
import { IEvents } from "./base/events";
import { Form } from "./common/Form";

export class Order extends Form<IOrderForm> {
  protected buttonCard: HTMLButtonElement;
  protected buttonCash: HTMLButtonElement;
  protected buttonActiveClass: string;

  constructor(container: HTMLFormElement, events: IEvents) {
    super(container, events);

    this.buttonCard = this.container.elements.namedItem('card') as HTMLButtonElement;
    this.buttonCash = this.container.elements.namedItem('cash') as HTMLButtonElement;
    this.buttonActiveClass = 'button_alt-active';

    this.buttonCard.addEventListener('click', () => {
      events.emit('order.payment:change', { field: 'payment', value: 'online' });
      this.setOnlinePayment(true);
    });
    this.buttonCash.addEventListener('click', () => {
      events.emit('order.payment:change', { field: 'payment', value: 'offline' });
      this.setOnlinePayment(false);
    });
  }

  set payment(value: string) {
    if (value === 'Онлайн') {
      this.buttonCard.classList.add(this.buttonActiveClass);
      this.buttonCash.classList.remove(this.buttonActiveClass);
    } else if (value === 'При получении') {
      this.buttonCash.classList.add(this.buttonActiveClass);
      this.buttonCard.classList.remove(this.buttonActiveClass);
    } else {
      console.log(`Ошибка. Метода \'${value}\' не существует`);
    }
  }

  set address(value: string) {
    (this.container.elements.namedItem('address') as HTMLInputElement).value = value;
  }

  setOnlinePayment(isOnline: boolean) {
    isOnline ? this.payment = 'Онлайн' : this.payment = 'При получении';
  }
}