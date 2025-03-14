"use client";

import React from "react";
import { Form, Input } from "antd";
import { Create } from "@refinedev/antd";
import { useForm } from "@refinedev/antd";
import { BaseType, Category } from "../../../../../types/types";

export default function CategoryCreate() {
    const { form, formProps, saveButtonProps } = useForm<Category & BaseType>({
        resource: "category",
        redirect: "show",
        action: "create",
    });

    return (
        <Create title="Crear Categoría" saveButtonProps={saveButtonProps}>
            <Form {...formProps} form={form} layout="vertical">
                <Form.Item
                    name="name"
                    label="Nombre"
                    rules={[{ required: true, message: "El nombre es obligatorio" }]}
                >
                    <Input placeholder="Nombre de la categoría" />
                </Form.Item>
            </Form>
        </Create>
    );
}