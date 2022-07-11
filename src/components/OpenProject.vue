<template>
  <div style="display: flex; flex-direction: column; align-items: center; width: 100%">
    <h2 class="mb-16 mt-10">Редактор учебных планов</h2>
    <div style="display: flex; justify-content: center; gap: min(50px, 5%); width: 100%">
      <v-card
          v-for="(data, i) in [
                    {
                      title: 'Создать новый проект',
                      button_name: 'Создать',
                      button_f: createProject
                    },
                    {
                      title: 'Открыть существующий проект',
                      button_name: 'Открыть',
                      button_f: openProject
                    },
                ]"
          :key="i"
          style="width: 20%; min-width: 200px; display: flex; flex-direction: column; justify-content: space-between"
          class="pa-4"
      >
        <div>{{ data.title }}</div>
        <v-divider class="mb-3 mt-10"/>
        <div style="display: flex; justify-content: flex-end">
          <v-btn @click="data.button_f">{{ data.button_name }}</v-btn>
        </div>
      </v-card>
    </div>
  </div>
</template>

<script>
export default {
  name: "OpenProject",
  methods: {
    openProject() {
      window.ipcRenderer.openProject();
    },
    createProject() {
      window.ipcRenderer.createProject();
    }
  }
}
</script>

<style>

</style>
