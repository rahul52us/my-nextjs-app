import { Box, Flex, Icon, Text } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";

interface Metric {
  id: number;
  label: string;
  target: number;
  icon: any; // Change to 'any' or a specific type if you have a defined icon type
}

interface StatisticsCounterProps {
  metrics: Metric[];
  backgroundImage: string; // New prop for background image
}

const StatisticsCounter = ({
  metrics,
  backgroundImage, // Destructure backgroundImage prop
}: StatisticsCounterProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [counts, setCounts] = useState<any>({});

  const ref = useRef<HTMLDivElement | null>(null); // Specify the type of ref

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Stop observing after visibility
        }
      });
    });

    const currentRef = ref.current; // Copy ref.current to a variable

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef); // Use the stored variable in cleanup
      }
    };
  }, []); // No changes required here

  useEffect(() => {
    if (isVisible) {
      metrics.forEach((metric: any) => {
        let count = 0;
        const target = metric.target;
        const increment = Math.ceil(target / 200);

        const interval = setInterval(() => {
          count += increment;
          if (count >= target) {
            count = target;
            clearInterval(interval);
          }
          setCounts((prevCounts: any) => ({
            ...prevCounts,
            [metric.label.toLowerCase()]: count,
          }));
        }, 20); // Adjust for frame rate

        return () => clearInterval(interval);
      });
    }
  }, [isVisible, metrics]);

  return (
    <Box
      ref={ref}
      position="relative"
      bgImage={`url(${backgroundImage})`} // Use the backgroundImage prop here
      bgSize="cover"
      bgPosition="center"
      width="100%"
      height="100%"
      overflow="hidden"
    >
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="rgba(0, 0, 0, 0.55)" // Dark overlay
        backdropFilter={"blur(2px)"}
        zIndex={1}
      />
      <Flex
        position="relative"
        justify="space-around"
        align="center"
        px={4}
        py={12}
        zIndex={2}
      >
        {metrics.map((metric: any) => (
          <Box key={metric.id} textAlign="center">
            <Icon as={metric.icon} boxSize={12} mb={1} color="white" />
            <Text fontSize="4xl" fontWeight="bold" color="white">
              {counts[metric.label.toLowerCase()] || 0}
            </Text>
            <Text fontSize="lg" color="gray.200">
              {metric.label}
            </Text>
          </Box>
        ))}
      </Flex>
    </Box>
  );
};

export default StatisticsCounter;
