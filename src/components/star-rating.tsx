import { Star, StarHalf } from "lucide-react";

interface StarRatingProps {
  value?: number; // número entre 0 y 5
  onChange?: (value: number) => void;
  size?: number; // tamaño opcional de las estrellas
  className?: string;
}

const StarRating = ({
  value = 0,
  size = 20,
  onChange,
  className = "",
}: StarRatingProps) => {
  if (typeof value !== "number") {
    return null;
  }

  const stars = [];
  const roundedRating = Math.round(value * 2) / 2; // Redondea a 0.5 más cercano

  for (let i = 1; i <= 5; i++) {
    if (i <= roundedRating) {
      stars.push(<Star fill="yellow" key={i} className="text-yellow-400" size={size} />);
    } else if (i - 0.5 === roundedRating) {
      stars.push(
        <StarHalf fill="yellow" key={i} className="text-yellow-400" size={size} />
      );
    } else {
      stars.push(<Star key={i} className="text-yellow-400" size={size} />);
    }
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {stars}
      {/*<span className="ml-1 text-sm text-gray-600 dark:text-gray-300">
        ({rating.toFixed(1)})
      </span>*/}
    </div>
  );
};

export default StarRating;
