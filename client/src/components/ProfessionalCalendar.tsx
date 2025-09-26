import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Plus, X, Edit3, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: number;
  type: 'consultation' | 'second-opinion' | 'blocked';
  patient?: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

const ProfessionalCalendar = () => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: '1',
      title: 'Consulenza Oncologica',
      date: '2025-01-26',
      time: '09:00',
      duration: 60,
      type: 'consultation',
      patient: 'Mario R.'
    },
    {
      id: '2',
      title: 'Seconda Opinione',
      date: '2025-01-26',
      time: '14:30',
      duration: 45,
      type: 'second-opinion',
      patient: 'Anna S.'
    }
  ]);

  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([
    { time: '09:00', available: false },
    { time: '10:00', available: true },
    { time: '11:00', available: true },
    { time: '14:00', available: true },
    { time: '14:30', available: false },
    { time: '15:30', available: true },
    { time: '16:30', available: true }
  ]);

  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    time: '',
    duration: 60,
    type: 'consultation' as const
  });

  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Start from Monday
    return startOfWeek;
  });

  const getDaysOfWeek = () => {
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(currentWeekStart);
      day.setDate(currentWeekStart.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeekStart(newWeekStart);
  };

  const goToCurrentWeek = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1);
    setCurrentWeekStart(startOfWeek);
  };

  const formatWeekRange = () => {
    const endOfWeek = new Date(currentWeekStart);
    endOfWeek.setDate(currentWeekStart.getDate() + 6);
    
    const startMonth = currentWeekStart.toLocaleDateString('it-IT', { month: 'short' });
    const endMonth = endOfWeek.toLocaleDateString('it-IT', { month: 'short' });
    const year = endOfWeek.getFullYear();
    
    if (startMonth === endMonth) {
      return `${currentWeekStart.getDate()} - ${endOfWeek.getDate()} ${endMonth} ${year}`;
    } else {
      return `${currentWeekStart.getDate()} ${startMonth} - ${endOfWeek.getDate()} ${endMonth} ${year}`;
    }
  };

  const getEventsForDate = (date: string) => {
    return events.filter(event => event.date === date);
  };

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.time) {
      toast({
        title: "Errore",
        description: "Inserisci tutti i campi richiesti",
        variant: "destructive"
      });
      return;
    }

    const event: CalendarEvent = {
      id: Date.now().toString(),
      title: newEvent.title,
      date: selectedDate,
      time: newEvent.time,
      duration: newEvent.duration,
      type: newEvent.type
    };

    setEvents([...events, event]);
    setNewEvent({ title: '', time: '', duration: 60, type: 'consultation' });
    setIsAddingEvent(false);
    
    toast({
      title: "Evento aggiunto",
      description: "L'evento è stato aggiunto al calendario"
    });
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter(e => e.id !== eventId));
    toast({
      title: "Evento rimosso",
      description: "L'evento è stato rimosso dal calendario"
    });
  };

  const toggleSlotAvailability = (time: string) => {
    setAvailableSlots(slots => 
      slots.map(slot => 
        slot.time === time ? { ...slot, available: !slot.available } : slot
      )
    );
  };

  const weekDays = getDaysOfWeek();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Calendario Professionale</h2>
        <Dialog open={isAddingEvent} onOpenChange={setIsAddingEvent}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nuovo Evento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Aggiungi Nuovo Evento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Titolo</Label>
                <Input
                  id="title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Es: Consulenza Oncologica"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="time">Orario</Label>
                  <Select value={newEvent.time} onValueChange={(value) => setNewEvent({ ...newEvent, time: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona orario" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSlots.filter(slot => slot.available).map(slot => (
                        <SelectItem key={slot.time} value={slot.time}>
                          {slot.time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="duration">Durata (minuti)</Label>
                  <Select value={newEvent.duration.toString()} onValueChange={(value) => setNewEvent({ ...newEvent, duration: parseInt(value) })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minuti</SelectItem>
                      <SelectItem value="45">45 minuti</SelectItem>
                      <SelectItem value="60">60 minuti</SelectItem>
                      <SelectItem value="90">90 minuti</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="type">Tipo</Label>
                <Select value={newEvent.type} onValueChange={(value: 'consultation' | 'second-opinion' | 'blocked') => setNewEvent({ ...newEvent, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consultation">Consulenza</SelectItem>
                    <SelectItem value="second-opinion">Seconda Opinione</SelectItem>
                    <SelectItem value="blocked">Tempo Bloccato</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddingEvent(false)}>
                  Annulla
                </Button>
                <Button onClick={handleAddEvent}>
                  Aggiungi Evento
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Week View */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Vista Settimanale
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateWeek('prev')}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm font-medium min-w-[160px] text-center">
                {formatWeekRange()}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateWeek('next')}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToCurrentWeek}
                className="ml-2"
              >
                Oggi
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, index) => {
              const dateStr = day.toISOString().split('T')[0];
              const dayEvents = getEventsForDate(dateStr);
              const isToday = dateStr === new Date().toISOString().split('T')[0];
              
              return (
                <div key={index} className={`border rounded-lg p-3 ${isToday ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}>
                  <div className="text-center mb-2">
                    <div className="text-xs text-gray-500">
                      {day.toLocaleDateString('it-IT', { weekday: 'short' })}
                    </div>
                    <div className={`text-lg font-semibold ${isToday ? 'text-blue-600' : ''}`}>
                      {day.getDate()}
                    </div>
                  </div>
                  <div className="space-y-1">
                    {dayEvents.map(event => (
                      <div key={event.id} className="relative group">
                        <div className={`text-xs p-1 rounded cursor-pointer ${
                          event.type === 'consultation' ? 'bg-green-100 text-green-800' :
                          event.type === 'second-opinion' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          <div className="font-medium">{event.time}</div>
                          <div className="truncate">{event.title}</div>
                          {event.patient && (
                            <div className="text-xs opacity-75">{event.patient}</div>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute -top-1 -right-1 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDeleteEvent(event.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Availability Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Disponibilità Oraria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {availableSlots.map(slot => (
              <Button
                key={slot.time}
                variant={slot.available ? "default" : "outline"}
                size="sm"
                onClick={() => toggleSlotAvailability(slot.time)}
                className={`${slot.available ? 'bg-green-500 hover:bg-green-600' : 'hover:bg-gray-100'}`}
              >
                {slot.time}
              </Button>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-4">
            Clicca sui slot orari per abilitare/disabilitare la disponibilità per nuovi appuntamenti.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfessionalCalendar;