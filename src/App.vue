<template>
  <v-app>
    <v-main>
      <Editor v-if="show"/>
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
import Editor from './components/Editor';

export default {
  name: 'App',

  components: {
    Editor,
  },

  data: () => ({
    show: false
  }),
  mounted() {
    window.ipcRenderer.handle.showApp(() => {
      this.show = true;
    })
  }
};
</script>
