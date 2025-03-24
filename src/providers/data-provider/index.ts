"use client";

import { DataProvider, BaseRecord, GetListResponse, GetOneResponse, GetListParams, GetOneParams, CreateParams, UpdateParams, DeleteOneParams, CustomParams, CreateResponse, UpdateResponse, DeleteOneResponse } from "@refinedev/core";
import axios from "axios";
import { getSession } from "next-auth/react";
import { cacheService } from "@services/cache-service";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      window.location.href = "/api/auth/signin";
    }
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

interface ApiResponse<T> {
  data: T;
  total?: number;
  message?: string;
}

export const customDataProvider: DataProvider = {
  getList: async <TData extends BaseRecord = BaseRecord>(params: GetListParams) => {
    try {
      const { resource, pagination } = params;
      const cacheKey = `${resource}-list-${JSON.stringify(pagination)}`;
      const cached = cacheService.get<GetListResponse<TData>>(cacheKey);
      if (cached) return cached;

      const { data } = await axiosInstance.get<ApiResponse<TData[]>>(`/${resource}`, {
        params: pagination
      });
      const result: GetListResponse<TData> = {
        data: data.data || data,
        total: data.total || (Array.isArray(data.data) ? data.data.length : 0),
      };

      cacheService.set(cacheKey, result, { ttl: 300, tags: [resource] });
      return result;
    } catch (error) {
      console.error(`Error fetching ${params.resource} list:`, error);
      throw error;
    }
  },

  getOne: async <TData extends BaseRecord = BaseRecord>(params: GetOneParams) => {
    try {
      const { resource, id } = params;
      const cacheKey = `${resource}-${id}`;
      const cached = cacheService.get<GetOneResponse<TData>>(cacheKey);
      if (cached) return cached;

      const { data } = await axiosInstance.get<ApiResponse<TData>>(`/${resource}/${id}`);
      const result: GetOneResponse<TData> = { data: data.data || data };

      cacheService.set(cacheKey, result, { ttl: 300, tags: [resource] });
      return result;
    } catch (error) {
      console.error(`Error fetching ${params.resource} with id ${params.id}:`, error);
      throw error;
    }
  },

  create: async <TData extends BaseRecord = BaseRecord, TVariables = {}>(params: CreateParams<TVariables>): Promise<CreateResponse<TData>> => {
    try {
      const { resource, variables } = params;
      let payload: any = variables;
      let headers = {};

      if (resource === "products") {
        const formData = new FormData();
        const variablesObj = variables as Record<string, any>;

        Object.keys(variablesObj).forEach((key) => {
          const value = variablesObj[key];
          if (key === "image" || key === "applyDiscount") return;
          if (value === undefined || value === null) return;
          formData.append(key, value);
        });

        if (variablesObj.image && Array.isArray(variablesObj.image) && variablesObj.image.length > 0) {
          const fileObj = variablesObj.image[0].originFileObj;
          if (fileObj) {
            formData.append("image", fileObj);
          }
        }

        payload = formData;
        headers = { "Content-Type": "multipart/form-data" };
      }

      const { data } = await axiosInstance.post<ApiResponse<TData>>(`/${resource}`, payload, { headers });
      const result: CreateResponse<TData> = { data: data.data || data };

      // Invalidate related caches
      cacheService.invalidateByTag(resource);
      return result;
    } catch (error) {
      console.error(`Error creating ${params.resource}:`, error);
      throw error;
    }
  },

  update: async <TData extends BaseRecord = BaseRecord, TVariables = {}>(params: UpdateParams<TVariables>): Promise<UpdateResponse<TData>> => {
    try {
      const { resource, id, variables } = params;
      let payload: any = variables;
      let headers = {};

      if (resource === "products") {
        const formData = new FormData();
        const variablesObj = variables as Record<string, any>;

        Object.keys(variablesObj).forEach((key) => {
          const value = variablesObj[key];
          if (key === "applyDiscount") return;

          if (key === "image") {
            if (value instanceof File) {
              formData.append("image", value);
            } else if (value !== undefined) {
              formData.append("image", value);
            }
            return;
          }

          if (value !== undefined && value !== null) {
            formData.append(key, value);
          }
        });

        payload = formData;
        headers = { "Content-Type": "multipart/form-data" };
      }

      const { data } = await axiosInstance.patch<ApiResponse<TData>>(`/${resource}/${id}`, payload, { headers });
      const result: UpdateResponse<TData> = { data: data.data || data };

      // Invalidate related caches
      cacheService.invalidateByTag(resource);
      cacheService.invalidateByKey(`${resource}-${id}`);
      return result;
    } catch (error) {
      console.error(`Error updating ${params.resource} with id ${params.id}:`, error);
      throw error;
    }
  },

  deleteOne: async <TData extends BaseRecord = BaseRecord, TVariables = {}>(params: DeleteOneParams<TVariables>): Promise<DeleteOneResponse<TData>> => {
    try {
      const { resource, id } = params;
      let result: DeleteOneResponse<TData>;
      if (["user", "product"].includes(resource)) {
        const { data } = await axiosInstance.patch<ApiResponse<TData>>(`/${resource}/${id}`, {
          deleted_at: new Date().toISOString(),
        });
        result = { data: data.data || data };
      } else {
        const { data } = await axiosInstance.delete<ApiResponse<TData>>(`/${resource}/${id}`);
        result = { data: data.data || data };
      }

      // Invalidate related caches
      cacheService.invalidateByTag(resource);
      cacheService.invalidateByKey(`${resource}-${id}`);
      return result;
    } catch (error) {
      console.error(`Error deleting ${params.resource} with id ${params.id}:`, error);
      throw error;
    }
  },

  getApiUrl: () => API_URL,

  custom: async <TData extends BaseRecord = BaseRecord>(params: CustomParams) => {
    try {
      const { url, method, filters, meta, sort, payload, query, headers } = params;
      const path = API_URL + (url || meta?.resource || '');
      const requestConfig = {
        headers,
        params: {
          ...(query || {}),
          ...(filters || {}),
          ...(sort || {})
        }
      };

      let response;

      switch (method) {
        case 'get':
          response = await axiosInstance.get<ApiResponse<TData>>(`${path}`, requestConfig);
          break;
        case 'post':
          response = await axiosInstance.post<ApiResponse<TData>>(`${path}`, payload, requestConfig);
          break;
        case 'put':
          response = await axiosInstance.put<ApiResponse<TData>>(`${path}`, payload, requestConfig);
          break;
        case 'patch':
          response = await axiosInstance.patch<ApiResponse<TData>>(`${path}`, payload, requestConfig);
          break;
        case 'delete':
          response = await axiosInstance.delete<ApiResponse<TData>>(`${path}`, requestConfig);
          break;
        default:
          throw new Error(`Unsupported HTTP method: ${method}`);
      }

      return {
        data: response?.data?.data || response?.data,
        total: response?.data?.total || (response?.data ? (Array.isArray(response.data) ? response.data.length : 1) : 0),
      };
    } catch (error) {
      console.error(`Error in custom request to ${params.url}:`, error);
      throw error;
    }
  },
};
