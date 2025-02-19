"use client";

import React from "react";
import { useShow, IResourceComponentsProps } from "@refinedev/core";
import { Show, EditButton, ListButton } from "@refinedev/antd";
import { Order, BaseType } from "../../../../../../types/types";
import { Typography, Descriptions } from "antd";

const { Title } = Typography;

const OrderShow: React.FC<IResourceComponentsProps> = () => {
	const { queryResult } = useShow<Order & BaseType>({
		resource: "orders",
	});

	const { data, isLoading } = queryResult;
	const record = data?.data;

	if (isLoading) {
		return <div>Cargando...</div>;
	}

	return (
		<Show title={<Title level={3}>Detalles de la Orden #{record?.id}</Title>}>
			{/* Botones de acción: Editar y Volver a la lista */}
			<div style={{ marginBottom: 16 }}>
				<EditButton recordItemId={record?.id} resource="orders" />
				<ListButton />
			</div>

			{/* Detalle de la orden usando Descriptions */}
			<Descriptions bordered column={1}>
				<Descriptions.Item label="Fecha">
					{record?.created_at
						? new Date(record.created_at).toLocaleDateString()
						: "N/A"}
				</Descriptions.Item>
				<Descriptions.Item label="Cliente">
					{record?.receiver_name} - {record?.phone}
				</Descriptions.Item>
				<Descriptions.Item label="Ubicación">
					{record?.province} - {record?.address}
				</Descriptions.Item>
				<Descriptions.Item label="Identificación">
					{record?.CI || "N/A"}
				</Descriptions.Item>
				<Descriptions.Item label="Monto">
					${record?.subtotal.toFixed(2)}
				</Descriptions.Item>
				<Descriptions.Item label="Estado">
					{record?.status.toUpperCase()}
				</Descriptions.Item>
			</Descriptions>
		</Show>
	);
};

export default OrderShow;
