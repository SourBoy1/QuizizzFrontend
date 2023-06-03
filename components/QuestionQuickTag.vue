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
            class="text-dark text-xs font-semibold py-2 w-fit max-w-full"
          >
            <span
              v-if="!isAwaitingApiResponse"
              class="bg-light rounded py-0.5 px-1.5 w-fit max-w-full flex truncate items-center"
            > <i class="far fa-plus mr-2" />{{ topic }}</span>
            <span
              v-if="isAwaitingApiResponse"
              class="absolute inset-0 flex items-center justify-center w-4 h-4 m-auto loading-icon animate-spin"
            >
              <FA
                :icon="`far fa-sync`"
              />
            </span>
          </div>
        </div>
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

    isAwaitingApiResponse: {
      type: Boolean,
      default: false,
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
    onTagsClicked(e) {
      const topicObj = { topic: e.target.innerText };
      this.$emit('ontagsclicked', topicObj);
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
