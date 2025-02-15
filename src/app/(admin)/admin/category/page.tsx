"use client";

import React from "react";
import { List, useTable, EditButton, ShowButton, DeleteButton } from "@refinedev/antd";
import { Table, Space } from "antd";
import { Category } from "../../../../types/types";

const CategoryList: React.FC = () => {
    // Configuración modificada sin sorting
    const { tableProps } = useTable<Category>({
        pagination: {
            mode: "server", // Forzar paginación en el servidor
        },
    });

    // Columnas actualizadas sin sorting
    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            // Remover sorter
        },
        {
            title: "Nombre",
            dataIndex: "name",
            // Remover sorter
        },
        {
            title: "Subcategorías",
            dataIndex: "subCategories",
            render: (subCategories: { id: number; name: string }[]) =>
                subCategories?.length > 0
                    ? subCategories.map((sub) => sub.name).join(", ")
                    : "N/A",
        },
        {
            title: "Acciones",
            render: (_: any, record: Category) => (
                <Space>
                    <ShowButton 
                        recordItemId={record.id} 
                        resource="categories"
                        meta={{ 
                            queryOptions: {
                                headers: {
                                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                                }
                            }
                        }}
                    />
                    <EditButton 
                        recordItemId={record.id} 
                        resource="categories"
                    />
                    <DeleteButton 
                        recordItemId={record.id} 
                        resource="categories"
                        meta={{
                            mutationMode: "pessimistic",
                            dataProviderName: "customProvider"
                        }}
                    />
                </Space>
            ),
        },
    ];

    return (
        <List title="Categorías">
            <Table 
                {...tableProps} 
                columns={columns} 
                rowKey="id"
                pagination={{
                    ...tableProps.pagination,
                    showSizeChanger: true,
                    pageSizeOptions: ["10", "20", "50"],
                }}
            />
        </List>
    );
};

export default CategoryList;