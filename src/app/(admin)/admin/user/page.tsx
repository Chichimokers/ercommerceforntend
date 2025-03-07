"use client";

import { BaseType } from "@/types/types";
import GenericList from "@components/admin/generic_admin_pages/genericListPage";
import { Tag } from "antd";
import { ColumnType } from "antd/es/table";

const UserListPage = () => {
  const columns: ColumnType<BaseType>[] = [
    {
      title: "Id",
      dataIndex: "id",
    },
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
        <Tag color={value === 1 ? "gold" : "blue"}>
          {value === 1 ? "Admin" : "User"}
        </Tag>
      ),
      filters: [
        { text: "Admin", value: 1 },
        { text: "User", value: 2 },
      ],
    },
    {
      title: "Estado del Registro",
      dataIndex: "enabled",
      key: "enabled",
      render: (value: boolean) => (
        <Tag color={value ? "green" : "red"}>
          {value ? "Active" : "Inactive"}
        </Tag>
      ),
      filters: [
        { text: "Active", value: true },
        { text: "Inactive", value: false },
      ],
    },
    {
      title: "Creado en:",
      dataIndex: "created_at",
      key: "created_at",
      render: (text: string) => new Date(text).toLocaleDateString(),
      sorter: true,
    },
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
