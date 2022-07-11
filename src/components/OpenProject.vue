<template>
  <div style="display: flex; flex-direction: column; align-items: center; width: 100%">
    <h2 class="mb-16 mt-10">Редактор учебных планов</h2>
    <div style="display: flex; justify-content: center; gap: min(50px, 5%); width: 100%">
      <v-card
          v-for="(data, i) in [
                    {
                      title: 'Создать новый проект',
                      button_name: 'Создать',
                      button_f: createProject,
                      loading: createLoading,
                    },
                    {
                      title: 'Открыть существующий проект',
                      button_name: 'Открыть',
                      button_f: openProject,
                      loading: openLoading,
                    },
                ]"
          :key="i"
          ref="buttons"
          style="width: 25%; min-width: 200px; display: flex; flex-direction: column; justify-content: space-between"
          class="pa-4"
      >
        <div>{{ data.title }}</div>
        <v-divider class="mb-3 mt-10"/>
        <div style="display: flex; justify-content: flex-end">
          <v-btn :loading="data.loading" @click="data.button_f">{{ data.button_name }}</v-btn>
        </div>
      </v-card>
    </div>
  </div>
</template>

<script>
export default {
  name: "OpenProject",
  data() {
    return {
      openLoading: false,
      createLoading: false
    }
  },
  methods: {
    createProject() {
      this.createLoading = true;
      window.ipcRenderer.createProject().then((r) => this.createLoading = r);
    },
    openProject() {
      this.openLoading = true;
      window.ipcRenderer.openProject().then((r) => this.openLoading = r);
    }
  }
}
</script>

<style>

</style>
