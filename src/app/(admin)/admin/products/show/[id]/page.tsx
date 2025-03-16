"use client";

import React from "react";
import { useShow } from "@refinedev/core";
import { Show, EditButton, ListButton } from "@refinedev/antd";
import { BaseType, ProductBase } from "../../../../../../types/types";
import { Typography, Descriptions, Image, Tag } from "antd";
const { Title, Text } = Typography;

const ProductShow = () => {
  const { queryResult } = useShow<ProductBase & BaseType>({
    resource: "products",
  });

  const { data } = queryResult;
  const record = data?.data;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <Show
      title={<Title level={3}>Detalles del Producto: {record?.name}</Title>}
    >
      <div style={{ marginBottom: 16 }}>
        <EditButton recordItemId={record?.id} resource="products" />
        <ListButton resource="products" />
      </div>

      <Descriptions bordered column={1}>
        <Descriptions.Item label="ID">{record?.id}</Descriptions.Item>
        <Descriptions.Item label="Nombre">{record?.name}</Descriptions.Item>
        
        <Descriptions.Item label="Precio">
          ${record?.price || '0'} 
        </Descriptions.Item>
        
        <Descriptions.Item label="Cantidad">
          {record?.quantity}
        </Descriptions.Item>
		<Descriptions.Item label="Cantidad">
          {record?.weight}
        </Descriptions.Item>
        
        <Descriptions.Item label="Descripción Corta">
          {record?.short_description || <Text type="secondary">N/A</Text>}
        </Descriptions.Item>
        
        <Descriptions.Item label="Descripción Completa">
          {record?.description || <Text type="secondary">N/A</Text>}
        </Descriptions.Item>

        <Descriptions.Item label="Imagen">
          {record?.image ? (
            <Image
              src={record.image}
              alt={record.name}
              width={200}
              style={{ maxHeight: 200, objectFit: "contain" }}
            />
          ) : (
            <Text type="secondary">Sin imagen</Text>
          )}
        </Descriptions.Item>

        <Descriptions.Item label="Creado en">
          {record?.created_at ? formatDate(record.created_at) : <Text type="secondary">N/A</Text>}
        </Descriptions.Item>

        <Descriptions.Item label="Actualizado en">
          {record?.updated_at ? formatDate(record.updated_at) : <Text type="secondary">N/A</Text>}
        </Descriptions.Item>

        <Descriptions.Item label="Estado">
          {record?.deleted_at ? (
            <Tag color="red">Eliminado</Tag>
          ) : (
            <Tag color="green">Activo</Tag>
          )}
        </Descriptions.Item>
      </Descriptions>
    </Show>
  );
};

export default ProductShow;