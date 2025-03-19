"use client";

import { Form, Input, InputNumber } from "antd";
import { Edit, useForm } from "@refinedev/antd";
import { BaseType } from "../../../../../../types/types";

interface Municipality extends BaseType {
  name: string;
  basePrice: string;
  minHours: number;
  maxHours: number;
  province: string;
}

export default function MunicipalityEdit() {
  const { form, formProps, saveButtonProps } = useForm<Municipality>({
    resource: "municipality",
    action: "edit",
    redirect: "list",
  });

  return (
    <Edit 
      title="Editar Municipio"
      saveButtonProps={saveButtonProps}
    >
      <Form {...formProps} form={form} layout="vertical">
        <Form.Item
          label="Nombre"
          name="name"
          rules={[{ required: true, message: "Por favor ingrese el nombre" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Precio Base"
          name="basePrice"
          rules={[{ required: true, message: "Por favor ingrese el precio base" }]}
        >
          <Input prefix="$" />
        </Form.Item>

        <Form.Item
          label="Horas Mínimas"
          name="minHours"
          rules={[{ required: true, message: "Por favor ingrese las horas mínimas" }]}
        >
          <InputNumber min={1} />
        </Form.Item>

        <Form.Item
          label="Horas Máximas"
          name="maxHours"
          rules={[{ required: true, message: "Por favor ingrese las horas máximas" }]}
        >
          <InputNumber min={1} />
        </Form.Item>

      </Form>
    </Edit>
  );
} 