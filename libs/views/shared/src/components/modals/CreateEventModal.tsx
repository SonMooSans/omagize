import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createGroupEvent, GroupDetail } from '@omagize/api';
import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Switch,
  Textarea,
} from '@chakra-ui/react';
import { BiRightArrow } from 'react-icons/bi';
import { Step, Steps } from '@omagize/ui/chakra-ui-steps';
import { useState } from 'react';
import { onlyTime, onlyDate } from '@omagize/utils/common';
import { UploadImage, BannerFormat } from '@omagize/utils/image';
import { useImagePickerCropSimple } from '@omagize/ui/components';
import { DateTimeForm } from '../panel/DateTimeForm';
import { Keys } from '@omagize/data-access-api';
import { ReactNode } from 'react';

function getInitialStart(): Date {
  const date = new Date(Date.now());
  date.setHours(date.getHours() + 1);
  return onlyTime(date);
}

export function CreateEventModal(props: { group: string; isOpen: boolean; onClose: () => void }) {
  const { group, isOpen, onClose } = props;
  const [value, setValue] = useState<EventOptions>({
    name: '',
    description: '',
    startAt: getInitialStart(),
  });
  const client = useQueryClient();
  const mutation = useMutation(
    ['create_group'],
    () =>
      createGroupEvent(
        value.image,
        value.name,
        value.description,
        value.startAt,
        value.endAt,
        value.place,
        group
      ),
    {
      onSuccess(created) {
        client.setQueryData(Keys.groupDetail(group), (prev: GroupDetail) => ({
          ...prev,
          events: [created, ...prev.events],
        }));
        onClose();
      },
    }
  );
  const [step, setStep] = useState(0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="2xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create Group Event</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Steps activeStep={step} width="100%">
            <Step label="Basic Info">
              <Form value={value} onChange={(v) => setValue((prev) => ({ ...prev, ...v }))} />
            </Step>
            <Step label="Advanced Settings">
              <AdvancedForm
                value={value}
                onChange={(v) => {
                  if (!mutation.isLoading) {
                    setValue((prev) => ({ ...prev, ...v }));
                  }
                }}
              />
            </Step>
          </Steps>
        </ModalBody>

        <ModalFooter>
          <Button mr={3} onClick={onClose}>
            Close
          </Button>
          {step === 0 && (
            <Button
              onClick={() => setStep(1)}
              disabled={value.name.length === 0}
              rightIcon={<BiRightArrow />}
            >
              Next
            </Button>
          )}
          {step === 1 && (
            <Button
              onClick={() => mutation.mutate()}
              isLoading={mutation.isLoading}
              variant="brand"
            >
              Create
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

type EventOptions = {
  image?: UploadImage;
  name: string;
  description: string;
  startAt: Date;
  endAt?: Date;
  place?: string;
};

type FormProps = {
  value: EventOptions;
  onChange: (options: Partial<EventOptions>) => void;
};

function AdvancedForm({ value, onChange }: FormProps) {
  const { minStart, maxStart, minEnd, maxEnd } = useLimits(value.startAt);

  return (
    <Flex flexDirection="column" gap={3} pt={5}>
      <FormControl>
        <FormLabel htmlFor="place">Take Place At</FormLabel>
        <Input
          id="place"
          value={value.place ?? ''}
          onChange={(e) => onChange({ place: e.target.value })}
          variant="main"
          placeholder="Where the Event happens?"
        />
      </FormControl>
      <FormControl isRequired>
        <FormLabel>Start Date</FormLabel>
        <DateTimeForm
          min={minStart}
          max={maxStart}
          value={value.startAt}
          onChange={(date: Date) => onChange({ startAt: date })}
        />
      </FormControl>
      <HStack align="center">
        <FormLabel mr={0}>End Date</FormLabel>
        <Switch
          colorScheme="brandScheme"
          isChecked={value.endAt != null}
          onChange={(e) => onChange({ endAt: e.target.checked ? minEnd : null })}
        />
      </HStack>
      <FormControl isDisabled={value.endAt == null}>
        <DateTimeForm
          min={minEnd}
          max={maxEnd}
          value={value.endAt}
          onChange={(date: Date) => onChange({ endAt: date })}
        />
      </FormControl>
    </Flex>
  );
}

function Form({
  value,
  onChange,
}: {
  value: EventOptions;
  onChange: (options: Partial<EventOptions>) => void;
  error?: ReactNode;
}) {
  const image = useImagePickerCropSimple(value.image, (v) => onChange({ image: v }), BannerFormat);

  return (
    <Flex flexDirection="column" gap={3} pt={5}>
      <Flex flexDirection="column" gap={3} w="300px" mx="auto">
        {image.component}
      </Flex>
      <FormControl isRequired>
        <FormLabel htmlFor="name">Event Name</FormLabel>
        <Input
          id="name"
          value={value.name}
          onChange={(e) => onChange({ name: e.target.value })}
          variant="main"
          placeholder="Give your Event a name"
        />
      </FormControl>
      <FormControl>
        <FormLabel>Event Description</FormLabel>
        <Textarea
          resize="none"
          h="100px"
          value={value.description}
          onChange={(e) => onChange({ description: e.target.value })}
          variant="main"
          placeholder="Give more details about your event"
        />
      </FormControl>
    </Flex>
  );
}

export function useLimits(startAt: Date) {
  const minStart = new Date(Date.now());
  const minEnd = startAt;

  //The event must be started within 2 months
  const maxStart = new Date(minStart);
  maxStart.setMonth(maxStart.getMonth() + 2);

  //The event cannot exceed 10 years
  const maxEnd = new Date(minEnd);
  maxEnd.setFullYear(maxEnd.getFullYear() + 1);

  return {
    minStart: onlyDate(minStart),
    maxStart: onlyDate(maxStart),
    minEnd: onlyDate(minEnd),
    maxEnd: onlyDate(maxEnd),
  };
}
