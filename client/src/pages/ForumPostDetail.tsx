import { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@/hooks/use-translation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, MessageCircle, Send, Eye } from 'lucide-react';
import { ForumPost, ForumComment, User } from '@shared/schema';

const ForumPostDetail = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');

  // Fetch post details and comments
  const { data: postData, isLoading, error } = useQuery({
    queryKey: [`/api/forum/posts/${id}`],
    queryFn: async () => {
      const response = await fetch(`/api/forum/posts/${id}`);
      if (!response.ok) throw new Error('Failed to fetch post');
      return response.json() as Promise<{ post: ForumPost & { author: User, categoryName: string }, comments: (ForumComment & { author: User })[] }>;
    },
    enabled: !!id
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (commentData: { content: string; userId: number; postId: number }) => {
      const response = await fetch('/api/forum/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentData)
      });
      if (!response.ok) throw new Error('Failed to add comment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/forum/posts/${id}`] });
      setNewComment('');
      toast({
        title: "Commento aggiunto",
        description: "Il tuo commento è stato pubblicato con successo.",
      });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile aggiungere il commento.",
        variant: "destructive",
      });
    }
  });

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      toast({
        title: "Accesso richiesto",
        description: "Devi essere loggato per commentare.",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim()) {
      toast({
        title: "Campo obbligatorio",
        description: "Scrivi un commento prima di inviarlo.",
        variant: "destructive",
      });
      return;
    }

    addCommentMutation.mutate({
      content: newComment.trim(),
      userId: user.id,
      postId: parseInt(id!)
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-32 mb-6" />
          <Card className="mb-8">
            <CardHeader>
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !postData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-bold mb-4">Post non trovato</h2>
              <p className="text-gray-600 mb-4">
                Il post che stai cercando non esiste o è stato rimosso.
              </p>
              <Link href="/forum">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Torna al Forum
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { post, comments } = postData;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link href="/forum">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna al Forum
          </Button>
        </Link>

        {/* Post Content */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">{post.title}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Di: {post.author?.fullName || 'Utente'}</span>
                  <span>•</span>
                  <span>{formatDate(post.createdAt)}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {post.viewCount} visualizzazioni
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap">{post.content}</p>
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Commenti ({comments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Add Comment Form */}
            {isAuthenticated ? (
              <form onSubmit={handleSubmitComment} className="mb-6">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Scrivi un commento..."
                  className="mb-3"
                  rows={3}
                />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {newComment.length}/1000 caratteri
                  </span>
                  <Button 
                    type="submit" 
                    disabled={!newComment.trim() || addCommentMutation.isPending}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Pubblica Commento
                  </Button>
                </div>
              </form>
            ) : (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-gray-600 mb-3">
                  Devi essere loggato per scrivere un commento
                </p>
                <Link href="/login">
                  <Button>Accedi</Button>
                </Link>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="border-l-2 border-blue-100 pl-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {comment.author?.fullName?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {comment.author?.fullName || 'Utente'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Nessun commento ancora. Sii il primo a commentare!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForumPostDetail;