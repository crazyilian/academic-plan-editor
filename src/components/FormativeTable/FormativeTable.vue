<template>
  <div style="height: 100%; overflow-y: scroll;" class="pl-2 pb-1">
    <div style="display: flex; flex-direction: column; justify-content: center" class="ma-0">
      <v-card class="mb-2 rounded-0">
        <div class="formative-title">
          <div style="width: 38%; display: inline-block; word-wrap: break-word">
            Формируемая часть
          </div>
          <div style="flex-grow: 1"/>
          <Counter
              v-for="(grade, i) in grades"
              :id="i"
              :key="i"
              ref="counters"
              :correct="true"
              :highlight="gradeHighlight[i]"
              :start-value="plan.hours[i]"
              :max="99"
              @input="counterChange(i)"
          />
        </div>
        <div class="formative-list">
          <FormativeSubject
              v-for="(subject, i) in plan.subjects"
              :id="i"
              :key="i"
              :name="subject"
              :editing="i === editingId"
              @remove-subject="removeSubject(i)"
              @edit-subject="editSubject(i)"
              @change="nameChange(i, $event)"
          />
          <div style="display: flex; width: 100%; justify-content: center">
            <v-btn text style="text-transform: none" class="px-3" @click="addSubject">
              <span class="mr-2">Добавить предмет</span>
              <v-icon color="teal">mdi-plus</v-icon>
            </v-btn>
          </div>
        </div>
      </v-card>
    </div>
  </div>
</template>

<script>

import Counter from "@/components/Counter";
import Vue from "vue";
import FormativeSubject from "@/components/FormativeTable/FormativeSubject";

export default {
  name: 'FormativeTable',
  components: { FormativeSubject, Counter },
  props: {
    'categories': { type: Array, default: () => [] },
    'grades': { type: Array, default: () => [] },
    'gradeHighlight': { type: Array, default: () => [] },
    'plan': { type: Object, default: () => ({}) }
  },
  data() {
    return {
      editingId: null
    }
  },
  methods: {
    counterChange(i) {
      Vue.set(this.plan.hours, i, this.$refs.counters[i].value)
    },
    addSubject() {
      const i = this.plan.subjects.length;
      Vue.set(this.plan.subjects, i, `Предмет по выбору ${i + 1}`)
      this.editingId = i;
    },
    removeSubject(i) {
      Vue.delete(this.plan.subjects, i);
    },
    editSubject(i) {
      this.editingId = i;
    },
    nameChange(i, newName) {
      Vue.set(this.plan.subjects, i, newName)
      this.editingId = null;
    },
  }
}
</script>
<style>

.formative-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 16px 24px;
  border-bottom: solid thin gray;
}

.formative-list {
  padding: 12px 24px 12px 24px;
}

</style>
