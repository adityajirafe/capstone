import './AboutUs.css'
import { Text, Box, useColorMode} from '@chakra-ui/react';
import HeaderDark from '../../../assets/HeaderDark.svg?react';
import HeaderLight from '../../../assets/HeaderLight.svg?react';

const AboutUs = () => {
  const { colorMode } = useColorMode();
  
  return (
    <Box className='about-us-main' bg="background">
      <Text fontSize="44px" fontWeight="bold">About Us</Text>
      {colorMode == "dark" ? <HeaderDark className="company-logo"/> : <HeaderLight className="company-logo"/> }
      <Text className='about-us-text'>ESGlytics, a product of ESGTech, simplifies ESG data for investors. Our platform consolidates and standardizes ESG information from multiple companies, offering a one-stop solution for efficient, data-driven decisions. We provide intuitive tools to help users integrate ESG factors into their investment strategies with ease and confidence.</Text>
      <div className='about-us-section'>
        <Text fontWeight="bold" fontSize="20px" className='about-us-text'>Mission Statement</Text>
        <Text className='about-us-text'>To empower investors with a streamlined platform for ESG data, enabling informed and responsible investment decisions. We drive transparency and sustainability by making ESG analysis simple and actionable.</Text>
      </div>
      <div className='about-us-section'>
        <Text fontWeight="bold" fontSize="20px" className='about-us-text'>Vision Statement</Text>
        <Text className='about-us-text'>Our vision is to be the leading ESG data platform, promoting responsible investing and sustainable business practices. We aim for ESG factors to be central to every investment decision, driving long-term value for both investors and society.</Text>
      </div>
    </Box>
  )
};

export default AboutUs;