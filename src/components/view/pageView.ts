import { Product, IPageView } from '../../types';
import { EventEmitter } from '../eventEmitter';

class ProductCardView {
	container: HTMLElement;

	render(product: Product): HTMLElement {
		const cardTpl = document.getElementById(
			'card-catalog'
		) as HTMLTemplateElement;
		const card = cardTpl.content.firstElementChild.cloneNode(
			true
		) as HTMLElement;

		const categoryEl = card.querySelector('.card__category');
		categoryEl.textContent = product.category;
		categoryEl.className = `card__category ${addCategory(product.category)}`;

		const titleEl = card.querySelector('.card__title');
		titleEl.textContent = product.title;

		const imgEl = card.querySelector(
			'.card__image'
		) as HTMLImageElement | null;
		if (imgEl) {
			imgEl.src = product.image;
			imgEl.alt = product.title;
		}

		const priceEl = card.querySelector('.card__price');
		if (product.price !== null) {
			priceEl.textContent = `${product.price} синапсов`;
		} else {
			priceEl.textContent = `Бесценно`;
		}
		
		this.container = card;
		return this.container;
	}
}

export class PageView implements IPageView {
	gallery: HTMLElement;
	basketBtn: HTMLButtonElement;
	eventEmitter: EventEmitter;

	constructor(eventEmitter: EventEmitter, container: HTMLElement) {
		this.gallery = container.querySelector<HTMLElement>('.gallery');
		this.eventEmitter = eventEmitter;
		this.basketBtn = document.querySelector('.header__basket');
		this.basketBtn.addEventListener('click', () => {
			this.eventEmitter.emit('cart:open');
		});
		this.gallery.addEventListener('click', (event) => {
			const target = event.target as HTMLElement;
			const cardEl = target.closest('.gallery__item') as HTMLElement | null;
			const titleEl = cardEl.querySelector('.card__title');
			const title = titleEl.textContent?.trim();
			this.eventEmitter.emit('product:open', title);
		});
	}

	renderContent(products: Product[]) {
		this.gallery.innerHTML = '';

		products.forEach((product) => {
			const cardView = new ProductCardView();
			const cardEl = cardView.render(product);
			this.gallery.appendChild(cardEl);
		});
	}
}

export function addCategory(category: string): string {
	switch (category) {
		case 'софт-скил':
			return 'card__category_soft';
		case 'хард-скил':
			return 'card__category_hard';
		case 'другое':
			return 'card__category_other';
		case 'дополнительное':
			return 'card__category_additional';
		case 'кнопка':
			return 'card__category_button';
		default:
			break;
	}
}
