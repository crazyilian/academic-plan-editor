<template>
  <v-expansion-panel class="formative-last-category-panel">
    <v-expansion-panel-header
        class="pr-2 formative-last-category py-2 pl-6"
        style="min-height: 56px"
    >
      <div style="width: 38%; display: inline-block; word-wrap: break-word">
        Формируемая часть
      </div>
      <div style="flex-grow: 1"/>
      <ScrollSync style="display: flex; flex: 0 1 auto; min-height: 32px;" group="grades" horizontal>
        <div
            v-for="[i, group] in gradeGroups.map((g, i, s) => [s.length - i - 1, s[s.length - i - 1]])"
            :key="group[0].id"
            style="display: flex"
        >
          <Counter
              v-for="(grade, j) in group"
              :key="grade.id"
              ref="counters"
              :correct="true"
              :start-value="plan.hours[i][j]"
              :max="99"
              @input="counterChange(i, j, $event)"
          />
        </div>
      </ScrollSync>
      <template #actions>
        <div/>
      </template>
    </v-expansion-panel-header>
    <v-expansion-panel-content>
      <FormativeLastSubject
          v-for="(subject, i) in plan.subjects"
          ref="subjects"
          :key="subject"
          :num="i + 1"
          :name="subject"
          @remove-subject="removeSubject(i)"
          @change-name="nameChange(i, $event)"
      />
      <div ref="addBtnContainer" style="display: flex; width: 100%; justify-content: center">
        <v-btn text style="text-transform: none" class="px-3" @click="addSubject">
          <span class="mr-2">Добавить предмет</span>
          <v-icon color="teal">mdi-plus</v-icon>
        </v-btn>
      </div>
    </v-expansion-panel-content>
  </v-expansion-panel>
</template>

<script>

import Counter from "@/components/Counter";
import Vue from "vue";
import FormativeLastSubject from "@/components/FormativeTable/FormativeLastSubject";

export default {
  name: 'FormativeLastCategory',
  components: { FormativeLastSubject, Counter },
  props: {
    gradeGroups: { type: Array, default: () => [] },
    plan: { type: Object, default: () => ({}) },
  },
  data() {
    return {
      num: 0
    }
  },
  methods: {
    counterChange(i, j, val) {
      Vue.set(this.plan.hours[i], j, val)
    },
    getNextName() {
      let name = "";
      do {
        this.num += 1;
        name = `Предмет по выбору ${this.num}`;
      } while (this.plan.subjects.includes(name));
      return name;
    },
    addSubject() {
      const n = this.plan.subjects.length;
      Vue.set(this.plan.subjects, n, this.getNextName());
      this.$nextTick(() => {
        this.$refs.subjects[n].editName();
        this.$refs.addBtnContainer.scrollIntoView();
      })
    },
    removeSubject(i) {
      Vue.delete(this.plan.subjects, i);
    },
    nameChange(i, newName) {
      if (!this.plan.subjects.some((s, j) => j !== i && s.toLowerCase() === newName.toLowerCase())) {
        Vue.set(this.plan.subjects, i, newName);
        return;
      }
      window.ipcRenderer.messageBox({
        'type': 'warning',
        'title': 'Название предмета...',
        'message': "Предмет с таким названием уже существует",
        'detail': `Вы не можете назвать предмет "${newName}", так как предмет с таким названием уже существует.`,
      });
    },
  }
}
</script>
<style>

.formative-last-category.v-expansion-panel-header--active:hover::before {
  opacity: 0.12 !important;
}

.formative-last-category.v-expansion-panel-header--active::before {
  opacity: 0.06 !important;
}


</style>
