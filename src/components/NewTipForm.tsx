import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Tables, TablesInsert, TablesUpdate } from "@/types/supabase";

const tipFormSchema = z.object({
  title: z.string().min(2, { message: "Título deve ter pelo menos 2 caracteres" }),
  content: z.string().min(10, { message: "Conteúdo deve ter pelo menos 10 caracteres" }),
  category: z.string().min(1, { message: "Selecione uma categoria" }),
  image_url: z.string().url({ message: "URL da imagem inválida" }).optional(),
  duration: z.string().optional(),
  // Adicionando suporte para steps, que podem ser um JSON
  steps: z.string().optional(), 
});

type TipFormValues = z.infer<typeof tipFormSchema>;

export const NewTipForm = ({ onClose, editingTip, onTipCreated }: { onClose: () => void; editingTip?: Tables<'tips'>; onTipCreated: (tip: Tables<'tips'>) => void; }) => {
  const { user } = useAuth();
  const form = useForm<TipFormValues>({
    resolver: zodResolver(tipFormSchema),
    defaultValues: editingTip || {
      title: "",
      content: "",
      category: "",
      image_url: "",
      duration: "",
      steps: "[]",
    },
  });

  async function onSubmit(data: TipFormValues) {
    if (!user) {
        alert("Você precisa estar logado para criar ou editar uma dica.");
        return;
    }

    try {
        const parsedSteps = JSON.parse(data.steps || "[]");

        if (editingTip) {
            const tipUpdate: TablesUpdate<'tips'> = {
                title: data.title,
                content: data.content,
                category: data.category,
                image_url: data.image_url,
                duration: data.duration,
                steps: parsedSteps,
                updated_at: new Date().toISOString(),
            };
            const { data: updatedTip, error } = await supabase
                .from("tips")
                .update(tipUpdate)
                .eq("id", editingTip.id)
                .select()
                .single();
            if (error) throw error;
            alert(`Dica "${updatedTip.title}" atualizada com sucesso!`);
            onTipCreated(updatedTip);
        } else {
            const tipInsert: TablesInsert<'tips'> = {
                title: data.title,
                content: data.content,
                category: data.category,
                image_url: data.image_url,
                duration: data.duration,
                created_by: user.id,
                steps: parsedSteps,
            };
            const { data: newTip, error } = await supabase
                .from("tips")
                .insert(tipInsert)
                .select()
                .single();
            if (error) throw error;
            alert(`Dica "${newTip.title}" criada com sucesso!`);
            onTipCreated(newTip);
        }
        onClose();
    } catch (error) {
      console.error("Erro ao salvar dica:", error);
      alert("Falha ao salvar a dica.");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem>
            <FormLabel>Título</FormLabel>
            <FormControl><Input placeholder="Título da dica" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="category" render={({ field }) => (
          <FormItem>
            <FormLabel>Categoria</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder="Selecione uma categoria" /></SelectTrigger></FormControl>
              <SelectContent>
                <SelectItem value="Exercício">Exercício</SelectItem>
                <SelectItem value="Nutrição">Nutrição</SelectItem>
                <SelectItem value="Bem-estar">Bem-estar</SelectItem>
                <SelectItem value="Mindfulness">Mindfulness</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="content" render={({ field }) => (
          <FormItem>
            <FormLabel>Conteúdo</FormLabel>
            <FormControl><Textarea placeholder="Conteúdo da dica" rows={4} {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="image_url" render={({ field }) => (
            <FormItem>
                <FormLabel>URL da Imagem</FormLabel>
                <FormControl><Input placeholder="https://exemplo.com/imagem.png" {...field} /></FormControl>
                <FormMessage />
            </FormItem>
        )} />
         <FormField control={form.control} name="duration" render={({ field }) => (
            <FormItem>
                <FormLabel>Duração (ex: 10 min)</FormLabel>
                <FormControl><Input placeholder="10 min" {...field} /></FormControl>
                <FormMessage />
            </FormItem>
        )} />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit">{editingTip ? "Salvar Alterações" : "Criar Dica"}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}; 