import { useUserStore } from 'stores/UserStore';
import {
  FriendRemovedEvent,
  addGroupEvent,
  addMessage,
  client,
  dispatchUser,
  EventType,
  FriendRequest,
  FriendRequestAddedEvent,
  FriendRequestRepliedEvent,
  FriendRequestReply,
  GatewayMessage,
  Group,
  GroupAddedEvent,
  GroupDetail,
  GroupEvent,
  Keys,
  LoginPayload,
  Message,
  OpCode,
  RawGroupDetail,
  RawGroupEvent,
  RawMemberClip,
  RawMessage,
  RawSelfUser,
  SelfUser,
  User,
  FriendRequestType,
  Friend,
} from '@omagize/api';

export function handleEvent(message: GatewayMessage<unknown>) {
  if (message.op !== OpCode.Dispatch) return;

  switch (message.t) {
    case EventType.GroupUpdated: {
      onGroupUpdate(message as GatewayMessage<RawGroupDetail>);
      break;
    }
    case EventType.GroupAdded: {
      onGroupAdded(message as GatewayMessage<GroupAddedEvent>);
      break;
    }
    case EventType.UserUpdated: {
      onUserUpdated(message as GatewayMessage<RawSelfUser>);
      break;
    }
    case EventType.GroupEventCreated: {
      onGroupEvent(message as GatewayMessage<RawGroupEvent>);
      break;
    }
    case EventType.GroupRemoved: {
      onGroupRemoved(message as GatewayMessage<RawMemberClip>);
      break;
    }
    case EventType.MessageCreated: {
      onReceiveMessage(message as GatewayMessage<RawMessage>);
      break;
    }
    case EventType.FriendRequestAdded: {
      onFriendRequestAdded(message as GatewayMessage<FriendRequestAddedEvent>);
      break;
    }
    case EventType.FriendRequestReplied: {
      onFriendRequestReplied(
        message as GatewayMessage<FriendRequestRepliedEvent>
      );
      break;
    }
    case EventType.FriendRemoved: {
      const event = (message as GatewayMessage<FriendRemovedEvent>).d;

      useUserStore.setState((prev) => ({
        friends: prev.friends.filter((f) => f.user.id !== event.user),
      }));
      break;
    }
    default: {
      console.log(`Unknown event ${message.t}`);
    }
  }
}

function onFriendRequestAdded(event: GatewayMessage<FriendRequestAddedEvent>) {
  const self = client.getQueryData<LoginPayload>(Keys.login).user;
  const raw = event.d;
  const incoming = self.id !== raw.from.id;

  const request: FriendRequest = {
    user: new User(incoming ? raw.from : raw.to),
    message: event.d.message,
    type: incoming ? FriendRequestType.Incoming : FriendRequestType.Outgoing,
  };
  useUserStore.getState().addFriendRequest(request);
}

function onFriendRequestReplied(
  event: GatewayMessage<FriendRequestRepliedEvent>
) {
  const data = event.d;

  useUserStore.setState((prev) => ({
    friendRequests: prev.friendRequests.filter((request) => {
      if (request.type === FriendRequestType.Incoming) {
        return request.user.id !== data.from;
      } else {
        return request.user.id !== data.to;
      }
    }),
    friends:
      data.reply === FriendRequestReply.Accepted
        ? prev.friends
        : [...prev.friends, Friend(data.friend)],
  }));
}

function onReceiveMessage(event: GatewayMessage<RawMessage>) {
  const message = Message(event.d);

  return addMessage(message);
}

function onUserUpdated(event: GatewayMessage<RawSelfUser>) {
  const user = new SelfUser(event.d);

  return dispatchUser(user);
}

function onGroupEvent(event: GatewayMessage<RawGroupEvent>) {
  const e = GroupEvent(event.d);

  return addGroupEvent(e);
}

function onGroupUpdate(event: GatewayMessage<RawGroupDetail>) {
  const updated = GroupDetail(event.d);

  useUserStore.getState().updateGroup(updated);

  client.setQueryData<GroupDetail>(Keys.groupDetail(updated.id), updated);
}

function onGroupAdded(event: GatewayMessage<GroupAddedEvent>) {
  const group = Group(event.d.group);

  return useUserStore.getState().addGroup(group);
}

function onGroupRemoved(event: GatewayMessage<RawMemberClip>) {
  const clip = event.d;

  useUserStore.getState().removeGroup(clip.group);
}
