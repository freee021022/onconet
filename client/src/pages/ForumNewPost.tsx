import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from 'wouter';
import { ForumCategory } from '@shared/schema';
import { ArrowLeft, Send } from 'lucide-react';

const ForumNewPost = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: ''
  });

  // Get forum categories
  const { data: categories } = useQuery({
    queryKey: ['/api/forum/categories'],
    queryFn: async () => {
      const response = await fetch('/api/forum/categories', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json() as Promise<ForumCategory[]>;
    }
  });

  const createPostMutation = useMutation({
    mutationFn: async (postData: {
      title: string;
      content: string;
      categoryId: number;
    }) => {
      const response = await fetch('/api/forum/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(postData)
      });
      if (!response.ok) throw new Error('Failed to create post');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/forum/posts'] });
      toast({
        title: "Post creato",
        description: "Il tuo post è stato pubblicato con successo.",
      });
      setLocation('/forum');
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile creare il post.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      toast({
        title: "Accesso richiesto",
        description: "Devi essere loggato per creare un post.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title.trim() || !formData.content.trim() || !formData.categoryId) {
      toast({
        title: "Campi obbligatori",
        description: "Compila tutti i campi richiesti.",
        variant: "destructive",
      });
      return;
    }

    createPostMutation.mutate({
      title: formData.title.trim(),
      content: formData.content.trim(),
      categoryId: parseInt(formData.categoryId)
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold mb-4">Accesso richiesto</h2>
            <p className="text-gray-600 mb-4">
              Devi essere loggato per creare un nuovo post nel forum.
            </p>
            <Button onClick={() => setLocation('/')}>
              Torna alla home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => setLocation('/forum')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Torna al forum
          </Button>
          <h1 className="text-2xl font-bold">Crea nuovo post</h1>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Nuovo post nel forum</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria *
                </label>
                <Select 
                  value={formData.categoryId} 
                  onValueChange={(value) => handleInputChange('categoryId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona una categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titolo *
                </label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Inserisci il titolo del post"
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.title.length}/200 caratteri
                </p>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contenuto *
                </label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="Scrivi il contenuto del tuo post..."
                  rows={8}
                  maxLength={5000}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.content.length}/5000 caratteri
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={createPostMutation.isPending}
                  className="flex items-center gap-2 flex-1"
                >
                  <Send className="h-4 w-4" />
                  {createPostMutation.isPending ? 'Pubblicazione...' : 'Pubblica post'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation('/forum')}
                  disabled={createPostMutation.isPending}
                >
                  Annulla
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Guidelines */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Linee guida per i post</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Sii rispettoso e costruttivo nelle discussioni</li>
              <li>• Usa un titolo chiaro e descrittivo</li>
              <li>• Seleziona la categoria più appropriata</li>
              <li>• Evita contenuti offensivi o inappropriati</li>
              <li>• Condividi informazioni accurate e verificate</li>
              <li>• Rispetta la privacy e non condividere dati personali sensibili</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForumNewPost;