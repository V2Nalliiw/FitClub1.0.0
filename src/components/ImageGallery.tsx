import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  Check,
  Search,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ImageGalleryProps {
  bucketId: string;
  onImageSelect: (imageUrl: string) => void;
  trigger?: React.ReactNode;
  allowedTypes?: string[];
  maxFileSize?: number;
}

interface GalleryImage {
  id: string;
  name: string;
  url: string;
  bucket_id: string;
  file_size: number;
  mime_type: string;
  created_at: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  bucketId,
  onImageSelect,
  trigger,
  allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"],
  maxFileSize = 5 * 1024 * 1024, // 5MB
}) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadImages();
    }
  }, [isOpen, bucketId]);

  const loadImages = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Only load images uploaded by the current user
      const { data, error } = await supabase
        .from("image_gallery")
        .select("*")
        .eq("bucket_id", bucketId)
        .eq("uploaded_by", user?.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setImages(data || []);
    } catch (err) {
      console.error("Error loading images:", err);
      setError("Erro ao carregar imagens da galeria");
    } finally {
      setIsLoading(false);
    }
  };

  const checkDuplicateImage = async (file: File): Promise<boolean> => {
    try {
      // Create a more robust duplicate check using file hash or content comparison
      // For now, check by name, size, and mime type for the current user only
      const { data, error } = await supabase
        .from("image_gallery")
        .select("id, name, file_size, mime_type")
        .eq("bucket_id", bucketId)
        .eq("uploaded_by", user?.id)
        .eq("name", file.name)
        .eq("file_size", file.size)
        .eq("mime_type", file.type)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Error checking duplicate:", error);
        return false;
      }

      if (data) {
        console.log("Duplicate image found:", data);
        return true;
      }

      // Also check for similar names (without extension) to catch renamed duplicates for current user
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      const { data: similarData, error: similarError } = await supabase
        .from("image_gallery")
        .select("id, name, file_size")
        .eq("bucket_id", bucketId)
        .eq("uploaded_by", user?.id)
        .eq("file_size", file.size)
        .ilike("name", `${nameWithoutExt}%`)
        .maybeSingle();

      if (similarError && similarError.code !== "PGRST116") {
        console.error("Error checking similar images:", similarError);
      }

      if (similarData) {
        console.log("Similar image found:", similarData);
        return true;
      }

      return false;
    } catch (err) {
      console.error("Error checking duplicate image:", err);
      return false;
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true);
      setError(null);
      setSuccess(null);

      // Validate file
      if (!allowedTypes.includes(file.type)) {
        throw new Error(
          `Tipo de arquivo não permitido. Use: ${allowedTypes.join(", ")}`,
        );
      }

      if (file.size > maxFileSize) {
        throw new Error(
          `Arquivo muito grande. Tamanho máximo: ${Math.round(maxFileSize / 1024 / 1024)}MB`,
        );
      }

      // Check for duplicate
      const isDuplicate = await checkDuplicateImage(file);
      if (isDuplicate) {
        setError(
          "Esta imagem já existe na galeria. Selecione uma imagem diferente ou escolha da galeria existente.",
        );
        return;
      }

      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketId)
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucketId)
        .getPublicUrl(fileName);

      // Save to gallery table
      const { error: insertError } = await supabase
        .from("image_gallery")
        .insert({
          name: file.name,
          url: urlData.publicUrl,
          bucket_id: bucketId,
          file_size: file.size,
          mime_type: file.type,
          uploaded_by: user?.id,
        });

      if (insertError) {
        throw insertError;
      }

      setSuccess("Imagem enviada com sucesso!");
      await loadImages();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error uploading file:", err);
      setError(err instanceof Error ? err.message : "Erro ao enviar arquivo");
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    onImageSelect(imageUrl);
    setIsOpen(false);
  };

  const handleDeleteImage = async (imageId: string, imageUrl: string) => {
    try {
      setError(null);

      // Extract filename from URL
      const urlParts = imageUrl.split("/");
      const fileName = urlParts[urlParts.length - 1];

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(bucketId)
        .remove([fileName]);

      if (storageError) {
        console.warn("Storage deletion error:", storageError);
      }

      // Delete from gallery table
      const { error: dbError } = await supabase
        .from("image_gallery")
        .delete()
        .eq("id", imageId);

      if (dbError) {
        throw dbError;
      }

      await loadImages();
      setSuccess("Imagem removida com sucesso!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error deleting image:", err);
      setError("Erro ao remover imagem");
    }
  };

  const filteredImages = images.filter((image) =>
    image.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <ImageIcon className="h-4 w-4 mr-2" />
            Selecionar Imagem
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Galeria de Imagens</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert className="border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="gallery" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="gallery">Galeria</TabsTrigger>
            <TabsTrigger value="upload">Enviar Nova</TabsTrigger>
          </TabsList>

          <TabsContent value="gallery" className="space-y-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar imagens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>

            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Carregando imagens...</span>
                </div>
              ) : filteredImages.length === 0 ? (
                <div className="text-center py-8">
                  <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {searchTerm
                      ? "Nenhuma imagem encontrada"
                      : "Nenhuma imagem na galeria"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredImages.map((image) => (
                    <Card
                      key={image.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedImage === image.url ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => handleImageSelect(image.url)}
                    >
                      <CardContent className="p-2">
                        <div className="aspect-square relative mb-2">
                          <img
                            src={image.url}
                            alt={image.name}
                            className="w-full h-full object-cover rounded"
                            loading="lazy"
                          />
                          {selectedImage === image.url && (
                            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center rounded">
                              <Check className="h-6 w-6 text-primary" />
                            </div>
                          )}
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteImage(image.id, image.url);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium truncate">
                            {image.name}
                          </p>
                          <div className="flex justify-between items-center">
                            <Badge variant="secondary" className="text-xs">
                              {formatFileSize(image.file_size)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(image.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <div className="space-y-2">
                <Label htmlFor="file-upload" className="text-base font-medium">
                  Enviar Nova Imagem
                </Label>
                <p className="text-sm text-muted-foreground">
                  Arraste e solte ou clique para selecionar
                </p>
                <p className="text-xs text-muted-foreground">
                  Tipos permitidos: {allowedTypes.join(", ")}
                </p>
                <p className="text-xs text-muted-foreground">
                  Tamanho máximo: {Math.round(maxFileSize / 1024 / 1024)}MB
                </p>
              </div>
              <input
                id="file-upload"
                type="file"
                accept={allowedTypes.join(",")}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileUpload(file);
                  }
                }}
                disabled={isUploading}
              />
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => document.getElementById("file-upload")?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Selecionar Arquivo
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ImageGallery;
