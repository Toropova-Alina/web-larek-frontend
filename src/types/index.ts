// Товар
export interface Product {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number | null;
}

// Элемент корзины
export interface CartItem {
	product: Product;
	index: number;
}

// Данные заказа
export interface Order {
	items: CartItem[];
	payment: string;
	address: string;
	email: string;
	phone: string;
	total: number;
}

// Ответ API после оформления заказа
export interface OrderResponse {
	id?: string;
	total?: number;
	error?: string;
}

// API-клиент
export interface ApiClient {
	getProducts(): Promise<Product[]>;
	createOrder(order: Order): Promise<OrderResponse>;
}

// Модель товаров
export interface IProductModel {
	setProducts: (products: Product[]) => void;
	getProducts: () => Product[];
	getProductByTitle: (id: string) => Product | undefined; //(?)
}

// Модель корзины
export interface ICartModel {
	items: CartItem[];
	purchaseAmount: number;
	addItem: (product: Product) => void;
	removeItem: (productId: string) => void;
	getItems: () => Product[];
	hasItem: (productId: string) => boolean;
	getTotalPrice: () => number;
	clear: () => void;
}

// Модель заказа
export interface IOrderModel {
	order?: Order;
	setPayment: (payment: string) => void;
	setAddress: (address: string) => void;
	setEmail: (email: string) => void;
	setPhone: (phone: string) => void;
	getOrder: (items: CartItem[], total: number) => Order;
	clear: () => void;
	validate: () => boolean;
}

// Модальные окна
export interface IModal {
	open: (...args: any[]) => void;
	close: () => void;
	setContent: (content: HTMLElement) => void;
}

// Представление страницы
export interface IPageView {
	gallery: HTMLElement;
	cardCatalog: HTMLTemplateElement;
	renderContent: (products: Product[]) => void;
}

// Обработчик событий
export interface IEvents {
	on: (event: string, listener: (...args: any[]) => void) => void;
	off: (event: string, listener: (...args: any[]) => void) => void;
	emit: (event: string, data?: any[]) => void;
	trigger: (event: string, context?: any) => (...args: any[]) => void;
}
