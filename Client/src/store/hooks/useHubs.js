import { useSelector, useDispatch } from 'react-redux'
import { fetchHubs, createHub, updateHubData, deleteHubData } from '../../store/slices/hubsSlice'

export const useHubs = () => {
  const dispatch = useDispatch()
  const { items: hubs, loading, error } = useSelector(state => state.hubs)

  return {
    hubs,
    loading,
    error,
    fetchHubs: () => dispatch(fetchHubs()),
    addHub: (hub) => dispatch(createHub(hub)),
    updateHub: (id, hub) => dispatch(updateHubData(id, hub)),
    deleteHub: (id) => dispatch(deleteHubData(id)),
  }
}

export default useHubs