"use client";
import React from "react";
import { useShow } from "@refinedev/core";
import { BaseType, Order } from "../../../../../../types/types";
import { Descriptions, Tag } from "antd";
import GenericShow from "@components/generic_admin_pages/genericShowPage";

const getStatusColor = (status: string) => {
  const colors: { [key: string]: string } = {
    pending: "orange",
    accepted: "blue",
    paid: "green",
    cancelled: "red"
  };
  return colors[status] || "default";
};

const OrderShow = () => {
  const { queryResult } = useShow<Order & BaseType>({
    resource: "orders",
  });

  const { data, isLoading } = queryResult;
  const record = data?.data;

  return (
    <GenericShow<Order & BaseType>
      resource="orders"
      titleField="id"
    >
      <Descriptions.Item label="Cliente">
        {record?.receiver_name}
      </Descriptions.Item>

      <Descriptions.Item label="Teléfono">
        {record?.phone}
      </Descriptions.Item>

      <Descriptions.Item label="Ubicación">
        <div>
          <div><strong>Provincia:</strong> {record?.province}</div>
          <div><strong>Dirección:</strong> {record?.address}</div>
        </div>
      </Descriptions.Item>

      <Descriptions.Item label="Identificación">
        {record?.CI || "N/A"}
      </Descriptions.Item>

      <Descriptions.Item label="Monto">
        ${Number(record?.subtotal).toFixed(2)}
      </Descriptions.Item>

      <Descriptions.Item label="Estado del Pedido">
        <Tag color={getStatusColor(record?.status || '')}>
          {record?.status?.toUpperCase()}
        </Tag>
      </Descriptions.Item>

      {record?.stripe_id && (
        <Descriptions.Item label="ID de Stripe">
          {record.stripe_id}
        </Descriptions.Item>
      )}
    </GenericShow>
  );
};

export default OrderShow;