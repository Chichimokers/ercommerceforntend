"use client";

import { ColumnType } from "antd/es/table";
import { BaseType, SubCategory } from "../../../../types/types";
import GenericList from "@components/generic_admin_pages/genericListPage";

const SubCategoryList: React.FC = () => {
  const columns: ColumnType<SubCategory & BaseType>[] = [
    {
      title: "Id",
      dataIndex: "id",
    },
    {
      title: "Nombre",
      dataIndex: "name",
      sorter: true,
    },
    {
      title: "Categoría",
      dataIndex: "categoryId",
      render: (categoryId: string) => `Id: ${categoryId}`,
      sorter: true,
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
