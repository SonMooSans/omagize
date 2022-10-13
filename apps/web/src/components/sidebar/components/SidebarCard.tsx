import {
  Avatar,
  Box,
  Button,
  Flex,
  SkeletonCircle,
  SkeletonText,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useSelfUser } from '@omagize/api';
import { FiSettings } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function SidebarProfile() {
  const bgColor = 'linear-gradient(135deg, #868CFF 0%, #4318FF 100%)';
  const borderColor = useColorModeValue('white', 'navy.800');
  const user = useSelfUser();

  return (
    <Flex
      justify="center"
      direction="column"
      align="center"
      bg={bgColor}
      borderRadius="30px"
      me="20px"
      position="relative"
    >
      <Box
        border="5px solid"
        borderColor={borderColor}
        borderRadius="50%"
        w="94px"
        h="94px"
        mx="auto"
        mt="-47px"
      >
        <Avatar
          name={user.username}
          src={user.avatarUrl}
          w="full"
          h="full"
          bg="linear-gradient(135deg, #868CFF 0%, #4318FF 100%)"
        />
      </Box>
      <Flex
        direction="column"
        mb="5px"
        align="center"
        justify="center"
        px="15px"
        pt="3px"
      >
        <Text
          fontSize={{ base: 'lg', xl: '18px' }}
          color="white"
          fontWeight="bold"
          lineHeight="150%"
          textAlign="center"
          px="10px"
          mb="14px"
        >
          {user.username}
        </Text>
      </Flex>
      <SettingsButton />
    </Flex>
  );
}

function SettingsButton() {
  return (
    <Link to="/user/profile">
      <Button
        bg="whiteAlpha.300"
        _hover={{ bg: 'whiteAlpha.200' }}
        _active={{ bg: 'whiteAlpha.100' }}
        mb={{ sm: '16px', xl: '24px' }}
        color={'white'}
        fontWeight="regular"
        fontSize="sm"
        leftIcon={<FiSettings />}
        minW="185px"
        mx="auto"
      >
        Settings
      </Button>
    </Link>
  );
}