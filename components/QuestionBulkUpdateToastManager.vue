<template>
  <div class="fixed left-0 bottom-0 z-102 flex flex-col">
    <transition-group
      enter-class="-translate-x-full"
      enter-active-class="transform"
      enter-to-class="translate-x-0"
      leave-class="translate-x-0"
      leave-active-class="transform"
      leave-to-class="-translate-x-full"
      tag="div"
      class="flex flex-col"
    >
      <QuestionBulkUpdateToast
        v-for="snackbar in snackbars"
        :key="snackbar._id"
        :data="snackbar"
      />
    </transition-group>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  computed: {
    ...mapGetters('root', ['snackbars']),
  },
};
</script>
