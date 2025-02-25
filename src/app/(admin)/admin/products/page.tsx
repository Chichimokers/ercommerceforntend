"use client";

import React from "react";
import { Space, Tag } from "antd";
import Image from "next/image";
import { BaseType, ProductBase } from "../../../../types/types";
import GenericList, { ExtendedColumnType } from "@components/generic_admin_pages/genericListPage";

const ProductList: React.FC = () => {
  const columns: ExtendedColumnType<ProductBase & BaseType>[] = [
    {
      title: "Id",
      dataIndex: "id",
    },
    {
      title: "Nombre",
      dataIndex: "name",
      sorter: true,
      filterSearch: true,
    },
    {
      title: "Precio",
      dataIndex: "price",
      sorter: true,
      rangeFilter: true, // Ahora es válido gracias a ExtendedColumnType
    },
    {
      title: "Stock",
      dataIndex: "quantity",
      sorter: true,
      rangeFilter: true, // Ahora es válido gracias a ExtendedColumnType
    },
    {
      title: "Categoría",
      dataIndex: "category",
      sorter: true,
    },
    {
      title: "SubCategoria",
      dataIndex: "subCategory",
		sorter:true
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

export default ProductList;