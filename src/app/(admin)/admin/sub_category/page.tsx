"use client";

import { Suspense } from "react";
import { ColumnType } from "antd/es/table";
import { BaseType, SubCategory } from "../../../../types/types";
import GenericList from "@components/admin/generic_admin_pages/genericListPage";

// Componente de fallback para Suspense
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

// Componente de contenido que se envuelve con Suspense
const SubCategoryContent: React.FC = () => {
  const columns: ColumnType<SubCategory & BaseType>[] = [
   
    {
      title: "Nombre",
      dataIndex: "name",
      sorter: true,
    }, 
    {
      title: "Categoría",
      dataIndex: "categoryId",
      render: (categoryId: string) => `${categoryId}`,
      sorter: true,
    },
    {
      title: "Id",
      dataIndex: "id",
    },
  ];

  return (
    <GenericList<SubCategory & BaseType>
      resource="sub_category"
      title="Sub Categorías"
      columns={columns}
      pageSize={10}
    />
  );
};

// Componente principal con Suspense
export default function SubCategoryList() {
  return (
    <Suspense fallback={<ListSkeleton />}>
      <SubCategoryContent />
    </Suspense>
  );
}
