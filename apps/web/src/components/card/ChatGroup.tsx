import Card from './Card';
import {
  Avatar,
  Box,
  Image,
  SkeletonCircle,
  SkeletonText,
  Text,
} from '@chakra-ui/react';
import { PageContext } from '../../contexts/PageContext';
import { useContext } from 'react';
import FadeImage from './utils/FadeImage';
import { Group } from '@omagize/api';

export function ChatGroup({
  active,
  group,
}: {
  group: Group;
  active: boolean;
}) {
  const activeColor = 'brand.400';
  const { setSelectedGroup } = useContext(PageContext);

  return (
    <Box
      transition="0.2s linear"
      mr={active ? '5px' : '10px'}
      filter="auto"
      brightness={active ? 1 : 0.7}
      onClick={() => setSelectedGroup(group.id)}
      _hover={{ cursor: 'pointer' }}
    >
      <Card pos="relative" overflow="hidden">
        <FadeImage
          src={group.bannerUrl}
          direction="to left"
          placeholder={activeColor}
          bg={active ? activeColor : 'black'}
          image={{
            filter: 'auto',
            brightness: active ? 0.9 : 0.7,
          }}
        />

        <Box pos="relative" maxW="70%" color="white">
          <Avatar name={group.name} src={group.iconUrl} />
          <Text mt={3} fontSize="lg" fontWeight="bold" lineHeight={1}>
            {group.name}
          </Text>
        </Box>
      </Card>
    </Box>
  );
}

export function ChatGroupSkeleton() {
  return (
    <Box mr="10px">
      <Card bg="black" overflow="hidden">
        <SkeletonCircle size="10" />
        <SkeletonText mt="3" noOfLines={2} spacing="4" />
      </Card>
    </Box>
  );
}