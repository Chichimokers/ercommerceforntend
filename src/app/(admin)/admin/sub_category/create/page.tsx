"use client";
import { Form, Input } from "antd";
import { BaseType, SubCategory } from "../../../../../types/types";
import GenericCreatePage from "@components/generic_admin_pages/genericCreatePage";
import { CategorySelector } from "@components/selects/category-selector";

const SubCategoryCreate: React.FC = () => {
  return (
    <GenericCreatePage<SubCategory & BaseType>
      resource="sub_category"
      title="Crear Subcategoría"
    >
      <Form.Item
        label="Nombre"
        name="name"
        rules={[
          {
            required: true,
            message: "Por favor ingrese el nombre de la subcategoría",
          },
        ]}
      >
        <Input />
      </Form.Item>

      <CategorySelector
        name="categoryId"
        label="Categoría Padre"
        required={true}
      />
    </GenericCreatePage>
  );
};

export default SubCategoryCreate;
