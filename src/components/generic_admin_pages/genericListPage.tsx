"use client";

import React, { useMemo, useState, useCallback } from "react";
import { List, useTable, ExportButton, DeleteButton, EditButton, ShowButton } from "@refinedev/antd";
import { Space, Table, Slider, Input, Button, Form } from "antd";
import type { ColumnType, TablePaginationConfig } from "antd/es/table";
import { BaseType } from "../../types/types";
import { LogicalFilter } from "@refinedev/core";
import { FilterValue, SorterResult } from "antd/es/table/interface";

// Interfaces y tipos
export interface ExtendedColumnType<T> extends ColumnType<T> {
  rangeFilter?: boolean;
}

interface RangeFilter {
  field: string;
  type: 'range';
  value: [number, number];
}

type CustomFilter = LogicalFilter | RangeFilter;

// Funciones auxiliares
const isLogicalFilter = (filter: CustomFilter): filter is LogicalFilter => 
  !('type' in filter) || filter.type !== 'range';

const isRangeFilter = (filter: CustomFilter): filter is RangeFilter => 
  'type' in filter && filter.type === 'range';

// Componente de filtro de rango
interface RangeFilterProps {
  field: string;
  onApply: (values: [number, number]) => void;
  onReset: () => void;
  initialValue?: [number, number];
  dataSource: readonly any[];
}

const RangeFilterComponent: React.FC<RangeFilterProps> = ({
  field,
  onApply,
  onReset,
  initialValue,
  dataSource,
}) => {
  // Calcular min y max de los datos
  const { min, max } = useMemo(() => {
    if (!dataSource || dataSource.length === 0) {
      return { min: 0, max: 100 };
    }
    
    let minVal = Infinity;
    let maxVal = -Infinity;
    
    dataSource.forEach(item => {
      const val = Number(item[field]);
      if (!isNaN(val)) {
        minVal = Math.min(minVal, val);
        maxVal = Math.max(maxVal, val);
      }
    });
    
    return { 
      min: minVal === Infinity ? 0 : minVal, 
      max: maxVal === -Infinity ? 100 : maxVal 
    };
  }, [dataSource, field]);

  // Estado para el rango seleccionado
  const [range, setRange] = useState<[number, number]>(
    initialValue || [min, max]
  );

  // Manejadores de eventos
  const handleApply = () => onApply(range);
  const handleReset = () => {
    setRange([min, max]);
    onReset();
  };

  return (
    <Form layout="vertical" className="p-4 min-w-[250px]">
      <Form.Item label="Rango">
        <Slider
          range
          min={min}
          max={max}
          value={range}
          onChange={(values: number[]) => setRange([values[0], values[1]])}
        />
        <Space className="mt-2">
          <Input
            value={range[0]}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (!isNaN(value)) {
                setRange([value, range[1]]);
              }
            }}
            style={{ width: 100 }}
          />
          <span>-</span>
          <Input
            value={range[1]}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (!isNaN(value)) {
                setRange([range[0], value]);
              }
            }}
            style={{ width: 100 }}
          />
        </Space>
      </Form.Item>
      <Space>
        <Button type="primary" onClick={handleApply}>
          Aplicar
        </Button>
        <Button onClick={handleReset}>
          Restablecer
        </Button>
      </Space>
    </Form>
  );
};

// Props del componente principal
interface GenericListProps<T extends BaseType> {
  resource: string;
  title: string;
  columns: ExtendedColumnType<T>[];
  canCreate?: boolean;
  pageSize?: number;
  showActions?: boolean;
}

// Componente principal
const GenericList = <T extends BaseType>({
  resource,
  title,
  columns,
  canCreate = true,
  pageSize = 10,
  showActions = true,
}: GenericListProps<T>) => {
  // Estado para filtros, ordenamiento y paginación
  const [activeFilters, setActiveFilters] = useState<CustomFilter[]>([]);
  const [activeSorter, setActiveSorter] = useState<{field: string, order: 'ascend' | 'descend'} | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize_, setPageSize] = useState<number>(pageSize);

  // Obtener datos mediante useTable sin paginación en servidor
  const { tableProps } = useTable<T>({
    resource,
    pagination: {
      mode: "off",
    },
    filters: { mode: "off" },
    sorters: { mode: "off" },
  });

  // Filtrar y ordenar datos
  const processedData = useMemo(() => {
    if (!tableProps.dataSource || tableProps.dataSource.length === 0) {
      return [];
    }

    // Aplicar filtros
    let result = [...tableProps.dataSource];
    
    if (activeFilters.length > 0) {
      result = result.filter(item => 
        activeFilters.every(filter => {
          if (isRangeFilter(filter)) {
            const value = Number(item[filter.field as keyof T]);
            return value >= filter.value[0] && value <= filter.value[1];
          }
          
          if (isLogicalFilter(filter)) {
            const itemValue = item[filter.field as keyof T];
            if (Array.isArray(filter.value)) {
              return filter.value.some(v => v === itemValue);
            }
            return itemValue === filter.value;
          }
          
          return true;
        })
      );
    }

    // Aplicar ordenamiento
    if (activeSorter) {
      const { field, order } = activeSorter;
      const isAscending = order === 'ascend';
      
      result.sort((a, b) => {
        const aValue = a[field as keyof T];
        const bValue = b[field as keyof T];
        
        // Ordenar según el tipo de datos
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return isAscending ? aValue - bValue : bValue - aValue;
        }
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return isAscending ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        
        if (aValue instanceof Date && bValue instanceof Date) {
          return isAscending ? aValue.getTime() - bValue.getTime() : bValue.getTime() - aValue.getTime();
        }
        
        // Fallback a comparación de strings
        const aStr = String(aValue ?? '');
        const bStr = String(bValue ?? '');
        return isAscending ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
      });
    }
    
    return result;
  }, [tableProps.dataSource, activeFilters, activeSorter]);

  // Calcular datos paginados - Importante para la navegación
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize_;
    const endIndex = startIndex + pageSize_;
    return processedData.slice(startIndex, endIndex);
  }, [processedData, currentPage, pageSize_]);

  // Cuando cambian los filtros o el ordenamiento, volver a la primera página
  const resetPagination = useCallback(() => {
    setCurrentPage(1);
  }, []);

  // Crear columnas con filtros y ordenamiento
  const getFinalColumns = useCallback(() => {
    // Crear columnas con filtros
    const enhancedColumns = columns.map(column => {
      const dataIndex = column.dataIndex as string;
      
      if (column.rangeFilter) {
        // Configurar filtro de rango
        const isFiltered = activeFilters.some(
          f => isRangeFilter(f) && f.field === dataIndex
        );
        
        return {
          ...column,
          filterDropdown: () => (
            <RangeFilterComponent
              field={dataIndex}
              onApply={(values) => {
                setActiveFilters(prev => [
                  ...prev.filter(f => !isRangeFilter(f) || f.field !== dataIndex),
                  { field: dataIndex, type: 'range', value: values }
                ]);
                resetPagination();
              }}
              onReset={() => {
                setActiveFilters(prev => 
                  prev.filter(f => !isRangeFilter(f) || f.field !== dataIndex)
                );
                resetPagination();
              }}
           
              dataSource={tableProps.dataSource || []}
            />
          ),
          filterIcon: () => (
            <span style={{ color: isFiltered ? 'green' : undefined }}>🔍</span>
          ),
          sorter: true,
          sortOrder: activeSorter?.field === dataIndex ? activeSorter.order : null,
        };
      }
      
      // Filtros estándar
      const standardFilter = activeFilters.find(
        f => isLogicalFilter(f) && f.field === dataIndex
      ) as LogicalFilter | undefined;
      
      return {
        ...column,
        filteredValue: standardFilter?.value ? 
          (Array.isArray(standardFilter.value) ? standardFilter.value : [standardFilter.value]) 
          : null,
        sorter: true,
        sortOrder: activeSorter?.field === dataIndex ? activeSorter.order : null,
      };
    });

    // Añadir columna de acciones si es necesario
    if (showActions) {
      const actionsColumn: ColumnType<T> = {
        title: 'Acciones',
        key: 'actions',
        width: 120,
        fixed: 'right',
        render: (_, record) => (
          <Space>
            <ShowButton 
              hideText 
              recordItemId={record.id} 
              resource={resource}
            />
            <EditButton 
              hideText 
              recordItemId={record.id} 
              resource={resource}
            />
            <DeleteButton
            
              recordItemId={record.id}
              resource={resource}
              meta={{
                mutationMode: "pessimistic",
                dataProviderName: "customDataProvider",
              }}
            />
          </Space>
        ),
      };
      
      return [...enhancedColumns, actionsColumn];
    }
    
    return enhancedColumns;
  }, [columns, activeFilters, activeSorter, tableProps.dataSource, showActions, resource, resetPagination]);

  // Manejador para cambios en la tabla (filtros, ordenamiento, paginación)
  const handleTableChange = useCallback((
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<T> | SorterResult<T>[],
  ) => {
    console.log('Table change:', { pagination, filters, sorter });
    
    // Actualizar filtros estándar
    const standardFilters: LogicalFilter[] = [];
    Object.entries(filters).forEach(([field, value]) => {
      if (value && value.length > 0) {
        standardFilters.push({
          field,
          operator: 'in',
          value: value,
        });
      }
    });

    // Combinar con filtros de rango existentes
    const newFilters = [
      ...standardFilters,
      ...activeFilters.filter(isRangeFilter)
    ];
    
    // Actualizar solo si cambian los filtros
    if (JSON.stringify(newFilters) !== JSON.stringify(activeFilters)) {
      setActiveFilters(newFilters);
      resetPagination();
    }

    // Manejar sorter
    let newSorter = null;
    if (!Array.isArray(sorter) && sorter.column) {
      if (sorter.order) {
        newSorter = {
          field: sorter.field as string,
          order: sorter.order
        };
      }
    } else if (Array.isArray(sorter) && sorter.length > 0 && sorter[0].column) {
      if (sorter[0].order) {
        newSorter = {
          field: sorter[0].field as string,
          order: sorter[0].order
        };
      }
    }
    
    // Actualizar solo si cambia el sorter
    if (JSON.stringify(newSorter) !== JSON.stringify(activeSorter)) {
      setActiveSorter(newSorter);
      resetPagination();
    }

    // Manejar cambios de paginación
    if (pagination.current && pagination.current !== currentPage) {
      setCurrentPage(pagination.current);
    }
    
    if (pagination.pageSize && pagination.pageSize !== pageSize_) {
      setPageSize(pagination.pageSize);
      setCurrentPage(1); // Resetear a página 1 cuando cambia el tamaño de página
    }
  }, [activeFilters, activeSorter, currentPage, pageSize_, resetPagination]);

  // Exportar datos
  const handleExport = useCallback(() => {
    if (processedData.length === 0) return;
    
    try {
      const headers = Object.keys(processedData[0] || {}).join(',');
      const rows = processedData.map(item => 
        Object.values(item)
          .map(val => typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val)
          .join(',')
      );
      
      const csvContent = [headers, ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${resource}-export.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  }, [processedData, resource]);

  // Renderizar componente
  return (
    <List
      title={title}
      canCreate={canCreate}
      headerButtons={({ defaultButtons }) => (
        <>
          {defaultButtons}
          <ExportButton onClick={handleExport} />
        </>
      )}
    >
      {/* Debug */}
      {/* <div style={{marginBottom: '10px'}}>
        <p>Página actual: {currentPage}</p>
        <p>Tamaño de página: {pageSize_}</p>
        <p>Total items: {processedData.length}</p>
        <p>Items en página actual: {paginatedData.length}</p>
      </div> */}
      
      <Table<T>
        rowKey="id"
        columns={getFinalColumns()}
        dataSource={paginatedData}
        loading={tableProps.loading}
        onChange={handleTableChange}
        pagination={{
          current: currentPage,
          pageSize: pageSize_,
          total: processedData.length,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          showTotal: (total) => `Total: ${total} registros`,
        }}
        scroll={{ x: 'max-content' }}
      />
    </List>
  );
};

export default GenericList;