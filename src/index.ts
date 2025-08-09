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
const productModel = new ProductModel();
const cartModel = new CartModel();
const orderModel = new OrderModel();
const eventEmitter = new EventEmitter();
const page = new PageView(eventEmitter, document.body);
const modal = new Modal('.modal');
const productView = new ProductView(eventEmitter);
const basketView = new BasketView(eventEmitter);
const orderView = new OrderView(eventEmitter);
const contactsView = new ContactsView(eventEmitter);
const successView = new SuccessView(eventEmitter);

let modalCurrentView:
	| 'product'
	| 'basket'
	| 'order'
	| 'contacts'
	| 'success'
	| null = null;

// Отображение списка товаров
async function loadAndShowProducts() {
	const productsApi = await api.getProducts();
	page.renderContent(productsApi);
	productModel.setProducts(productsApi);
}

// Отображение оформления оплаты
function showOrderStep() {
	modalCurrentView = 'order';
	const errorMessages = orderModel.validateOrder();
	modal.setContent(
		orderView.render(
			'',
			'',
			errorMessages.length === 0,
			errorMessages.join(', '),
			() => showContactsStep()
		)
	);
	modal.open();
}

// Отображение контактов
function showContactsStep() {
	modalCurrentView = 'contacts';
	const errorMessages = orderModel.validateContacts();
	modal.setContent(
		contactsView.render(
			'',
			'',
			errorMessages.length === 0,
			errorMessages.join(', '),
			() => modal.close()
		)
	);
	modal.open();
}

// Отображение успешного завершения заказа
function showSuccessStep(total: number) {
	modalCurrentView = 'success';
	modal.setContent(successView.render(total));
	modal.open();
}

// События

// Отображение подробностей о товаре
eventEmitter.on('product:open', (title) => {
	const product = productModel.getProductByTitle(title);
	modalCurrentView = 'product';
	modal.setContent(productView.render(product, cartModel.hasItem(product.id)));
	modal.open();
});

// Отображение корзины
eventEmitter.on('cart:open', () => {
	modalCurrentView = 'basket';
	modal.setContent(basketView.render(cartModel, () => showOrderStep()));
	modal.open();
});

// Обновление корзины
eventEmitter.on('cart:update', (itemsCount) => {
	const counterEl = document.querySelector('.header__basket-counter');
	counterEl.textContent = String(itemsCount);
});

// Добавление/удаление товара
eventEmitter.on('cart:add', (product) => {
	cartModel.addItem(product);
	eventEmitter.emit('cart:update', cartModel.getItems().length);
});
eventEmitter.on('cart:remove', (productId) => {
	cartModel.removeItem(productId);
	if (modalCurrentView === 'basket') {
		modal.setContent(basketView.render(cartModel, () => showOrderStep()));
	}
	eventEmitter.emit('cart:update', cartModel.getItems().length);
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
	orderView.validation(errorMessages.length === 0, errorMessages.join(', '));
});

// Обновление контактных данных
eventEmitter.on('contacts:update', (data) => {
	if ('email' in data) orderModel.setEmail(data.email);
	if ('phone' in data) orderModel.setPhone(data.phone);

	const errorMessages = orderModel.validateContacts();
	contactsView.validation(errorMessages.length === 0, errorMessages.join(', '));
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
