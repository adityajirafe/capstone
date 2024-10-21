import React, { useState } from "react";
import {
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
} from "@chakra-ui/react";

const metrics = ["Metric 1", "Metric 2", "Metric 3"];

const Form3 = ({ selectedYears }) => {
  const [data, setData] = useState(
    metrics.reduce((acc, metric) => {
      acc[metric] = selectedYears.reduce((acc, year) => {
        acc[year] = "";
        return acc;
      }, {});
      return acc;
    }, {})
  );

  const handleInputChange = (metric, year, value) => {
    setData((prevData) => ({
      ...prevData,
      [metric]: { ...prevData[metric], [year]: value },
    }));
  };

  return (
    <>
      <Heading w="100%" textAlign={"center"} fontWeight="normal" mb="2%">
        Activity Metrics
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
          {metrics.map((metric) => (
            <Tr key={metric}>
              <Td>{metric}</Td>
              {selectedYears.map((year) => (
                <Td key={year}>
                  <Input
                    type="text"
                    value={data[metric][year]}
                    onChange={(e) =>
                      handleInputChange(metric, year, e.target.value)
                    }
                  />
                </Td>
              ))}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </>
  );
};

export default Form3;
