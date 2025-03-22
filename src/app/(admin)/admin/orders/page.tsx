"use client";

import { Tag } from "antd";
import { Order, BaseType, Province } from "../../../../types/types";
import GenericList, { ExtendedColumnType } from "@components/admin/generic_admin_pages/genericListPage";
import { useList } from "@refinedev/core";
import { ColumnFilterItem } from "antd/es/table/interface";
import { useSession } from "next-auth/react";

const OrderList: React.FC = () => {
  const { data:session } = useSession()
  const { data: provinceData } = useList<Province>({ resource: 'province' });
  const provinceFilter: ColumnFilterItem[] = provinceData?.data.map(p => ({ text: p.name, value: p.name })) || [];

  const columns: ExtendedColumnType<Order & BaseType>[] = [
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
          <div className="text-gray-500">CI: {record.CI}</div>
          <div className="text-gray-500">Tel: {record.phone}</div>
        </div>
      ),
      sorter: true,
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          accepted: 'green',
          cancelled: 'red',
          retired: 'red',
          pending: 'blue',
          paid: 'yellow',
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
    {
      title: 'Ubicación',
      dataIndex: 'province',
      render: (province: string, record: Order) => (
        <div>
          <div>{province}</div>
          <div className="text-sm">{record.address}</div>
        </div>
      ),
      filters: provinceFilter,
      sorter: true,
    },
    {
      title: 'Monto',
      dataIndex: 'subtotal',
      align: 'right',
      sorter: true,
      rangeFilter: true,
    },
    {
      title: 'Id',
      dataIndex: 'id',
    },
  ];

  return (
    <GenericList<Order & BaseType>
      resource="orders"
      title="Órdenes"
      actionButtons={{edit:false,delete:(Number(session?.user.role) === 2 ) || false ,show:true}}
      canCreate={false}
      columns={columns}
      pageSize={10}
    
    />
  );
};

export default OrderList;
