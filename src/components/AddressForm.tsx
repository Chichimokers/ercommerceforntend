'use client';

import { useLocation } from '@contexts/location-context';
import { useFormContext } from 'react-hook-form';
import { locationFetcher } from '@services/location';
import useSWR from 'swr';
import { useEffect, useMemo, useState } from 'react';

interface Option {
  key: string;
  label: string;
}

export const AddressForm = () => {
  const { register, formState: { errors }, setValue } = useFormContext();
  const { location } = useLocation();

  const [province, setProvince] = useState<string>(location?.province || "");
  const [municipality, setMunicipality] = useState<string>(location?.municipality || "");
  const [provinceLabel, setProvinceLabel] = useState<string>("");
  const [municipalityLabel, setMunicipalityLabel] = useState<string>("");

  const { data: provinces = [], isLoading: loadingProvinces, error: provincesError } = useSWR<Option[]>(
    `${process.env.NEXT_PUBLIC_API_URL}public/provinces`,
    locationFetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
      onError: (err) => {
        console.error("Error fetching provinces:", err);
      }
    }
  );

  const { data: municipalities = [], isLoading: loadingMunicipalities, error: municipalitiesError } = useSWR<Option[]>(
    (province && province.trim() !== "")
      ? `${process.env.NEXT_PUBLIC_API_URL}public/municipalities/${province}`
      : null,
    locationFetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
      onError: (err) => {
        console.error("Error fetching municipalities:", err);
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

  // Efecto para actualizar provinceLabel y setValue para la validación
  useEffect(() => {
    if (provinceList.length > 0 && location?.province) {
      const foundProvince = provinceList.find(p => p.key === location.province.toString());
      if (foundProvince) {
        setProvinceLabel(foundProvince.label);
        // Establecer el valor en el formulario para pasar la validación
        setValue("province", foundProvince.label, {
          shouldValidate: true,
          shouldDirty: true
        });
      }
    }
  }, [provinceList, location?.province, setValue]);

  // Efecto para actualizar municipalityLabel y setValue para la validación
  useEffect(() => {
    if (municipalityList.length > 0 && location?.municipality) {
      const foundMunicipality = municipalityList.find(m => m.key === location?.municipality.toString());
      if (foundMunicipality) {
        setMunicipalityLabel(foundMunicipality.label);
        // Establecer el valor en el formulario para pasar la validación
        setValue("municipality", foundMunicipality.key, {
          shouldValidate: true,
          shouldDirty: true
        });
      }
    }
  }, [municipalityList, location?.municipality, setValue]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Provincia</label>
          <input
            {...register("province")}
            value={provinceLabel || (loadingProvinces ? "Cargando..." : "No disponible")}
            disabled
            className="w-full rounded-xl p-2 border border-default-200 bg-gray-100 dark:bg-gray-900/50 focus:ring-2 focus:ring-primary"
          />
          {errors.province && (
            <span className="text-red-500 text-sm">
              {errors.province.message as string}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Municipio</label>
          <input
            {...register("municipality")}
            value={municipalityLabel || (loadingMunicipalities ? "Cargando..." : "No disponible")}
            disabled
            className="w-full rounded-xl p-2 border border-default-200 bg-gray-100 dark:bg-gray-900/50"
          />
          {errors.municipality && (
            <span className="text-red-500 text-sm">
              {errors.municipality.message as string}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Distrito</label>
          <input
            {...register("district")}
            className="w-full rounded-xl p-2 border border-default-200 bg-gray-100 dark:bg-gray-900/50"
          />
          {errors.district && (
            <span className="text-red-500 text-sm">
              {errors.district.message as string}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Calle</label>
          <input
            {...register("street")}
            className="w-full rounded-xl p-2 border border-default-200 bg-gray-100 dark:bg-gray-900/50"
          />
          {errors.street && (
            <span className="text-red-500 text-sm">
              {errors.street.message as string}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Número</label>
          <input
            {...register("houseNumber")}
            className="w-full rounded-xl p-2 border border-default-200 bg-gray-100 dark:bg-gray-900/50"
          />
          {errors.houseNumber && (
            <span className="text-red-500 text-sm">
              {errors.houseNumber.message as string}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};