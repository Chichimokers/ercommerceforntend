import StatsCard, { colorVariants } from "./stats-card";
import GradientBackground from "./gradient-background";
import InteractiveContainer from "./client/interactive-container";
import { MapPin, SparkleIcon, Package, Globe, ShoppingCart } from "lucide-react";
import { getCategories } from "@/lib/api/categories";
import { getPublicStats } from "@lib/api/stats";

export default async function CategoryPanel() {
  const categories = await getCategories();
  const stats = await getPublicStats();

  const statsData = {
    products: stats?.products ? `+${stats.products}` : "+100",
    provinces: stats?.provinces || 2,
    categories: stats?.category || 5,
  };

  return (
    <div className="relative overflow-hidden">
      <GradientBackground />

      <div className="py-6 sm:py-12 px-4 sm:px-6 relative z-10">
        <div className="mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 items-center">
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-800 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600">
                <span className="inline-flex items-center gap-2">
                  Explora nuestras ofertas para Cuba
                  <SparkleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />
                </span>
              </h2>
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed max-w-lg">
                Nos enfocamos en brindar una amplia gama de productos para las provincias de{" "}
                <span className="font-medium bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                  Santiago de Cuba
                </span> y{" "}
                <span className="font-medium bg-gradient-to-r from-blue-500 to-blue-300 bg-clip-text text-transparent">
                  Villa Clara
                </span>.
                Próximamente, estaremos expandiéndonos a más regiones.
              </p>

              {/* Botón de ubicación (componente cliente) */}
              <div className="pt-2 sm:pt-3">
                <LocationButton />
              </div>
            </div>

            {/* Sección de estadísticas (renderizada en servidor) */}
            <div className="grid grid-cols-2 gap-2 sm:gap-4 mt-4 sm:mt-0">
              {/* Móvil */}
              <div className="md:hidden">
                <SimpleStatsCard
                  icon={<ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
                  label="Productos"
                  value={statsData.products}
                  colorClass={colorVariants.blue}
                />
              </div>
              <div className="md:hidden">
                <SimpleStatsCard
                  icon={<MapPin className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
                  label="Provincias"
                  value={statsData.provinces}
                  colorClass={colorVariants.purple}
                />
              </div>
              <div className="md:hidden">
                <SimpleStatsCard
                  icon={<Package className="h-5 w-5 text-green-600 dark:text-green-400" />}
                  label="Categorías"
                  value={statsData.categories}
                  colorClass={colorVariants.green}
                />
              </div>
              <div className="md:hidden">
                <SimpleStatsCard
                  icon={<Globe className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
                  label="Expansión"
                  value="En progreso"
                  colorClass={colorVariants.amber}
                />
              </div>

              {/* Desktop */}
              <div className="hidden md:block">
                <StatsCard
                  icon={<ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
                  label="Productos"
                  value={statsData.products}
                  colorClass={colorVariants.blue}
                  large
                />
              </div>
              <div className="hidden md:block">
                <StatsCard
                  icon={<MapPin className="h-6 w-6 text-purple-600 dark:text-purple-400" />}
                  label="Provincias"
                  value={statsData.provinces}
                  colorClass={colorVariants.purple}
                  large
                />
              </div>
              <div className="hidden md:block">
                <StatsCard
                  icon={<Package className="h-6 w-6 text-green-600 dark:text-green-400" />}
                  label="Categorías"
                  value={statsData.categories}
                  colorClass={colorVariants.green}
                  large
                />
              </div>
              <div className="hidden md:block">
                <StatsCard
                  icon={<Globe className="h-6 w-6 text-amber-600 dark:text-amber-400" />}
                  label="Expansión"
                  value="En progreso"
                  colorClass={colorVariants.amber}
                  large
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categorías con interactividad envuelta en cliente */}
      <InteractiveContainer categories={categories} />
    </div>
  );
}

// Importar componente cliente
import LocationButton from "./client/location-button";
// Importar componente simple para stats
import SimpleStatsCard from "./simple-stats-card";