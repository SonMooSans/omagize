import { editMessage, EditMessageBody, Message } from '@omagize/api';
import { Box, Button, ButtonGroup, Flex } from '@chakra-ui/react';
import { EditIcon } from '@chakra-ui/icons';
import { useMutation } from '@tanstack/react-query';
import { useMemo, useRef, useState } from 'react';
import { Descendant } from 'slate';
import { Slate } from 'slate-react';
import {
  createSlateEditor,
  useMessageInputPlugin,
  markdownToSlate,
  slateToMarkdown,
  SlateEditor,
} from '@omagize/ui/editor';
import { useMessageProvider } from '../../ChatView';

export function MessageEditInput({ message, onClose }: { message: Message; onClose: () => void }) {
  const input = useMessageProvider().input;

  const editor = useMemo(() => createSlateEditor(), []);
  const suggestionRef = useRef();
  const plugin = useMessageInputPlugin(editor, {
    useQuery: (v) => input.useSuggestion(v?.text),
    portal: suggestionRef,
  });
  const [value, setValue] = useState<Descendant[]>(() => markdownToSlate(message.content, message));
  const editMutation = useMutation(
    (body: EditMessageBody) => editMessage(message.id, message.channel, body),
    {
      onSuccess: onClose,
    }
  );

  const onSave = () => {
    const parsed = slateToMarkdown(editor);

    editMutation.mutate({
      content: parsed.markdown,
      mentions: parsed.mentions,
    });
  };

  return (
    <Flex direction="column" gap={2} w="full">
      <Box ref={suggestionRef} w="full" />
      <Slate
        editor={editor}
        value={value}
        onChange={(v) => {
          setValue(v);
          plugin.onChange(v);
        }}
      >
        <SlateEditor
          suggestions={plugin.suggestions}
          suggestionControl={plugin.suggestionControl}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              onClose();
              e.stopPropagation();
              e.preventDefault();
            }
          }}
        />
      </Slate>
      <ButtonGroup>
        <Button onClick={onClose}>Close</Button>
        <Button
          variant="action"
          leftIcon={<EditIcon />}
          isLoading={editMutation.isLoading}
          onClick={onSave}
        >
          Edit
        </Button>
      </ButtonGroup>
    </Flex>
  );
}
