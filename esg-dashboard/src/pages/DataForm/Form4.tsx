import React, { useEffect, useState } from "react";
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

const predeterminedMetrics = [
  {
    indicator: "EM-MM-130a.1",
    sub_category: "Total energy consumed",
    units: "Gigajoules (GJ)",
  },
  {
    indicator: "EM-MM-130a.1",
    sub_category: "Total renewable energy consumed",
    units: "Gigajoules (GJ)",
  },
  {
    indicator: "EM-MM-130a.1",
    sub_category: "Total energy consumed from grid electricity",
    units: "Gigajoules (GJ)",
  },
  {
    indicator: "EM-MM-130a.1",
    sub_category: "Percentage energy consumed from grid electricity",
    units: "%",
  },
  {
    indicator: "EM-MM-130a.1",
    sub_category: "Percentage energy consumed from renewable electricity",
    units: "%",
  },
];

interface MetricData {
  indicator: string;
  sub_category: string;
  year: number;
  value: string;
}

interface Form4Props {
  companyName: string;
  selectedYears: number[];
  handleFormData: (data: MetricData[]) => void;
}

const Form4: React.FC<Form4Props> = ({
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

  const sortedYears = [...selectedYears].sort((a, b) => a - b);
  const totalPages = Math.ceil(sortedYears.length / rowsPerPage);
  const yearsToDisplay = sortedYears.slice(
    currentPage * rowsPerPage,
    (currentPage + 1) * rowsPerPage
  );

  // Fetch data from Supabase (similar logic as before)
  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      try {
        const { data: metricsData, error } = await supabase
          .from("esg_data")
          .select("indicator, sub_category, year, value")
          .eq("company", companyName)
          .in("year", selectedYears);

        if (error) {
          throw error;
        }

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

    if (companyName && selectedYears.length > 0) {
      fetchMetrics(); // Trigger the fetch function if companyName and years are selected
    }
  }, [companyName, selectedYears, supabase]);

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
  }, [inputValues, sortedYears]); // Now only dependent on inputValues and sortedYears

  if (loading) {
    return <Spinner size="lg" />;
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

export default Form4;
