import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";

const specialistFormSchema = z.object({
  name: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  password: z
    .string()
    .min(6, { message: "Senha deve ter pelo menos 6 caracteres" }),
  phone: z.string().optional(),
  specialization: z
    .string()
    .min(2, { message: "Especialização deve ter pelo menos 2 caracteres" }),
  role: z.enum(["specialist", "chief_specialist"]),
});

type SpecialistFormValues = z.infer<typeof specialistFormSchema>;

export const AddSpecialistForm = ({
  onClose,
  clinicId,
}: {
  onClose: () => void;
  clinicId?: string;
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SpecialistFormValues>({
    resolver: zodResolver(specialistFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      specialization: "",
      role: "specialist",
    },
  });

  async function onSubmit(data: SpecialistFormValues) {
    try {
      setIsSubmitting(true);
      setError(null);

      // 1. Crie o usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            role: data.role,
          },
        },
      });

      if (authError || !authData.user) {
        throw new Error(authError?.message || "Erro ao criar especialista.");
      }

      // 2. Crie o perfil em user_profiles
      const { error: profileError } = await supabase
        .from("user_profiles")
        .insert({
          id: authData.user.id,
          email: data.email,
          name: data.name,
          role: data.role,
          clinic_id: clinicId,
          phone: data.phone,
          is_active: true,
        });

      if (profileError) {
        throw new Error(profileError.message);
      }

      // 3. Crie o registro em specialists
      const { error: specialistError } = await supabase
        .from("specialists")
        .insert({
          user_id: authData.user.id,
          clinic_id: clinicId,
          specialization: data.specialization,
        });

      if (specialistError) {
        throw new Error(specialistError.message);
      }

      alert("Especialista adicionado com sucesso!");
      onClose();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro desconhecido.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && <div className="text-red-500">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Completo</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do especialista" {...field} />
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
                  <Input placeholder="email@exemplo.com" {...field} />
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
                  <Input type="password" placeholder="******" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <Input placeholder="(11) 99999-9999" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="specialization"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Especialização</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Nutricionista" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Função</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a função" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="specialist">Especialista</SelectItem>
                    <SelectItem value="chief_specialist">
                      Especialista Chefe
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adicionando..." : "Adicionar Especialista"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}; 