import { Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef } from '@angular/core';
import {
  CalendarEvent,
  CalendarView,
  CalendarMonthViewDay
} from 'angular-calendar';
import { ContractService } from 'src/app/core/services/contract.service';
import { UserProfileService } from 'src/app/core/services/user.service';
import {
  startOfDay,
  endOfDay,
  addDays,
  subDays,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isSameMonth,
  isSameDay
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { forkJoin } from 'rxjs';

interface ClientWithColor {
  name: string;
  color: string;
}

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class CalendarComponent implements OnInit {
  breadCrumbItems: Array<{ label: string; url?: string; active?: boolean }> = [];
  pageTitle: string = 'Agenda des commandes';
  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  viewDate: Date = new Date();
  events: CalendarEvent[] = [];
  clients: ClientWithColor[] = [];
  filteredEvents: CalendarEvent[] = [];
  selectedClient: string | null = null;
  filterByWorkDates: boolean = true;
  isLoading: boolean = true;
  clientsInCurrentPeriod: ClientWithColor[] = [];
  colorMap: Map<string, any> = new Map();
  activeDayIsOpen: boolean = false;

  constructor(
    private contractService: ContractService,
    private userService: UserProfileService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    forkJoin({
      contracts: this.contractService.getContracts(),
      clients: this.userService.getAll()
    }).subscribe(({ contracts, clients }) => {
      this.processClients(clients);
      this.processContracts(contracts);
      this.isLoading = false;
      this.updateView();
    });
  }

  processContracts(contracts: any[]): void {
    this.events = contracts.map(contract => {
      const start = this.filterByWorkDates
        ? startOfDay(new Date(contract.start_date_works))
        : startOfDay(new Date(contract.date_cde));
      const end = this.filterByWorkDates
        ? endOfDay(new Date(contract.end_date_works))
        : endOfDay(new Date(contract.end_date_customer));

      const customer = contract.customer
        ? `${contract.customer.firstname || ''} ${contract.customer.lastname || ''}`.trim()
        : 'Client inconnu';

      // Gestion des couleurs
      const clientKey = customer;
      let eventColor = this.colorMap.get(clientKey);
      if (!eventColor) {
        if (contract.customer && contract.customer.bgcolor) {
          eventColor = {
            primary: contract.customer.bgcolor,
            secondary: contract.customer.bgcolor
          };
        } else {
          eventColor = this.getRandomColor();
        }
        this.colorMap.set(clientKey, eventColor);
      }

      return {
        start,
        end,
        title: `Commande de ${customer || 'Client inconnu'}`,
        color: eventColor,
        meta: contract
      };
    });
  }

  processClients(clientsData: any[]): void {
    this.clients = clientsData
      .filter(client => client.role === 'customer')
      .map(client => {
        const clientName = `${client.firstname} ${client.lastname}`;
        let color = this.colorMap.get(clientName)?.primary;

        if (!color) {
          if (client.bgcolor) {
            color = client.bgcolor;
          } else {
            const randomColor = this.getRandomColor();
            color = randomColor.primary;
            this.colorMap.set(clientName, randomColor);
          }
        }

        return { name: clientName, color };
      });
  }

  getRandomColor(): any {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return {
      primary: color,
      secondary: color
    };
  }

  get periodTitle(): string {
    if (this.view === CalendarView.Month) {
      return format(this.viewDate, 'MMMM yyyy', { locale: fr });
    } else if (this.view === CalendarView.Week) {
      const start = startOfWeek(this.viewDate, { weekStartsOn: 1 });
      const end = endOfWeek(this.viewDate, { weekStartsOn: 1 });
      return `Semaine du ${format(start, 'dd MMMM', { locale: fr })} au ${format(
        end,
        'dd MMMM yyyy',
        { locale: fr }
      )}`;
    } else if (this.view === CalendarView.Day) {
      return format(this.viewDate, 'EEEE dd MMMM yyyy', { locale: fr });
    }
    return '';
  }

  filterEvents(): void {
    const periodStart = this.getPeriodStart();
    const periodEnd = this.getPeriodEnd();

    this.filteredEvents = this.events.filter(event => {
      const eventInPeriod =
        (event.start >= periodStart && event.start <= periodEnd) ||
        (event.end >= periodStart && event.end <= periodEnd) ||
        (event.start <= periodStart && event.end >= periodEnd);

      const clientMatches =
        !this.selectedClient ||
        (event.meta.customer &&
          `${event.meta.customer.firstname} ${event.meta.customer.lastname}` ===
            this.selectedClient);

      return eventInPeriod && clientMatches;
    });
  }

  toggleDateFilter(): void {
    this.filterByWorkDates = !this.filterByWorkDates;
    this.processContracts(this.events.map(event => event.meta));
    this.updateView();
  }

  setView(view: CalendarView): void {
    this.view = view;
    this.updateView();
  }

  prev(): void {
    if (this.view === CalendarView.Month) {
      this.viewDate = subMonths(this.viewDate, 1);
    } else if (this.view === CalendarView.Week) {
      this.viewDate = subWeeks(this.viewDate, 1);
    } else if (this.view === CalendarView.Day) {
      this.viewDate = subDays(this.viewDate, 1);
    }
    this.updateView();
  }

  next(): void {
    if (this.view === CalendarView.Month) {
      this.viewDate = addMonths(this.viewDate, 1);
    } else if (this.view === CalendarView.Week) {
      this.viewDate = addWeeks(this.viewDate, 1);
    } else if (this.view === CalendarView.Day) {
      this.viewDate = addDays(this.viewDate, 1);
    }
    this.updateView();
  }

  today(): void {
    this.viewDate = new Date();
    this.updateView();
  }

  updateView(): void {
    this.filterEvents();
    this.updateClientsInCurrentPeriod();
    this.cdr.detectChanges();
  }

  updateClientsInCurrentPeriod(): void {
    const clientsMap = new Map<string, string>();

    this.filteredEvents.forEach(event => {
      if (event.meta.customer) {
        const clientName = `${event.meta.customer.firstname} ${event.meta.customer.lastname}`;
        const eventColor = event.color.primary;
        clientsMap.set(clientName, eventColor);
      }
    });

    this.clientsInCurrentPeriod = Array.from(clientsMap, ([name, color]) => ({ name, color }));
  }

  getPeriodStart(): Date {
    if (this.view === CalendarView.Month) {
      return startOfMonth(this.viewDate);
    } else if (this.view === CalendarView.Week) {
      return startOfWeek(this.viewDate, { weekStartsOn: 1 });
    } else if (this.view === CalendarView.Day) {
      return startOfDay(this.viewDate);
    }
    return this.viewDate;
  }

  getPeriodEnd(): Date {
    if (this.view === CalendarView.Month) {
      return endOfMonth(this.viewDate);
    } else if (this.view === CalendarView.Week) {
      return endOfWeek(this.viewDate, { weekStartsOn: 1 });
    } else if (this.view === CalendarView.Day) {
      return endOfDay(this.viewDate);
    }
    return this.viewDate;
  }

  selectClient(client: ClientWithColor | null): void {
    this.selectedClient = client ? client.name : null;
    this.updateView();
  }

  calculateTextColor(bgColor: string): string {
    const color = bgColor.substring(1); // Remove '#'
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);

    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    return brightness > 128 ? 'black' : 'white';
  }

  dayClicked({ day }: { day: CalendarMonthViewDay<CalendarEvent<any>> }): void {
    const date = day.date;
    const events = day.events;

    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
        this.viewDate = date;
      }
    }
  }
}
