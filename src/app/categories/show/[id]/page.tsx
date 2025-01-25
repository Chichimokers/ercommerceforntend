"use client";

import { useNavigation, useResource, useShow } from "@refinedev/core";

export default function CategoryShow() {
  const { edit, list } = useNavigation();
  const { id } = useResource();
  const { queryResult } = useShow({});
  const { data } = queryResult;

  const record = data?.data;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center">
        <h1>Show</h1>
        <div className="flex gap-2">
          <button onClick={() => list("categories")}>List</button>
          <button onClick={() => edit("categories", id ?? "")}>Edit</button>
        </div>
      </div>
      <div>
        <div className="mt-[6px]">
          <h5>ID</h5>
          <div>{record?.id ?? ""}</div>
        </div>
        <div className="mt-[6px]">
          <h5>Title</h5>
          <div>{record?.title}</div>
        </div>
      </div>
    </div>
  );
}
