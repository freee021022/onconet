import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Plus, User, CheckCircle, X } from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { it } from 'date-fns/locale';

interface DoctorCalendarProps {
  doctorId: number;
}

interface Appointment {
  id: number;
  doctorId: number;
  patientId?: number;
  appointmentDate: string;
  appointmentTime: string;
  duration: number;
  status: 'available' | 'booked' | 'completed' | 'cancelled';
  notes?: string;
  patientName?: string;
}

const DoctorCalendar = ({ doctorId }: DoctorCalendarProps) => {
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [showAddSlot, setShowAddSlot] = useState(false);
  const queryClient = useQueryClient();

  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const { data: appointments, isLoading } = useQuery({
    queryKey: [`/api/doctors/${doctorId}/appointments`, format(weekStart, 'yyyy-MM-dd')],
    queryFn: async () => {
      const response = await fetch(`/api/doctors/${doctorId}/appointments?week=${format(weekStart, 'yyyy-MM-dd')}`);
      if (!response.ok) throw new Error('Failed to fetch appointments');
      return response.json() as Promise<Appointment[]>;
    }
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: async ({ appointmentId, status }: { appointmentId: number; status: string }) => {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!response.ok) throw new Error('Failed to update appointment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/doctors/${doctorId}/appointments`] });
    }
  });

  const createSlotMutation = useMutation({
    mutationFn: async (slotData: { date: string; time: string; duration: number }) => {
      const response = await fetch(`/api/doctors/${doctorId}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId,
          appointmentDate: slotData.date,
          appointmentTime: slotData.time,
          duration: slotData.duration,
          status: 'available'
        })
      });
      if (!response.ok) throw new Error('Failed to create slot');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/doctors/${doctorId}/appointments`] });
      setShowAddSlot(false);
    }
  });

  const getAppointmentsForDay = (date: Date): Appointment[] => {
    if (!appointments) return [];
    const dateStr = format(date, 'yyyy-MM-dd');
    return appointments.filter(apt => apt.appointmentDate === dateStr)
      .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'booked': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Disponibile';
      case 'booked': return 'Prenotato';
      case 'completed': return 'Completato';
      case 'cancelled': return 'Cancellato';
      default: return status;
    }
  };

  const handleStatusChange = (appointmentId: number, newStatus: string) => {
    updateAppointmentMutation.mutate({ appointmentId, status: newStatus });
  };

  const AddSlotForm = ({ date }: { date: Date }) => {
    const [time, setTime] = useState('09:00');
    const [duration, setDuration] = useState(30);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      createSlotMutation.mutate({
        date: format(date, 'yyyy-MM-dd'),
        time,
        duration
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-gray-50">
        <div className="flex gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Orario</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="px-3 py-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Durata (min)</label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="px-3 py-2 border rounded-md"
            >
              <option value={15}>15 min</option>
              <option value={30}>30 min</option>
              <option value={45}>45 min</option>
              <option value={60}>60 min</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={createSlotMutation.isPending}>
            Aggiungi Slot
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => setShowAddSlot(false)}>
            Annulla
          </Button>
        </div>
      </form>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Calendario Appuntamenti</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-300 rounded"></div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="h-32 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Calendario Appuntamenti
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedWeek(subWeeks(selectedWeek, 1))}
            >
              ←
            </Button>
            <span className="font-medium">
              {format(weekStart, 'dd MMM', { locale: it })} - {format(addDays(weekStart, 6), 'dd MMM yyyy', { locale: it })}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedWeek(addWeeks(selectedWeek, 1))}
            >
              →
            </Button>
            <Button
              onClick={() => setShowAddSlot(!showAddSlot)}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Aggiungi Slot
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {showAddSlot && (
          <div className="mb-6">
            <h3 className="font-medium mb-3">Aggiungi nuovo slot di disponibilità</h3>
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day) => (
                <div key={day.toISOString()} className="space-y-2">
                  <div className="text-center">
                    <div className="font-medium">{format(day, 'EEE', { locale: it })}</div>
                    <div className="text-sm text-gray-600">{format(day, 'd')}</div>
                  </div>
                  <AddSlotForm date={day} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-7 gap-4">
          {weekDays.map((day) => {
            const dayAppointments = getAppointmentsForDay(day);
            const isToday = isSameDay(day, new Date());

            return (
              <div key={day.toISOString()} className="space-y-2">
                <div className={`text-center p-2 rounded-lg ${isToday ? 'bg-primary text-white' : 'bg-gray-100'}`}>
                  <div className="font-medium">{format(day, 'EEE', { locale: it })}</div>
                  <div className="text-sm">{format(day, 'd MMM', { locale: it })}</div>
                </div>

                <div className="space-y-2 min-h-[200px]">
                  {dayAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className={`p-2 rounded-lg border text-xs ${getStatusColor(appointment.status)}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span className="font-medium">{appointment.appointmentTime}</span>
                        </div>
                        <span className="text-xs">{appointment.duration}min</span>
                      </div>

                      <div className="mb-2">
                        <Badge variant="outline" className="text-xs">
                          {getStatusText(appointment.status)}
                        </Badge>
                      </div>

                      {appointment.patientName && (
                        <div className="flex items-center gap-1 mb-2">
                          <User className="h-3 w-3" />
                          <span className="truncate">{appointment.patientName}</span>
                        </div>
                      )}

                      {appointment.notes && (
                        <div className="text-xs text-gray-600 mb-2 truncate" title={appointment.notes}>
                          {appointment.notes}
                        </div>
                      )}

                      <div className="flex gap-1">
                        {appointment.status === 'booked' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 px-2 text-xs"
                              onClick={() => handleStatusChange(appointment.id, 'completed')}
                            >
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 px-2 text-xs"
                              onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                        {appointment.status === 'available' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 px-2 text-xs"
                            onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                          >
                            Rimuovi
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Istruzioni</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Aggiungi slot di disponibilità usando il pulsante "Aggiungi Slot"</li>
            <li>• I pazienti possono prenotare i tuoi slot disponibili</li>
            <li>• Segna gli appuntamenti come completati o cancellati</li>
            <li>• Gli slot si aggiornano in tempo reale</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default DoctorCalendar;
