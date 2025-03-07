"use client";
import { useState, useEffect, useContext } from "react";
import { useLocation } from "@contexts/location-context";
import { Select, SelectItem } from "@heroui/react";
import { CustomButton } from "@components/buttons/custom-button";
import { motion, AnimatePresence } from "framer-motion";
import { CartContext } from "@contexts/cart-context";

export default function LocationModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { location, setLocation } = useLocation();
  const [province, setProvince] = useState(location?.province || "");
  const [municipality, setMunicipality] = useState(location?.municipality || "");
  const [provinces, setProvinces] = useState<{ key: string; label: string }[]>([]);
  const [municipalities, setMunicipalities] = useState<{ key: string; label: string }[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingMunicipalities, setLoadingMunicipalities] = useState(false);
  const { clearCart } = useContext(CartContext) || {};

  useEffect(() => {
    async function fetchProvinces() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}public/provinces`);
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const data = await response.json();
        const provinceList = data.map((prov: any) => ({ key: prov.id, label: prov.name }));
        setProvinces(provinceList);

        const foundProvince = provinceList.find((p: any) => p.key === location?.province);
        if (foundProvince) setProvince(foundProvince.key);
      } catch (error) {
        console.error("Error al obtener las provincias", error);
      } finally {
        setLoadingProvinces(false);
      }
    }

    if (open) fetchProvinces();
  }, [open, location?.province]);

  useEffect(() => {
    async function fetchMunicipalities() {
      if (!province) return;
      setLoadingMunicipalities(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}public/municipalities/${province}`);
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const data = await response.json();
        const municipalityList = data.map((mun: any) => ({ key: mun.id, label: mun.name }));
        setMunicipalities(municipalityList);

        const foundMunicipality = municipalityList.find((m: any) => m.key === location?.municipality);
        if (foundMunicipality) setMunicipality(foundMunicipality.key);
      } catch (error) {
        console.error("Error al obtener los municipios", error);
      } finally {
        setLoadingMunicipalities(false);
      }
    }

    fetchMunicipalities();
  }, [province, location?.municipality]);

  const handleProvinceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setProvince(event.target.value);
    setMunicipality("");
    setMunicipalities([]);
  };

  const handleMunicipalityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setMunicipality(event.target.value);
  };

  const handleConfirm = () => {
    setLocation({ province, municipality });
    if (clearCart) clearCart();
    onClose();
  };

  const selectedProvince = provinces.find((p) => p.key === location.province)?.key;
  const selectedMunicipality = municipalities.find((m) => m.key === location.municipality)?.key;


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
                items={provinces}
                defaultSelectedKeys={selectedProvince ? [selectedProvince] : []}
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
                items={municipalities}
                defaultSelectedKeys={selectedMunicipality ? [selectedMunicipality] : []}
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
