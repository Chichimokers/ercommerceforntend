"use client";

import React, { useRef, useState, useCallback, useEffect } from 'react';
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
  // Referencias
  const infiniteLoaderRef = useRef<any>(null);
  const gridRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Estado para columnas y dimensiones
  const [columnCount, setColumnCount] = useState(getInitialColumnCount(deviceData.isMobile));

  // Ajustamos la altura de fila para que sea adecuada para los productos
  const [rowHeight, setRowHeight] = useState(deviceData.isMobile ? 380 : 460);

  // Padding entre celdas más pequeño
  const [cellPadding, setCellPadding] = useState(4);

  // Estado de cálculo inicial
  const [hasCalculatedInitially, setHasCalculatedInitially] = useState(false);

  // Determinar número de columnas basado en ancho
  const getColumnCount = useCallback((width: number) => {
    // Para dispositivos normales
    if (width < 500) return 2;
    if (width < 768) return 3;
    if (width < 1024) return 4;
    if (width < 1280) return 5;
    if (width < 1536) return 6;
    return 7;
  }, []);

  // Elementos totales incluyendo placeholders para cargar más
  const itemCount = hasNextPage ? products.length + 1 : products.length;

  // Verificar si un elemento está cargado
  const isItemLoaded = useCallback((index: number) => {
    return !hasNextPage || index < products.length;
  }, [hasNextPage, products.length]);

  // Recalcula tamaños cuando cambian los productos
  useEffect(() => {
    if (products.length > 0 && !hasCalculatedInitially) {
      setTimeout(() => {
        if (gridRef.current?.resetAfterIndices) {
          gridRef.current.resetAfterIndices({
            columnIndex: 0,
            rowIndex: 0,
            shouldForceUpdate: true
          });
        }
        setHasCalculatedInitially(true);
      }, 100);
    }
  }, [products, hasCalculatedInitially]);

  // CORRECCIÓN: Sincronizar el scroll del grid con el documento principal
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    // Permitir que el scroll del documento continúe cuando se llega a los límites del grid
    const handleWheel = (e: WheelEvent) => {
      // Cuando se llega al límite inferior y hay más contenido
      const gridBottom = container.scrollTop + container.clientHeight;
      if (e.deltaY > 0 && gridBottom >= container.scrollHeight) {
        e.stopPropagation();
        // Permitir que el scroll continúe hacia abajo en el documento
        window.scrollBy(0, e.deltaY);
      }

      // Cuando se llega al límite superior y queremos seguir hacia arriba
      if (e.deltaY < 0 && container.scrollTop <= 0) {
        e.stopPropagation();
        // Permitir que el scroll continúe hacia arriba en el documento
        window.scrollBy(0, e.deltaY);
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Función para renderizar cada celda del grid - CORREGIDA
  const Cell = useCallback(({ columnIndex, rowIndex, style }: any) => {
    const idx = rowIndex * columnCount + columnIndex;

    // Si el índice excede el número total de productos, no renderizamos nada
    if (idx >= itemCount) return null;

    // CORRECCIÓN: Ajuste más preciso del espacio entre productos
    const cellStyle = {
      ...style,
      // Reducir sólo un poco el ancho y la altura para crear espacio entre productos
      top: (style.top as number) + (cellPadding / 2),
      left: (style.left as number) + (cellPadding / 2),
      width: (style.width as number) - cellPadding,
      height: (style.height as number) - cellPadding,
    };

    // Si es el último ítem y tenemos página siguiente, cargamos más
    if (!isItemLoaded(idx)) {
      return (
        <div style={cellStyle} className="flex items-center justify-center h-full">
          <CardSkeleton />
        </div>
      );
    }

    // Producto actual
    const product = products[idx];
    if (!product) return null;

    // Calcular prioridad - más alta para los primeros elementos visibles
    const isPriority = idx < columnCount * 2;

    return (
      <div style={cellStyle}>
        <div className="h-full w-full">
          <ProductCard
            key={product.id}
            product={product}
            prefetch={isPriority ? "hover" : "none"}
            lazyLoad={!isPriority}
          />
        </div>
      </div>
    );
  }, [products, columnCount, itemCount, isItemLoaded, cellPadding]);

  // Manejar cambio de tamaño para ajustar columnas
  const handleResize = useCallback((width: number, height: number) => {
    const newColumnCount = getColumnCount(width);
    if (newColumnCount !== columnCount) {
      setColumnCount(newColumnCount);
    }

    // Ajustar altura de filas según dispositivo
    const isMobileView = width < 768;

    // CORRECCIÓN: Altura de filas más adecuada
    const rowHeightValue = isMobileView ? 380 : 460;
    setRowHeight(rowHeightValue);

    // CORRECCIÓN: Padding más pequeño pero suficiente
    const newPadding = 6;
    setCellPadding(newPadding);

    // Resetear caché cuando cambia el layout
    if (gridRef.current?.resetAfterIndices) {
      gridRef.current.resetAfterIndices({
        columnIndex: 0,
        rowIndex: 0,
        shouldForceUpdate: true
      });
    }

    if (infiniteLoaderRef.current?.resetloadMoreItemsCache) {
      infiniteLoaderRef.current.resetloadMoreItemsCache();
    }
  }, [columnCount, getColumnCount]);

  const rowCount = Math.ceil(itemCount / columnCount);

  // CORRECCIÓN: Usar una altura fija y no 100vh para permitir scroll continuo
  const gridHeight = deviceData.isMobile ? 700 : 850;

  return (
    <div
      className="w-full"
      ref={containerRef}
      style={{
        // CORRECCIÓN: Altura fija en vez de 100vh y permitir overflow
        height: `${gridHeight}px`,
        position: 'relative'
      }}
    >
      <AutoSizer disableHeight onResize={({ width }) => handleResize(width, gridHeight)}>
        {({ width }) => (
          <InfiniteLoader
            ref={infiniteLoaderRef}
            isItemLoaded={isItemLoaded}
            itemCount={itemCount}
            loadMoreItems={loadNextPage}
            threshold={2}
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
                  ref={(gridInstance) => {
                    gridRef.current = gridInstance;
                    if (typeof ref === 'function') ref(gridInstance);
                  }}
                  columnCount={columnCount}
                  columnWidth={width / columnCount}
                  height={gridHeight}
                  rowCount={rowCount}
                  rowHeight={rowHeight}
                  width={width}
                  onItemsRendered={onGridItemsRendered}
                  overscanRowCount={2}
                  style={{
                    overscrollBehavior: 'auto', // CORRECCIÓN: Permitir que el scroll continúe
                    WebkitOverflowScrolling: 'touch',
                    willChange: 'transform',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                  }}
                  className="custom-scrollbar"
                >
                  {Cell}
                </Grid>
              );
            }}
          </InfiniteLoader>
        )}
      </AutoSizer>

      {/* Indicador de carga */}
      {isLoading && products.length > 0 && (
        <div className="absolute bottom-0 left-0 w-full flex justify-center p-4 pointer-events-none">
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-full px-4 py-2 flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-t-blue-500 border-r-blue-500 border-b-blue-500 border-l-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">Cargando más productos...</span>
          </div>
        </div>
      )}
    </div>
  );
}

function getInitialColumnCount(isMobile: boolean) {
  if (typeof window === 'undefined') return isMobile ? 1 : 4;

  const width = window.innerWidth;
  if (width < 500) return 2;
  if (width < 768) return 3;
  if (width < 1024) return 4;
  if (width < 1280) return 5;
  if (width < 1536) return 6;
  return 7;
}