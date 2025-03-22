"use client";

import React, { useMemo, useState, useCallback } from "react";
import { List, useTable, ExportButton, DeleteButton, EditButton, ShowButton } from "@refinedev/antd";
import { Space, Table, Slider, Input, Button, Form, Select } from "antd";
import type { ColumnType, TablePaginationConfig } from "antd/es/table";
import { BaseType } from "../../../types/types";
import { LogicalFilter } from "@refinedev/core";
import { FilterValue, SorterResult } from "antd/es/table/interface";
import { SearchOutlined } from "@ant-design/icons";

// Interfaces y tipos
export interface ExtendedColumnType<T> extends ColumnType<T> {
  rangeFilter?: boolean;
}

interface RangeFilter {
  field: string;
  type: 'range';
  value: [number, number];
}

interface SearchFilter {
  field: string;
  type: 'search';
  value: string;
}

type CustomFilter = LogicalFilter | RangeFilter | SearchFilter;

// Configuración de botones de acción
interface ActionButtonsConfig {
  show?: boolean;
  edit?: boolean;
  delete?: boolean;
}

// Funciones auxiliares
const isLogicalFilter = (filter: CustomFilter): filter is LogicalFilter => 
  !('type' in filter) || filter.type !== 'range' && filter.type !== 'search';

const isRangeFilter = (filter: CustomFilter): filter is RangeFilter => 
  'type' in filter && filter.type === 'range';

const isSearchFilter = (filter: CustomFilter): filter is SearchFilter => 
  'type' in filter && filter.type === 'search';

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
      <Space align="baseline" >
        <Button onClick={handleReset}>
          Restablecer
        </Button>
            
        <Button style={{marginLeft:"25px"}} size="middle" type="primary" variant="solid" color="blue" onClick={handleApply}>
          Aplicar
        </Button>
      </Space>
    </Form>
  );
};


interface GenericListProps<T extends BaseType> {
  resource: string;
  title: string;
  columns: ExtendedColumnType<T>[];
  canCreate?: boolean;
  pageSize?: number;
  showActions?: boolean;
  actionButtons?: ActionButtonsConfig; 
}


const GenericList = <T extends BaseType>({
  resource,
  title,
  columns,
  canCreate = true,
  pageSize = 10,
  showActions = true,
  actionButtons = { show: true, edit: true, delete: true },
}: GenericListProps<T>) => {
  
  const [activeFilters, setActiveFilters] = useState<CustomFilter[]>([]);
  const [activeSorter, setActiveSorter] = useState<{field: string, order: 'ascend' | 'descend'} | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize_, setPageSize] = useState<number>(pageSize);
  
  
  const [searchField, setSearchField] = useState<string>("");
  const [searchText, setSearchText] = useState<string>("");

  const { tableProps } = useTable<T>({
    resource,
    pagination: {
      mode: "server",
    },
    filters: { mode: "off" },
    sorters: { mode: "off" },
  });

  
  const searchableFields = useMemo(() => {
    return columns
      .filter(col => col.dataIndex && typeof col.dataIndex === 'string')
      .map(col => ({
        value: col.dataIndex as string,
        label: col.title as string,
      }));
  }, [columns]);

  
  const processedData = useMemo(() => {
    if (!tableProps.dataSource || tableProps.dataSource.length === 0) {
      return [];
    }

    let result = [...tableProps.dataSource];
    
    if (activeFilters.length > 0) {
      result = result.filter(item => 
        activeFilters.every(filter => {
          if (isRangeFilter(filter)) {
            const value = Number(item[filter.field as keyof T]);
            return value >= filter.value[0] && value <= filter.value[1];
          }
          
          if (isSearchFilter(filter)) {
            const itemValue = String(item[filter.field as keyof T] || '').toLowerCase();
            return itemValue.includes(filter.value.toLowerCase());
          }
          
          if (isLogicalFilter(filter)) {
            const itemValue = item[filter.field as keyof T];
            if (Array.isArray(filter.value)) {
              return filter.value.some(v => v === itemValue);
            }
            return itemValue === filter.value;
          }
          
          return true;
        }) // Added missing closing parenthesis for .every()
      ); // Added missing closing parenthesis for .filter()
    }

  
    if (activeSorter) {
      const { field, order } = activeSorter;
      const isAscending = order === 'ascend';
      
      result.sort((a, b) => {
        const aValue = a[field as keyof T];
        const bValue = b[field as keyof T];
        
  
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return isAscending ? aValue - bValue : bValue - aValue;
        }
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return isAscending ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        
        if (aValue instanceof Date && bValue instanceof Date) {
          return isAscending ? aValue.getTime() - bValue.getTime() : bValue.getTime() - aValue.getTime();
        }
        
  
        const aStr = String(aValue ?? '');
        const bStr = String(bValue ?? '');
        return isAscending ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
      });
    }
    
    return result;
  }, [tableProps.dataSource, activeFilters, activeSorter]);

  
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize_;
    const endIndex = startIndex + pageSize_;
    return processedData.slice(startIndex, endIndex);
  }, [processedData, currentPage, pageSize_]);

  
  const resetPagination = useCallback(() => {
    setCurrentPage(1);
  }, []);

  
  const handleSearch = useCallback(() => {
    if (!searchField || !searchText.trim()) return;
    
    const newFilters = activeFilters.filter(f => !isSearchFilter(f));
    
    newFilters.push({
      field: searchField,
      type: 'search',
      value: searchText.trim()
    });
    
    setActiveFilters(newFilters);
    resetPagination();
  }, [searchField, searchText, activeFilters, resetPagination]);

  const clearSearch = useCallback(() => {
    setSearchText("");
    setActiveFilters(prev => prev.filter(f => !isSearchFilter(f)));
    resetPagination();
  }, [resetPagination]);

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getFinalColumns = useCallback(() => {

    const enhancedColumns = columns.map(column => {
      const dataIndex = column.dataIndex as string;
      
      if (column.rangeFilter) {
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

    
    if (showActions) {
      const actionsColumn: ColumnType<T> = {
        title: 'Acciones',
        key: 'actions',
        width: 120,
        fixed: 'right',
        render: (_, record) => (
          <Space>
            {actionButtons.show && (
              <ShowButton 
                hideText 
                recordItemId={record.id} 
                resource={resource}
              />
            )}
            {actionButtons.edit && (
              <EditButton 
                hideText 
                recordItemId={record.id} 
                resource={resource}
              />
            )}
            {actionButtons.delete && (
              <DeleteButton
                hideText
                recordItemId={record.id}
                resource={resource}
                meta={{
                  mutationMode: "pessimistic",
                  dataProviderName: "customDataProvider",
                }}
              />
            )}
          </Space>
        ),
      };
      
      return [...enhancedColumns, actionsColumn];
    }
    
    return enhancedColumns;
  }, [columns, activeFilters, activeSorter, tableProps.dataSource, showActions, resource, resetPagination, actionButtons]);


  const handleTableChange = useCallback((
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<T> | SorterResult<T>[],
  ) => {
    console.log('Table change:', { pagination, filters, sorter });
    
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

    
    const searchAndRangeFilters = activeFilters.filter(f => 
      isRangeFilter(f) || isSearchFilter(f)
    );

    
    const newFilters = [
      ...standardFilters,
      ...searchAndRangeFilters
    ];
    
    
    if (JSON.stringify(newFilters) !== JSON.stringify(activeFilters)) {
      setActiveFilters(newFilters);
      resetPagination();
    }

    
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
      setCurrentPage(1);
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
      
      createButtonProps={{variant:"solid",color:"blue"}}
    >
      {/* Barra de búsqueda */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <Select
          placeholder="Seleccionar campo"
          style={{ width: 200 }}
          value={searchField || undefined}
          onChange={setSearchField}
          options={searchableFields}
        />
        <Input
          placeholder="Buscar..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          onKeyDown={handleSearchKeyPress}
          style={{ width: 300 }}
          suffix={
            <Button
              type="text"
              icon={<SearchOutlined />}
              onClick={handleSearch}
              size="small"
            />
          }
        />
        <Button onClick={clearSearch} disabled={!activeFilters.some(isSearchFilter)}>
          Limpiar
        </Button>
      </div>
      
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
        bordered
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