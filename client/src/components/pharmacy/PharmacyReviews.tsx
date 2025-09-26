import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, ThumbsUp, ThumbsDown, Flag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

interface Review {
  id: number;
  pharmacyId: number;
  userId: number;
  userName: string;
  userType: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
  reported: boolean;
  verified: boolean;
}

interface PharmacyReviewsProps {
  pharmacyId: number;
}

const PharmacyReviews = ({ pharmacyId }: PharmacyReviewsProps) => {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: ''
  });
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Fetch reviews
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['/api/pharmacies', pharmacyId, 'reviews'],
    queryFn: async () => {
      const response = await fetch(`/api/pharmacies/${pharmacyId}/reviews`);
      if (!response.ok) throw new Error('Failed to fetch reviews');
      return response.json() as Promise<Review[]>;
    }
  });

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: async (reviewData: { rating: number; comment: string }) => {
      const response = await fetch(`/api/pharmacies/${pharmacyId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData)
      });
      if (!response.ok) throw new Error('Failed to submit review');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pharmacies', pharmacyId, 'reviews'] });
      setNewReview({ rating: 5, comment: '' });
      setShowReviewForm(false);
      toast({
        title: 'Recensione inviata',
        description: 'La tua recensione è stata pubblicata con successo.'
      });
    },
    onError: () => {
      toast({
        title: 'Errore',
        description: 'Impossibile inviare la recensione. Riprova più tardi.',
        variant: 'destructive'
      });
    }
  });

  // Mark review as helpful
  const markHelpfulMutation = useMutation({
    mutationFn: async (reviewId: number) => {
      const response = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to mark as helpful');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pharmacies', pharmacyId, 'reviews'] });
    }
  });

  // Report review
  const reportReviewMutation = useMutation({
    mutationFn: async (reviewId: number) => {
      const response = await fetch(`/api/reviews/${reviewId}/report`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to report review');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Recensione segnalata',
        description: 'La segnalazione è stata inviata. Grazie per il tuo contributo.'
      });
    }
  });

  const handleSubmitReview = () => {
    if (!newReview.comment.trim()) {
      toast({
        title: 'Errore',
        description: 'Inserisci un commento per la recensione.',
        variant: 'destructive'
      });
      return;
    }

    submitReviewMutation.mutate(newReview);
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={() => interactive && onRatingChange?.(star)}
          />
        ))}
      </div>
    );
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0 
      ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100 
      : 0
  }));

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Recensioni e Valutazioni</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {averageRating.toFixed(1)}
              </div>
              {renderStars(Math.round(averageRating))}
              <div className="text-gray-600 mt-2">
                Basato su {reviews.length} recensioni
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-2">
                  <span className="text-sm w-8">{rating}</span>
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Add Review Button */}
          {isAuthenticated && !showReviewForm && (
            <div className="mt-6 text-center">
              <Button onClick={() => setShowReviewForm(true)}>
                Scrivi una recensione
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Form */}
      {showReviewForm && isAuthenticated && (
        <Card>
          <CardHeader>
            <CardTitle>Scrivi una recensione</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Valutazione</Label>
              {renderStars(newReview.rating, true, (rating) => 
                setNewReview(prev => ({ ...prev, rating }))
              )}
            </div>

            <div>
              <Label htmlFor="comment">Commento</Label>
              <Textarea
                id="comment"
                value={newReview.comment}
                onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Condividi la tua esperienza con questa farmacia..."
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleSubmitReview}
                disabled={submitReviewMutation.isPending}
              >
                {submitReviewMutation.isPending ? 'Invio...' : 'Pubblica recensione'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowReviewForm(false)}
              >
                Annulla
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar>
                  <AvatarFallback>
                    {review.userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">{review.userName}</span>
                    {review.verified && (
                      <Badge variant="secondary" className="text-xs">
                        Verificato
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {review.userType === 'patient' ? 'Paziente' : 
                       review.userType === 'professional' ? 'Professionista' : 'Farmacia'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    {renderStars(review.rating)}
                    <span className="text-sm text-gray-600">
                      {new Date(review.date).toLocaleDateString('it-IT')}
                    </span>
                  </div>

                  <p className="text-gray-700 mb-3">{review.comment}</p>

                  <div className="flex items-center gap-4 text-sm">
                    <button
                      onClick={() => markHelpfulMutation.mutate(review.id)}
                      className="flex items-center gap-1 text-gray-600 hover:text-primary transition-colors"
                    >
                      <ThumbsUp className="h-3 w-3" />
                      Utile ({review.helpful})
                    </button>

                    <button
                      onClick={() => reportReviewMutation.mutate(review.id)}
                      className="flex items-center gap-1 text-gray-600 hover:text-red-600 transition-colors"
                    >
                      <Flag className="h-3 w-3" />
                      Segnala
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {reviews.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-gray-500">
                <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="font-medium mb-2">Nessuna recensione ancora</h3>
                <p className="text-sm">Sii il primo a recensire questa farmacia!</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PharmacyReviews;