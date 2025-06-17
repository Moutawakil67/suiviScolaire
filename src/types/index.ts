import type { RouteParamsRaw } from 'vue-router';
import type { ApexOptions } from "apexcharts";

export type RouteType = {
    name: string;
    params?: RouteParamsRaw;
    url?: string;
};

export type StatisticType = {
    title: string;
    description?: string;
    statistic: number;
    growth?: number;
    prefix?: string;
    suffix?: string;
    duration?: 'week' | 'month' | 'year';
};


export interface StatisticCardType {
  title: string;
  icon: string;
  prefix?: string;
  suffix?: string;
  key: 'commanditaires' | 'campagnes' | 'chaines' | 'agents'; 
  statistic?: number;
}


export type ApexChartType = {
    height: number;
    type?: string;
    series: any[];
    options: ApexOptions;
};