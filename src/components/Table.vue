<template>
  <v-row justify="center">
    <v-expansion-panels v-model="panels" accordion focusable multiple>
      <v-expansion-panel
          v-for="(item, i) in items"
          :key="i"
      >
        <v-expansion-panel-header
            disable-icon-rotate
            :class="{
                'error-category': !item.correct,
                'correct-category': item.correct
            }"
        >
          <v-row no-gutters>
            <v-col cols="5">{{ item.header }}</v-col>
            <v-col cols="5" class="text--secondary">{{ item.correct ? 'All correct' : 'Error message' }}</v-col>
            <v-col cols="2" class="text--secondary">Information</v-col>
          </v-row>
          <template #actions>
            <v-icon v-if="item.correct" color="teal">
              mdi-check
            </v-icon>
            <v-icon v-else color="error">
              mdi-alert-circle
            </v-icon>
          </template>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          {{ item.content }}
          <v-btn class="text-capitalize" @click="item.correct ^= true">
            toggle
          </v-btn>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-row>
</template>

<script>

export default {
  name: 'Table',

  data: () => ({
    panels: [],
    items: [
      {
        'header': 'Item 1',
        'content': 'abacaba',
        'correct': true
      },
      {
        'header': 'Item 2',
        'content': 'qwerty',
        'correct': false
      }
    ]
  }),
  mounted() {
    window.ipcRenderer.on('expandAll', this.expandAll);
    window.ipcRenderer.on('collapseAll', this.collapseAll);
  },
  methods: {
    expandAll() {
      this.panels = [...Array(this.items.length).keys()];
    },
    collapseAll() {
      this.panels = [];
    }
  }
}
</script>

<style>

/* .correct-category row styles */

.theme--light.v-expansion-panels.v-expansion-panels--focusable .correct-category.v-expansion-panel-header--active:hover::before {
  opacity: 0.09;
}

.theme--light.v-expansion-panels.v-expansion-panels--focusable .correct-category.v-expansion-panel-header--active::before {
  opacity: 0.05;
}

.correct-category {
  background-color: #efe;
}


/* .error-category row styles */

.theme--light.v-expansion-panels.v-expansion-panels--focusable .error-category.v-expansion-panel-header--active:hover::before {
  opacity: 0.09;
}

.theme--light.v-expansion-panels.v-expansion-panels--focusable .error-category.v-expansion-panel-header--active::before {
  opacity: 0.05;
}

.error-category {
  background-color: #fee;
}
</style>