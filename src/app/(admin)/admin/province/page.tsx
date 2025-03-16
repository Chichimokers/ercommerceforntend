"use client";

import { ColumnType } from "antd/es/table";
import { Province, BaseType } from "../../../../types/types";
import GenericList from "@components/admin/generic_admin_pages/genericListPage";
import { useList } from "@refinedev/core";


export default function ProvinceList() {
	return (
		
			<ProvinceContent />
		
	);
}

const ProvinceContent: React.FC = () => {
    const {data} =useList({resource:"municipality"})

	const columns: ColumnType<Province & BaseType>[] = [
		{
			title: "Nombre",
			dataIndex: "name",
		},
		{
			title: "ID",
			dataIndex: "id",
		},
		
	];
	
	return (
		<GenericList<Province & BaseType>
			resource="province"
			title="Provincias"
			columns={columns}
			pageSize={10}
			/>
		);
	};
	