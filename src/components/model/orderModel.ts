import { CartItem, Order, IOrderModel } from '../../types';

export class OrderModel implements IOrderModel {
	order: Partial<Order> = {};

	setPayment(payment: string) {
		this.order.payment = payment;
	}

	setAddress(address: string) {
		this.order.address = address;
	}

	setEmail(email: string) {
		this.order.email = email;
	}

	setPhone(phone: string) {
		this.order.phone = phone;
	}

	getOrder(items: CartItem[], total: number): Order {
		if (
			this.order.payment === undefined ||
			this.order.address === undefined ||
			this.order.email === undefined ||
			this.order.phone === undefined
		) {
			throw new Error('Не все поля заказа заполнены');
		}
		return {
			items: items.map(item => item.product.id),
			total,
			payment: this.order.payment,
			address: this.order.address,
			email: this.order.email,
			phone: this.order.phone,
		};
	}

	clear() {
		this.order = {};
	}

	validateOrder(): string[] {
		const errors: string[] = [];

		if (!this.order.payment) errors.push('Не выбран способ оплаты');
		if (!this.order.address) errors.push('Не указан адрес доставки');

		return errors;
	}

	validateContacts(): string[] {
		const errors: string[] = [];

		if (!this.order.email) {
			errors.push('Не заполнен email');
		} else {
			const emailRegexp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegexp.test(this.order.email)) {
				errors.push('Некорректный формат email');
			}
		}

		if (!this.order.phone) {
			errors.push('Не заполнен телефон');
		} else {
			const phonePattern = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;
			if (!phonePattern.test(this.order.phone)) {
				errors.push('Телефон должен быть в формате +7(***) ***-**-**');
			}
		}

		return errors;
	}
}
