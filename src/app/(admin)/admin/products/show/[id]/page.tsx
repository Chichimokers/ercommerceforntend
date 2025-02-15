"use client";

import React from "react";
import { useShow, IResourceComponentsProps } from "@refinedev/core";
import { Show, EditButton, ListButton } from "@refinedev/antd";
import { BaseType, ProductBase } from "../../../../../../types/types";
import { Typography, Descriptions } from "antd";
const { Title } = Typography;

const ProductShow: React.FC<IResourceComponentsProps> = () => {
	// Hook para obtener los datos del producto basándose en el id que llega por la URL
	const { queryResult } = useShow<ProductBase & BaseType>({
		resource: "products",
	});

	const { data, isLoading } = queryResult;
	const record = data?.data;

	if (isLoading) {
		return <div>Cargando...</div>;
	}

	return (
		<Show
			title={<Title level={3}>Detalles del Producto: {record?.name}</Title>}
		>
			{/* Botones de acción para editar y volver a la lista */}
			<div style={{ marginBottom: 16 }}>
				<EditButton recordItemId={record?.id} resource="products" />
				<ListButton resource="products" />
			</div>

			{/* Información detallada del producto */}
			<Descriptions bordered column={1}>
				<Descriptions.Item label="ID">{record?.id}</Descriptions.Item>
				<Descriptions.Item label="Nombre">{record?.name}</Descriptions.Item>
				<Descriptions.Item label="Precio">
					${record?.price.toFixed(2)}
				</Descriptions.Item>
				<Descriptions.Item label="Cantidad">
					{record?.quantity}
				</Descriptions.Item>
				<Descriptions.Item label="Descripción Corta">
					{record?.short_description}
				</Descriptions.Item>
				<Descriptions.Item label="Descripción">
					{record?.description}
				</Descriptions.Item>
				{/* Agrega más campos si es necesario */}
			</Descriptions>
		</Show>
	);
};

export default ProductShow;
