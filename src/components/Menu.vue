<template>
  <!--

[
  {
     type: 'value',
     name: 'menu button 1',
     data: 0
   },
   {
     type: 'menu',
     name: 'menu button 2',
     data: ...
   },
   {
     type: 'text',
     name: 'any text',
     data: { 'class-1': true }
   },
   {
     type: 'divider'
   }
]

  -->
  <v-menu
      :value="value"
      v-bind="attrs"
  >
    <template #activator="{ attrs: btn_attrs }">
      <div
          v-bind="btn_attrs"
          @click="setModel(true)"
          @mouseenter="setButtonModel(true)"
          @mouseleave="setButtonModel(false)"
      >
        <slot/>
      </div>
    </template>
    <div
        class="menu-list"
        @mouseover="setModel(true)"
        @mouseleave="setModel(false)"
    >
      <div v-for="(val, i) in data" :key="i">
        <v-btn
            v-if="val.type === 'value'"
            class="menu-item pl-6"
            :class="{
              'menu-item-first': i === 0,
              'menu-item-last': i === data.length - 1
            }"
            style="width: 100%"
            text
            @click="$emit('choose', val.data)"
        >
          <span>{{ val.name }}</span>
        </v-btn>
        <Menu
            v-else-if="val.type === 'menu'"
            :value="models[i]"
            :submenu="true"
            :attrs="{'offset-x': true, 'left': true}"
            :data="val.data"
            @input="setSubmenuModel(i, $event)"
            @choose="$emit('choose', $event)"
        >
          <v-btn
              style="width: 100%" text class="menu-item pl-0 submenu-item-btn"
              :class="{
                'menu-item-first': i === 0,
                'menu-item-last': i === data.length - 1,
                'current-submenu-item-btn': models[i]
              }"
              @click.stop="() => {}"
          >
            <v-icon class="pl-1" size="20">mdi-chevron-left</v-icon>
            <span>{{ val.name }}</span>
          </v-btn>
        </Menu>
        <div v-else-if="val.type === 'text'" class="pl-2" :class="val.data">
          <span>{{ val.name }}</span>
        </div>
        <div v-else-if="val.type === 'divider'" style="height: 0.5px; width: 100%; background-color: gray"/>
      </div>
    </div>
  </v-menu>
</template>

<script>
import Vue from "vue";

export default {
  name: "Menu",
  props: {
    data: { type: Array, default: () => [] },
    submenu: { type: Boolean, default: false },
    value: { type: Boolean, default: false },
    attrs: { type: Object, default: () => ({}) }
  },
  data() {
    return {
      model: false,
      models: Array(this.data.length).fill(false),
      btnModel: false,
      timeout: undefined
    }
  },
  methods: {
    updateModel() {
      const val = this.model || this.btnModel || this.models.some(v => v);
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        this.$emit('input', val);
      }, val ? 0 : 10);
    },
    setModel(val) {
      this.model = val;
      this.updateModel();
    },
    setButtonModel(val) {
      if (this.submenu) {
        this.btnModel = val;
        this.updateModel();
      }
    },
    setSubmenuModel(key, val) {
      Vue.set(this.models, key, val);
      this.updateModel();
    }
  }
}
</script>

<style>

.menu-list {
  display: flex;
  flex-direction: column;
  padding: 8px;
  background-color: white;
}

.menu-item {
  text-transform: none;
  display: flex;
  justify-content: flex-start;
  border-radius: 0;
}

.menu-item-first {
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

.menu-item-last {
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}

.submenu-item-btn:before {
  background-color: white;
}

.current-submenu-item-btn {
  background-color: rgba(0, 0, 0, 0.08) !important;
}

.menu-title-text {
  font-weight: bold;
  padding-top: 4px;
  padding-bottom: 8px;
}

</style>
