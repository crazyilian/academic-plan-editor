<template>
  <v-app>
    <v-main>
      <v-container v-if="checkShowApp()" style="height: 100vh; max-width: 100%" class="pa-2">
        <Editor :templates="templates" :project="project"/>
      </v-container>
      <div
          v-else
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
      autoSaveInterval: undefined,
      project: undefined,
    }
  },
  watch: {
    project: {
      handler() {
        window.ipcRenderer.saveProject(this.project);
      },
      deep: true
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

    window.ipcRenderer.getLastProject().then(r => {
      this.project = r;
      if (this.project === undefined) {
        this.project = { name: 'project', tabs: [] };
      }
      // this.autoSaveInterval = startInterval(() => {
      //   window.ipcRenderer.saveProject(this.project);
      // }, 30 * 1000)
      window.ipcRenderer.saveProject(this.project);
    });
    window.ipcRenderer.handle.saveProject(() => {
      window.ipcRenderer.saveProject(this.project);
    })
  },
  methods: {
    checkShowApp() {
      return this.templates.length > 0 && this.project !== undefined;
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
