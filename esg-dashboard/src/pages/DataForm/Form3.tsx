import React, { useEffect, useMemo, useState } from "react";
import {
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  Spinner,
  ButtonGroup,
  Button,
  Box,
} from "@chakra-ui/react";
import { useSupabase } from "../../hooks/useSupabase";
import Loader from "../../components/Loader";

interface Metric {
  id: string;
  category: string;
  sasb_indicator: string;
  indicator_name: string;
  subcategory: string;
  unit: string;
}

const predeterminedMetrics = [
  {
    indicator: "EM-MM-110a.1",
    sub_category: "Total gross global scope 1 emissions (CO2)",
    units: "Tonnes",
  },
  {
    indicator: "EM-MM-110a.1",
    sub_category:
      "Total percentage of gross global scope 1 emissions under emissions-limiting regulations",
    units: "%",
  },
  {
    indicator: "EM-MM-120a.1",
    sub_category: "Total CO emissions",
    units: "Tonnes",
  },
  {
    indicator: "EM-MM-120a.1",
    sub_category: "Total NOx emissions",
    units: "Tonnes",
  },
  {
    indicator: "EM-MM-120a.1",
    sub_category: "Total SOx emissions",
    units: "Tonnes",
  },
  {
    indicator: "EM-MM-120a.1",
    sub_category: "Total PM10 emissions",
    units: "Tonnes",
  },
  {
    indicator: "EM-MM-120a.1",
    sub_category: "Total mercury (Hg) emissions",
    units: "Tonnes",
  },
  {
    indicator: "EM-MM-120a.1",
    sub_category: "Total lead (Pb) emissions",
    units: "Tonnes",
  },
  {
    indicator: "EM-MM-120a.1",
    sub_category: "Total volatile organic compounds (VOCs) emissions",
    units: "Tonnes",
  },
];

interface MetricData {
  indicator: string;
  sub_category: string;
  year: number;
  value: string;
}

interface Form3Props {
  companyName: string;
  selectedYears: number[];
  handleFormData: (data: MetricData[]) => void;
}

const Form3: React.FC<Form3Props> = ({
  companyName,
  selectedYears,
  handleFormData,
}) => {
  const { supabase } = useSupabase();
  const [metricsData, setMetricsData] = useState<MetricData[]>([]);
  const [loading, setLoading] = useState(true);

  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});

  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 3;

  const sortedYears = useMemo(() => {
    return [...selectedYears].sort((a, b) => a - b)
  }, [selectedYears])

  const totalPages = Math.ceil(sortedYears.length / rowsPerPage);
  const yearsToDisplay = sortedYears.slice(
    currentPage * rowsPerPage,
    (currentPage + 1) * rowsPerPage
  );

  // Fetch data from Supabase (similar logic as before)
  useEffect(() => {
    console.log("1")
    const fetchMetrics = async () => {
      console.log("2");
      setLoading(true);
      try {
        console.log("3");
        const { data: metricsData, error } = await supabase
          .from("esg_data")
          .select("indicator, sub_category, year, value")
          .eq("task_id", 111)
          // .from("metrics")
          // .select()

        if (error) {
          throw error;
        }
        console.log(metricsData)
        setMetricsData(metricsData || []);
        const initialInputValues: { [key: string]: string } = {};
        metricsData.forEach((metric: MetricData) => {
          const key = `${metric.sub_category}-${metric.year}`;
          initialInputValues[key] = metric.value || "";
        });

        setInputValues(initialInputValues);
      } catch (error) {
        console.error("Error fetching data from Supabase:", error.message);
      } finally {
        setLoading(false);
      }
    };
    console.log("4");
    fetchMetrics()
    if (companyName && selectedYears.length > 0) {
      fetchMetrics(); // Trigger the fetch function if companyName and years are selected
    }
  }, [companyName, selectedYears, supabase]);

  // useEffect(() => {
  //   console.log('retrieve metrics');
  //   const metricsJson: Record<string, Metric[]> = {};

  //   const fetchMetricList = async () => {
  //     try {
  //       const { data: metrics, error } = await supabase.from('metrics').select();
  //       if (error) {
  //         throw new Error(error.message);
  //       }

  //       if (metrics) {
  //         metrics.forEach((metric: Metric) => {
  //           if (!metricsJson[metric.category]) {
  //             metricsJson[metric.category] = [];
  //           }
  //           metricsJson[metric.category].push(metric);
  //         });
  //       }
  //     } catch (error) {
  //       console.error('Error fetching metrics:', error);
  //     } finally {
  //       // saveJsonToFile(metricsJson, 'metrics.json');
  //     }
  //   };

  //   fetchMetricList();
  // }, [supabase]);

  const saveJsonToFile = (jsonData: Record<string, any[]>, fileName: string) => {
    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle input change for each metric-year combination
  const handleInputChange = (key: string, value: string) => {
    setInputValues((prevValues) => ({
      ...prevValues,
      [key]: value,
    }));
  };

  // Function to collect and send the form data, only when necessary
  useEffect(() => {
    // Only process form data when the input values change
    if (Object.keys(inputValues).length > 0) {
      const formData = predeterminedMetrics
        .map((metric) =>
          sortedYears.map((year) => ({
            indicator: metric.indicator,
            sub_category: metric.sub_category,
            unit: metric.units,
            year,
            value: inputValues[`${metric.sub_category}-${year}`] || "",
          }))
        )
        .flat()
        .filter((row) => row.value); // Filter out rows without values

      // Send the processed form data back to the parent component
      handleFormData(formData);
    }
  }, [handleFormData, inputValues, sortedYears]); // Now only dependent on inputValues and sortedYears

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <Heading w="100%" textAlign="center" fontWeight="normal" mb="2%">
        Activity Metrics for {companyName}
      </Heading>

      <Table>
        <Thead>
          <Tr>
            <Th>Metric</Th>
            {yearsToDisplay.map((year) => (
              <Th key={year}>{year}</Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {predeterminedMetrics.map((metric, index) => (
            <Tr key={index}>
              <Td>
                <span style={{ fontSize: "16px", fontWeight: "bold" }}>
                  {metric.sub_category} / {metric.units}
                </span>
                <br />
                {metric.indicator}
              </Td>
              {yearsToDisplay.map((year) => {
                const key = `${metric.sub_category}-${year}`;
                return (
                  <Td key={year}>
                    <Input
                      type="text"
                      value={inputValues[key] || ""}
                      onChange={(e) => handleInputChange(key, e.target.value)}
                    />
                  </Td>
                );
              })}
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <ButtonGroup mt={4} display="flex" justifyContent="center">
          <Button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
            isDisabled={currentPage === 0}
          >
            Previous
          </Button>
          <Button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))
            }
            isDisabled={currentPage === totalPages - 1}
          >
            Next
          </Button>
        </ButtonGroup>
      )}
    </>
  );
};

export default Form3;
