"use client";

import { List, useTable, EditButton, ShowButton, DeleteButton, ExportButton } from "@refinedev/antd";
import { Table, Space, Tag } from "antd";
import { ProductBase } from "../../../../types/types";
import Image from "next/image";

export default function ProductList() {
    const { tableProps } = useTable<ProductBase>({
        sorters: { initial: [{ field: "createdAt", order: "desc" }] }
    });

    const columns = [
        { title: "ID", dataIndex: "id" },
        { title: "Nombre", dataIndex: "name" },
        { title: "Precio", dataIndex: "price" },
        { title: "Stock", dataIndex: "quantity" },
        { title: "Categoría", dataIndex: "categoryId" },
        {
            title: "Estado",
            render: (_: any, record: ProductBase) => (
                <Tag color={record.deleted_at ? "red" : "green"}>
                    {record.deleted_at ? "Inactivo" : "Activo"}
                </Tag>
            )
        },
        {
            title: "Creado",
            dataIndex: "created_at",
            render: (date: string) => new Date(date).toLocaleDateString()
        },
        {
            title: "Imagen",
            dataIndex: "image",
            render: (image: string) => (
                image && <Image src={image} className="w-12 h-12 object-cover" alt="Imagen" width={48} height={48} />
            )
        },
        {
            title: "Acciones",
            render: (record: ProductBase) => (
                <Space>
                    <ShowButton hideText recordItemId={record.id} />
                    <EditButton hideText recordItemId={record.id} />
                    <DeleteButton hideText recordItemId={record.id} />
                </Space>
            )
        }
    ];

    return (
        <List
            title="Productos"
            canCreate
            headerButtons={({ defaultButtons }) => (
                <>
                    {defaultButtons}
                    <ExportButton />
                </>
            )}
        >
            <Table {...tableProps} columns={columns} rowKey="id" />
        </List>
    );
}