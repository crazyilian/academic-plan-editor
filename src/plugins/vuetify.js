import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    options: {
      customProperties: true
    },
    themes: {
      light: {
        teal: "#25a825",
        create: "#51bb19",
        createDark: "#216700",
        createLight: "#8cd566",
        error: "#ff5252",
        errorSecondary: "#cc6e6e",
        errorLight: "#ff9f9f",
        edit: "#deca35",
        editSecondary: "#c1b459",
        accent: "#525252",
      },
    },
  },
});
