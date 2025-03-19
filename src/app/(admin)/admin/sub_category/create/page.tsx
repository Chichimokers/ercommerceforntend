"use client";

import React from "react";
import { Form, Input } from "antd";
import { Create } from "@refinedev/antd";
import { useForm } from "@refinedev/antd";
import { BaseType, SubCategory } from "../../../../../types/types";
import { CategorySelector } from "@components/selects/category-selector";

export default function SubCategoryCreate() {
  const { form, formProps, saveButtonProps } = useForm<SubCategory & BaseType>({
    resource: "sub_category",
    redirect: "show",
    action: "create",
  });

  return (
    <Create title="Crear Subcategoría" saveButtonProps={saveButtonProps}>
      <Form {...formProps} form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Nombre"
          rules={[{ required: true, message: "El nombre es obligatorio" }]}
        >
          <Input placeholder="Nombre de la subcategoría" />
        </Form.Item>

        <CategorySelector
          name="categoryId"
          label="Categoría Padre"
          required={true}
        />
      </Form>
    </Create>
  );
}
  