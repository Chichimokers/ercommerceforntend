"use client";

import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  InputNumber,
  Upload,
  Select,
  Card,
  Space,
  Switch,
  Button,
  message,
  Breadcrumb,
} from "antd";
import { UploadOutlined, ArrowLeftOutlined, PlusOutlined } from "@ant-design/icons";
import { useList, useOne, useUpdate } from "@refinedev/core";
import { Edit, useForm } from "@refinedev/antd";
import { BaseType, Category, ProductBase, Province, SubCategory } from "../../../../../../types/types";
import { CategorySelector } from "@components/selects/category-selector";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

const ProductEdit: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [form] = Form.useForm();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [applyDiscount, setApplyDiscount] = useState(false);
  const [productPrice, setProductPrice] = useState<number | null>(null);
  const [productQuantity, setProductQuantity] = useState<number | null>(null);
  const [subCategories, setSubCategories] = useState<SubCategory[]>();
  const [fileList, setFileList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [originalValues, setOriginalValues] = useState<any>({});

  const { data: productData, isLoading } = useOne<ProductBase & BaseType>({
    resource: "products",
    id,
  });

  const { data: categoriesData } = useList<Category>({
    resource: "category",
  });

  const { data: provinceData } = useList<Province>({
    resource: "province",
  });

  const { mutate } = useUpdate();
  
  useEffect(() => {
    if (productData?.data) {
      const product = productData.data;

      const initialValues = {
        name: product.name,
        weight: product.weight,
        price: product.price,
        quantity: product.quantity,
        short_description: product.short_description,
        description: product.description,
        category: product.category,
        subCategory: product.subCategory,
        province: product.province,
        ...(product.discount
          ? {
              applyDiscount: true,
              min: product.discount.min,
              reduction: product.discount.reduction,
            }
          : { applyDiscount: false }),
        image: product.image
          ? [
              {
                uid: "-1",
                name: "Product Image",
                status: "done",
                url: product.image,
              },
            ]
          : undefined,
      };

      form.setFieldsValue(initialValues);
      setOriginalValues(initialValues);

      setProductPrice(product.price);
      setProductQuantity(product.quantity);

      if (product.category) {
        setSelectedCategory(product.category);
      }
    }
  }, [productData, form]);

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
    if (Array.isArray(e)) return e;
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


  const transformValues = (values: any) => {
    const transformedValues = { ...values };
    
    delete transformedValues.applyDiscount;
    
    if (transformedValues.image && transformedValues.image.length > 0) {
      if (transformedValues.image[0].originFileObj) {
        transformedValues.image = transformedValues.image[0].originFileObj;
      } else {
        transformedValues.image = transformedValues.image[0].url || undefined;
      }
    } else {
   
      transformedValues.image = null;
    }
    
    return transformedValues;
  }
  const getModifiedValues = (original: any, updated: any) => {
    const modified: any = {};
    Object.keys(updated).forEach((key) => {
      if (JSON.stringify(updated[key]) !== JSON.stringify(original[key])) {
        modified[key] = updated[key];
      }
    });
    return modified;
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const transformedValues = transformValues(values);
      const modifiedValues = getModifiedValues(originalValues, transformedValues);

      if (Object.keys(modifiedValues).length === 0) {
        message.info("No hay cambios para actualizar.");
        setLoading(false);
        return;
      }

      await mutate({
        resource: "products",
        id,
        values: modifiedValues,
      });

    } catch (error) {
    
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/products");
  };

 

  return (
    <div style={{ padding: "20px" }}>
    
      
      <Edit 
        title={`Editar: ${originalValues?.name || "Producto"}`} 
        canDelete={true}
        headerButtons={[]}
        footerButtons={[
          <Button key="cancel" onClick={handleCancel}>
            Cancelar
          </Button>,
          <Button
            key="submit"
            type="default"
            style={{ backgroundColor: "#3b82f6", color: "white" }}
            onClick={form.submit}
            loading={loading}
          >
            Guardar
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            name: "",
            weight: 0,
            price: 0,
            quantity: 0,
            short_description: "",
            description: "",
            applyDiscount: false,
          }}
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

          <Card
            title="Descuento"
            style={{ marginBottom: "24px" }}
            extra={
              <Form.Item name="applyDiscount" valuePropName="checked" noStyle>
                <Switch
                  checkedChildren="Aplicar"
                  unCheckedChildren="No aplicar"
                  onChange={handleDiscountToggleChange}
                  checked={applyDiscount}
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
                        if (
                          productQuantity !== null &&
                          value > productQuantity
                        ) {
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
                        if (
                          productPrice !== null &&
                          value >= productPrice
                        ) {
                          return Promise.reject(
                            "El descuento no puede ser mayor o igual que el precio base"
                          );
                        }
                        if (value <= 0) {
                          return Promise.reject(
                            "El descuento debe ser mayor que cero"
                          );
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

          <Form.Item
            label="Subcategoría"
            name="subCategory"
            dependencies={["category"]}
            rules={[
              {
                required: false,
              },
            ]}
          >
            <Select
              options={
                subCategories?.map((sub) => ({
                  label: sub.name,
                  value: sub.id,
                })) || []
              }
              placeholder="Seleccione una subcategoría"
              disabled={
                !selectedCategory ||
                !subCategories ||
                subCategories.length === 0
              }
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
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
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
                  <UploadOutlined />{" "}
                  {fileList.length ? "Cambiar Imagen" : "Subir Imagen"}
                </button>
              </div>
            </Upload>
          </Form.Item>
        </Form>
      </Edit>
    </div>
  );
};

export default ProductEdit;