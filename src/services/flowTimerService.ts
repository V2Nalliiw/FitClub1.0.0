import { supabase } from "@/lib/supabase";

// Interface para agendamentos de fluxo
interface FlowSchedule {
  id?: string;
  flow_id: string;
  patient_id: string;
  scheduled_for: string;
  delay_amount: number;
  delay_unit: "minutes" | "hours" | "days" | "weeks";
  status: "pending" | "executed" | "cancelled";
  created_at?: string;
  updated_at?: string;
}

// Interface para execução de fluxos
interface FlowExecution {
  id?: string;
  flow_id: string;
  patient_id: string;
  current_node_id: string;
  status: "active" | "paused" | "completed" | "cancelled";
  started_at: string;
  completed_at?: string;
  execution_data?: any;
  created_at?: string;
  updated_at?: string;
}

export class FlowTimerService {
  private static timers: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Agenda a execução de um fluxo após um delay específico
   */
  static async scheduleFlowExecution(
    flowId: string,
    patientId: string,
    delayAmount: number,
    delayUnit: "minutes" | "hours" | "days" | "weeks",
  ): Promise<{ success: boolean; scheduleId?: string; error?: string }> {
    try {
      // Calcular o timestamp para execução
      const now = new Date();
      const delayMs = this.convertToMilliseconds(delayAmount, delayUnit);
      const scheduledFor = new Date(now.getTime() + delayMs);

      // Salvar o agendamento no banco
      const { data, error } = await supabase
        .from("flow_schedules")
        .insert({
          flow_id: flowId,
          patient_id: patientId,
          scheduled_for: scheduledFor.toISOString(),
          delay_amount: delayAmount,
          delay_unit: delayUnit,
          status: "pending",
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Erro ao agendar execução do fluxo:", error);
        return { success: false, error: error.message };
      }

      // Criar timer local para execução
      const timerId = `${flowId}-${patientId}-${data.id}`;
      const timer = setTimeout(() => {
        this.executeScheduledFlow(data.id, flowId, patientId);
      }, delayMs);

      this.timers.set(timerId, timer);

      console.log(
        `✅ Fluxo agendado para execução em ${delayAmount} ${delayUnit}`,
      );
      return { success: true, scheduleId: data.id };
    } catch (error) {
      console.error("Erro inesperado ao agendar fluxo:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  /**
   * Executa um fluxo agendado
   */
  private static async executeScheduledFlow(
    scheduleId: string,
    flowId: string,
    patientId: string,
  ): Promise<void> {
    try {
      console.log(
        `🚀 Executando fluxo agendado: ${flowId} para paciente: ${patientId}`,
      );

      // Marcar o agendamento como executado
      await supabase
        .from("flow_schedules")
        .update({
          status: "executed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", scheduleId);

      // Criar uma nova execução de fluxo
      const { data: flowData, error: flowError } = await supabase
        .from("flows")
        .select("*")
        .eq("id", flowId)
        .single();

      if (flowError || !flowData) {
        console.error("Erro ao buscar dados do fluxo:", flowError);
        return;
      }

      // Encontrar o nó de início do fluxo
      const flowNodes = flowData.flow_data?.nodes || [];
      const startNode = flowNodes.find(
        (node: any) => node.type === "startNode",
      );

      if (!startNode) {
        console.error("Nó de início não encontrado no fluxo");
        return;
      }

      // Criar execução do fluxo
      const { error: executionError } = await supabase
        .from("flow_executions")
        .insert({
          flow_id: flowId,
          patient_id: patientId,
          current_node_id: startNode.id,
          status: "active",
          started_at: new Date().toISOString(),
          execution_data: {
            scheduledExecution: true,
            scheduleId: scheduleId,
            startedAutomatically: true,
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (executionError) {
        console.error("Erro ao criar execução do fluxo:", executionError);
        return;
      }

      console.log(
        `✅ Fluxo ${flowId} iniciado automaticamente para paciente ${patientId}`,
      );

      // Aqui você pode adicionar lógica adicional, como:
      // - Enviar notificação para o paciente
      // - Registrar no log de atividades
      // - Disparar webhooks
    } catch (error) {
      console.error("Erro ao executar fluxo agendado:", error);
    }
  }

  /**
   * Cancela um agendamento de fluxo
   */
  static async cancelScheduledFlow(
    scheduleId: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Atualizar status no banco
      const { error } = await supabase
        .from("flow_schedules")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", scheduleId);

      if (error) {
        return { success: false, error: error.message };
      }

      // Cancelar timer local se existir
      for (const [timerId, timer] of this.timers.entries()) {
        if (timerId.includes(scheduleId)) {
          clearTimeout(timer);
          this.timers.delete(timerId);
          break;
        }
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  /**
   * Lista agendamentos pendentes
   */
  static async getPendingSchedules(): Promise<FlowSchedule[]> {
    try {
      const { data, error } = await supabase
        .from("flow_schedules")
        .select("*")
        .eq("status", "pending")
        .order("scheduled_for", { ascending: true });

      if (error) {
        console.error("Erro ao buscar agendamentos:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Erro ao buscar agendamentos:", error);
      return [];
    }
  }

  /**
   * Converte delay para millisegundos
   */
  private static convertToMilliseconds(
    amount: number,
    unit: "minutes" | "hours" | "days" | "weeks",
  ): number {
    const multipliers = {
      minutes: 60 * 1000,
      hours: 60 * 60 * 1000,
      days: 24 * 60 * 60 * 1000,
      weeks: 7 * 24 * 60 * 60 * 1000,
    };

    return amount * multipliers[unit];
  }

  /**
   * Formata delay para exibição
   */
  static formatDelay(
    amount: number,
    unit: "minutes" | "hours" | "days" | "weeks",
  ): string {
    const unitLabels = {
      minutes: amount === 1 ? "minuto" : "minutos",
      hours: amount === 1 ? "hora" : "horas",
      days: amount === 1 ? "dia" : "dias",
      weeks: amount === 1 ? "semana" : "semanas",
    };

    return `${amount} ${unitLabels[unit]}`;
  }

  /**
   * Inicializa timers para agendamentos existentes (chamado na inicialização da aplicação)
   */
  static async initializeExistingSchedules(): Promise<void> {
    try {
      const pendingSchedules = await this.getPendingSchedules();
      const now = new Date();

      for (const schedule of pendingSchedules) {
        const scheduledTime = new Date(schedule.scheduled_for);
        const timeUntilExecution = scheduledTime.getTime() - now.getTime();

        if (timeUntilExecution > 0) {
          // Ainda não chegou a hora, criar timer
          const timerId = `${schedule.flow_id}-${schedule.patient_id}-${schedule.id}`;
          const timer = setTimeout(() => {
            this.executeScheduledFlow(
              schedule.id!,
              schedule.flow_id,
              schedule.patient_id,
            );
          }, timeUntilExecution);

          this.timers.set(timerId, timer);
          console.log(`⏰ Timer restaurado para agendamento ${schedule.id}`);
        } else {
          // Já passou da hora, executar imediatamente
          console.log(`⚡ Executando agendamento atrasado ${schedule.id}`);
          await this.executeScheduledFlow(
            schedule.id!,
            schedule.flow_id,
            schedule.patient_id,
          );
        }
      }

      console.log(`✅ ${pendingSchedules.length} agendamentos inicializados`);
    } catch (error) {
      console.error("Erro ao inicializar agendamentos existentes:", error);
    }
  }

  /**
   * Limpa todos os timers (útil para cleanup)
   */
  static clearAllTimers(): void {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
    console.log("🧹 Todos os timers foram limpos");
  }
}
