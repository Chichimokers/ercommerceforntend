import useSWR from "swr";

export const useCategories = (baseUrl:string) => {
    return useSWR('/public/categories', () => 
      fetch(`${baseUrl}/public/categories`)
        .then(res => {
          if (!res.ok) throw new Error("Error fetching categories");
          return res.json();
        })
    );
  };
  