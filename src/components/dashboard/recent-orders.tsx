import { Table, Tag } from "antd";
import { useTable } from "@refinedev/antd";
import { BaseType, Order } from "../../types/types";

export const RecentOrders = () => {
	const { tableProps } = useTable<Order & BaseType>({
		resource: "orders",
		pagination: { pageSize: 5 },
		sorters: { initial: [{ field: "created_at", order: "desc" }] },
	});

	const columns = [
		{ title: "ID", dataIndex: "id" },
		{ title: "Cliente", dataIndex: ["user", "name"] },
		{
			title: "Total",
			dataIndex: "total",
			render: (value: number) => `$${value}`,
		},
		{
			title: "Estado",
			dataIndex: "status",
			render: (status: string) => (
				<Tag color={status === "entregado" ? "green" : "orange"}>{status}</Tag>
			),
		},
		{
			title: "Fecha",
			dataIndex: "created_at",
			render: (value: string) => value.split("T")[0],
		},
	];

	return (
		<Table {...tableProps} columns={columns} rowKey="id" pagination={false} />
	);
};
