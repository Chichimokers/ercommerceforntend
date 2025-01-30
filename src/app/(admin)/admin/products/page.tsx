"use client";

import { List, useTable, EditButton, ShowButton, DeleteButton, ExportButton } from "@refinedev/antd";
import { Table, Space, Tag } from "antd";
import { ProductBase } from "../../../../types/types";

export default function ProductList() {
    const { tableProps } = useTable<ProductBase>({
        sorters: { initial: [{ field: "createdAt", order: "desc" }] }
    });

    const columns = [
        { title: "Nombre", dataIndex: "name" },
        { title: "Precio", dataIndex: "price" },
        { title: "Stock", dataIndex: "stock" },
        { title: "Categoría", dataIndex: ["category", "name"] },
        {
            title: "Estado", dataIndex: "status", render: (status: string) => (
                <Tag color={status === "active" ? "green" : "red"}>{status}</Tag>
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