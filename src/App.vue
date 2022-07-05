<template>
  <v-app>
    <v-main>
      <v-container style="height: 100vh; max-width: 100%" :class="{'display-none' : !checkShowApp() }">
        <Editor :templates="templates"/>
      </v-container>
      <div
          v-if="!checkShowApp()"
          style="width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; flex-direction: column"
      >
        <v-progress-circular
            indeterminate
            :size="100"
            :width="10"
        />
        <div class="mt-10">
          Loading...
        </div>
      </div>
    </v-main>
  </v-app>
</template>

<script>
import Editor from "@/components/Editor";

export default {
  name: 'App',

  components: {
    Editor,
  },

  data: () => ({
    show: false,
    templates: [],
  }),
  mounted() {
    window.ipcRenderer.handle.loadTemplates((event, templates) => {
      // setTimeout(() => this.templates = templates, 1000);
      this.templates = templates;
    })
    window.ipcRenderer.handle.showApp(() => {
      this.show = true;
    })
  },
  methods: {
    checkShowApp() {
      return window.ipcRenderer.isDevelopment() || this.show && this.templates.length > 0;
    }
  }
};
</script>
<style>

.display-none {
  display: none !important;
}

body::-webkit-scrollbar {
  display: none;
}

</style>
