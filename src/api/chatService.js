import apiClient from './client'

const chatService = {
  // Send a message and get a response
  sendMessage: async (namespace, message, conversationId = '', serviceStyle = 'informational', history = []) => {
    try {
      const formData = new FormData()
      formData.append('namespace', namespace)
      formData.append('message', message)
      formData.append('conversation_id', conversationId)
      formData.append('service_style', serviceStyle)
      formData.append('history', JSON.stringify(history))
      
      const response = await apiClient.post('/chat', formData)
      return response.data
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }
}

export default chatService