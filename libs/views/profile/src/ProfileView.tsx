// Chakra imports
import { Flex, Grid } from '@chakra-ui/react';

// Custom components
import AccountPanel from './components/AccountPanel';
import ProfileBanner from './components/ProfileBanner';
import General from './components/General';
import Notifications from './components/Notifications';

export function ProfileView() {
  return (
    <Flex direction="column" gap="20px">
      <Grid
        templateColumns={{
          base: '1fr',
          lg: '0.66fr 0.34fr',
        }}
        templateRows={{
          base: 'auto auto',
          lg: '1fr',
        }}
        gap={{ base: '20px', xl: '20px' }}
      >
        <ProfileBanner />
        <Notifications />
      </Grid>

      <Grid
        mb="20px"
        templateColumns={{
          base: '1fr',
          lg: 'repeat(2, 1fr)',
        }}
        templateRows="auto auto"
        gap={{ base: '20px', xl: '20px' }}
      >
        <AccountPanel />
        <General pe="20px" />
      </Grid>
    </Flex>
  );
}
