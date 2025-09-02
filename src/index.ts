import { AppApi } from './components/AppApi';
import { Api } from './components/base/api';
import { EventEmitter } from './components/base/events';
import { Basket } from './components/common/Basket';
import { Modal } from './components/common/Modal';
import { Success } from './components/common/Success';
import { Contacts } from './components/Contacts';
import { Order } from './components/Order';
import { Page } from './components/Page';
import { BasketProduct, CatalogProduct, PreviewProduct, Product } from './components/Product';
import { ProductData } from './components/ProductsData';
import './scss/styles.scss';
import { IContactsForm, IOrder, IOrderForm, IProduct } from './types';
import { API_URL, CDN_URL, settings } from './utils/constants';
import { cloneTemplate, createElement, ensureElement } from './utils/utils';

const events = new EventEmitter();
const baseApi = new Api(API_URL, settings);
const api = new AppApi(baseApi, CDN_URL);

// Модель данных
const productsData = new ProductData(events);

// Все шаблоны
const basketTemplate: HTMLTemplateElement = ensureElement<HTMLTemplateElement>('#basket');
const productBasketTemplate: HTMLTemplateElement = ensureElement<HTMLTemplateElement>('#card-basket');
const productTemplate: HTMLTemplateElement = ensureElement<HTMLTemplateElement>('#card-catalog');
const productPreviewTemplate: HTMLTemplateElement = ensureElement<HTMLTemplateElement>('#card-preview');
// const productsContainer = new ProductsContainer(document.querySelector('.gallery'));
const orderTemplate: HTMLTemplateElement = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate: HTMLTemplateElement = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate: HTMLTemplateElement = ensureElement<HTMLTemplateElement>('#success');

// Глобальные контейнеры
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

// Переиспользуемые части интерфейса
const basket = new Basket(cloneTemplate(basketTemplate), events);
const order = new Order(cloneTemplate(orderTemplate), events);
const contacts = new Contacts(cloneTemplate(contactsTemplate), events);

events.onAll((event) => {
  console.log(event.eventName, event.data);
})

// Получаем товары с сервера
api.getProductList()
  .then((result) => {
    productsData.setProducts(result);
    events.emit('initialData:loaded');
  })

// Подгрузка отображений всех товаров из модели данных
events.on('initialData:loaded', () => {
  const productsArray = productsData.products.map(item => {
    const product = new CatalogProduct(cloneTemplate(productTemplate), events);
    return product.render(item);
  })

  page.render({ catalog: productsArray });
});

// Выбрали продукт из списка на главной странице
events.on('product:select', (data: { product: Product }) => {
  const showProduct = (data: { product: Product }) => {
    const basketHasProduct = productsData.basket.some(id => id === data.product.id);
    const card = new PreviewProduct(basketHasProduct, cloneTemplate(productPreviewTemplate), events);
    const productData = productsData.getProduct(data.product.id);
    if (productData.price === null) card.setButtonDisabled(true);
    modal.render({
      content: card.render(productData)
    });
  };

  showProduct(data);
});

// Изменение состава корзины
events.on('basket:changed', () => {
  let total: number = 0;
  basket.items = productsData.basket.map((productId, index) => {
    const product: IProduct = productsData.getProduct(productId);
    const basketItem = new BasketProduct(cloneTemplate(productBasketTemplate), events);
    basketItem.index = index + 1; // Порядковый номер товара

    if (total === null || product.price === null) { // Проверка на наличие бесценного товара
      total = null;
    } else {
      total += product.price;
    }

    return basketItem.render({
      id: product.id,
      title: product.title,
      price: product.price
    });
  })

  if (productsData.basket.length === 0) {
    basket.setButtonDisabled(true);
    total = 0;
  } else {
    basket.setButtonDisabled(false);
  }
  basket.total = total;
  page.counter = productsData.basket.length; // Количество товаров в корзине
})

// Открыть форму заказа
events.on('order:open', () => {
  modal.render({
    content: order.render({
      address: '',
      payment: '',
      valid: false,
      errors: []
    })
  });
})

// Открыть форму с контактами
events.on('contacts:open', () => {
  modal.render({
    content: contacts.render({
      email: '',
      phone: '',
      valid: false,
      errors: []
    })
  });
})

// Обработка завершения покупки
events.on('contacts:submit', () => {
  const orderData: IOrder = productsData.getOrderData();
  orderData.total = basket.total;
  api.setOrder(orderData)
    .then((result) => {
      const success = new Success(cloneTemplate(successTemplate), events, {
        onClick: () => {
          modal.close();
          productsData.clearBasket();
          events.emit('basket:changed');
        }
      });
      success.total = basket.total;
      console.log(result);

      modal.render({
        content: success.render({})
      });
    })
    .catch(err => {
      console.error(err);
    });
})

// Добавили товар в корзину
events.on('product:add', ({ productId }: { productId: string }) => {
  productsData.addProduct(productId);
})

// Удалили товар из корзины
events.on('product:delete', ({ productId }: { productId: string }) => {
  productsData.deleteProduct(productId);
})

// Открыть корзину
events.on('basket:open', () => {
  modal.render({
    content: createElement<HTMLElement>('div', {}, basket.render())
  });
});

// Изменилось состояние валидации формы ордера
events.on('formErrors.order:change', (errors: Partial<IOrderForm>) => {
  const { address, payment } = errors;
  order.valid = !address && !payment;
  order.errors = Object.values({ address, payment }).filter(i => !!i).join('; ');
});

// Изменилось состояние валидации формы контактов
events.on('formErrors.contacts:change', (errors: Partial<IContactsForm>) => {
  const { email, phone } = errors;
  contacts.valid = !email && !phone;
  contacts.errors = Object.values({ email, phone }).filter(i => !!i).join('; ');
});

// Изменилось одно из полей в ордере
events.on(/^order\..*:change/, (data: { field: keyof IOrderForm, value: string }) => {
  productsData.setOrderField(false, data.field, data.value);
});

// Изменилось одно из полей в контактах
events.on(/^contacts\..*:change/, (data: { field: keyof IContactsForm, value: string }) => {
  productsData.setOrderField(true, data.field, data.value);
});

// Блокируем прокрутку страницы если открыта модалка
events.on('modal:open', () => {
  page.locked = true;
});

// ... и разблокируем
events.on('modal:close', () => {
  page.locked = false;
});