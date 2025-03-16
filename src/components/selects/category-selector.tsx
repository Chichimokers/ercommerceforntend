"use client";

import React from "react";
import { Form, Select } from "antd";
import { useSelect } from "@refinedev/core";
import { BaseType } from "../../types/types";

interface Category extends BaseType {
  name: string;
}

interface CategorySelectorProps {
  name: string;
  label: string;
  required?: boolean;
  onChange?: (value: string) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  name,
  label,
  required = false,
  onChange,
}) => {
  // Fetch categories
  const { options: categoryOptions } = useSelect<Category>({
    resource: "category",
    optionLabel: "name",
    optionValue: "id",
  });

  return (
    <Form.Item
      label={label}
      name={name}
      rules={[
        {
          required: required,
          message: `Por favor seleccione una ${label.toLowerCase()}`,
        },
      ]}
    >
      <Select
        options={categoryOptions}
        placeholder={`Seleccione una ${label.toLowerCase()}`}
        showSearch
        filterOption={(input, option) =>
          (option?.label?.toString() ?? "")
            .toLowerCase()
            .includes(input.toLowerCase())
        }
        onChange={(value) => {
          if (onChange) {
            onChange(value);
          }
        }}
        allowClear
      />
    </Form.Item>
  );
};