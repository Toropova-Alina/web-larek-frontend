import './scss/styles.scss';

import { ProductModel } from './components/model/productModel';
import { CartModel } from './components/model/cartModel';
import { OrderModel } from './components/model/orderModel';
import { ApiLarek } from './components/model/apiLarek';
import { API_URL, CDN_URL } from './utils/constants';
import { EventEmitter } from './components/eventEmitter';
import { PageView } from './components/view/pageView';
import {
	Modal,
	ProductView,
	OrderView,
	ContactsView,
	BasketView,
	SuccessView,
} from './components/view/modal';

const api = new ApiLarek(CDN_URL, API_URL);
const page = new PageView(document.body);
const productModel = new ProductModel();
const cartModel = new CartModel();
const orderModel = new OrderModel();
const eventEmitter = new EventEmitter();
const modal = new Modal('.modal');
const basketView = new BasketView(cartModel, eventEmitter);
const orderView = new OrderView(eventEmitter);
const contactsView = new ContactsView(eventEmitter);
const successView = new SuccessView(0, eventEmitter);

let modalCurrentView:
	| 'product'
	| 'basket'
	| 'order'
	| 'contacts'
	| 'success'
	| null = null;

// Отображение списка товаров и подробностей о товаре
async function loadAndShowProducts() {
	const galleryEl = document.querySelector('.gallery');
	const productsApi = await api.getProducts();
	page.renderContent(productsApi);
	productModel.setProducts(productsApi);
	galleryEl.addEventListener('click', (event) => {
		const target = event.target as HTMLElement;
		const cardEl = target.closest('.gallery__item');

		const titleEl = cardEl.querySelector('.card__title');
		const title = titleEl.textContent.trim();
		const product = productModel.getProductByTitle(title);

		const productView = new ProductView(product, eventEmitter);
		modalCurrentView = 'product';
		modal.setContent(productView.render(cartModel));
		modal.open();
	});
}

// Отображение корзины
function showBasket() {
	modalCurrentView = 'basket';
	modal.setContent(basketView.render(() => showOrderStep()));
	modal.open();
}

// Отображение оформления оплаты
function showOrderStep() {
	modalCurrentView = 'order';
	modal.setContent(orderView.render(() => showContactsStep()));
	modal.open();
}

// Отображение контактов
function showContactsStep() {
	modalCurrentView = 'contacts';
	modal.setContent(contactsView.render(() => modal.close()));
	modal.open();
}

// Отображение успешного завершения заказа
function showSuccessStep(total: number) {
	modalCurrentView = 'success';
	successView.total = total;
	modal.setContent(successView.render());
	modal.open();
}

// События

// Обновление корзины
eventEmitter.on('cart:update', (itemsCount) => {
	const counterEl = document.querySelector('.header__basket-counter');
	counterEl.textContent = String(itemsCount);
});

// Добавление/удаление товара
eventEmitter.on('cart:add', (product) => {
	cartModel.addItem(product);
});
eventEmitter.on('cart:remove', (productId) => {
	cartModel.removeItem(productId);
	if (modalCurrentView === 'basket') {
		modal.setContent(basketView.render(() => showOrderStep()));
	}
});

// Очистка корзины
eventEmitter.on('cart:clear', () => {
	cartModel.clear();
	eventEmitter.emit('cart:update', 0);
});

// Открытие и закрытие модального окна
eventEmitter.on('modal:open', () => modal.open());
eventEmitter.on('modal:close', () => {
	modal.close();
	modalCurrentView = null;
});

// Обновление данных об оплате и адресе
eventEmitter.on('order:update', (data) => {
	if ('payment' in data) orderModel.setPayment(data.payment);
	if ('address' in data) orderModel.setAddress(data.address);

	const errorMessages = orderModel.validateOrder();

	eventEmitter.emit('order:validation', {
		isValid: errorMessages.length === 0,
		errorMessage: errorMessages.join(', '),
	});
});

// Обновление контактных данных
eventEmitter.on('contacts:update', (data) => {
	if ('email' in data) orderModel.setEmail(data.email);
	if ('phone' in data) orderModel.setPhone(data.phone);

	const errorMessages = orderModel.validateContacts();

	eventEmitter.emit('contacts:validation', {
		isValid: errorMessages.length === 0,
		errorMessage: errorMessages.join(', '),
	});
});

// Отправка заказа на сервер
eventEmitter.on('order:submit', async () => {
	const order = orderModel.getOrder(cartModel.items, cartModel.getTotalPrice());
	try {
		const response = await api.createOrder(order);
		if (response) eventEmitter.emit('order:success', order);
	} catch (error) {
		eventEmitter.emit('order:fail', error);
	}
});

// Обработка успешного отправления заказа
eventEmitter.on('order:success', (order) => {
	showSuccessStep(order.total);
	cartModel.clear();
	eventEmitter.emit('cart:update', 0);
});

// Ошибка при отправке заказа
eventEmitter.on('order:fail', (error) => {
	alert('Ошибка при отправке заказа: ' + (error.message || error));
});

loadAndShowProducts();
const basketBtn = document.querySelector('.header__basket');
basketBtn.addEventListener('click', () => {
	showBasket();
});
