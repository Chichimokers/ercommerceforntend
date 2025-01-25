import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());
export const useRelatedProducts = (prodId: string) => {
   console.log(prodId)
  const { data, error, isLoading } = useSWR(
    prodId ? `${process.env.NEXT_PUBLIC_API_URL}public/product-relations?id=${prodId}` : null,
    fetcher,
    {
      revalidateOnFocus: false, 
    }
  );

  return {
    relatedProducts: data || [],
    loading: isLoading,
    error: error ? error.message : null,
  };
};
