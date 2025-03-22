"use client";

import { Space } from "antd";
import { ShowButton, EditButton, DeleteButton } from "@refinedev/antd";
import { ColumnType } from "antd/es/table";
import { Category, BaseType } from "../../../../types/types";
import GenericList from "@components/admin/generic_admin_pages/genericListPage";
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

export default function CategoryList() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<CategoryContent />
		</Suspense>

	);
}

const CategoryContent: React.FC = () => {


	const columns: ColumnType<Category & BaseType>[] = [
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
		{
			title: "ID",
			dataIndex: "id",
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
