import React from "react";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface CalendarViewProps {
  currentMonth: Date;
  appointments: any[];
  onDateSelect: (date: string) => void;
  selectedDate: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  currentMonth,
  appointments,
  onDateSelect,
  selectedDate,
  onPrevMonth,
  onNextMonth,
  onToday,
}) => {
  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between pb-4">
        <h2 className="text-xl font-bold">
          {currentMonth.toLocaleString("pt-BR", {
            month: "long",
            year: "numeric",
          })}
        </h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={onPrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={onToday}>
            Hoje
          </Button>
          <Button variant="outline" size="icon" onClick={onNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    return (
      <div className="grid grid-cols-7 text-center text-sm font-medium text-muted-foreground">
        {days.map((day) => (
          <div key={day} className="py-2">{day}</div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1,
    );
    const monthEnd = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0,
    );
    const startDate = new Date(monthStart);
    startDate.setDate(startDate.getDate() - monthStart.getDay());
    const endDate = new Date(monthEnd);
    endDate.setDate(endDate.getDate() + (6 - monthEnd.getDay()));

    const rows = [];
    let days = [];
    let day = new Date(startDate);

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const d = new Date(day);
        const dateString = d.toISOString().split("T")[0];
        
        days.push(
          <div
            key={d.toString()}
            className={`h-28 border-t border-r p-1.5 flex flex-col cursor-pointer transition-colors
              ${!isCurrentMonth(d) ? "bg-muted/50 text-muted-foreground" : "hover:bg-accent"}
              ${isToday(d) ? "bg-blue-100 dark:bg-blue-900/50" : ""}
              ${isSelected(d) ? "bg-primary/20 ring-2 ring-primary" : ""}
            `}
            onClick={() => onDateSelect(d.toISOString().split("T")[0])}
          >
            <span className={`font-medium ${isToday(d) ? "text-primary" : ""}`}>
              {d.getDate()}
            </span>
            <div className="mt-1 flex-grow overflow-y-auto scrollbar-thin">
              {getAppointmentsForDate(d).map((apt) => (
                <div key={apt.id} className="mb-0.5">
                   <Badge
                    variant="default"
                    className="w-full text-xs truncate p-1"
                   >
                    {apt.patient_name || 'Consulta'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>,
        );
        day.setDate(day.getDate() + 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>,
      );
      days = [];
    }

    return <div className="border-l border-b">{rows}</div>;
  };

  const getAppointmentsForDate = (date) => {
    const dateString = date.toISOString().split("T")[0];
    return appointments.filter((apt) => apt.date === dateString);
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isCurrentMonth = (date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  const isSelected = (date) => {
    if (!selectedDate) return false;
    const selected = new Date(selectedDate);
    return (
      date.getDate() === selected.getDate() &&
      date.getMonth() === selected.getMonth() &&
      date.getFullYear() === selected.getFullYear()
    );
  };

  return (
    <Card>
      <CardContent className="p-4">
        {renderHeader()}
        {renderDays()}
        {renderCells()}
      </CardContent>
    </Card>
  );
};

export default CalendarView; 