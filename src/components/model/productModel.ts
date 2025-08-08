import { Product, IProductModel } from '../../types';

export class ProductModel implements IProductModel {
	products: Product[] = [];

	setProducts(products: Product[]) {
		this.products = products;
	}

	getProducts(): Product[] {
		return this.products;
	}

	getProductByTitle(title: string): Product | undefined {
		return this.products.find((product) => product.title === title);
	}
}
