import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

interface StarRatingProps {
  rating?: number; // número entre 0 y 5
  size?: number; // tamaño opcional de las estrellas
  className?: string;
}

const StarRating = ({
  rating = 0,
  size = 20,
  className = "",
}: StarRatingProps) => {
  if (typeof rating !== "number") {
    return null;
  }

  const stars = [];
  const roundedRating = Math.round(rating * 2) / 2; // Redondea a 0.5 más cercano

  for (let i = 1; i <= 5; i++) {
    if (i <= roundedRating) {
      stars.push(<FaStar key={i} className="text-yellow-400" size={size} />);
    } else if (i - 0.5 === roundedRating) {
      stars.push(
        <FaStarHalfAlt key={i} className="text-yellow-400" size={size} />
      );
    } else {
      stars.push(<FaRegStar key={i} className="text-yellow-400" size={size} />);
    }
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {stars}
      <span className="ml-1 text-sm text-gray-600 dark:text-gray-300">
        ({rating.toFixed(1)})
      </span>
    </div>
  );
};

export default StarRating;
