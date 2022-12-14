import {
  Button,
  Center,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Icon,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { createEmoji, createSticker, parseError } from '@omagize/api';
import { onCreatedEmoji, onCreatedSticker } from '@omagize/data-access-api';
import { Card, TabButton, useImagePickerCropSimple } from '@omagize/ui/components';
import { EmojiEntity } from '@omagize/ui/editor';
import { StickerFormat, supportedImageTypes, EmojiFormat } from '@omagize/utils/image';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { BiUpload } from 'react-icons/bi';
import { FaImage } from 'react-icons/fa';

export default function CreateAssetModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create Asset</ModalHeader>
        <ModalCloseButton />
        <Body onClose={onClose} />
      </ModalContent>
    </Modal>
  );
}

function Body({ onClose }: { onClose: () => void }) {
  const [current, setCurrent] = useState(0);
  const emoji = useEmojiForm(onClose);
  const sticker = useStickerForm(onClose);

  return (
    <>
      <ModalBody>
        <Tabs index={current} onChange={setCurrent} variant="soft-rounded">
          <TabList>
            <TabButton>Emoji</TabButton>
            <TabButton>Sticker</TabButton>
          </TabList>
          <TabPanels>
            <TabPanel pb={0}>{emoji.component}</TabPanel>
            <TabPanel pb={0}>{sticker.component}</TabPanel>
          </TabPanels>
        </Tabs>
      </ModalBody>
      <ModalFooter gap={2}>
        <Button onClick={onClose}>Close</Button>
        {current === 0 && emoji.actions}
        {current === 1 && sticker.actions}
      </ModalFooter>
    </>
  );
}

function useStickerForm(onClose: () => void) {
  const [name, setName] = useState('');
  const [image, setImage] = useState<Blob>();
  const picker = useImagePickerCropSimple(image, setImage, StickerFormat, {
    input: {
      accept: `${supportedImageTypes} .svg`,
    },
    holder: <ImageHolder />,
    preview: {
      w: '150px',
      h: '150px',
    },
  });

  const mutation = useMutation(() => createSticker(name, image), {
    onSuccess: (sticker) => {
      onCreatedSticker(sticker);
      onClose();
    },
  });

  return {
    actions: (
      <Button
        leftIcon={<BiUpload />}
        onClick={() => mutation.mutate()}
        variant="brand"
        isLoading={mutation.isLoading}
        disabled={mutation.isLoading || name.length === 0 || image == null}
      >
        Upload
      </Button>
    ),
    component: (
      <FormControl isRequired isInvalid={mutation.isError}>
        <Center maxH="500px">{picker.component}</Center>
        <FormLabel htmlFor="emoji-name">Name</FormLabel>
        <Input
          id="emoji-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          variant="main"
          placeholder="Give it a cool name"
        />
        <FormErrorMessage>{parseError(mutation.error, 'Failed to upload')}</FormErrorMessage>
      </FormControl>
    ),
  };
}

function useEmojiForm(onClose: () => void) {
  const [name, setName] = useState('');
  const [image, setImage] = useState<Blob>();
  const picker = useImagePickerCropSimple(image, setImage, EmojiFormat, {
    input: {
      accept: `${supportedImageTypes} .svg`,
    },
    holder: <ImageHolder />,
    preview: {
      w: '100px',
      h: '100px',
    },
  });

  const mutation = useMutation(() => createEmoji(name, image), {
    onSuccess: (emoji) => {
      onCreatedEmoji(emoji);
      onClose();
    },
  });

  return {
    actions: (
      <Button
        leftIcon={<BiUpload />}
        onClick={() => mutation.mutate()}
        variant="brand"
        isLoading={mutation.isLoading}
        disabled={mutation.isLoading || name.length === 0 || image == null}
      >
        Upload
      </Button>
    ),
    component: (
      <FormControl isRequired isInvalid={mutation.isError}>
        <Center maxH="500px">{picker.component}</Center>
        <FormLabel htmlFor="emoji-name">Name</FormLabel>
        <Input
          id="emoji-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          variant="main"
          placeholder="Give it a cool name"
        />
        <FormErrorMessage>{parseError(mutation.error, 'Failed to upload')}</FormErrorMessage>
        <Card mt={5}>
          <Text fontWeight="600">Preview</Text>
          <Text as="span" align="center" display="inline-flex">
            Hello World {picker.url != null && <EmojiEntity src={picker.url} name={name} />}
          </Text>
        </Card>
      </FormControl>
    ),
  };
}

export function ImageHolder() {
  const bannerBg = useColorModeValue('blackAlpha.200', 'whiteAlpha.200');

  return (
    <Center w="full" h="full" bg={bannerBg} p={5}>
      <Icon as={FaImage} />
    </Center>
  );
}
