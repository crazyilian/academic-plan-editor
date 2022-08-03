<template>
  <v-expansion-panel>
    <v-expansion-panel-header
        disable-icon-rotate
        class="category"
        :class="{ 'error-category': !correct }"
    >
      <div style="display: flex; justify-content: space-between; align-items: center; width: calc(100% - 24px)">
        <div style="flex-grow: 4; display: inline-block; word-wrap: break-word" class="subject-name">
          {{ name }}
        </div>
        <Message
            container-style="margin-left: 12px; margin-right: 32px; min-width: 0; width: auto; flex-grow: 1"
            :messages="messages"
        />
      </div>
      <template #actions>
        <v-icon v-if="correct" color="teal">mdi-check</v-icon>
        <v-icon v-else color="error">mdi-alert-circle</v-icon>
      </template>
    </v-expansion-panel-header>
    <v-expansion-panel-content class="section-content">
      <Summary
          v-for="(el, i) in getData()"
          :id="i"
          :key="gradeGroups.length * 100 + i"
          ref="summaries"
          :grade-groups="gradeGroups"
          v-bind="el"
          :error-name="errorName"
          null-available
          :oninput="oninput"
          @validate="validate"
      />
    </v-expansion-panel-content>
  </v-expansion-panel>
</template>

<script>

import Message from "@/components/Table/Message";
import Summary from "@/components/GeneralTable/Summary";

export default {
  name: 'Section',
  components: { Summary, Message },
  props: {
    'id': { type: Number, default: -1 },
    'name': { type: String, default: "" },
    'errorName': { type: String, default: "" },
    'gradeGroups': { type: Array, default: () => [] },
    'dataRaw': { type: Array, default: () => [] },
    'oninput': { type: Function, default: undefined }
  },
  data() {
    return {
      header: this.name,
      messages: [],
      comment: "",
      correct: false,
    }
  },
  methods: {
    validate() {
      this.correct = true;
      this.messages = [];
      for (const summary of this.$refs.summaries) {
        this.messages.push(...summary.messages);
        this.correct &&= summary.correct;
      }
    },
    getData() {
      const data = [];
      const valsId = [];
      let minVal = undefined;
      let maxVal = undefined;
      for (const [i, d] of this.dataRaw.entries()) {
        if (d.type === 'max') {
          data.push({ name: 'Максимум', values: d.values, edit: false })
          maxVal = d.values;
        } else if (d.type === 'min') {
          data.push({ name: 'Минимум', values: d.values, edit: false })
          minVal = d.values;
        } else {
          data.push(d);
          valsId.push(i);
        }
      }
      for (const i of valsId) {
        data[i].mins = minVal;
        data[i].maxs = maxVal;
      }
      return data;
    }
  }
}
</script>

<style>

.section-content .v-expansion-panel-content__wrap {
  padding-left: 16px;
  padding-right: 8px;
}

</style>
