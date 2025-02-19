"use client";

import React from "react";
import { useShow, IResourceComponentsProps } from "@refinedev/core";
import { Show, EditButton, ListButton } from "@refinedev/antd";
import { SubCategory } from "../../../../../../types/types"; // Ajusta la ruta según tu proyecto
import { Typography, Descriptions } from "antd";

const { Title } = Typography;

const SubCategoryShow: React.FC<IResourceComponentsProps> = () => {
	// Hook para obtener los datos de la subcategoría según el id en la URL
	const { queryResult } = useShow<SubCategory>({
		resource: "sub_categories",
	});

	const { data, isLoading } = queryResult;
	const record = data?.data;

	if (isLoading) return <div>Cargando...</div>;

	return (
		<Show
			title={
				<Title level={3}>Detalle de la Sub Categoría: {record?.name}</Title>
			}
		>
			{/* Botones para editar o volver a la lista */}
			<div style={{ marginBottom: 16 }}>
				<EditButton recordItemId={record?.id} resource="sub_categories" />
				<ListButton resource="sub_categories" />
			</div>

			{/* Información detallada de la subcategoría */}
			<Descriptions bordered column={1}>
				<Descriptions.Item label="ID">{record?.id}</Descriptions.Item>
				<Descriptions.Item label="Nombre">{record?.name}</Descriptions.Item>
				{/* <Descriptions.Item label="Categoría">
                    {record?.categoryId}
        
                </Descriptions.Item>
                */}
			</Descriptions>
		</Show>
	);
};

export default SubCategoryShow;
