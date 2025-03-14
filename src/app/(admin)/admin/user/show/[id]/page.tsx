"use client";

import React from "react";
import { useShow } from "@refinedev/core";
import { Show, EditButton, ListButton, RefreshButton } from "@refinedev/antd";
import { Typography, Descriptions, Tag } from "antd";
const { Title } = Typography;

interface IUser {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  name: string;
  email: string;
  rol: number;
  password: string;
  enabled: boolean;
  refresh_token: string | null;
  last_login: string;
  locked: boolean;
}

const UserShow: React.FC = () => {
  const { queryResult } = useShow<IUser>({
    resource: "user",
  });
  const { data } = queryResult;
  const record = data?.data;
  console.log({...record})

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <Show
      headerButtons
      title={<Title level={3}>Detalles del Usuario: {record?.name}</Title>}
    >
      <div style={{ marginBottom: 16 }}>
        <EditButton style={{ marginRight: 8 }} recordItemId={record?.id} resource="user" />
        <ListButton style={{ marginRight: 8 }} resource="user" />
        <RefreshButton resource="user" />
      </div>

      <Descriptions bordered column={1}>
        <Descriptions.Item label="ID">{record?.id}</Descriptions.Item>
        <Descriptions.Item label="Nombre">{record?.name}</Descriptions.Item>
        <Descriptions.Item label="Email">{record?.email}</Descriptions.Item>
        <Descriptions.Item label="Rol">
  {record?.rol === 1 ? 'Usuario' : record?.rol === 2 ? 'Administrador' : 'Delivery'}
</Descriptions.Item>

        <Descriptions.Item label="Habilitado">
          {record?.enabled ? <Tag color="green">Activo</Tag> : <Tag color="red">Inactivo</Tag>}
        </Descriptions.Item>
        <Descriptions.Item label="Bloqueado">
          {record?.locked ? <Tag color="red">Sí</Tag> : <Tag color="green">No</Tag>}
        </Descriptions.Item>
        <Descriptions.Item label="Último inicio de sesión">
          {record?.last_login ? formatDate(record.last_login) : 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="Creado en">
          {record?.created_at ? formatDate(record.created_at) : 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="Actualizado en">
          {record?.updated_at ? formatDate(record.updated_at) : 'N/A'}
        </Descriptions.Item>
      </Descriptions>
    </Show>
  );
};

export default UserShow;
