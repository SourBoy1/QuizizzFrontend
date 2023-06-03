<template>
  <div
    :class="[
      'border-super-20% border rounded-lg mt-1 mb-6 mx-4',
      isExpanded ? 'p-3' : '',
    ]"
  >
    <p
      v-if="isExpanded"
      class="text-dark-3 text-xs font-bold"
    >
      {{ title }}
    </p>
    <button
      v-else
      class="text-dark-3 text-xs font-bold p-3 w-full text-left font-bold"
      @click.stop="toggleExpand"
      @keyup.enter.space="toggleExpand"
    >
      {{ titleWhenHidden }}
      <FA
        :size="10"
        icon="far fa-angle-right"
      />
    </button>

    <p
      v-if="isExpanded"
      class="text-dark-4 text-xxs mb-2"
    >
      {{ description }}
    </p>
    <div
      v-if="isExpanded"
      class="justify-between flex"
    >
      <button
        class="text-super text-tn hover:underline"
        @click.stop="onLinkButtonClicked"
        @keyup.enter.space="onLinkButtonClicked"
      >
        {{ linkTitle }}
        <FA
          :size="10"
          icon="far fa-angle-right"
        />
      </button>
      <button
        class="text-dark-5 text-tn hover:underline"
        @click.stop="toggleExpand"
        @keyup.enter.space="toggleExpand"
      >
        Dismiss
      </button>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    titleWhenHidden: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    link: {
      type: String,
      default: '',
    },
    linkTitle: {
      type: String,
      default: '',
    },
  },
  emits: ['promoLinkClick'],

  data() {
    return {
      isExpanded: true,
    };
  },

  methods: {
    onLinkButtonClicked() {
      this.$emit('promoLinkClick');
    },

    toggleExpand() {
      this.isExpanded = !this.isExpanded;
    },
  },
};
</script>
