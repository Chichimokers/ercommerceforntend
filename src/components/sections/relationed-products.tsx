import { Card, CardBody, Spinner } from "@heroui/react";
import { useMemo } from "react";
import ProductsSlider from "../sliders/products-slider";
import { useRelatedProducts } from "@/hooks/useRelatedProducts";
import { FaExclamationCircle, FaInfoCircle } from "react-icons/fa";

type RelatedProductSectionProps = {
  id: string;
};

type MessageProps = {
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
};

const Message = ({ children, className = "", icon }: MessageProps) => (
  <div className={`slide-in flex flex-col items-center justify-center gap-3 py-8 ${className}`}>
    {icon && <div className="text-gray-400">{icon}</div>}
    <p className="text-center text-gray-600 dark:text-gray-300">{children}</p>
  </div>
);

export default function RelatedProductSection({
  id,
}: RelatedProductSectionProps) {
  const { relatedProducts, loading, error } = useRelatedProducts(id);

  const renderProducts = useMemo(() => {
    if (
      !id ||
      !Array.isArray(relatedProducts) ||
      relatedProducts.length === 0
    ) {
      return [];
    }

    return relatedProducts.filter(
      (product) => product?.id !== id && Boolean(product)
    );
  }, [relatedProducts, id]);

  if (!id) {
    return null;
  }

  const renderContent = () => {
    if (loading) {
      return (
        <Message icon={<Spinner size="lg" className="text-primary-500" />}>
          Cargando productos relacionados...
        </Message>
      );
    }

    if (error) {
      return (
        <Message 
          className="text-red-500" 
          icon={<FaExclamationCircle className="w-10 h-10 text-red-500" />}
        >
          Hubo un problema al cargar los productos relacionados. Por favor,
          intenta nuevamente más tarde.
        </Message>
      );
    }

    if (renderProducts.length === 0) {
      return (
        <Message 
          icon={<FaInfoCircle className="w-10 h-10" />}
        >
          No hay productos similares para mostrar
        </Message>
      );
    }

    return (
      <div className="w-full">
        <ProductsSlider products={renderProducts} />
      </div>
    );
  };

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
        Productos relacionados
      </h2>
      <Card className="border-y border-default-200 shadow-md hover:shadow-lg transition-shadow duration-300 rounded-xl h-max w-full overflow-hidden min-h-[300px] flex flex-col py-4 bg-gray-50 dark:bg-gray-900/70" role="article">
        <CardBody>{renderContent()}</CardBody>
      </Card>
    </section>
  );
}