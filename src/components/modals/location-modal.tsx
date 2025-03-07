"use client";
import useSWR from "swr";
import { useState, useContext, ChangeEvent, useEffect } from "react";
import { useLocation } from "@contexts/location-context";
import { Select, SelectItem } from "@heroui/react";
import { CustomButton } from "@components/buttons/custom-button";
import { motion, AnimatePresence } from "framer-motion";
import { CartContext } from "@contexts/cart-context";

interface Option {
  key: string;
  label: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface LocationModalProps {
  open: boolean;
  onClose: () => void;
}

export default function LocationModal({ open, onClose }: LocationModalProps) {
  const { location, setLocation } = useLocation();
  const { clearCart } = useContext(CartContext) || {};
  const [province, setProvince] = useState<string>(location?.province || "");
  const [municipality, setMunicipality] = useState<string>(location?.municipality || "");

  useEffect(() => {
    if (open) {
      setProvince(location?.province || "");
      setMunicipality(location?.municipality || "");
    }
  }, [open, location]);


  const { data: provinces = [], isLoading: loadingProvinces } = useSWR<Option[]>(
    open ? `${process.env.NEXT_PUBLIC_API_URL}public/provinces` : null,
    fetcher
  );

  const { data: municipalities = [], isLoading: loadingMunicipalities } = useSWR<Option[]>(
    province ? `${process.env.NEXT_PUBLIC_API_URL}public/municipalities/${province}` : null,
    fetcher
  );

  const provinceList: Option[] = provinces.map((prov: any) => ({ key: prov.id, label: prov.name }));
  const municipalityList: Option[] = municipalities.map((mun: any) => ({ key: mun.id, label: mun.name }));

  const handleProvinceChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setProvince(event.target.value);
    setMunicipality("");
  };

  const handleMunicipalityChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setMunicipality(event.target.value);
  };

  const handleConfirm = () => {
    setLocation({ province, municipality });
    if (clearCart) clearCart();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50"
          >
            <div className="bg-white dark:bg-default-50 rounded-lg shadow-lg p-6 w-[90%] max-w-md relative">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Selecciona tu ubicación</h2>

              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Provincia</label>
              <Select
                className="w-full"
                value={province}
                onChange={handleProvinceChange}
                defaultSelectedKeys={[province]}
                items={provinceList}
                placeholder={loadingProvinces ? "Cargando..." : "Selecciona una provincia"}
                disabled={loadingProvinces}
              >
                {(province) => <SelectItem>{province.label}</SelectItem>}
              </Select>

              <label className="block mt-4 text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Municipio</label>
              <Select
                className="w-full"
                value={municipality}
                onChange={handleMunicipalityChange}
                defaultSelectedKeys={[municipality]}
                items={municipalityList}
                placeholder={loadingMunicipalities ? "Cargando..." : "Selecciona un municipio"}
                disabled={loadingMunicipalities || !province}
              >
                {(municipality) => <SelectItem>{municipality.label}</SelectItem>}
              </Select>

              <div className="mt-6 flex justify-end gap-2">
                <CustomButton onClick={onClose} className="bg-transparent hover:bg-default-100 !text-default-600">
                  Cancelar
                </CustomButton>
                <CustomButton onClick={handleConfirm} isDisabled={!province || !municipality}>
                  Confirmar
                </CustomButton>
              </div>

              <button onClick={onClose} className="absolute top-3 right-3 text-default-500 hover:bg-default-200 w-8 h-8 rounded-full">
                ✖
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}