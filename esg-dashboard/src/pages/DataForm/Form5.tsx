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
    indicator: "EM-MM-140a.1",
    sub_category: "Total freshwater withdrawn",
    units: "Cubic meters (m³)",
  },
  {
    indicator: "EM-MM-140a.1",
    sub_category: "Total freshwater consumed",
    units: "Cubic meters (m³)",
  },
  {
    indicator: "EM-MM-140a.1",
    sub_category:
      "Total water withdrawn in high or extremely high baseline water stress areas",
    units: "Cubic meters (m³)",
  },
  {
    indicator: "EM-MM-140a.1",
    sub_category:
      "Total water consumed in high or extremely high baseline water stress areas",
    units: "Cubic meters (m³)",
  },
  {
    indicator: "EM-MM-140a.1",
    sub_category:
      "Percentage of water withdrawn in high or extremely high baseline water stress areas against total freshwater withdrawn",
    units: "%",
  },
  {
    indicator: "EM-MM-140a.1",
    sub_category:
      "Percentage of water consumed in high or extremely high baseline water stress areas against total freshwater consumed",
    units: "%",
  },
  {
    indicator: "EM-MM-140a.2",
    sub_category:
      "Number of incidents of non-compliance associated with water quality permits, standards, and regulations",
    units: "Count",
  },
];

interface MetricData {
  indicator: string;
  sasb_indicator_name: string;
  sub_category: string;
  year: number;
  value: string;
}

interface Form5Props {
  companyName: string;
  selectedYears: number[];
}

const Form5: React.FC<Form5Props> = ({ companyName, selectedYears }) => {
  const { supabase } = useSupabase();
  const [metricsData, setMetricsData] = useState<MetricData[]>([]); // Data from Supabase
  const [loading, setLoading] = useState(true);

  // Local state to track the input values for each metric and year
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 3;

  // Sort years in ascending order
  const sortedYears = [...selectedYears].sort((a, b) => a - b);

  // Calculate total pages
  const totalPages = Math.ceil(sortedYears.length / rowsPerPage);

  // Get the years for the current page
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
        <Text fontSize="lg">Water Management</Text>
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

export default Form5;
