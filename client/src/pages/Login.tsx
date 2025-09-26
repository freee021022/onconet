import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useTranslation } from '@/hooks/use-translation';
import { useAuth } from '@/context/AuthContext';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const loginSchema = z.object({
  username: z.string().min(1, { message: 'Username is required' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const { t } = useTranslation();
  const [_location, navigate] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      await login(data.username, data.password);
      
      toast({
        title: t('login.success.title'),
        description: t('login.success.description'),
      });
      
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : t('login.error.description');
      toast({
        variant: 'destructive',
        title: t('login.error.title'),
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 md:py-20 bg-neutral-50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">{t('login.title')}</CardTitle>
              <CardDescription className="text-center">
                {t('login.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('login.username')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('login.usernamePlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('login.password')}</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder={t('login.passwordPlaceholder')} {...field} />
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
                    {isSubmitting ? t('login.submitting') : t('login.submit')}
                  </Button>
                </form>
              </Form>
              
              <div className="text-center mt-4">
                <Link href="/forgot-password">
                  <a className="text-sm text-primary hover:underline">
                    {t('login.forgotPassword')}
                  </a>
                </Link>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm text-neutral-600">
                {t('login.dontHaveAccount')} 
                <Link href="/register">
                  <a className="text-primary font-medium ml-1">
                    {t('login.register')}
                  </a>
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
