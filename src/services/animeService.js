import api from './api'



export const getAnimeList = async (params = {}) => {
  const response = await api.get('/anime', { params })
  return response.data
}
