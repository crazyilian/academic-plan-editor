<template>
  <v-app style="overflow: hidden">
    <v-main>
      <v-container v-if="checkShowApp()" style="height: 100vh; max-width: 100%" class="pb-2 pt-0 px-2">
        <Editor v-if="project !== undefined" ref="editor" :templates="templates" :project="project"/>
        <OpenProject v-else/>
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
import OpenProject from "@/components/OpenProject";
import { setGlobalGradeId, getGlobalGradeId } from "@/gradeProcessing";

// eslint-disable-next-line no-unused-vars
function startInterval(handler, timeout) {
  const interval = setInterval(handler, timeout);
  handler();
  return interval;
}

export default {
  name: 'App',

  components: {
    OpenProject,
    Editor,
  },

  data() {
    return {
      templates: [],
      autoSaveInterval: undefined,
      project: undefined,
      cntLoaded: 0
    }
  },
  watch: {
    project: {
      handler() {
        this.saveProject();
      },
      deep: true
    }
  },
  mounted() {
    window.ipcRenderer.getTemplates().then(templates => {
      this.templates = templates;
      this.cntLoaded++;
    });

    window.ipcRenderer.getCurrentProject().then(project => {
      this.openProject(project)
      this.cntLoaded++;
    });
    window.ipcRenderer.handle.openProject((event, project) => {
      this.openProject(project);
    });

    window.ipcRenderer.handle.saveProject(() => {
      this.saveProject();
    })
  },
  methods: {
    checkShowApp() {
      return this.cntLoaded === 2;
    },
    openProject(project) {
      this.project = project;
      if (this.$refs.editor !== undefined && this.project !== undefined) {
        setGlobalGradeId(this.project.gradeId);
        this.saveProject();
        if (this.$refs.editor.activeTab >= this.project.tabs.length) {
          this.$refs.editor.activeTab = this.project.tabs.length - 1;
        }
      }
    },
    saveProject() {
      this.project.gradeId = getGlobalGradeId();
      window.ipcRenderer.saveProject(this.project);
    }
  }
};
</script>
<style>

.display-none {
  display: none !important;
}

*:not(.show-scrollbar)::-webkit-scrollbar {
  display: none;
}

</style>
