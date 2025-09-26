import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { FileText, Upload, User, Calendar, Phone, Mail, MapPin, FileCheck } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { useAuth } from '@/context/AuthContext';

const requestSchema = z.object({
  firstName: z.string().min(2, 'Nome richiesto'),
  lastName: z.string().min(2, 'Cognome richiesto'),
  email: z.string().email('Email non valida'),
  phone: z.string().min(10, 'Numero di telefono richiesto'),
  dateOfBirth: z.string().min(1, 'Data di nascita richiesta'),
  cancerType: z.string().min(1, 'Tipo di tumore richiesto'),
  currentDiagnosis: z.string().min(10, 'Descrizione della diagnosi richiesta'),
  currentTreatment: z.string().optional(),
  medicalHistory: z.string().optional(),
  urgencyLevel: z.enum(['standard', 'urgent', 'critical']),
  consultationType: z.enum(['document-review', 'video-call', 'comprehensive']),
  additionalNotes: z.string().optional(),
  privacyAccepted: z.boolean().refine(val => val === true, 'Devi accettare le condizioni sulla privacy')
});

type RequestFormData = z.infer<typeof requestSchema>;

const SecondOpinionRequest = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      firstName: user?.fullName?.split(' ')[0] || '',
      lastName: user?.fullName?.split(' ').slice(1).join(' ') || '',
      email: user?.email || '',
      phone: user?.phone || '',
      urgencyLevel: 'standard',
      consultationType: 'document-review',
      privacyAccepted: false
    }
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const downloadContract = () => {
    // Download the bilingual second opinion service contract
    const link = document.createElement('a');
    link.href = '/attached_assets/second-opinion-contract.pdf';
    link.download = 'contratto-second-opinion-service.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const onSubmit = async (data: RequestFormData) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Richiesta inviata con successo",
        description: "Ti contatteremo entro 24 ore per confermare la tua richiesta di seconda opinione. Il contratto di servizio sarà scaricato automaticamente."
      });
      
      // Automatically trigger contract download after successful submission
      setTimeout(() => {
        downloadContract();
      }, 1000);

      // Reset form
      form.reset();
      setUploadedFiles([]);
      
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore nell'invio della richiesta. Riprova più tardi.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancerTypes = [
    'Tumore al seno',
    'Tumore ai polmoni',
    'Tumore al colon-retto',
    'Tumore alla prostata',
    'Tumore al fegato',
    'Tumore al pancreas',
    'Leucemia',
    'Linfoma',
    'Melanoma',
    'Tumore ovarico',
    'Tumore cervicale',
    'Tumore della tiroide',
    'Altro'
  ];

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold mb-4">Accesso richiesto</h2>
            <p className="text-gray-600 mb-4">
              Devi essere loggato per richiedere una seconda opinione.
            </p>
            <Button onClick={() => window.location.href = '/login'}>
              Accedi
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Richiedi una Seconda Opinione
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Compila il modulo sottostante per richiedere una valutazione professionale aggiuntiva sulla tua diagnosi oncologica.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Modulo di Richiesta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Informazioni Personali
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">Nome *</Label>
                        <Input
                          {...form.register('firstName')}
                          placeholder="Il tuo nome"
                        />
                        {form.formState.errors.firstName && (
                          <p className="text-red-500 text-sm mt-1">{form.formState.errors.firstName.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="lastName">Cognome *</Label>
                        <Input
                          {...form.register('lastName')}
                          placeholder="Il tuo cognome"
                        />
                        {form.formState.errors.lastName && (
                          <p className="text-red-500 text-sm mt-1">{form.formState.errors.lastName.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          {...form.register('email')}
                          type="email"
                          placeholder="la-tua-email@esempio.com"
                        />
                        {form.formState.errors.email && (
                          <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="phone">Telefono *</Label>
                        <Input
                          {...form.register('phone')}
                          placeholder="+39 123 456 7890"
                        />
                        {form.formState.errors.phone && (
                          <p className="text-red-500 text-sm mt-1">{form.formState.errors.phone.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="dateOfBirth">Data di Nascita *</Label>
                        <Input
                          {...form.register('dateOfBirth')}
                          type="date"
                        />
                        {form.formState.errors.dateOfBirth && (
                          <p className="text-red-500 text-sm mt-1">{form.formState.errors.dateOfBirth.message}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Medical Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <FileCheck className="h-5 w-5" />
                      Informazioni Mediche
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="cancerType">Tipo di Tumore *</Label>
                        <Select onValueChange={(value) => form.setValue('cancerType', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleziona il tipo di tumore" />
                          </SelectTrigger>
                          <SelectContent>
                            {cancerTypes.map(type => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {form.formState.errors.cancerType && (
                          <p className="text-red-500 text-sm mt-1">{form.formState.errors.cancerType.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="currentDiagnosis">Diagnosi Attuale *</Label>
                        <Textarea
                          {...form.register('currentDiagnosis')}
                          placeholder="Descrivi la tua diagnosi attuale, inclusi stadio, grado e caratteristiche del tumore"
                          rows={4}
                        />
                        {form.formState.errors.currentDiagnosis && (
                          <p className="text-red-500 text-sm mt-1">{form.formState.errors.currentDiagnosis.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="currentTreatment">Trattamento Attuale (opzionale)</Label>
                        <Textarea
                          {...form.register('currentTreatment')}
                          placeholder="Descrivi i trattamenti che stai seguendo o hai seguito"
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label htmlFor="medicalHistory">Storia Medica (opzionale)</Label>
                        <Textarea
                          {...form.register('medicalHistory')}
                          placeholder="Eventuali condizioni mediche preesistenti, allergie, farmaci"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Service Options */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Opzioni del Servizio
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="consultationType">Tipo di Consulenza</Label>
                        <Select onValueChange={(value: 'document-review' | 'video-call' | 'comprehensive') => form.setValue('consultationType', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleziona il tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="document-review">
                              Revisione Documenti (€150)
                            </SelectItem>
                            <SelectItem value="video-call">
                              Consulto con Videochiamata (€250)
                            </SelectItem>
                            <SelectItem value="comprehensive">
                              Consulto Completo (€350)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="urgencyLevel">Livello di Urgenza</Label>
                        <Select onValueChange={(value: 'standard' | 'urgent' | 'critical') => form.setValue('urgencyLevel', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleziona urgenza" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">Standard (5-7 giorni)</SelectItem>
                            <SelectItem value="urgent">Urgente (2-3 giorni)</SelectItem>
                            <SelectItem value="critical">Critico (24-48 ore)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* File Upload */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      Documenti Medici
                    </h3>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">
                          Carica i tuoi documenti medici (PDF, immagini, referti)
                        </p>
                        <p className="text-sm text-gray-500">
                          Clicca qui o trascina i file per caricarli
                        </p>
                      </label>
                    </div>
                    
                    {uploadedFiles.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">File caricati:</h4>
                        <div className="space-y-2">
                          {uploadedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                              <span className="text-sm">{file.name}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(index)}
                              >
                                Rimuovi
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Additional Notes */}
                  <div>
                    <Label htmlFor="additionalNotes">Note Aggiuntive (opzionale)</Label>
                    <Textarea
                      {...form.register('additionalNotes')}
                      placeholder="Eventuali informazioni aggiuntive che ritieni importanti"
                      rows={3}
                    />
                  </div>

                  {/* Privacy Acceptance */}
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      checked={form.watch('privacyAccepted')}
                      onCheckedChange={(checked) => form.setValue('privacyAccepted', checked as boolean)}
                    />
                    <div className="text-sm">
                      <p>
                        Accetto il trattamento dei miei dati personali secondo le normative GDPR e 
                        comprendo che le informazioni mediche saranno condivise solo con lo specialista 
                        selezionato per la seconda opinione. *
                      </p>
                    </div>
                  </div>
                  {form.formState.errors.privacyAccepted && (
                    <p className="text-red-500 text-sm">{form.formState.errors.privacyAccepted.message}</p>
                  )}

                  {/* Download Guide Button */}
                  <div className="flex justify-center mb-4">
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={downloadContract}
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      Scarica Contratto (IT/EN)
                    </Button>
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Invio in corso...' : 'Invia Richiesta'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Process Steps */}
            <Card>
              <CardHeader>
                <CardTitle>Prossimi Passi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <h4 className="font-medium">Revisione Richiesta</h4>
                    <p className="text-sm text-gray-600">Entro 24 ore verificheremo la tua richiesta</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <h4 className="font-medium">Assegnazione Specialista</h4>
                    <p className="text-sm text-gray-600">Ti abbineremo con lo specialista più adatto</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <h4 className="font-medium">Consulenza</h4>
                    <p className="text-sm text-gray-600">Riceverai la seconda opinione nei tempi stabiliti</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Hai bisogno di aiuto?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  <span className="text-sm">+39 02 1234 5678</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="text-sm">supporto@onconet.it</span>
                </div>
                <p className="text-xs text-gray-600 mt-4">
                  Il nostro team di supporto è disponibile dal lunedì al venerdì, dalle 9:00 alle 18:00.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecondOpinionRequest;