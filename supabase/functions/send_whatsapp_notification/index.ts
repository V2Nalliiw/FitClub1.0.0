import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WhatsAppNotificationRequest {
  patient_id: string;
  message: string;
  mediaUrls?: string[];
}

interface LogEntry {
  patient_id: string;
  message: string;
  media_urls?: string[];
  status: string;
  error?: string;
  twilio_message_sid?: string;
  sent_at: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_KEY");
    const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
    const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
    const TWILIO_WHATSAPP_NUMBER = Deno.env.get("TWILIO_WHATSAPP_NUMBER");

    // Validate environment variables
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      console.error("Missing required Supabase environment variables");
      return new Response(
        JSON.stringify({
          error: "Server configuration error: Missing Supabase credentials",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_NUMBER) {
      console.error("Missing required Twilio environment variables");
      return new Response(
        JSON.stringify({
          error: "Server configuration error: Missing Twilio credentials",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Only allow POST requests
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({
          error: "Method not allowed. Only POST requests are accepted.",
        }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Parse request body
    const { patient_id, message, mediaUrls }: WhatsAppNotificationRequest =
      await req.json();

    // Validate required fields
    if (!patient_id || !message) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: patient_id and message are required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Validate UUID format for patient_id
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(patient_id)) {
      return new Response(
        JSON.stringify({
          error: "Invalid patient_id format. Must be a valid UUID.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Create Supabase client with service key for admin access
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Retrieve patient's WhatsApp number
    const { data: patientData, error: patientError } = await supabase
      .from("patients")
      .select("whatsapp_number, user_profiles:user_id(name)")
      .eq("id", patient_id)
      .single();

    if (patientError || !patientData) {
      const errorMessage = "Patient not found or has no WhatsApp number";
      console.error(errorMessage, patientError);

      // Log the error
      await logOperation(supabase, {
        patient_id,
        message,
        media_urls: mediaUrls,
        status: "failed",
        error: errorMessage,
        sent_at: new Date().toISOString(),
      });

      return new Response(
        JSON.stringify({
          error: errorMessage,
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const whatsappNumber = patientData.whatsapp_number;
    const patientName = patientData.user_profiles?.name || "Paciente";

    if (!whatsappNumber) {
      const errorMessage = "Patient has no WhatsApp number registered";
      console.error(errorMessage);

      // Log the error
      await logOperation(supabase, {
        patient_id,
        message,
        media_urls: mediaUrls,
        status: "failed",
        error: errorMessage,
        sent_at: new Date().toISOString(),
      });

      return new Response(
        JSON.stringify({
          error: errorMessage,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Validate phone number format (basic E.164 validation)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(whatsappNumber)) {
      const errorMessage = `Invalid WhatsApp number format: ${whatsappNumber}. Please use E.164 format (e.g., +5511999999999)`;
      console.error(errorMessage);

      // Log the error
      await logOperation(supabase, {
        patient_id,
        message,
        media_urls: mediaUrls,
        status: "failed",
        error: errorMessage,
        sent_at: new Date().toISOString(),
      });

      return new Response(
        JSON.stringify({
          error: errorMessage,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Prepare Twilio API request
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

    // Create form data for Twilio API
    const formData = new URLSearchParams();
    formData.append("From", `whatsapp:${TWILIO_WHATSAPP_NUMBER}`);
    formData.append("To", `whatsapp:${whatsappNumber}`);
    formData.append("Body", message);

    // Add media URLs if provided
    if (mediaUrls && mediaUrls.length > 0) {
      // Twilio supports up to 10 media URLs
      const maxMediaUrls = Math.min(mediaUrls.length, 10);
      for (let i = 0; i < maxMediaUrls; i++) {
        formData.append("MediaUrl", mediaUrls[i]);
      }
    }

    // Create authorization header
    const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

    // Send request to Twilio
    const twilioResponse = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });

    const twilioData = await twilioResponse.json();

    if (!twilioResponse.ok) {
      const errorMessage =
        twilioData.message || "Unknown error from Twilio API";
      console.error("Twilio API error:", twilioData);

      // Log the error
      await logOperation(supabase, {
        patient_id,
        message,
        media_urls: mediaUrls,
        status: "failed",
        error: errorMessage,
        sent_at: new Date().toISOString(),
      });

      return new Response(
        JSON.stringify({
          error: "Failed to send WhatsApp message",
          details: errorMessage,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Log successful operation
    await logOperation(supabase, {
      patient_id,
      message,
      media_urls: mediaUrls,
      status: "success",
      twilio_message_sid: twilioData.sid,
      sent_at: new Date().toISOString(),
    });

    // Success response
    return new Response(
      JSON.stringify({
        success: true,
        messageId: twilioData.sid,
        status: twilioData.status,
        to: whatsappNumber,
        patientName,
        message: "WhatsApp message sent successfully",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Edge Function error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

// Helper function to log operations to Supabase
async function logOperation(supabase: any, logEntry: LogEntry) {
  try {
    const { error } = await supabase.from("whatsapp_logs").insert({
      patient_id: logEntry.patient_id,
      message: logEntry.message,
      media_urls: logEntry.media_urls || [],
      status: logEntry.status,
      error: logEntry.error || null,
      twilio_message_sid: logEntry.twilio_message_sid || null,
      sent_at: logEntry.sent_at,
    });

    if (error) {
      console.error("Error logging WhatsApp operation:", error);
    }
  } catch (error) {
    console.error("Exception logging WhatsApp operation:", error);
  }
}
