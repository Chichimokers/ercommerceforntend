"use client";

import React from "react";
import { useShow } from "@refinedev/core";
import { Show, EditButton, ListButton, RefreshButton } from "@refinedev/antd";
import { BaseType, Category, ProductBase, SubCategory } from "../../../../../../types/types";
import { Typography, Descriptions, Image, Tag, List, Space } from "antd";
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
    <Show    headerButtons 
      title={<Title level={3}>Detalles del Producto: {record?.name}</Title>}
    >
      <div style={{ marginBottom: 16 }}>
        <EditButton style={{ marginRight: 8 }} recordItemId={record?.id} resource="products" />
        <ListButton style={{ marginRight: 8 }} resource="products" />
        <RefreshButton  resource="products" />
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
		<Descriptions.Item label="Peso">
          {record?.weight } kg
        </Descriptions.Item>
        
        <Descriptions.Item label="Descripción Corta">
          {record?.short_description || <Text type="secondary">N/A</Text>}
        </Descriptions.Item>

        
        <Descriptions.Item label="Descripción Completa">
          {record?.description || <Text type="secondary">N/A</Text>}
        </Descriptions.Item>
        <Descriptions.Item label="Presente en el inventario de:">
          {record?.province || <Text type="secondary">N/A</Text>}
        </Descriptions.Item>
        <Descriptions.Item label="Categoria">
          {record?.category || <Text type="secondary">N/A</Text>}
        </Descriptions.Item>
        <Descriptions.Item label="SubCategoria">
          {record?.subCategory|| <Text type="secondary">N/A</Text>}
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
        

        <Descriptions.Item label="Descuento">
        <ul>
        <li>Cantidad Para aplicar:  {record?.discount?.min || "N/A"}</li>
                <hr style={{marginTop:"15px",marginBottom:"15px"}}/>
        <li>Reduccion al Precio base: {record?.discount?.reduction || "N/A"}</li>
        </ul>
        

        </Descriptions.Item>


        <Descriptions.Item label="Creado en">
          {record?.created_at ? formatDate(record.created_at) : <Text type="secondary">N/A</Text>}
        </Descriptions.Item>

        <Descriptions.Item label="Actualizado en">
          {record?.updated_at ? formatDate(record.updated_at) : <Text type="secondary">N/A</Text>}
        </Descriptions.Item>

  
      </Descriptions>
    </Show>
  );
};

export default ProductShow;