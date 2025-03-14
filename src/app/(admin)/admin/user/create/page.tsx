"use client";

import React from "react";
import { Create, useForm } from "@refinedev/antd";
import { Form, Input, Select, Card, Button } from "antd";
import { BaseType, UserData } from "../../../../../types/types";


const UserCreate: React.FC = () => {
  const { form, formProps, saveButtonProps } = useForm<UserData & {name:string} & BaseType>({
    resource: "user",
    action: "create",
    redirect: "show"
  });

  return (
    <Create
      saveButtonProps={saveButtonProps}
      title="Crear Usuario"
    >
      <Form 
        {...formProps} 
        form={form} 
        layout="vertical"
        initialValues={{ isActive: true, rol: 1 }}
      >
        <Form.Item
          label="Nombre de Usuario"
          name="name"
          rules={[
            {
              required: true,
              message: "Por favor ingrese el nombre del usuario",
            },
            {
              max: 30,
              message: 'El nombre debe tener menos de 30 caracteres'
            },
            {
              min: 4,
              message: 'El nombre debe tener al menos 4 caracteres'
            }
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Correo Electrónico"
          name="email"
          rules={[
            {
              required: true,
              message: "Por favor ingrese un correo electrónico",
            },
            {
              type: "email",
              message: "Por favor ingrese un correo electrónico válido",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Contraseña"
          name="password"
          rules={[
            {
              required: true,
              message: "Por favor ingrese una contraseña",
            },
            {
              min: 8,
              message: "La contraseña debe tener al menos 6 caracteres",
            },
          ]}
        >
          <Input.Password />
        </Form.Item>

       
        <Form.Item
          label="Confirmar Contraseña"
          name={"confirmPassword"}
          dependencies={["password"]}
          rules={[
            {
              required: true,
              message: "Por favor confirme su contraseña",
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("Las contraseñas no coinciden")
                );
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>
        
        {/* Sección de Rol */}
        <Card
          title="Rol de Usuario"
          style={{ marginBottom: "24px" }}
        >
          <Form.Item
            name="rol"
            label="Seleccione el rol del usuario"
            rules={[
              {
                required: true,
                message: "Por favor seleccione un rol",
              },
            ]}
          >
            <Select
              options={[
                { label: "Usuario", value: 1 },
                { label: "Administrador", value: 2 },
                { label: "Delivery", value: 3 },
              ]}
              placeholder="Seleccione un rol"
            />
          </Form.Item>
        </Card>
      </Form>
    </Create>
  );
};

export default UserCreate;