import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import createLogger from 'redux-logger'
import rootReducer from '../reducers'

export default function configureStore(initialState) {
  let store
  if (process.env.NODE_ENV === 'development') {
    store = createStore(
      rootReducer,
      initialState,
      applyMiddleware(thunkMiddleware, createLogger())
    )
  } else {
    store = createStore(
      rootReducer,
      initialState,
      applyMiddleware(thunkMiddleware)
    )
  }

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
      const nextRootReducer = require('../reducers').default
      store.replaceReducer(nextRootReducer)
    })
  }

  return store
}