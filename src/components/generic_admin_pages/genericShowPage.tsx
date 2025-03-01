"use client";
import React from "react";
import { useShow, IResourceComponentsProps } from "@refinedev/core";
import { Show, EditButton, ListButton } from "@refinedev/antd";
import { Typography, Descriptions, Spin, Tag } from "antd";
import { BaseType } from "../../types/types";

const { Title } = Typography;

// Opción 1: Usando un tipo genérico que extiende BaseType
interface GenericShowProps<T extends BaseType = BaseType> extends IResourceComponentsProps {
  resource: string;
  titleField?: keyof T;  // Ahora titleField debe ser una key de T
  children?: React.ReactNode;
}

const GenericShow = <T extends BaseType = BaseType>({
  resource,
  titleField = 'id' as keyof T,  // Usamos 'id' como default ya que sabemos que existe en BaseType
  children
}: GenericShowProps<T>) => {
  const { queryResult } = useShow<T>({
    resource,
  });

  const { data, isLoading } = queryResult;
  const record = data?.data;

  if (isLoading) {
    return <Spin tip="Cargando..." size="large" />;
  }

  const titleValue = record ? record[titleField] : undefined;

  return (
    <Show
      title={<Title level={3}>{titleValue?.toString() || `#${record?.id}`}</Title>}
      headerButtons={
        <>
          <EditButton resource={resource} recordItemId={record?.id} />
          <ListButton resource={resource} />
        </>
      }
    >
      <Descriptions bordered column={1}>
        <Descriptions.Item label="ID">
          <Typography.Text copyable>{record?.id}</Typography.Text>
        </Descriptions.Item>

        <Descriptions.Item label="Estado">
          <Tag color={record?.deleted_at ? "red" : "green"}>
            {record?.deleted_at ? "Inactivo" : "Activo"}
          </Tag>
        </Descriptions.Item>


        {children}

        <Descriptions.Item label="Creado en">
          {record?.created_at ? new Date(record.created_at).toLocaleDateString() : "N/A"}
        </Descriptions.Item>
        
        <Descriptions.Item label="Modificado en">
          {record?.updated_at ? new Date(record.updated_at).toLocaleDateString() : "N/A"}
        </Descriptions.Item>
        
        {record?.deleted_at && (
          <Descriptions.Item label="Eliminado en">
            {new Date(record.deleted_at).toLocaleDateString()}
          </Descriptions.Item>
          
        )}
      </Descriptions>
    </Show>
  );
};

export default GenericShow;