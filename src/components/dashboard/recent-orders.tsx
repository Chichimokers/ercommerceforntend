import { Table, Tag } from "antd";
import { useTable } from "@refinedev/antd";
import { Order } from "../../types/types";

export const RecentOrders = () => {
  const { tableProps } = useTable<Order>({
    resource: "orders",
    pagination: { pageSize: 5 },
    sorters: { initial: [{ field: "createdAt", order: "desc" }] }
  });

  const columns = [
    { title: "ID", dataIndex: "id" },
    { title: "Cliente", dataIndex: ["user", "name"] },
    { title: "Total", dataIndex: "total", render: (value: number) => `$${value}` },
    {
      title: "Estado", dataIndex: "status", render: (status: string) => (
        <Tag color={status === "entregado" ? "green" : "orange"}>{status}</Tag>
      )
    },
    { title: "Fecha", dataIndex: "createdAt" }
  ];

  return <Table {...tableProps} columns={columns} rowKey="id" pagination={false} />;
};