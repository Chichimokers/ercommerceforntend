"use client";

import { useNavigation } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";

export default function CategoryEdit() {
  const { list } = useNavigation();

  const {
    refineCore: { onFinish },
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({});

  return (
    <div className="p-4">
      <div className="flex justify-between">
        <h1>Edit</h1>
        <div>
          <button
            onClick={() => {
              list("categories");
            }}
          >
            List
          </button>
        </div>
      </div>
      <form onSubmit={handleSubmit(onFinish)}>
        <div className="flex flex-col gap-2">
          <label>
            <span className="mr-2">Title</span>
            <input
              type="text"
              {...register("title", {
                required: "This field is required",
              })}
            />
            <span className="text-red-500">
              {(errors as any)?.title?.message as string}
            </span>
          </label>
          <div>
            <input type="submit" value="Save" />
          </div>
        </div>
      </form>
    </div>
  );
}
