// Chakra imports
import {
  Button,
  Flex,
  Grid,
  SimpleGrid,
  HStack,
  Skeleton,
  SkeletonText,
  useDisclosure,
  IconButton,
  Tooltip,
  Icon,
  ButtonGroup,
} from '@chakra-ui/react';

// Custom components
import Banner from './components/Banner';

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { fetchLatestAssets as fetchCategoryAssets, CategoryAssets } from '@omagize/api';
import { BiHappy, BiRefresh, BiUpload } from 'react-icons/bi';
import { BsPeople } from 'react-icons/bs';
import CreateAssetModal from './components/modals/UploadAssetModal';
import EmoijItem from './components/assets/EmojiItem';
import StickerItem from './components/assets/StickerItem';
import { FaSadCry } from 'react-icons/fa';
import { SidePanel } from './SidePanel';
import { useNavigate } from 'react-router-dom';
import { Card, Placeholder, QueryStatusLayout, Repeat, SubHeading } from '@omagize/ui/components';
import { Keys } from '@omagize/data-access-api';

export function MarketplaceView() {
  const query = useQuery(Keys.market.assets, () => fetchCategoryAssets());
  const { isOpen, onClose, onOpen } = useDisclosure();

  return (
    <>
      <Grid
        mb="20px"
        gridTemplateColumns={{ base: '1fr', xl: 'repeat(2, 1fr)', '2xl': '1fr 0.46fr' }}
        gap={{ base: '20px', xl: '20px' }}
      >
        <Flex flexDirection="column" gridArea={{ xl: '1 / 1 / 2 / 3', '2xl': '1 / 1 / 2 / 2' }}>
          <Content query={query} openUploadModal={onOpen} />
        </Flex>
        <Flex flexDirection="column" gridArea={{ xl: '1 / 3 / 2 / 4', '2xl': '1 / 2 / 2 / 3' }}>
          <SidePanel recommends={query.data?.recommend} />
        </Flex>
      </Grid>
      <CreateAssetModal isOpen={isOpen} onClose={onClose} />
      <Button
        pos="fixed"
        right={{ base: '28px', md: '50px' }}
        bottom={{ base: '28px', md: '50px' }}
        leftIcon={<BiUpload />}
        onClick={onOpen}
        colorScheme="pink"
        size="lg"
        rounded="full"
      >
        Upload
      </Button>
    </>
  );
}

function Content({
  query,
  openUploadModal,
}: {
  query: UseQueryResult<CategoryAssets>;
  openUploadModal: () => void;
}) {
  const navigate = useNavigate();

  return (
    <>
      <Banner upload={openUploadModal} />
      <Flex direction="column" px={{ base: '12px', '3sm': '24px' }} gap="20px" mb="45px">
        <HStack justifyContent="space-between" flexWrap="wrap" gap={3} spacing={0}>
          <SubHeading>
            Latest Emojis
            <Tooltip label="Refresh Assets">
              <IconButton
                ml={2}
                icon={<BiRefresh />}
                aria-label="Refresh"
                isLoading={query.isRefetching}
                onClick={() => query.refetch()}
              />
            </Tooltip>
          </SubHeading>
          <ButtonGroup>
            <Button leftIcon={<BsPeople />} onClick={() => navigate('/user/explore/me')}>
              My Assets
            </Button>
          </ButtonGroup>
        </HStack>
        <LatestEmojis query={query} />
        <SubHeading mt="25px">New Stickers</SubHeading>
        <LatestStickers query={query} />
      </Flex>
    </>
  );
}

function AssetItemSkeleton() {
  return (
    <Card gap={5}>
      <Skeleton h="100px" rounded="lg" />
      <SkeletonText />
    </Card>
  );
}

function LatestEmojis({ query }: { query: UseQueryResult<CategoryAssets> }) {
  const emojis = query.data?.latest.emojis;

  return (
    <QueryStatusLayout
      query={query}
      watch={emojis}
      error="Failed to fetch Emojis"
      skeleton={
        <Repeat times={3}>
          <AssetItemSkeleton />
        </Repeat>
      }
      container={(c) => (
        <SimpleGrid columns={{ base: 1, '3sm': 2, '2xl': 3 }} gap="20px">
          {c}
        </SimpleGrid>
      )}
      placeholder={
        <Placeholder icon={<Icon as={BiHappy} w="40px" h="40px" />}>No More Emojis</Placeholder>
      }
    >
      {emojis?.map((emoji) => (
        <EmoijItem key={emoji.id} emoji={emoji} />
      ))}
    </QueryStatusLayout>
  );
}

function LatestStickers({ query }: { query: UseQueryResult<CategoryAssets> }) {
  const stickers = query.data?.latest.stickers;

  return (
    <QueryStatusLayout
      query={query}
      watch={stickers}
      error="Failed to fetch Stickers"
      skeleton={
        <Repeat times={3}>
          <AssetItemSkeleton />
        </Repeat>
      }
      container={(c) => (
        <SimpleGrid columns={{ base: 1, '3sm': 2, '2xl': 3 }} gap="20px">
          {c}
        </SimpleGrid>
      )}
      placeholder={
        <Placeholder icon={<Icon as={FaSadCry} w="40px" h="40px" />}>No More Stickers</Placeholder>
      }
    >
      {stickers?.map((sticker) => (
        <StickerItem key={sticker.id} sticker={sticker} />
      ))}
    </QueryStatusLayout>
  );
}
