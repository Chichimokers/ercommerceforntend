"use client";

import { useShow, IResourceComponentsProps, useParsed } from "@refinedev/core";
import { Show, EditButton, ListButton } from "@refinedev/antd";
import { SubCategory } from "../../../../../../types/types"; // Ajusta la ruta según tu proyecto
import { Typography, Descriptions } from "antd";

const { Title } = Typography;

const SubCategoryShow: React.FC<IResourceComponentsProps> = () => {
	const { id } = useParsed();
	const { queryResult } = useShow<SubCategory>({
		resource: "sub_category",
		id,
	});

	const { data, isLoading } = queryResult;
	const record = data?.data;

	if (isLoading) return <div>Cargando...</div>;

	return (
		<Show
			title={
				<Title level={3}>Detalle de la Sub Categoría: {record?.name}</Title>
			}
		>
			<Descriptions bordered column={1}>
				<Descriptions.Item label="ID">{record?.id}</Descriptions.Item>
				<Descriptions.Item label="Nombre">{record?.name}</Descriptions.Item>
				{/* <Descriptions.Item label="Categoría">
                    {record?.categoryId}
        
                </Descriptions.Item>
                */}
			</Descriptions>
		</Show>
	);
};

export default SubCategoryShow;
