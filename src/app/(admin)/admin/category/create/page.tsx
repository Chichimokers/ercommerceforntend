"use client";

import { Input, Form } from "antd";
import { BaseType, Category } from "../../../../../types/types";
import GenericCreatePage from "@components/generic_admin_pages/genericCreatePage";

const CategoryCreate: React.FC = () => {
	return (
		<GenericCreatePage<Category & BaseType>
			resource="category"
			title="Crear Categoría"
		>
			<Form.Item
				name="name"
				label="Nombre"
				rules={[{ required: true, message: "El nombre es obligatorio" }]}
			>
				<Input placeholder="Nombre de la categoría" />
			</Form.Item>
		</GenericCreatePage>
	);
};

export default CategoryCreate;
