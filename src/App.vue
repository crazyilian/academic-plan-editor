<template>
  <v-app>
    <v-main>
      <v-container style="height: 100vh; max-width: 100%" :class="{'display-none' : !checkShowApp() }" class="pa-2">
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

function startInterval(handler, timeout) {
  const interval = setInterval(handler, timeout);
  handler();
  return interval;
}

export default {
  name: 'App',

  components: {
    Editor,
  },

  data() {
    return {
      templates: [],
      askTemplatesInterval: undefined,
    }
  },
  mounted() {
    this.askTemplatesInterval = startInterval(() => {
      window.ipcRenderer.askTemplates();
    }, 1000);
    window.ipcRenderer.handle.loadTemplates((event, templates) => {
      this.templates = templates;
      clearInterval(this.askTemplatesInterval);
    });
  },
  methods: {
    checkShowApp() {
      return this.templates.length > 0;
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
