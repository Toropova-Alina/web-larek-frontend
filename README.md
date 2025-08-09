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

Итерфейс элемента корзины, включает в себя продукт и индекс продукта в корзине.
```
interface CartItem {
	product: Product;
	index: number;
} 
```

Интерфейс данных заказа, включает в себя массив элементов id товаров, метод оплаты, адрес, электронную почту, номер телефона и стоимость заказа.
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
	items: CartItem[];
	purchaseAmount: number;
	addItem: (product: Product) => void;
	removeItem: (productId: string) => void;
	getItems: () => Product[];
	hasItem: (productId: string) => boolean;
	getTotalPrice: () => number;
	clear: () => void;
} 
```

Интерфейс заказа, включает в себя сам заказ, функции заполнения данных заказа: добавление метода оплаты, адреса, электронной почты, номера телефона, получение и очистки заказа, а также валидации заказа.
```
interface IOrderModel {
	order: Partial<Order>;
	setPayment: (payment: string) => void;
	setAddress: (address: string) => void;
	setEmail: (email: string) => void;
	setPhone: (phone: string) => void;
	getOrder: (items: CartItem[], total: number) => Order;
    clear: () => void;
    validateOrder: () => string[];
	validateContacts: () => string[];
}
```

Интерфейс модальных окон, включает в себя функции окрытия, закрытия окна и отображения контента.
```
interface IModal {  
    open:(...args: any[]) => void;
    close:() => void;
    setContent: (content: HTMLElement) => void;
}
```

Интерфейс представления страницы, включающий в себя галерию для отрисовки карточек товара, кнопку корзины и функцию отрисовки страницы. 

```
interface IPageView {
    gallery: HTMLElement;
    basketBtn: HTMLButtonElement;
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

#### class ProductModel

Реализует интерфейс IProductModel, представляет собой модель товаров с полем products для списка товаров и методами добавления списка товаров (setProducts), получение списка товаров (getProducts) и получение товара по названию (getProductByTitle).

```
class ProductModel implements IProductModel{
    products: Product[];
	setProducts: (products: Product[]) => void;
	getProducts: () => Product[];
	getProductByTitle: (id: string) => Product | undefined;
} 
```

#### class CartModel 

Реализует интерфейс ICartModel, представляет собой модель корзины с полями списка товаров (items) и  общей суммой корзины (purchaseAmount), а также методами добавления товара (addItem), удаления товара (removeItem), получения списка всех товаров (getItems), проверку есть ли такой товар в корзине (hasItem), получение общей суммы корзины (getTotalPrice), и очистки корзины (clear).
```
class CartModel implements ICartModel{
	items: CartItem[];
	purchaseAmount: number;
	addItem: (product: Product) => void;
	removeItem: (productId: string) => void;
	getItems: () => Product[];
	hasItem: (productId: string) => boolean;
	getTotalPrice: () => number;
	clear: () => void;
} 
```

#### class OrderModel

Реализует интерфейс IOrderModel, представляет собой модель товара с полем самого заказа (order), а также методами заполнения данных заказа: добавление метода оплаты (setPayment), адреса (setAddress), электронной почты (setEmail), номера телефона (setPhone), получение заказа (getOrder) и очистки заказа (clear), а также валидации заказа на этапе заполение оплаты и адреса (validateOrder) и на этапе заполнения контактных данных (validateContacts).
```
class OrderModel implements IOrderModel {
	order: Partial<Order>;;
	setPayment: (payment: string) => void;
	setAddress: (address: string) => void;
	setEmail: (email: string) => void;
	setPhone: (phone: string) => void;
	getOrder: (items: CartItem[], total: number) => Order;
    clear: () => void;
    validateOrder: () => string[];
	validateContacts: () => string[];
}
```

#### class ApiLarek 

Реализует интерфейс ApiClient, представляет собой модель взаимодействия с сервером. Имеет поле ссылки на картинку (imgURL), а также методы получения карточек с сервера (getProducts) и оформления заказа (createOrder).
```
export class ApiLarek extends Api implements ApiClient {
    imgURL: string;
	getProducts(): Promise<Product[]>;
	createOrder(order: Order): Promise<OrderResponse>;
} 
```

### Представление

#### class ProductCardView

Реализует независимое представление карточки товара. Имеет поле HTML-элемента, который хранит и представляет визуальное содержимое компонента для дальнейшей вставки (container), а также метод, который подготавливает и возвращает HTML-элемент, отображающий текущее представление компонента, для дальнейшего отображения (render).
```
class ProductCardView {
	container: HTMLElement;
	render: (product: Product) => HTMLElement;
}
```

#### class PageView 

Реализует интерфейс IPageView, представляет собой отрисовку страницы, имеет поля отрисовки карточек товара (gallery), кнопку открытия корзины (basketBtn) и эмиттер событий для взаимодействия с остальной частью приложения через события (eventEmitter), а также метод отрисовки страницы (renderContent). 

```
class PageView implements IPageView  {
    gallery: HTMLElement;
    basketBtn: HTMLButtonElement;
	eventEmitter: EventEmitter;
    renderContent: (products: Product[]) => void;
}
```

#### class Modal 

Реализует интерфейс IModal, общий класс для всех модальных окон. Имеет поля основного HTML-элемент модального окна (modalElement) и HTML-элемента контента отображаемого окна (contentElement), а также методы окрытия (open), закрытия окна (close) и отображения контента (setContent).
```
class Modal implements IModal {
    modalElement: HTMLElement;
    contentElement: HTMLElement;     
    open:(...args: any[]) => void;
    close:() => void;
    setContent: (content: HTMLElement) => void;
}
```

#### class ProductView  

Реализует независимое представление подробностей о товаре. Имеет поля HTML-элемента, который хранит и представляет визуальное содержимое компонента для дальнейшей вставки (container) и эмиттера событий для взаимодействия с остальной частью приложения через события (eventEmitter), а также метод, который подготавливает и возвращает HTML-элемент, отображающий текущее представление компонента, для дальнейшего отображения (render).
```
class ProductView {
    container: HTMLElement;
	eventEmitter: EventEmitter;
    render: (product: Product, inBasket: boolean) => HTMLElement;
}
```

#### class BasketItemView

Реализует независимое представление элемента корзины. Имеет поля HTML-элемента, который хранит и представляет визуальное содержимое компонента для дальнейшей вставки (container) и эмиттера событий для взаимодействия с остальной частью приложения через события (eventEmitter), а также метод, который подготавливает и возвращает HTML-элемент, отображающий текущее представление компонента, для дальнейшего отображения (render).
```
class BasketItemView {
	container: HTMLElement;
	eventEmitter: EventEmitter;
	render: (item: CartItem) => HTMLElement;
}
```

#### class BasketView 

Реализует независимое представление корзины. Имеет поля HTML-элемента, который хранит и представляет визуальное содержимое компонента для дальнейшей вставки (container) и эмиттера событий для взаимодействия с остальной частью приложения через события (eventEmitter), а также метод, который подготавливает и возвращает HTML-элемент, отображающий текущее представление компонента, для дальнейшего отображения (render). onProceed() в render это колбек для перехода к оформлению заказа.
```
class BasketView {
    сontainer: HTMLElement;
	eventEmitter: EventEmitter;
    render: (basket: CartModel, onProceed: () => void) => HTMLElement;
}
```

#### class OrderView 

Реализует независимое представление выбора типа оплаты и адреса. Имеет поля  HTML-элемента, который хранит и представляет визуальное содержимое компонента для дальнейшей вставки (container), эмиттера событий для взаимодействия с остальной частью приложения через события (eventEmitter), кнопки перехода к следующему шагу оформления заказа (nextBtn) и поле отображения ошибок формы (errorSpan), а также метод, который подготавливает и возвращает HTML-элемент, отображающий текущее представление компонента, для дальнейшего отображения (render) и метод, который управляет состоянием интерфейса формы в зависимости от результата валидации данных (validation). onProceed() в render это колбек для перехода к следующему шагу оформления заказа.
```
class OrderView {
    сontainer: HTMLElement;
    eventEmitter: EventEmitter;
	nextBtn: HTMLButtonElement;
	errorSpan: HTMLElement;
    render: (payment: string, address: string, isValid: boolean, errorMessage: string, onProceed: () => void) => HTMLElement;
	validation: (isValid: boolean, errorMessage: string) => void;
}
```

#### class ContactsView 

Реализует независимое представление предоставления контактов: электронной почты и номера телефона. Имеет поля HTML-элемента, который хранит и представляет визуальное содержимое компонента для дальнейшей вставки (container), эмиттера событий для взаимодействия с остальной частью приложения через события (eventEmitter), кнопки отправки формы (submitBtn) и поле отображения ошибок формы (errorSpan), а также метод, который подготавливает и возвращает HTML-элемент, отображающий текущее представление компонента, для дальнейшего отображения (render) и метод, который управляет состоянием интерфейса формы в зависимости от результата валидации данных (validation). onComplete() в render это колбек для перехода к последнему модальному окну оформления заказа.
```
class ContactsView {
    сontainer: HTMLElement;
    eventEmitter: EventEmitter;
	submitBtn: HTMLButtonElement;
	errorSpan: HTMLElement;
    render: (email: string, phone: string, isValid: boolean, errorMessage: string, onComplete: () => void) => HTMLElement;
	validation: (isValid: boolean, errorMessage: string) => void;
}
```

#### class SuccessView

Реализует независимое представление успешного оформления заказа, отображает также общую сумму покупки. Имеет поля HTML-элемента, который хранит и представляет визуальное содержимое компонента для дальнейшей вставки (container) и эмиттера событий для взаимодействия с остальной частью приложения через события (eventEmitter), а также метод, который подготавливает и возвращает HTML-элемент, отображающий текущее представление компонента, для дальнейшего отображения (render).
```
class SuccessView {
    сontainer: HTMLElement;
	eventEmitter: EventEmitter;
    render: (total: number) => HTMLElement;
}
```

Все классы представлений: ProductView, BasketView, OrderView, ContactsView и SuccessView создают через 
render() HTML-элемент, который передаётся экземпляру Modal через метод setContent().

### Обработчик событий

Класс EventEmitter реализующий интерфейс IEvents, представляет собой обработчика событий. Имеет поле events представляющее собой массив событий и подписанных на это событие слушателей, также имеет методы установки (on) и снятия (off) слушателей события, вызова события (emit) и создания функцию-триггер (trigger).
```
class EventEmitter implements IEvents {
    events: Map<string, Set<Function>>;
	on: (event: string, listener: (...args: any[]) => void) => void;
	off: (event: string, listener: (...args: any[]) => void) => void;
	emit: (event: string, data?: any[]) => void;
	trigger: (event: string, context?: any) => (...args: any[]) => void;
}
```

Возможные события:
- product:open — открытие модального окна подробностей о товаре
- cart:open — открытие модального окна корзины
- cart:update — обнавление корзины
- cart:add — добавление элемента в корзину
- cart:remove — удаление элемента из корзины
- cart:clear — очистка коризины
- order:update — обновление данных заказа про метод оплаты и адрес
- contacts:update — обновление данных заказа про контактную имформацию
- order:submit — отправка заказа на сервер
- order:success — заказ удачно отправен
- order:fail — ошибка при отправке заказа на сервер
- modal:open — окрытие модального окна
- modal:close — закрытие модального окна
