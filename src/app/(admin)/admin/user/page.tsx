"use client";

import { BaseType } from "@/types/types";
import GenericList from "@components/admin/generic_admin_pages/genericListPage";
import { Tag } from "antd";
import { ColumnType } from "antd/es/table";

const UserListPage = () => {
  const columns: ColumnType<BaseType>[] = [
    {
      title: "Nombre",
      dataIndex: "name",
      key: "name",
      sorter: true,
    },
    {
        title: "Email",
        dataIndex: "email",
        key: "email",
        sorter: true,
      },
      {
        title: "Rol",
      dataIndex: "rol",
      key: "rol",
      render: (value: number) => (
        <Tag color={value === 1 ? "gold" : value === 2 ? "blue" : "green"}>
        {value === 1 ? "Usuario" : value === 2 ? "Administrador" : "Delivery"}
      </Tag>
      ),
      filters: [
        { text: "Admin", value: 2 },
        { text: "Delivery", value: 3},
        { text: "User", value: 1 },
      ],
    },
    
    {
      title: "Creado en",
      dataIndex: "created_at",
       key: "created_at",
       render: (text: string) => new Date(text).toLocaleDateString(),
       sorter: true,
      },
    {
      title: "Id",
      dataIndex: "id",
    } 
  ];
  
  return (
    <GenericList
      resource="user"
      title="Gestion de Usuarios"
      columns={columns}
      canCreate={true}
      pageSize={10}
    />
  );
};

export default UserListPage;
