<template>
  <div class="pagination text-center">
    <div
      class="inline-flex bg-light font-semibold rounded border-1 border-dark-6 border-color"
      :class="{ 'm-5': !isMobile }"
    >
      <button
        :class="['arrow rounded-l cursor-pointer p-1 w-9 h-9 inline-flex items-center justify-center bg-light text-brand-a-dark hover:text-lilac', { disabled: isFirstPage }]"
        @click="togglePages('start')"
      >
        <i
          class="far fa-chevron-left"
          aria-hidden="true"
        />
        <i
          class="far fa-chevron-left"
          aria-hidden="true"
        />
      </button>
      <button
        :class="['arrow cursor-pointer p-1 w-9 h-9 inline-flex items-center justify-center bg-light border-l-1 border-dark-6 border-color text-brand-a-dark hover:text-lilac', { disabled: isFirstPage }]"
        @click="togglePages('previous')"
      >
        <i
          class="far fa-chevron-left"
          aria-hidden="true"
        />
      </button>
      <button
        v-for="page in getPageNumbers()"
        :key="page"
        :class="['page-number cursor-pointer p-1 w-9 h-9 inline-flex items-center justify-center border-l-1 border-dark-6 border-color font-normal', isPageActive(page) ? 'bg-lilac text-light-3' : 'bg-light text-brand-a-dark hover:text-lilac']"
        @click="handlePageClick(page)"
      >
        <div
          v-if="isLoading && isPageActive(page)"
          class=" relative w-full h-full flex justify-center items-center"
        >
          <Loader :size="16" />
        </div>
        <span v-else>{{ page + 1 }}</span>
      </button>

      <button
        :class="['arrow cursor-pointer p-1 w-9 h-9 inline-flex items-center justify-center bg-light border-l-1 border-dark-6 border-color text-brand-a-dark hover:text-lilac', { disabled: isLastPage }]"
        @click="togglePages('next')"
      >
        <i
          class="far fa-chevron-right"
          aria-hidden="true"
        />
      </button>
      <button
        :class="['arrow rounded-r cursor-pointer p-1 w-9 h-9 inline-flex items-center justify-center bg-light border-l-1 border-dark-6 border-color text-brand-a-dark hover:text-lilac', { disabled: isLastPage }]"
        @click="togglePages('end')"
      >
        <i
          class="far fa-chevron-right"
          aria-hidden="true"
        />
        <i
          class="far fa-chevron-right"
          aria-hidden="true"
        />
      </button>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  props: {
    pageNumber: {
      type: Number,
      default: 0,
    },
    totalEntities: {
      type: Number,
      default: 0,
    },
    pageSize: {
      type: Number,
      default: 10,
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
    startingPageIndex: {
      type: Number,
      default: 0,
    },
  },
  emits: ['pageChange'],

  data() {
    return {

    };
  },

  computed: {
    ...mapGetters('root', ['isMobile']),
    currentPageNumber() {
      return this.pageNumber - this.startingPageIndex;
    },

    isFirstPage() {
      return this.currentPageNumber === 0;
    },

    isLastPage() {
      return this.currentPageNumber === this.totalPages - 1;
    },

    totalPages() {
      return Math.ceil(this.totalEntities / this.pageSize);
    },
  },

  methods: {
    isPageActive(page) {
      return this.currentPageNumber === page;
    },

    getPageNumbers() {
      const pageNumbers = [];
      const currentPage = this.currentPageNumber;
      const maxButtons = 5;
      let start = currentPage - Math.floor(maxButtons / 2);

      start = start < 0 ? 0 : start;

      if (this.totalPages - start < maxButtons) {
        start -= maxButtons - (this.totalPages - start);
      }

      start = start < 0 ? 0 : start;

      for (let i = 0; i < maxButtons; i++) {
        if (start + i >= this.totalPages) {
          break;
        }
        pageNumbers.push(start + i);
      }

      return pageNumbers;
    },

    togglePages(action) {
      switch (action) {
        case 'end':
          if (this.isLastPage) {
            return;
          }
          this.handlePageClick(this.totalPages - 1);
          break;
        case 'start':
          if (this.currentPageNumber === 0) {
            return;
          }
          this.handlePageClick(0);
          break;
        case 'next':
          if (this.isLastPage) {
            return;
          }
          this.handlePageClick(this.currentPageNumber + 1);
          break;
        case 'previous':
          if (this.currentPageNumber === 0) {
            return;
          }
          this.handlePageClick(this.currentPageNumber - 1);
          break;
        default:
      }
    },

    handlePageClick(page) {
      if (this.currentPageNumber === page || page < 0) { return; }
      this.$emit('pageChange', this.startingPageIndex + page);
    },
  },
};
</script>

<style lang="scss" scoped>
.pagination {
  .arrow {
    &.disabled {
      color: #bab5b5;
      cursor: not-allowed;
    }
  }
}
</style>
