<template>
  <div class="max-h-44 overflow-auto">
    <div
      v-if="loading"
      class="flex items-center justify-center p-4"
    >
      <FA
        icon="fas fa-sync"
        :size="16"
        class="animate-spin"
      />
    </div>
    <div v-else>
      <Input
        class="p-1"
        :placeholder="$i18n('Search curriculum')"
        licon="far fa-search"
        :value="curriculumSearchTerm"
        @input="onCurriculumSearchInputChange"
      />
      <button
        v-for="curriculum in filteredCurriculums"
        :key="curriculum._id"
        :class="{
          'bg-lilac-faded': selected === curriculum._id,
        }"
        class="text-left w-full pl-9 pr-2 py-2 border-b-1 border-dark-6 hover:bg-dark-6"
        @mousedown.stop="$emit('selected', curriculum)"
      >
        <div class="text-dark-2 text-sm font-semibold">
          {{ curriculum.name }}
        </div>
        <div class="text-xxs text-dark-50%">
          {{ curriculum.description }}
        </div>
        <div class="flex items-center text-xxs text-dark-50%">
          <FA
            icon="fas fa-map-marker-alt"
            :size="9"
            class="mr-2"
          />
          <span>{{ curriculum.country[0] }}</span>
        </div>
      </button>
      <button
        v-if="isSkippable"
        class="text-dark-2 text-sm font-semibold text-left w-full pl-9 pr-2 py-2 border-b-1 border-dark-6 hover:bg-dark-6"
        @mousedown.stop="$emit('skip')"
      >
        <i18n>None of the above</i18n>
      </button>
      <a
        v-if="isSkippable"
        class="text-dark-4 text-xs font-semibold text-left w-full pl-9 pr-2 py-2 border-b-1 border-dark-6"
        href="https://support.quizizz.com/hc/en-us/articles/4700774674329"
        target="_blank"
      >
        <FA
          icon="far fa-info-circle"
          :size="12"
          class="mr-2 -ml-3"
        />
        <i18n>Don't see your standards?</i18n>
        <span class="text-lilac-light"><i18n>Learn how to add them</i18n></span>
      </a>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    list: {
      type: Array,
      default: () => [],
    },

    loading: {
      type: Boolean,
      default: false,
    },

    selected: {
      type: String,
      default: null,
    },

    isSkippable: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['selected', 'skip'],

  data() {
    return {
      curriculumSearchTerm: '',
    };
  },

  computed: {
    filteredCurriculums() {
      if (!this.curriculumSearchTerm?.trim()) {
        return this.list;
      }
      return this.list.filter((curriculum) => {
        const { name, state, description } = curriculum;
        const searchTerm = this.curriculumSearchTerm.toLowerCase();
        return name?.toLowerCase().includes(searchTerm)
               || state?.join('').toLowerCase().includes(searchTerm)
               || description?.toLowerCase().includes(searchTerm);
      });
    },
  },

  methods: {
    onCurriculumSearchInputChange(value) {
      this.curriculumSearchTerm = value;
    },
  },
};
</script>
