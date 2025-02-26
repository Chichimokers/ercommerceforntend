"use client";

import { Tag } from "antd";
import { Order, BaseType } from "../../../../types/types";
import GenericList, { ExtendedColumnType } from "@components/generic_admin_pages/genericListPage";

const OrderList: React.FC = () => {
  const columns: ExtendedColumnType<Order & BaseType>[] = [
    {
      title: 'Id',
      dataIndex: 'id',
    },
    {
      title: 'Fecha Creación',
      dataIndex: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: true,
    },
    {
      title: 'Última Actualización',
      dataIndex: 'updated_at',
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: true,
    },
    {
      title: 'Cliente',
      dataIndex: 'receiver_name',
      render: (name: string, record: Order) => (
        <div>
          <div>{name}</div>
          <div className="text-gray-500">CI:{record.CI}</div>
          <div className="text-gray-500">Tel:{record.phone}</div>

        </div>
      ),
      sorter: true,
    },
    {
      title: 'Ubicación',
      dataIndex: 'province',
      render: (province: string, record: Order) => (
        <div>
          <div>{province}</div>
          <div className="text-sm">{record.address}</div>
        </div>
      ),
      sorter: true,
    },
    
    {
      title: 'Monto',
      dataIndex: 'subtotal',
      align: 'right',
      sorter: true,
      rangeFilter:true
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          accepted: 'green',
          cancelled: 'red',
          pending: 'blue',
          paid:'yellow',
          default: 'default',
        };

        const color = colorMap[status] || colorMap.default;
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
      sorter: true,
      filters: [
        { text: "Aceptadas", value: "accepted" },
        { text: "Canceladas", value: "cancelled" },
        { text: "Pendientes", value: "pending" },
        { text: "Pagadas", value: "paid" },
      ],
    },
  
  ];

  return (
    <GenericList<Order & BaseType>
      resource="orders"
      title="Órdenes"
      columns={columns}
      pageSize={10}
    />
  );
};

export default OrderList;
