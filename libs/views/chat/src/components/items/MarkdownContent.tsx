import { Box, Heading, PopoverTrigger } from '@chakra-ui/react';
import { AssetType, getAssetUrl, Message, Snowflake } from '@omagize/api';
import Markdown, { MarkdownToJSX } from 'markdown-to-jsx';
import { createContext, useContext, useMemo } from 'react';
import { EmojiEntity, EveryoneMention, StickerEntity, UserMention } from '@omagize/ui/editor';
import { UserPopup } from '@omagize/ui/components';
import { unescapeHtml, escapeHtml } from '@omagize/utils/common';

type Data = {
  mentions: Array<MentionData>;
};
type MentionData = {
  id: string;
  avatar?: string;
  name: string;
};

const DataContext = createContext<Data>({ mentions: [] });

const Blocked = () => <></>;
const DefaultOptions: MarkdownToJSX.Options = {
  overrides: {
    script: Blocked,
    iframe: Blocked,
    img: Blocked,
    h1: (props: any) => <Heading fontSize="xl">{props.children}</Heading>,
    Mention: Mention,
    Everyone: () => <EveryoneMention />,
    code: (props) => (
      <code>
        {typeof props.children === 'string' ? unescapeHtml(props.children) : props.children}
      </code>
    ),
    Emoji: ({ id }: { id: Snowflake }) => {
      return <EmojiEntity name={id} src={getAssetUrl(AssetType.Emojis, id)} />;
    },
    Sticker: ({ id }: { id: Snowflake }) => {
      return <StickerEntity name={id} src={getAssetUrl(AssetType.Stickers, id)} />;
    },
  },
};

export default function MarkdownContent({ message }: { message: Message }) {
  const mentions = message.mentions.map((m) => ({
    id: m.id,
    avatar: m.avatarUrl,
    name: m.username,
  }));
  const content = useMemo(
    () =>
      escapeHtml(message.content)
        .replace(/^\s$/gm, '<br>')
        .replace('\n', '\n \n')
        .replace(/&lt;(E|S):([0-9]*)&gt;/g, (_, type, id) => {
          switch (type) {
            case 'E':
              return `<Emoji id="${id}" />`;
            case 'S':
              return `<Sticker id="${id}" />`;
            default:
              return '';
          }
        })
        .replace(/&lt;@([0-9]*)&gt;/g, `<Mention id="$1" />`)
        .replace(/&lt;@everyone&gt;/g, '<Everyone />'),
    [message.content]
  );

  return (
    <DataContext.Provider value={{ mentions }}>
      <Markdown options={{ ...DefaultOptions }} children={content} />
    </DataContext.Provider>
  );
}

function Mention({ id }: { id: string }) {
  const { mentions } = useContext(DataContext);
  const mention = useMemo(() => mentions.find((m) => m.id === id), [id, mentions]);

  if (mention == null) {
    return <UserMention name="Deleted User" />;
  }

  return (
    <UserPopup user={mention.id}>
      <PopoverTrigger>
        <Box as="span">
          <UserMention avatar={mention.avatar} name={mention.name} />
        </Box>
      </PopoverTrigger>
    </UserPopup>
  );
}
