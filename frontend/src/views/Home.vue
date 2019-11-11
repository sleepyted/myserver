<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.jpg" />
    <HelloWorld msg="俺は小能猫" />
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
