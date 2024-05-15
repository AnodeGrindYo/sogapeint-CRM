import { Component, OnInit } from '@angular/core';
import { ApexChart, ApexNonAxisChartSeries, ApexResponsive } from 'ng-apexcharts';
import { ContractService } from '../../../core/services/contract.service';
import { BenefitService } from '../../../core/services/benefit.service';
import * as moment from 'moment';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
};

@Component({
  selector: 'app-donut-card',
  templateUrl: './donut-card.component.html',
  styleUrls: ['./donut-card.component.scss']
})
export class DonutCardComponent implements OnInit {
  public salesAnalytics: Partial<ChartOptions>;
  public benefitsMap: Map<string, string> = new Map();
  public periods: { label: string, value: string }[] = [];
  public selectedPeriod: string;

  constructor(
    private contractService: ContractService,
    private benefitService: BenefitService
  ) {
    this.salesAnalytics = {
      series: [],
      chart: {
        type: 'donut'
      },
      labels: [],
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200
            },
            legend: {
              position: 'bottom'
            }
          }
        }
      ]
    };

    // Initialize periods (last 12 months)
    this.periods = this.generatePeriods();
    this.selectedPeriod = this.periods[0].value; // Default to the current month
  }

  ngOnInit(): void {
    this.loadBenefits();
  }

  generatePeriods(): { label: string, value: string }[] {
    const periods = [];
    for (let i = 0; i < 12; i++) {
      const date = moment().subtract(i, 'months');
      periods.push({ label: date.format('MMM YYYY'), value: date.format('YYYY-MM') });
    }
    return periods;
  }

  loadBenefits(): void {
    this.benefitService.getBenefits().subscribe(benefits => {
      benefits.forEach(benefit => {
        this.benefitsMap.set(benefit._id, benefit.name);
      });
      this.loadContracts();
    });
  }

  loadContracts(): void {
    this.contractService.getContracts().subscribe(contracts => {
      const filteredContracts = contracts.filter(contract =>
        moment(contract.date_cde).format('YYYY-MM') === this.selectedPeriod
      );

      const benefitCounts = new Map<string, number>();

      filteredContracts.forEach(contract => {
        const benefitId = contract.benefit;
        if (benefitCounts.has(benefitId)) {
          benefitCounts.set(benefitId, benefitCounts.get(benefitId)! + 1);
        } else {
          benefitCounts.set(benefitId, 1);
        }
      });

      const series: number[] = [];
      const labels: string[] = [];

      benefitCounts.forEach((count, benefitId) => {
        const benefitName = this.benefitsMap.get(benefitId);
        if (benefitName) {
          series.push(count);
          labels.push(benefitName);
        }
      });

      this.salesAnalytics.series = series;
      this.salesAnalytics.labels = labels;
    });
  }

  onPeriodChange(event: any): void {
    this.selectedPeriod = event.target.value;
    this.loadContracts();
  }

  getLabelColor(index: number): string {
    const colors = ['text-primary', 'text-success', 'text-warning'];
    return colors[index % colors.length];
  }
}
