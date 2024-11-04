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
  const [loading, setLoading] = useState(true);

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
        } catch (error) {
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

  const handleSubmit = () => {}

  const handleFormData = (newData: CustomFormData) => {
    setFormData(newData);
  };

  const generateCSV = () => {
    const csv = Papa.unparse(Object.values(formData));
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(blob, `${companyName}_ESG_data.csv`);
  };

  const nextButtonDisabled = () => {
    if (step == 0) {
        return !inputMethod;
    }
    if (step == 1) {
        // return scraperStatus !== "Completed";
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
