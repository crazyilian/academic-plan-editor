<template>
  <v-app style="overflow: hidden">
    <v-main style="height: 100vh; width: 100vw; transition: none">
      <router-view :key="$route.fullPath"/>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'App',
};
</script>
<style>

.display-none {
  display: none !important;
}

*:not(.show-scrollbar)::-webkit-scrollbar {
  display: none;
}

::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}

::-webkit-scrollbar-track {
  background: #e7e7e7;
}

::-webkit-scrollbar-thumb {
  background-color: #9f9f9f;
  border-radius: 6px;
  border: 3px solid #e7e7e7;
}

::-webkit-scrollbar-thumb:hover {
  background-color: #8d8d8d;
}

::-webkit-scrollbar-thumb:active {
  background-color: #606060;
}

</style>
