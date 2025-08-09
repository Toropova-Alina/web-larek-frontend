import { Product, CartItem, ICartModel } from '../../types';

export class CartModel implements ICartModel {
	items: CartItem[] = [];
	purchaseAmount = 0;

	addItem(product: Product) {
		const existing = this.items.find((item) => item.product.id === product.id);
		if (!existing) {
			this.items.push({ product, index: this.items.length });
			this.purchaseAmount = this.items.reduce(
				(sum, item) => sum + item.product.price,
				0
			);
		}
	}

	removeItem(productId: string) {
		const item = this.items.find((i) => i.product.id === productId);
		this.items = this.items.filter((item) => item.product.id !== productId);
		this.purchaseAmount -= item.product.price;
		this.items.forEach((item, idx) => {
			item.index = idx;
		});
	}

	getItems(): Product[] {
		return this.items.map((item) => item.product);
	}

	hasItem(productId: string): boolean {
		return this.items.some((item) => item.product.id === productId);
	}

	getTotalPrice(): number {
		return this.purchaseAmount;
	}

	clear() {
		this.items = [];
		this.purchaseAmount = 0;
	}
}
