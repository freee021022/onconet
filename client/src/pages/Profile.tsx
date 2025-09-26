import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@/hooks/use-translation';
import { User } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Calendar, MapPin, Phone, Mail, Edit, Save, X, Star, MessageCircle, Clock, Camera, Stethoscope, Upload } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ProfessionalCalendar from '@/components/calendar/ProfessionalCalendar';

const Profile = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<User>>({});
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Get current user from auth context
  const { user: authUser, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold mb-4">Accesso richiesto</h2>
            <p className="text-gray-600 mb-4">
              Devi essere loggato per visualizzare il profilo.
            </p>
            <Button onClick={() => window.location.href = '/'}>
              Torna alla home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const currentUserId = authUser?.id;

  const { data: user, isLoading } = useQuery({
    queryKey: [`/api/users/${currentUserId}`],
    queryFn: async () => {
      const response = await fetch(`/api/users/${currentUserId}`);
      if (!response.ok) throw new Error('Failed to fetch user');
      return response.json() as Promise<User>;
    },
    enabled: !!currentUserId && isAuthenticated
  });

  // Use auth user data if API user data is not available
  const displayUser = user || authUser;

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<User>) => {
      const response = await fetch(`/api/users/${currentUserId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update profile');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${currentUserId}`] });
      setIsEditing(false);
      toast({
        title: "Profilo aggiornato",
        description: "Le modifiche sono state salvate con successo.",
      });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile salvare le modifiche.",
        variant: "destructive",
      });
    }
  });

  const handleEdit = () => {
    setIsEditing(true);
    setEditData(displayUser || {});
  };

  const handleSave = () => {
    updateProfileMutation.mutate(editData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({});
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditData({ ...editData, profileImage: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-32 bg-gray-300 rounded mb-6"></div>
            <div className="space-y-4">
              <div className="h-6 bg-gray-300 rounded w-1/3"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!displayUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Profilo non trovato</h1>
          <p className="text-gray-600">Impossibile caricare il profilo utente.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage 
                    src={(isEditing ? editData.profileImage : displayUser?.profileImage) || undefined} 
                    alt={displayUser?.fullName || displayUser?.username}
                  />
                  <AvatarFallback className="text-2xl">
                    {displayUser?.fullName?.charAt(0) || displayUser?.username?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-4">
                      <Input
                        value={editData.fullName || ''}
                        onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                        placeholder="Nome completo"
                      />
                      <Input
                        value={editData.email || ''}
                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                        placeholder="Email"
                        type="email"
                      />
                      <Input
                        value={editData.phone || ''}
                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                        placeholder="Telefono"
                      />
                      <Input
                        value={editData.city || ''}
                        onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                        placeholder="Città"
                      />
                      <Input
                        value={editData.region || ''}
                        onChange={(e) => setEditData({ ...editData, region: e.target.value })}
                        placeholder="Regione"
                      />
                      <Input
                        value={editData.address || ''}
                        onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                        placeholder="Indirizzo"
                      />
                      {displayUser.userType === 'professional' && (
                        <>
                          <Input
                            value={editData.specialization || ''}
                            onChange={(e) => setEditData({ ...editData, specialization: e.target.value })}
                            placeholder="Specializzazione"
                          />
                          <Input
                            value={editData.hospital || ''}
                            onChange={(e) => setEditData({ ...editData, hospital: e.target.value })}
                            placeholder="Ospedale"
                          />
                          <Input
                            value={editData.licenseNumber || ''}
                            onChange={(e) => setEditData({ ...editData, licenseNumber: e.target.value })}
                            placeholder="Numero licenza"
                          />
                        </>
                      )}
                      {displayUser.userType === 'pharmacy' && (
                        <>
                          <Input
                            value={editData.pharmacyName || ''}
                            onChange={(e) => setEditData({ ...editData, pharmacyName: e.target.value })}
                            placeholder="Nome farmacia"
                          />
                          <Textarea
                            value={editData.pharmacyOffers || ''}
                            onChange={(e) => setEditData({ ...editData, pharmacyOffers: e.target.value })}
                            placeholder="Servizi offerti"
                            rows={2}
                          />
                        </>
                      )}
                      <Textarea
                        value={editData.bio || ''}
                        onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                        placeholder="Descrizione del profilo"
                        rows={3}
                      />
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById('image-upload')?.click()}
                          className="flex items-center gap-2"
                        >
                          <Camera className="h-4 w-4" />
                          Cambia Foto
                        </Button>
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {displayUser?.fullName || displayUser?.username}
                      </h1>
                      <p className="text-gray-600 mb-2">{displayUser?.email}</p>
                      <Badge variant="outline" className="mb-4">
                        {displayUser?.userType === 'professional' ? 'Medico' : 
                         displayUser?.userType === 'pharmacy' ? 'Farmacia' : 'Paziente'}
                      </Badge>
                      {displayUser?.bio && (
                        <p className="text-gray-700">{displayUser.bio}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-2">
                {isEditing ? (
                  <>
                    <Button 
                      onClick={handleSave}
                      disabled={updateProfileMutation.isPending}
                      size="sm"
                    >
                      <Save className="h-4 w-4 mr-1" />
                      Salva
                    </Button>
                    <Button 
                      onClick={handleCancel}
                      variant="outline"
                      size="sm"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Annulla
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleEdit} size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Modifica
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Features - Only for professionals */}
        {displayUser?.userType === 'professional' ? (
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profilo</TabsTrigger>
              <TabsTrigger value="calendar">Calendario</TabsTrigger>
              <TabsTrigger value="services">Servizi</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <ProfileInfoCard />
            </TabsContent>
            
            <TabsContent value="calendar">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Gestione Calendario
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ProfessionalCalendar />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="services">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5" />
                    Servizi Professionali
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h3 className="font-medium">Servizio Seconda Opinione</h3>
                      <p className="text-sm text-gray-600">
                        Renditi disponibile per fornire seconde opinioni mediche ai pazienti
                      </p>
                    </div>
                    <Switch
                      checked={displayUser?.availableForSecondOpinion || false}
                      onCheckedChange={async (checked) => {
                        try {
                          // Update the user in storage
                          const response = await fetch(`/api/users/${displayUser?.id}`, {
                            method: 'PUT',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              ...displayUser,
                              availableForSecondOpinion: checked
                            }),
                          });

                          if (response.ok) {
                            // Invalidate query to refresh data
                            queryClient.invalidateQueries({ queryKey: ['/api/users', displayUser?.id] });
                            queryClient.invalidateQueries({ queryKey: ['/api/doctors'] });
                            
                            toast({
                              title: checked ? "Servizio attivato" : "Servizio disattivato",
                              description: checked 
                                ? "Ora sei disponibile per seconde opinioni" 
                                : "Non sei più disponibile per seconde opinioni"
                            });
                          } else {
                            throw new Error('Errore nell\'aggiornamento');
                          }
                        } catch (error) {
                          toast({
                            title: "Errore",
                            description: "Impossibile aggiornare le impostazioni",
                            variant: "destructive"
                          });
                        }
                      }}
                    />
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-2">Vantaggi del Servizio</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Amplia la tua rete professionale</li>
                      <li>• Aiuta pazienti in cerca di conferme mediche</li>
                      <li>• Contribuisci alla comunità oncologica</li>
                      <li>• Ricevi compensi per le consulenze</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <ProfileInfoCard />
        )}
      </div>
    </div>
  );

  // Component for profile information
  function ProfileInfoCard() {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Informazioni profilo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Tipo account</Label>
              <p className="text-gray-700">
                {displayUser?.userType === 'professional' ? 'Professionista medico' : 
                 displayUser?.userType === 'pharmacy' ? 'Farmacia' : 'Paziente'}
              </p>
            </div>
            {displayUser?.userType === 'professional' && (
                <>
              <div>
                <Label>Specializzazione</Label>
                <p className="text-gray-700">{displayUser?.specialization || 'Non specificata'}</p>
              </div>
              <div>
                <Label>Ospedale</Label>
                <p className="text-gray-700">{displayUser?.hospital || 'Non specificato'}</p>
              </div>
              <div>
                <Label>Numero licenza</Label>
                <p className="text-gray-700">{displayUser?.licenseNumber || 'Non specificato'}</p>
              </div>
            </>
            )}
            {displayUser?.userType === 'pharmacy' && (
            <>
              <div>
                <Label>Nome farmacia</Label>
                <p className="text-gray-700">{displayUser?.pharmacyName || displayUser?.fullName}</p>
              </div>
              <div>
                <Label>Servizi offerti</Label>
                <p className="text-gray-700">{displayUser?.pharmacyOffers || 'Non specificati'}</p>
              </div>
            </>
            )}
            <div>
              <Label>Telefono</Label>
              <p className="text-gray-700">{displayUser?.phone || 'Non specificato'}</p>
            </div>
            <div>
              <Label>Città</Label>
              <p className="text-gray-700">{displayUser?.city || 'Non specificata'}</p>
            </div>
            <div>
              <Label>Regione</Label>
              <p className="text-gray-700">{displayUser?.region || 'Non specificata'}</p>
            </div>
            <div>
              <Label>Indirizzo</Label>
              <p className="text-gray-700">{displayUser?.address || 'Non specificato'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
};

export default Profile;