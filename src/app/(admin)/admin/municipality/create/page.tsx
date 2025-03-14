"use client";

import { Form, Input, InputNumber, Select } from "antd";
import { Create, useForm, useSelect } from "@refinedev/antd";
import { BaseType } from "../../../../../types/types";

interface Municipality extends BaseType {
  name: string;
  basePrice: string;
  minHours: number;
  maxHours: number;
  province: string;
}

export default function MunicipalityCreate() {
  const { form, formProps, saveButtonProps } = useForm<Municipality>({
    resource: "municipality",
    action: "create",
    redirect: "list",
  });

  const { selectProps: provinceSelectProps } = useSelect({
    resource: "province",
    optionLabel: "name",
    optionValue: "id",
  });

  return (
    <Create 
      title="Crear Municipio"
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

        <Form.Item
          label="Provincia"
          name="province"
          rules={[{ required: true, message: "Por favor seleccione la provincia" }]}
        >
          <Select
            {...provinceSelectProps}
            placeholder="Seleccione una provincia"
            allowClear
          />
        </Form.Item>
      </Form>
    </Create>
  );
} 