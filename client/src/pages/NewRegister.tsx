import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useTranslation } from '@/hooks/use-translation';
import { useAuth } from '@/context/AuthContext';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

// Schema base per tutti i tipi di utenti
const baseRegisterSchema = z.object({
  username: z.string().min(3, 'Username deve essere almeno 3 caratteri'),
  password: z.string().min(6, 'Password deve essere almeno 6 caratteri'),
  confirmPassword: z.string().min(6, 'Conferma password richiesta'),
  email: z.string().email('Email non valida'),
  fullName: z.string().min(2, 'Nome completo richiesto'),
  userType: z.enum(['patient', 'professional', 'pharmacy']),
  phone: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  bio: z.string().optional(),
  
  // Campi per professionisti
  specialization: z.string().optional(),
  hospital: z.string().optional(),
  licenseNumber: z.string().optional(),
  
  // Campi per farmacie
  pharmacyName: z.string().optional(),
  address: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Le password non corrispondono",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof baseRegisterSchema>;

const NewRegister = () => {
  const { t } = useTranslation();
  const [_location, navigate] = useLocation();
  const { register: authRegister } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Ottieni tipo utente dall'URL
  const urlParams = new URLSearchParams(window.location.search);
  const userType = urlParams.get('type') || 'patient';
  
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(baseRegisterSchema),
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
      email: '',
      fullName: '',
      userType: userType as 'patient' | 'professional' | 'pharmacy',
      phone: '',
      city: '',
      region: '',
      bio: '',
      specialization: '',
      hospital: '',
      licenseNumber: '',
      pharmacyName: '',
      address: '',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    try {
      // Rimuovi confirmPassword e campi non necessari
      const { confirmPassword, ...registerData } = data;
      
      // Rimuovi campi vuoti non necessari per il tipo di utente
      const cleanData = Object.fromEntries(
        Object.entries(registerData).filter(([_, value]) => 
          value !== '' && value !== undefined && value !== null
        )
      );
      
      await authRegister(cleanData);
      
      toast({
        title: 'Registrazione completata',
        description: 'Il tuo account è stato creato con successo!',
      });
      
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        variant: 'destructive',
        title: 'Errore di registrazione',
        description: typeof error === 'string' ? error : 'Si è verificato un errore durante la registrazione',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentUserTypeLabel = () => {
    switch (userType) {
      case 'professional': return 'Professionista Sanitario';
      case 'pharmacy': return 'Farmacia Oncologica';
      default: return 'Paziente';
    }
  };

  const specializations = [
    { value: 'oncologia-medica', label: 'Oncologia Medica' },
    { value: 'chirurgia-oncologica', label: 'Chirurgia Oncologica' },
    { value: 'radioterapia', label: 'Radioterapia' },
    { value: 'ematologia', label: 'Ematologia' },
    { value: 'oncologia-pediatrica', label: 'Oncologia Pediatrica' },
    { value: 'ginecologia-oncologica', label: 'Ginecologia Oncologica' },
    { value: 'urologia-oncologica', label: 'Urologia Oncologica' },
    { value: 'neurochirurgia-oncologica', label: 'Neurochirurgia Oncologica' },
  ];

  const regions = [
    'Abruzzo', 'Basilicata', 'Calabria', 'Campania', 'Emilia-Romagna',
    'Friuli-Venezia Giulia', 'Lazio', 'Liguria', 'Lombardia', 'Marche',
    'Molise', 'Piemonte', 'Puglia', 'Sardegna', 'Sicilia', 'Toscana',
    'Trentino-Alto Adige', 'Umbria', 'Valle d\'Aosta', 'Veneto'
  ];

  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Registrazione {getCurrentUserTypeLabel()}
            </h1>
            <p className="text-gray-600">
              Completa i dati per creare il tuo account su Onconet24
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Dati base */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo *</FormLabel>
                      <FormControl>
                        <Input placeholder="Mario Rossi" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username *</FormLabel>
                      <FormControl>
                        <Input placeholder="mario.rossi" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="mario@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password *</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conferma Password *</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Campi per professionisti */}
              {userType === 'professional' && (
                <>
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Informazioni Professionali</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="specialization"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Specializzazione</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleziona specializzazione" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {specializations.map((spec) => (
                                  <SelectItem key={spec.value} value={spec.value}>
                                    {spec.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="licenseNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Numero di Iscrizione Albo</FormLabel>
                            <FormControl>
                              <Input placeholder="es. 12345" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="hospital"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ospedale/Struttura</FormLabel>
                          <FormControl>
                            <Input placeholder="es. Ospedale San Raffaele" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}

              {/* Campi per farmacie */}
              {userType === 'pharmacy' && (
                <>
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Informazioni Farmacia</h3>
                    
                    <FormField
                      control={form.control}
                      name="pharmacyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Farmacia *</FormLabel>
                          <FormControl>
                            <Input placeholder="es. Farmacia San Paolo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Indirizzo *</FormLabel>
                          <FormControl>
                            <Input placeholder="es. Via Roma 123" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}

              {/* Dati geografici e contatto */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Informazioni di Contatto</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Regione</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleziona regione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {regions.map((region) => (
                              <SelectItem key={region} value={region}>
                                {region}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Città</FormLabel>
                        <FormControl>
                          <Input placeholder="es. Milano" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefono</FormLabel>
                      <FormControl>
                        <Input placeholder="es. +39 012 345 6789" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {userType === 'professional' ? 'Esperienza e Bio' : 
                         userType === 'pharmacy' ? 'Descrizione Servizi' : 'Presentazione'}
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder={
                            userType === 'professional' ? 'Descrivi la tua esperienza professionale...' :
                            userType === 'pharmacy' ? 'Descrivi i servizi oncologici offerti...' :
                            'Raccontaci di te...'
                          }
                          className="resize-none" 
                          rows={3}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col space-y-4">
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? 'Registrazione in corso...' : 'Completa Registrazione'}
                </Button>
                
                <div className="text-center">
                  <Link href="/user-type-selection">
                    <Button variant="outline" type="button">
                      Cambia Tipo di Account
                    </Button>
                  </Link>
                </div>
              </div>
            </form>
          </Form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Hai già un account?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Accedi qui
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewRegister;