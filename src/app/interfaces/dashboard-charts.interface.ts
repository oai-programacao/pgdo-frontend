export interface DashboardCharts {
  actualMonthValue: number;
  previousMonthValue: number;
  serviceOrderType: any;
  differenceBetweenMonths: number;
  differencePercentage: string;
  trendDirection: string;
}

export interface TechnicianServiceCount {
  serviceOrderCount: number;
  technicianName: string;
}

export interface DashboardSummary {
  osTypes: {
    items: {
      category: string;
      count: number;
    }[];
    total: number;
  };
  demandingAreas: {
    items: {
      category: string;
      count: number;
    }[];
    total: number;
  };
  cities: {
    items: {
      category: string;
      count: number;
    }[];
    total: number;
  };
  technologies: {
    items: {
      category: string;
      count: number;
    }[];
    total: number;
  };
}


export interface TechnicianServiceCount {
  technicianCounts: {
    technicianName: string;
    serviceOrderCount: number;
  }[];
  grandTotal: number;
}

export interface ServiceOrderTypeData {
  actualMonthValue: number;
  previousMonthValue: number;
  serviceOrderType: string;
  differenceBetweenMonths: number;
  differencePercentage: string;
  trendDirection: "up" | "down" | "neutral";
}