import sharp from "sharp";
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Icon sizes to generate
const ICON_SIZES = [
  { size: 72, name: "icon-72x72.png" },
  { size: 96, name: "icon-96x96.png" },
  { size: 128, name: "icon-128x128.png" },
  { size: 144, name: "icon-144x144.png" },
  { size: 152, name: "icon-152x152.png" },
  { size: 192, name: "icon-192x192.png" },
  { size: 384, name: "icon-384x384.png" },
  { size: 512, name: "icon-512x512.png" },
];

async function getLogoFromSupabase() {
  try {
    console.log("🔍 Fetching logo URL from Supabase...");

    const { data, error } = await supabase
      .from("app_settings")
      .select("login_logo_url, logo_url, pwa_logo_url")
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("❌ Error fetching app settings:", error);
      return null;
    }

    if (!data) {
      console.log("ℹ️ No app settings found");
      return null;
    }

    // Priority: login_logo_url > logo_url > pwa_logo_url
    const logoUrl = data.login_logo_url || data.logo_url || data.pwa_logo_url;

    if (!logoUrl) {
      console.log("ℹ️ No logo URL found in app settings");
      return null;
    }

    console.log("✅ Found logo URL:", logoUrl);
    return logoUrl;
  } catch (error) {
    console.error("❌ Error getting logo from Supabase:", error);
    return null;
  }
}

async function downloadImage(url) {
  try {
    console.log("⬇️ Downloading image from:", url);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    console.log("✅ Image downloaded successfully");
    return Buffer.from(buffer);
  } catch (error) {
    console.error("❌ Error downloading image:", error);
    return null;
  }
}

async function generateIcons(imageBuffer) {
  try {
    const publicIconsDir = path.join(__dirname, "..", "public", "icons");

    // Create icons directory if it doesn't exist
    if (!fs.existsSync(publicIconsDir)) {
      fs.mkdirSync(publicIconsDir, { recursive: true });
      console.log("📁 Created icons directory");
    }

    console.log("🎨 Generating icons...");

    for (const { size, name } of ICON_SIZES) {
      const outputPath = path.join(publicIconsDir, name);

      await sharp(imageBuffer)
        .resize(size, size, {
          fit: "contain",
          background: { r: 255, g: 255, b: 255, alpha: 0 },
        })
        .png()
        .toFile(outputPath);

      console.log(`✅ Generated ${name}`);
    }

    console.log("🎉 All icons generated successfully!");
    return true;
  } catch (error) {
    console.error("❌ Error generating icons:", error);
    return false;
  }
}

async function updateManifest() {
  try {
    const manifestPath = path.join(__dirname, "..", "public", "manifest.json");

    // Read existing manifest
    let manifest;
    if (fs.existsSync(manifestPath)) {
      const manifestContent = fs.readFileSync(manifestPath, "utf8");
      manifest = JSON.parse(manifestContent);
    } else {
      // Create basic manifest if it doesn't exist
      manifest = {
        name: "Clinic Management System",
        short_name: "ClinicApp",
        description: "Sistema de Gestão de Clínicas - PWA",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#4F9CF9",
        orientation: "portrait-primary",
        scope: "/",
        lang: "pt-BR",
        categories: ["medical", "productivity", "business"],
      };
    }

    // Update icons array
    manifest.icons = [
      {
        src: "/icons/icon-72x72.png",
        sizes: "72x72",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-96x96.png",
        sizes: "96x96",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-128x128.png",
        sizes: "128x128",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-144x144.png",
        sizes: "144x144",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-152x152.png",
        sizes: "152x152",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icons/icon-384x384.png",
        sizes: "384x384",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ];

    // Write updated manifest
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log("✅ Manifest updated successfully");

    return true;
  } catch (error) {
    console.error("❌ Error updating manifest:", error);
    return false;
  }
}

async function main() {
  console.log("🚀 Starting icon generation process...");

  // Get logo URL from Supabase
  const logoUrl = await getLogoFromSupabase();
  if (!logoUrl) {
    console.log("⚠️ No logo found in Supabase, using default icons");
    await updateManifest();
    return;
  }

  // Download the image
  const imageBuffer = await downloadImage(logoUrl);
  if (!imageBuffer) {
    console.log("⚠️ Failed to download logo, using default icons");
    await updateManifest();
    return;
  }

  // Generate all icon sizes
  const iconsGenerated = await generateIcons(imageBuffer);
  if (!iconsGenerated) {
    console.log("⚠️ Failed to generate icons");
    return;
  }

  // Update manifest
  const manifestUpdated = await updateManifest();
  if (!manifestUpdated) {
    console.log("⚠️ Failed to update manifest");
    return;
  }

  console.log("🎉 Icon generation process completed successfully!");
}

// Run the script
main().catch(console.error);
