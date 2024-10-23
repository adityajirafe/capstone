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
  Text,
  Box,
} from "@chakra-ui/react";
import { useSupabase } from "../../hooks/useSupabase";

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
  sasb_indicator_name: string;
  sub_category: string;
  year: number;
  value: string;
}

interface Form3Props {
  companyName: string;
  selectedYears: number[];
}

const Form3: React.FC<Form3Props> = ({ companyName, selectedYears }) => {
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

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      try {
        const { data: metricsData, error } = await supabase
          .from("esg_data")
          .select("indicator, sasb_indicator_name, sub_category, year, value")
          .eq("company", companyName)
          .in("year", selectedYears); // Filter by company name and selected years

        if (error) {
          throw error;
        }

        setMetricsData(metricsData || []); // Set the fetched metrics data

        // Initialize the input values based on the fetched data
        const initialInputValues: { [key: string]: string } = {};
        metricsData.forEach((metric: MetricData) => {
          const key = `${metric.sub_category}-${metric.year}`; // Create a unique key for each metric-year combination
          initialInputValues[key] = metric.value; // Store the value in the state
        });

        setInputValues(initialInputValues); // Initialize the input values state
      } catch (error) {
        console.error("Error fetching data from Supabase:", error.message);
      } finally {
        setLoading(false);
      }
    };

    if (companyName && selectedYears.length > 0) {
      fetchMetrics(); // Trigger the fetch function if companyName and years are selected
    }
  }, [companyName, selectedYears, supabase]); // Ensure supabase client is part of dependencies

  // Handle input change for each metric-year combination
  const handleInputChange = (key: string, value: string) => {
    setInputValues((prevValues) => ({
      ...prevValues,
      [key]: value,
    }));
  };

  if (loading) {
    return <Spinner size="lg" />;
  }

  return (
    <>
      {/* Main Heading */}
      <Heading w="100%" textAlign="center" fontWeight="normal" mb="2%">
        Activity Metrics for {companyName}
      </Heading>

      {/* Subheader for ESG Category, Category, and Units */}
      <Box textAlign="center" mb="4">
        <Text fontSize="lg" fontWeight="bold">
          Environmental
        </Text>
        <Text fontSize="lg">GHG Emissions & Air Quality</Text>
      </Box>

      {/* Table with sorted years and pagination */}
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
          {/* Loop through predetermined set of metrics */}
          {predeterminedMetrics.map((predeterminedMetric, index) => (
            <Tr key={index}>
              {/* Display indicator and sub_category */}
              <Td>
                <span style={{ fontSize: "16px", fontWeight: "bold" }}>
                  {predeterminedMetric.sub_category} /{" "}
                  {predeterminedMetric.units}
                </span>
                <br />
                {predeterminedMetric.indicator}
              </Td>
              {/* Loop through the years to display for the current page */}
              {yearsToDisplay.map((year) => {
                const key = `${predeterminedMetric.sub_category}-${year}`; // Unique key for each metric-year input

                // Find matching value from fetched data
                const matchingMetric = metricsData.find(
                  (metric) =>
                    metric.indicator === predeterminedMetric.indicator &&
                    metric.sub_category === predeterminedMetric.sub_category &&
                    metric.year === year
                );

                return (
                  <Td key={year}>
                    <Input
                      type="text"
                      value={
                        inputValues[key] ||
                        (matchingMetric ? matchingMetric.value : "")
                      } // Show matching value if found
                      onChange={(e) => handleInputChange(key, e.target.value)} // Handle input change
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
