"use client";
import { useForm, useSelect } from "@refinedev/antd";
import {
	BaseType,
	Category,
	ProductBase,
	SubCategory,
} from "../../../../../../types/types";
import { Form, Input, Select, Button, Row, Col } from "antd";
import { useParams } from "next/navigation";

const EditProductPage: React.FC = () => {
	const params = useParams();
	const {
		formProps,
		saveButtonProps,
		query: productResult,
	} = useForm<ProductBase>({
		resource: "products",
		id: params.id ? String(params.id) : undefined,
		action: "edit",
	});
	const product = productResult?.data?.data;

	const { selectProps: categorySelectProps, queryResult: categoriesResult } =
		useSelect<Category & BaseType>({
			resource: "category",
		});
	const categories = categoriesResult?.data?.data;

	const categoryOfProduct = categories?.find(
		(category) => Number(category.name) === Number(product?.category),
	);
	const {
		selectProps: subCategorySelectProps,
		queryResult: subCategoriesResult,
	} = useSelect<SubCategory & BaseType>({
		resource: "sub_category",
	});
	const scat = subCategoriesResult?.data?.data;
	const subcategoryOfProduct = scat?.filter(
		(sc) => sc.id === categoryOfProduct?.id,
	);
	return (
		<>
			<Row
				justify="center"
				style={{
					paddingTop: 24,
					paddingBottom: 24,
				}}
			>
				<Col
					style={{
						textAlign: "center",
					}}
				>
					<h2>{`Editar Producto: "${product?.name}"`}</h2>
					<h2>{`Categoria: ${categoryOfProduct?.name}`}</h2>
					<h2>{`Sub-Categoria: ${product?.subcategory || "N/A"}`}</h2>
					<h2>{`Precio: ${product?.price}`}</h2>
				</Col>
			</Row>
			<Row justify="center">
				<Col span={12}>
					<Form {...formProps} layout="vertical">
						<Form.Item
							label="Name"
							name="name"
							rules={[
								{
									required: true,
								},
							]}
						>
							<Input />
						</Form.Item>
						<Form.Item
							label="Categoria"
							name={["category", "id"]}
							rules={[
								{
									required: true,
								},
							]}
						>
							<Select {...categorySelectProps} />
						</Form.Item>
						<Form.Item
							label="Sub-Categoria"
							name={["subcategory", "id"]}
							rules={[
								{
									required: true,
								},
							]}
						>
							<Select {...categorySelectProps} />
						</Form.Item>

						<Button type="primary" {...saveButtonProps}>
							Save
						</Button>
					</Form>
				</Col>
			</Row>
		</>
	);
};
export default EditProductPage;
