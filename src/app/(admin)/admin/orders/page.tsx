"use client";

import { List, useTable, EditButton, ShowButton, DeleteButton, ExportButton } from "@refinedev/antd";
import { Table, Space, Tag } from "antd";
import { Order } from "../../../../types/types";
import { ColumnType } from "antd/es/table";

export default function OrderList() {
    const { tableProps } = useTable<Order>({
        sorters: { initial: [{ field: "createdAt", order: "desc" }] }
    });

    const columns = [
        {
            title: 'Fecha',
            dataIndex: 'created_at',
            render: (date: string) => new Date(date).toLocaleDateString(),
            sorter: true,
            defaultSortOrder: 'descend'
        },
        {
            title: 'Cliente',
            dataIndex: 'receiver_name',
            render: (name: string, record: Order) => (
                <div>
                    <div>{name}</div>
                    <div style={{ color: '#666' }}>{record.phone}</div>
                </div>
            )
        },
        {
            title: 'Ubicación',
            dataIndex: 'province',
            render: (province: string, record: Order) => (
                <div>
                    <div>{province}</div>
                    <div style={{ fontSize: '0.8em' }}>{record.address}</div>
                </div>
            )
        },
        {
            title: 'Identificación',
            dataIndex: 'CI',
            render: (ci: string) => ci || 'N/A'
        },
        {
            title: 'Monto',
            dataIndex: 'subtotal',
            render: (amount: number) => `$${amount.toFixed(2)}`,
            align: 'right'
        },
        {
            title: 'Estado',
            dataIndex: 'status',
            render: (status: string) => {
                let color = 'default';
                if (status === 'entregado') color = 'green';
                if (status === 'cancelado') color = 'red';
                if (status === 'procesando') color = 'blue';
                return <Tag color={color}>{status.toUpperCase()}</Tag>;
            }
        },
        {
            title: 'Acciones',
            render: (record: Order) => (
                <Space>
                    <ShowButton
                        hideText
                        recordItemId={record.id}
                        resource="orders"
                    />
                    <EditButton
                        hideText
                        recordItemId={record.id}
                        resource="orders"
                    />
                    <DeleteButton
                        hideText
                        recordItemId={record.id}
                        resource="orders"
                        meta={{ id: record.id }}
                    />
                </Space>
            )
        }
    ];

    return (
        <List
            title="Ordenes"
            canCreate
            headerButtons={({ defaultButtons }) => (
                <>
                    {defaultButtons}
                    <ExportButton />
                </>
            )}
        >
            <Table<Order> {...tableProps} columns={columns as ColumnType<Order>[]} rowKey="id" />
        </List>
    );
}