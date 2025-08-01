# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```

## Описание базовых классов, их предназначение и функции.

### Интерфейсы

Интерфейс товара пришедшего с сервера, включает в себя id, описание, картинку, название, категорию и цену.
```
interface Product {
	id: string;
    description: string;
    image: string;
	title: string;
    category: string;
	price: number | null;
} 
```

Интерфейс данных заказа, включает в себя массив элементов корзины, метод оплаты, адрес, электронную почту, номер телефона и стоимость заказа.
```
interface Order {
	items: string[];
	payment: string;
	address: string;
	email: string;
	phone: string;
	total: number;
} 
```

Интерфейс ответа API после оформления заказа. При удачном ответе включает в себя id заказа и его стоимость. А при неудачном текст ошибки.
```
interface OrderResponse {
   id?: string;
   total?: number;
   error?: string;
}
```

Интерфейс API-клиента с функциями получения карточек с сервера и оформления заказа.
```
interface ApiClient {
	getProducts(): Promise<Product[]>;
	createOrder(order: Order): Promise<OrderResponse>;
} 
```

Интерфейс модели товара, включает в себя функции добавления списка товаров, получение списка товаров и получение товара по названию.
```
interface IProductModel {
	setProducts: (products: Product[]) => void;
	getProducts: () => Product[];
	getProductByTitle: (id: string) => Product | undefined;
} 
```

Интерфейс корзины, включает в себя список товаров, общую сумму, а также функции добавления товара, удаления товара, получения списка всех товаров, проверку есть ли такой товар в корзине, получение общей суммы корзины, и очистки корзины.
```
interface ICartModel {
	items: Product[];
	purchaseAmount: number;
	addItem: (product: Product) => void;
	removeItem: (productId: string) => void;
	getItems: () => Product[];
	hasItem: (productId: string) => boolean;
	getTotalPrice: () => number;
	clear: () => void;
} 
```

Интерфейс модальных окон, включает в себя персональный ID окна а также функции окрытия, закрытия окна и отображения контента.
```
interface IModal {
    modalId: string;     
    open:(...args: any[]) => void;
    close:() => void;
    setContent: (content: HTMLElement) => void;
}
```

Интерфейс представления страницы, включающий в себя галерию для отрисовки карточек товара, прототип разметки карточки продукта и функцию отрисовки страницы. 

```
interface IPageView {
    gallery: HTMLElement;
    cardCatalog: HTMLTemplateElement;
    renderContent: (products: Product[]) => void;
}
```

Интерфейс обработчика событий, дает возможность установить и снять слушателей события, вызвать событие и создать функцию-триггер.
```
interface IEvents {
	on: (event: string, listener: (...args: any[]) => void) => void;
	off: (event: string, listener: (...args: any[]) => void) => void;
	emit: (event: string, data?: any[]) => void;
	trigger: (event: string, context?: any) => (...args: any[]) => void;
}

```

### Архитектура

Приложение построено по архитектуре, близкой к паттерну Model-View-Presenter (MVP). В этой архитектуре бизнес-логика и данные (модели) отделены от пользовательского интерфейса (представления страницы и модальных окон), за управление которым отвечает посредник (обаботчик событий). 

### Модели

- class ProductModel реализующий интерфейс IProductModel, представляет собой модель товаров
- class CartModel реализующий интерфейс ICartModel, представляет собой модель корзины
- class ApiLarek реализующий интерфейс ApiClient, представляет собой модель взаимодействия с сервером

### Представление

- class PageView реализующий интерфейс IPageView, представляет собой отрисовку страницы
- class Modal реализующий интерфейс IModal, общий класс для всех модальных окон
- class ProductModal наследует класс Modal, реализует модальное окно подробностей о товаре
- class BasketModal наследует класс Modal, реализует модальное окно корзины
- class OrderModal наследует класс Modal, реализует модальное окно выбора типа оплаты и адреса
- class ContactsModal наследует класс Modal, реализует модальное окно предоставления контактов: электронной почты и номера телефона
- class SuccessModal наследует класс Modal, реализует модальное окно успешного оформления заказа, отображает также общую сумму покупки

### Обработчик событий

Класс EventEmitter реализующий интерфейс IEvents, представляет собой обработчика событий.

Возможные события:
- cart:update — обнавление корзины
- cart:add — добавление элемента в корзину
- cart:remove — удаление элемента из корзины
- cart:clear — очистка коризины
- order:update — обновление заказа
- order:submit — отправка заказа на сервер
- order:success — заказ удачно отправен
- order:fail — ошибка при отправке заказа на сервер
- modal:open — окрытие модального окна
- modal:close — закрытие модального окна
