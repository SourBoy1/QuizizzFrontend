<template>
  <div class="sidebar">
    <Collapsable
      type="support"
      :expanded="selectedCollapsibleType"
      @setCollapsibleType="onSetCollapsibleType"
    />
    <Collapsable
      type="engineering"
      :expanded="selectedCollapsibleType"
      @setCollapsibleType="onSetCollapsibleType"
    />
  </div>
</template>

<script>
import Collapsable from './Collapsable.vue';

export default {

  components: {
    Collapsable,
  },
  props: {

  },

  data() {
    return {
      selectedCollapsibleType: 'support',
    };
  },

  computed: {

  },

  methods: {
    onSetCollapsibleType(type) {
      this.selectedCollapsibleType = type;
    },
  },
};
</script>
