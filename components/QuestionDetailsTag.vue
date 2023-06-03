<template>
  <div
    ref="tagswrapper"
    class="flex overflow-x-auto overflow-y-hidden max-w-full w-full justify-between"
  >
    <Button
      type="white"
      class="mr-2"
      buttonClasses="border-none w-full gap-2 bg-inherit tagsbutton"
      size="sm"
      @click="onTagsClicked"
    >
      <template #title>
        <div
          ref="tags"
          class="flex gap-2 w-full"
        >
          <div
            v-for="(topic, index) in stateTopics"
            :key="index"
            class="text-dark-3 text-xs font-semibold py-2 w-fit max-w-full"
          >
            <span class="bg-dark-5% rounded py-0.5 px-1.5 w-fit max-w-full flex truncate">{{ topic }}</span>
          </div>
        </div>
      </template>
    </Button>
    <Button
      type="white"
      class="mr-2"
      buttonClasses="border-none bg-inherit gap-2"
      size="sm"
      @click="onTagsClicked"
    >
      <template #title>
        <span
          v-if="stateTopics.length < topics.length"
          class="bg-lilac-faded px-1 text-xs font-semibold items-center flex rounded text-lilac py-0.5"
        > +{{ topics.length - stateTopics.length }}</span>
      </template>
    </Button>
  </div>
</template>
<script>
import { mapGetters } from 'vuex';

export default {
  props: {
    topics: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  emits: ['ontagsclicked'],

  data() {
    return {
      count: 0,
      isloading: true,
      stateTopics: this.topics,
    };
  },

  computed: {
    ...mapGetters('root', ['deviceProps', 'isDesktop']),
  },

  watch: {
    topics(newVal) {
      this.stateTopics = newVal;
    },
    isDesktop() {
      this.stateTopics = this.topics;
      this.$nextTick(() => {
        this.setCount();
      });
    },
  },

  mounted() {
    this.setCount();
  },

  methods: {
    onTagsClicked() {
      this.$emit('ontagsclicked');
    },
    setCount() {
      const wrapper = this.$refs.tagswrapper;
      const { tags } = this.$refs;
      if (this.stateTopics.length === 1) {
        return;
      }
      if (tags && wrapper && wrapper.clientWidth < wrapper.scrollWidth) {
        const { lastChild } = tags;
        const immutVal = [...this.stateTopics];
        immutVal.pop();
        this.stateTopics = immutVal;
        // Only option was to use the DOM API because of batching and nextTick
        tags.removeChild(lastChild);
        this.setCount();
      }
    },
  },

};
</script>

<style scoped>
  button {
    justify-content: flex-start !important;
  }
  .tagsbutton {
    min-width: 70% !important;
  }
</style>
