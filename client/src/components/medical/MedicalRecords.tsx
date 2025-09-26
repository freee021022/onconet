import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, Upload, Download, Eye, Share2, Lock, Calendar, 
  User, Stethoscope, Camera, Scan, Plus, Trash2, Edit
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

interface MedicalDocument {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  category: string;
  uploadDate: string;
  description?: string;
  sharedWith: string[];
  isPrivate: boolean;
  thumbnailUrl?: string;
  ocrText?: string;
}

interface ScanResult {
  text: string;
  confidence: number;
  detectedFields: {
    patientName?: string;
    date?: string;
    doctorName?: string;
    diagnosis?: string;
    medications?: string[];
  };
}

const MedicalRecords = () => {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDocument, setSelectedDocument] = useState<MedicalDocument | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [scanResults, setScanResults] = useState<ScanResult | null>(null);

  const documentCategories = [
    'Referti di laboratorio',
    'Immagini diagnostiche',
    'Prescrizioni mediche',
    'Cartelle cliniche',
    'Certificati medici',
    'Lettere di dimissione',
    'Altro'
  ];

  // Fetch medical documents
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['/api/medical-records'],
    queryFn: async () => {
      const response = await fetch('/api/medical-records');
      if (!response.ok) throw new Error('Failed to fetch documents');
      return response.json() as Promise<MedicalDocument[]>;
    },
    enabled: isAuthenticated
  });

  // Upload document mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/medical-records/upload', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error('Upload failed');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/medical-records'] });
      if (data.ocrResults) {
        setScanResults(data.ocrResults);
      }
      toast({
        title: 'Documento caricato',
        description: 'Il documento è stato caricato e analizzato con successo.'
      });
    },
    onError: () => {
      toast({
        title: 'Errore upload',
        description: 'Impossibile caricare il documento. Riprova più tardi.',
        variant: 'destructive'
      });
    }
  });

  // Delete document mutation
  const deleteMutation = useMutation({
    mutationFn: async (documentId: number) => {
      const response = await fetch(`/api/medical-records/${documentId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Delete failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/medical-records'] });
      toast({
        title: 'Documento eliminato',
        description: 'Il documento è stato eliminato con successo.'
      });
    }
  });

  // Handle file upload
  const handleFileUpload = async (files: FileList, category: string, description?: string) => {
    if (!files.length) return;

    setIsUploading(true);
    const formData = new FormData();
    
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });
    
    formData.append('category', category);
    if (description) formData.append('description', description);

    try {
      await uploadMutation.mutateAsync(formData);
    } finally {
      setIsUploading(false);
    }
  };

  // Trigger file input
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // Trigger camera capture
  const triggerCameraCapture = () => {
    cameraInputRef.current?.click();
  };

  // OCR scanning simulation (in real app would use actual OCR service)
  const performOCR = async (file: File): Promise<ScanResult> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          text: "Estratto di testo dal documento medico...",
          confidence: 0.95,
          detectedFields: {
            patientName: user?.fullName || '',
            date: new Date().toISOString().split('T')[0],
            doctorName: "Dr. Mario Rossi",
            diagnosis: "Controllo di routine",
            medications: ["Paracetamolo 500mg", "Vitamina D"]
          }
        });
      }, 2000);
    });
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Filter documents by category
  const filteredDocuments = selectedCategory 
    ? documents.filter(doc => doc.category === selectedCategory)
    : documents;

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="font-medium mb-2">Accesso richiesto</h3>
          <p className="text-gray-600">Accedi per visualizzare la tua cartella clinica digitale.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Cartella Clinica Digitale
            </CardTitle>
            <div className="flex gap-2">
              <Button onClick={triggerCameraCapture} variant="outline" size="sm">
                <Camera className="h-4 w-4 mr-2" />
                Scansiona
              </Button>
              <Button onClick={triggerFileUpload} size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Carica documento
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant={selectedCategory === '' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('')}
            >
              Tutti ({documents.length})
            </Button>
            {documentCategories.map(category => {
              const count = documents.filter(doc => doc.category === category).length;
              return (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category} ({count})
                </Button>
              );
            })}
          </div>

          <div className="text-sm text-gray-600">
            {filteredDocuments.length} documenti • {documents.reduce((total, doc) => total + doc.fileSize, 0) / 1024 / 1024 < 1 
              ? `${(documents.reduce((total, doc) => total + doc.fileSize, 0) / 1024).toFixed(0)} KB` 
              : `${(documents.reduce((total, doc) => total + doc.fileSize, 0) / 1024 / 1024).toFixed(1)} MB`} utilizzati
          </div>
        </CardContent>
      </Card>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocuments.map((document) => (
          <Card key={document.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {document.fileType.includes('image') ? (
                    <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                      <Eye className="h-4 w-4 text-green-600" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                  )}
                  {document.isPrivate && (
                    <Lock className="h-3 w-3 text-gray-400" />
                  )}
                </div>
                
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-6 w-6 p-0 text-red-600"
                    onClick={() => deleteMutation.mutate(document.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <h3 className="font-medium text-sm mb-1 truncate" title={document.fileName}>
                {document.fileName}
              </h3>
              
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>{formatFileSize(document.fileSize)}</span>
                  <span>{new Date(document.uploadDate).toLocaleDateString('it-IT')}</span>
                </div>
                
                <Badge variant="secondary" className="text-xs">
                  {document.category}
                </Badge>

                {document.description && (
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {document.description}
                  </p>
                )}

                {document.sharedWith.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Share2 className="h-3 w-3" />
                    <span>Condiviso con {document.sharedWith.length} utenti</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredDocuments.length === 0 && !isLoading && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="font-medium mb-2">Nessun documento trovato</h3>
            <p className="text-gray-600 mb-4">
              {selectedCategory 
                ? `Non ci sono documenti nella categoria "${selectedCategory}".`
                : 'Inizia a costruire la tua cartella clinica digitale caricando i tuoi documenti medici.'
              }
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={triggerCameraCapture} variant="outline">
                <Camera className="h-4 w-4 mr-2" />
                Scansiona documento
              </Button>
              <Button onClick={triggerFileUpload}>
                <Upload className="h-4 w-4 mr-2" />
                Carica file
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) {
            // For demo, use default category
            handleFileUpload(e.target.files, 'Altro');
          }
        }}
      />

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) {
            handleFileUpload(e.target.files, 'Immagini diagnostiche');
          }
        }}
      />

      {/* OCR Results Modal */}
      {scanResults && (
        <Dialog open={!!scanResults} onOpenChange={() => setScanResults(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Risultati Scansione</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Scan className="h-4 w-4 text-green-600" />
                <span className="text-sm">
                  Precisione: {(scanResults.confidence * 100).toFixed(0)}%
                </span>
              </div>

              <div className="space-y-3">
                {scanResults.detectedFields.patientName && (
                  <div>
                    <Label className="text-xs text-gray-600">Paziente</Label>
                    <p className="text-sm">{scanResults.detectedFields.patientName}</p>
                  </div>
                )}

                {scanResults.detectedFields.date && (
                  <div>
                    <Label className="text-xs text-gray-600">Data</Label>
                    <p className="text-sm">{scanResults.detectedFields.date}</p>
                  </div>
                )}

                {scanResults.detectedFields.diagnosis && (
                  <div>
                    <Label className="text-xs text-gray-600">Diagnosi</Label>
                    <p className="text-sm">{scanResults.detectedFields.diagnosis}</p>
                  </div>
                )}

                {scanResults.detectedFields.medications && (
                  <div>
                    <Label className="text-xs text-gray-600">Farmaci</Label>
                    <div className="flex flex-wrap gap-1">
                      {scanResults.detectedFields.medications.map((med, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {med}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Button onClick={() => setScanResults(null)} className="w-full">
                Chiudi
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Loading overlay */}
      {isUploading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Caricamento e analisi documento...</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MedicalRecords;
