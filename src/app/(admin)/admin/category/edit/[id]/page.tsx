"use client";

import { Form, Input } from "antd";
import { Edit, useForm, SaveButton } from "@refinedev/antd";
import { BaseType, Category } from "../../../../../../types/types";
import { useParams } from "next/navigation";

export default function CategoryEdit() {
	const { id } = useParams();
	const { formProps, saveButtonProps, queryResult } = useForm<
		Category & BaseType
	>({
		resource: "category",
		action: "edit",
		id: id ? String(id) : undefined,
	});

	const categoryData = queryResult?.data?.data;

	return (
		<Edit title="Editar Categoría" saveButtonProps={saveButtonProps}>
			<Form {...formProps} layout="vertical" initialValues={categoryData}>
				<Form.Item
					name="name"
					label="Nombre de la Categoría"
					rules={[{ required: true, message: "El nombre es obligatorio" }]}
				>
					<Input placeholder="Nombre de la categoría" />
				</Form.Item>
			</Form>
		</Edit>
	);
}
