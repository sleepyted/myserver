<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.jpg" />
    <HelloWorld msg="頑張る！" />
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from "@/components/HelloWorld.vue";

export default {
  name: "home",
  components: {
    HelloWorld
  }
};
</script>
