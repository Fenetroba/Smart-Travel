import { configureStore } from '@reduxjs/toolkit'
import hubsReducer from './slices/hubsSlice'
import routesReducer from './slices/routesSlice'
import transportReducer from './slices/transportSlice'
import authReducer from './slices/authSlice'

export const store = configureStore({
  reducer: {
    hubs: hubsReducer,
    routes: routesReducer,
    transport: transportReducer,
    auth: authReducer,
  },
})

export default store