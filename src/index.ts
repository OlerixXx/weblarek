import { AppApi } from './components/AppApi';
import { Api } from './components/base/api';
import { EventEmitter } from './components/base/events';
import { Basket } from './components/Basket';
import { Modal } from './components/common/Modal';
import { Page } from './components/Page';
import { Product } from './components/Product';
import { ProductsContainer } from './components/ProductsContainer';
import { ProductData } from './components/ProductsData';
import './scss/styles.scss';
import { IProduct } from './types';
import { API_URL, CDN_URL, settings } from './utils/constants';
import { testProducts } from './utils/testProducts';
import { cloneTemplate, ensureElement } from './utils/utils';
const events = new EventEmitter();
const productsData = new ProductData(events);
const baseApi = new Api(API_URL, settings);
const api = new AppApi(baseApi, CDN_URL);

// Все шаблоны
const basketTemplate: HTMLTemplateElement = ensureElement<HTMLTemplateElement>('#basket')
const productTemplate: HTMLTemplateElement = ensureElement<HTMLTemplateElement>('#card-catalog');
const productPreviewTemplate: HTMLTemplateElement = ensureElement<HTMLTemplateElement>('#card-preview');
const productsContainer = new ProductsContainer(document.querySelector('.gallery'));

// Глобальные контейнеры
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

// Переиспользуемые части интерфейса
const basket = new Basket(cloneTemplate(basketTemplate), events);

events.onAll((event) => {
  console.log(event.eventName, event.data);
})

// Получаем товары с сервера
api.getProductList()
  .then((result) => {
    productsData.setProducts(result);
    events.emit('initialData:loaded');
  })

events.on('initialData:loaded', () => {
  const productsArray = productsData.products.map(item => {
    const product = new Product(cloneTemplate(productTemplate), events);
    return product.render(item);
  })

  productsContainer.render({catalog: productsArray});
});

events.on('product:select', (data: {product: Product}) => {
  const showProduct = (data: {product: Product}) => {
    const card = new Product(cloneTemplate(productPreviewTemplate), events);

    const productData = productsData.getProduct(data.product.id)
    modal.render({
      content: card.render({
        title: productData.title,
        image: productData.image,
        description: productData.description,
        category: productData.category,
        price: productData.price
      })
    });
  };

  showProduct(data);
});

events.on('basket:open', () => {
  
});

// Блокируем прокрутку страницы если открыта модалка
events.on('modal:open', () => {
    page.locked = true;
});

// ... и разблокируем
events.on('modal:close', () => {
    page.locked = false;
});

// import { EventEmitter } from './components/base/events';
// import './scss/styles.scss';

// // Корзина товаров которая хранит в себе строки с товаром и их кол-во
// // При помощи кнопок + и - можно увеличить кол-во товара в корзине или уменьшать
// interface IBasketModel {
//   items: Map<string, number>;
//   add(id: string): void;
//   remove(id: string): void;
// }

// interface IEventEmitter {
//   emit: (event: string, data: unknown) => void;
// }


// class BasketModel implements IBasketModel {
//   constructor(protected events: IEventEmitter) {}

//   add(id: string): void {
//     // ...
//     this._changed();
//   }

//   remove(id: string): void {
//     // ...
//     this._changed();
//   }

//   protected _changed() { // метод генерирующий уведомление об изменении
//     this.events.emit('basket:change', {items: Array.from(this.items.keys())});
//   }
// }

// const events = new EventEmitter();
// const basket = new BasketModel(events);
// events.on('basket:change', (data: {items: string[]}) => {
//   // тут описываем реакцию на событие basket:change
//   // то есть тут описываем обработчик для этого события
//   // выводим куда то
// });

// interface IProduct {
//   id: string;
//   title: string;
// }

// interface CatalogModel {
//   items: IProduct[];
//   setItems(items: IProduct[]): void; // чтобы установить после загрузки из апи
//   getProduct(id: string): IProduct; // чтобы получить при рендере списков
// }

// interface IViewConstructor {
//   new (container: HTMLElement, events?: IEventEmitter): IView; // на входе контейнер, в него будем выводить
// }

// interface IView {
//   render(data?: object): HTMLElement; // устанавливаем данные, возвращаем контейнер
// }

// class BasketItemView implements IView {
//   // элементы внутри контейнера
//   protected title: HTMLSpanElement;
//   protected addButton: HTMLButtonElement;
//   protected removeButton: HTMLButtonElement;

//   // данные, которые хотим сохранить на будущее
//   protected id: string | null = null;

//   constructor(protected container: HTMLElement, protected events: IEventEmitter) {
//     // инициализируем, чтобы не искать повторно
//     this.title = container.querySelector('.basket-item__title') as HTMLSpanElement;
//     this.addButton = container.querySelector('.basket-item_add') as HTMLButtonElement;
//     this.removeButton = container.querySelector('.basket-item_remove') as HTMLButtonElement;

//     // устанавливаем события
//     this.addButton.addEventListener('click', () => {
//       // генерируем событие в нашем брокере
//       this.events.emit('ui:basket-add', {id: this.id});
//     });

//     this.addButton.addEventListener('click', () => {
//       this.events.emit('ui:basket-remove', {id: this.id});
//     })
//   }

//   render(data: {id: string, title: string}) {
//     if (data) {
//       // если есть данные, то запомним их
//       this.id = data.id;
//       // и выведем в интерфейс
//       this.title.textContent = data.title;
//     }
//     return this.container;
//   }
// }

// class BasketView implements IView {
//   constructor(protected container: HTMLElement) {}
//   render(data: {items: HTMLElement[]}) {
//       if (data) {
//         this.container.replaceChildren(...data.items);
//       }
//       return this.container;
//     }
// }

// // инициализация
// const api = new ShopAPI();
// const events = new EventEmitter();
// const basketView = new BasketView(document.querySelector('.basket'));
// const basketModel = new BasketModel(events);
// const catalogModel = new CatalogModel(events);

// // можно собрать в функции или классы отдельные экраны с логикой их форматирования
// function renderBasket(items: string[]) {
//   basketView.render(
//     items.map(id => {
//       const itemView = new BasketItemView(events);
//       return itemView.render(catalogModel.getProduct(id));
//     })
//   );
// }

// // при изменении рендерим
// events.on('basket:change', (event: {items: string[]}) => {
//   renderBasket(event.items);
// });

// // при действиях изменяем модель, а после этого случится рендер
// events.on('ui:basket-add', (event: {id: string}) => {
//   basketModel.add(event.id);
// })

// events.on('ui:basket-remove', (event: {id: string}) => {
//   basketModel.remove(event.id);
// })

// // подгружаем начальные данные и запускаем процессы
// api.getCatalog()
//   .then(catalogModel.setItems.bind(catalogModel))
//   .catch(err => console.log(err));




// class BasketModel implements IBasketModel {
//   items: Map<string, number> = new Map();

//   add(id: string): void {
//     if (!this.items.has(id)) this.items.set(id, 0); // создаём новый
//     this.items.set(id, this.items.get(id)! + 1); // прибавляем ещё один товар
//   }

//   remove(id: string): void {
//     if (!this.items.has(id)) return; // если нет, то и делать с ним нечего
//     if (this.items.get(id)! > 0) { // если есть и больше нуля, то...
//       this.items.set(id, this.items.get(id)! - 1); // уменьшаем
//       if (this.items.get(id) === 0) this.items.delete(id); // усли опустили до нуля, то удаляем
//     }
//   }
// }