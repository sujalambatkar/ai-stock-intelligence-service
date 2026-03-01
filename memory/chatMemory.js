// Simple in-memory conversation store

const conversations = {};

// get conversation history
export const getConversation = (sessionId) => {
  if (!conversations[sessionId]) {
    conversations[sessionId] = [];
  }
  return conversations[sessionId];
};

// add message to history
export const addMessage = (sessionId, role, content) => {
  if (!conversations[sessionId]) {
    conversations[sessionId] = [];
  }

  conversations[sessionId].push({
    role,
    content,
  });

  // keep only last 10 messages (avoid token overload)
  conversations[sessionId] =
    conversations[sessionId].slice(-10);
};