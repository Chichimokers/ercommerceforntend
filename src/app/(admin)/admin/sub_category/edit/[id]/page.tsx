"use client";

import { useState } from "react";
import { Form, Input, Select, Button, Card, message } from "antd";
import { useParams, useRouter } from "next/navigation";
import { BaseType, SubCategory, Category } from "../../../../../../types/types";
import { useOne, useList, useUpdate } from "@refinedev/core";


const { Option } = Select;

const EditSubCategory: React.FC = () => {
  const { id } = useParams();
  const router = useRouter();
  const [form] = Form.useForm();
  

  const { 
    data: subCategoryData, 
    isLoading: subCategoryLoading 
  } = useOne<SubCategory & BaseType>({
    resource: "sub_category",
    id: id as string,
  });

  const { 
    data: categoryData, 
    isLoading: categoryLoading 
  } = useList<Category & BaseType>({
    resource: "category",
  });


  const { mutate } = useUpdate();

  if (subCategoryData && !form.getFieldValue("name")) {
    form.setFieldsValue({
      name: subCategoryData.data.name,
      categoryId: subCategoryData.data.categoryId,
    });
  }

  const handleSubmit = (values: any) => {
    mutate(
      {
        resource: "sub_category",
        id: id as string,
        values: values,
      },
      {
        onSuccess: () => {
          message.success("Subcategoría actualizada correctamente");
          router.push("/admin/sub_category");
        },
        onError: (error) => {
          message.error("Error al actualizar la subcategoría");
          console.error(error);
        }
      }
    );
  };

  const handleCancel = () => {
    router.push("/admin/sub_category");
  };

 

  return (
    <Card title="Editar Subcategoría" variant="borderless">
      <Form 
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="name"
          label="Nombre"
          rules={[{ required: true, message: "Por favor ingrese un nombre" }]}
        >
          <Input placeholder="Nombre de la subcategoría" />
        </Form.Item>

        <Form.Item
          name="categoryId"
          label="Categoría"
          rules={[{ required: true, message: "Por favor seleccione una categoría" }]}
        >
          <Select 
            placeholder="Seleccione una categoría" 
            loading={categoryLoading}
            showSearch
            optionFilterProp="children"
          >
            {categoryData?.data.map((category) => (
              <Option key={category.id} value={category.id}>
                {category.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
            <Button onClick={handleCancel}>
              Cancelar
            </Button>
            <Button type="primary" htmlType="submit">
              Guardar
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default EditSubCategory;