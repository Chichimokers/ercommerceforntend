"use client";

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button, Card, CardBody, CardHeader, Textarea, Avatar, Pagination, Chip } from '@heroui/react';
import StarRating from './star-rating';

import { User2, CheckCircle2, StarIcon, CircleGauge } from 'lucide-react';
import { formatDistance } from 'date-fns';
import { es } from 'date-fns/locale';

interface Review {
  id: string;
  userId: string;
  userName: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: string;
  verified: boolean;
}

interface ReviewSectionProps {
  productId: string;
  initialReviews?: Review[];
  averageRating?: number;
  reviewCount?: number;
}

async function fetcher(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch reviews');
  return res.json();
}

const ReviewSection: React.FC<ReviewSectionProps> = ({
  productId,
  initialReviews = [],
  averageRating = 0,
  reviewCount = 0
}) => {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(Math.max(1, Math.ceil(reviewCount / 5)));
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Load reviews for current page
  React.useEffect(() => {
    const loadReviews = async () => {
      if (!productId) return;

      setLoading(true);
      try {
        const data = await fetcher(`/api/reviews?productId=${productId}&page=${page}&limit=5`);
        setReviews(data.reviews);
        setTotalPages(Math.max(1, Math.ceil(data.total / 5)));
      } catch (error) {
        console.error('Error loading reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, [productId, page]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!rating) {
      setErrorMessage('Por favor, selecciona una calificación');
      return;
    }

    if (!comment.trim()) {
      setErrorMessage('Por favor, escribe un comentario');
      return;
    }

    setErrorMessage('');
    setSubmitting(true);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          rating,
          comment
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al enviar la reseña');
      }

      // Reset form
      setRating(null);
      setComment('');
      setSuccessMessage('¡Reseña enviada con éxito! Se mostrará después de ser revisada.');

      // Refresh reviews
      const data = await fetcher(`/api/reviews?productId=${productId}&page=1&limit=5`);
      setReviews(data.reviews);
      setTotalPages(Math.max(1, Math.ceil(data.total / 5)));
      setPage(1);

    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Error desconocido al enviar la reseña');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Rating summary */}
      <Card className="mb-6">
        <CardBody className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex flex-col items-center md:items-start mb-4 md:mb-0">
            <div className="text-4xl font-bold text-gray-900 dark:text-white">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex mt-2">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className={`w-5 h-5 ${i < Math.floor(averageRating)
                    ? "text-yellow-400"
                    : "text-gray-300"
                    }`}
                />
              ))}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Basado en {reviewCount} reseñas
            </div>
          </div>

          <div className="flex flex-col space-y-2 w-full md:w-2/3">
            {[5, 4, 3, 2, 1].map((stars) => {
              const percentage = reviewCount > 0
                ? Math.round((reviews.filter(r => Math.round(r.rating) === stars).length / reviewCount) * 100)
                : 0;

              return (
                <div key={stars} className="flex items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-10">
                    {stars} <StarIcon className="inline w-3 h-3 text-yellow-400" />
                  </span>
                  <div className="flex-1 h-2 mx-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div
                      className="h-2 bg-yellow-400 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-10">
                    {percentage}%
                  </span>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Write a review */}
      {session ? (
        <Card className="mb-8">
          <CardHeader>
            <h3 className="text-lg font-semibold">Escribe una reseña</h3>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg">
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="p-3 bg-green-50 text-green-700 rounded-lg">
                  {successMessage}
                </div>
              )}

              <div>
                <label className="block text-gray-700 dark:text-gray-200 mb-2">
                  Calificación
                </label>
                <StarRating
                  value={rating || 0}
                  onChange={setRating}
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-200 mb-2" htmlFor="comment">
                  Tu opinión
                </label>
                <Textarea
                  id="comment"
                  placeholder="Comparte tu experiencia con este producto..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  minRows={4}
                />
              </div>

              <Button
                type="submit"
                color="primary"
                isLoading={submitting}
                disabled={submitting}
              >
                Enviar reseña
              </Button>
            </form>
          </CardBody>
        </Card>
      ) : (
        <Card className="mb-8 bg-blue-50 dark:bg-blue-900/20">
          <CardBody className="text-center py-6">
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              Inicia sesión para dejar tu reseña sobre este producto
            </p>
            <Button
              as="a"
              href="/auth/login?callbackUrl=/products/[id]"
              color="primary"
              variant="flat"
              className="font-medium"
            >
              Iniciar sesión
            </Button>
          </CardBody>
        </Card>
      )}

      {/* Reviews list */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">
          Reseñas de clientes ({reviewCount})
        </h3>

        {loading ? (
          <div className="flex justify-center py-8">
            <CircleGauge className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            No hay reseñas para este producto
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-b dark:border-gray-700 pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <Avatar
                        name={review.userName}
                        fallback={<User2 className="text-gray-400" />}
                        className="mr-3"
                      />
                      <div>
                        {/*readOnly propiedad de StarRating*/}
                        <div className="font-medium">{review.userName}</div>
                        <div className="flex items-center mt-1">
                          <StarRating
                            value={review.rating}

                            className="mr-2"
                          />
                          <span className="text-xs text-gray-500">
                            {formatDistance(new Date(review.createdAt), new Date(), {
                              addSuffix: true,
                              locale: es,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    {review.verified && (
                      <Chip color="success" size="sm">
                        <CheckCircle2 className="mr-1 w-3 h-3" />
                        Compra verificada
                      </Chip>
                    )}
                  </div>
                  <p className="mt-3 text-gray-700 dark:text-gray-300">
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <Pagination
                  total={totalPages}
                  initialPage={page}
                  onChange={setPage}
                  showControls
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ReviewSection;