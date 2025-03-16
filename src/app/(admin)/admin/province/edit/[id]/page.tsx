"use client";

import { Form, Input } from "antd";
import { Edit, useForm, SaveButton } from "@refinedev/antd";
import { BaseType, Province } from "../../../../../../types/types";
import { useParams } from "next/navigation";

export default function CategoryEdit() {
	const { id } = useParams();
	const { formProps, saveButtonProps, queryResult } = useForm<
		Province & BaseType
	>({
		resource: "province",
		action: "edit",
		id: id ? String(id) : undefined,
	});

	const pData = queryResult?.data?.data;

	return (
		<Edit title="Editar Provincia" saveButtonProps={saveButtonProps}>
			<Form {...formProps} layout="vertical" initialValues={pData}>
				<Form.Item
					name="name"
					label="Nombre de la Provincia"
					rules={[{ required: true, message: "El nombre es obligatorio" }]}
				>
					<Input placeholder="Nombre de la Provincia" />
				</Form.Item>
			</Form>
		</Edit>
	);
}
