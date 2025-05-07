import apiClient from './client'

const namespaceService = {
  // Get all namespaces
  getNamespaces: async () => {
    try {
      const response = await apiClient.get('/namespaces')
      return response.data.namespaces
    } catch (error) {
      console.error('Error fetching namespaces:', error)
      throw error
    }
  },
  
  // Crawl a website and create a new namespace
  crawlWebsite: async (url, depth = 2, maxPages = 20) => {
    try {
      const formData = new FormData()
      formData.append('url', url)
      formData.append('depth', depth)
      formData.append('max_pages', maxPages)
      
      const response = await apiClient.post('/crawl', formData)
      return response.data
    } catch (error) {
      console.error('Error crawling website:', error)
      throw error
    }
  }
}

export default namespaceService