"use client";

import React from "react";
import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, Select, Card, Button } from "antd";
import { BaseType, UserData } from "../../../../../../types/types";
import { useNotification } from "@refinedev/core";

const UserEdit: React.FC = () => {
  const notification = useNotification();
 
  const { form, formProps, saveButtonProps, queryResult } = useForm<UserData & {name: string} & BaseType>({
    resource: "user",
    action: "edit",
    redirect: "show"
  });

  return (
    <Edit 
      title="Editar Usuario"
      saveButtonProps={{ 
        ...saveButtonProps, 
        variant: "solid", 
        color: "blue",
      
      }}
    >
      <Form 
        {...formProps} 
        form={form} 
        layout="vertical"
      >
        <Form.Item
          label="Nombre de Usuario"
          name="name"
          rules={[
            {
              required: true,
              message: "Por favor ingrese el nombre del usuario",
            },
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
    </Edit>
  );
};

export default UserEdit;