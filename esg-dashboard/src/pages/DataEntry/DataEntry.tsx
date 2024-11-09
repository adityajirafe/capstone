import './DataEntry.css'
import { useEffect, useState } from "react";
import Stepper from '../../components/Stepper';
import Initiation from './Initiation';
import DataEntryButtons from '../../components/DataEntryButtons';
import Scraper from './Scraper';
import { CustomFormData, FileUploadStatus, InitiationMethod, Metric, Step } from '../../constants/types';

import METRICS from '../../constants/metrics.json'
import { useSupabase } from '../../hooks/useSupabase';
import YearSelect from './YearSelect';
import GenericForm from './GenericForm';

const DEFAULT_STEPS = [
    { title: "Start", description: "Choose Automatic or Manual Entry" },
    { title: "Upload", description: "Upload Sustainability Report" },
    { title: "Select Years", description: "Pick applicable years" },
];

const DataEntry = () => {
//   const toast = useToast();
  const { supabase } = useSupabase();
  const [step, setStep] = useState(0);
  const [steps, setSteps] = useState<Step []>(DEFAULT_STEPS);

  // initiation
  const [inputMethod, setInputMethod] = useState<InitiationMethod>(0)

  // scraper
  const storedTaskID = localStorage.getItem('taskIDScraped') ?? '1730621513033' // TODO REMOVE
  const storedFileName = localStorage.getItem('filenameScraped') ?? "Test" // TODO REMOVE
  const [companyName, setCompanyName] = useState<string | null>(storedFileName);
  const [taskID, setTaskID] = useState<string | null>(storedTaskID);
  const [scraperStatus, setScraperStatus] = useState<FileUploadStatus>("In Progress");

  const [formData, setFormData] = useState<CustomFormData>({});
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  
  const [metricsData, setMetricsData] = useState<Metric[]>([]);
//   const [loading, setLoading] = useState(true);

  useEffect(() => {
    const newSteps = [...DEFAULT_STEPS]; // Create a fresh copy of DEFAULT_STEPS
    for (const metricGroup in METRICS) {
      newSteps.push({ title: metricGroup, description: "TEST" });
    }
    setSteps(newSteps); // Set the steps state once
    if (!taskID) return

    // fetch from supabase
    const fetchMetrics = async () => {
        console.log("FETCHING SUPABASE FOR TASK ID:", taskID);
        try {
          const { data: metricsData, error } = await supabase
            .from("output_raw")
            .select("category, sasb_indicator, indicator_name, subcategory, year, value, unit, company_name")
            .eq("task_id", taskID)
  
          if (error) {
            throw error;
          }
          console.log("Metrics data:", metricsData)
          setMetricsData(metricsData || []);
          const uniqueYears = Array.from(new Set(metricsData.map((metric: Metric) => metric.year)));
          setSelectedYears(uniqueYears); // Set the unique years in the state
          console.log("Years found in data:", uniqueYears);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          console.error("Error fetching data from Supabase:", error.message);
        }
    };
    fetchMetrics()
  }, [supabase, taskID]); // Empty dependency array ensures this runs only once

  useEffect(() => {
    if (step < 3 || selectedYears.length === 0) return;
    if (!companyName) return
  
    const initialFormData: CustomFormData = {};
  
    for (const category in METRICS) {
      if (!Object.prototype.hasOwnProperty.call(METRICS, category)) continue;
  
      const metricsArray = METRICS[category as keyof typeof METRICS]; // Type assertion
  
      // Iterate over `selectedYears` to create the structure
      selectedYears.forEach((year) => {
        if (!initialFormData[category]) {
          initialFormData[category] = {};
        }
        if (!initialFormData[category][year]) {
          initialFormData[category][year] = [];
        }
  
        // Populate the year array with the metric objects and add the `year` field
        initialFormData[category][year] = metricsArray.map((metric) => ({
            ...metric,
            year: year, // Add the year field here
            value: '',
            company_name: companyName
          }));
      });
    }
    console.log("BEFORE MAPPING:", initialFormData);

    // Map `metricsData` to `initialFormData`
    metricsData.forEach((metric: Metric) => {
        const { category, year, subcategory, value } = metric;
    
        if (initialFormData[category] && initialFormData[category][year]) {
          // Find the object in the array with the matching `indicator_name`
          const targetMetric = initialFormData[category][year].find(
            (item) => item.subcategory === subcategory
          );
    
          if (targetMetric) {
            targetMetric.value = value; // Set the value from `metricsData`
          }
        }
    });
    setFormData(initialFormData);
    console.log(initialFormData);
  }, [step, selectedYears, companyName, metricsData]);

  const handleNextStep = () => setStep((prev) => prev + 1)

  const handlePrevStep = () => setStep((prev) => prev - 1)

  const handleSubmit = () => {
    const output: Metric[] = [];
    console.log("Handle submit runs");
    // Iterate through the categories in formData
    for (const category in formData) {
        // Iterate through the years for each category
        for (const year in formData[category]) {
            // Iterate through the array of metrics for each year
            formData[category][year].forEach(metric => {
              // Check if the value is not null or empty
                if (metric.value !== null && metric.value !== "") {
                    // Add the object to the output array
                    output.push(metric);
                }
            });
        }
    }
    console.log("SUBMITTING...");

    // fean: u can use output for array of objects
    console.log(output);

    // formattedOutput is an array of arrays with the following order in the nested list:
    // index, category, sasb_indicator, indicator_name, unit, subcategory, year, value
    const formattedOutput = output.map((metric, index) => [
        index, // Serial number starting from 0
        metric.category, // Category
        metric.sasb_indicator, // SASB Indicator
        metric.indicator_name, // Indicator Name
        metric.unit, // Unit
        metric.subcategory, // Subcategory
        metric.year, // Year
        metric.value // Value
    ]);
    
    // fean: u can use formattedOutput for array of arrays
    console.log("Formatted Output:", formattedOutput);

    //fean's code from here onwards
    //to map to desired units
    const target_dict = new Map([
      [['EM-MM-110a.1'.toUpperCase(), 'Total gross global scope 1 emissions (CO2)'.toUpperCase() ].toString(),'Tonnes'],
      [['EM-MM-110a.1'.toUpperCase(), 'Total percentage of gross global scope 1 emissions under emissions-limiting regulations'.toUpperCase() ].toString(),'%'],
      [['EM-MM-120a.1'.toUpperCase(), 'Total CO emissions'.toUpperCase() ].toString(),'Tonnes'],
      [['EM-MM-120a.1'.toUpperCase(), 'Total NOx emissions'.toUpperCase() ].toString(),'Tonnes'],
      [['EM-MM-120a.1'.toUpperCase(), 'Total SOx emissions'.toUpperCase() ].toString(),'Tonnes'],
      [['EM-MM-120a.1'.toUpperCase(), 'Total PM10 emissions'.toUpperCase() ].toString(),'Tonnes'],
      [['EM-MM-120a.1'.toUpperCase(), 'Total mercury (Hg) emissions'.toUpperCase() ].toString(),'Tonnes'],
      [['EM-MM-120a.1'.toUpperCase(), 'Total lead (Pb) emissions'.toUpperCase() ].toString(),'Tonnes'],
      [['EM-MM-120a.1'.toUpperCase(), 'Total volatile organic compounds (VOCs) emissions'.toUpperCase() ].toString(),'Tonnes'],
      [['EM-MM-130a.1'.toUpperCase(), 'Total energy consumed'.toUpperCase() ].toString(),'Gigajoules (GJ)'],
      [['EM-MM-130a.1'.toUpperCase(), 'Percentage energy consumed from grid electricity'.toUpperCase() ].toString(),'%'],
      [['EM-MM-130a.1'.toUpperCase(), 'Percentage energy consumed from renewable electricity'.toUpperCase() ].toString(),'%'],
      [['EM-MM-140a.1'.toUpperCase(), 'Total water withdrawn'.toUpperCase() ].toString(),'Cubic meters (m³)'],
      [['EM-MM-140a.1'.toUpperCase(), 'Total water consumed'.toUpperCase() ].toString(),'Cubic meters (m³)'],
      [['EM-MM-140a.1'.toUpperCase(), 'Total water withdrawn in high or extremely high baseline water stress areas'.toUpperCase() ].toString(),'Cubic meters (m³)'],
      [['EM-MM-140a.1'.toUpperCase(), 'Total water consumed in high or extremely high baseline water stress areas'.toUpperCase() ].toString(),'Cubic meters (m³)'],
      [['EM-MM-140a.1'.toUpperCase(), 'Percentage of water withdrawn in high or extremely high baseline water stress areas against total freshwater withdrawn'.toUpperCase() ].toString(),'%'],
      [['EM-MM-140a.1'.toUpperCase(), 'Percentage of water consumed in high or extremely high baseline water stress areas against total freshwater consumed'.toUpperCase() ].toString(),'%'],
      [['EM-MM-140a.2'.toUpperCase(), 'Number of incidents of non-compliance associated with water quality permits, standards, and regulations'.toUpperCase() ].toString(),'Count'],
      [['EM-MM-150a.4'.toUpperCase(), 'Total weight of non-mineral waste generated'.toUpperCase() ].toString(),'Tonnes'],
      [['EM-MM-150a.5'.toUpperCase(), 'Total weight of tailings produced'.toUpperCase() ].toString(),'Tonnes'],
      [['EM-MM-150a.6'.toUpperCase(), 'Total weight of waste rock generated'.toUpperCase() ].toString(),'Tonnes'],
      [['EM-MM-150a.7'.toUpperCase(), 'Total weight of hazardous waste generated'.toUpperCase() ].toString(),'Tonnes'],
      [['EM-MM-150a.8'.toUpperCase(), 'Total weight of hazardous waste recycled'.toUpperCase() ].toString(),'Tonnes'],
      [['EM-MM-150a.9'.toUpperCase(), 'Number of significant incidents associated with hazardous materials and waste management'.toUpperCase() ].toString(),'Count'],
      [['EM-MM-160a.2'.toUpperCase(), 'Percentage of total mine sites where acid rock drainage is predicted to occur'.toUpperCase() ].toString(),'%'],
      [['EM-MM-160a.2'.toUpperCase(), 'Percentage of total mine sites where acid rock drainage is actively mitigated'.toUpperCase() ].toString(),'%'],
      [['EM-MM-160a.2'.toUpperCase(), 'Percentage of total mine sites where acid rock drainage is under treatment or remediation'.toUpperCase() ].toString(),'%'],
      [['EM-MM-160a.3'.toUpperCase(), 'Percentage of total area of proved reserves in or near sites with protected conservation status or endangered species habitat'.toUpperCase() ].toString(),'%'],
      [['EM-MM-160a.3'.toUpperCase(), 'Percentage of total area of probable reserves in or near sites with protected conservation status or endangered species habitat'.toUpperCase() ].toString(),'%'],
      [['EM-MM-210a.1'.toUpperCase(), 'Percentage of total area of proved reserves in or near areas of conflict'.toUpperCase() ].toString(),'%'],
      [['EM-MM-210a.1'.toUpperCase(), 'Percentage of total area of probable reserves in or near areas of conflict'.toUpperCase() ].toString(),'%'],
      [['EM-MM-210a.2'.toUpperCase(), 'Percentage of total area of proved reserves in or near indigenous land'.toUpperCase() ].toString(),'%'],
      [['EM-MM-210a.2'.toUpperCase(), 'Percentage of total area of probable reserves in or near indigenous land'.toUpperCase() ].toString(),'%'],
      [['EM-MM-210b.2'.toUpperCase(), 'Number of non-technical delays'.toUpperCase() ].toString(),'Count'],
      [['EM-MM-210b.2'.toUpperCase(), 'Duration of non-technical delays'.toUpperCase() ].toString(),'Days'],
      [['EM-MM-310a.1'.toUpperCase(), 'Percentage of active workforce employed under collective agreement'.toUpperCase() ].toString(),'%'],
      [['EM-MM-310a.2'.toUpperCase(), 'Number of strikes and lockouts'.toUpperCase() ].toString(),'Count'],
      [['EM-MM-310a.2'.toUpperCase(), 'Duration of strikes and lockouts'.toUpperCase() ].toString(),'Days'],
      [['EM-MM-320a.1'.toUpperCase(), 'Total number of MSHA incidents'.toUpperCase() ].toString(),'Count'],
      [['EM-MM-320a.1'.toUpperCase(), 'Total MSHA all-incidents rate'.toUpperCase() ].toString(),'Rate (per million hours worked)'],
      [['EM-MM-320a.1'.toUpperCase(), 'Number of Fatalities'.toUpperCase() ].toString(),'Count'],
      [['EM-MM-320a.1'.toUpperCase(), 'Total fatality rate'.toUpperCase() ].toString(),'Rate (per million hours worked)'],
      [['EM-MM-320a.1'.toUpperCase(), 'Total near-miss frequency rate (NMFR)'.toUpperCase() ].toString(),'Rate (per million hours worked)'],
      [['EM-MM-320a.1'.toUpperCase(), 'Average hours of health, safety, and emergency response training for full-time employees'.toUpperCase() ].toString(),'Hours'],
      [['EM-MM-320a.1'.toUpperCase(), 'Average hours of health, safety, and emergency response training for contract employees'.toUpperCase() ].toString(),'Hours'],
      [['EM-MM-510a.2'.toUpperCase(), "Production in countries with the 20 lowest rankings in Transparency International's Corruption Perception Index".toUpperCase() ].toString(),'Tonnes'],
      [['EM-MM-000.A'.toUpperCase(), 'Production of metal ores'.toUpperCase() ].toString(),'Tonnes'],
      [['EM-MM-000.A'.toUpperCase(), 'Production of finished metal products'.toUpperCase() ].toString(),'Tonnes'],
      [['EM-MM-000.B'.toUpperCase(), 'Total number of employees'.toUpperCase() ].toString(),'Count'],
      [['EM-MM-000.B'.toUpperCase(), 'Total number of contractors'.toUpperCase() ].toString(),'Count'],
      [['EM-MM-000.B'.toUpperCase(), 'Percentage of employees who are contractors'.toUpperCase() ].toString(),'%'],
      [['Revenue'.toUpperCase(), 'Revenue'.toUpperCase() ].toString(),'USD'],
  ]);
  
  //stores the conversion as a tuple (original, transformed), maps to the conversion required
  const conversion_dict = new Map([
      [['sites', 'Count'].toString(),x => x],
      [['tonnes', 'Tonnes'].toString(),x => x],
      [['employees', 'Count'].toString(),x => x],
      [['percent', '%'].toString(),x => x],
      [['t', 'Tonnes'].toString(),x => x],
      [['units', 'Count'].toString(),x => x],
      [['number', 'Rate (per million hours worked)'].toString(),x => null],//number cannot be converted to Rate since we don't have million hours worked data
      [['MtCO2-e', 'Tonnes'].toString(),x => x * 1000000],//million tones to tonnes
      [['Rate', 'Rate (per million hours worked)'].toString(),x => x],//assume correct
      [['m3', 'Cubic meters (m³)'].toString(),x => x],
      [['megalitres', 'Cubic meters (m³)'].toString(),x => x * 1000],
      [['GL', 'Cubic meters (m³)'].toString(),x => x * 1000000],
      [['oz', 'Tonnes'].toString(),x => x / 35273.96],
      [['Thousand cubic meters', 'Cubic meters (m³)'].toString(),x => x * 1000],
      [['tCO2e', 'Tonnes'].toString(),x => x],
      [['Mt CO2e', 'Tonnes'].toString(),x => x * 1000000],//million tones to tonnes
      [['thousand TJ', 'Gigajoules (GJ)'].toString(),x => x * 1000000],//thousand terajoules to gigajoules
      [['Terajoules (TJ)', 'Gigajoules (GJ)'].toString(),x => x * 1000],//terajoules to gigajoules
      [['Rate (per 200000 hours worked)', 'Rate (per million hours worked)'].toString(),x => x * 5],//per 200000 hours to per million hours
      [['thousand tonnes', 'Tonnes'].toString(),x => x * 1000],
      [['hours', 'Hours'].toString(),x => x],
      [['months', 'Days'].toString(),x => x * 30],//one month = 30days
      [['incident', 'Count'].toString(),x => x],
      [['Petajoules', 'Gigajoules (GJ)'].toString(),x => x * 1000000],//petajoules to gigajoules
      [['Megalitres', 'Cubic meters (m³)'].toString(),x => x * 1000],
      //[['ug/m3', 'Tonnes'].toString(),x =>],
      [['Kilotonnes', 'Tonnes'].toString(),x => x * 1000],
      [['Thousand Tonnes', 'Tonnes'].toString(),x => x * 1000],
      [['MWh', 'Gigajoules (GJ)'].toString(),x => x * 3.6],//1 mwh = 3.6 GJ
      [['tonnes CO2E', 'Tonnes'].toString(),x => x],
      [['GJ', 'Gigajoules (GJ)'].toString(),x => x],
      [['%', 'Gigajoules (GJ)'].toString(),x => null],
      [['kWh', 'Gigajoules (GJ)'].toString(),x => 0.0036 * x],
      [['mÂ³', 'Cubic meters (m³)'].toString(),x => x],
      [['incidents', 'Count'].toString(),x => x],
      [['percentage', '%'].toString(),x => x],
      [['%', 'Hectares (Ha)'].toString(),x => null],//cannot convert percentage to hectares
      [['days', 'Days'].toString(),x => x],
      [['fatalities', 'Count'].toString(),x => x],
      [['fatalities', 'Rate (per million hours worked)'].toString(),x => null],//cannot convert fatalities to rate
      [['contractors', 'Count'].toString(),x => x],
      [['number', 'Count'].toString(),x => x],
      [['Cubic meters (mÂ³)', 'Cubic meters (m³)'].toString(),x => x],
      [['million metric tons', 'Tonnes'].toString(),x => x * 1000000],
      [['ha', 'Hectares (Ha)'].toString(),x => x],
      [['%', 'Tonnes'].toString(),x => null],//cannot convert percentage to Tonne
      [['kTonnes', 'Tonnes'].toString(),x => x * 1000],
      [['000m3', 'Cubic meters (m³)'].toString(),x => x * 1000],
      [['Rate', 'Tonnes'].toString(),x => null],//cannot convert rate to Tonnes
      [['Mt', 'Tonnes'].toString(),x => x * 1000000],
      [['Number', 'Count'].toString(),x => x],
      [['Number (units)', 'Count'].toString(),x => x],
      [['Ha', 'Hectares (Ha)'].toString(),x => x],
      [['million GJ', 'Gigajoules (GJ)'].toString(),x => x * 1000000],
      [['strikes and lockouts', 'Count'].toString(),x => x],
      [['Number (units)', '%'].toString(),x => null],//cannnot convert count to percentage
      [['ML/yr', 'Cubic meters (m³)'].toString(),x => x * 1000],
      [['ML', 'Cubic meters (m³)'].toString(),x => x * 1000],
      [['million mÂ³', 'Cubic meters (m³)'].toString(),x => x * 1000000],
      [['Megatonnes', 'Tonnes'].toString(),x => x * 1000000],
      [['thousands of cubic meters', 'Cubic meters (m³)'].toString(),x => x * 1000],
      [['Percentage', '%'].toString(),x => x],
      [['metric tonnes', 'Tonnes'].toString(),x => x],
      [['million tCO2e', 'Tonnes'].toString(),x => x * 1000000],
      [['PJ', 'Gigajoules (GJ)'].toString(),x => x * 1000000],
      [['per million hours worked', 'Rate (per million hours worked)'].toString(),x => x],
      [['kt', 'Tonnes'].toString(),x => x * 1000],
      [['gigajoules', 'Gigajoules (GJ)'].toString(),x => x],
      [['Giga Joule', 'Gigajoules (GJ)'].toString(),x => x],
      [['per 200,000 hours worked', 'Rate (per million hours worked)'].toString(),x => x * 5],
      [['thousand m3', 'Cubic meters (m³)'].toString(),x => x * 1000],
      [['days', 'Count'].toString(),x => x],
      [['day', 'Days'].toString(),x => x],
      [['metric tonnes of CO2 equivalents', 'Tonnes'].toString(),x => x],
      [['per 200,000 hours worked (contractors)', 'Rate (per million hours worked)'].toString(),x => x * 5],
      [['per 200,000 hours worked (employees)', 'Rate (per million hours worked)'].toString(),x => x * 5],
      [['Thousands of cubic meters', 'Cubic meters (m³)'].toString(),x => x * 1000],
      [['millions of tCO2e', 'Tonnes'].toString(),x => x * 1000000],
      [['thousand metric tons', 'Tonnes'].toString(),x => x * 1000],
      [['kilotonnes', 'Tonnes'].toString(),x => x * 1000],
      [['month', 'Count'].toString(),x => null],//cannot convert month to count
      [['kg', 'Tonnes'].toString(),x => x * 0.001],
      [['%', 'Count'].toString(),x => null],//cannot convert percentage to count,
      [['percent', 'Count'].toString(),x => null],
      [['metric tonnes (t)', 'Tonnes'].toString(),x => x],
      [['thousand cubic metres', 'Cubic meters (m³)'].toString(), x => x * 1000],
      [['Cubic meters (m3)', 'Cubic meters (m³)'].toString(), x => x],
      [['KT', 'Tonnes'].toString(),x => x * 1000],
      [['tonnes CO2e', 'Tonnes'].toString(),x => x],
      [['Million tonnes', 'Tonnes'].toString(),x => x * 1000000],
      [['Million gigajoules', 'Gigajoules (GJ)'].toString(),x => x * 1000000],
      [['Million Tonnes', 'Tonnes'].toString(),x => x * 1000000],
      [['mTonnes', 'Tonnes'].toString(),x => x * 1000000],
      [['million Cubic meters (mÂ³)', 'Cubic meters (m³)'].toString(),x => x * 1000000],
      [['Petajoules (PJ)', 'Gigajoules (GJ)'].toString(),x => x * 1000000],
      [['000 tonnes', 'Tonnes'].toString(),x => x * 1000],
      [['CLAs signed', '%'].toString(),x => null],//cannot use count as percentage
      [['million tonnes', 'Tonnes'].toString(),x => x * 1000000],
      [['Million Cubic meters (mÂ³)', 'Cubic meters (m³)'].toString(),x => x * 1000000],
      [['tonnes CO2Eq', 'Tonnes'].toString(),x => x],
      [['day', 'Count'].toString(),x => null],//days cannot be count. Different metric
      [['count', 'Count'].toString(),x => x],
      [['frequency rate', 'Count'].toString(),x => x],
      [['thousand ounces', 'Tonnes'].toString(),x => x / 35.27396],
      [['CuEq KiloTonnes', 'Tonnes'].toString(),x => x * 1000],
      [['million m³', 'Cubic meters (m³)'].toString(), x => x * 1000000],
      [['m³', 'Cubic meters (m³)'].toString(),x => x],
      [['million Cubic meters (m³)', 'Cubic meters (m³)'].toString(), x => x * 1000000],
      [['terajoules', 'Gigajoules (GJ)'].toString(), x => x * 1000],
      [['Million Cubic meters (m³)', 'Cubic meters (m³)'].toString(), x => x * 1000000],
      [['thousand metric tonnes', 'Tonnes'].toString(),x => x * 1000],
      [['$', 'USD'].toString(),x => x * 1000],
  ]);
  
  //map to minMax values for standardization
  const minMax = new Map([
      [['EM-MM-000.A'.toUpperCase(), 'Production of finished metal products'.toUpperCase(),'Manpower'.toUpperCase()].toString(), [0.003949576, 1767.081791]],
      [['EM-MM-000.A'.toUpperCase(), 'Production of finished metal products'.toUpperCase(),'None'.toUpperCase()].toString(), [14.34485949, 23000000]],
      [['EM-MM-000.A'.toUpperCase(), 'Production of finished metal products'.toUpperCase(),'Revenue'.toUpperCase()].toString(), [0.0000000145323265060133, 0.002418881]],
      [['EM-MM-000.A'.toUpperCase(), 'Production of metal ores'.toUpperCase(),'Manpower'.toUpperCase()].toString(), [0.003949576, 26091.60544]],
      [['EM-MM-000.A'.toUpperCase(), 'Production of metal ores'.toUpperCase(),'None'.toUpperCase()].toString(), [14.34485949, 166908000]],
      [['EM-MM-000.A'.toUpperCase(), 'Production of metal ores'.toUpperCase(),'Revenue'.toUpperCase()].toString(), [0.0000000145323265060133, 0.054813818]],
      [['EM-MM-000.B'.toUpperCase(), 'Percentage of employees who are contractors'.toUpperCase(),'Manpower'.toUpperCase()].toString(), [3, 80]],
      [['EM-MM-000.B'.toUpperCase(), 'Percentage of employees who are contractors'.toUpperCase(),'None'.toUpperCase()].toString(), [3, 80]],
      [['EM-MM-000.B'.toUpperCase(), 'Percentage of employees who are contractors'.toUpperCase(),'Revenue'.toUpperCase()].toString(), [3, 80]],
      [['EM-MM-000.B'.toUpperCase(), 'Total number of contractors'.toUpperCase(),'Manpower'.toUpperCase()].toString(), [0.006103764, 3.980910176]],
      [['EM-MM-000.B'.toUpperCase(), 'Total number of contractors'.toUpperCase(),'None'.toUpperCase()].toString(), [6, 188314]],
      [['EM-MM-000.B'.toUpperCase(), 'Total number of contractors'.toUpperCase(),'Revenue'.toUpperCase()].toString(), [0.00000000410732157452803, 0.0000071406551336]],
      [['EM-MM-000.B'.toUpperCase(), 'Total number of employees'.toUpperCase(),'Manpower'.toUpperCase()].toString(), [532, 188314]],
      [['EM-MM-000.B'.toUpperCase(), 'Total number of employees'.toUpperCase(),'None'.toUpperCase()].toString(), [532, 188314]],
      [['EM-MM-000.B'.toUpperCase(), 'Total number of employees'.toUpperCase(),'Revenue'.toUpperCase()].toString(), [532, 188314]],
      [['EM-MM-110a.1'.toUpperCase(), 'Total gross global scope 1 emissions (CO2)'.toUpperCase(),'Manpower'.toUpperCase()].toString(), [20.90083632, 171367.3688]],
      [['EM-MM-110a.1'.toUpperCase(), 'Total gross global scope 1 emissions (CO2)'.toUpperCase(),'None'.toUpperCase()].toString(), [17494, 965000000]],
      [['EM-MM-110a.1'.toUpperCase(), 'Total gross global scope 1 emissions (CO2)'.toUpperCase(),'Revenue'.toUpperCase()].toString(), [0.0000420576421751, 0.298826204]],
      [['EM-MM-110a.1'.toUpperCase(), 'Total percentage of gross global scope 1 emissions under emissions-limiting regulations'.toUpperCase(),'Manpower'.toUpperCase()].toString(), [11, 100]],
      [['EM-MM-110a.1'.toUpperCase(), 'Total percentage of gross global scope 1 emissions under emissions-limiting regulations'.toUpperCase(),'None'.toUpperCase()].toString(), [11, 100]],
      [['EM-MM-110a.1'.toUpperCase(), 'Total percentage of gross global scope 1 emissions under emissions-limiting regulations'.toUpperCase(),'Revenue'.toUpperCase()].toString(), [11, 100]],
      [['EM-MM-120a.1'.toUpperCase(), 'Total CO emissions'.toUpperCase(),'Manpower'.toUpperCase()].toString(), [0.0000712047849615, 3705.690185]],
      [['EM-MM-120a.1'.toUpperCase(), 'Total CO emissions'.toUpperCase(),'None'.toUpperCase()].toString(), [1, 228000000]],
      [['EM-MM-120a.1'.toUpperCase(), 'Total CO emissions'.toUpperCase(),'Revenue'.toUpperCase()].toString(), [5.22870349068245E-11, 0.004479899]],
      [['EM-MM-120a.1'.toUpperCase(), 'Total NOx emissions'.toUpperCase(),'Manpower'.toUpperCase()].toString(), [0.00014241, 1167.921256]],
      [['EM-MM-120a.1'.toUpperCase(), 'Total NOx emissions'.toUpperCase(),'None'.toUpperCase()].toString(), [2, 5459674]],
      [['EM-MM-120a.1'.toUpperCase(), 'Total NOx emissions'.toUpperCase(),'Revenue'.toUpperCase()].toString(), [0.000000000104574069813649, 0.004297325]],
      [['EM-MM-120a.1'.toUpperCase(), 'Total PM10 emissions'.toUpperCase(),'Manpower'.toUpperCase()].toString(), [0.000213614, 4.461918892]],
      [['EM-MM-120a.1'.toUpperCase(), 'Total PM10 emissions'.toUpperCase(),'None'.toUpperCase()].toString(), [3, 146000]],
      [['EM-MM-120a.1'.toUpperCase(), 'Total PM10 emissions'.toUpperCase(),'Revenue'.toUpperCase()].toString(), [0.000000000219040456772366, 0.0000037379874609]],
      [['EM-MM-120a.1'.toUpperCase(), 'Total SOx emissions'.toUpperCase(),'Manpower'.toUpperCase()].toString(), [0.0000594212371501, 26.42459105]],
      [['EM-MM-120a.1'.toUpperCase(), 'Total SOx emissions'.toUpperCase(),'None'.toUpperCase()].toString(), [2, 1911000]],
      [['EM-MM-120a.1'.toUpperCase(), 'Total SOx emissions'.toUpperCase(),'Revenue'.toUpperCase()].toString(), [0.000000000262524611682345, 0.000127596]],
      [['EM-MM-120a.1'.toUpperCase(), 'Total lead (Pb) emissions'.toUpperCase(),'Manpower'.toUpperCase()].toString(), [0.0000368161401958, 0.0000368161401958]],
      [['EM-MM-120a.1'.toUpperCase(), 'Total lead (Pb) emissions'.toUpperCase(),'None'.toUpperCase()].toString(), [1, 1]],
      [['EM-MM-120a.1'.toUpperCase(), 'Total lead (Pb) emissions'.toUpperCase(),'Revenue'.toUpperCase()].toString(), [4.37541019470574E-11, 4.37541019470574E-11]],
      [['EM-MM-120a.1'.toUpperCase(), 'Total volatile organic compounds (VOCs) emissions'.toUpperCase(),'Manpower'.toUpperCase()].toString(), [0.000011013215859, 0.14541922]],
      [['EM-MM-120a.1'.toUpperCase(), 'Total volatile organic compounds (VOCs) emissions'.toUpperCase(),'None'.toUpperCase()].toString(), [0.04, 2000]],
      [['EM-MM-120a.1'.toUpperCase(), 'Total volatile organic compounds (VOCs) emissions'.toUpperCase(),'Revenue'.toUpperCase()].toString(), [4.05227433897274E-11, 0.000000310971012579784]],
      [['EM-MM-130a.1'.toUpperCase(), 'Percentage energy consumed from grid electricity'.toUpperCase(),'Manpower'.toUpperCase()].toString(), [8, 90]],
      [['EM-MM-130a.1'.toUpperCase(), 'Percentage energy consumed from grid electricity'.toUpperCase(),'None'.toUpperCase()].toString(), [8, 90]],
      [['EM-MM-130a.1'.toUpperCase(), 'Percentage energy consumed from grid electricity'.toUpperCase(),'Revenue'.toUpperCase()].toString(), [8, 90]],
      [['EM-MM-130a.1'.toUpperCase(), 'Percentage energy consumed from renewable electricity'.toUpperCase(),'Manpower'.toUpperCase()].toString(), [1, 84]],
      [['EM-MM-130a.1'.toUpperCase(), 'Percentage energy consumed from renewable electricity'.toUpperCase(),'None'.toUpperCase()].toString(), [1, 84]],
      [['EM-MM-130a.1'.toUpperCase(), 'Percentage energy consumed from renewable electricity'.toUpperCase(),'Revenue'.toUpperCase()].toString(), [1, 84]],
      [['EM-MM-130a.1'.toUpperCase(), 'Total energy consumed'.toUpperCase(),'Manpower'.toUpperCase()].toString(), [0.001513916, 18183.82191]],
      [['EM-MM-130a.1'.toUpperCase(), 'Total energy consumed'.toUpperCase(),'None'.toUpperCase()].toString(), [13, 408000000]],
      [['EM-MM-130a.1'.toUpperCase(), 'Total energy consumed'.toUpperCase(),'Revenue'.toUpperCase()].toString(), [0.00000000166368537713096, 0.030131483]],
      [['EM-MM-140a.1'.toUpperCase(), 'Percentage of water consumed in high or extremely high baseline water stress areas against total freshwater consumed'.toUpperCase(),'Manpower'.toUpperCase()].toString(), [1, 100]],
      [['EM-MM-140a.1'.toUpperCase(), 'Percentage of water consumed in high or extremely high baseline water stress areas against total freshwater consumed'.toUpperCase(),'None'.toUpperCase()].toString(), [1, 100]],
      [['EM-MM-140a.1'.toUpperCase(), 'Percentage of water consumed in high or extremely high baseline water stress areas against total freshwater consumed'.toUpperCase(),'Revenue'.toUpperCase()].toString(), [1, 100]],
      [['EM-MM-140a.1'.toUpperCase(), 'Percentage of water withdrawn in high or extremely high baseline water stress areas against total freshwater withdrawn'.toUpperCase(),'Manpower'.toUpperCase()].toString(), [1, 100]],
      [['EM-MM-140a.1'.toUpperCase(), 'Percentage of water withdrawn in high or extremely high baseline water stress areas against total freshwater withdrawn'.toUpperCase(),'None'.toUpperCase()].toString(), [1, 100]],
      [['EM-MM-140a.1'.toUpperCase(), 'Percentage of water withdrawn in high or extremely high baseline water stress areas against total freshwater withdrawn'.toUpperCase(),'Revenue'.toUpperCase()].toString(), [1, 100]],
      [['EM-MM-140a.1'.toUpperCase(), 'Total water consumed'.toUpperCase(),'Manpower'.toUpperCase()].toString(), [0.001262872, 20160.677]],
      [['EM-MM-140a.1'.toUpperCase(), 'Total water consumed'.toUpperCase(),'None'.toUpperCase()].toString(), [11, 1458000000]],
      [['EM-MM-140a.1'.toUpperCase(), 'Total water consumed'.toUpperCase(),'Revenue'.toUpperCase()].toString(), [0.00000000135174436891891, 0.097349269]],
      [['EM-MM-140a.1'.toUpperCase(), 'Total water consumed in high or extremely high baseline water stress areas'.toUpperCase(),'Manpower'.toUpperCase()].toString(), [1.419424214, 5753.461919]],
      [['EM-MM-140a.1'.toUpperCase(), 'Total water consumed in high or extremely high baseline water stress areas'.toUpperCase(),'None'.toUpperCase()].toString(), [72886, 27620000]],
      [['EM-MM-140a.1'.toUpperCase(), 'Total water consumed in high or extremely high baseline water stress areas'.toUpperCase(),'Revenue'.toUpperCase()].toString(), [0.0000024026567839, 0.006006633]],
      [['EM-MM-140a.1'.toUpperCase(), 'Total water withdrawn'.toUpperCase(),'Manpower'.toUpperCase()].toString(), [0.002331455, 29050.82464]],
      [['EM-MM-140a.1'.toUpperCase(), 'Total water withdrawn'.toUpperCase(),'None'.toUpperCase()].toString(), [22, 448000000]],
      [['EM-MM-140a.1'.toUpperCase(), 'Total water withdrawn'.toUpperCase(),'Revenue'.toUpperCase()].toString(), [0.00000000249552806569644, 0.059887359]],
      [['EM-MM-140a.1'.toUpperCase(), 'Total water withdrawn in high or extremely high baseline water stress areas'.toUpperCase(),'Manpower'.toUpperCase()].toString(), [0.392593077, 510.0520557]],
      [['EM-MM-140a.1'.toUpperCase(), 'Total water withdrawn in high or extremely high baseline water stress areas'.toUpperCase(),'None'.toUpperCase()].toString(), [14000, 11453000]],
      [['EM-MM-140a.1'.toUpperCase(), 'Total water withdrawn in high or extremely high baseline water stress areas'.toUpperCase(),'Revenue'.toUpperCase()].toString(), [0.000000598835746882748, 0.002499564]],
      [['EM-MM-140a.2'.toUpperCase(), 'Number of incidents of non-compliance associated with water quality permits, standards, and regulations'.toUpperCase(),'Manpower'.toUpperCase()].toString(), [0.000029710618575, 0.000825991]],
      [['EM-MM-140a.2'.toUpperCase(), 'Number of incidents of non-compliance associated with water quality permits, standards, and regulations'.toUpperCase(),'None'.toUpperCase()].toString(), [1, 24]],
      [['EM-MM-140a.2'.toUpperCase(), 'Number of incidents of non-compliance associated with water quality permits, standards, and regulations'.toUpperCase(),'Revenue'.toUpperCase()].toString(), [0.000000000182615047479912, 0.00000000303920575422956]],
      [['EM-MM-150a.4'.toUpperCase(), 'Total weight of non-mineral waste generated'.toUpperCase(),'Manpower'.toUpperCase()].toString(), [1.180012184, 4345.519465]],
      [['EM-MM-150a.4'.toUpperCase(), 'Total weight of non-mineral waste generated'.toUpperCase(),'None'.toUpperCase()].toString(), [11684, 729000000]],
      [['EM-MM-150a.4'.toUpperCase(), 'Total weight of non-mineral waste generated'.toUpperCase(),'Revenue'.toUpperCase()].toString(), [0.0000016781537276, 0.01744687]],
      [['EM-MM-150a.5'.toUpperCase(), 'Total weight of tailings produced'.toUpperCase(),'Manpower'.toUpperCase()].toString(), [0.010507526, 23684.21053]],
      [['EM-MM-150a.5'.toUpperCase(), 'Total weight of tailings produced'.toUpperCase(),'None'.toUpperCase()].toString(), [17, 185311000]],
      [['EM-MM-150a.5'.toUpperCase(), 'Total weight of tailings produced'.toUpperCase(),'Revenue'.toUpperCase()].toString(), [0.00000000455105209616105, 0.018636817]],
      [['EM-MM-150a.6'.toUpperCase(), 'Total weight of waste rock generated'.toUpperCase(),'Manpower'.toUpperCase()].toString(), [0.000488679, 37139.40472]],
      [['EM-MM-150a.6'.toUpperCase(), 'Total weight of waste rock generated'.toUpperCase(),'None'.toUpperCase()].toString(), [3, 283898456]],
      [['EM-MM-150a.6'.toUpperCase(), 'Total weight of waste rock generated'.toUpperCase(),'Revenue'.toUpperCase()].toString(), [0.000000000401601049517409, 0.094656234]],
      [['EM-MM-150a.7'.toUpperCase(), 'Total weight of hazardous waste generated'.toUpperCase(),'Manpower'.toUpperCase()].toString(), [0.003387755, 7615.822412]],
      [['EM-MM-150a.7'.toUpperCase(), 'Total weight of hazardous waste generated'.toUpperCase(),'None'.toUpperCase()].toString(), [166, 27660667]],
      [['EM-MM-150a.7'.toUpperCase(), 'Total weight of hazardous waste generated'.toUpperCase(),'Revenue'.toUpperCase()].toString(), [0.00000000261437908496732, 0.028022153]],
      [['EM-MM-150a.8'.toUpperCase(), 'Total weight of hazardous waste recycled'.toUpperCase(),'Manpower'.toUpperCase()].toString(), [0.001755102, 0.800944779]],
      [['EM-MM-150a.8'.toUpperCase(), 'Total weight of hazardous waste recycled'.toUpperCase(),'None'.toUpperCase()].toString(), [65, 44132]],
      [['EM-MM-150a.8'.toUpperCase(), 'Total weight of hazardous waste recycled'.toUpperCase(),'Revenue'.toUpperCase()].toString(), [0.00000000135443735727223, 0.0000014397755448]],
      [['EM-MM-150a.9'.toUpperCase(), 'Number of significant incidents associated with hazardous materials and waste management'.toUpperCase(),'Manpower'.toUpperCase()].toString(), [0.0000175438596491, 0.0000612244897959]],
      [['EM-MM-150a.9'.toUpperCase(), 'Number of significant incidents associated with hazardous materials and waste management'.toUpperCase(),'None'.toUpperCase()].toString(), [1, 4]],
      [['EM-MM-150a.9'.toUpperCase(), 'Number of significant incidents associated with hazardous materials and waste management'.toUpperCase(),'Revenue'.toUpperCase()].toString(), [1.85044688292223E-11, 9.12429571842422E-11]],
      [['EM-MM-160a.2'.toUpperCase(), 'Percentage of total mine sites where acid rock drainage is actively mitigated'.toUpperCase(),'Manpower'.toUpperCase()].toString(), [17, 100]],
      [['EM-MM-160a.2'.toUpperCase(), 'Percentage of total mine sites where acid rock drainage is actively mitigated'.toUpperCase(),'None'.toUpperCase()].toString(), [17, 100]],
      [['EM-MM-160a.2'.toUpperCase(), 'Percentage of total mine sites where acid rock drainage is actively mitigated'.toUpperCase(),'Revenue'.toUpperCase()].toString(), [17, 100]],
      [['EM-MM-160a.2'.toUpperCase(), 'Percentage of total mine sites where acid rock drainage is predicted to occur'.toUpperCase(),'Manpower'.toUpperCase()].toString(), [17, 100]],
      [['EM-MM-160a.2'.toUpperCase(), 'Percentage of total mine sites where acid rock drainage is predicted to occur'.toUpperCase(),'None'.toUpperCase()].toString(), [17, 100]],
      [['EM-MM-160a.2'.toUpperCase(), 'Percentage of total mine sites where acid rock drainage is predicted to occur'.toUpperCase(),'Revenue'.toUpperCase()].toString(), [17, 100]],
      [['EM-MM-160a.2'.toUpperCase(), 'Percentage of total mine sites where acid rock drainage is under treatment or remediation'.toUpperCase(),'Manpower'.toUpperCase()].toString(), [18, 84]],
      [['EM-MM-160a.2'.toUpperCase(), 'Percentage of total mine sites where acid rock drainage is under treatment or remediation'.toUpperCase(),'None'.toUpperCase()].toString(), [18, 84]],
      [['EM-MM-160a.2'.toUpperCase(), 'Percentage of total mine sites where acid rock drainage is under treatment or remediation'.toUpperCase(),'Revenue'.toUpperCase()].toString(), [18, 84]],
      [['EM-MM-160a.3'.toUpperCase(), 'Percentage of total area of probable reserves in or near sites with protected conservation status or endangered species habitat'.toUpperCase(),'Manpower'.toUpperCase()].toString(), [1, 100]],
      [['EM-MM-160a.3'.toUpperCase(), 'Percentage of total area of probable reserves in or near sites with protected conservation status or endangered species habitat'.toUpperCase(),'None'.toUpperCase()].toString(), [1, 100]],
      [['EM-MM-160a.3'.toUpperCase(), 'Percentage of total area of probable reserves in or near sites with protected conservation status or endangered species habitat'.toUpperCase(),'Revenue'.toUpperCase()].toString(), [1, 100]],
      [['EM-MM-160a.3'.toUpperCase(), 'Percentage of total area of proved reserves in or near sites with protected conservation status or endangered species habitat'.toUpperCase(),'Manpower'.toUpperCase()].toString(), [9, 100]],
      [['EM-MM-160a.3'.toUpperCase(), 'Percentage of total area of proved reserves in or near sites with protected conservation status or endangered species habitat'.toUpperCase(),'None'.toUpperCase()].toString(), [9, 100]],
      [['EM-MM-160a.3'.toUpperCase(), 'Percentage of total area of proved reserves in or near sites with protected conservation status or endangered species habitat'.toUpperCase(),'Revenue'.toUpperCase()].toString(), [9, 100]],
      [['EM-MM-210a.1'.toUpperCase(), 'Percentage of total area of probable reserves in or near areas of conflict'.toUpperCase(),'Manpower'.toUpperCase()].toString(), [48, 75]],
      [['EM-MM-210a.1'.toUpperCase(), 'Percentage of total area of probable reserves in or near areas of conflict'.toUpperCase(),'None'.toUpperCase()].toString(), [48, 75]],
      [['EM-MM-210a.1'.toUpperCase(), 'Percentage of total area of probable reserves in or near areas of conflict'.toUpperCase(),'Revenue'.toUpperCase()].toString(), [48, 75]],
      [['EM-MM-210a.1'.toUpperCase(), 'Percentage of total area of proved reserves in or near areas of conflict'.toUpperCase(),'Manpower'.toUpperCase()].toString(), [3, 84]],
      [['EM-MM-210a.1'.toUpperCase(), 'Percentage of total area of proved reserves in or near areas of conflict'.toUpperCase(),'None'.toUpperCase()].toString(), [3, 84]],
      [['EM-MM-210a.1'.toUpperCase(), 'Percentage of total area of proved reserves in or near areas of conflict'.toUpperCase(),'Revenue'.toUpperCase()].toString(), [3, 84]],
      [['EM-MM-210a.2'.toUpperCase(), 'Percentage of total area of probable reserves in or near indigenous land'.toUpperCase(),'Manpower'.toUpperCase()].toString(), [1, 100]],
      [['EM-MM-210a.2'.toUpperCase(), 'Percentage of total area of probable reserves in or near indigenous land'.toUpperCase(),'None'.toUpperCase()].toString(), [1, 100]],
      [['EM-MM-210a.2'.toUpperCase(), 'Percentage of total area of probable reserves in or near indigenous land'.toUpperCase(),'Revenue'.toUpperCase()].toString(), [1, 100]],
      [['EM-MM-210a.2'.toUpperCase(), 'Percentage of total area of proved reserves in or near indigenous land'.toUpperCase(),'Manpower'.toUpperCase()].toString(), [1, 100]],
      [['EM-MM-210a.2'.toUpperCase(), 'Percentage of total area of proved reserves in or near indigenous land'.toUpperCase(),'None'.toUpperCase()].toString(), [1, 100]],
      [['EM-MM-210a.2'.toUpperCase(), 'Percentage of total area of proved reserves in or near indigenous land'.toUpperCase(),'Revenue'.toUpperCase()].toString(), [1, 100]],
      [['EM-MM-210b.2'.toUpperCase(), 'Duration of non-technical delays'.toUpperCase(),'Manpower'.toUpperCase()].toString(), [0.00002446662752, 0.122734335]],
      [['EM-MM-210b.2'.toUpperCase(), 'Duration of non-technical delays'.toUpperCase(),'None'.toUpperCase()].toString(), [1, 237]],
      [['EM-MM-210b.2'.toUpperCase(), 'Duration of non-technical delays'.toUpperCase(),'Revenue'.toUpperCase()].toString(), [1.79668690933918E-11, 0.000000131661327068402]],
      [['EM-MM-210b.2'.toUpperCase(), 'Number of non-technical delays'.toUpperCase(),'Manpower'.toUpperCase()].toString(), [0.0000489332550401, 0.007984969]],
      [['EM-MM-210b.2'.toUpperCase(), 'Number of non-technical delays'.toUpperCase(),'None'.toUpperCase()].toString(), [1, 17]],
      [['EM-MM-210b.2'.toUpperCase(), 'Number of non-technical delays'.toUpperCase(),'Revenue'.toUpperCase()].toString(), [3.59337381867836E-11, 0.0000000283402767011251]],
      [['EM-MM-310a.1'.toUpperCase(), 'Percentage of active workforce employed under collective agreement'.toUpperCase(),'Manpower'.toUpperCase()].toString(), [24, 98]],
      [['EM-MM-310a.1'.toUpperCase(), 'Percentage of active workforce employed under collective agreement'.toUpperCase(),'None'.toUpperCase()].toString(), [24, 98]],
      [['EM-MM-310a.1'.toUpperCase(), 'Percentage of active workforce employed under collective agreement'.toUpperCase(),'Revenue'.toUpperCase()].toString(), [24, 98]],
      [['EM-MM-310a.2'.toUpperCase(), 'Duration of strikes and lockouts'.toUpperCase(),'Manpower'.toUpperCase()].toString(), [0.0000327214423611, 0.005067323]],
      [['EM-MM-310a.2'.toUpperCase(), 'Duration of strikes and lockouts'.toUpperCase(),'None'.toUpperCase()].toString(), [1, 35]],
      [['EM-MM-310a.2'.toUpperCase(), 'Duration of strikes and lockouts'.toUpperCase(),'Revenue'.toUpperCase()].toString(), [0.000000000248200546041201, 0.0000000105169628093151]],
      [['EM-MM-310a.2'.toUpperCase(), 'Number of strikes and lockouts'.toUpperCase(),'Manpower'.toUpperCase()].toString(), [0.0000327214423611, 0.000144781]],
      [['EM-MM-310a.2'.toUpperCase(), 'Number of strikes and lockouts'.toUpperCase(),'None'.toUpperCase()].toString(), [1, 1]],
      [['EM-MM-310a.2'.toUpperCase(), 'Number of strikes and lockouts'.toUpperCase(),'Revenue'.toUpperCase()].toString(), [0.000000000237338016803532, 0.000000000300484651694718]],
      [['EM-MM-320a.1'.toUpperCase(), 'Average hours of health, safety, and emergency response training for contract employees'.toUpperCase(),'Manpower'.toUpperCase()].toString(), [0.000101092, 0.009069212]],
      [['EM-MM-320a.1'.toUpperCase(), 'Average hours of health, safety, and emergency response training for contract employees'.toUpperCase(),'None'.toUpperCase()].toString(), [1, 40]],
      [['EM-MM-320a.1'.toUpperCase(), 'Average hours of health, safety, and emergency response training for contract employees'.toUpperCase(),'Revenue'.toUpperCase()].toString(), [0.00000000043176028668883, 0.0000000128814956636818]],
      [['EM-MM-320a.1'.toUpperCase(), 'Average hours of health, safety, and emergency response training for full-time employees'.toUpperCase(),'Manpower'.toUpperCase()].toString(), [0.003908082, 0.035578145]],
      [['EM-MM-320a.1'.toUpperCase(), 'Average hours of health, safety, and emergency response training for full-time employees'.toUpperCase(),'None'.toUpperCase()].toString(), [5, 46]],
      [['EM-MM-320a.1'.toUpperCase(), 'Average hours of health, safety, and emergency response training for full-time employees'.toUpperCase(),'Revenue'.toUpperCase()].toString(), [0.00000000546100646349122, 0.0000000660316864052497]],
      [['EM-MM-320a.1'.toUpperCase(), 'Number of Fatalities'.toUpperCase(),'Manpower'.toUpperCase()].toString(), [1, 11]],
      [['EM-MM-320a.1'.toUpperCase(), 'Number of Fatalities'.toUpperCase(),'None'.toUpperCase()].toString(), [1, 11]],
      [['EM-MM-320a.1'.toUpperCase(), 'Number of Fatalities'.toUpperCase(),'Revenue'.toUpperCase()].toString(), [1, 11]],
      [['EM-MM-320a.1'.toUpperCase(), 'Total MSHA all-incidents rate'.toUpperCase(),'Manpower'.toUpperCase()].toString(), [1, 4]],
      [['EM-MM-320a.1'.toUpperCase(), 'Total MSHA all-incidents rate'.toUpperCase(),'None'.toUpperCase()].toString(), [1, 4]],
      [['EM-MM-320a.1'.toUpperCase(), 'Total MSHA all-incidents rate'.toUpperCase(),'Revenue'.toUpperCase()].toString(), [1, 4]],
      [['EM-MM-320a.1'.toUpperCase(), 'Total fatality rate'.toUpperCase(),'Manpower'.toUpperCase()].toString(), [1, 3]],
      [['EM-MM-320a.1'.toUpperCase(), 'Total fatality rate'.toUpperCase(),'None'.toUpperCase()].toString(), [1, 3]],
      [['EM-MM-320a.1'.toUpperCase(), 'Total fatality rate'.toUpperCase(),'Revenue'.toUpperCase()].toString(), [1, 3]],
      [['EM-MM-320a.1'.toUpperCase(), 'Total near-miss frequency rate (NMFR)'.toUpperCase(),'Manpower'.toUpperCase()].toString(), [1, 298]],
      [['EM-MM-320a.1'.toUpperCase(), 'Total near-miss frequency rate (NMFR)'.toUpperCase(),'None'.toUpperCase()].toString(), [1, 298]],
      [['EM-MM-320a.1'.toUpperCase(), 'Total near-miss frequency rate (NMFR)'.toUpperCase(),'Revenue'.toUpperCase()].toString(), [1, 298]],
      [['EM-MM-320a.1'.toUpperCase(), 'Total number of MSHA incidents'.toUpperCase(),'Manpower'.toUpperCase()].toString(), [0.0000857221231655, 0.008259639]],
      [['EM-MM-320a.1'.toUpperCase(), 'Total number of MSHA incidents'.toUpperCase(),'None'.toUpperCase()].toString(), [5, 283]],
      [['EM-MM-320a.1'.toUpperCase(), 'Total number of MSHA incidents'.toUpperCase(),'Revenue'.toUpperCase()].toString(), [0.000000000142377128538072, 0.0000000433079434167573]],
      [['EM-MM-510a.2'.toUpperCase(), "Production in countries with the 20 lowest rankings in Transparency International's Corruption Perception Index".toUpperCase(),'Manpower'.toUpperCase()].toString(), [112.8608924, 151.9342762]],
      [['EM-MM-510a.2'.toUpperCase(), "Production in countries with the 20 lowest rankings in Transparency International's Corruption Perception Index".toUpperCase(),'None'.toUpperCase()].toString(), [1118000, 1461000]],
      [['EM-MM-510a.2'.toUpperCase(), "Production in countries with the 20 lowest rankings in Transparency International's Corruption Perception Index".toUpperCase(),'Revenue'.toUpperCase()].toString(), [0.000148344, 0.000258767]],
      [['Revenue'.toUpperCase(), 'Revenue'.toUpperCase(),'Manpower'.toUpperCase()].toString(), [278966000, 65098000000]],
      [['Revenue'.toUpperCase(), 'Revenue'.toUpperCase(),'None'.toUpperCase()].toString(), [278966000, 65098000000]],
      [['Revenue'.toUpperCase(), 'Revenue'.toUpperCase(),'Revenue'.toUpperCase()].toString(), [278966000, 65098000000]],
  ]);
  
  //indicator lst - list of indicators that needs to be standardized
  const indicator_lst = [
      ['EM-MM-110a.1'.toUpperCase(), 'Total gross global scope 1 emissions (CO2)'.toUpperCase() ].toString(),
      ['EM-MM-120a.1'.toUpperCase(), 'Total CO emissions'.toUpperCase() ].toString(),
      ['EM-MM-120a.1'.toUpperCase(), 'Total NOx emissions'.toUpperCase() ].toString(),
      ['EM-MM-120a.1'.toUpperCase(), 'Total SOx emissions'.toUpperCase() ].toString(),
      ['EM-MM-120a.1'.toUpperCase(), 'Total PM10 emissions'.toUpperCase() ].toString(),
      ['EM-MM-120a.1'.toUpperCase(), 'Total mercury (Hg) emissions'.toUpperCase() ].toString(),
      ['EM-MM-120a.1'.toUpperCase(), 'Total lead (Pb) emissions'.toUpperCase() ].toString(),
      ['EM-MM-120a.1'.toUpperCase(), 'Total volatile organic compounds (VOCs) emissions'.toUpperCase() ].toString(),
      ['EM-MM-130a.1'.toUpperCase(), 'Total energy consumed'.toUpperCase() ].toString(),
      ['EM-MM-140a.1'.toUpperCase(), 'Total water withdrawn'.toUpperCase() ].toString(),
      ['EM-MM-140a.1'.toUpperCase(), 'Total water consumed'.toUpperCase() ].toString(),
      ['EM-MM-140a.1'.toUpperCase(), 'Total water withdrawn in high or extremely high baseline water stress areas'.toUpperCase() ].toString(),
      ['EM-MM-140a.1'.toUpperCase(), 'Total water consumed in high or extremely high baseline water stress areas'.toUpperCase() ].toString(),
      ['EM-MM-140a.2'.toUpperCase(), 'Number of incidents of non-compliance associated with water quality permits, standards, and regulations'.toUpperCase() ].toString(),
      ['EM-MM-150a.4'.toUpperCase(), 'Total weight of non-mineral waste generated'.toUpperCase() ].toString(),
      ['EM-MM-150a.5'.toUpperCase(), 'Total weight of tailings produced'.toUpperCase() ].toString(),
      ['EM-MM-150a.6'.toUpperCase(), 'Total weight of waste rock generated'.toUpperCase() ].toString(),
      ['EM-MM-150a.7'.toUpperCase(), 'Total weight of hazardous waste generated'.toUpperCase() ].toString(),
      ['EM-MM-150a.8'.toUpperCase(), 'Total weight of hazardous waste recycled'.toUpperCase() ].toString(),
      ['EM-MM-150a.9'.toUpperCase(), 'Number of significant incidents associated with hazardous materials and waste management'.toUpperCase() ].toString(),
      ['EM-MM-210b.2'.toUpperCase(), 'Number of non-technical delays'.toUpperCase() ].toString(),
      ['EM-MM-210b.2'.toUpperCase(), 'Duration of non-technical delays'.toUpperCase() ].toString(),
      ['EM-MM-310a.2'.toUpperCase(), 'Number of strikes and lockouts'.toUpperCase() ].toString(),
      ['EM-MM-310a.2'.toUpperCase(), 'Duration of strikes and lockouts'.toUpperCase() ].toString(),
      ['EM-MM-320a.1'.toUpperCase(), 'Total number of MSHA incidents'.toUpperCase() ].toString(),
      ['EM-MM-320a.1'.toUpperCase(), 'Average hours of health, safety, and emergency response training for full-time employees'.toUpperCase() ].toString(),
      ['EM-MM-320a.1'.toUpperCase(), 'Average hours of health, safety, and emergency response training for contract employees'.toUpperCase() ].toString(),
      ['EM-MM-510a.2'.toUpperCase(), "Production in countries with the 20 lowest rankings in Transparency International's Corruption Perception Index".toUpperCase() ].toString(),
      ['EM-MM-000.A'.toUpperCase(), 'Production of metal ores'.toUpperCase() ].toString(),
      ['EM-MM-000.A'.toUpperCase(), 'Production of finished metal products'.toUpperCase() ].toString(),
      ['EM-MM-000.B'.toUpperCase(), 'Total number of contractors'.toUpperCase() ].toString()
  ];
  
  const uploadDataToSupabase = async (row: any[]) => {
      //uploads the data as it is if there are no duplicates
      //if not it will update the data entry in the supabase
      const [new_category, new_indicator, new_indicator_name, new_remarks, new_units, new_year, new_value, new_company, std] = row;
      const { data, error } = await supabase
          .from('test_duplicate') //change to esg_data for deployment @adi
          .upsert([{
          category: new_category,
          sasb_indicator: new_indicator,
          indicator_name: new_indicator_name,
          subcategory: new_remarks,
          unit: new_units,
          year: new_year,
          value: new_value,
          company_name: new_company,
          standardisation: std
      }], { onConflict: ['category', 'sasb_indicator', 'indicator_name', 'subcategory', 'year', 'company_name', 'standardisation', 'unit'] });
  
      if (error) {
          console.error('Error uploading data:', error);
      } else {
          console.log('Data uploaded:', new_company);
      }
  }
  
  const uploadCompanyToSupabase = async (company: string) => {
      //uploads the company if it isn't there yet
      const { data, error } = await supabase
          .from('companies')
          .upsert([{
              name: company
      }], { onConflict: ['name'] });
  
      if (error) {
          console.error('Error uploading company data:', error);
      } else {
          console.log('Company data uploaded:', company);
      }
  }

  const submitData = async (rawData: any[][], company_name: string) => {
    uploadCompanyToSupabase(company_name.trim());
    try {
        //to access map, need to use dict.get(key)
        const data = []; //store the data
        const employee_data = new Map(); //to store employee data
        const revenue_data = new Map(); //to store revenue data
        for (let row of rawData) {
            let [index, category, indicator, indicator_name, unit, remarks, year, value] = row;  // Extract the last 6 elements (similar to *_, indicator, indicator_name, year, value, unit, remarks)
            remarks = remarks.trim()
            indicator_name = indicator_name.trim()
            indicator = indicator.trim()
            unit = unit.trim()
            year = year.trim()

            //convert units; log cases where the conversion failed
            const expected_unit = target_dict.get([indicator.toUpperCase(), remarks.toUpperCase()].toString())
            if(['', ' ', null].includes(value)){
                continue; //this is when the data is not avail
            } else{
                value = parseFloat(value) //in case of commas
                if(unit != expected_unit){
                    const func = conversion_dict.get([unit, expected_unit].toString());
                    if (func){
                        value = func(value);
                        unit = expected_unit;
                    } else{
                        // this happens when we have not considered this (current unit -> desired unit pair)
                        console.log(`Data was not uploaded as units cannot be converted: ${company_name}, ${indicator} - ${remarks}, ${unit}, ${expected_unit}`)
                        continue;
                    }
                }
                //capture employee data
                if(indicator == "EM-MM-000.B" && remarks.toUpperCase() == "TOTAL NUMBER OF EMPLOYEES"){
                    employee_data.set(year, value);
                };

                //capture revenue data
                if(indicator.toUpperCase() == "REVENUE" && remarks.toUpperCase() == "REVENUE"){
                    revenue_data.set(year, value);
                };

                //push the data
                //data format as such: indicator, indicator_name, remarks, units, year, value, company, std_1, std_2
                //std_1 refers to whether the data has been standardized by manpower/ revenue
                //std_2 refers to whether the data has been standardized into 0 - 1
                if (unit == 'Cubic meters (m³)'){
                  unit = '(m³)';
                }
                if (unit == "Hectares (Ha)"){
                  unit = 'Ha';
                }
                if (unit == "Gigajoules (GJ)"){
                  unit = 'GJ';
                }

                if(indicator == "EM-MM-110a.1".toUpperCase() && unit == "Tonnes"){
                    unit = "tCO2e";
                }
                if(value){
                    data.push([category, indicator, indicator_name, remarks, unit, year, value, company_name, "None", false])
                    uploadDataToSupabase([category, indicator, indicator_name, remarks, unit, year, value, company_name, "None"])
                }
            }
        }
        //normalize and upload data
        //final_data
        for (let row of [...data]){
            let [category, indicator, indicator_name, remarks, unit, year, value, company_name, std_1, std_2] = row
            const minMax_lst = minMax.get([indicator.toUpperCase(), remarks.toUpperCase(), "NONE"].toString())
            const minMax_lst_mp = minMax.get([indicator.toUpperCase(), remarks.toUpperCase(), "MANPOWER"].toString())
            const minMax_lst_rev = minMax.get([indicator.toUpperCase(), remarks.toUpperCase(), "REVENUE"].toString())
            if (minMax_lst){
              const std2 = (value - minMax_lst[0]) / (minMax_lst[1] - minMax_lst[0])
                if(std2){
                    uploadDataToSupabase([category, indicator, indicator_name, remarks, unit, year, std2, company_name, "None_Scaled"])
                }
              }
            if(indicator_lst.includes([indicator.toUpperCase(), remarks.toUpperCase()].toString())){
                //push normalized data
                let std1_mp = value/ employee_data.get(year);
                let std1_rev = value/ revenue_data.get(year);
                if(std1_mp){
                    data.push([indicator, indicator_name, remarks, unit, year, std1_mp, company_name, "Manpower", std_2])
                    uploadDataToSupabase([category, indicator, indicator_name, remarks, unit, year, std1_mp, company_name, "Manpower"])
                }
                if(std1_rev){
                    data.push([indicator, indicator_name, remarks, unit, year, std1_rev, company_name, "Revenue", std_2])
                    uploadDataToSupabase([category, indicator, indicator_name, remarks, unit, year, std1_rev, company_name, "Revenue"])
                }
                if(minMax_lst_mp){
                  let std2_mp = (std1_mp - minMax_lst_mp[0]) / (minMax_lst_mp[1] - minMax_lst_mp[0])
                  if(std2_mp){
                      data.push([indicator, indicator_name, remarks, unit, year, std2_mp, company_name, "Manpower", true])
                      uploadDataToSupabase([category, indicator, indicator_name, remarks, unit, year, std2_mp, company_name, "Manpower_Scaled"])
                  }
                }
                if(minMax_lst_rev){
                  let std2_rev = (std1_rev - minMax_lst_rev[0]) / (minMax_lst_rev[1] - minMax_lst_rev[0])
                  if(std2_rev){
                      data.push([indicator, indicator_name, remarks, unit, year, std2_rev, company_name, "Revenue", true])
                      uploadDataToSupabase([category, indicator, indicator_name, remarks, unit, year, std2_rev, company_name, "Revenue_Scaled"])
                  }
                }
            } else{
                //just append normally for data that don't need conversion
                data.push([indicator, indicator_name, remarks, unit, year, value, company_name, "Manpower", std_2])
                data.push([indicator, indicator_name, remarks, unit, year, value, company_name, "Revenue", std_2])
                uploadDataToSupabase([category, indicator, indicator_name, remarks, unit, year, value, company_name, "Manpower"])
                uploadDataToSupabase([category, indicator, indicator_name, remarks, unit, year, value, company_name, "Revenue"])
                if(minMax_lst_mp){
                  let std2_mp = (parseFloat(value) - minMax_lst_mp[0]) / (minMax_lst_mp[1] - minMax_lst_mp[0])
                  if(std2_mp){
                      data.push([indicator, indicator_name, remarks, unit, year, std2_mp, company_name, "Manpower", true])
                      uploadDataToSupabase([category, indicator, indicator_name, remarks, unit, year, std2_mp, company_name, "Manpower_Scaled"])
                  }
                }
                if(minMax_lst_rev){
                  let std2_rev = (parseFloat(value) - minMax_lst_rev[0]) / (minMax_lst_rev[1] - minMax_lst_rev[0])
                  if(std2_rev){
                      data.push([indicator, indicator_name, remarks, unit, year, std2_rev, company_name, "Revenue", true])
                      uploadDataToSupabase([category, indicator, indicator_name, remarks, unit, year, std2_rev, company_name, "Revenue_Scaled"])
                  }
                }
            }
        }

    } catch (error) {
        console.error('Error:', error);
        //setError('An unexpected error occurred.');
    }
  };
  
    // fean: insert function call
    submitData(formattedOutput, companyName);
  };
  

  const handleFormData = (newData: CustomFormData) => {
    setFormData(newData);
  };

//   const generateCSV = () => {
//     const csv = Papa.unparse(Object.values(formData));
//     const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
//     saveAs(blob, `${companyName}_ESG_data.csv`);
//   };

  const nextButtonDisabled = () => {
    if (step == 0) {
        return !inputMethod;
    }
    if (step == 1) {
        // return scraperStatus !== "Completed"; // TODO when scraper is live
        return false
    }
    return false;
  }

  return (
    <div className='data-entry-main'>
        {step == 0 && (
            <Initiation 
                inputMethod={inputMethod} 
                setInputMethod={setInputMethod} 
            />
        )}
        {step == 1 && (
            <Scraper 
                scraperStatus={scraperStatus}
                setScraperStatus={setScraperStatus}
                companyName={companyName}
                setCompanyName={setCompanyName}
                taskID={taskID}
                setTaskID={setTaskID}
                inputMethod={inputMethod}
            />
        )}
        {step == 2 && (
            <YearSelect 
                selectedYears={selectedYears}
                setSelectedYears={setSelectedYears}
                inputMethod={inputMethod}
                companyName={companyName ?? ""}
            />
        )}
        {step > 2 && (
            <GenericForm 
                selectedYears={selectedYears}
                inputMethod={inputMethod}
                companyName={companyName ?? ""}
                step={step}
                steps={steps}
                formData={formData}
                handleFormData={handleFormData}
            />
        )}
        <DataEntryButtons 
            handlePrevStep={handlePrevStep} 
            handleNextStep={handleNextStep} 
            handleSubmit={handleSubmit}
            step={step} 
            numStages={steps.length - 1}
            nextDisabled={nextButtonDisabled()}
            children={<Stepper steps={steps} currentStep={step} inputMethod={inputMethod} />}
        />
    </div>
  );
};

export default DataEntry;
