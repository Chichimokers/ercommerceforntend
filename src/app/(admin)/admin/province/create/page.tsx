"use client";

import React from "react";
import { Form, Input } from "antd";
import { Create } from "@refinedev/antd";
import { useForm } from "@refinedev/antd";
import { BaseType, Province } from "../../../../../types/types";

export default function ProvinceCreate() {
  const { form, formProps, saveButtonProps } = useForm<Province & BaseType>({
    resource: "province",
    redirect: "show",
    action: "create",
  });

  return (
    <Create title="Añadir Provincia" saveButtonProps={saveButtonProps}>
      <Form {...formProps} form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Nombre"
          rules={[{ required: true, message: "El nombre es obligatorio" }]}
        >
          <Input placeholder="Nombre de la provincia" />
        </Form.Item>
      </Form>
    </Create>
  );
}