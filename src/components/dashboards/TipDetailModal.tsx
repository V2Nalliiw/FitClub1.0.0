import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, Edit, Trash2, X, Send } from "lucide-react";

// Supondo que você tenha um tipo 'Tip' definido em algum lugar
// import { Tip } from '@/types/tips'; 
type Tip = any; // Usando 'any' por enquanto

interface TipDetailModalProps {
  tip: Tip | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (tip: Tip) => void;
  onDelete: (tipId: string) => void;
  onAssign: (tip: Tip) => void;
  onSchedule: (tip: Tip) => void;
}

const TipDetailModal: React.FC<TipDetailModalProps> = ({ tip, isOpen, onClose, onEdit, onDelete, onAssign, onSchedule }) => {
  if (!tip) return null;

  // Supondo que 'steps' seja um array de strings ou objetos
  const steps = typeof tip.steps === 'string' ? JSON.parse(tip.steps) : tip.steps || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-card">
        <DialogHeader>
          <div className="relative">
            <img
              src={tip.image_url || "https://via.placeholder.com/800x400"}
              alt={tip.title}
              className="w-full h-56 object-cover rounded-t-lg"
            />
            <Badge className="absolute top-3 right-3" variant="secondary">
              {tip.category}
            </Badge>
          </div>
          <DialogTitle className="text-2xl font-bold pt-4">{tip.title}</DialogTitle>
        </DialogHeader>

        <div className="py-4 px-1 max-h-[40vh] overflow-y-auto">
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{tip.category}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{tip.duration || 'N/A'}</span>
            </div>
          </div>

          <p className="text-base text-muted-foreground mb-6">
            {tip.content}
          </p>

          {steps && steps.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Passos para completar:</h3>
              <div className="space-y-3">
                {steps.map((step: any, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="flex-shrink-0 bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <span className="flex-1 text-sm">{step.description || step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 flex-wrap sm:justify-end">
          <Button type="button" variant="secondary" onClick={() => onAssign(tip)}>
            <Send className="h-4 w-4 mr-2" />
            Atribuir
          </Button>
          <Button type="button" variant="secondary" onClick={() => onSchedule(tip)}>
            <Clock className="h-4 w-4 mr-2" />
            Agendar
          </Button>
          <Button type="button" variant="outline" onClick={() => onEdit(tip)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button type="button" variant="destructive" onClick={() => onDelete(tip.id)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TipDetailModal; 