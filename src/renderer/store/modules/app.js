import Cookies from 'js-cookie'

const DEFINE_SIDEBAR_STATUS = 'sidebarStatus'

const app = {
  state: {
    sidebar: {
      opened: !+Cookies.get(DEFINE_SIDEBAR_STATUS),
      withoutAnimation: false
    },
    device: 'desktop'
  },
  mutations: {
    TOGGLE_SIDEBAR: state => {
      if (state.sidebar.opened) {
        Cookies.set(DEFINE_SIDEBAR_STATUS, 1)
      } else {
        Cookies.set(DEFINE_SIDEBAR_STATUS, 0)
      }
      state.sidebar.opened = !state.sidebar.opened
    },
    CLOSE_SIDEBAR: (state, withoutAnimation) => {
      Cookies.set(DEFINE_SIDEBAR_STATUS, 1)
      state.sidebar.opened = false
      state.sidebar.withoutAnimation = withoutAnimation
    },
    TOGGLE_DEVICE: (state, device) => {
      state.device = device
    }
  },
  actions: {
    ToggleSideBar: ({ commit }) => {
      commit('TOGGLE_SIDEBAR')
    },
    CloseSideBar ({ commit }, { withoutAnimation }) {
      commit('CLOSE_SIDEBAR', withoutAnimation)
    },
    ToggleDevice ({ commit }, device) {
      commit('TOGGLE_DEVICE', device)
    }
  }
}

export default app
