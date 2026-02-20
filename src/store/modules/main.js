import client from '@/store/api/client'
import crisp from '@/lib/crisp'
import peopleApi from '@/store/api/people'
import {
  USER_LOGIN,
  TOGGLE_DARK_THEME,
  SET_THEME,
  TOGGLE_SIDEBAR,
  TOGGLE_SUPPORT_CHAT,
  TOGGLE_USER_MENU,
  SET_CONFIG,
  SET_CURRENT_SECTION,
  SET_LAST_PRODUCTION_SCREEN,
  SET_CURRENT_PRODUCTION,
  SHOW_PREVIEW_FILE,
  HIDE_PREVIEW_FILE,
  RESET_ALL
} from '@/store/mutation-types'

export const THEME_LIST = [
  { value: 'light', isDark: false },
  { value: 'dark', isDark: true },
  { value: 'midnight', isDark: true },
  { value: 'forest', isDark: true },
  { value: 'sunset', isDark: true },
  { value: 'high-contrast', isDark: true }
]

export const THEME_MAP = Object.fromEntries(THEME_LIST.map(t => [t.value, t]))

const initialState = {
  currentProductionScreen: 'assets',
  currentSection: 'assets',
  currentTheme: 'light',
  isSidebarHidden: true,
  isSupportChat: true,
  isUserMenuHidden: true,
  lastProductionScreen: 'assets',
  lastProductionViewed: null,
  mainConfig: {},
  previewFileIdToShow: ''
}

const state = { ...initialState }

const getters = {
  currentProductionScreen: state => state.currentProductionScreen,
  currentSection: state => state.currentSection,
  currentTheme: state => state.currentTheme,
  isDarkTheme: state => {
    const theme = THEME_MAP[state.currentTheme]
    return theme ? theme.isDark : false
  },
  isSidebarHidden: state => state.isSidebarHidden,
  isSupportChat: state => state.isSupportChat,
  isUserMenuHidden: state => state.isUserMenuHidden,
  lastProductionScreen: state => state.lastProductionScreen,
  lastProductionViewed: state => state.lastProductionViewed,
  mainConfig: state => state.mainConfig,
  previewFileIdToShow: state => state.previewFileIdToShow
}

const actions = {
  setTheme({ commit, state, rootGetters }, theme) {
    commit(SET_THEME, theme)
    if (localStorage) {
      localStorage.setItem('theme', theme)
    }
    // Persist to server if user is logged in
    const user = rootGetters.user
    if (user && user.id) {
      peopleApi.updatePerson({ id: user.id, theme }).catch(err => {
        console.error('Failed to save theme preference:', err)
      })
    }
  },

  toggleDarkTheme({ commit, state, dispatch }) {
    const newTheme = state.currentTheme === 'light' ? 'dark' : 'light'
    dispatch('setTheme', newTheme)
  },

  setSupportChat({ commit, state }, isSupportChat) {
    commit(TOGGLE_SUPPORT_CHAT, isSupportChat)
    crisp.setChatVisibility(isSupportChat)
  },

  toggleSidebar({ commit, state }) {
    commit(TOGGLE_SIDEBAR)
  },

  toggleUserMenu({ commit, state }) {
    commit(TOGGLE_USER_MENU)
  },

  setCurrentSection({ commit, state }, section) {
    commit(SET_CURRENT_SECTION, section)
  },

  setLastProductionScreen({ commit, state }, lastProductionScreen) {
    commit(SET_LAST_PRODUCTION_SCREEN, lastProductionScreen)
  },

  loadEvents({ commit, state }, { after, before }) {
    return client.getEvents(after, before)
  },

  async setMainConfig({ commit }) {
    let config = {}
    try {
      config = await client.getConfig()
    } catch (error) {
      console.error(error)
    }
    commit(SET_CONFIG, config)
    return config
  },

  searchData(_, { query, limit = 3, offset = 0, productionId, index_names }) {
    return client.searchData(query, limit, offset, index_names, productionId)
  }
}

const mutations = {
  [SET_THEME](state, theme) {
    if (THEME_MAP[theme]) {
      state.currentTheme = theme
    }
  },

  [TOGGLE_DARK_THEME](state, isDarkTheme = undefined) {
    // Backward compat: if called with a boolean, set theme accordingly
    if (isDarkTheme === true) {
      state.currentTheme = 'dark'
    } else if (isDarkTheme === false) {
      state.currentTheme = 'light'
    } else {
      // Toggle between light and dark
      const theme = THEME_MAP[state.currentTheme]
      state.currentTheme = theme && theme.isDark ? 'light' : 'dark'
    }
  },

  [TOGGLE_SUPPORT_CHAT](state, isSupportChat) {
    state.isSupportChat = isSupportChat
  },

  [TOGGLE_SIDEBAR](state) {
    state.isSidebarHidden = !state.isSidebarHidden
  },

  [TOGGLE_USER_MENU](state) {
    state.isUserMenuHidden = !state.isUserMenuHidden
  },

  [SET_CURRENT_SECTION](state, section) {
    state.currentSection = section
  },

  [SET_LAST_PRODUCTION_SCREEN](state, lastProductionScreen) {
    state.lastProductionScreen = lastProductionScreen
  },

  [SET_CURRENT_PRODUCTION](state, productionId) {
    if (productionId) state.lastProductionViewed = productionId
  },

  [USER_LOGIN](state, user) {
    if (user && user.role === 'client') {
      state.lastProductionScreen = 'playlists'
    }
  },

  [SHOW_PREVIEW_FILE](state, previewFileId) {
    state.previewFileIdToShow = previewFileId
  },

  [HIDE_PREVIEW_FILE](state) {
    state.previewFileIdToShow = ''
  },

  [SET_CONFIG](state, mainConfig) {
    state.mainConfig = mainConfig
  },

  [RESET_ALL](state) {
    Object.assign(state, {
      ...initialState,
      mainConfig: state.mainConfig,
      currentTheme: state.currentTheme
    })
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
