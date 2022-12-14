import { Popover, PopoverBody, PopoverContent, PopoverProps } from '@chakra-ui/react';
import { useColors } from '@omagize/ui/theme';
import { ReactNode } from 'react';

export function Popup(props: { root: ReactNode; children: ReactNode; popover?: PopoverProps }) {
  const { cardBg } = useColors();

  return (
    <Popover isLazy {...props.popover} orientation="horizontal">
      {props.root}
      <PopoverContent bg={cardBg} overflow="hidden">
        <PopoverBody p={0}>{props.children}</PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
