import { ViewIcon, DeleteIcon } from '@chakra-ui/icons';
import {
  Avatar,
  Box,
  Button,
  Center,
  Flex,
  FlexProps,
  IconButton,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from '@chakra-ui/react';
import { CustomSticker, deleteAsset, likeAsset, unlikeAsset } from '@omagize/api';
import { useSelfUser } from '@omagize/data-access-api';
import { useChatStore } from '@omagize/data-access-store';
import { Card } from '@omagize/ui/components';
import { useColorsExtend } from '@omagize/ui/theme';
import { useMutation } from '@tanstack/react-query';
import { BsThreeDots } from 'react-icons/bs';
import { LikeButton, onDeleteSticker } from './AssetItem';

export default function StickerItem({ sticker }: { sticker: CustomSticker }) {
  const { id, name, url, author } = sticker;
  const store = useChatStore((s) => ({
    hasLike: s.liked_stickers?.some((e) => e.id === id),
    like: s.likeSticker,
    unlike: s.unlikeSticker,
  }));
  const { brand, textColor } = useColorsExtend(
    {
      textColor: 'navy.700',
      textColorBid: 'brand.500',
    },
    {
      textColor: 'white',
      textColorBid: 'white',
    }
  );

  const likeMutation = useMutation(
    (like: boolean) => (like ? likeAsset(id, 'sticker') : unlikeAsset(id, 'sticker')),
    {
      onSuccess: (_, _like) => {
        _like ? store.like(sticker) : store.unlike(id);
      },
    }
  );

  return (
    <Card flexDirection="column" p="20px">
      <Box mb={{ base: '20px', '2xl': '20px' }} position="relative">
        <Center pos="relative" w="full" h="150px" rounded="md" bg={brand}>
          <Image
            top={0}
            left={0}
            pos="absolute"
            src={url}
            w="full"
            h="full"
            objectFit="cover"
            filter="blur(8px)"
            opacity={0.3}
          />
          <Image src={url} w="100px" h="100px" pos="relative" />
        </Center>

        <LikeButton hasLike={store.hasLike} onClick={() => likeMutation.mutate(!store.hasLike)} />
      </Box>
      <Flex flexDirection="column" justify="space-between" h="100%">
        <Flex justify="space-between" direction="row" mb="auto">
          <Flex direction="column">
            <Text
              color={textColor}
              fontSize={{
                base: 'xl',
                xl: 'lg',
                '2xl': 'md',
                '3xl': 'lg',
              }}
              mb="5px"
              fontWeight="bold"
              me="14px"
            >
              {name}
            </Text>
            <Text
              color="secondaryGray.600"
              fontSize={{
                base: 'sm',
              }}
              fontWeight="400"
              me="14px"
            >
              {author.username}
            </Text>
          </Flex>
          <Avatar src={author.avatarUrl} name={author.username} size="sm" />
        </Flex>
        <Actions sticker={sticker} />
      </Flex>
    </Card>
  );
}

function Actions({ sticker, ...props }: { sticker: CustomSticker } & FlexProps) {
  const user = useSelfUser();
  const deleteMutation = useMutation(() => deleteAsset(sticker.id, 'stickers'), {
    onSuccess() {
      onDeleteSticker(sticker.id);
    },
  });

  return (
    <Flex direction="row" justify="end" gap={2} {...props}>
      <Button
        variant="darkBrand"
        color="white"
        fontSize="sm"
        fontWeight="500"
        borderRadius="70px"
        px="24px"
        py="5px"
      >
        View Sticker
      </Button>
      <Menu>
        <MenuButton
          as={IconButton}
          icon={<BsThreeDots />}
          aria-label="Actions"
          isLoading={deleteMutation.isLoading}
        />
        <MenuList>
          <MenuItem icon={<ViewIcon />}>View Info</MenuItem>
          {sticker.author.id === user.id && (
            <MenuItem color="red.400" icon={<DeleteIcon />} onClick={() => deleteMutation.mutate()}>
              Delete
            </MenuItem>
          )}
        </MenuList>
      </Menu>
    </Flex>
  );
}
