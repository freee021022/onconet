import { useState } from 'react';
import { useLocation, useRoute, Link } from 'wouter';
import { useTranslation } from '@/hooks/use-translation';
import { useAuth } from '@/context/AuthContext';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { insertUserSchema } from '@shared/schema';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(6),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register = () => {
  const { t } = useTranslation();
  const [_location, navigate] = useLocation();
  const { register: authRegister } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check URL for registration type (patient, professional, or pharmacy)
  const urlParams = new URLSearchParams(window.location.search);
  const userType = urlParams.get('type') || 'patient';
  
  // Set initial tab based on URL parameter
  const initialTab = userType === 'pharmacy' ? 'pharmacy' : userType === 'professional' ? 'doctor' : 'patient';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedUserType, setSelectedUserType] = useState<'patient' | 'professional' | 'pharmacy'>(
    userType as 'patient' | 'professional' | 'pharmacy'
  );
  
  // Determine if we should show tabs or just one specific form
  const showOnlySpecificType = urlParams.has('type');
  const specificType = urlParams.get('type');

  const doctorSpecializations = [
    { value: 'breast-cancer', label: t('register.doctor.specializations.breastCancer') },
    { value: 'lung-cancer', label: t('register.doctor.specializations.lungCancer') },
    { value: 'gastrointestinal-cancer', label: t('register.doctor.specializations.gastrointestinalCancer') },
    { value: 'hematological-cancer', label: t('register.doctor.specializations.hematologicalCancer') },
    { value: 'pediatric-oncology', label: t('register.doctor.specializations.pediatricOncology') },
    { value: 'gynecologic-oncology', label: t('register.doctor.specializations.gynecologicOncology') },
    { value: 'urologic-oncology', label: t('register.doctor.specializations.urologicOncology') },
    { value: 'neuro-oncology', label: t('register.doctor.specializations.neuroOncology') },
    { value: 'head-neck-oncology', label: t('register.doctor.specializations.headNeckOncology') },
    { value: 'skin-cancer', label: t('register.doctor.specializations.skinCancer') },
  ];

  // Set up form for patient registration
  const patientForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      userType: 'patient',
    },
  });

  // Set up form for doctor registration
  const doctorForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      userType: 'professional',
      specialization: '',
      hospital: '',
      city: '',
      bio: '',
    },
  });

  // Set up form for pharmacy registration
  const pharmacyForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      pharmacyName: '',
      address: '',
      city: '',
      region: '',
      phone: '',
      pharmacyOffers: '',
      userType: 'pharmacy',
    },
  });

  // Handle patient registration
  const onPatientSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    try {
      // Remove confirmPassword as it's not part of the API schema
      const { confirmPassword, ...registerData } = data;
      
      // Set userType to 'patient' for patient registration
      const patientData = {
        ...registerData,
        userType: 'patient' as const,
        isVerified: true // Auto-verify patients
      };
      
      await authRegister(patientData);
      
      toast({
        title: t('register.success.title'),
        description: t('register.success.description'),
      });
      
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        variant: 'destructive',
        title: t('register.error.title'),
        description: typeof error === 'string' ? error : t('register.error.description'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle doctor registration
  const onDoctorSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    try {
      // Remove confirmPassword as it's not part of the API schema
      const { confirmPassword, ...registerData } = data;
      
      // Set userType to 'professional' for doctor registration
      const doctorData = {
        ...registerData,
        userType: 'professional' as const,
        isVerified: false // Doctors need verification
      };
      
      await authRegister(doctorData);
      
      toast({
        title: t('register.doctor.success.title'),
        description: t('register.doctor.success.description'),
      });
      
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        variant: 'destructive',
        title: t('register.error.title'),
        description: typeof error === 'string' ? error : t('register.error.description'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle pharmacy registration
  const onPharmacySubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    try {
      // Remove confirmPassword as it's not part of the API schema
      const { confirmPassword, ...registerData } = data;
      
      // Set userType to 'pharmacy' for pharmacy registration
      const pharmacyData = {
        ...registerData,
        userType: 'pharmacy' as const,
        isVerified: true, // Auto-verify pharmacies
        fullName: data.pharmacyName || data.username // Use pharmacy name as full name
      };
      
      await authRegister(pharmacyData);
      
      toast({
        title: "Registrazione farmacia completata",
        description: "La tua farmacia è stata registrata con successo!",
      });
      
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        variant: 'destructive',
        title: t('register.error.title'),
        description: typeof error === 'string' ? error : t('register.error.description'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 md:py-20 bg-neutral-50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6 text-center">
            {showOnlySpecificType 
              ? `Registrazione ${specificType === 'pharmacy' ? 'Farmacia' : specificType === 'professional' ? 'Medico' : 'Paziente'}`
              : t('register.title')
            }
          </h1>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {!showOnlySpecificType && (
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="patient">{t('register.patientTab')}</TabsTrigger>
                <TabsTrigger value="doctor">{t('register.doctorTab')}</TabsTrigger>
                <TabsTrigger value="pharmacy">Farmacia</TabsTrigger>
              </TabsList>
            )}
            
            {(!showOnlySpecificType || specificType === 'patient') && (
              <TabsContent value="patient">
              <Form {...patientForm}>
                <form onSubmit={patientForm.handleSubmit(onPatientSubmit)} className="space-y-4">
                  <FormField
                    control={patientForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('register.fullName')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('register.fullNamePlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={patientForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('register.email')}</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder={t('register.emailPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={patientForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('register.username')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('register.usernamePlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={patientForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('register.password')}</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder={t('register.passwordPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={patientForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('register.confirmPassword')}</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder={t('register.confirmPasswordPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-primary text-white font-bold py-2 rounded-md hover:bg-primary/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? t('register.submitting') : t('register.submit')}
                  </Button>
                </form>
              </Form>
              </TabsContent>
            )}
            
            {(!showOnlySpecificType || specificType === 'professional') && (
              <TabsContent value="doctor">
              <Form {...doctorForm}>
                <form onSubmit={doctorForm.handleSubmit(onDoctorSubmit)} className="space-y-4">
                  <FormField
                    control={doctorForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('register.fullName')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('register.fullNamePlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={doctorForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('register.email')}</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder={t('register.emailPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={doctorForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('register.username')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('register.usernamePlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={doctorForm.control}
                    name="specialization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('register.doctor.specialization')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('register.doctor.specializationPlaceholder')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {doctorSpecializations.map((spec) => (
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
                    control={doctorForm.control}
                    name="hospital"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('register.doctor.hospital')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('register.doctor.hospitalPlaceholder')} {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={doctorForm.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('register.doctor.city')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('register.doctor.cityPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={doctorForm.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('register.doctor.bio')}</FormLabel>
                        <FormControl>
                          <Textarea placeholder={t('register.doctor.bioPlaceholder')} {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={doctorForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('register.password')}</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder={t('register.passwordPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={doctorForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('register.confirmPassword')}</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder={t('register.confirmPasswordPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-primary text-white font-bold py-2 rounded-md hover:bg-primary/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? t('register.submitting') : t('register.doctor.submit')}
                  </Button>
                </form>
              </Form>
              </TabsContent>
            )}
            
            {(!showOnlySpecificType || specificType === 'pharmacy') && (
              <TabsContent value="pharmacy">
              <Form {...pharmacyForm}>
                <form onSubmit={pharmacyForm.handleSubmit(onPharmacySubmit)} className="space-y-4">
                  <FormField
                    control={pharmacyForm.control}
                    name="pharmacyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Farmacia</FormLabel>
                        <FormControl>
                          <Input placeholder="Farmacia Esempio" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={pharmacyForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('register.email')}</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder={t('register.emailPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={pharmacyForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('register.username')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('register.usernamePlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={pharmacyForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Indirizzo</FormLabel>
                        <FormControl>
                          <Input placeholder="Via Roma 123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={pharmacyForm.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Città</FormLabel>
                        <FormControl>
                          <Input placeholder="Milano" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={pharmacyForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefono</FormLabel>
                        <FormControl>
                          <Input placeholder="+39 123 456 7890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={pharmacyForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('register.password')}</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder={t('register.passwordPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={pharmacyForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('register.confirmPassword')}</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder={t('register.confirmPasswordPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-primary text-white font-bold py-2 rounded-md hover:bg-primary/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? t('register.submitting') : 'Registra Farmacia'}
                  </Button>
                </form>
              </Form>
              </TabsContent>
            )}
          </Tabs>
          
          <div className="mt-6 text-center text-sm">
            <p>
              {t('register.alreadyHaveAccount')} 
              <Link href="/login">
                <a className="text-primary font-medium ml-1">{t('register.login')}</a>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
