import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  NgApexchartsModule,
  ChartComponent,
  ApexNonAxisChartSeries,
  ApexAxisChartSeries,
  ApexChart,
  ApexPlotOptions,
  ApexResponsive,
  ApexTooltip,
  ApexStroke,
  ApexDataLabels,
  ApexXAxis,
  ApexYAxis,
  ApexGrid,
  ApexLegend,
  ApexFill,
  ApexMarkers
} from 'ng-apexcharts';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';

import { CabeceraComponent } from '../../components/cabecera/cabecera';
import { FooterComponent } from '../../components/footer/footer';

import { VehiculosService, Vehiculo } from '../../../services/vehiculos.service';
import { EntradasInventarioService, EntradaInventario } from '../../../services/entradas-inventario.service';
import { SalidasInventarioService, SalidaInventario } from '../../../services/salidas-inventario.service';
import { MantenimientosService } from '../../../services/mantenimientos.service';
import { VehiculosDocumentosService } from '../../../services/vehiculos-documentos.service';

export type FleetChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  plotOptions: ApexPlotOptions;
  colors: string[];
  labels: string[];
  stroke: ApexStroke;
  responsive: ApexResponsive[];
  tooltip: ApexTooltip;
};

export type InventoryChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  grid: ApexGrid;
  tooltip: ApexTooltip;
  legend: ApexLegend;
  fill: ApexFill;
  colors: string[];
  markers: ApexMarkers;
};

export type MaintenanceChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  grid: ApexGrid;
  tooltip: ApexTooltip;
  legend: ApexLegend;
  fill: ApexFill;
  colors: string[];
  markers: ApexMarkers;
};

type WeekOption = {
  key: string;
  label: string;
  start: Date;
  end: Date;
  days: string[];
};

type MantenimientoListItem = {
  id: number;
  noOrden?: string | null;
  fecha: string;
  vehiculoId: number;
  unidad: string;
  tipoServicio: string;
  nivelServicio: string;
  kilometraje: number;
  estatus: string;
  costoFinal: number;
};

type RecordatorioMantenimientoItem = {
  id: number;
  noOrden?: string | null;
  fecha: string;
  vehiculoId: number;
  unidad: string;
  tipoServicio: string;
  nivelServicio: string;
  kilometraje: number;
  estatus: string;
};

type DocumentoVencimientoItem = {
  id: number;
  vehiculoId: number;
  unidad: string;
  nombre: string;
  tipo?: string | null;
  archivoNombre: string;
  mimeType: string;
  archivoUrl: string;
  notas?: string | null;
  fechaDocumento?: string | null;
  vencimientoPoliza?: string | null;
  activo: boolean;
};

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgApexchartsModule,
    FullCalendarModule,
    CabeceraComponent,
    FooterComponent
  ],
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss',
})
export class InicioComponent implements OnInit {
  @ViewChild('fleetChart') fleetChart!: ChartComponent;
  @ViewChild('inventoryChart') inventoryChart!: ChartComponent;
  @ViewChild('maintenanceChart') maintenanceChart!: ChartComponent;

  private vehiculosService = inject(VehiculosService);
  private entradasService = inject(EntradasInventarioService);
  private salidasService = inject(SalidasInventarioService);
  private mantenimientosService = inject(MantenimientosService);
  private vehiculosDocumentosService = inject(VehiculosDocumentosService);

  totalVehiculos = 0;
  vehiculosDisponibles = 0;
  vehiculosEnUso = 0;
  vehiculosEnTaller = 0;

  calendarCollapsed = false;
  loading = false;

  entradasData: EntradaInventario[] = [];
  salidasData: SalidaInventario[] = [];
  mantenimientosData: MantenimientoListItem[] = [];
  vencimientosDocumentosData: DocumentoVencimientoItem[] = [];

  inventoryWeeks: WeekOption[] = [];
  maintenanceWeeks: WeekOption[] = [];

  selectedWeekKey = '';
  selectedMaintenanceWeekKey = '';

  totalEntradasSemana = 0;
  totalSalidasSemana = 0;
  totalMantenimientoSemana = 0;

  public chartOptions: Partial<FleetChartOptions>;
  public inventoryChartOptions: Partial<InventoryChartOptions>;
  public maintenanceChartOptions: Partial<MaintenanceChartOptions>;

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    locale: esLocale,
    height: 'auto',
    contentHeight: 'auto',
    firstDay: 1,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek'
    },
    buttonText: {
      today: 'Hoy',
      month: 'Mes',
      week: 'Semana'
    },
    views: {
      dayGridMonth: {
        titleFormat: { year: 'numeric', month: 'long' }
      },
      dayGridWeek: {
        titleFormat: { day: '2-digit', month: 'short', year: 'numeric' }
      }
    },
    events: [],
    eventClick: (info) => {
      alert(info.event.title);
    }
  };

  constructor() {
    this.chartOptions = {
      series: [0, 0, 0],
      chart: {
        type: 'radialBar',
        height: 290,
        toolbar: {
          show: false,
        },
      },
      colors: ['#22c55e', '#3b82f6', '#f97316'],
      stroke: {
        lineCap: 'butt',
      },
      plotOptions: {
        radialBar: {
          inverseOrder: false,
          startAngle: 0,
          endAngle: 360,
          hollow: {
            margin: 0,
            size: '32%',
            background: 'transparent',
          },
          track: {
            background: '#1e293b',
            strokeWidth: '100%',
            margin: 6,
          },
          dataLabels: {
            show: false,
          },
        },
      },
      labels: ['Disponible', 'En uso', 'En taller'],
      tooltip: {
        enabled: true,
        theme: 'dark',
        followCursor: true,
        intersect: false,
        shared: false,
        marker: {
          show: false,
        },
        custom: ({ series, seriesIndex, w }) => {
          const label = w.globals.labels[seriesIndex] || '';
          const porcentaje = Number(series[seriesIndex] || 0).toFixed(1);

          return `
            <div style="
              background:#0f172a;
              color:#e2e8f0;
              padding:10px 12px;
              border:1px solid #334155;
              border-radius:10px;
              font-family:Inter, sans-serif;
              font-size:13px;
              box-shadow:0 10px 25px rgba(0,0,0,.35);
              white-space:nowrap;
            ">
              <span style="font-weight:600;">${label}:</span> ${porcentaje}%
            </div>
          `;
        },
      },
      responsive: [
        {
          breakpoint: 640,
          options: {
            chart: {
              height: 260,
            },
          },
        },
      ],
    };

    this.inventoryChartOptions = {
      series: [],
      chart: {
        type: 'area',
        height: 260,
        fontFamily: 'Inter, sans-serif',
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
      },
      colors: ['#22c55e', '#ef4444'],
      stroke: {
        curve: 'smooth',
        width: 4,
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'dark',
          opacityFrom: 0.28,
          opacityTo: 0.03,
          stops: [0, 100],
        },
      },
      dataLabels: {
        enabled: false,
      },
      legend: {
        show: false,
      },
      grid: {
        show: false,
        padding: {
          left: 2,
          right: 2,
          top: 0,
          bottom: 0,
        },
      },
      xaxis: {
        categories: [],
        labels: {
          show: false,
        },
        tooltip: {
          enabled: false,
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        crosshairs: {
          show: false,
        },
      },
      yaxis: {
        show: false,
        labels: {
          formatter: (value: number) => `$${value.toLocaleString('es-MX')}`,
        },
      },
      markers: {
        size: 0,
        hover: {
          size: 6,
          sizeOffset: 2,
        },
      },
      tooltip: {
        enabled: true,
        theme: 'dark',
        shared: true,
        intersect: false,
        x: {
          show: false,
        },
        marker: {
          show: false,
        },
        custom: ({ dataPointIndex }) => {
          const currentWeek = this.getSelectedInventoryWeek();
          const day = currentWeek?.days[dataPointIndex] ?? '';
          const inventorySeries = this.getInventorySeriesForWeek(currentWeek);
          const entrada = inventorySeries.entradas[dataPointIndex] ?? 0;
          const salida = inventorySeries.salidas[dataPointIndex] ?? 0;

          return `
            <div style="
              background:#0f172a;
              color:#e2e8f0;
              padding:12px;
              border:1px solid #334155;
              border-radius:10px;
              font-family:Inter, sans-serif;
              font-size:13px;
              box-shadow:0 10px 25px rgba(0,0,0,.35);
              min-width:170px;
            ">
              <div style="font-weight:700; margin-bottom:8px;">${day}</div>
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                <span style="width:10px; height:10px; border-radius:9999px; background:#22c55e; display:inline-block;"></span>
                <span>Entradas: <strong>$${entrada.toLocaleString('es-MX')}</strong></span>
              </div>
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="width:10px; height:10px; border-radius:9999px; background:#ef4444; display:inline-block;"></span>
                <span>Salidas: <strong>$${salida.toLocaleString('es-MX')}</strong></span>
              </div>
            </div>
          `;
        },
      },
    };

    this.maintenanceChartOptions = {
      series: [],
      chart: {
        type: 'area',
        height: 260,
        fontFamily: 'Inter, sans-serif',
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
      },
      colors: ['#ef4444'],
      stroke: {
        curve: 'smooth',
        width: 5,
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'dark',
          opacityFrom: 0.28,
          opacityTo: 0.03,
          stops: [0, 100],
        },
      },
      dataLabels: {
        enabled: false,
      },
      legend: {
        show: false,
      },
      grid: {
        show: false,
        padding: {
          left: 2,
          right: 2,
          top: 0,
          bottom: 0,
        },
      },
      xaxis: {
        categories: [],
        labels: {
          show: false,
        },
        tooltip: {
          enabled: false,
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        crosshairs: {
          show: false,
        },
      },
      yaxis: {
        show: false,
        labels: {
          formatter: (value: number) => `$${value.toLocaleString('es-MX')}`,
        },
      },
      markers: {
        size: 0,
        hover: {
          size: 6,
          sizeOffset: 2,
        },
      },
      tooltip: {
        enabled: true,
        theme: 'dark',
        shared: false,
        intersect: false,
        x: {
          show: false,
        },
        marker: {
          show: false,
        },
        custom: ({ dataPointIndex }) => {
          const currentWeek = this.getSelectedMaintenanceWeek();
          const day = currentWeek?.days[dataPointIndex] ?? '';
          const gasto = this.getMaintenanceSeriesForWeek(currentWeek)[dataPointIndex] ?? 0;

          return `
            <div style="
              background:#0f172a;
              color:#e2e8f0;
              padding:12px;
              border:1px solid #334155;
              border-radius:10px;
              font-family:Inter, sans-serif;
              font-size:13px;
              box-shadow:0 10px 25px rgba(0,0,0,.35);
              min-width:160px;
            ">
              <div style="font-weight:700; margin-bottom:8px;">${day}</div>
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="width:10px; height:10px; border-radius:9999px; background:#ef4444; display:inline-block;"></span>
                <span>Gasto: <strong>$${gasto.toLocaleString('es-MX')}</strong></span>
              </div>
            </div>
          `;
        },
      },
    };
  }

  ngOnInit(): void {
    this.cargarDashboard();
  }

  toggleCalendar(): void {
    this.calendarCollapsed = !this.calendarCollapsed;
  }

  onWeekChange(weekKey: string): void {
    this.selectedWeekKey = weekKey;
    this.applyInventoryWeek();
  }

  onMaintenanceWeekChange(weekKey: string): void {
    this.selectedMaintenanceWeekKey = weekKey;
    this.applyMaintenanceWeek();
  }

  private cargarDashboard(): void {
    this.loading = true;

    forkJoin({
      vehiculos: this.vehiculosService.getVehiculosActivos().pipe(
        catchError((error) => {
          console.error('Error al cargar vehículos:', error);
          return of([] as Vehiculo[]);
        })
      ),
      entradas: this.entradasService.getEntradas().pipe(
        catchError((error) => {
          console.error('Error al cargar entradas:', error);
          return of([] as EntradaInventario[]);
        })
      ),
      salidas: this.salidasService.getSalidas().pipe(
        catchError((error) => {
          console.error('Error al cargar salidas:', error);
          return of([] as SalidaInventario[]);
        })
      ),
      mantenimientos: this.mantenimientosService.getMantenimientos().pipe(
        catchError((error) => {
          console.error('Error al cargar mantenimientos:', error);
          return of([] as MantenimientoListItem[]);
        })
      ),
      recordatorios: this.mantenimientosService.getRecordatorios().pipe(
        catchError((error) => {
          console.error('Error al cargar recordatorios:', error);
          return of([] as RecordatorioMantenimientoItem[]);
        })
      ),
      vencimientosDocumentos: this.vehiculosDocumentosService.getVencimientosDocumentos().pipe(
        catchError((error) => {
          console.error('Error al cargar vencimientos de documentos:', error);
          return of([] as DocumentoVencimientoItem[]);
        })
      )
    }).subscribe({
      next: ({ vehiculos, entradas, salidas, mantenimientos, recordatorios, vencimientosDocumentos }) => {
        this.entradasData = entradas;
        this.salidasData = salidas;
        this.mantenimientosData = mantenimientos;
        this.vencimientosDocumentosData = vencimientosDocumentos;

        this.aplicarVehiculos(vehiculos);
        this.generarSemanasInventario();
        this.generarSemanasMantenimientos();
        this.applyInventoryWeek();
        this.applyMaintenanceWeek();
        this.aplicarEventosCalendario(mantenimientos, recordatorios, vencimientosDocumentos);
      },
      error: (error) => {
        console.error('Error al cargar dashboard:', error);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  private aplicarVehiculos(vehiculos: Vehiculo[]): void {
    const activos = vehiculos.filter(v => v.activo);

    this.totalVehiculos = activos.length;

    this.vehiculosDisponibles = activos.filter(v =>
      this.normalizarTexto(v.statusInicial) === 'disponible'
    ).length;

    this.vehiculosEnUso = activos.filter(v => {
      const status = this.normalizarTexto(v.statusInicial);
      return status === 'asignado' || status === 'en uso';
    }).length;

    this.vehiculosEnTaller = activos.filter(v =>
      this.normalizarTexto(v.statusInicial) === 'en taller'
    ).length;

    this.chartOptions = {
      ...this.chartOptions,
      series: this.calcularSeries(),
    };
  }

  private aplicarEventosCalendario(
    mantenimientos: MantenimientoListItem[],
    recordatorios: RecordatorioMantenimientoItem[],
    vencimientosDocumentos: DocumentoVencimientoItem[]
  ): void {
    const eventosMantenimiento = mantenimientos.map((item) => ({
      id: `mtto-${item.id}`,
      title: `Mantenimiento · ${item.unidad}`,
      date: this.toDateOnlyString(item.fecha),
      color: this.getMaintenanceEventColor(item.estatus),
      extendedProps: {
        tipoEvento: 'mantenimiento',
        noOrden: item.noOrden,
        unidad: item.unidad,
        tipoServicio: item.tipoServicio,
        nivelServicio: item.nivelServicio,
        kilometraje: item.kilometraje,
        estatus: item.estatus,
        costoFinal: item.costoFinal
      }
    }));

    const eventosRecordatorio = recordatorios.map((item) => ({
      id: `recordatorio-${item.id}`,
      title: `Próximo mantenimiento · ${item.unidad}`,
      date: this.toDateOnlyString(item.fecha),
      color: this.getReminderEventColor(item.estatus),
      extendedProps: {
        tipoEvento: 'recordatorio',
        noOrden: item.noOrden,
        unidad: item.unidad,
        tipoServicio: item.tipoServicio,
        nivelServicio: item.nivelServicio,
        kilometraje: item.kilometraje,
        estatus: item.estatus
      }
    }));

    const eventosDocumentos = vencimientosDocumentos
      .filter((item) => !!item.vencimientoPoliza)
      .map((item) => ({
        id: `doc-${item.id}`,
        title: `Vence ${item.nombre} · ${item.unidad}`,
        date: this.toDateOnlyString(item.vencimientoPoliza!),
        color: this.getDocumentEventColor(item.vencimientoPoliza),
        extendedProps: {
          tipoEvento: 'documento',
          unidad: item.unidad,
          nombreDocumento: item.nombre,
          tipoDocumento: item.tipo,
          archivoNombre: item.archivoNombre,
          vencimientoPoliza: item.vencimientoPoliza
        }
      }));

    this.calendarOptions = {
      ...this.calendarOptions,
      events: [...eventosMantenimiento, ...eventosRecordatorio, ...eventosDocumentos],
      eventClick: (info) => {
        const props = info.event.extendedProps as any;

        if (props?.tipoEvento === 'documento') {
          alert(
            [
              'Vencimiento de documento',
              `Unidad: ${props?.unidad ?? '—'}`,
              `Documento: ${props?.nombreDocumento ?? '—'}`,
              `Tipo: ${props?.tipoDocumento ?? '—'}`,
              `Archivo: ${props?.archivoNombre ?? '—'}`,
              `Vence: ${props?.vencimientoPoliza ? this.toDateOnlyString(props.vencimientoPoliza) : '—'}`
            ].join('\n')
          );
          return;
        }

        const tipoEventoTexto =
          props?.tipoEvento === 'recordatorio'
            ? 'Próximo mantenimiento'
            : 'Mantenimiento';

        alert(
          [
            `${tipoEventoTexto}`,
            `Unidad: ${props?.unidad ?? '—'}`,
            `Servicio: ${props?.tipoServicio ?? '—'}`,
            `Nivel: ${props?.nivelServicio ?? '—'}`,
            `Estatus: ${props?.estatus ?? '—'}`,
            props?.costoFinal != null
              ? `Costo final: $${Number(props.costoFinal).toLocaleString('es-MX')}`
              : null
          ]
            .filter(Boolean)
            .join('\n')
        );
      }
    };
  }

  private generarSemanasInventario(): void {
    const fechas = [
      ...this.entradasData.map(x => this.parseDate(x.fecha)),
      ...this.salidasData.map(x => this.parseDate(x.fecha))
    ].filter((d): d is Date => !!d);

    this.inventoryWeeks = this.buildWeeksFromDates(fechas);
    this.selectedWeekKey = this.inventoryWeeks[0]?.key ?? '';
  }

  private generarSemanasMantenimientos(): void {
    const fechas = this.mantenimientosData
      .map(x => this.parseDate(x.fecha))
      .filter((d): d is Date => !!d);

    this.maintenanceWeeks = this.buildWeeksFromDates(fechas);
    this.selectedMaintenanceWeekKey = this.maintenanceWeeks[0]?.key ?? '';
  }

  private buildWeeksFromDates(dates: Date[]): WeekOption[] {
    if (!dates.length) {
      const currentStart = this.startOfWeek(new Date());
      return [this.buildWeekOption(currentStart)];
    }

    const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime());
    const firstDate = this.startOfWeek(sorted[0]);
    const currentWeekStart = this.startOfWeek(new Date());

    const weeks: WeekOption[] = [];
    let cursor = new Date(firstDate);

    while (cursor.getTime() <= currentWeekStart.getTime()) {
      weeks.push(this.buildWeekOption(cursor));
      cursor = this.addDays(cursor, 7);
    }

    return weeks.sort((a, b) => b.start.getTime() - a.start.getTime());
  }

  private buildWeekOption(weekStart: Date): WeekOption {
    const start = this.startOfDay(weekStart);
    const end = this.endOfDay(this.addDays(start, 6));

    return {
      key: this.formatKey(start),
      label: this.buildWeekLabel(start, end),
      start,
      end,
      days: Array.from({ length: 7 }, (_, index) =>
        this.formatDayLabel(this.addDays(start, index))
      )
    };
  }

  private getSelectedInventoryWeek(): WeekOption {
    return (
      this.inventoryWeeks.find((week) => week.key === this.selectedWeekKey) ??
      this.inventoryWeeks[0] ??
      this.buildWeekOption(this.startOfWeek(new Date()))
    );
  }

  private getSelectedMaintenanceWeek(): WeekOption {
    return (
      this.maintenanceWeeks.find((week) => week.key === this.selectedMaintenanceWeekKey) ??
      this.maintenanceWeeks[0] ??
      this.buildWeekOption(this.startOfWeek(new Date()))
    );
  }

  private applyInventoryWeek(): void {
    const currentWeek = this.getSelectedInventoryWeek();
    const series = this.getInventorySeriesForWeek(currentWeek);

    this.totalEntradasSemana = series.entradas.reduce((acc, value) => acc + value, 0);
    this.totalSalidasSemana = series.salidas.reduce((acc, value) => acc + value, 0);

    this.inventoryChartOptions = {
      ...this.inventoryChartOptions,
      series: [
        {
          name: 'Entradas',
          data: series.entradas,
        },
        {
          name: 'Salidas',
          data: series.salidas,
        },
      ],
      xaxis: {
        ...this.inventoryChartOptions.xaxis,
        categories: currentWeek.days,
        tooltip: {
          enabled: false,
        },
        crosshairs: {
          show: false,
        },
      },
    };
  }

  private applyMaintenanceWeek(): void {
    const currentWeek = this.getSelectedMaintenanceWeek();
    const gastos = this.getMaintenanceSeriesForWeek(currentWeek);

    this.totalMantenimientoSemana = gastos.reduce((acc, value) => acc + value, 0);

    this.maintenanceChartOptions = {
      ...this.maintenanceChartOptions,
      series: [
        {
          name: 'Gasto en mantenimiento',
          data: gastos,
        },
      ],
      xaxis: {
        ...this.maintenanceChartOptions.xaxis,
        categories: currentWeek.days,
        tooltip: {
          enabled: false,
        },
        crosshairs: {
          show: false,
        },
      },
    };
  }

  private getInventorySeriesForWeek(week: WeekOption): { entradas: number[]; salidas: number[] } {
    const entradas = new Array(7).fill(0);
    const salidas = new Array(7).fill(0);

    for (const item of this.entradasData) {
      const fecha = this.parseDate(item.fecha);
      if (!fecha || !this.isDateInWeek(fecha, week)) continue;

      const dayIndex = this.getDayIndexFromMonday(fecha);
      entradas[dayIndex] += Number(item.costoTotal ?? 0);
    }

    for (const item of this.salidasData) {
      const fecha = this.parseDate(item.fecha);
      if (!fecha || !this.isDateInWeek(fecha, week)) continue;

      const dayIndex = this.getDayIndexFromMonday(fecha);
      salidas[dayIndex] += Number(item.costoTotal ?? 0);
    }

    return { entradas, salidas };
  }

  private getMaintenanceSeriesForWeek(week: WeekOption): number[] {
    const gastos = new Array(7).fill(0);

    for (const item of this.mantenimientosData) {
      const fecha = this.parseDate(item.fecha);
      if (!fecha || !this.isDateInWeek(fecha, week)) continue;

      const dayIndex = this.getDayIndexFromMonday(fecha);
      gastos[dayIndex] += Number(item.costoFinal ?? 0);
    }

    return gastos;
  }

  private calcularSeries(): number[] {
    if (!this.totalVehiculos || this.totalVehiculos <= 0) {
      return [0, 0, 0];
    }

    return [
      Number(((this.vehiculosDisponibles / this.totalVehiculos) * 100).toFixed(1)),
      Number(((this.vehiculosEnUso / this.totalVehiculos) * 100).toFixed(1)),
      Number(((this.vehiculosEnTaller / this.totalVehiculos) * 100).toFixed(1)),
    ];
  }

  private parseDate(value: string | Date | null | undefined): Date | null {
    if (!value) return null;

    const date = value instanceof Date ? new Date(value) : new Date(value);
    if (Number.isNaN(date.getTime())) return null;

    return date;
  }

  private isDateInWeek(date: Date, week: WeekOption): boolean {
    const normalized = this.startOfDay(date).getTime();
    return normalized >= week.start.getTime() && normalized <= week.end.getTime();
  }

  private startOfWeek(date: Date): Date {
    const base = this.startOfDay(date);
    const day = base.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    return this.addDays(base, diff);
  }

  private startOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  private endOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  private getDayIndexFromMonday(date: Date): number {
    const day = date.getDay();
    return day === 0 ? 6 : day - 1;
  }

  private formatKey(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private buildWeekLabel(start: Date, end: Date): string {
    const startText = this.formatShortDate(start);
    const endText = this.formatShortDate(end);
    return `Semana · ${startText} - ${endText}`;
  }

  private formatShortDate(date: Date): string {
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: 'short'
    }).format(date);
  }

  private formatDayLabel(date: Date): string {
    const weekday = new Intl.DateTimeFormat('es-MX', {
      weekday: 'short'
    })
      .format(date)
      .replace('.', '');

    const day = new Intl.DateTimeFormat('es-MX', {
      day: '2-digit'
    }).format(date);

    const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
    return `${capitalizedWeekday} ${day}`;
  }

  private toDateOnlyString(value: string | Date): string {
    const date = this.parseDate(value);
    if (!date) return '';

    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private normalizarTexto(valor: string | null | undefined): string {
    return (valor ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
  }

  private getMaintenanceEventColor(estatus: string): string {
    const status = this.normalizarTexto(estatus);

    if (status === 'programado') return '#2563eb';
    if (status === 'en proceso') return '#f97316';
    if (status === 'terminado') return '#22c55e';
    if (status === 'cancelado') return '#ef4444';

    return '#0ea5e9';
  }

  private getReminderEventColor(estatus: string): string {
    const status = this.normalizarTexto(estatus);

    if (status === 'programado') return '#a855f7';
    if (status === 'en proceso') return '#c084fc';
    if (status === 'terminado') return '#8b5cf6';
    if (status === 'cancelado') return '#94a3b8';

    return '#9333ea';
  }

  private getDocumentEventColor(vencimiento: string | null | undefined): string {
    const fecha = this.parseDate(vencimiento);
    if (!fecha) return '#eab308';

    const hoy = this.startOfDay(new Date());
    const fechaEvento = this.startOfDay(fecha);
    const diferenciaMs = fechaEvento.getTime() - hoy.getTime();
    const diferenciaDias = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));

    if (diferenciaDias < 0) return '#ef4444';
    if (diferenciaDias <= 7) return '#f97316';
    return '#eab308';
  }
}