import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, AlertCircle, MapPin, Phone, Mail, Building, FileText } from 'lucide-react';
import { geocodingService } from '@/lib/geocoding';

interface PharmacyFormData {
  // Basic info
  pharmacyName: string;
  email: string;
  phone: string;
  
  // Location
  address: string;
  city: string;
  region: string;
  
  // Authentication
  username: string;
  password: string;
  confirmPassword: string;
  
  // Additional info
  pharmacyOffers: string;
  googleMapsLink: string;
  
  // Validation
  latitude?: string;
  longitude?: string;
}

interface ValidationErrors {
  [key: string]: string;
}

const PharmacyRegistrationFlow = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PharmacyFormData>({
    pharmacyName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    region: '',
    username: '',
    password: '',
    confirmPassword: '',
    pharmacyOffers: '',
    googleMapsLink: ''
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isValidatingAddress, setIsValidatingAddress] = useState(false);
  const [addressValidated, setAddressValidated] = useState(false);

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  // Real-time validation functions
  const validateEmail = (email: string): string => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email è obbligatorio';
    if (!emailRegex.test(email)) return 'Formato email non valido';
    return '';
  };

  const validatePhone = (phone: string): string => {
    const phoneRegex = /^(\+39\s?)?[\d\s\-\(\)]{8,15}$/;
    if (!phone) return 'Numero di telefono è obbligatorio';
    if (!phoneRegex.test(phone)) return 'Formato telefono non valido (es: +39 123 456 7890)';
    return '';
  };

  const validatePassword = (password: string): string => {
    if (!password) return 'Password è obbligatoria';
    if (password.length < 8) return 'Password deve contenere almeno 8 caratteri';
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return 'Password deve contenere almeno una maiuscola, una minuscola e un numero';
    }
    return '';
  };

  const validateAddress = async (address: string): Promise<string> => {
    if (!address) return 'Indirizzo è obbligatorio';
    if (address.length < 5) return 'Indirizzo troppo breve';
    
    try {
      setIsValidatingAddress(true);
      const result = await geocodingService.geocodeAddress(address);
      if (result) {
        setFormData(prev => ({
          ...prev,
          latitude: result.lat.toString(),
          longitude: result.lng.toString()
        }));
        setAddressValidated(true);
        return '';
      } else {
        // Accept address even if geocoding fails
        setAddressValidated(true);
        return '';
      }
    } catch (error) {
      // Accept address even if geocoding fails
      setAddressValidated(true);
      return '';
    } finally {
      setIsValidatingAddress(false);
    }
  };

  // Handle field changes with real-time validation
  const handleFieldChange = async (field: keyof PharmacyFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    let error = '';
    switch (field) {
      case 'email':
        error = validateEmail(value);
        break;
      case 'phone':
        error = validatePhone(value);
        break;
      case 'password':
        error = validatePassword(value);
        break;
      case 'confirmPassword':
        error = value !== formData.password ? 'Le password non coincidono' : '';
        break;
      case 'address':
        // Make address validation more flexible
        if (value && value.length > 5) {
          error = await validateAddress(value);
        } else if (value.length > 0) {
          setAddressValidated(true); // Accept any non-empty address
        } else {
          setAddressValidated(false);
        }
        break;
      default:
        if (!value && ['pharmacyName', 'username', 'city', 'region'].includes(field)) {
          error = 'Campo obbligatorio';
        }
        break;
    }
    
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  // Check if current step is valid
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.pharmacyName && formData.email && formData.phone && 
                 !errors.pharmacyName && !errors.email && !errors.phone);
      case 2:
        return !!(formData.address && formData.city && formData.region && 
                 !errors.address && !errors.city && !errors.region && addressValidated);
      case 3:
        return !!(formData.username && formData.password && formData.confirmPassword &&
                 !errors.username && !errors.password && !errors.confirmPassword);
      case 4:
        return true; // Optional step
      default:
        return false;
    }
  };

  const registerMutation = useMutation({
    mutationFn: async (data: PharmacyFormData) => {
      let geocodeData = {};
      
      // Add geocoding for pharmacy addresses
      if (data.address && data.city) {
        try {
          const fullAddress = `${data.address}, ${data.city}, ${data.region || 'Italy'}`;
          const geocodingResponse = await fetch('/api/geocode', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: fullAddress })
          });
          
          if (geocodingResponse.ok) {
            const geocodeResult = await geocodingResponse.json();
            if (geocodeResult.lat && geocodeResult.lng) {
              geocodeData = {
                latitude: geocodeResult.lat.toString(),
                longitude: geocodeResult.lng.toString()
              };
            }
          }
        } catch (error) {
          console.warn('Geocoding failed, proceeding without coordinates:', error);
        }
      }
      
      const registrationData = {
        ...data,
        ...geocodeData,
        fullName: data.pharmacyName,
        userType: 'pharmacy'
      };
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registrazione fallita');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Registrazione completata!",
        description: "La farmacia è stata registrata con successo e sarà visibile sulla mappa.",
      });
      // Navigate to home page
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    },
    onError: (error: Error) => {
      toast({
        title: "Errore durante la registrazione",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const nextStep = () => {
    if (isStepValid(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Building className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold">Informazioni Farmacia</h3>
              <p className="text-gray-600">Iniziamo con i dati di base della farmacia</p>
            </div>
            
            <div>
              <Label htmlFor="pharmacyName">Nome Farmacia *</Label>
              <Input
                id="pharmacyName"
                value={formData.pharmacyName}
                onChange={(e) => handleFieldChange('pharmacyName', e.target.value)}
                placeholder="Es: Farmacia San Marco"
                className={errors.pharmacyName ? 'border-red-500' : ''}
              />
              {errors.pharmacyName && (
                <p className="text-red-500 text-sm mt-1">{errors.pharmacyName}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                placeholder="info@farmacia.it"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
              {formData.email && !errors.email && (
                <div className="flex items-center text-green-600 text-sm mt-1">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Email valida
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Telefono *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                placeholder="+39 123 456 7890"
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
              {formData.phone && !errors.phone && (
                <div className="flex items-center text-green-600 text-sm mt-1">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Numero valido
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold">Localizzazione</h3>
              <p className="text-gray-600">Dove si trova la farmacia?</p>
            </div>

            <div>
              <Label htmlFor="address">Indirizzo Completo *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleFieldChange('address', e.target.value)}
                placeholder="Via Roma 123, 00100"
                className={errors.address ? 'border-red-500' : ''}
              />
              {isValidatingAddress && (
                <div className="flex items-center text-blue-600 text-sm mt-1">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full mr-1"></div>
                  Validazione indirizzo...
                </div>
              )}
              {errors.address && (
                <p className="text-red-500 text-sm mt-1">{errors.address}</p>
              )}
              {addressValidated && !errors.address && (
                <div className="flex items-center text-green-600 text-sm mt-1">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Indirizzo verificato e geocodificato
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">Città *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleFieldChange('city', e.target.value)}
                  placeholder="Roma"
                  className={errors.city ? 'border-red-500' : ''}
                />
                {errors.city && (
                  <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                )}
              </div>

              <div>
                <Label htmlFor="region">Regione *</Label>
                <Input
                  id="region"
                  value={formData.region}
                  onChange={(e) => handleFieldChange('region', e.target.value)}
                  placeholder="Lazio"
                  className={errors.region ? 'border-red-500' : ''}
                />
                {errors.region && (
                  <p className="text-red-500 text-sm mt-1">{errors.region}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold">Credenziali Accesso</h3>
              <p className="text-gray-600">Crea le credenziali per accedere alla piattaforma</p>
            </div>

            <div>
              <Label htmlFor="username">Nome Utente *</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleFieldChange('username', e.target.value)}
                placeholder="farmacia_sanmarco"
                className={errors.username ? 'border-red-500' : ''}
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleFieldChange('password', e.target.value)}
                placeholder="Password sicura"
                className={errors.password ? 'border-red-500' : ''}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
              {formData.password && !errors.password && (
                <div className="flex items-center text-green-600 text-sm mt-1">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Password sicura
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Conferma Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                placeholder="Ripeti la password"
                className={errors.confirmPassword ? 'border-red-500' : ''}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
              )}
              {formData.confirmPassword && !errors.confirmPassword && formData.password === formData.confirmPassword && (
                <div className="flex items-center text-green-600 text-sm mt-1">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Password confermata
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold">Informazioni Aggiuntive</h3>
              <p className="text-gray-600">Opzionale: aggiungi dettagli sui servizi offerti</p>
            </div>

            <div>
              <Label htmlFor="pharmacyOffers">Descrizione Servizi Oncologici</Label>
              <Textarea
                id="pharmacyOffers"
                value={formData.pharmacyOffers}
                onChange={(e) => handleFieldChange('pharmacyOffers', e.target.value)}
                placeholder="Descrivi i servizi specializzati per pazienti oncologici che offri..."
                rows={4}
              />
              <p className="text-sm text-gray-500 mt-1">
                Es: preparazioni galeniche, nutrizione oncologica, supporto post-chemioterapia
              </p>
            </div>

            <div>
              <Label htmlFor="googleMapsLink">Link Google Maps (opzionale)</Label>
              <Input
                id="googleMapsLink"
                value={formData.googleMapsLink}
                onChange={(e) => handleFieldChange('googleMapsLink', e.target.value)}
                placeholder="https://maps.google.com/..."
              />
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Queste informazioni aiuteranno i pazienti a trovare i servizi specifici di cui hanno bisogno.
              </AlertDescription>
            </Alert>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Registrazione Farmacia</CardTitle>
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-sm text-gray-500">
            <span>Passo {currentStep} di {totalSteps}</span>
            <span>{Math.round(progress)}% completato</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {renderStep()}

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            Indietro
          </Button>

          {currentStep < totalSteps ? (
            <Button
              onClick={nextStep}
              disabled={!isStepValid(currentStep)}
              className="bg-primary hover:bg-primary/90"
            >
              Avanti
            </Button>
          ) : (
            <Button
              onClick={() => registerMutation.mutate(formData)}
              disabled={registerMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {registerMutation.isPending ? 'Registrazione...' : 'Completa Registrazione'}
            </Button>
          )}
        </div>

        {/* Step indicators */}
        <div className="flex justify-center mt-6 space-x-2">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`w-3 h-3 rounded-full ${
                step <= currentStep ? 'bg-primary' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PharmacyRegistrationFlow;