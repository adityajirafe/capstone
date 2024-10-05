import { Box, Text } from "@chakra-ui/react";
import { useEffect } from "react";

const Dashboard = () => {
  useEffect(() => {
    const scriptElement = document.createElement("script");
    scriptElement.src = "https://public.tableau.com/javascripts/api/viz_v1.js";
    scriptElement.onload = () => {
      const divElement = document.getElementById("vizContainer");
      const vizElement = divElement?.getElementsByTagName("object")[0];
      if (vizElement && divElement) {
        if (divElement.offsetWidth > 800) {
          vizElement.style.minWidth = "1000px";
          vizElement.style.maxWidth = "100%";
          vizElement.style.minHeight = "647px";
          vizElement.style.maxHeight = `${divElement.offsetWidth * 0.75}px`;
        } else if (divElement.offsetWidth > 500) {
          vizElement.style.width = "100%";
          vizElement.style.height = `${divElement.offsetWidth * 0.75}px`;
        } else {
          vizElement.style.width = "100%";
          vizElement.style.height = "1227px";
        }
      }
    };
    document.body.appendChild(scriptElement);
  }, []);

  return (
    <Box p={4}>
      <Text fontSize="2xl" mb={4}>
        Executive Overview - Profitability
      </Text>
      <Box
        id="vizContainer"
        position="relative"
        borderWidth="1px"
        borderRadius="md"
        overflow="hidden"
      >
        <Box as="noscript">
          <a href="#">
            <img
              alt="Executive Overview - Profitability"
              src="https://public.tableau.com/static/images/Su/Superstore_17276724702450/Overview/1_rss.png"
              style={{ border: "none" }}
            />
          </a>
        </Box>
        <Box
          as="object"
          className="tableauViz"
          width="100%"
          height="647px"
          display="none"
        >
          <param name="host_url" value="https%3A%2F%2Fpublic.tableau.com%2F" />
          <param name="embed_code_version" value="3" />
          <param
            name="path"
            value="views/Superstore_17276724702450/Overview?:language=en-US&:embed=true&publish=yes&:sid=&:redirect=auth"
          />
          <param name="toolbar" value="yes" />
          <param name="static_image" value="https://public.tableau.com/static/images/Su/Superstore_17276724702450/Overview/1.png" />
          <param name="animate_transition" value="yes" />
          <param name="display_static_image" value="yes" />
          <param name="display_spinner" value="yes" />
          <param name="display_overlay" value="yes" />
          <param name="display_count" value="yes" />
          <param name="language" value="en-US" />
          <param name="filter" value="publish=yes" />
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
