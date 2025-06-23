import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface FormLinkRequest {
  flow_id: string;
  patient_id: string;
  node_id: string;
}

interface FormLinkResponse {
  url: string;
  token: string;
  expires_at?: string;
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
    const { flow_id, patient_id, node_id }: FormLinkRequest = await req.json();

    // Validate required fields
    if (!flow_id || !patient_id || !node_id) {
      return new Response(
        JSON.stringify({
          error:
            "Missing required fields: flow_id, patient_id, and node_id are required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Validate UUID format for flow_id and patient_id
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(flow_id)) {
      return new Response(
        JSON.stringify({
          error: "Invalid flow_id format. Must be a valid UUID.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

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

    // Verify that the flow exists
    const { data: flowData, error: flowError } = await supabase
      .from("flows")
      .select("id")
      .eq("id", flow_id)
      .single();

    if (flowError || !flowData) {
      return new Response(
        JSON.stringify({
          error: "Flow not found. Please verify the flow_id.",
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Verify that the patient exists
    const { data: patientData, error: patientError } = await supabase
      .from("patients")
      .select("id")
      .eq("id", patient_id)
      .single();

    if (patientError || !patientData) {
      return new Response(
        JSON.stringify({
          error: "Patient not found. Please verify the patient_id.",
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Generate a secure token (UUID)
    const token = crypto.randomUUID();

    // Set expiration time (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Create the form link record
    const { data: formLinkData, error: insertError } = await supabase
      .from("form_links")
      .insert({
        flow_id,
        patient_id,
        node_id,
        token,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);
      return new Response(
        JSON.stringify({
          error: "Failed to create form link",
          details: insertError.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Generate the form URL
    const baseUrl = "https://seuapp.com"; // You can make this configurable via environment variable
    const formUrl = `${baseUrl}/formulario?token=${token}`;

    // Success response
    const response: FormLinkResponse = {
      url: formUrl,
      token: token,
      expires_at: expiresAt.toISOString(),
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
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
