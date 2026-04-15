import { useSelector, useDispatch } from 'react-redux'
import { login, logoutUser, clearError } from '../../store/slices/authSlice'

export const useAuth = () => {
  const dispatch = useDispatch()
  const { user, token, isAuthenticated, loading, error } = useSelector(state => state.auth)

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    login: (email, password) => dispatch(login(email, password)),
    logout: () => dispatch(logoutUser()),
    clearError: () => dispatch(clearError()),
  }
}

export default useAuth