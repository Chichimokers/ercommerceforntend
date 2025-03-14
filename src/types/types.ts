export type ProductBase = {
	id: string;
	name: string;
	price: number;
	short_description: string;
	description?: string;
	category?: string;
	subCategory?: string;
	image?: string;
	quantity: number;
	averageRating?: number;
	weight?:number;
	province?:string;
	
	discount?: {
		min: number;
		reduction: number;
	};
};

export interface BaseType {
	id: string;
	created_at: string;
	updated_at: string;
	deleted_at: string | null;
}
export interface Province {
	id:string;
	name:string
}

export interface Filters {
	category?: string[];
	subcategory?: string[];
	pricerange?: [number, number];
	rate?: number;
}

export interface FilterState {
	categories: string[];
	subcategories: string[];
	rating: number;
	priceRange: [number, number];
}
export interface SubCategory {
	id: string;
	name: string;
	categoryId:string;
}

export interface Category {
	id: string;
	name: string;
	subCategories: SubCategory[];
}

export type Order = {
	id: string;
	CI: string;
	address: string;
	status: string;
	subtotal: number;
	total?: number;
	phone: string;
	province: string;
	receiver_name: string;
	stripe_id?: string;
	orderItems: Item[];
};

export type Item = {
	id: string;
	quantity: number;
	product: ProductBase;
};

export type FilterList = {
	values: string[];
	key: string;
	label: string;
};

export type Comment = {
	id: string;
	text: string;
	author: string;
};
export type PublicityBanner = {
	id: number;
	image: string;
	altText: string;
	link?: string;
};
export type UserData = {
	email: string;
	username: string;
	password: string;
	code?: string;
};

// Tipos de modales
export type ModalType = "login" | "signup" | "verify" | null;

// Definición de estado
export interface ModalState {
	isLoginOpen: boolean;
	isSignUpOpen: boolean;
	isVerifyOpen: boolean;
	canRenderLogin: boolean;
	canRenderSignUp: boolean;
	canRenderVerify: boolean;
	data?: UserData;
	currentModal: ModalType;
}

// Tipos de acciones
export type ModalAction =
	| { type: "OPEN_LOGIN" }
	| { type: "OPEN_SIGNUP" }
	| { type: "OPEN_VERIFY" }
	| { type: "CLOSE_MODALS" }
	| { type: "CLOSE_VERIFY" }
	| { type: "SET_RENDER_LOGIN" }
	| { type: "SET_RENDER_SIGNUP" }
	| { type: "SET_RENDER_VERIFY" };
