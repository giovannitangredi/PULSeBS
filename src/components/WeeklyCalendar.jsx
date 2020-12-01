import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";

class WeeklyCalendar extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <h5>{this.props.title}</h5>
        <FullCalendar
          initialView="timeGridWeek"
          defaultView="dayGridMonth"
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          eventClick={this.props.handleEventClick}
          header={{
            left: "prev,next, today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          editable={false}
          events={this.props.Items}
          eventContent={this.props.renderEventContent}
          eventLimit={false}
        />
      </div>
    );
  }
}

export default WeeklyCalendar;
