import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

import { CabeceraComponent } from '../../components/cabecera/cabecera';
import { FooterComponent } from '../../components/footer/footer';

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

type InventoryWeek = {
  key: string;
  label: string;
  days: string[];
  entradas: number[];
  salidas: number[];
};

type MaintenanceWeek = {
  key: string;
  label: string;
  days: string[];
  gastos: number[];
};

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgApexchartsModule,
    CabeceraComponent,
    FooterComponent
  ],
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss',
})
export class InicioComponent {
  @ViewChild('fleetChart') fleetChart!: ChartComponent;
  @ViewChild('inventoryChart') inventoryChart!: ChartComponent;
  @ViewChild('maintenanceChart') maintenanceChart!: ChartComponent;

  totalVehiculos = 120;
  vehiculosDisponibles = 64;
  vehiculosEnUso = 41;
  vehiculosEnTaller = 15;

  public chartOptions: Partial<FleetChartOptions>;
  public inventoryChartOptions: Partial<InventoryChartOptions>;
  public maintenanceChartOptions: Partial<MaintenanceChartOptions>;

  inventoryWeeks: InventoryWeek[] = [
    {
      key: 'semana-1',
      label: 'Semana 1 · 03 Mar - 09 Mar',
      days: ['Lun 03', 'Mar 04', 'Mié 05', 'Jue 06', 'Vie 07', 'Sáb 08', 'Dom 09'],
      entradas: [18000, 14500, 21000, 16500, 24000, 19500, 23000],
      salidas: [12000, 9800, 15600, 11000, 17800, 14900, 17100],
    },
    {
      key: 'semana-2',
      label: 'Semana 2 · 10 Mar - 16 Mar',
      days: ['Lun 10', 'Mar 11', 'Mié 12', 'Jue 13', 'Vie 14', 'Sáb 15', 'Dom 16'],
      entradas: [22000, 17500, 16800, 24000, 21000, 22600, 19800],
      salidas: [13400, 12100, 10900, 16500, 15200, 17100, 14600],
    },
    {
      key: 'semana-3',
      label: 'Semana 3 · 17 Mar - 23 Mar',
      days: ['Lun 17', 'Mar 18', 'Mié 19', 'Jue 20', 'Vie 21', 'Sáb 22', 'Dom 23'],
      entradas: [20500, 19200, 18400, 22800, 25000, 21400, 23700],
      salidas: [11800, 12600, 13200, 14900, 17700, 15900, 16800],
    }
  ];

  maintenanceWeeks: MaintenanceWeek[] = [
    {
      key: 'm-semana-1',
      label: 'Semana 1 · 03 Mar - 09 Mar',
      days: ['Lun 03', 'Mar 04', 'Mié 05', 'Jue 06', 'Vie 07', 'Sáb 08', 'Dom 09'],
      gastos: [14500, 12800, 16200, 15400, 18900, 12100, 17400],
    },
    {
      key: 'm-semana-2',
      label: 'Semana 2 · 10 Mar - 16 Mar',
      days: ['Lun 10', 'Mar 11', 'Mié 12', 'Jue 13', 'Vie 14', 'Sáb 15', 'Dom 16'],
      gastos: [13800, 17100, 14900, 18200, 19600, 15800, 18700],
    },
    {
      key: 'm-semana-3',
      label: 'Semana 3 · 17 Mar - 23 Mar',
      days: ['Lun 17', 'Mar 18', 'Mié 19', 'Jue 20', 'Vie 21', 'Sáb 22', 'Dom 23'],
      gastos: [15200, 14300, 17600, 16800, 20100, 17300, 18900],
    }
  ];

  selectedWeekKey = 'semana-1';
  totalEntradasSemana = 0;
  totalSalidasSemana = 0;

  selectedMaintenanceWeekKey = 'm-semana-1';
  totalMantenimientoSemana = 0;

  constructor() {
    this.chartOptions = {
      series: this.calcularSeries(),
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
          const currentWeek = this.getSelectedWeek();
          const day = currentWeek.days[dataPointIndex] ?? '';
          const entrada = currentWeek.entradas[dataPointIndex] ?? 0;
          const salida = currentWeek.salidas[dataPointIndex] ?? 0;

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
          const day = currentWeek.days[dataPointIndex] ?? '';
          const gasto = currentWeek.gastos[dataPointIndex] ?? 0;

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

    this.applyInventoryWeek();
    this.applyMaintenanceWeek();
  }

  onWeekChange(weekKey: string): void {
    this.selectedWeekKey = weekKey;
    this.applyInventoryWeek();
  }

  onMaintenanceWeekChange(weekKey: string): void {
    this.selectedMaintenanceWeekKey = weekKey;
    this.applyMaintenanceWeek();
  }

  private getSelectedWeek(): InventoryWeek {
    return (
      this.inventoryWeeks.find((week) => week.key === this.selectedWeekKey) ??
      this.inventoryWeeks[0]
    );
  }

  private getSelectedMaintenanceWeek(): MaintenanceWeek {
    return (
      this.maintenanceWeeks.find((week) => week.key === this.selectedMaintenanceWeekKey) ??
      this.maintenanceWeeks[0]
    );
  }

  private applyInventoryWeek(): void {
    const currentWeek = this.getSelectedWeek();

    this.totalEntradasSemana = currentWeek.entradas.reduce((acc, value) => acc + value, 0);
    this.totalSalidasSemana = currentWeek.salidas.reduce((acc, value) => acc + value, 0);

    this.inventoryChartOptions = {
      ...this.inventoryChartOptions,
      series: [
        {
          name: 'Entradas',
          data: currentWeek.entradas,
        },
        {
          name: 'Salidas',
          data: currentWeek.salidas,
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

    this.totalMantenimientoSemana = currentWeek.gastos.reduce((acc, value) => acc + value, 0);

    this.maintenanceChartOptions = {
      ...this.maintenanceChartOptions,
      series: [
        {
          name: 'Gasto en mantenimiento',
          data: currentWeek.gastos,
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
}