import React, { useState, useEffect } from 'react';
import { getMessageThreads, getThreadMessages, sendMessage } from '../services/selfService';
import type { HrMessage } from '../types/selfService.ts';
import '../styles/HrMessagingPage.css';

const HrMessagingPage: React.FC = () => {
  const [threads, setThreads] = useState<string[]>([]);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [messages, setMessages] = useState<HrMessage[]>([]);
  const [newMessage, setNewMessage] = useState({ subject: '', body: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadThreads();
  }, []);

  useEffect(() => {
    if (selectedThread) {
      loadMessages(selectedThread);
    }
  }, [selectedThread]);

  const loadThreads = async () => {
    try {
      const data = await getMessageThreads();
      setThreads(data);
      if (data.length > 0 && !selectedThread) {
        setSelectedThread(data[0]);
      }
    } catch (err) {
      setError('Erreur lors du chargement des conversations');
    }
  };

  const loadMessages = async (threadId: string) => {
    try {
      setLoading(true);
      const data = await getThreadMessages(threadId);
      setMessages(data);
    } catch (err) {
      setError('Erreur lors du chargement des messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.body.trim()) return;

    try {
      setLoading(true);
      setError(null);
      await sendMessage({
        senderRole: 'EMPLOYEE',
        subject: selectedThread ? '' : newMessage.subject,
        body: newMessage.body,
        threadId: selectedThread || undefined,
      });
      setNewMessage({ subject: '', body: '' });
      
      if (selectedThread) {
        await loadMessages(selectedThread);
      } else {
        await loadThreads();
      }
    } catch (err) {
      setError('Erreur lors de l\'envoi du message');
    } finally {
      setLoading(false);
    }
  };

  const handleNewConversation = () => {
    setSelectedThread(null);
    setMessages([]);
  };

  return (
    <div className="hr-messaging-page">
      <h1>Messagerie RH</h1>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="messaging-container">
        <div className="threads-sidebar">
          <div className="sidebar-header">
            <h3>Conversations</h3>
            <button onClick={handleNewConversation} className="btn-small btn-primary">
              + Nouveau
            </button>
          </div>
          <div className="threads-list">
            {threads.length === 0 ? (
              <p className="no-data">Aucune conversation</p>
            ) : (
              threads.map((threadId) => (
                <div
                  key={threadId}
                  className={`thread-item ${selectedThread === threadId ? 'active' : ''}`}
                  onClick={() => setSelectedThread(threadId)}
                >
                  <div className="thread-title">{threadId}</div>
                  <small className="thread-date">Conversation</small>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="messages-area">
          {!selectedThread && messages.length === 0 ? (
            <div className="new-conversation-form">
              <h3>Nouvelle conversation avec RH</h3>
              <form onSubmit={handleSendMessage}>
                <div className="form-group">
                  <label>Sujet *</label>
                  <input
                    type="text"
                    value={newMessage.subject}
                    onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                    placeholder="Ex: Question sur bulletin de paie"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Message *</label>
                  <textarea
                    value={newMessage.body}
                    onChange={(e) => setNewMessage({ ...newMessage, body: e.target.value })}
                    rows={6}
                    placeholder="Votre message..."
                    required
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Envoi...' : 'Envoyer'}
                </button>
              </form>
            </div>
          ) : (
            <>
              <div className="messages-list">
                {loading && messages.length === 0 ? (
                  <div className="loading">Chargement...</div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`message ${msg.senderRole === 'EMPLOYEE' ? 'sent' : 'received'}`}
                    >
                      <div className="message-header">
                        <strong>
                          {msg.senderRole === 'EMPLOYEE' ? 'Vous' : msg.hrUserName || 'RH'}
                        </strong>
                        <span className="message-time">
                          {new Date(msg.sentAt!).toLocaleString('fr-FR')}
                        </span>
                      </div>
                      {msg.subject && (
                        <div className="message-subject">{msg.subject}</div>
                      )}
                      <div className="message-body">{msg.body}</div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSendMessage} className="message-compose">
                <textarea
                  value={newMessage.body}
                  onChange={(e) => setNewMessage({ ...newMessage, body: e.target.value })}
                  placeholder="Tapez votre message..."
                  rows={3}
                  required
                />
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Envoi...' : '📤 Envoyer'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HrMessagingPage;
