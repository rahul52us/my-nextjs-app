import { useState } from 'react';
import { Box, Text, useColorModeValue } from '@chakra-ui/react';
import { FaHandHoldingHeart } from 'react-icons/fa';
import './ClapButton.css'; // Import your custom CSS file for animations

type ClapProps = {
  initialClapCount: number;
};

function ClapButton({ initialClapCount }: ClapProps) {
  const [clapCount, setClapCount] = useState(initialClapCount);
  const [isClapping, setIsClapping] = useState(false);

  const handleClap = () => {
    if (!isClapping) {
      setIsClapping(true);

      // Simulate a clapping animation with CSS classes
      setTimeout(() => {
        setIsClapping(false);
      }, 800);

      // Implement the logic to increment the clap count and send this data to your server.
      // You can use a state management library like Redux or send an API request to update the count.
      setClapCount(clapCount + 1);
    }
  };

  const clapColor = useColorModeValue('teal.500', 'teal.300');

  return (
    <Box
      display="flex"
      alignItems="center"
      userSelect="none"
      onClick={handleClap}
      cursor="pointer"
    >
      <div className={`clap-icon ${isClapping ? 'clap-icon-active' : ''}`}>
        <FaHandHoldingHeart fontSize="2em" color={clapColor} />
      </div>
      <Text fontSize="lg" ml="2">
        {clapCount} Claps
      </Text>
    </Box>
  );
}

export default ClapButton;
