<template>
  <ul class="py-1 overflow-y-auto max-h-52">
    <button
      v-for="(points, index) in pointsList"
      :ref="selectedCorrectPoints === points ? 'selected' : null"
      :key="index"
      :class="{ 'bg-dark-6': selectedCorrectPoints === points }"
      class="cursor-pointer active:bg-dark-10% py-2 pl-2 w-full text-sm flex items-center overflow-hidden text-left text-dark-3 max-h-80 font-semibold hover:bg-dark-5%"
      @click="onPointsSelection(points)"
    >
      <span>
        {{ getPointsListText(points) }}
      </span>
    </button>
  </ul>
</template>

<script>
export default {

  props: {
    selectedCorrectPoints: {
      type: Number,
      default: 0,
    },
    pointsList: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['pointSelected'],

  mounted() {
    this.$refs?.selected?.[0]?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  },

  methods: {
    getPointsListText(points) {
      const singlePointTitle = this.$i18n('point');
      const multiPointsTitle = this.$i18n('points');
      if (points === 0) {
        return this.$i18n('Ungraded (0 points)');
      }
      return `${points} ${points === 1 ? singlePointTitle : multiPointsTitle}`;
    },

    onPointsSelection(points) {
      this.$emit('pointSelected', points);
    },
  },
};
</script>
