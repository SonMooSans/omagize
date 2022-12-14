// Chakra imports
import {
  Button,
  Flex,
  Text,
  SimpleGrid,
  Skeleton,
  SkeletonText,
  useDisclosure,
  IconButton,
  Tooltip,
  Icon,
} from '@chakra-ui/react';

import { useQuery } from '@tanstack/react-query';
import { fetchMyAssets, Assets } from '@omagize/api';
import { BiRefresh, BiUpload } from 'react-icons/bi';
import CreateAssetModal from '../components/modals/UploadAssetModal';
import EmoijItem from '../components/assets/EmojiItem';
import StickerItem from '../components/assets/StickerItem';
import { FaSadCry, FaThinkPeaks } from 'react-icons/fa';
import {
  QueryStatusLayout,
  PlaceholderLayout,
  HSeparator,
  Repeat,
  Placeholder,
  Card,
  SubHeading,
} from '@omagize/ui/components';
import { useChatStore } from '@omagize/data-access-store';
import { useColors } from '@omagize/ui/theme';
import { Keys } from '@omagize/data-access-api';

export function MyAssetsView() {
  const { isOpen, onClose, onOpen } = useDisclosure();

  return (
    <>
      <Content />
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

function Content() {
  const query = useQuery(Keys.market.me, () => fetchMyAssets(), {
    onSuccess(data) {
      useChatStore.setState({
        liked_emojis: data.favorites.emojis,
        liked_stickers: data.favorites.stickers,
      });
    },
  });

  const owned = query.data?.owned;

  return (
    <Flex direction="column" px={{ base: '15px', md: '24px' }} gap="20px" mb="200px">
      <SubHeading mr={6}>
        Favorite Assets
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
      <Favorites />
      <SubHeading mt="25px">Owned Assets</SubHeading>
      <QueryStatusLayout
        query={query}
        watch={owned && [...owned.stickers, ...owned.emojis]}
        error="Failed to fetch your assets"
        skeleton={
          <Repeat times={3}>
            <AssetItemSkeleton />
          </Repeat>
        }
        container={(c) => (
          <SimpleGrid columns={{ base: 1, '3sm': 2, md: 3, xl: 4 }} gap="20px" children={c} />
        )}
        placeholder={
          <Placeholder icon={<Icon as={FaSadCry} w="40px" h="40px" />}>No any Assets</Placeholder>
        }
      >
        <LatestStickers owned={query.data?.owned} />
      </QueryStatusLayout>
    </Flex>
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

function Favorites() {
  const { textColorSecondary } = useColors();
  const [emojis, stickers] = useChatStore((s) => [s.liked_emojis, s.liked_stickers]);

  return (
    <PlaceholderLayout
      watch={emojis}
      placeholder={
        <Placeholder icon={<Icon as={FaThinkPeaks} w="40px" h="40px" />}>Nothing here</Placeholder>
      }
    >
      <SimpleGrid columns={{ base: 1, '3sm': 2, md: 3, xl: 4 }} gap="20px">
        {emojis?.map((emoji) => (
          <EmoijItem key={emoji.id} emoji={emoji} />
        ))}
      </SimpleGrid>
      {stickers?.length > 0 && (
        <Flex align="center" direction="row" my={3}>
          <HSeparator />
          <Text mx={2} color={textColorSecondary}>
            Stickers
          </Text>
          <HSeparator />
        </Flex>
      )}
      <SimpleGrid columns={{ base: 1, '3sm': 2, md: 3, xl: 4 }} gap="20px">
        {stickers?.map((sticker) => (
          <StickerItem key={sticker.id} sticker={sticker} />
        ))}
      </SimpleGrid>
    </PlaceholderLayout>
  );
}

function LatestStickers({ owned }: { owned: Assets | null }) {
  return (
    <>
      {owned?.emojis.map((emoji) => (
        <EmoijItem key={emoji.id} emoji={emoji} />
      ))}
      {owned?.stickers.map((sticker) => (
        <StickerItem key={sticker.id} sticker={sticker} />
      ))}
    </>
  );
}
