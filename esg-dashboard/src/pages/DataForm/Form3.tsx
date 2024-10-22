// components/Form3.tsx
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
} from "@chakra-ui/react";
import { useSupabase } from "../../hooks/useSupabase"; // Ensure correct path to useSupabase hook

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
  const { supabase } = useSupabase(); // Get the Supabase client from context
  const [metrics, setMetrics] = useState<MetricData[]>([]); // Store fetched metrics data
  const [loading, setLoading] = useState(true); // Loading state

  // Local state to track the input values for each metric and year
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      try {
        const { data: metricsData, error } = await supabase
          .from("esg_data") // Replace with your actual table name
          .select("indicator, sasb_indicator_name, sub_category, year, value")
          .eq("company", companyName)
          .in("year", selectedYears); // Filter by company name and selected years

        if (error) {
          throw error;
        }

        setMetrics(metricsData || []); // Set the fetched metrics data

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
      <Heading w="100%" textAlign="center" fontWeight="normal" mb="2%">
        Activity Metrics for {companyName}
      </Heading>
      <Table>
        <Thead>
          <Tr>
            <Th>Metric</Th>
            {selectedYears.map((year) => (
              <Th key={year}>{year}</Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {metrics.map((metric, index) => (
            <Tr key={index}>
              <Td>
                <span style={{ fontSize: "16px", fontWeight: "bold" }}>
                  {metric.sub_category}
                </span>
                <br />
                {metric.indicator}
              </Td>
              {selectedYears.map((year) => {
                const key = `${metric.sub_category}-${year}`; // Unique key for each metric-year input
                return (
                  <Td key={year}>
                    <Input
                      type="text"
                      value={inputValues[key] || ""} // Display the corresponding input value
                      onChange={(e) => handleInputChange(key, e.target.value)} // Handle input change
                    />
                  </Td>
                );
              })}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </>
  );
};

export default Form3;
