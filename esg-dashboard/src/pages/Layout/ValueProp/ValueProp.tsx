import './ValueProp.css';
import { useEffect, useState, useRef } from 'react';
import { Box, Text, useColorMode } from '@chakra-ui/react';
import BuildingLogo from '../../../assets/Building.svg?react';
import BulbLogo from '../../../assets/Bulb.svg?react';
import ClipboardLogo from '../../../assets/Clipboard.svg?react';
import DashboardLogo from '../../../assets/Dashboard.svg?react';

const ValueProp = () => {
  const [activeIndex, setActiveIndex] = useState(-1);
  const sectionsRef = useRef<HTMLDivElement[]>([]);
  const { colorMode } = useColorMode()

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = sectionsRef.current.indexOf(entry.target as HTMLDivElement);
            setActiveIndex(index);
          }
        });
      },
      {
        root: null,
        threshold: 0.95,
      }
    );
    const sections = sectionsRef.current;
    sections.forEach((section) => {
      if (section) observer.observe(section);
    });
  
    return () => {
      sections.forEach((section) => {
        if (section) observer.unobserve(section);
      });
    };
  }, []);

  const logoMappings = [
    {
      logo: <BulbLogo />,
      header: "Efficient ESG Data Aggregation",
      subtext: "Simplify your ESG analysis with a consolidated platform, ensuring that all your ESG data is aggregated efficiently, saving you time and effort in gathering insights from various sources."
    },
    {
      logo: <BuildingLogo />,
      header: "Cross-Company Comparisons",
      subtext: "Make informed investment decisions by leveraging cross-company comparisons, allowing you to easily benchmark companies and evaluate their ESG performance against industry standards."
    },
    {
      logo: <ClipboardLogo />,
      header: "Standardized Data Format",
      subtext: "Trust in standardized data with consistent reporting formats, ensuring that your analysis is based on reliable and comparable ESG metrics across companies and industries."
    },
    {
      logo: <DashboardLogo />,
      header: "User Friendly Dashboard",
      subtext: "Enjoy an intuitive experience with our user-friendly dashboard, enabling seamless exploration of ESG data and providing actionable insights to enhance your investment strategy."
    }
  ]

  return (
    <div className="value-prop-container">
      <Text className='value-prop-header'>Why Choose ESGlytics</Text>
      {logoMappings.map((obj, index) => (
        <div
          key={index}
          className={`value-prop-section ${activeIndex === index ? 'active' : ''} ${index % 2 == 0 ? '' : 'reverse'}`}
          ref={(el) => sectionsRef.current[index] = el as HTMLDivElement}
        >
          <Box 
            className="value-prop-logo" 
            bg="monochrome"
            boxShadow={colorMode == "dark" ? "0 14px 16px rgba(146, 204, 231, 0.1)" : "0 14px 16px rgba(24, 82, 109, 0.1)"}
          >
            {obj.logo}
          </Box>
          <Box className="value-prop-text">
            <Text fontSize="28px" fontWeight="bold">{obj.header}</Text>
            <Text fontSize="20px" mt="16px">{obj.subtext}</Text>
          </Box>
        </div>
      ))}
    </div>
  );
};

export default ValueProp;
