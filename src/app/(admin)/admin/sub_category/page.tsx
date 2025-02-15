"use client";

import React from "react";
import {
	List,
	useTable,
	ShowButton,
	EditButton,
	DeleteButton,
} from "@refinedev/antd";
import { Table, Space } from "antd";
import { BaseType, SubCategory } from "../../../../types/types"; // Ajusta la ruta según tu estructura

const SubCategoryList: React.FC = () => {
	// Hook para obtener y paginar la lista de subcategorías
	const { tableProps } = useTable<SubCategory & BaseType>({
		sorters: { initial: [{ field: "name", order: "asc" }] },
	});

	// Definición de las columnas para la tabla
	const columns = [
		{
			title: "ID",
			dataIndex: "id",
			sorter: true,
		},
		{
			title: "Nombre",
			dataIndex: "name",
			sorter: true,
		},
		{
			title: "Categoría",
			dataIndex: "categoryId",
			render: (categoryId: string) => `ID: ${categoryId}`,
		},
		{
			title: "Acciones",
			render: (_: any, record: SubCategory) => (
				<Space>
					<ShowButton recordItemId={record.id} resource="sub_categories" />
					<EditButton recordItemId={record.id} resource="sub_categories" />
					<DeleteButton recordItemId={record.id} resource="sub_categories" />
				</Space>
			),
		},
	];

	return (
		<List title="Sub Categorías">
			<Table {...tableProps} columns={columns} rowKey="id" />
		</List>
	);
};

export default SubCategoryList;
