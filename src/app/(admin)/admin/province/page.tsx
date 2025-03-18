"use client";

import { ColumnType } from "antd/es/table";
import { Province, BaseType } from "../../../../types/types";
import GenericList from "@components/admin/generic_admin_pages/genericListPage";
import { useList } from "@refinedev/core";
import { Suspense } from "react";

export default function ProvinceList() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-blue-500 border-blue-200"></div>
        <span className="ml-2">Cargando...</span>
      </div>
    }>
      <ProvinceContent />
    </Suspense>
  );
}

const ProvinceContent: React.FC = () => {
  const { data } = useList({ resource: "municipality" });

  const columns: ColumnType<Province & BaseType>[] = [
    {
      title: "Nombre",
      dataIndex: "name",
    },
    {
      title: "ID",
      dataIndex: "id",
    },
  ];
  
  return (
    <GenericList<Province & BaseType>
      resource="province"
      title="Provincias"
      columns={columns}
      pageSize={10}
    />
  );
};
