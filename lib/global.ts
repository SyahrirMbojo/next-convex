"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export const useParamsCustom = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const updatedParams = new URLSearchParams(searchParams);

  const setParams = (key: string, value: string) => {
    updatedParams.set(key, value);
    router.replace(`${pathname}?${updatedParams.toString()}`);
  };

  const getParams = (key: string) => {
    return updatedParams.get(key);
  };

  const deleteParams = (key: string) => {
    updatedParams.delete(key);
    router.replace(`${pathname}?${updatedParams.toString()}`);
  };

  return { setParams, getParams, deleteParams };
};

export const uploadFile = async (url: string, file: File) => {
  const result = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!result.ok) {
    return null;
  }

  const { storageId } = await result.json();
  return storageId;
};
