<template>
  <ul class="py-1">
    <button
      v-for="order in orders"
      :key="order.id"
      class="w-full flex text-dark-3 py-1.5 px-3 hover:bg-dark-5% active:bg-dark-10% justify-between"
      @click="onOrderSelected(order)"
    >
      <div class="flex">
        <div class="w-4 h-4 mr-2 flex items-center justify-center text-dark-3">
          <FA
            :size="11"
            :icon="order.icon"
          />
        </div>
        <span class="text-xs text-dark-3 font-semibold">{{ order.title }}</span>
      </div>
      <span class="text-xxs text-dark-50% font-semibold">{{ getShortcutLabel(order.id) }}</span>
    </button>
  </ul>
</template>

<script>
import { browserOS } from '~/utils/Utilities';

export default {
  emits: ['onOrderSelected'],
  data() {
    return {
      orders: [
        {
          id: 'bring_forward',
          icon: 'fas fa-sort-size-up',
          title: this.$i18n('Bring forward'),
        },
        {
          id: 'send_backward',
          icon: 'fas fa-sort-size-down',
          title: this.$i18n('Send backward'),
        },
        {
          id: 'bring_front',
          icon: 'fas fa-bring-forward',
          title: this.$i18n('Bring to front'),
        },
        {
          id: 'send_back',
          icon: 'fas fa-send-backward',
          title: this.$i18n('Send to back'),
        },
      ],
    };
  },

  computed: {
    isMac() {
      return browserOS().isMac;
    },
  },

  methods: {
    onOrderSelected(order) {
      this.$emit('onOrderSelected', order);
    },

    getShortcutLabel(id) {
      switch (id) {
        case 'bring_forward':
          return `${this.isMac ? '⌘' : 'Ctrl'} + ↑`;
        case 'send_backward':
          return `${this.isMac ? '⌘' : 'Ctrl'} + ↓`;
        case 'bring_front':
          return `${this.isMac ? '⌘ + ⇧' : 'Ctrl + Shift'} + ↑`;
        case 'send_back':
          return `${this.isMac ? '⌘ + ⇧' : 'Ctrl + Shift'} + ↓`;
        default:
          return '';
      }
    },
  },
};
</script>
