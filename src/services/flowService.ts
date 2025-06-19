import { supabase } from "@/lib/supabase";

export interface Flow {
  id?: string;
  name: string;
  description?: string;
  flow_data: any;
  created_by?: string;
  clinic_id?: string;
  is_template?: boolean;
  is_active?: boolean;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface FlowAssignment {
  id?: string;
  flow_id: string;
  patient_id: string;
  assigned_by?: string;
  start_date: string;
  end_date?: string;
  frequency?: string;
  repetitions?: number;
  status?: string;
  progress?: any;
  created_at?: string;
  updated_at?: string;
}

export class FlowService {
  static async createFlow(flow: Flow): Promise<Flow> {
    try {
      console.log("Creating flow:", flow);

      // Use upsert instead of insert to handle conflicts on name and created_by
      const { data, error } = await supabase
        .from("flows")
        .upsert(flow, {
          onConflict: "name,created_by",
          ignoreDuplicates: false, // Update the existing record
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating flow:", error);
        throw new Error(`Error creating flow: ${error.message}`);
      }

      console.log("Flow created successfully:", data);
      return data;
    } catch (error) {
      console.error("Exception in createFlow:", error);
      throw error;
    }
  }

  static async updateFlow(id: string, flow: Partial<Flow>): Promise<Flow> {
    try {
      const { data, error } = await supabase
        .from("flows")
        .update(flow)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating flow:", error);
        throw new Error(`Error updating flow: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error("Exception in updateFlow:", error);
      throw error;
    }
  }

  static async getFlows(clinicId?: string): Promise<Flow[]> {
    try {
      let query = supabase.from("flows").select("*");

      if (clinicId) {
        query = query.eq("clinic_id", clinicId);
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) {
        console.error("Error fetching flows:", error);
        throw new Error(`Error fetching flows: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error("Exception in getFlows:", error);
      throw error;
    }
  }

  static async getFlowById(id: string): Promise<Flow> {
    try {
      const { data, error } = await supabase
        .from("flows")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(`Error fetching flow with id ${id}:`, error);
        throw new Error(`Error fetching flow: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error("Exception in getFlowById:", error);
      throw error;
    }
  }

  static async deleteFlow(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("flows").delete().eq("id", id);

      if (error) {
        console.error(`Error deleting flow with id ${id}:`, error);
        throw new Error(`Error deleting flow: ${error.message}`);
      }
    } catch (error) {
      console.error("Exception in deleteFlow:", error);
      throw error;
    }
  }

  static async assignFlowToPatient(
    assignment: FlowAssignment,
  ): Promise<FlowAssignment> {
    try {
      console.log("Assigning flow to patient:", assignment);

      const { data, error } = await supabase
        .from("flow_assignments")
        .insert(assignment)
        .select()
        .single();

      if (error) {
        console.error("Error assigning flow to patient:", error);
        throw new Error(`Error assigning flow: ${error.message}`);
      }

      console.log("Flow assigned successfully:", data);
      return data;
    } catch (error) {
      console.error("Exception in assignFlowToPatient:", error);
      throw error;
    }
  }

  static async getPatientAssignments(
    patientId: string,
  ): Promise<FlowAssignment[]> {
    try {
      const { data, error } = await supabase
        .from("flow_assignments")
        .select(
          `
          *,
          flows:flow_id(*)
        `,
        )
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(
          `Error fetching assignments for patient ${patientId}:`,
          error,
        );
        throw new Error(`Error fetching assignments: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error("Exception in getPatientAssignments:", error);
      throw error;
    }
  }

  static async getSpecialistAssignments(
    specialistId: string,
  ): Promise<FlowAssignment[]> {
    try {
      const { data, error } = await supabase
        .from("flow_assignments")
        .select(
          `
          *,
          flows:flow_id(*),
          patients:patient_id(*)
        `,
        )
        .eq("assigned_by", specialistId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(
          `Error fetching assignments by specialist ${specialistId}:`,
          error,
        );
        throw new Error(`Error fetching assignments: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error("Exception in getSpecialistAssignments:", error);
      throw error;
    }
  }

  static async updateAssignment(
    id: string,
    assignment: Partial<FlowAssignment>,
  ): Promise<FlowAssignment> {
    try {
      const { data, error } = await supabase
        .from("flow_assignments")
        .update(assignment)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating assignment ${id}:`, error);
        throw new Error(`Error updating assignment: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error("Exception in updateAssignment:", error);
      throw error;
    }
  }

  static async deleteAssignment(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("flow_assignments")
        .delete()
        .eq("id", id);

      if (error) {
        console.error(`Error deleting assignment ${id}:`, error);
        throw new Error(`Error deleting assignment: ${error.message}`);
      }
    } catch (error) {
      console.error("Exception in deleteAssignment:", error);
      throw error;
    }
  }

  static async getPatients(clinicId?: string): Promise<any[]> {
    try {
      let query = supabase.from("patients").select(`
          *,
          user_profiles:user_id(*)
        `);

      if (clinicId) {
        query = query.eq("clinic_id", clinicId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching patients:", error);
        throw new Error(`Error fetching patients: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error("Exception in getPatients:", error);
      throw error;
    }
  }
}
