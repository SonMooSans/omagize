import {
  Button,
  ButtonGroup,
  Flex,
  FormControl,
  Grid,
  HStack,
  Input,
  Show,
} from '@chakra-ui/react';
import { createRole, Snowflake, updateRoles, UpdateRolesOptions } from '@omagize/api';
import { useGroupDetailQuery } from '@omagize/data-access-api';
import { QueryStatus, LoadingPanel, SaveBar } from '@omagize/ui/components';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { SelectedRole, usePermissionManagePanel } from './PermissionManagePanel';
import { DefaultRoleItem, Roles } from './Roles';

export function RolePanel({ groupId }: { groupId: Snowflake }) {
  const query = useGroupDetailQuery(groupId);
  const [name, setName] = useState('');
  const [value, setValue] = useState<UpdateRolesOptions>({});
  const [open, setOpen] = useState<SelectedRole | null>();
  const panel = usePermissionManagePanel(open, () => setOpen(null), value, setValue);
  const group = query.data;

  const onDragEnd = ({ source, destination, draggableId }: DropResult) => {
    if (destination == null || source.index === destination.index) return;
    const updates = {
      [draggableId]: destination.index,
    };
    const type = source.index > destination.index ? 'forward' : 'backward';

    for (const role of group.roles) {
      const position = value?.positions?.[role.id] ?? role.position;

      if (type === 'forward' && position >= destination.index && position < source.index) {
        updates[role.id] = position + 1;
      }
      if (type === 'backward' && position > source.index && position <= destination.index) {
        updates[role.id] = position - 1;
      }
    }

    setValue((prev) => {
      return {
        ...prev,
        positions: {
          ...prev.positions,
          ...updates,
        },
      };
    });
  };

  return (
    <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={3}>
      <QueryStatus loading={<LoadingPanel size="sm" />} query={query} error="Failed to load roles">
        <Flex direction="column" gap={3}>
          <CreateRolePanel group={groupId} name={name} setName={setName} />
          <DragDropContext onDragEnd={onDragEnd}>
            <Roles
              roles={group?.roles.map((role) => ({
                ...role,
                ...value.roles?.[role.id],
                position: value.positions?.[role.id] ?? role.position,
              }))}
              selected={open}
              setSelected={setOpen}
            />
          </DragDropContext>
          <DefaultRoleItem
            selected={open?.type === 'default_role'}
            role={group?.defaultRole}
            onClick={() =>
              setOpen({
                type: 'default_role',
                role: group?.defaultRole,
              })
            }
          />
        </Flex>
      </QueryStatus>
      <Show above="lg">{panel.asComponent()}</Show>
      <Show below="lg">{panel.asModal()}</Show>
      <RolesSaveBar group={query.data?.id} value={value} reset={() => setValue({})} />
    </Grid>
  );
}

function CreateRolePanel({
  group,
  name,
  setName,
}: {
  group: Snowflake;
  name: string;
  setName: (v: string) => void;
}) {
  const mutation = useMutation(() => createRole(group, name));

  return (
    <FormControl>
      <HStack>
        <Input
          w="full"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          variant="focus"
          placeholder="Role name..."
        />
        <Button
          variant="brand"
          isLoading={mutation.isLoading}
          onClick={() => mutation.mutate()}
          disabled={mutation.isLoading || name.trim().length === 0}
        >
          Create
        </Button>
      </HStack>
    </FormControl>
  );
}

function RolesSaveBar({
  value,
  group,
  reset,
}: {
  value: UpdateRolesOptions;
  group: Snowflake;
  reset: () => void;
}) {
  const mutation = useMutation(() => updateRoles(group, value), {
    onSuccess() {
      reset();
    },
  });

  return (
    <SaveBar isOpen={Object.entries(value).length !== 0}>
      <ButtonGroup isDisabled={mutation.isLoading} ml="auto">
        <Button
          rounded="full"
          colorScheme="green"
          isLoading={mutation.isLoading}
          onClick={() => mutation.mutate()}
        >
          Save
        </Button>
        <Button rounded="full" onClick={reset}>
          Discard
        </Button>
      </ButtonGroup>
    </SaveBar>
  );
}