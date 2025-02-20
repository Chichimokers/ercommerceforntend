"use client";

import { Space } from "antd";
import { ShowButton, EditButton, DeleteButton } from "@refinedev/antd";
import { ColumnType } from "antd/es/table";
import { Category, BaseType } from "../../../../types/types";
import GenericList from "@components/generic_admin_pages/genericListPage";

const CategoryList: React.FC = () => {
	const columns: ColumnType<Category & BaseType>[] = [
		{
			title: "ID",
			dataIndex: "id",
		},
		{
			title: "Nombre",
			dataIndex: "name",
		},
		{
			title: "Subcategorías",
			dataIndex: "subCategories",
			render: (subCategories: { id: number; name: string }[]) =>
				subCategories?.length > 0
					? subCategories.map((sub) => sub.name).join(", ")
					: "N/A",
		},
	
	];

	return (
		<GenericList<Category & BaseType>
			resource="category"
			title="Categorías"
			columns={columns}
			pageSize={10}
		/>
	);
};

export default CategoryList;
