import { Box, Flex, IconButton, Input } from '@chakra-ui/react';
import { Message, useInfiniteMessageQuery } from '@omagize/api';
import { MutableRefObject, useContext, useMemo, useRef, useState } from 'react';
import { PageContext } from '../../contexts/PageContext';
import { useInView } from 'react-intersection-observer';
import MessageItem, {
  MessageItemSkeleton,
} from 'components/card/chat/MessageItem';
import ErrorPanel from '../../components/card/ErrorPanel';
import Card from '../../components/card/Card';
import { FiFile, FiSend } from 'react-icons/fi';
import { GrEmoji } from 'react-icons/gr';

export default function ChatView() {
  const { selectedGroup } = useContext(PageContext);

  const [ready, ref] = useBottomScroll();
  const {
    data,
    error,
    isLoading,
    fetchPreviousPage,
    hasPreviousPage,
    isFetching,
    refetch,
  } = useInfiniteMessageQuery(selectedGroup);

  function mapPage(messages: Message[]) {
    return messages.map((message) => (
      <MessageItem key={message.id} {...message} />
    ));
  }
  if (error) {
    return <ErrorPanel error={error} retry={refetch} />;
  }

  return (
    <>
      <Flex
        ref={ref}
        overflow="auto"
        direction="column-reverse"
        h="full"
        minH="400px"
        gap={2}
      >
        {data == null ? null : [].concat(...data.pages.map(mapPage)).reverse()}
        {(isLoading || hasPreviousPage) && (
          <LoadingBlock
            isFetching={isFetching || !ready}
            onFetch={() => fetchPreviousPage()}
          />
        )}
      </Flex>
      <MessageBar />
    </>
  );
}

function MessageBar() {
  const [message, setMessage] = useState('');

  return (
    <Box w="full" px="20px" pb={5} mt="auto">
      <Card flexDirection="row" alignItems="center" gap={2}>
        <IconButton aria-label="add-file" icon={<FiFile />} />
        <IconButton aria-label="add-emoji" icon={<GrEmoji />} />
        <Input
          mx={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rounded="full"
          variant="message"
          placeholder="Input your message here..."
        />
        <IconButton
          disabled={message.length === 0}
          variant="brand"
          aria-label="send"
          icon={<FiSend />}
        />
      </Card>
    </Box>
  );
}

function useBottomScroll(): [
  boolean,
  MutableRefObject<HTMLDivElement>,
  () => void
] {
  const ref = useRef<HTMLDivElement>();
  const scroll = () => {
    const element = ref.current;
    if (element) {
      element.scrollTo(element.scrollLeft, element.scrollHeight);
    }
  };
  const ready = useMemo<boolean>(() => {
    scroll();
    return !!ref.current;
  }, [ref.current]);

  return [ready, ref, scroll];
}

function LoadingBlock(props: { isFetching: boolean; onFetch: () => void }) {
  const { ref } = useInView({
    onChange(inView, entry) {
      if (inView && !props.isFetching) {
        props.onFetch();
      }
    },
  });
  return (
    <Flex gap={2} direction="column" ref={ref}>
      <MessageItemSkeleton noOfLines={2} />
      <MessageItemSkeleton noOfLines={1} />
      <MessageItemSkeleton noOfLines={6} />
      <MessageItemSkeleton noOfLines={3} />
      <MessageItemSkeleton noOfLines={2} />
      <MessageItemSkeleton noOfLines={4} />
      <MessageItemSkeleton noOfLines={1} />
      <MessageItemSkeleton noOfLines={6} />
    </Flex>
  );
}