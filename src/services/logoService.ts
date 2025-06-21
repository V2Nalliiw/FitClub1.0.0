import { supabase } from "@/lib/supabase";

/**
 * Interface para o resultado do upload da logo
 */
interface LogoUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Interface para as configurações da app
 */
interface AppSettings {
  id: string;
  login_logo_url: string | null;
  logo_url: string | null;
  mobile_logo_url: string | null;
  pwa_logo_url: string | null;
  favicon_url: string | null;
}

/**
 * Serviço para gerenciar upload e busca de logos no Supabase
 */
export class LogoService {
  /**
   * Faz upload de uma imagem para o bucket app-images do Supabase Storage
   * e atualiza a tabela app_settings com a nova URL
   */
  static async uploadLoginLogo(file: File): Promise<LogoUploadResult> {
    try {
      // Validar o arquivo
      if (!file) {
        return { success: false, error: "Nenhum arquivo selecionado" };
      }

      // Validar tipo de arquivo (apenas imagens)
      if (!file.type.startsWith("image/")) {
        return {
          success: false,
          error: "Por favor, selecione apenas arquivos de imagem",
        };
      }

      // Validar tamanho do arquivo (máximo 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB em bytes
      if (file.size > maxSize) {
        return { success: false, error: "O arquivo deve ter no máximo 5MB" };
      }

      // Gerar nome único para o arquivo usando timestamp e nome original
      const timestamp = Date.now();
      const fileExtension = file.name.split(".").pop();
      const uniqueFileName = `login-logo-${timestamp}.${fileExtension}`;

      console.log("🔄 Iniciando upload da logo:", uniqueFileName);

      // Fazer upload para o bucket app-images
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("app-images")
        .upload(uniqueFileName, file, {
          cacheControl: "3600",
          upsert: false, // Não sobrescrever arquivos existentes
        });

      if (uploadError) {
        console.error("❌ Erro no upload:", uploadError);
        return {
          success: false,
          error: `Erro no upload: ${uploadError.message}`,
        };
      }

      console.log("✅ Upload realizado com sucesso:", uploadData);

      // Obter URL pública da imagem
      const { data: urlData } = supabase.storage
        .from("app-images")
        .getPublicUrl(uniqueFileName);

      const publicUrl = urlData.publicUrl;
      console.log("🔗 URL pública gerada:", publicUrl);

      // Atualizar a tabela app_settings com a nova URL
      const updateResult = await this.updateLoginLogoUrl(publicUrl);

      if (!updateResult.success) {
        // Se falhou ao atualizar o banco, tentar remover o arquivo do storage
        await supabase.storage.from("app-images").remove([uniqueFileName]);

        return updateResult;
      }

      return {
        success: true,
        url: publicUrl,
      };
    } catch (error) {
      console.error("❌ Erro inesperado no upload:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Erro inesperado no upload",
      };
    }
  }

  /**
   * Atualiza a URL da logo de login na tabela app_settings
   */
  private static async updateLoginLogoUrl(
    url: string,
  ): Promise<LogoUploadResult> {
    try {
      console.log("🔄 Atualizando URL no banco de dados:", url);

      // Primeiro, verificar se já existe um registro na tabela app_settings
      const { data: existingSettings, error: fetchError } = await supabase
        .from("app_settings")
        .select("id")
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        console.error(
          "❌ Erro ao buscar configurações existentes:",
          fetchError,
        );
        return {
          success: false,
          error: `Erro ao verificar configurações: ${fetchError.message}`,
        };
      }

      let updateError;

      if (existingSettings) {
        // Atualizar registro existente
        const { error } = await supabase
          .from("app_settings")
          .update({
            login_logo_url: url,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingSettings.id);

        updateError = error;
      } else {
        // Criar novo registro
        const { error } = await supabase.from("app_settings").insert({
          id: crypto.randomUUID(),
          login_logo_url: url,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        updateError = error;
      }

      if (updateError) {
        console.error("❌ Erro ao atualizar banco de dados:", updateError);
        return {
          success: false,
          error: `Erro ao salvar no banco: ${updateError.message}`,
        };
      }

      console.log("✅ URL atualizada no banco com sucesso");
      return { success: true };
    } catch (error) {
      console.error("❌ Erro inesperado ao atualizar banco:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Erro inesperado ao atualizar banco",
      };
    }
  }

  /**
   * Busca a URL da logo de login da tabela config
   * TEMPORARY FIX: Returns hardcoded URL for login logo
   */
  static async getLoginLogoUrl(): Promise<string | null> {
    try {
      console.log("🔍 Using hardcoded login logo URL (temporary fix)...");

      // Temporary hardcoded URL for login logo
      const hardcodedLogoUrl =
        "https://qqvwsyvnvlfnbmrzyjkg.supabase.co/storage/v1/object/public/app-images//1750493324278-4qwig6wzt4.png";

      console.log("🔗 Using hardcoded logo URL:", hardcodedLogoUrl);
      return hardcodedLogoUrl;
    } catch (error) {
      console.error(
        "❌ Erro inesperado ao buscar logo da tabela config:",
        error,
      );
      return null;
    }
  }

  /**
   * Busca a URL da logo específica com fallback para a logo principal
   */
  static async getLogoUrl(
    type: "main" | "mobile" | "login" | "pwa",
  ): Promise<string | null> {
    try {
      console.log(`🔍 Buscando URL da logo ${type}...`);

      // Primeiro, tenta buscar da tabela config para login
      if (type === "login") {
        const configLogoUrl = await this.getLoginLogoUrl();
        if (configLogoUrl) {
          return configLogoUrl;
        }
      }

      // Busca das configurações da app
      const appSettings = await this.getAppSettings();
      if (!appSettings) {
        console.log("ℹ️ Nenhuma configuração de app encontrada");
        return null;
      }

      // Seleciona a URL apropriada baseada no tipo
      let logoUrl: string | null = null;
      switch (type) {
        case "login":
          logoUrl = appSettings.login_logo_url;
          break;
        case "mobile":
          logoUrl = appSettings.mobile_logo_url;
          break;
        case "pwa":
          logoUrl = appSettings.pwa_logo_url;
          break;
        case "main":
        default:
          logoUrl = appSettings.logo_url;
          break;
      }

      // Se a logo específica não existe, usa a logo principal como fallback
      if (!logoUrl || logoUrl.trim() === "") {
        console.log(
          `ℹ️ Logo ${type} não encontrada, usando logo principal como fallback`,
        );
        logoUrl = appSettings.logo_url;
      }

      // Valida se a URL é acessível
      if (logoUrl && logoUrl.trim() !== "") {
        try {
          const response = await fetch(logoUrl, { method: "HEAD" });
          if (response.ok) {
            console.log(`✅ Logo ${type} URL is accessible:`, logoUrl);
            return logoUrl;
          } else {
            console.warn(
              `⚠️ Logo ${type} URL is not accessible:`,
              logoUrl,
              response.status,
            );
            return null;
          }
        } catch (fetchError) {
          console.warn(
            `⚠️ Error testing logo ${type} URL accessibility:`,
            logoUrl,
            fetchError,
          );
          // Return the URL anyway, let the image component handle the error
          return logoUrl;
        }
      }

      return logoUrl;
    } catch (error) {
      console.error(`❌ Erro inesperado ao buscar logo ${type}:`, error);
      return null;
    }
  }

  /**
   * Busca todas as configurações de logos da app
   */
  static async getAppSettings(): Promise<AppSettings | null> {
    try {
      const { data, error } = await supabase
        .from("app_settings")
        .select(
          "id, login_logo_url, logo_url, mobile_logo_url, pwa_logo_url, favicon_url",
        )
        .limit(1)
        .maybeSingle();

      if (error) {
        if (error.code === "PGRST116") {
          return null;
        }
        console.error("❌ Erro ao buscar configurações:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("❌ Erro inesperado ao buscar configurações:", error);
      return null;
    }
  }
}
