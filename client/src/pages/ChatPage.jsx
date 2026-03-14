import { useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import SectionHeading from '../components/shared/SectionHeading';
import useAuth from '../context/useAuth';
import api from '../services/api';

const supportRoles = [
  { value: 'counsellor', label: 'Counsellor' },
  { value: 'peer_mentor', label: 'Peer Mentor' },
];

function ChatPage() {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState('');
  const [topicForm, setTopicForm] = useState({ topic: '', assignedRole: 'counsellor' });
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');
  const [conversationFilter, setConversationFilter] = useState('all');

  const supportSide = ['admin', 'counsellor', 'peer_mentor'].includes(user?.role);

  const fetchConversations = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/chat/conversations');
      const items = response.data.conversations || [];
      setConversations(items);
      if (!selectedConversationId && items.length) {
        setSelectedConversationId(items[0].id);
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load conversations right now.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    if (!conversationId) {
      setMessages([]);
      setSelectedConversation(null);
      return;
    }

    try {
      const response = await api.get(`/chat/conversations/${conversationId}/messages`);
      setMessages(response.data.messages || []);
      setSelectedConversation(response.data.conversation || null);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load messages right now.');
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    fetchMessages(selectedConversationId);
  }, [selectedConversationId]);

  useEffect(() => {
    const token = localStorage.getItem('mindhaven_token');
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: { token },
    });
    socketRef.current = socket;

    socket.on('receive-support-message', () => {
      fetchMessages(selectedConversationId);
      fetchConversations();
    });

    return () => {
      socket.disconnect();
    };
  }, [selectedConversationId]);

  useEffect(() => {
    if (socketRef.current) {
      if (selectedConversationId) {
        socketRef.current.emit('join-support-room', selectedConversationId);
      }
      if (supportSide) {
        socketRef.current.emit('join-support-global');
      }
    }
  }, [selectedConversationId, supportSide]);

  const handleConversationCreate = async (event) => {
    event.preventDefault();
    setStatusMessage('');
    setError('');

    try {
      const response = await api.post('/chat/conversations', topicForm);
      setTopicForm({ topic: '', assignedRole: 'counsellor' });
      setStatusMessage(response.data.message);
      await fetchConversations();
      setSelectedConversationId(response.data.conversation.id);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to start support chat right now.');
    }
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();
    if (!selectedConversationId || !messageText.trim()) {
      return;
    }

    setStatusMessage('');
    setError('');

    try {
      await api.post(`/chat/conversations/${selectedConversationId}/messages`, { content: messageText });
      socketRef.current?.emit('send-support-message', {
        conversationId: selectedConversationId,
        message: messageText,
      });
      setMessageText('');
      await fetchMessages(selectedConversationId);
      await fetchConversations();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to send message right now.');
    }
  };

  const handleStatusChange = async (status) => {
    if (!selectedConversationId) {
      return;
    }

    setStatusMessage('');
    setError('');

    try {
      const response = await api.patch(`/chat/conversations/${selectedConversationId}/status`, { status });
      setStatusMessage(response.data.message);
      await fetchMessages(selectedConversationId);
      await fetchConversations();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update conversation status right now.');
    }
  };

  const filteredConversations = useMemo(() => {
    if (conversationFilter === 'all') {
      return conversations;
    }

    return conversations.filter((conversation) => conversation.status === conversationFilter);
  }, [conversationFilter, conversations]);

  const unreadKey = supportSide ? 'unreadForSupport' : 'unreadForStudent';

  return (
    <div className="page-stack">
      <section className="panel compact-panel">
        <SectionHeading
          eyebrow="Support chat"
          title={supportSide ? 'Support inbox for student conversations' : 'Talk privately with a counsellor or peer mentor'}
          description={supportSide ? 'Unread counts, assigned ownership, and close/reopen controls are now built into the inbox.' : 'Your chat is private, persistent, and assigned to the right type of support person.'}
        />
      </section>

      <section className="grid-section two-up chat-layout">
        <div className="panel compact-panel chat-sidebar">
          {user?.role === 'student' ? (
            <form className="resource-form" onSubmit={handleConversationCreate}>
              <input type="text" name="topic" value={topicForm.topic} onChange={(event) => setTopicForm((current) => ({ ...current, topic: event.target.value }))} placeholder="What would you like help with?" required />
              <select name="assignedRole" value={topicForm.assignedRole} onChange={(event) => setTopicForm((current) => ({ ...current, assignedRole: event.target.value }))}>
                {supportRoles.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
              </select>
              <button className="button primary" type="submit">Start conversation</button>
            </form>
          ) : (
            <div className="chat-filter-row">
              <button type="button" className={conversationFilter === 'all' ? 'chip-button active' : 'chip-button'} onClick={() => setConversationFilter('all')}>All</button>
              <button type="button" className={conversationFilter === 'open' ? 'chip-button active' : 'chip-button'} onClick={() => setConversationFilter('open')}>Open</button>
              <button type="button" className={conversationFilter === 'closed' ? 'chip-button active' : 'chip-button'} onClick={() => setConversationFilter('closed')}>Closed</button>
            </div>
          )}

          {statusMessage ? <p className="form-success">{statusMessage}</p> : null}
          {error ? <p className="form-error">{error}</p> : null}
          <div className="chat-conversation-list">
            {loading ? <p>Loading conversations...</p> : filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                className={selectedConversationId === conversation.id ? 'chat-conversation-item active' : 'chat-conversation-item'}
                onClick={() => setSelectedConversationId(conversation.id)}
              >
                <div className="chat-conversation-head">
                  <strong>{conversation.topic}</strong>
                  {conversation[unreadKey] ? <span className="chat-badge">{conversation[unreadKey]}</span> : null}
                </div>
                <span>{conversation.assignedRole.replace('_', ' ')}</span>
                {supportSide ? <span>{conversation.studentName}</span> : null}
                <div className="chat-conversation-meta">
                  <span>{conversation.status}</span>
                  <span>{conversation.lastMessagePreview || 'No messages yet'}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="panel compact-panel chat-panel">
          {selectedConversationId && selectedConversation ? (
            <>
              <div className="chat-panel-header">
                <div>
                  <h3>{selectedConversation.topic}</h3>
                  <p>
                    {supportSide ? `Student: ${selectedConversation.studentName}` : `Assigned ${selectedConversation.assignedRole.replace('_', ' ')}`}
                    {selectedConversation.assignedSupportName ? ` • ${selectedConversation.assignedSupportName}` : ''}
                  </p>
                  {supportSide ? (
                    <span className={selectedConversation.assignedSupportStatus === 'online' ? 'status-chip online' : 'status-chip'}>
                      {selectedConversation.assignedSupportStatus === 'online' ? 'Support online' : 'Support offline'}
                    </span>
                  ) : null}
                </div>
                <div className="chat-panel-actions">
                  {selectedConversation.status === 'open' ? (
                    <button type="button" className="text-button danger-text" onClick={() => handleStatusChange('closed')}>Close conversation</button>
                  ) : (
                    <button type="button" className="text-button" onClick={() => handleStatusChange('open')}>Reopen conversation</button>
                  )}
                </div>
              </div>
              <div className="chat-messages">
                {messages.map((message) => (
                  <article key={message.id} className={message.senderRole === user?.role ? 'chat-bubble mine' : 'chat-bubble'}>
                    <span>{message.senderRole.replace('_', ' ')}</span>
                    <p>{message.content}</p>
                    <small>{new Date(message.createdAt).toLocaleString()}</small>
                  </article>
                ))}
              </div>
              <form className="chat-form" onSubmit={handleSendMessage}>
                <textarea rows="4" value={messageText} onChange={(event) => setMessageText(event.target.value)} placeholder={selectedConversation.status === 'closed' ? 'Reopen the conversation to continue messaging.' : 'Write a confidential message...'} disabled={selectedConversation.status === 'closed'} />
                <button className="button primary" type="submit" disabled={selectedConversation.status === 'closed'}>Send message</button>
              </form>
            </>
          ) : (
            <div className="chat-empty-state">
              <p>{user?.role === 'student' ? 'Start a conversation to begin chatting with support.' : 'Select a conversation to review messages.'}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default ChatPage;
