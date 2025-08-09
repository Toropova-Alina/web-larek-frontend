import { Product, CartItem, IModal } from '../../types';
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
	container: HTMLElement;
	eventEmitter: EventEmitter;

	constructor(eventEmitter: EventEmitter) {
		this.eventEmitter = eventEmitter;
	}

	render(product: Product, inBasket: boolean): HTMLElement {
		const tpl = document.getElementById('card-preview') as HTMLTemplateElement;
		const card = tpl.content.firstElementChild.cloneNode(true) as HTMLElement;

		const categoryEl = card.querySelector('.card__category') as HTMLElement;
		categoryEl.textContent = product.category;
		categoryEl.className = `card__category ${addCategory(product.category)}`;

		const titleEl = card.querySelector('.card__title') as HTMLElement;
		titleEl.textContent = product.title;

		const descEl = card.querySelector('.card__text') as HTMLElement;
		descEl.textContent = product.description || '';

		const priceEl = card.querySelector('.card__price') as HTMLElement;
		if (product.price !== null)
			priceEl.textContent = `${product.price} синапсов`;
		else priceEl.textContent = `Бесценно`;

		const imgEl = card.querySelector('.card__image') as HTMLImageElement;
		imgEl.src = product.image;
		imgEl.alt = product.title;

		const btn = card.querySelector('button.card__button') as HTMLButtonElement;
		btn.textContent = inBasket ? 'Удалить из корзины' : 'Купить';

		btn.onclick = () => {
			if (inBasket) {
				this.eventEmitter.emit('cart:remove', product.id);
				btn.textContent = 'Купить';
			} else {
				this.eventEmitter.emit('cart:add', product);
				btn.textContent = 'Удалить из корзины';
			}
		};

		this.container = card;
		return this.container;
	}
}

class BasketItemView {
	container: HTMLElement;
	eventEmitter: EventEmitter;

	constructor(eventEmitter: EventEmitter) {
		this.eventEmitter = eventEmitter;
	}

	render(item: CartItem): HTMLElement {
		const tpl = document.getElementById('card-basket') as HTMLTemplateElement;
		const basketIt = tpl.content.firstElementChild.cloneNode(
			true
		) as HTMLElement;

		basketIt.querySelector('.basket__item-index').textContent = String(
			item.index + 1
		);
		basketIt.querySelector('.card__title').textContent =
			item.product.title;

		const priceEl = basketIt.querySelector('.card__price');
		if (item.product.price !== null) {
			priceEl.textContent = `${item.product.price} синапсов`;
		} else {
			priceEl.textContent = `Бесценно`;
		}

		const deleteBtn = basketIt.querySelector(
			'.basket__item-delete'
		) as HTMLElement;
		deleteBtn.addEventListener('click', () => {
			this.eventEmitter.emit('cart:remove', item.product.id);
		});
		
		this.container = basketIt;
		return this.container;
	}
}

export class BasketView {
	container: HTMLElement;
	eventEmitter: EventEmitter;

	constructor(eventEmitter: EventEmitter) {
		this.eventEmitter = eventEmitter;
	}

	render(basket: CartModel, onProceed: () => void): HTMLElement {
		const tpl = document.getElementById('basket') as HTMLTemplateElement;
		const basketEl = tpl.content.firstElementChild.cloneNode(
			true
		) as HTMLElement;
		const list = basketEl.querySelector('.basket__list');

		list.innerHTML = '';

		basket.items.forEach((item) => {
			const itemView = new BasketItemView(this.eventEmitter);
			const li = itemView.render(item);
			list.appendChild(li);
		});

		basketEl.querySelector(
			'.basket__price'
		).textContent = `${basket.getTotalPrice()} синапсов`;

		const proceedBtn = basketEl.querySelector('.button');
		proceedBtn.addEventListener('click', () => {
			onProceed();
		});

		this.container = basketEl;
		return this.container;
	}
}

export class OrderView {
	container: HTMLElement;
	eventEmitter: EventEmitter;
	nextBtn: HTMLButtonElement;
	errorSpan: HTMLElement;

	constructor(eventEmitter: EventEmitter) {
		this.eventEmitter = eventEmitter;
	}

	render(
		payment: string,
		address: string,
		isValid: boolean,
		errorMessage: string,
		onProceed: () => void
	): HTMLElement {
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
		this.nextBtn = orderForm.querySelector<HTMLButtonElement>('.order__button');
		this.errorSpan = orderForm.querySelector<HTMLElement>('.form__errors');

		paymentButtons.forEach((button) => {
			button.addEventListener('click', () => {
				payment = button.textContent?.trim() || null;
				paymentButtons.forEach((btn) => {
					btn.classList.toggle('button_alt-active', btn === button);
				});
				this.eventEmitter.emit('order:update', {
					payment: payment,
					address: address,
				});
			});
		});

		addressInput.addEventListener('input', () => {
			address = addressInput.value.trim();
			this.eventEmitter.emit('order:update', {
				payment: payment,
				address: address,
			});
		});

		this.nextBtn.disabled = true;
		this.validation(isValid, errorMessage);

		this.nextBtn.addEventListener('click', (e) => {
			e.preventDefault();
			this.errorSpan.textContent = '';
			onProceed();
		});

		return this.container;
	}

	validation(isValid: boolean, errorMessage: string): void {
		this.nextBtn.disabled = !isValid;
		this.errorSpan.textContent = isValid ? '' : errorMessage;
	}
}

export class ContactsView {
	container: HTMLElement;
	eventEmitter: EventEmitter;
	submitBtn: HTMLButtonElement;
	errorSpan: HTMLElement;

	constructor(eventEmitter: EventEmitter) {
		this.eventEmitter = eventEmitter;
	}

	render(
		email: string,
		phone: string,
		isValid: boolean,
		errorMessage: string,
		onComplete: () => void
	): HTMLElement {
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
		this.submitBtn = contactsForm.querySelector<HTMLButtonElement>(
			'button[type="submit"], .button'
		);
		this.errorSpan = contactsForm.querySelector<HTMLElement>('.form__errors');

		this.submitBtn.disabled = true;

		emailInput.addEventListener('input', () => {
			email = emailInput.value.trim();
			this.eventEmitter.emit('contacts:update', {
				email: email,
				phone: phone,
			});
		});

		phoneInput.addEventListener('input', () => {
			phone = phoneInput.value.trim();
			this.eventEmitter.emit('contacts:update', {
				email: email,
				phone: phone,
			});
		});

		this.validation(isValid, errorMessage);

		this.submitBtn.addEventListener('click', async (e) => {
			e.preventDefault();
			this.eventEmitter.emit('order:submit');
			onComplete();
		});

		return this.container;
	}

	validation(isValid: boolean, errorMessage: string): void {
		this.submitBtn.disabled = !isValid;
		this.errorSpan.textContent = isValid ? '' : errorMessage;
	}
}

export class SuccessView {
	container: HTMLElement;
	eventEmitter: EventEmitter;

	constructor(eventEmitter: EventEmitter) {
		this.eventEmitter = eventEmitter;
	}

	render(total: number): HTMLElement {
		const tpl = document.getElementById('success') as HTMLTemplateElement;
		const successNode = tpl.content.firstElementChild.cloneNode(
			true
		) as HTMLElement;

		const descriptionEl = successNode.querySelector(
			'.order-success__description'
		);
		descriptionEl.textContent = `Списано ${total} синапсов`;

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
