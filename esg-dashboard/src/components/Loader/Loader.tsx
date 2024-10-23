import './Loader.css'
import { Spinner } from "@chakra-ui/react";

const Loader: React.FC = () => {

  return (
    <div className="loader-container">
      <Spinner size="lg"/>
    </div>
  );
};

export default Loader;
