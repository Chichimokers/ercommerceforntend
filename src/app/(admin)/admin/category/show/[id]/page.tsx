"use client";

import React from "react";
import { useShow, IResourceComponentsProps } from "@refinedev/core";
import { Show, EditButton, ListButton } from "@refinedev/antd";
import { Category } from "../../../../../../types/types"; 
import { Typography, Descriptions } from "antd";
const { Title } = Typography;

const CategoryShow: React.FC<IResourceComponentsProps> = () => {
    // Hook para obtener los datos de la categoría basado en el id de la URL
    const { queryResult } = useShow<Category>({
        resource: "categories",
    });

    const { data, isLoading } = queryResult;
    const record = data?.data;

    if (isLoading) return <div>Cargando...</div>;

    return (
        <Show title={<Title level={3}>Detalle de la Categoría: {record?.name}</Title>}>
            {/* Botones para editar o volver a la lista */}
            <div style={{ marginBottom: 16 }}>
                <EditButton recordItemId={record?.id} resource="categories" />
                <ListButton resource="categories" />
            </div>

            {/* Presentación de la información */}
            <Descriptions bordered column={1}>
                <Descriptions.Item label="ID">
                    {record?.id}
                </Descriptions.Item>
                <Descriptions.Item label="Nombre">
                    {record?.name}
                </Descriptions.Item>
                <Descriptions.Item label="Subcategorías">
                    {record?.subCategories && record.subCategories.length > 0
                        ? record.subCategories.map((sub) => sub.name).join(", ")
                        : "N/A"}
                </Descriptions.Item>
            </Descriptions>
        </Show>
    );
};

export default CategoryShow;
