'use client';

import { useFormContext } from 'react-hook-form';
import { MapPinIcon } from 'lucide-react';

export const AddressForm = () => {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Provincia</label>
          <input
            {...register("province")}
            className="w-full rounded-lg p-2 border border-default-200 dark:bg-zinc-800 focus:ring-2 focus:ring-primary"
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
            className="w-full rounded-lg p-2 border border-default-200 dark:bg-zinc-800"
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
            className="w-full rounded-lg p-2 border border-default-200 dark:bg-zinc-800"
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
            className="w-full rounded-lg p-2 border border-default-200 dark:bg-zinc-800"
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
            className="w-full rounded-lg p-2 border border-default-200 dark:bg-zinc-800"
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