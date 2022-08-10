<template>
  <div class="pa-4 show-scrollbar about-page-container">
    <div style="display: flex">
      <img :src="imageSource" alt="logo" width="64" height="64" class="mr-4">
      <div style="display: flex; flex-direction: column; gap: 2px">
        <h3>Редактор учебных планов</h3>
        <span class="mt-2">{{ info.description }}</span>
        <span class="mt-4">Версия: {{ info.version }} {{ info.arch }}</span>
        <span>Разработчик: {{ info.author }}</span>
        <span class="mt-4">© {{ info.copyrightYear }} {{ info.author }}</span>
      </div>
    </div>
    <div style="display: flex; justify-content: flex-end" class="mt-2">
      <v-btn ref="ok" class="ok-btn" color="indigo" dark @click="closeWindow">Ок</v-btn>
    </div>
  </div>
</template>

<script>

export default {
  name: "AboutView",
  data() {
    return {
      info: {},
      imageSource: require('@/assets/logo.png')
    }
  },
  mounted() {
    window.ipcRenderer.appInfo().then((info) => this.info = info)
    this.$refs.ok.focus()
  },
  methods: {
    closeWindow() {
      window.close();
    }
  }
};
</script>
<style scoped>

.ok-btn {
  text-transform: none;
  width: 100px;
}

.ok-btn:focus::before {
  opacity: 0;
}

.about-page-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  overflow-y: auto;
}

</style>
