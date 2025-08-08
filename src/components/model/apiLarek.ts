import { ApiClient, Product, Order, OrderResponse } from '../../types';
import { Api, ApiListResponse } from '../base/api';

export class ApiLarek extends Api implements ApiClient {
	imgURL: string;

	constructor(imgURL: string, baseUrl: string, options?: RequestInit) {
		super(baseUrl, options);
		this.imgURL = imgURL;
	}

	async getProducts(): Promise<Product[]> {
		const data = (await this.get('/product')) as ApiListResponse<Product>;
		return data.items.map((item) => ({
			...item,
			image: this.imgURL + item.image,
		}));
	}

	async createOrder(order: Order): Promise<OrderResponse> {
		return this.post('/order', order) as Promise<OrderResponse>;
	}
}
