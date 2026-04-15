import { useSelector, useDispatch } from 'react-redux'
import {
  fetchTransports,
  updateTransportConfig,
} from '../../store/slices/transportSlice'

export const useTransport = () => {
  const dispatch = useDispatch()
  const { modes: transportModes, loading, error } = useSelector(state => state.transport)

  return {
    transportModes,
    loading,
    error,
    fetchTransports: () => dispatch(fetchTransports()),
    updateTransportMode: (id, config) => dispatch(updateTransportConfig(id, config)),
  }
}

export default useTransport
