<template>
  <div style="display: flex; flex-direction: column" class="group">
    <div class="group-remove-button-container">
      <div class="group-remove-button-wrapper">
        <v-btn class="group-remove-button rounded-0" elevation="0" color="errorLight" @click.stop="askCloseGroup">
          <span>Удалить</span>
        </v-btn>
        <v-btn style="width: 0; min-width: 0; padding: 0; height: 0; min-height: 0"/> <!-- crazy fix of bluring rotated text while pressing button -->
      </div>
    </div>
    <div style="display: flex; flex-grow: 1; min-height: 0">
      <VerticalLine v-if="last"/>
      <div v-for="(grade, j) in group" :key="grade.id">
        <Grade
            :grade="grade"
            @highlight="setHighlight(j, $event)"
        />
      </div>
      <VerticalLine/>
    </div>
  </div>
</template>

<script>
import Grade from "@/components/Grades/Grade";
import VerticalLine from "@/components/VerticalLine";
import { getGroupProfile, parseProfile } from "@/gradeProcessing";

export default {
  name: "Group",
  components: { VerticalLine, Grade },
  props: {
    last: { type: Boolean, default: false },
    group: { type: Array, default: () => [] },
  },
  methods: {
    async askCloseGroup() {
      const min = this.group[0].name;
      const max = this.group.slice(-1)[0].name;
      const profile = parseProfile(getGroupProfile(this.group)).pretty;
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
    },
    setHighlight(j, flag) {
      this.$emit('highlight', [j, flag]);
    }
  }
}
</script>

<style>

.group-remove-button-wrapper {
  height: 15px;
}

.group-remove-button-container {
  font-size: 10px;
}

.group-remove-button {
  display: none !important;
  height: 100% !important;
  width: calc(100% + 1px) !important;
  margin-left: -1px !important;
  text-transform: none !important;
  font-size: inherit !important;
}

.group:hover .group-remove-button {
  display: inline-flex !important;
}


</style>
