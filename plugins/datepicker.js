import { setupCalendar, Calendar, DatePicker } from "v-calendar";
import "v-calendar/style.css";

export default defineNuxtPlugin((useNuxtApp) => {
  useNuxtApp.vueApp.use(setupCalendar, {});
  useNuxtApp.vueApp.component('VCalendar', Calendar);
  useNuxtApp.vueApp.component('VDatePicker',DatePicker)
});