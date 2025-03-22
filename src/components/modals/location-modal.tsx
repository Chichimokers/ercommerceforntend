"use client";
import useSWR from "swr";
import { useState, useContext, ChangeEvent, useEffect, useMemo } from "react";
import { useLocationStore } from "@store/location/location-store";
import { Alert, Select, SelectItem } from "@heroui/react";
import { CustomButton } from "@components/buttons/custom-button";
import { motion, AnimatePresence } from "framer-motion";
import { CartContext } from "@contexts/cart-context";
import Image from "next/image";
import { locationFetcher } from "@services/location";

interface Option {
  key: string;
  label: string;
}

interface LocationModalProps {
  open: boolean;
  onClose: () => void;
  initialProvince?: string;
  initialMunicipality?: string;
}

export default function LocationModal({ open, onClose, initialProvince = '', initialMunicipality = '' }: LocationModalProps) {
  const { location, setLocation } = useLocationStore();
  const { clearCart, cart } = useContext(CartContext) || {};
  const [province, setProvince] = useState<string>(location?.province || initialProvince);
  const [municipality, setMunicipality] = useState<string>(location?.municipality || initialMunicipality);
  const [changeLocation, setChangeLocation] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setProvince(location?.province || "");
      setMunicipality(location?.municipality || "");
    }
  }, [open, location]);

  const { data: provinces = [], isLoading: loadingProvinces, error: provincesError } = useSWR<Option[]>(
    open ? `${process.env.NEXT_PUBLIC_API_URL}public/provinces` : null,
    locationFetcher,
    {
      revalidateOnFocus: false,
      onError: (err) => {
        console.error("Error fetching provinces:", err);
        setFetchError("Error al cargar provincias");
      }
    }
  );

  const { data: municipalities = [], isLoading: loadingMunicipalities, error: municipalitiesError } = useSWR<Option[]>(
    (open && province && province.trim() !== "")
      ? `${process.env.NEXT_PUBLIC_API_URL}public/municipalities/${province}`
      : null,
    locationFetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
      onError: (err) => {
        console.error("Error fetching municipalities:", err);
        setFetchError("Error al cargar municipios");
      }
    }
  );

  const provinceList: Option[] = useMemo(() => {
    if (!Array.isArray(provinces)) {
      console.warn("Provinces is not an array:", provinces);
      return [];
    }

    try {
      return provinces.map((prov: any) => ({
        key: prov.id?.toString() || "",
        label: prov.name || "Provincia sin nombre"
      }));
    } catch (e) {
      console.error("Error processing provinces:", e);
      return [];
    }
  }, [provinces]);

  const municipalityList: Option[] = useMemo(() => {
    if (!Array.isArray(municipalities)) {
      console.warn("Municipalities is not an array:", municipalities);
      return [];
    }

    try {
      return municipalities.map((mun: any) => ({
        key: mun.id?.toString() || "",
        label: mun.name || "Municipio sin nombre"
      }));
    } catch (e) {
      console.error("Error processing municipalities:", e);
      return [];
    }
  }, [municipalities]);

  const handleProvinceChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setProvince(event.target.value);
    setMunicipality("");
  };

  const handleMunicipalityChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setMunicipality(event.target.value);
  };

  const handleConfirm = () => {
    setLocation({ province, municipality });
    if (clearCart && changeLocation && cart?.length) clearCart();
    setChangeLocation(false);
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
            className="fixed inset-0 bg-black/50 z-50"
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
              <div className="flex items-center justify-center mb-4">
                <Image alt={"Mapa de Cuba"} src="/cuba.png" width={300} height={100} />
              </div>
              <h2 className="text-medium font-light text-gray-800 dark:text-gray-200 mb-4">Serán mostrados los productos que puedan ser entregados en la provincia que seleccione.</h2>

              {/*fetchError && (
                <Alert variant="solid" color="danger" className="mb-4">
                  {fetchError}
                </Alert>
              )*/}

              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Provincia</label>
              <Select
                aria-label="Provinces"
                className="w-full"
                value={province}
                onChange={(e) => {
                  if (location.province) {
                    setChangeLocation(true);
                  }
                  handleProvinceChange(e);
                }}
                defaultSelectedKeys={[province]}
                items={provinceList}
                placeholder={loadingProvinces ? "Cargando..." : provincesError ? "Error al cargar" : "Selecciona una provincia"}
                disabled={loadingProvinces}
              >
                {(province) => <SelectItem>{province.label}</SelectItem>}
              </Select>

              <label className="block mt-4 text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Municipio</label>
              <Select
                aria-label="Municipalities"
                className="w-full"
                value={municipality}
                onChange={(e) => {
                  if (location.municipality) {
                    setChangeLocation(true);
                  }
                  handleMunicipalityChange(e);
                }}
                defaultSelectedKeys={[municipality]}
                items={municipalityList}
                placeholder={
                  !province ? "Selecciona una provincia primero" :
                    loadingMunicipalities ? "Cargando..." :
                      municipalitiesError ? "Error al cargar" :
                        municipalityList.length === 0 ? "No hay municipios disponibles" :
                          "Selecciona un municipio"
                }
                disabled={loadingMunicipalities || !province}
              >
                {(municipality) => <SelectItem>{municipality.label}</SelectItem>}
              </Select>

              {province && !loadingMunicipalities && municipalityList.length === 0 && (
                <div className="mt-2 text-sm text-amber-600 dark:text-amber-400">
                  No se pudieron cargar los municipios para esta provincia. Por favor, intenta nuevamente.
                </div>
              )}

              {(changeLocation && cart?.length) ?
                <Alert variant="faded" color="danger" className="mt-4">Al cambiar la ubicacion se eliminaran todos los productos del carrito</Alert>
                :
                null
              }

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