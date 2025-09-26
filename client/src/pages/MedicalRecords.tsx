import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertMedicalRecordSchema, insertSosContractSchema, type MedicalRecord, type SosContract } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { 
  FileText, 
  Plus, 
  Calendar, 
  Hospital, 
  Pill, 
  Activity, 
  Share2,
  Shield,
  AlertTriangle,
  Clock,
  Eye,
  EyeOff,
  Lock
} from 'lucide-react';

const medicalRecordFormSchema = insertMedicalRecordSchema.extend({
  date: z.string(),
});

const sosContractFormSchema = insertSosContractSchema.extend({
  emergencyType: z.string(),
  accessLevel: z.string(),
});

const MedicalRecords: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddRecordOpen, setIsAddRecordOpen] = useState(false);
  const [isSosContractOpen, setIsSosContractOpen] = useState(false);

  // Verifica che l'utente sia un paziente
  if (!isAuthenticated || user?.userType !== 'patient') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <Lock className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Accesso Riservato</h2>
            <p className="text-gray-600">
              La cartella clinica digitale è disponibile solo per i pazienti registrati.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch medical records
  const { data: medicalRecords, isLoading: isLoadingRecords } = useQuery({
    queryKey: ['/api/medical-records', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      const response = await fetch(`/api/medical-records?patientId=${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch medical records');
      return response.json();
    },
    enabled: !!user?.id && user?.userType === 'patient'
  });

  // Fetch SOS contracts
  const { data: sosContracts, isLoading: isLoadingContracts } = useQuery({
    queryKey: ['/api/sos-contracts', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      const response = await fetch(`/api/sos-contracts?patientId=${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch SOS contracts');
      return response.json();
    },
    enabled: !!user?.id && user?.userType === 'patient'
  });

  // Fetch available doctors for SOS contracts
  const { data: doctors } = useQuery({
    queryKey: ['/api/doctors'],
    queryFn: async () => {
      const response = await fetch('/api/doctors');
      if (!response.ok) throw new Error('Failed to fetch doctors');
      return response.json();
    }
  });

  // Add medical record form
  const recordForm = useForm<z.infer<typeof medicalRecordFormSchema>>({
    resolver: zodResolver(medicalRecordFormSchema),
    defaultValues: {
      recordType: 'diagnosis',
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      doctorName: '',
      hospitalName: '',
      isPrivate: true,
    },
  });

  // SOS contract form
  const sosForm = useForm<z.infer<typeof sosContractFormSchema>>({
    resolver: zodResolver(sosContractFormSchema),
    defaultValues: {
      emergencyType: 'oncological',
      accessLevel: 'full',
      contractType: 'sos',
      emergencyNotes: '',
      consentGiven: false,
    },
  });

  // Create medical record mutation
  const createRecordMutation = useMutation({
    mutationFn: async (data: z.infer<typeof medicalRecordFormSchema>) => {
      return apiRequest('/api/medical-records', {
        method: 'POST',
        body: JSON.stringify({ ...data, patientId: user?.id }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/medical-records'] });
      toast({ title: "Record aggiunto", description: "Il record medico è stato salvato con successo." });
      setIsAddRecordOpen(false);
      recordForm.reset();
    },
    onError: () => {
      toast({ title: "Errore", description: "Impossibile salvare il record medico.", variant: "destructive" });
    },
  });

  // Create SOS contract mutation
  const createSosContractMutation = useMutation({
    mutationFn: async (data: z.infer<typeof sosContractFormSchema>) => {
      return apiRequest('/api/sos-contracts', {
        method: 'POST',
        body: JSON.stringify({ 
          ...data, 
          patientId: user?.id,
          isActive: true,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sos-contracts'] });
      toast({ title: "Contratto SOS creato", description: "Il contratto di condivisione è stato attivato." });
      setIsSosContractOpen(false);
      sosForm.reset();
    },
    onError: () => {
      toast({ title: "Errore", description: "Impossibile creare il contratto SOS.", variant: "destructive" });
    },
  });

  const getRecordTypeIcon = (type: string) => {
    switch (type) {
      case 'diagnosis': return <Activity className="h-4 w-4" />;
      case 'treatment': return <Hospital className="h-4 w-4" />;
      case 'medication': return <Pill className="h-4 w-4" />;
      case 'test_result': return <FileText className="h-4 w-4" />;
      case 'visit': return <Calendar className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getRecordTypeLabel = (type: string) => {
    switch (type) {
      case 'diagnosis': return 'Diagnosi';
      case 'treatment': return 'Trattamento';
      case 'medication': return 'Farmaco';
      case 'test_result': return 'Risultato Test';
      case 'visit': return 'Visita';
      default: return type;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Cartella Clinica Digitale</h1>
        <p className="text-gray-600">
          Gestisci i tuoi dati medici in modo sicuro e condividili con i medici in caso di emergenza.
        </p>
      </div>

      <Tabs defaultValue="records" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="records">I Miei Record</TabsTrigger>
          <TabsTrigger value="sos">Servizio SOS</TabsTrigger>
        </TabsList>

        <TabsContent value="records" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">I Miei Record Medici</h2>
            <Dialog open={isAddRecordOpen} onOpenChange={setIsAddRecordOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Aggiungi Record
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Nuovo Record Medico</DialogTitle>
                </DialogHeader>
                <Form {...recordForm}>
                  <form onSubmit={recordForm.handleSubmit((data) => createRecordMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={recordForm.control}
                      name="recordType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo di Record</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleziona tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="diagnosis">Diagnosi</SelectItem>
                              <SelectItem value="treatment">Trattamento</SelectItem>
                              <SelectItem value="medication">Farmaco</SelectItem>
                              <SelectItem value="test_result">Risultato Test</SelectItem>
                              <SelectItem value="visit">Visita</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={recordForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Titolo</FormLabel>
                          <FormControl>
                            <Input placeholder="Es: Visita oncologica di controllo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={recordForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrizione</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Dettagli del record medico..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={recordForm.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={recordForm.control}
                      name="doctorName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Medico (opzionale)</FormLabel>
                          <FormControl>
                            <Input placeholder="Dr. Mario Rossi" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={recordForm.control}
                      name="hospitalName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ospedale/Struttura (opzionale)</FormLabel>
                          <FormControl>
                            <Input placeholder="Ospedale San Raffaele" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsAddRecordOpen(false)}>
                        Annulla
                      </Button>
                      <Button type="submit" disabled={createRecordMutation.isPending}>
                        Salva Record
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {isLoadingRecords ? (
              <div className="text-center py-8">Caricamento record...</div>
            ) : medicalRecords?.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nessun Record</h3>
                  <p className="text-gray-600 mb-4">
                    Non hai ancora aggiunto record medici alla tua cartella.
                  </p>
                  <Button onClick={() => setIsAddRecordOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Aggiungi il Primo Record
                  </Button>
                </CardContent>
              </Card>
            ) : (
              medicalRecords?.map((record: MedicalRecord) => (
                <Card key={record.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="mt-1">
                          {getRecordTypeIcon(record.recordType)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{record.title}</h3>
                          <p className="text-gray-600 text-sm mt-1">{record.description}</p>
                          {record.doctorName && (
                            <p className="text-sm text-gray-500 mt-2">
                              Medico: {record.doctorName}
                            </p>
                          )}
                          {record.hospitalName && (
                            <p className="text-sm text-gray-500">
                              Struttura: {record.hospitalName}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="mb-2">
                          {getRecordTypeLabel(record.recordType)}
                        </Badge>
                        <p className="text-xs text-gray-500">{record.date}</p>
                        <div className="flex items-center mt-2">
                          {record.isPrivate ? (
                            <EyeOff className="h-3 w-3 text-gray-400" />
                          ) : (
                            <Eye className="h-3 w-3 text-gray-400" />
                          )}
                          <span className="text-xs text-gray-500 ml-1">
                            {record.isPrivate ? 'Privato' : 'Condivisibile'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="sos" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Servizio SOS</h2>
              <p className="text-gray-600 text-sm">
                Crea contratti di condivisione per emergenze mediche
              </p>
            </div>
            <Dialog open={isSosContractOpen} onOpenChange={setIsSosContractOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Share2 className="h-4 w-4 mr-2" />
                  Nuovo Contratto SOS
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Nuovo Contratto SOS</DialogTitle>
                </DialogHeader>
                <Form {...sosForm}>
                  <form onSubmit={sosForm.handleSubmit((data) => createSosContractMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={sosForm.control}
                      name="doctorId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Medico Autorizzato</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleziona medico" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {doctors?.map((doctor: any) => (
                                <SelectItem key={doctor.id} value={doctor.id.toString()}>
                                  {doctor.fullName} - {doctor.specialization}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={sosForm.control}
                      name="emergencyType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo di Emergenza</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleziona tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="oncological">Oncologica</SelectItem>
                              <SelectItem value="general">Generale</SelectItem>
                              <SelectItem value="urgent">Urgente</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={sosForm.control}
                      name="accessLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Livello di Accesso</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleziona livello" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="full">Accesso Completo</SelectItem>
                              <SelectItem value="limited">Accesso Limitato</SelectItem>
                              <SelectItem value="view_only">Solo Visualizzazione</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={sosForm.control}
                      name="emergencyNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Note per l'Emergenza</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Informazioni aggiuntive per il medico..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="bg-amber-50 p-3 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-amber-800">Consenso alla Condivisione</p>
                          <p className="text-amber-700 mt-1">
                            Confermando autorizzi il medico selezionato ad accedere ai tuoi dati medici 
                            solo in caso di emergenza.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsSosContractOpen(false)}>
                        Annulla
                      </Button>
                      <Button type="submit" disabled={createSosContractMutation.isPending}>
                        Crea Contratto
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {isLoadingContracts ? (
              <div className="text-center py-8">Caricamento contratti...</div>
            ) : sosContracts?.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Shield className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nessun Contratto SOS</h3>
                  <p className="text-gray-600 mb-4">
                    Non hai ancora attivato contratti di condivisione per emergenze.
                  </p>
                  <Button onClick={() => setIsSosContractOpen(true)}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Crea il Primo Contratto
                  </Button>
                </CardContent>
              </Card>
            ) : (
              sosContracts?.map((contract: SosContract) => (
                <Card key={contract.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <Shield className="h-5 w-5 text-green-600 mt-1" />
                        <div className="flex-1">
                          <h3 className="font-medium">Contratto SOS #{contract.id}</h3>
                          <p className="text-gray-600 text-sm mt-1">
                            Tipo: {contract.emergencyType} • Accesso: {contract.accessLevel}
                          </p>
                          {contract.emergencyNotes && (
                            <p className="text-sm text-gray-500 mt-2">
                              Note: {contract.emergencyNotes}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={contract.isActive ? "default" : "secondary"}>
                          {contract.isActive ? 'Attivo' : 'Inattivo'}
                        </Badge>
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          {contract.expiresAt ? `Scade: ${new Date(contract.expiresAt).toLocaleDateString()}` : 'Senza scadenza'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MedicalRecords;