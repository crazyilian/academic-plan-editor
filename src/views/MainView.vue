<template>
  <v-container v-if="checkShowApp()" style="height: 100vh; max-width: 100%" class="pb-2 pt-0 px-2">
    <Editor
        v-if="project !== undefined"
        ref="editor"
        :key="forceRemountKey"
        :templates="templates"
        :project="project"
    />
    <StartPage v-else/>
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
</template>

<script>

import Editor from "@/components/Editor";
import StartPage from "@/components/StartPage";
import { setGlobalGradeId, getGlobalGradeId } from "@/gradeProcessing";

export default {
  name: "MainView",

  components: {
    StartPage,
    Editor,
  },

  data() {
    return {
      templates: [],
      autoSaveInterval: undefined,
      project: undefined,
      cntLoaded: 0,
      forceRemountKey: 0
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
      this.cntLoaded++;
      this.openProject(project)
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
      this.forceRemount();
      if (this.project !== undefined) {
        setGlobalGradeId(this.project.gradeId);
        this.saveProject();
      }
    },
    saveProject() {
      if (this.project !== undefined) {
        this.project.gradeId = getGlobalGradeId();
      }
      window.ipcRenderer.saveProject(this.project);
    },
    forceRemount() {
      this.forceRemountKey += 1;
    }
  }
};
</script>
