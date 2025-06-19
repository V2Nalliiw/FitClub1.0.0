import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Camera, Save, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ImageGallery from "@/components/ImageGallery";
import { supabase } from "@/lib/supabase";

const profileSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  avatar: z.string().optional(),
  theme: z.enum(["light", "dark", "system"]),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfilePageProps {
  onBack: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [previewImage, setPreviewImage] = useState<string | null>(
    user?.avatar || null,
  );
  const [success, setSuccess] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains("dark"),
  );

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      avatar: user?.avatar || "",
      theme: "system",
    },
  });

  const handleImageSelect = async (imageUrl: string) => {
    setPreviewImage(imageUrl);
    form.setValue("avatar", imageUrl);

    // Update user profile in Supabase
    try {
      if (user?.id) {
        const { error } = await supabase
          .from("user_profiles")
          .update({ avatar_url: imageUrl })
          .eq("id", user.id);

        if (error) {
          console.error("Error updating profile image:", error);
        } else {
          // Force a page refresh to update the auth context
          window.location.reload();
        }
      }
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  const handleThemeToggle = (checked: boolean) => {
    setIsDarkMode(checked);
    if (checked) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const onSubmit = (data: ProfileFormData) => {
    // In a real app, this would update the user profile
    console.log("Profile update:", data);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const getRoleDisplayName = (role: string) => {
    const roleMap = {
      super_admin: "Super Administrador",
      clinic_admin: "Administrador da Clínica",
      chief_specialist: "Especialista-Chefe",
      specialist: "Especialista",
      patient: "Paciente",
    };
    return roleMap[role as keyof typeof roleMap] || role;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button variant="ghost" size="sm" onClick={onBack} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-xl font-semibold text-foreground">
              Meu Perfil
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-4 sm:py-8 dashboard-mobile-content px-3 sm:px-6 lg:px-8">
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50 text-green-800">
            <AlertDescription>Perfil atualizado com sucesso!</AlertDescription>
          </Alert>
        )}

        <div className="grid mobile-form-grid md:grid-cols-2 gap-3 sm:gap-4">
          {/* Profile Picture Section */}
          <Card className="lg:col-span-1">
            <CardHeader className="profile-mobile-card">
              <CardTitle className="text-base sm:text-lg">
                Foto de Perfil
              </CardTitle>
            </CardHeader>
            <CardContent className="profile-mobile-card flex flex-col items-center space-y-3 sm:space-y-4">
              <div className="relative">
                <Avatar className="h-24 w-24 sm:h-32 sm:w-32">
                  <AvatarImage
                    src={previewImage || user?.avatar}
                    alt={user?.name}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl sm:text-2xl">
                    {user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <ImageGallery
                  bucketId="profile-images"
                  onImageSelect={handleImageSelect}
                  trigger={
                    <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground p-3 rounded-full cursor-pointer hover:bg-primary/90 transition-colors shadow-lg">
                      <Camera className="h-4 w-4" />
                    </div>
                  }
                  allowedTypes={[
                    "image/jpeg",
                    "image/png",
                    "image/webp",
                    "image/gif",
                  ]}
                />
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground text-center">
                Clique no ícone da câmera para alterar sua foto
              </p>
            </CardContent>
          </Card>

          {/* Profile Information */}
          <Card className="lg:col-span-2">
            <CardHeader className="profile-mobile-card">
              <CardTitle className="text-base sm:text-lg">
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="profile-mobile-card">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="mobile-form-spacing space-y-4 sm:space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Digite seu nome completo"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <Label>E-mail</Label>
                    <Input
                      value={user?.email || ""}
                      disabled
                      className="bg-muted cursor-not-allowed"
                    />
                    <p className="text-xs text-muted-foreground">
                      O e-mail não pode ser alterado
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Cargo/Função</Label>
                    <Input
                      value={getRoleDisplayName(user?.role || "")}
                      disabled
                      className="bg-muted cursor-not-allowed"
                    />
                    <p className="text-xs text-muted-foreground">
                      Seu cargo é definido pelo administrador
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <Label className="text-base font-medium">
                        Tema Escuro
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Ativar modo escuro da interface
                      </p>
                    </div>
                    <Switch
                      checked={isDarkMode}
                      onCheckedChange={handleThemeToggle}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Alterações
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
