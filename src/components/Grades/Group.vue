<template>
  <div style="display: flex; flex-direction: column" class="group">
    <v-btn class="group-remove-button rounded-0" elevation="0" color="#ffbfbf" @click.stop="askCloseGroup">
      <span>Удалить</span>
    </v-btn>
    <div style="display: flex; flex-grow: 1; min-height: 0">
      <div v-for="(grade, j) in group" :key="j">
        <Grade :grade="grade"/>
      </div>
    </div>
  </div>
</template>

<script>
import Grade from "@/components/Grades/Grade";

export default {
  name: "Group",
  components: { Grade },
  props: {
    group: { type: Array, default: () => [] }
  },
  methods: {
    async askCloseGroup() {
      const min = this.group[0].name;
      const max = this.group.slice(-1)[0].name;
      const profile = this.group.slice(-1)[0].profile.join(': ');
      const buttonId = await window.ipcRenderer.messageBox({
        'type': 'question',
        'title': 'Удаление...',
        'message': "Вы уверены, что хотите удалить классы?",
        'detail': `Классы ${min}-${max} профиля "${profile}" будут удалены из плана.`,
        'buttons': ['Да', 'Нет'],
        'cancelId': 1,
        'defaultId': 1,
        'noLink': true,
      });
      const remove = [true, false][buttonId];
      if (remove) {
        this.$emit('remove-group');
      }
    }
  }
}
</script>

<style>

.group-remove-button {
  display: none !important;
  height: 15px !important;
  width: calc(100% + 1px) !important;
  font-size: 10px !important;
  text-transform: none !important;
  margin-top: -15px !important;
  margin-left: -1px  !important;
  z-index: 100;
}

.group:hover .group-remove-button {
  display: inline-flex !important;
}


</style>
