"use client";

import { ColumnType } from "antd/es/table";
import { BaseType, SubCategory } from "../../../../types/types";
import GenericList from "@components/admin/generic_admin_pages/genericListPage";

const SubCategoryList: React.FC = () => {
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

export default SubCategoryList;
