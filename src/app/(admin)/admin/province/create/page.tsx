"use client";

import { Input, Form } from "antd";
import { BaseType, Province } from "../../../../../types/types";
import GenericCreatePage from "@components/admin/generic_admin_pages/genericCreatePage";

export default function ProvinceCreate() {
  return (
    <GenericCreatePage<Province & BaseType>
      resource="province"
      title="Añadir Provincia"
    >

      <Form.Item
        name="name"
        label="Nombre"
        rules={[{ required: true, message: "El nombre es obligatorio" }]}
      >
        <Input placeholder="Nombre de la provincia" />
      </Form.Item>
    </GenericCreatePage>
  );
}