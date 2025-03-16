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
    const { data } = await axiosInstance.get(`/${resource}`);
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
    let payload: any = variables;
    let headers = {};

    if (resource === "products") {
      const formData = new FormData();
      const variablesObj = variables as Record<string, any>;
      Object.keys(variablesObj).forEach((key) => {
        const value = variablesObj[key];
        if (Array.isArray(value)) {
          value.forEach((item: any) => formData.append(key, item));
        } else {
          formData.append(key, value);
        }
      });
      payload = formData;
      headers = { "Content-Type": "multipart/form-data" };
    }

    const { data } = await axiosInstance.post(`/${resource}`, payload, { headers });
    return { data };
  },

  update: async ({ resource, id, variables }) => {
    const { data } = await axiosInstance.patch(`/${resource}/${id}`, variables);
    return { data };
  },

  deleteOne: async ({ resource, id }) => {
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

  custom: async () => {
    const { data } = await axiosInstance.get(`/sales`);
    return {
      data: data.data || data,
      total: data.total || data.length,
    };
  },
};
