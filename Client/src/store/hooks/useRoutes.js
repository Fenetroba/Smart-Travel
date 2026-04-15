import { useSelector, useDispatch } from 'react-redux'
import { fetchRoutes, createRoute, deleteRouteData, updateRoute } from '../slices/routesSlice'

export const useRoutes = () => {
  const dispatch = useDispatch()
  const { items: routes, loading, error } = useSelector(state => state.routes)

  return {
    routes,
    loading,
    error,
    fetchRoutes: () => dispatch(fetchRoutes()),
    addRoute: (route) => dispatch(createRoute(route)),
    updateRoute: (id, route) => dispatch(updateRoute({ id, ...route })),
    deleteRoute: (id) => dispatch(deleteRouteData(id)),
  }
}

export default useRoutes
