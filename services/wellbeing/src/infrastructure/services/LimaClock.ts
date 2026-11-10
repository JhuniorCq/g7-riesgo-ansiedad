import { Clock } from "../../application/services/Clock.js";

// "en-CA" formatea la fecha como YYYY-MM-DD
const formatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Lima",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export class LimaClock implements Clock {
  today(): string {
    return formatter.format(new Date());
  }
}
