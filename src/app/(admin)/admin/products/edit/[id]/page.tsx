"use client";

import { useForm, Edit } from "@refinedev/antd";
import {
	Form,
	Input,
	InputNumber,
	Select,
	Upload,
	Button,
	message,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { ProductBase } from "../../../../types/types";
import { useApiUrl } from "@refinedev/core";
import axios from "axios";

const { TextArea } = Input;

export default function ProductEdit() {
	const { formProps, saveButtonProps, queryResult } = useForm<ProductBase>({
		resource: "products",
		action: "edit",
		redirect: "list",
		meta: {
			method: "patch",
		},
	});

	const apiUrl = useApiUrl();
	const productData = queryResult?.data?.data;

	const normFile = (e: any) => {
		if (Array.isArray(e)) {
			return e;
		}
		return e?.fileList;
	};

	const handleImageUpload = async (options: any) => {
		const { file, onSuccess, onError } = options;

		try {
			const formData = new FormData();
			formData.append("file", file);

			const response = await axios.post(`${apiUrl}/upload`, formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

			onSuccess(response.data.url);
		} catch (error) {
			onError("Error al subir la imagen");
			console.error("Upload error:", error);
		}
	};

	return (
		<Edit saveButtonProps={saveButtonProps}>
			<Form {...formProps} layout="vertical">
				<Form.Item
					label="Nombre"
					name="name"
					rules={[{ required: true, message: "Por favor ingrese el nombre" }]}
				>
					<Input />
				</Form.Item>

				<Form.Item
					label="Precio"
					name="price"
					rules={[{ required: true, message: "Por favor ingrese el precio" }]}
				>
					<InputNumber
						min={0}
						formatter={(value) =>
							`$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
						}
						parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
						style={{ width: "100%" }}
					/>
				</Form.Item>

				<Form.Item
					label="Cantidad"
					name="quantity"
					rules={[{ required: true, message: "Por favor ingrese la cantidad" }]}
				>
					<InputNumber min={0} style={{ width: "100%" }} />
				</Form.Item>

				<Form.Item
					label="Descripción Corta"
					name="short_description"
					rules={[
						{
							required: true,
							message: "Por favor ingrese una descripción corta",
						},
					]}
				>
					<TextArea rows={3} />
				</Form.Item>

				<Form.Item
					label="Descripción"
					name="description"
					rules={[
						{ required: true, message: "Por favor ingrese la descripción" },
					]}
				>
					<TextArea rows={6} />
				</Form.Item>

				<Form.Item
					label="Imagen"
					name="image"
					valuePropName="fileList"
					getValueFromEvent={normFile}
				>
					<Upload
						name="image"
						listType="picture"
						customRequest={handleImageUpload}
						maxCount={1}
					>
						<Button icon={<UploadOutlined />}>Subir Imagen</Button>
					</Upload>
				</Form.Item>

				<Form.Item
					label="Categoría"
					name="product_category"
					rules={[
						{ required: true, message: "Por favor seleccione una categoría" },
					]}
				>
					<Select>
						<Select.Option value="Electrónica">Electrónica</Select.Option>
						<Select.Option value="Ropa">Ropa</Select.Option>
						<Select.Option value="Hogar">Hogar</Select.Option>
						<Select.Option value="Alimentos">Alimentos</Select.Option>
					</Select>
				</Form.Item>

				<Form.Item
					label="Subcategoría"
					name="product_subcategory"
					rules={[
						{
							required: true,
							message: "Por favor seleccione una subcategoría",
						},
					]}
				>
					<Select>
						<Select.Option value="Smartphones">Smartphones</Select.Option>
						<Select.Option value="Laptops">Laptops</Select.Option>
						<Select.Option value="Accesorios">Accesorios</Select.Option>
						<Select.Option value="Audio">Audio</Select.Option>
					</Select>
				</Form.Item>
			</Form>
		</Edit>
	);
}
