"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  useSelect,
  List,
  EditButton,
  ShowButton,
  DeleteButton,
  CreateButton
} from "@refinedev/antd";
import { useCustom } from "@refinedev/core";
import { Table, Select, InputNumber, Row, Col, Space, Typography, Input, Button } from "antd";
import type { GetListResponse } from "@refinedev/core";
import { ProductBase, BaseType, Category, SubCategory } from "../../../../types/types";
import { SearchSuggestions } from "@components/search-suggestions";
import { useRouter } from "next/navigation";

const { Text } = Typography;
const { Search } = Input;

const ProductList = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [selectedRate, setSelectedRate] = useState<number>();
  const [selectedProvince, setSelectedProvince] = useState<string>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableSubcategories, setAvailableSubcategories] = useState<SubCategory[]>([]);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<ProductBase[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const searchProducts = async (term: string) => {
    if (!term || term.length < 2) {
      setSearchResults([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    try {
      console.log(process.env.NEXT_PUBLIC_API_URL);
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}public/search`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: term, province: selectedProvince }),
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
        setShowSuggestions(true);
      } else {
        console.error('Error en la búsqueda:', response.statusText);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error al realizar la búsqueda:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.length >= 2) {
      const timeoutId = setTimeout(() => {
        searchProducts(value);
      }, 300);

      return () => clearTimeout(timeoutId);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSearch = () => {
    if (searchTerm) {
      searchProducts(searchTerm);
    }
  };

  const { data: categoriesData, isLoading: categoriesLoading } = useCustom<Category[]>({
    url: "/category",
    method: "get",
  });

  useEffect(() => {
    if (categoriesData?.data) {
      setCategories(categoriesData.data);
    }
  }, [categoriesData]);

  useEffect(() => {
    if (categories.length > 0 && selectedCategories.length > 0) {
      const filteredSubcategories = categories
        .filter(category => selectedCategories.includes(category.id))
        .flatMap(category => category.subCategories);

      setAvailableSubcategories(filteredSubcategories);

      const validSubcategories = selectedSubcategories.filter(subId =>
        filteredSubcategories.some(sub => sub.id === subId)
      );

      if (validSubcategories.length !== selectedSubcategories.length) {
        setSelectedSubcategories(validSubcategories);
      }
    } else {
      setAvailableSubcategories([]);
      setSelectedSubcategories([]);
    }
  }, [selectedCategories, categories]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategories, selectedSubcategories, priceRange, selectedRate, selectedProvince]);

  const buildQueryParams = () => {
    let params: Record<string, any> = {
      page: currentPage,
      limit: pageSize,
      pricerange: `${priceRange[0]}-${priceRange[1]}`,
    };

    if (selectedCategories.length > 0) {
      params.category = selectedCategories.join(',');
    }

    if (selectedSubcategories.length > 0) {
      params.subcategory = selectedSubcategories.join(',');
    }

    if (selectedRate !== undefined) {
      params.rate = selectedRate;
    }

    if (selectedProvince !== undefined) {
      params.province = selectedProvince;
    }

    return params;
  };

  const { data, isLoading, refetch } = useCustom<GetListResponse<ProductBase & BaseType>>({
    url: "/products",
    method: "get",
    config: {
      query: buildQueryParams()
    },
  });

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedSubcategories([]);
    setPriceRange([0, 10000]);
    setSelectedRate(undefined);
    setSelectedProvince(undefined);
    setCurrentPage(1);
    setSearchTerm("");
    setSearchResults([]);
    setShowSuggestions(false);
  };

  const handleSelectSuggestion = (productId: string) => {
    setShowSuggestions(false);
    // Redirigir a la página de visualización del producto
    router.push(`/admin/products/show/${productId}`);
  };

  const products = data?.data?.products || [];
  const totalPages = data?.data?.urls?.totalPages || 0;
  const totalCount = totalPages * pageSize;

  const columns = [
    { title: "Nombre", dataIndex: "name", key: "name" },
    {
      title: "Precio",
      dataIndex: "price",
      key: "price",
      render: (price: number) => `$${price.toLocaleString()}`,
    },
    {
      title: "Peso",
      dataIndex: "weight",
      key: "weight",
      render: (weight: number) => `${weight.toLocaleString()} kg`,
    },
    { title: "Provincia", dataIndex: "province", key: "province" },
    {
      title: "Categoría",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Subcategoría",
      dataIndex: "subCategory",
      key: "subCategory",
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_: any, record: ProductBase) => (
        <Space>
          <ShowButton recordItemId={record.id} />
          <EditButton recordItemId={record.id} />
          <DeleteButton recordItemId={record.id} />
        </Space>
      ),
    },
  ];

  const { selectProps: provinceSelectProps } = useSelect({
    resource: "province",
    optionLabel: "name",
    optionValue: "id",
  });

  // Componente personalizado para renderizar las sugerencias con funcionalidad de redirección
  const CustomSearchSuggestions = ({ suggestions, onSelect }: { suggestions: ProductBase[], onSelect: (id: string) => void }) => {
    return (
      <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-blue-50 dark:bg-gray-800 rounded-xl shadow-xl max-h-96 overflow-y-auto">
        <div className="p-2 space-y-2">
          {suggestions.map((product) => (
            <div
              key={product.id}
              className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors cursor-pointer"
              onClick={() => onSelect(product.id)}
            >
              {product.image && (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-10 h-10 object-cover rounded-md mr-3"
                />
              )}
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {product.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  ${product.price}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <List

      title="Listado de Productos"
      headerButtons={
        <Space>
          <CreateButton title="Crear" />
          <div ref={searchRef} className="relative" style={{ width: '300px' }}>
            <Search
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              loading={isSearching}
              style={{ width: '100%' }}
            />
            {showSuggestions && searchResults.length > 0 && (
              <CustomSearchSuggestions
                suggestions={searchResults}
                onSelect={handleSelectSuggestion}
              />
            )}
          </div>
        </Space>
      }
    >
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={5}>
          <Text strong>Categorías</Text>
          <Space direction="vertical" style={{ width: '100%', marginTop: 8 }}>
            <Select
              mode="multiple"
              placeholder="Seleccionar categorías"
              loading={categoriesLoading}
              value={selectedCategories}
              onChange={(value: string[]) => setSelectedCategories(value)}
              style={{ width: "100%" }}
              allowClear
              maxTagCount={2}
              options={categories.map(category => ({
                label: category.name,
                value: category.id
              }))}
            />
          </Space>
        </Col>

        <Col span={5}>
          <Text strong>Subcategorías</Text>
          <Space direction="vertical" style={{ width: '100%', marginTop: 8 }}>
            <Select
              mode="multiple"
              placeholder={selectedCategories.length === 0 ? "Seleccione categorías primero" : "Seleccionar subcategorías"}
              value={selectedSubcategories}
              onChange={(value: string[]) => setSelectedSubcategories(value)}
              style={{ width: "100%" }}
              allowClear
              maxTagCount={2}
              disabled={selectedCategories.length === 0}
              options={availableSubcategories.map(subcategory => ({
                label: subcategory.name,
                value: subcategory.id
              }))}
            />
          </Space>
        </Col>
        <Col span={6}>
          <Text strong>Rango de Precio</Text>
          <Space direction="vertical" style={{ width: '100%', marginTop: 8 }}>
            <Space direction="horizontal">
              <InputNumber
                placeholder="Mín"
                value={priceRange[0]}
                onChange={v => v !== null && setPriceRange([v, priceRange[1]])}
                min={0}
                formatter={value => `$${value}`}
                parser={value => value ? Number(value.replace(/\$\s?|(,*)/g, '')) : 0}
              />
              <Text>-</Text>
              <InputNumber
                placeholder="Máx"
                value={priceRange[1]}
                onChange={v => v !== null && setPriceRange([priceRange[0], v])}
                min={priceRange[0]}
                formatter={value => `$${value}`}
                parser={value => value ? Number(value.replace(/\$\s?|(,*)/g, '')) : 0}
              />
            </Space>
          </Space>
        </Col>
        <Col span={6}>
          <Text strong>Provincia</Text>
          <Space direction="vertical" style={{ width: '100%', marginTop: 8 }}>
            <Select
              placeholder="Seleccionar provincia"
              {...provinceSelectProps}
              value={selectedProvince}
              onChange={(value: any) => setSelectedProvince(value)}
              style={{ width: "100%" }}
              allowClear
            />
          </Space>
        </Col>
        <Col span={2}>
          <Text strong>&nbsp;</Text>
          <Space direction="vertical" style={{ width: '100%', marginTop: 8 }}>
            <Button onClick={clearAllFilters}>Limpiar filtros</Button>
          </Space>
        </Col>
      </Row>

      {/* Tabla */}
      <Table
        loading={isLoading}
        dataSource={products}
        columns={columns}
        rowKey="id"
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: totalCount,
          onChange: (page, size) => {
            setCurrentPage(page);
            if (size) setPageSize(size);
          },
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"],
        }}
        scroll={{ x: "max-content" }}
      />
    </List>
  );
};

// Componente principal con Suspense
export default function ProductList() {
  return (
    <Suspense fallback={<ListSkeleton />}>
      <ProductContent />
    </Suspense>
  );
}