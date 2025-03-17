"use client";

import React, { useRef, useState, useCallback } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import InfiniteLoader from 'react-window-infinite-loader';
import ProductCard from '@/components/cards/product/product-card';
import { CardSkeleton } from '@components/skeletons/card-skeleton';
import { DeviceInfo } from '@/hooks/useDeviceDetection';

interface VirtualizedProductGridProps {
  products: any[];
  isLoading: boolean;
  hasNextPage: boolean;
  loadNextPage: () => void;
  deviceData: DeviceInfo;
}

export default function VirtualizedProductGrid({
  products,
  isLoading,
  hasNextPage,
  loadNextPage,
  deviceData
}: VirtualizedProductGridProps) {
  // Referencia al loader infinito
  const infiniteLoaderRef = useRef<any>(null);

  // Estado para columnas y dimensiones
  const [columnCount, setColumnCount] = useState(getInitialColumnCount(deviceData.isMobile));
  const [rowHeight, setRowHeight] = useState(deviceData.isMobile ? 320 : 400);

  // Determinar número de columnas basado en ancho y características del dispositivo
  const getColumnCount = useCallback((width: number) => {
    // Para dispositivos de bajo rendimiento, usar menos columnas para mejorar el rendimiento
    if (deviceData.isLowPerformance) {
      if (width < 768) return 1; // Ultra optimizado para móvil de bajo rendimiento
      if (width < 1024) return 2; // Tabletas de bajo rendimiento
      return 3; // Desktop de bajo rendimiento
    }

    // Para dispositivos normales
    if (width < 500) return 2;
    if (width < 768) return 3;
    if (width < 1024) return 3;
    if (width < 1280) return 4;
    if (width < 1536) return 5;
    return 6;
  }, [deviceData.isLowPerformance]);

  // Elementos totales incluyendo placeholders para cargar más
  const itemCount = hasNextPage ? products.length + 1 : products.length;

  // Verificar si un elemento está cargado
  const isItemLoaded = useCallback((index: number) => {
    return !hasNextPage || index < products.length;
  }, [hasNextPage, products.length]);

  // Función para renderizar cada celda del grid
  const Cell = useCallback(({ columnIndex, rowIndex, style }: any) => {
    const idx = rowIndex * columnCount + columnIndex;

    // Si el índice excede el número total de productos, no renderizamos nada
    if (idx >= itemCount) return null;

    // Si es el último ítem y tenemos página siguiente, cargamos más
    if (!isItemLoaded(idx)) {
      return (
        <div style={style}>
          <CardSkeleton />
        </div>
      );
    }

    // Producto actual
    const product = products[idx];
    if (!product) return null;

    // Calcular prioridad - más alta para los primeros elementos visibles
    const isPriority = idx < columnCount * 2;

    // Simplificar animaciones en dispositivos de bajo rendimiento
    const className = deviceData.isLowPerformance || deviceData.prefersReducedMotion
      ? ''
      : 'transition-opacity duration-300';

    return (
      <div style={{
        ...style,
        padding: '8px'
      }}>
        <ProductCard
          key={product.id}
          product={product}
          prefetch={isPriority ? "hover" : "none"}
          lazyLoad={!isPriority}
          className={className}
        />
      </div>
    );
  }, [products, columnCount, itemCount, isItemLoaded, deviceData]);

  // Manejar cambio de tamaño para ajustar columnas
  const handleResize = useCallback((width: number, height: number) => {
    const newColumnCount = getColumnCount(width);
    if (newColumnCount !== columnCount) {
      setColumnCount(newColumnCount);
    }

    // Ajustar altura de filas según dispositivo y ancho de pantalla
    const isMobileView = width < 768;
    const rowHeightValue = isMobileView
      ? (deviceData.isLowPerformance ? 280 : 320)
      : (deviceData.isLowPerformance ? 350 : 400);

    setRowHeight(rowHeightValue);

    // Resetear caché cuando cambia el layout
    if (infiniteLoaderRef.current?.resetloadMoreItemsCache) {
      infiniteLoaderRef.current.resetloadMoreItemsCache();
    }
  }, [columnCount, getColumnCount, deviceData.isLowPerformance]);

  // Calcular el número total de filas
  const rowCount = Math.ceil(itemCount / columnCount);

  // Determinar la altura del contenedor - ajustar según la página
  const gridHeight = `calc(100vh - ${deviceData.isMobile ? '90px' : '120px'})`;

  return (
    <div style={{ width: '100%', height: gridHeight }}>
      <AutoSizer onResize={({ width, height }) => handleResize(width, height)}>
        {({ height, width }) => (
          <InfiniteLoader
            ref={infiniteLoaderRef}
            isItemLoaded={isItemLoaded}
            itemCount={itemCount}
            loadMoreItems={loadNextPage}
            threshold={2} // Comenzar a cargar antes de llegar al final
          >
            {({ onItemsRendered, ref }) => {
              const onGridItemsRendered = ({
                visibleColumnStartIndex,
                visibleColumnStopIndex,
                visibleRowStartIndex,
                visibleRowStopIndex,
                overscanRowStartIndex,
                overscanRowStopIndex
              }: any) => {
                const visibleStartIndex = visibleRowStartIndex * columnCount + visibleColumnStartIndex;
                const visibleStopIndex = visibleRowStopIndex * columnCount + visibleColumnStopIndex;
                const overscanStartIndex = overscanRowStartIndex * columnCount;
                const overscanStopIndex = (overscanRowStopIndex + 1) * columnCount - 1;

                onItemsRendered({
                  visibleStartIndex,
                  visibleStopIndex,
                  overscanStartIndex,
                  overscanStopIndex
                });
              };

              return (
                <Grid
                  ref={ref}
                  columnCount={columnCount}
                  columnWidth={width / columnCount}
                  height={height}
                  rowCount={rowCount}
                  rowHeight={rowHeight}
                  width={width}
                  onItemsRendered={onGridItemsRendered}
                  overscanRowCount={deviceData.isLowPerformance ? 1 : 2}
                  style={{
                    overscrollBehavior: 'contain',
                    WebkitOverflowScrolling: 'touch',
                  }}
                >
                  {Cell}
                </Grid>
              );
            }}
          </InfiniteLoader>
        )}
      </AutoSizer>
    </div>
  );
}

function getInitialColumnCount(isMobile: boolean) {
  if (typeof window === 'undefined') return isMobile ? 2 : 4;

  const width = window.innerWidth;
  if (width < 500) return 2;
  if (width < 768) return 3;
  if (width < 1024) return 3;
  if (width < 1280) return 4;
  if (width < 1536) return 5;
  return 6;
}