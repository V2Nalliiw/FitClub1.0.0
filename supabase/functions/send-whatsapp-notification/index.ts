import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WhatsAppRequest {
  to: string;
  message: string;
  mediaUrl?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
    const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
    const TWILIO_WHATSAPP_NUMBER = Deno.env.get("TWILIO_WHATSAPP_NUMBER");

    // Validate environment variables
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

    // Parse request body
    const { to, message, mediaUrl }: WhatsAppRequest = await req.json();

    // Validate required fields
    if (!to || !message) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: to and message are required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Validate phone number format (basic E.164 validation)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(to)) {
      return new Response(
        JSON.stringify({
          error:
            "Invalid phone number format. Please use E.164 format (e.g., +5511999999999)",
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
    formData.append("To", `whatsapp:${to}`);
    formData.append("Body", message);

    // Add media URL if provided
    if (mediaUrl) {
      formData.append("MediaUrl", mediaUrl);
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
      console.error("Twilio API error:", twilioData);
      return new Response(
        JSON.stringify({
          error: "Failed to send WhatsApp message",
          details: twilioData.message || "Unknown error from Twilio API",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Success response
    return new Response(
      JSON.stringify({
        success: true,
        messageId: twilioData.sid,
        status: twilioData.status,
        to: to,
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
