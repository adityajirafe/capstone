export enum InitiationMethod {'none', 'auto', 'manual'}

export type FileUploadStatus = "Completed" | "In Progress" | "Failed" | null

export interface Metric {
    category: string;
    sasb_indicator: string;
    indicator_name: string;
    subcategory: string;
    year: string;
    value: string;
    unit: string;
    company_name: string;
}

export type CustomFormData = {
  [category: string]: {
    [year: string]: Metric[];
  };
};

export type Step = {
    title: string;
    description: string;
}