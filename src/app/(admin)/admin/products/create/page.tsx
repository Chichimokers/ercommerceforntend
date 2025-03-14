"use client";

import React, { useState, useEffect } from "react";
import { Create, useForm } from "@refinedev/antd";
import { Form, Input, InputNumber, Upload, Select, Card, Space, Switch } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useList } from "@refinedev/core";
import { BaseType, Category, ProductBase, Province, SubCategory } from "../../../../../types/types";
import { CategorySelector } from "@components/selects/category-selector";

const ProductCreate: React.FC = () => {
  const { form, formProps, saveButtonProps } = useForm<ProductBase & BaseType>({
    resource: "products",
    action: "create",
    redirect:false
  });

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [applyDiscount, setApplyDiscount] = useState(false);
  const [productPrice, setProductPrice] = useState<number | null>(null);
  const [productQuantity, setProductQuantity] = useState<number | null>(null);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);

  const { data: categoriesData } = useList<Category>({
    resource: "category",
  });

  const { data: provinceData } = useList<Province>({
    resource: "province",
  });

  
  useEffect(() => {
    const price = form.getFieldValue("price");
    if (price !== undefined) {
      setProductPrice(price);
    }

    const quantity = form.getFieldValue("quantity");
    if (quantity !== undefined) {
      setProductQuantity(quantity);
    }
  }, [form]);

  useEffect(() => {
    if (selectedCategory) {
      const categoryFound = categoriesData?.data.find(
        (c) => selectedCategory === c.id
      );
      setSubCategories(categoryFound?.subCategories || []);
    } else {
      setSubCategories([]);
    }
  }, [selectedCategory, categoriesData?.data]);

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    form.setFieldsValue({ subCategory: undefined });
  };

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const handleDiscountToggleChange = (checked: boolean) => {
    setApplyDiscount(checked);
    if (!checked) {
      form.setFieldsValue({
        min: undefined,
        reduction: undefined,
      });
    }
  };

  const handlePriceChange = (value: number | null) => {
    setProductPrice(value);
  };

  const handleQuantityChange = (value: number | null) => {
    setProductQuantity(value);
  };

  return (
    <Create
      
    saveButtonProps={{ ...saveButtonProps, variant: "solid", color: "blue" }}
      title="Crear Producto"
      
    >
      <Form {...formProps} form={form} layout="vertical">
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
          <InputNumber min={0.001} precision={2} style={{ width: "100%" }} />
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
            style={{ width: "100%" }}
            formatter={(value) =>
              `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            onChange={handlePriceChange}
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
          <InputNumber
            min={0}
            style={{ width: "100%" }}
            onChange={handleQuantityChange}
          />
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

        {/* Sección de Descuento */}
        <Card
          title="Descuento"
          style={{ marginBottom: "24px" }}
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
          {applyDiscount ? (
            <Space direction="vertical" style={{ width: "100%" }}>
              <Form.Item
                name="min"
                label="Cantidad mínima"
                rules={[
                  {
                    required: applyDiscount,
                    message:
                      "Por favor ingrese la cantidad mínima para aplicar el descuento",
                  },
                  () => ({
                    validator(_, value) {
                      if (!value) return Promise.resolve();
                      if (productQuantity !== null && value > productQuantity) {
                        return Promise.reject(
                          "La cantidad mínima no puede ser mayor que la cantidad disponible"
                        );
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <InputNumber
                  min={1}
                  style={{ width: "100%" }}
                  placeholder="Cantidad mínima de unidades"
                  disabled={productQuantity === null || productQuantity <= 0}
                />
              </Form.Item>

              <Form.Item
                name="reduction"
                label="Descuento fijo ($)"
                rules={[
                  {
                    required: applyDiscount,
                    message: "Por favor ingrese el monto de descuento",
                  },
                  () => ({
                    validator(_, value) {
                      if (!value) return Promise.resolve();
                      if (productPrice !== null && value >= productPrice) {
                        return Promise.reject(
                          "El descuento no puede ser mayor o igual que el precio base"
                        );
                      }
                      if (value <= 0) {
                        return Promise.reject("El descuento debe ser mayor que cero");
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <InputNumber
                  min={0.01}
                  precision={2}
                  style={{ width: "100%" }}
                  placeholder="Monto de descuento"
                  formatter={(value) =>
                    `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  disabled={productPrice === null || productPrice <= 0}
                />
              </Form.Item>
            </Space>
          ) : (
            <div
              style={{
                textAlign: "center",
                color: "#999",
                padding: "20px 0",
              }}
            >
              Active para aplicar un descuento a este producto
            </div>
          )}
        </Card>

        {/* Selección de Categoría y Subcategoría */}
        <Form.Item
          label="Categoría"
          name="category"
          rules={[
            {
              required: false,
              message: "Por favor seleccione una categoría",
            },
          ]}
        >
          <CategorySelector
            name="category"
            label=""
            required={false}
            onChange={handleCategoryChange}
          />
        </Form.Item>

        <Form.Item label="Subcategoría" name="subCategory" dependencies={["category"]}>
          <Select
            options={
              subCategories.map((sub) => ({ label: sub.name, value: sub.id })) ||
              []
            }
            placeholder="Seleccione una subcategoría"
            disabled={!selectedCategory || subCategories.length === 0}
            showSearch
            filterOption={(input, option) =>
              (option?.label?.toString() ?? "")
                .toLowerCase()
                .includes(input.toLowerCase())
            }
            allowClear
          />
        </Form.Item>

        <Form.Item
          label="Provincia en la que se encuentra:"
          name="province"
          rules={[
            {
              required: true,
              message:
                "Por favor ingrese la Provincia donde esta inventariado el producto",
            },
          ]}
        >
          <Select
            options={
              provinceData?.data.map((pr) => ({
                label: pr.name,
                value: pr.id,
              })) || []
            }
            placeholder="Seleccione una Provincia"
            showSearch
            filterOption={(input, option) =>
              (option?.label?.toString() ?? "")
                .toLowerCase()
                .includes(input.toLowerCase())
            }
            allowClear
          />
        </Form.Item>

        <Form.Item
          label="Imagen"
          name="image"
          valuePropName="fileList"
          getValueFromEvent={normFile}
        >
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
                  border: "1px dashed #d9d9d9",
                  padding: "8px 16px",
                  background: "none",
                  cursor: "pointer",
                }}
              >
                <UploadOutlined /> Subir Imagen
              </button>
            </div>
          </Upload>
        </Form.Item>
      </Form>
    </Create>
  );
};

export default ProductCreate;