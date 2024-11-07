import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { Box, Flex, Button } from '@chakra-ui/react';
import { useLocation, useNavigate } from 'react-router-dom';

const ProfileHeaderTab = observer(({ sideTab, editTabLink }: any) => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<any>(new URLSearchParams(location.search).get("profileTab"));
  const navigate = useNavigate();

  useEffect(() => {
    setActiveTab(new URLSearchParams(location.search).get("profileTab"))
  },[location.search])

  const handleTabClick = (path: number) => {
    if (editTabLink) {
      setActiveTab(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      navigate(`${editTabLink}&profileTab=${path}`);
    }
  };

  return (
    <Box width="100%">
      <Flex direction={['column', 'row']} columnGap={4} justify="space-between" align="center" width="100%">
        {sideTab.map((tab: any) => (
          <Button
            key={tab.path}
            onClick={() => handleTabClick(tab.path)}
            variant={activeTab === tab.path ? 'solid' : 'outline'}
            colorScheme={activeTab === tab.path ? 'blue' : 'gray'}
            mb={[4, 0]}
            width="100%"
          >
            {tab.title}
          </Button>
        ))}
      </Flex>
    </Box>
  );
});

export default ProfileHeaderTab;
