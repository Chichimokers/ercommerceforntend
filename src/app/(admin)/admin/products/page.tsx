"use client";

import React, { Suspense } from "react";
import { Space, Tag } from "antd";
import Image from "next/image";
import { BaseType, ProductBase } from "../../../../types/types";
import GenericList, { ExtendedColumnType } from "@components/admin/generic_admin_pages/genericListPage";

// Componente de carga para Suspense
const ListSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-1/3"></div>
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-4 border-b">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
      </div>
      <div className="p-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  </div>
);

// Componente de contenido que contiene la lógica principal
const ProductContent: React.FC = () => {
  const columns: ExtendedColumnType<ProductBase & BaseType>[] = [
    {
      title: "Nombre",
      dataIndex: "name",
      sorter: true,
      filterSearch: true,
      filteredValue:undefined
    },
    {
      title: "Precio",
      dataIndex: "price",
      sorter: true,
      rangeFilter: true, 
      filteredValue:undefined// Ahora es válido gracias a ExtendedColumnType
    },
    {
      title: "Existencias",
      dataIndex: "quantity",
      sorter: true,
      rangeFilter: true,
      filteredValue:undefined // Ahora es válido gracias a ExtendedColumnType
    },
    {
      title: "Categoría",
      dataIndex: "category",
      sorter: true,
      filteredValue:undefined
    },
    {
      title: "SubCategoria",
      dataIndex: "subCategory",
      sorter:true,
      filteredValue:undefined
    },
    {
      title: "Estado",
      dataIndex: "deleted_at",
      render: (deleted_at: string | null) => (
        <Tag color={deleted_at ? "red" : "green"}>
          {deleted_at ? "Inactivo" : "Activo"}
        </Tag>
      ),
      filters: [
        { text: "Activo", value: true },
        { text: "Inactivo", value: false },
      ],
      filteredValue:undefined
    },
    {
      title: "Imagen",
      dataIndex: "image",
      render: (image: string) => 
        image && (
          <Image
          src={image}
          className="w-12 h-12 object-cover"
            alt="Imagen"
            width={48}
            height={48}
            />
          ),
          filteredValue:undefined
        },
        {
          title: "Id",
          dataIndex: "id",
          filteredValue:undefined
        },
      ];
      
  return (
    <GenericList<ProductBase & BaseType>
      resource="products"
      title="Productos"
      columns={columns}
      pageSize={10}
    />
  );
};

// Componente principal con Suspense
export default function ProductList() {
  return (
    <Suspense fallback={<ListSkeleton />}>
      <ProductContent />
    </Suspense>
  );
}