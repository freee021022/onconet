import { useState } from 'react';
import { Link } from 'wouter';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, UserCheck, Building2, ArrowRight, Upload, Calendar, MapPin, Phone, Mail } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';


const UserRegistrationSection = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedUserType, setSelectedUserType] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  const registerMutation = useMutation({
    mutationFn: async (data: any) => {

      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Registrazione completata",
        description: "Il tuo account è stato creato con successo!",
      });
      setSelectedUserType(null);
      setFormData({});
      

    },
    onError: (error) => {
      toast({
        title: "Errore nella registrazione",
        description: error.message || "Si è verificato un errore durante la registrazione",
        variant: "destructive",
      });
    },
  });

  const userTypes = [
    {
      type: 'patient',
      title: 'Paziente',
      description: 'Sei un paziente oncologico o un familiare che cerca supporto',
      icon: User,
      color: 'bg-blue-500',
      features: [
        'Accesso al forum della comunità',
        'Richiesta di seconde opinioni mediche',
        'Ricerca farmacie specializzate'
      ]
    },
    {
      type: 'professional',
      title: 'Professionista Sanitario',
      description: 'Sei un oncologo, medico specialista o operatore sanitario',
      icon: UserCheck,
      color: 'bg-green-500',
      features: [
        'Fornire seconde opinioni mediche',
        'Partecipare alle discussioni',
        'Network con altri specialisti'
      ]
    },
    {
      type: 'pharmacy',
      title: 'Farmacia',
      description: 'Sei una farmacia specializzata in prodotti oncologici',
      icon: Building2,
      color: 'bg-purple-500',
      features: [
        'Presenza sulla mappa specializzata',
        'Promozione servizi oncologici',
        'Connessione con pazienti e medici'
      ]
    }
  ];

  return (
    <section id="user-registration" className="py-16 bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Unisciti alla Rete Onconet
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Scegli il profilo più adatto a te e inizia a far parte della prima rete oncologica italiana dedicata al supporto e alla condivisione delle conoscenze
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {userTypes.map((userType) => {
            const IconComponent = userType.icon;
            return (
              <Card key={userType.type} className="relative overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 bg-white">
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 ${userType.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold">{userType.title}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {userType.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {userType.features.map((feature, index) => (
                      <li key={index} className="flex items-start text-sm">
                        <span className="text-green-500 mr-2 mt-1 text-xs">✓</span>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    onClick={() => {
                      window.location.href = `/register?type=${userType.type}`;
                    }}
                    className="w-full bg-primary hover:bg-primary/90 group"
                  >
                    Registrati
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>


        
        {selectedUserType && (
          <div className="bg-white rounded-xl p-8 shadow-lg max-w-2xl mx-auto mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                Registrazione {selectedUserType === 'patient' ? 'Paziente' : 'Professionista'}
              </h3>
              <Button 
                variant="ghost" 
                onClick={() => setSelectedUserType(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </Button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              registerMutation.mutate({
                ...formData,
                userType: selectedUserType
              });
            }}>
              {/* Common Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="fullName">Nome completo *</Label>
                  <Input 
                    id="fullName"
                    value={formData.fullName || ''}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input 
                    id="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="username">Username *</Label>
                  <Input 
                    id="username"
                    value={formData.username || ''}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input 
                    id="password"
                    type="password"
                    value={formData.password || ''}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                  />
                </div>
              </div>

              {/* Patient-specific fields */}
              {selectedUserType === 'patient' && (
                <div className="mb-4">
                  <Label htmlFor="birthDate">Data di nascita *</Label>
                  <Input 
                    id="birthDate"
                    type="date"
                    value={formData.birthDate || ''}
                    onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                    required
                  />
                </div>
              )}

              {/* Professional-specific fields */}
              {selectedUserType === 'professional' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label htmlFor="specialization">Specializzazione *</Label>
                      <Select onValueChange={(value) => setFormData({...formData, specialization: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona specializzazione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="oncologia-medica">Oncologia Medica</SelectItem>
                          <SelectItem value="chirurgia-oncologica">Chirurgia Oncologica</SelectItem>
                          <SelectItem value="radioterapia">Radioterapia</SelectItem>
                          <SelectItem value="ematologia">Ematologia</SelectItem>
                          <SelectItem value="ginecologia-oncologica">Ginecologia Oncologica</SelectItem>
                          <SelectItem value="urologia-oncologica">Urologia Oncologica</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="hospital">Ospedale/Struttura *</Label>
                      <Input 
                        id="hospital"
                        value={formData.hospital || ''}
                        onChange={(e) => setFormData({...formData, hospital: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <Label htmlFor="studioAddress">Indirizzo Studio</Label>
                    <Input 
                      id="studioAddress"
                      value={formData.studioAddress || ''}
                      onChange={(e) => setFormData({...formData, studioAddress: e.target.value})}
                      placeholder="Via, Civico, Città"
                    />
                  </div>

                  <div className="mb-4">
                    <Label htmlFor="phone">Telefono</Label>
                    <Input 
                      id="phone"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="+39 XXX XXX XXXX"
                    />
                  </div>

                  <div className="mb-4">
                    <Label htmlFor="verificationDocument">Documento di Verifica (PDF)</Label>
                    <div className="mt-2 flex items-center gap-2">
                      <Input 
                        id="verificationDocument"
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setFormData({...formData, verificationDocument: file.name});
                          }
                        }}
                      />
                      <Upload className="h-4 w-4 text-gray-500" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Carica il certificato di iscrizione all'albo per la verifica
                    </p>
                  </div>
                </>
              )}

              {/* Pharmacy-specific registration - use dedicated flow */}
              {selectedUserType === 'pharmacy' && (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">
                    Per la registrazione delle farmacie, utilizza il nostro processo guidato ottimizzato.
                  </p>
                  <Button
                    onClick={() => {
                      setSelectedUserType(null);
                      document.querySelector('#pharmacy-registration-flow')?.scrollIntoView({ 
                        behavior: 'smooth' 
                      });
                    }}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Vai alla Registrazione Farmacia
                  </Button>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1 bg-primary hover:bg-primary/90"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? 'Registrazione...' : 'Completa Registrazione'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setSelectedUserType(null)}
                >
                  Annulla
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl p-8 shadow-sm max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Perché scegliere Onconet?
            </h3>
            <p className="text-gray-600">
              La piattaforma che unisce pazienti, medici e farmacie in una rete di supporto dedicata all'oncologia
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold mb-2">Comunità Sicura</h4>
              <p className="text-sm text-gray-600">
                Un ambiente protetto dove condividere esperienze e ricevere supporto qualificato
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-semibold mb-2">Professionisti Verificati</h4>
              <p className="text-sm text-gray-600">
                Tutti i medici e farmacisti sono verificati e autorizzati all'esercizio
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-semibold mb-2">Rete Nazionale</h4>
              <p className="text-sm text-gray-600">
                Accesso a specialisti e farmacie oncologiche in tutta Italia
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-600 mb-4">
            Hai già un account?
          </p>
          <Link href="/login">
            <Button variant="outline" className="px-8">
              Accedi alla Piattaforma
            </Button>
          </Link>
        </div>
      </div>


    </section>
  );
};

export default UserRegistrationSection;