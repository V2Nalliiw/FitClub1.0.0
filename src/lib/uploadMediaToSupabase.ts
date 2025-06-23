import { supabase } from "./supabase";

/**
 * Faz upload de múltiplos arquivos para o bucket whatsapp-media do Supabase Storage
 * @param files Array de arquivos (File[])
 * @returns Promise com array de URLs públicas dos arquivos enviados
 */
export async function uploadMediaToSupabase(files: File[]): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    // Gera um nome único para o arquivo
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 8)}.${fileExt}`;
    const filePath = `${fileName}`;

    // Faz upload para o bucket whatsapp-media
    const { error } = await supabase.storage
      .from("whatsapp-media")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });
    if (error) {
      console.error("Erro ao fazer upload:", error.message);
      continue;
    }

    // Gera a URL pública
    const { data } = supabase.storage.from("whatsapp-media").getPublicUrl(filePath);
    if (data && data.publicUrl) {
      urls.push(data.publicUrl);
    }
  }
  return urls;
} 