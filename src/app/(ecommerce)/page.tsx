"use client";

import dynamic from "next/dynamic";
import { banners } from "@/test-data/test-banners";
import { useProductContext } from "@/contexts/product-context";
import { PromisesPanel } from "@/components/panels/promises-panel";
import CategoryPanel from "@/components/panels/category-panel";
import EmptyState from "@components/empty-state";

const PublicityBannerSlider = dynamic(
  () => import("@/components/sliders/publicity-banner-slider")
);

const ProductCard = dynamic(() => import("@/components/cards/product-card"));

export default function IndexPage() {
  const { products } = useProductContext();
  const rating_products = products.slice(0, 4);

  /*const [categories, setCategories] = useState<string[]>([]);
  const [products, setProducts] = useState<ProductBase[]>([]);

  useEffect(() => {
    fetch("http://localhost:3000/products")
      .then((response) => response.json())
      .then((data) => setProducts(data))
      // eslint-disable-next-line no-console
      .catch((error) => console.error("Error fetching products:", error));
  }, []);

  useEffect(() => {
    fetch("http://localhost:3000/categories")
      .then((response) => response.json())
      .then((data) => setCategories(data))
      // eslint-disable-next-line no-console
      .catch((error) => console.error("Error fetching categories:", error));
  }, []);*/

  return (
    <div>
      <div className="slide-in flex-1">
        <PublicityBannerSlider banners={banners}></PublicityBannerSlider>
        <div className="my-4">
          <CategoryPanel />
        </div>
        <PromisesPanel />
      </div>
      <div className="mb-4 mx-2 slide-right">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Productos Destacados
        </h2>
        <div className="grid grid-cols-2 xm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-2 justify-items-center">
          {rating_products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
          {rating_products.length === 0 && (
            <EmptyState
              message="No hay productos destacados"
              className="col-span-full"
              iconSize={64}
            >
              <button className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                Recargar
              </button>
            </EmptyState>
          )}
        </div>
      </div>
      <div className="mb-4 mx-2">
        <PublicityBannerSlider
          className="rounded-lg"
          banners={banners}
        ></PublicityBannerSlider>
      </div>
    </div>
  );
}
