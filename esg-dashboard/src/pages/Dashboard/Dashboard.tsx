import { Box, Tabs, Tab, TabList } from "@chakra-ui/react";
import { useEffect, useState, useCallback } from "react";
import { TableauViz, TableauEventType } from "@tableau/embedding-api";

const Dashboard = () => {
  const jwtPollInterval = 540000; // 9min
  const [token, setToken] = useState<string | undefined>(undefined);
  const [source, setSource] = useState("https://prod-apnortheast-a.online.tableau.com/t/e0726305-30273c2ac9/views/3dashboards/Dashboard1");

  const dashboards = [
    { name: "Cross-Company", url: "https://prod-apnortheast-a.online.tableau.com/t/e0726305-30273c2ac9/views/3dashboards/Dashboard1" },
    { name: "YoY Analysis", url: "https://prod-apnortheast-a.online.tableau.com/t/e0726305-30273c2ac9/views/3dashboards/Dashboard2" },
    { name: "Industry Trends", url: "https://prod-apnortheast-a.online.tableau.com/t/e0726305-30273c2ac9/views/3dashboards/Dashboard3" },
  ];

  const handleMarkSelection = () => {
    alert("Mark(s) selected!");
  };

  const render_tableau = useCallback(
    (currentToken: string | undefined, currentSource: string) => {
      const viz = new TableauViz();
      viz.src = currentSource;
      viz.token = currentToken;
      viz.addEventListener(TableauEventType.MarkSelectionChanged, handleMarkSelection);
      const visual = document.getElementById("tableauViz");
      if (visual!.hasChildNodes()) {
        visual!.removeChild(visual!.childNodes[0]);
      }
      visual!.appendChild(viz);
    },
    []
  );

  const get_token = useCallback(async () => {
    console.log("Getting token");
    const response = await fetch(`https://shay.pythonanywhere.com/generate`);
    const data = await response.json();
    setToken(data.token);
  }, []);

  useEffect(() => {
    get_token();
    const interval = setInterval(get_token, jwtPollInterval);

    return () => clearInterval(interval);
  }, [get_token]);

  useEffect(() => {
    if (token) {
      render_tableau(token, source);
    }
  }, [token, source, render_tableau]);

  return (
    <Box p={4}>
      <Tabs variant="soft-rounded" colorScheme="teal" onChange={(index) => setSource(dashboards[index].url)}>
        <TabList>
          {dashboards.map((dashboard, index) => (
            <Tab key={index}>{dashboard.name}</Tab>
          ))}
        </TabList>
      </Tabs>

      <Box
        id="vizContainer"
        position="relative"
        borderWidth="1px"
        borderRadius="md"
        overflow="hidden"
        height="calc(100vh - 190px)"
        mt={4}
      >
        <div id="tableauViz" style={{ height: "100%", width: "100%" }}></div>
      </Box>
    </Box>
  );
};

export default Dashboard;
