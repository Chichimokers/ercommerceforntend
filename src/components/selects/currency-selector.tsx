"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useCurrencyStore } from "@store/currency/currency-store";
import { currencies } from "@/helpers/currency-codes-list";
import {
  Modal,
  ModalContent,
  Select,
  SelectItem,
  Spinner,
  Tooltip,
} from "@heroui/react";
import { WalletIcon } from "lucide-react";

interface CurrencySelectorProps {
  selectlabel?: string;
}

export default function CurrencySelector({ selectlabel }: CurrencySelectorProps) {

  const {
    selectedCurrency,
    handleCurrencyChange,
    isDataChanging
  } = useCurrencyStore();

  const [showModal, setShowModal] = useState(false);

  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isInitialLoad) {
      setIsInitialLoad(false);
      return;
    }

    if (isDataChanging) {
      timer = setTimeout(() => {
        setShowModal(true);
      }, 1000);
    } else {
      setShowModal(false);
    }
    return () => clearTimeout(timer);
  }, [isDataChanging, isInitialLoad]);

  const ModalFallback = useCallback(() => (
    <div className="flex justify-center items-center w-full h-full">
      <Spinner size="lg" color="primary" className="bg-transparent" />
    </div>
  ), []);

  const currencyItems = useMemo(() => {
    return Object.entries(currencies).map(([code, currency]) => ({
      key: code,
      name: currency.name,
      label: (
        <Tooltip
          content={
            <div className="flex items-center mb-1">
              <span className="font-bold dark:text-default-500 text-gray-800">
                Símbolo:
              </span>
              <span className="text-blue-600 font-semibold">
                {currency.symbol}
              </span>
            </div>
          }
          showArrow={true}
          shadow="md"
          closeDelay={2000}
          placement="left"
          color="default"
        >
          <div className="flex items-center space-x-2 cursor-help">
            <span className="font-semibold dark:text-default-500 text-gray-700">
              {currency.code}
            </span>
            <span className="text-gray-500 text-sm">{currency.name}</span>
          </div>
        </Tooltip>
      ),
      value: code,
    }));
  }, []);

  const handleSelectionChange = useCallback((selected: React.Key) => {
    const newCurrency = selected.toString().toUpperCase();
    handleCurrencyChange(newCurrency);
  }, [handleCurrencyChange]);

  if (!selectedCurrency) return null;

  return (
    <>
      <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
        <Select
          startContent={<WalletIcon className="text-blue-600" />}
          aria-label="Seleccione una moneda"
          className="max-w-xs rounded-lg border border-default-200"
          labelPlacement="outside-left"
          label={selectlabel}
          size="sm"
          variant="flat"
          items={currencyItems}
          inputMode="text"
          selectedKeys={new Set([selectedCurrency])}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys).pop();
            if (selected) handleSelectionChange(selected);
          }}
          fullWidth
          isDisabled={isDataChanging}
        >
          {(item) => (
            <SelectItem
              color="default"
              variant="shadow"
              key={item.key}
              textValue={item.name}
            >
              {item.label}
            </SelectItem>
          )}
        </Select>
      </div>

      <Modal
        hideCloseButton
        isOpen={showModal}
        classNames={{
          base: "bg-transparent shadow-none",
          wrapper: "bg-transparent",
        }}
      >
        <ModalContent className="bg-transparent shadow-none border-none">
          <ModalFallback />
        </ModalContent>
      </Modal>
    </>
  );
}