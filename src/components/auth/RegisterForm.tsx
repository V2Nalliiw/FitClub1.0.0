import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthService, RegisterData } from "@/services/authService";
import { UserRole } from "@/types/auth";

// Base schema for all users
const baseRegisterSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    name: z.string().min(2, "Name must be at least 2 characters"),
    phone: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Extended schemas for different user types
const specialistRegisterSchema = z.object({
  ...(baseRegisterSchema._def.schema?._def.shape || {}),
  role: z.literal("specialist").or(z.literal("chief_specialist")),
  clinicId: z.string().min(1, "Please select a clinic"),
  specialization: z.string().min(2, "Specialization is required"),
  licenseNumber: z.string().optional(),
});

const patientRegisterSchema = z.object({
  ...(baseRegisterSchema._def.schema?._def.shape || {}),
  role: z.literal("patient"),
  clinicId: z.string().min(1, "Please select a clinic"),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
});

const superAdminRegisterSchema = z.object({
  ...(baseRegisterSchema._def.schema?._def.shape || {}),
  role: z.literal("super_admin"),
});

type RegisterFormValues =
  | z.infer<typeof specialistRegisterSchema>
  | z.infer<typeof patientRegisterSchema>
  | z.infer<typeof superAdminRegisterSchema>;

interface RegisterFormProps {
  userType: UserRole;
  onBack: () => void;
  onSuccess: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({
  userType,
  onBack,
  onSuccess,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [clinics, setClinics] = useState<any[]>([]);

  // Get the appropriate schema based on user type
  const getSchema = () => {
    switch (userType) {
      case "specialist":
      case "chief_specialist":
        return specialistRegisterSchema;
      case "patient":
        return patientRegisterSchema;
      case "super_admin":
        return superAdminRegisterSchema;
      default:
        return baseRegisterSchema;
    }
  };

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(getSchema()),
    mode: "onChange", // Add validation mode
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
      phone: "",
      role: userType,
      ...(userType !== "super_admin" && { clinicId: "" }),
      ...((userType === "specialist" || userType === "chief_specialist") && {
        specialization: "",
        licenseNumber: "",
      }),
      ...(userType === "patient" && {
        dateOfBirth: "",
        gender: "",
        emergencyContactName: "",
        emergencyContactPhone: "",
      }),
    } as RegisterFormValues,
  });

  // Debug form values on change
  useEffect(() => {
    const subscription = form.watch((value) => {
      console.log("Current form values:", value);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Load clinics for non-super-admin users
  useEffect(() => {
    if (userType !== "super_admin") {
      const loadClinics = async () => {
        try {
          const clinicsData = await AuthService.getClinics();
          setClinics(clinicsData);

          // If clinics are available and no clinic is selected, select the first one
          if (clinicsData.length > 0 && !form.getValues("clinicId")) {
            form.setValue("clinicId", clinicsData[0].id);
          }
        } catch (error) {
          console.error("Error loading clinics:", error);
          setError("Erro ao carregar clínicas. Por favor, tente novamente.");
        }
      };
      loadClinics();
    }
  }, [userType, form]);

  const onSubmit = useCallback(
    async (data: RegisterFormValues) => {
      try {
        setError(null);
        setIsLoading(true);

        // Log the complete form data to debug
        console.log("Dados do formulário completos:", data);
        console.log("Form state:", form.getValues());

        // Get values directly from form state to ensure we have the latest data
        const formValues = form.getValues();

        // Ensure we have the required fields - use type assertion for form values
        const typedFormValues = formValues as any;
        if (
          !typedFormValues.email ||
          !typedFormValues.password ||
          !typedFormValues.name
        ) {
          setError("Campos obrigatórios não preenchidos: email, senha ou nome");
          setIsLoading(false);
          return;
        }

        const registerData: RegisterData = {
          email: typedFormValues.email,
          password: typedFormValues.password,
          name: typedFormValues.name,
          role: typedFormValues.role,
          phone: typedFormValues.phone || undefined,
        };

        // Adicionar campos específicos por papel
        if (
          typedFormValues.role !== "super_admin" &&
          "clinicId" in typedFormValues
        ) {
          registerData.clinicId = typedFormValues.clinicId;
        }

        if (
          (typedFormValues.role === "specialist" ||
            typedFormValues.role === "chief_specialist") &&
          "specialization" in typedFormValues
        ) {
          registerData.specialization = typedFormValues.specialization;
          if ("licenseNumber" in typedFormValues) {
            registerData.licenseNumber =
              typedFormValues.licenseNumber || undefined;
          }
        }

        if (typedFormValues.role === "patient") {
          if ("dateOfBirth" in typedFormValues)
            registerData.dateOfBirth = typedFormValues.dateOfBirth || undefined;
          if ("gender" in typedFormValues)
            registerData.gender = typedFormValues.gender || undefined;
          if ("emergencyContactName" in typedFormValues)
            registerData.emergencyContactName =
              typedFormValues.emergencyContactName || undefined;
          if ("emergencyContactPhone" in typedFormValues)
            registerData.emergencyContactPhone =
              typedFormValues.emergencyContactPhone || undefined;
        }

        console.log("Enviando dados de registro:", registerData);
        const result = await AuthService.register(registerData);
        console.log("Registro bem-sucedido:", result);

        // Mostrar mensagem de sucesso
        alert("Conta criada com sucesso! Você pode fazer login agora.");
        onSuccess();
      } catch (err) {
        console.error("Erro no registro:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Erro desconhecido ao criar conta";
        setError(errorMessage);
        alert(`Erro ao criar conta: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    },
    [form, setError, setIsLoading, onSuccess],
  );

  const getUserTypeTitle = () => {
    switch (userType) {
      case "super_admin":
        return "Super Administrador";
      case "chief_specialist":
        return "Especialista Chefe";
      case "specialist":
        return "Especialista";
      case "patient":
        return "Paciente";
      default:
        return "Usuário";
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-background shadow-lg rounded-xl border">
      <CardHeader className="relative pb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="absolute left-4 top-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="flex flex-col items-center pt-8">
          <div className="mb-4">
            <img
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=120&q=80"
              alt="Clinic Management Logo"
              className="h-16 w-16 rounded-full object-cover"
            />
          </div>
          <CardTitle className="text-2xl font-semibold text-center">
            Cadastro - {getUserTypeTitle()}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-4 border-red-200 bg-red-50 text-red-800">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="seu@email.com"
                        type="email"
                        autoComplete="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="••••••••"
                          type={showPassword ? "text" : "password"}
                          autoComplete="new-password"
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                          onClick={() => setShowPassword(!showPassword)}
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
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
                    <FormLabel>Confirmar Senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="••••••••"
                          type={showConfirmPassword ? "text" : "password"}
                          autoComplete="new-password"
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
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
                  <FormLabel>Telefone (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="(11) 99999-9999" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Clinic Selection for non-super-admin users */}
            {userType !== "super_admin" && (
              <FormField
                control={form.control}
                name="clinicId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clínica</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma clínica" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clinics.map((clinic) => (
                          <SelectItem key={clinic.id} value={clinic.id}>
                            {clinic.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Specialist-specific fields */}
            {(userType === "specialist" || userType === "chief_specialist") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="specialization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Especialização</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Psicologia Clínica"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="licenseNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número do Registro (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: CRP 12345" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Patient-specific fields */}
            {userType === "patient" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Nascimento (Opcional)</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gênero (Opcional)</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="masculino">Masculino</SelectItem>
                            <SelectItem value="feminino">Feminino</SelectItem>
                            <SelectItem value="outro">Outro</SelectItem>
                            <SelectItem value="prefiro-nao-informar">
                              Prefiro não informar
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="emergencyContactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contato de Emergência (Opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome do contato" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="emergencyContactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone de Emergência (Opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="(11) 99999-9999" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                "Criar Conta"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center text-sm text-muted-foreground">
        <p>Clinic Management System</p>
      </CardFooter>
    </Card>
  );
};

export default RegisterForm;
