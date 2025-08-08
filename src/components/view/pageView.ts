import { Product, IPageView } from '../../types';

export class PageView implements IPageView {
	gallery: HTMLElement;
	cardCatalog: HTMLTemplateElement;

	constructor(container: HTMLElement) {
		this.gallery = container.querySelector<HTMLElement>('.gallery');
		this.cardCatalog = document.getElementById(
			'card-catalog'
		) as HTMLTemplateElement;
	}

	renderContent(products: Product[]) {
		this.gallery.innerHTML = '';

		products.forEach((product) => {
			const cardEl = this.cardCatalog.content.firstElementChild.cloneNode(
				true
			) as HTMLElement;

			// Категория
			const categoryEl = cardEl.querySelector('.card__category');
			categoryEl.textContent = product.category;
			categoryEl.className = `card__category ${addCategory(product.category)}`;

			// Заголовок
			const titleEl = cardEl.querySelector('.card__title');
			titleEl.textContent = product.title;

			// Картинка
			const imgEl = cardEl.querySelector(
				'.card__image'
			) as HTMLImageElement | null;
			imgEl.src = product.image;
			imgEl.alt = product.title;

			// Цена
			const priceEl = cardEl.querySelector('.card__price');
			if (product.price !== null)
				priceEl.textContent = `${product.price} синапсов`;
			else priceEl.textContent = `Бесценно`;

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
