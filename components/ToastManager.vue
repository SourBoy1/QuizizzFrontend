<template>
  <div class="fixed left-0 bottom-0 flex flex-col z-on-overlay">
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
      <Toast
        v-for="toast in toasts"
        :key="JSON.stringify(toast)"
        :type="toast.type || 'DEFAULT'"
        :icon="toast.icon"
        :title="toast.title"
        :action="toast.action"
        :actionCB="toast.actionCB"
        :iconClasses="toast?.iconClasses || ''"
      />
    </transition-group>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  computed: {
    ...mapGetters('root', ['toasts']),
  },
};
</script>
