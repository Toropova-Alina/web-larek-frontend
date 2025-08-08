import { Product, IModal } from '../../types';
import { addCategory } from './pageView';
import { CartModel } from '../model/cartModel';
import { EventEmitter } from '../eventEmitter';

export class Modal implements IModal {
	modalElement: HTMLElement;
	contentElement: HTMLElement;

	constructor(selector: string) {
		const modal = document.querySelector<HTMLElement>(selector);
		this.modalElement = modal;
		this.contentElement = modal.querySelector<HTMLElement>('.modal__content');

		modal
			.querySelector('.modal__close')
			?.addEventListener('click', () => this.close());
		modal.addEventListener('click', (e) => {
			if (e.target === this.modalElement) this.close();
		});
	}

	open() {
		this.modalElement.classList.add('modal_active');
	}

	close() {
		this.modalElement.classList.remove('modal_active');
	}

	setContent(content: HTMLElement) {
		this.contentElement.innerHTML = '';
		this.contentElement.appendChild(content);
	}
}

export class ProductView {
	product: Product;
	container: HTMLElement;
	eventEmitter: EventEmitter;

	constructor(product: Product, eventEmitter: EventEmitter) {
		this.product = product;
		this.eventEmitter = eventEmitter;
	}

	render(basket: CartModel): HTMLElement {
		const tpl = document.getElementById('card-preview') as HTMLTemplateElement;
		const card = tpl.content.firstElementChild.cloneNode(true) as HTMLElement;

		const categoryEl = card.querySelector('.card__category') as HTMLElement;
		categoryEl.textContent = this.product.category;
		categoryEl.className = `card__category ${addCategory(
			this.product.category
		)}`;

		const titleEl = card.querySelector('.card__title') as HTMLElement;
		titleEl.textContent = this.product.title;

		const descEl = card.querySelector('.card__text') as HTMLElement;
		descEl.textContent = this.product.description || '';

		const priceEl = card.querySelector('.card__price') as HTMLElement;
		if (this.product.price !== null)
			priceEl.textContent = `${this.product.price} синапсов`;
		else priceEl.textContent = `Бесценно`;

		const imgEl = card.querySelector('.card__image') as HTMLImageElement;
		imgEl.src = this.product.image;
		imgEl.alt = this.product.title;

		const btn = card.querySelector('button.card__button') as HTMLButtonElement;
		btn.textContent = basket.hasItem(this.product.id)
			? 'Удалить из корзины'
			: 'Купить';

		btn.onclick = () => {
			if (basket.hasItem(this.product.id)) {
				this.eventEmitter.emit('cart:remove', this.product.id);
				btn.textContent = 'Купить';
			} else {
				this.eventEmitter.emit('cart:add', this.product);
				btn.textContent = 'Удалить из корзины';
			}
			this.eventEmitter.emit('cart:update', basket.getItems().length);
		};

		this.container = card;
		return this.container;
	}
}

export class BasketView {
	basket: CartModel;
	container: HTMLElement;
	eventEmitter: EventEmitter;

	constructor(basket: CartModel, eventEmitter: EventEmitter) {
		this.basket = basket;
		this.eventEmitter = eventEmitter;
	}

	render(onProceed: () => void): HTMLElement {
		const tpl = document.getElementById('basket') as HTMLTemplateElement;
		const basketEl = tpl.content.firstElementChild.cloneNode(
			true
		) as HTMLElement;
		const list = basketEl.querySelector('.basket__list');

		list.innerHTML = '';

		this.basket.items.forEach((item) => {
			const liTpl = document.getElementById(
				'card-basket'
			) as HTMLTemplateElement;
			const li = liTpl.content.firstElementChild.cloneNode(true) as HTMLElement;
			li.querySelector('.basket__item-index').textContent = String(
				item.index + 1
			);
			li.querySelector('.card__title').textContent = item.product.title;

			if (item.product.price !== null)
				li.querySelector(
					'.card__price'
				).textContent = `${item.product.price} синапсов`;
			else li.querySelector('.card__price').textContent = `Бесценно`;

			const deleteBtn = li.querySelector('.basket__item-delete') as HTMLElement;
			deleteBtn.addEventListener('click', () => {
				this.eventEmitter.emit('cart:remove', item.product.id);
				this.eventEmitter.emit('cart:update', this.basket.getItems().length);
				this.render(onProceed);
			});

			list.appendChild(li);
		});

		basketEl.querySelector(
			'.basket__price'
		).textContent = `${this.basket.getTotalPrice()} синапсов`;

		const proceedBtn = basketEl.querySelector('.button');
		proceedBtn.addEventListener('click', () => {
			onProceed();
		});

		this.container = basketEl;
		return this.container;
	}
}

export class OrderView {
	payment: string;
	address: string;
	container: HTMLElement;
	eventEmitter: EventEmitter;

	constructor(eventEmitter: EventEmitter) {
		this.eventEmitter = eventEmitter;
	}

	render(onProceed: () => void): HTMLElement {
		const tpl = document.getElementById('order') as HTMLTemplateElement;
		const orderForm = tpl.content.firstElementChild.cloneNode(
			true
		) as HTMLFormElement;

		this.container = orderForm;

		const paymentButtons = Array.from(
			orderForm.querySelectorAll<HTMLButtonElement>('.order__buttons .button')
		);
		const addressInput =
			orderForm.querySelector<HTMLInputElement>('input[type="text"]');
		const nextBtn =
			orderForm.querySelector<HTMLButtonElement>('.order__button');
		const errorSpan = orderForm.querySelector<HTMLElement>('.form__errors');

		paymentButtons.forEach((button) => {
			button.addEventListener('click', () => {
				this.payment = button.textContent?.trim() || null;
				paymentButtons.forEach((btn) => {
					btn.classList.toggle('button_alt-active', btn === button);
				});
				errorSpan.textContent = '';
				this.eventEmitter.emit('order:update', {
					payment: this.payment,
					address: this.address,
				});
			});
		});

		addressInput.addEventListener('input', () => {
			this.address = addressInput.value.trim();
			errorSpan.textContent = '';
			this.eventEmitter.emit('order:update', {
				payment: this.payment,
				address: this.address,
			});
		});

		nextBtn.disabled = true;

		this.eventEmitter.on(
			'order:validation',
			(data: { isValid: boolean; errorMessage: string }) => {
				nextBtn.disabled = !data.isValid;
				errorSpan.textContent = data.isValid ? '' : data.errorMessage;
			}
		);

		nextBtn.addEventListener('click', (e) => {
			e.preventDefault();
			errorSpan.textContent = '';
			onProceed();
		});

		return this.container;
	}
}

export class ContactsView {
	email: string;
	phone: string;
	container: HTMLElement;
	eventEmitter: EventEmitter;

	constructor(eventEmitter: EventEmitter) {
		this.eventEmitter = eventEmitter;
	}

	render(onComplete: () => void): HTMLElement {
		const tpl = document.getElementById('contacts') as HTMLTemplateElement;
		const contactsForm = tpl.content.firstElementChild.cloneNode(
			true
		) as HTMLFormElement;

		this.container = contactsForm;

		const emailInput = contactsForm.querySelector<HTMLInputElement>(
			'input[name="email"]'
		);
		const phoneInput = contactsForm.querySelector<HTMLInputElement>(
			'input[name="phone"]'
		);
		const submitBtn = contactsForm.querySelector<HTMLButtonElement>(
			'button[type="submit"], .button'
		);
		const errorSpan = contactsForm.querySelector<HTMLElement>('.form__errors');

		submitBtn.disabled = true;

		emailInput.addEventListener('input', () => {
			this.email = emailInput.value.trim();
			errorSpan.textContent = '';
			this.eventEmitter.emit('contacts:update', {
				email: this.email,
				phone: this.phone,
			});
		});

		phoneInput.addEventListener('input', () => {
			this.phone = phoneInput.value.trim();
			errorSpan.textContent = '';
			this.eventEmitter.emit('contacts:update', {
				email: this.email,
				phone: this.phone,
			});
		});

		this.eventEmitter.on(
			'contacts:validation',
			(data: { isValid: boolean; errorMessage: string }) => {
				submitBtn.disabled = !data.isValid;
				errorSpan.textContent = data.isValid ? '' : data.errorMessage;
			}
		);
		submitBtn.addEventListener('click', async (e) => {
			e.preventDefault();
			this.eventEmitter.emit('order:submit');
			onComplete();
		});

		return this.container;
	}
}

export class SuccessView {
	total: number;
	container: HTMLElement;
	eventEmitter: EventEmitter;

	constructor(total: number, eventEmitter: EventEmitter) {
		this.total = total;
		this.eventEmitter = eventEmitter;
	}

	render(): HTMLElement {
		const tpl = document.getElementById('success') as HTMLTemplateElement;
		const successNode = tpl.content.firstElementChild.cloneNode(
			true
		) as HTMLElement;

		const descriptionEl = successNode.querySelector(
			'.order-success__description'
		);
		descriptionEl.textContent = `Списано ${this.total} синапсов`;

		const closeBtn = successNode.querySelector<HTMLButtonElement>(
			'.order-success__close'
		);
		closeBtn.addEventListener('click', () => {
			this.eventEmitter.emit('modal:close', {});
			this.eventEmitter.emit('cart:clear');
		});

		this.container = successNode;
		return this.container;
	}
}
