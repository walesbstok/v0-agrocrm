"use client"

import { useRef, useEffect } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import listPlugin from "@fullcalendar/list"
import interactionPlugin from "@fullcalendar/interaction"

interface CalendarEvent {
  id: string
  title: string
  start: string
  backgroundColor?: string
  borderColor?: string
  extendedProps?: Record<string, unknown>
}

interface CalendarViewProps {
  events: CalendarEvent[]
  onEventClick?: (activityId: string) => void
}

export default function CalendarView({ events, onEventClick }: CalendarViewProps) {
  return (
    <div className="fc-agri">
      <style jsx global>{`
        .fc-agri .fc {
          --fc-border-color: hsl(120 8% 87%);
          --fc-button-bg-color: hsl(125 53% 33%);
          --fc-button-border-color: hsl(125 53% 33%);
          --fc-button-hover-bg-color: hsl(125 53% 28%);
          --fc-button-hover-border-color: hsl(125 53% 28%);
          --fc-button-active-bg-color: hsl(125 53% 25%);
          --fc-button-active-border-color: hsl(125 53% 25%);
          --fc-today-bg-color: hsl(120 20% 95%);
          font-size: 0.875rem;
        }
        .fc-agri .fc .fc-toolbar-title {
          font-size: 1.125rem;
          font-weight: 700;
        }
        .fc-agri .fc .fc-button {
          font-size: 0.8125rem;
          padding: 0.375rem 0.75rem;
          border-radius: 0.375rem;
        }
        .fc-agri .fc .fc-event {
          border-radius: 0.25rem;
          font-size: 0.75rem;
          padding: 1px 4px;
          cursor: pointer;
        }
        .fc-agri .fc .fc-daygrid-day-number {
          font-size: 0.8125rem;
          padding: 4px 8px;
        }
        @media (max-width: 640px) {
          .fc-agri .fc .fc-toolbar {
            flex-direction: column;
            gap: 0.5rem;
          }
          .fc-agri .fc .fc-toolbar-title {
            font-size: 1rem;
          }
        }
      `}</style>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
        }}
        events={events}
        locale="pl"
        firstDay={1}
        height="auto"
        buttonText={{
          today: "Dzis",
          month: "Miesiac",
          week: "Tydzien",
          day: "Dzien",
          list: "Lista",
        }}
        eventClick={(info) => {
          const actId = info.event.extendedProps?.activityId || info.event.id
          if (onEventClick) onEventClick(actId as string)
        }}
        nowIndicator
        dayMaxEvents={3}
      />
    </div>
  )
}
