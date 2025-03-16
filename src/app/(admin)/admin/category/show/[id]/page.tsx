"use client";
import { Typography, Tag, Descriptions } from "antd";
import { useNavigation, useSelect, useShow } from "@refinedev/core";
import GenericShow from "@components/admin/generic_admin_pages/genericShowPage";
import { Category, SubCategory, BaseType } from "../../../../../../types/types";
import { useParams } from "next/navigation";

const { Text } = Typography;

const CategoryShow = () => {
	//lo optimo es usar el hook useShow pero eso hace una peticion a get category/{id} y ahi no devuelve las subCategorias
	const { query: res } = useSelect<Category>({
		resource: "category",
	});
	const { show } = useNavigation();
	const params = useParams();
	const { data } = res;
	const category = data?.data.find((c) => c.id === String(params.id));
	console.log(category, res);
	return (
		<GenericShow<Category & BaseType> resource="category" titleField="name">
			<Descriptions.Item label="Nombre">
				{category?.name || "N/A"}
			</Descriptions.Item>

			<Descriptions.Item label="Subcategorías">
				<div className="flex flex-wrap gap-2">
					{category?.subCategories?.length ? (
						category.subCategories.map((sub: { id: string; name: string }) => (
							<Tag
								key={sub.id}
								color="blue"
								style={{ cursor: "pointer" }}
								onClick={() => show("sub_category", sub.id)}
							>
								{sub.name}
							</Tag>
						))
					) : (
						<Text type="secondary">Sin subcategorías</Text>
					)}
				</div>
			</Descriptions.Item>
		</GenericShow>
	);
};

export default CategoryShow;
