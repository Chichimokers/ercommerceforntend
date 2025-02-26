"use client";
import { useSelect } from "@refinedev/core";
import { Form, Select } from "antd";
import { Category } from "../../types/types";

interface CategorySelectorProps {
  name: string;
  label?: string;
  required?: boolean;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  name,
  label = "Categoría",
  required = true,
}) => {
  const { options } = useSelect<Category>({
    resource: "category",
    optionLabel: "name",
    optionValue: "id",
  });

  return (
    <Form.Item
      name={name}
      label={label}
      rules={[
        {
          required,
          message: "Por favor seleccione una categoría",
        },
      ]}
    >
      <Select
        options={options}
        placeholder="Seleccione una categoría"
        showSearch
        filterOption={(input, option) =>
          (option?.label?.toString() ?? "")
            .toLowerCase()
            .includes(input.toLowerCase())
        }
      />
    </Form.Item>
  );
};
