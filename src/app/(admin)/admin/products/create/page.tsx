"use client";

import React, { useState } from "react";
import { Form, Input, InputNumber, Upload, Select, Card, Space, Switch } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useSelect } from "@refinedev/core";
import { BaseType } from "../../../../../types/types";
import GenericCreatePage from "@components/admin/generic_admin_pages/genericCreatePage";
import { CategorySelector } from "@components/selects/category-selector";

interface Product extends BaseType {
  name: string;
  price: number;
  quantity: number;
  short_description: string;
  description: string;
  discount?: {
    min: number;
    reduction: number;
  };
  category?: string;
  subCategory?: string;
  image?: string;
}

interface SubCategory extends BaseType {
  name: string;
  categoryId: string;
}

const ProductCreate: React.FC = () => {
  const [form] = Form.useForm();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [applyDiscount, setApplyDiscount] = useState(false);

  // Fetch subcategories based on the selected category
  const { options: subCategoryOptions } = useSelect<SubCategory>({
    resource: "sub_category",
    optionLabel: "name",
    optionValue: "id",
    filters: [
      {
        field: "categoryId",
        operator: "eq",
        value: selectedCategory,
      },
    ],
    queryOptions: {
      enabled: !!selectedCategory,
    },
  });

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    // Clear subcategory when category changes
    form.setFieldsValue({ subCategory: undefined });
  };

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  // Handle discount toggle change
  const handleDiscountToggleChange = (checked: boolean) => {
    setApplyDiscount(checked);
    if (!checked) {
      // Clear discount values when toggled off
      form.setFieldsValue({ 
        discount: undefined
      });
    }
  };

  return (
    <GenericCreatePage<Product>
      resource="products"
      title="Crear Producto"    
    >
      <Form.Item
        label="Nombre"
        name="name"
        rules={[
          {
            required: true,
            message: "Por favor ingrese el nombre del producto",
          },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="Peso en Kg"
        name="weight"
        rules={[
          {
            required: true,
            message: "Por favor ingrese el peso del producto",
          },
        ]}
      >
        <InputNumber min={0.001} precision={2} style={{width:"100%"}} />
      </Form.Item>

      <Form.Item
        label="Precio"
        name="price"
        rules={[
          {
            required: true,
            message: "Por favor ingrese el precio del producto",
          },
        ]}
      >
        <InputNumber
          min={0}
          precision={2}
          style={{ width: '100%' }}
          formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
        />
      </Form.Item>

      <Form.Item
        label="Cantidad"
        name="quantity"
        rules={[
          {
            required: true,
            message: "Por favor ingrese la cantidad disponible",
          },
        ]}
      >
        <InputNumber min={0} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        label="Descripción Corta"
        name="short_description"
        rules={[
          {
            required: true,
            message: "Por favor ingrese una descripción corta",
          },
        ]}
      >
        <Input.TextArea rows={2} />
      </Form.Item>

      <Form.Item
        label="Descripción Completa"
        name="description"
        rules={[
          {
            required: true,
            message: "Por favor ingrese la descripción completa",
          },
        ]}
      >
        <Input.TextArea rows={4} />
      </Form.Item>

      {/* Discount Section */}
      <Card 
        title="Descuento" 
        style={{ marginBottom: '24px' }}
        extra={
          <Form.Item name="applyDiscount" valuePropName="checked" noStyle>
            <Switch 
              checkedChildren="Aplicar" 
              unCheckedChildren="No aplicar" 
              onChange={handleDiscountToggleChange}
            />
          </Form.Item>
        }
      >
        {applyDiscount && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Form.Item
              name={["discount", "min"]}
              label="Cantidad mínima"
              rules={[
                {
                  required: applyDiscount,
                  message: "Por favor ingrese la cantidad mínima para aplicar el descuento",
                },
              ]}
            >
              <InputNumber 
                min={1} 
                style={{ width: '100%' }} 
                placeholder="Cantidad mínima de unidades"
              />
            </Form.Item>
            
            <Form.Item
              name={["discount", "reduction"]}
              label="Reducción de precio (%)"
              rules={[
                {
                  required: applyDiscount,
                  message: "Por favor ingrese el porcentaje de descuento",
                },
              ]}
            >
              <InputNumber 
                min={0.1} 
                max={100} 
                step={0.1} 
                precision={1} 
                style={{ width: '100%' }} 
                placeholder="Porcentaje de descuento"
                formatter={value => `${value}%`}
              />
            </Form.Item>
          </Space>
        )}
        {!applyDiscount && (
          <div style={{ textAlign: 'center', color: '#999', padding: '20px 0' }}>
            Active para aplicar un descuento a este producto
          </div>
        )}
      </Card>

      
      <CategorySelector
        name="category"
        label="Categoría"
        required={false}
        onChange={handleCategoryChange}
      />

      <Form.Item
        label="Subcategoría"
        name="subCategory"
        dependencies={['category']}
      >
        <Select
          options={subCategoryOptions}
          placeholder="Seleccione una subcategoría"
          disabled={!selectedCategory}
          showSearch
          filterOption={(input, option) =>
            (option?.label?.toString() ?? "")
              .toLowerCase()
              .includes(input.toLowerCase())
          }
          onChange={() => {
            const categoryValue = form.getFieldValue("category");
            if (!selectedCategory && categoryValue) {
              setSelectedCategory(categoryValue);
            }
          }}
          allowClear
        />
      </Form.Item>

      <Form.Item
        label="Imagen"
        name="image"
        valuePropName="fileList"
        getValueFromEvent={normFile}
      >{/*Hay que ver esto !!*/ }
        <Upload
          name="image"
          listType="picture"
          maxCount={1}
          beforeUpload={() => false}
        >
          <div style={{ marginTop: 8 }}>
            <button 
              type="button" 
              style={{ 
                border: '1px dashed #d9d9d9', 
                padding: '8px 16px', 
                background: 'none',
                cursor: 'pointer'
              }}
            >
              <UploadOutlined /> Subir Imagen
            </button>
          </div>
        </Upload>
      </Form.Item>
    </GenericCreatePage>
  );
};

export default ProductCreate;