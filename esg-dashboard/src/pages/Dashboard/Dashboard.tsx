import { Box } from "@chakra-ui/react";
import { useEffect, useState } from "react";


const Dashboard = () => {

  const jwtPollInterval = 540000; // 9min
  const [token, setToken] = useState<string | null>(null); //store jwt token

  useEffect(() => {
    const interval = setInterval(async () => {
      console.log('in interval')
      const response = await fetch(`https://shay.pythonanywhere.com/generate`);
      const data = await response.json();
      setToken(data.token);     
    }, jwtPollInterval)
    const scriptElement = document.createElement("script");
    //scriptElement.src = "https://public.tableau.com/javascripts/api/viz_v1.js"; // old script, can remove
    scriptElement.type = "module"
    scriptElement.src = "https://public.tableau.com/javascripts/api/tableau.embedding.3.latest.min.js";
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

    return () => clearInterval(interval);
  }, []);

  return (
    <Box p={4}>
      <Box
        id="vizContainer"
        position="relative"
        borderWidth="1px"
        borderRadius="md"
        overflow="hidden"
      >
        <tableau-viz id="tableauViz"     
          src="https://prod-apnortheast-a.online.tableau.com/t/e0774443-fb4b2e6693/views/capstone/Sheet3"
          token={token}
          toolbar="bottom">
        </tableau-viz> 
        <Box as="noscript">
          <a href="#">
            <img
              alt="ESG Data Dashboard"
              src="https://public.tableau.com/static/images/ES/ESGData_17285766762070/Dashboard1/1_rss.png"
              style={{ border: "none" }}
            />
          </a>
        </Box>
        <Box
          as="object"
          className="tableauViz"
          width="100%"
          height="calc(100vh - 132px)"
          display="none"
        >
          <param name="host_url" value="https%3A%2F%2Fpublic.tableau.com%2F" />
          <param name="embed_code_version" value="3" />
          <param
            name="path"
            value="views/ESGData_17285766762070/Dashboard1?:language=en-US&:embed=true&publish=yes&:redirect=auth"
          />
          <param name="toolbar" value="yes" />
          <param name="static_image" value="https://public.tableau.com/static/images/ES/ESGData_17285766762070/Dashboard1/1.png" />
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
