import { useQuery, useMutation, useQueryClient } from 'react-query'
import namespaceService from '../api/namespaceService'
import chatService from '../api/chatService'

// Hook for namespaces
export const useNamespaces = () => {
  return useQuery('namespaces', namespaceService.getNamespaces, {
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook for crawling a website
export const useCrawlWebsite = () => {
  const queryClient = useQueryClient()
  
  return useMutation(
    ({ url, depth, maxPages }) => namespaceService.crawlWebsite(url, depth, maxPages),
    {
      onSuccess: () => {
        // Invalidate the namespaces query to refresh the list
        queryClient.invalidateQueries('namespaces')
      }
    }
  )
}

// Hook for chat
export const useSendMessage = () => {
  return useMutation(
    ({ namespace, message, conversationId, serviceStyle, history }) => 
      chatService.sendMessage(namespace, message, conversationId, serviceStyle, history)
  )
}