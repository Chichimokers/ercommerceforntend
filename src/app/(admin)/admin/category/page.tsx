"use client";

import { Space } from "antd";
import { ShowButton, EditButton, DeleteButton } from "@refinedev/antd";
import { ColumnType } from "antd/es/table";
import { Category, BaseType } from "../../../../types/types";
import GenericList from "@components/generic_admin_pages/genericListPage";
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function CategoryPage() {
	return (
		<Suspense fallback={<div>Cargando categorías...</div>}>
			<CategoryContent />
		</Suspense>
	);
}

const CategoryContent: React.FC = () => {
	const searchParams = useSearchParams();
	const page = searchParams.get('page');

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

export default CategoryPage;
