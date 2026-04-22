from datetime import datetime

from bson.objectid import ObjectId
from flask import request
from flask_jwt_extended import decode_token
from flask_socketio import disconnect, emit, join_room

from models import Conversation, Message

# Track connected users by socket id for event authorization.
_connected_users = {}


def _get_current_user_id():
    return _connected_users.get(request.sid)


def _is_conversation_participant(conversation_id, user_id):
    try:
        conv = Conversation.collection.find_one({'_id': ObjectId(conversation_id)})
    except Exception:
        return None

    if not conv:
        return None

    participant_ids = {str(pid) for pid in conv.get('participants', [])}
    if str(user_id) not in participant_ids:
        return None

    return conv


def register_socket_events(socketio):
    @socketio.on('connect')
    def on_connect(auth):
        token = (auth or {}).get('token') if isinstance(auth, dict) else None
        if not token:
            return False

        try:
            decoded = decode_token(token)
            user_id = str(decoded.get('sub'))
            if not user_id:
                return False
        except Exception:
            return False

        _connected_users[request.sid] = user_id
        join_room(f'user:{user_id}')
        emit('socket_connected', {'user_id': user_id})

    @socketio.on('disconnect')
    def on_disconnect():
        _connected_users.pop(request.sid, None)

    @socketio.on('join_conversation')
    def on_join_conversation(payload):
        current_user_id = _get_current_user_id()
        if not current_user_id:
            disconnect()
            return

        conversation_id = (payload or {}).get('conversation_id')
        if not conversation_id:
            emit('chat_error', {'error': 'conversation_id is required'})
            return

        conv = _is_conversation_participant(conversation_id, current_user_id)
        if not conv:
            emit('chat_error', {'error': 'Conversation not found or access denied'})
            return

        join_room(f'conversation:{conversation_id}')

    @socketio.on('send_message')
    def on_send_message(payload):
        current_user_id = _get_current_user_id()
        if not current_user_id:
            disconnect()
            return

        conversation_id = (payload or {}).get('conversation_id')
        text = ((payload or {}).get('text') or '').strip()

        if not conversation_id:
            emit('chat_error', {'error': 'conversation_id is required'})
            return

        if not text:
            emit('chat_error', {'error': 'Message text is required'})
            return

        conv = _is_conversation_participant(conversation_id, current_user_id)
        if not conv:
            emit('chat_error', {'error': 'Conversation not found or access denied'})
            return

        msg_doc = {
            'conversation_id': conv['_id'],
            'sender_id': ObjectId(current_user_id),
            'text': text,
            'is_read': False,
            'created_at': datetime.utcnow()
        }

        res = Message.collection.insert_one(msg_doc)
        Conversation.collection.update_one(
            {'_id': conv['_id']},
            {'$set': {'last_message_at': datetime.utcnow()}}
        )

        stored = Message.collection.find_one({'_id': res.inserted_id})
        message_payload = Message.to_dict(stored)

        # Broadcast to other participants in the conversation room.
        emit(
            'new_message',
            message_payload,
            to=f'conversation:{conversation_id}',
            include_self=False
        )

        # Also emit directly to the sender so the UI updates instantly even if
        # room-join happened after connect/reconnect.
        emit('new_message', message_payload, to=request.sid)
