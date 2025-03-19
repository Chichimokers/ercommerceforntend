"use client";

import React from "react";
import { useShow, useOne } from "@refinedev/core";
import { Show, MarkdownField, DateField } from "@refinedev/antd";
import { Typography, Card, Descriptions, Space, Button } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { BaseType, Province } from "../../../../../../types/types";

const { Title } = Typography;

export default function ProvinceShow() {
  const router = useRouter();
  const { queryResult } = useShow<Province & BaseType>({
    resource: "province",
  });

  const { data, isLoading } = queryResult;
  const record = data?.data;

  const handleEdit = () => {
    if (record?.id) {
      router.push(`/provinces/edit/${record.id}`);
    }
  };

  return (
    <Show
      isLoading={isLoading}
      title="Detalles de la Provincia"

    >
      {record && (
        <Card>
          <Descriptions bordered column={1}>
            <Descriptions.Item label="ID">
              {record.id}
            </Descriptions.Item>
            <Descriptions.Item label="Nombre">
              {record.name}
            </Descriptions.Item>
            <Descriptions.Item label="Fecha de Creación">
              <DateField
                value={record.created_at}
                format="DD/MM/YYYY HH:mm:ss"
              />
            </Descriptions.Item>
            <Descriptions.Item label="Última Actualización">
              <DateField
                value={record.updated_at}
                format="DD/MM/YYYY HH:mm:ss"
              />
            </Descriptions.Item>
            <Descriptions.Item label="Estado">
              {record.deleted_at ? (
                <Typography.Text type="danger">Eliminado</Typography.Text>
              ) : (
                <Typography.Text type="success">Activo</Typography.Text>
              )}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}
    </Show>
  );
}