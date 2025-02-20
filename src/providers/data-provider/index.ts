// src/providers/data-provider.ts
"use client";

import { DataProvider } from "@refinedev/core";
import axios from "axios";
import { getSession } from "next-auth/react";

const API_URL = "http://localhost:8080";

const axiosInstance = axios.create({
	baseURL: API_URL,
});

axiosInstance.interceptors.request.use(async (config) => {
	const session = await getSession();
	if (session?.access_token) {
		config.headers.Authorization = `Bearer ${session.access_token}`;
	}
	return config;
});

export const customDataProvider: DataProvider = {
	getList: async ({ resource, pagination }) => {
		//const params = {
		//		_start: pagination?.current - 1,
		//	_end: pagination?.pageSize,
		//	};
		//

		const { data } = await axiosInstance.get(`/${resource}`, {});
		console.log(data.data)
		return {
			data: data.data || data,
			total: data.total || data.length,
		};
	},

	getOne: async ({ resource, id }) => {
		const { data } = await axiosInstance.get(`/${resource}/${id}`);
		return { data };
	},

	create: async ({ resource, variables }) => {
		const { data } = await axiosInstance.post(`/${resource}`, variables);
		return { data };
	},

	update: async ({ resource, id, variables }) => {
		const { data } = await axiosInstance.patch(`/${resource}/${id}`, variables);
		return { data };
	},

	deleteOne: async ({ resource, id }) => {
		// Soft delete para usuarios y productos
		if (["user", "product"].includes(resource)) {
			const { data } = await axiosInstance.patch(`/${resource}/${id}`, {
				deleted_at: new Date().toISOString(),
			});
			return { data };
		}

		const { data } = await axiosInstance.delete(`/${resource}/${id}`);
		return { data };
	},

	getApiUrl: () => API_URL,
	/*Imlementar el custom luego*/
	custom: async () => {
		const params = {
			/*page: pagination?.current,
			limit: pagination?.pageSize,*/
		};

		const { data } = await axiosInstance.get(`/sales`);

		return {
			data: data.data || data,
			total: data.total || data.length,
		};
	},
};
