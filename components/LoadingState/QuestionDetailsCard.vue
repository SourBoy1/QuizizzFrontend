<template>
  <div
    class="w-full flex flex-col overflow-hidden"
    :class="{
      'border border-solid border-dark-6 rounded-lg': !isForSearchPage,
      'border-t border-dark-6': isForSearchPage,
    }"
  >
    <div
      v-if="!isForSearchPage"
      class="justify-between h-fit-content flex w-full bg-light-2  px-4 py-3 items-center"
    >
      <div class="flex items-center">
        <LoadingStateTextBar
          class="mr-4"
          type="dark"
          :width="16"
        />
        <div class="w-6 h-6 mr-2 bg-brand-b rounded-sm opacity-20" />
        <LoadingStateTextBar
          type="dark"
          :width="70"
        />
      </div>

      <div class="flex">
        <div class="bg-light-3 border border-solid border-dark-6 p-2 flex rounded mr-1">
          <LoadingStateTextBar
            class="mr-1"
            :width="14"
          />
          <LoadingStateTextBar :width="40" />
        </div>

        <div class="bg-light-3 border border-solid border-dark-6 p-2 flex rounded mr-1">
          <LoadingStateTextBar :width="14" />
        </div>

        <div class="bg-light-3 border border-solid border-dark-6 p-2 flex rounded">
          <LoadingStateTextBar :width="14" />
        </div>
      </div>
    </div>

    <div class="bg-light-3 px-4 py-6 flex flex-col">
      <div class="flex mb-5">
        <LoadingStateTextBar
          class="mr-1"
          :width="54"
        />
        <LoadingStateTextBar
          class="mr-1"
          :width="96"
        />
        <LoadingStateTextBar
          class="mr-1"
          :width="44"
        />
        <LoadingStateTextBar
          class="mr-1"
          :width="60"
        />
        <LoadingStateTextBar
          class="mr-1"
          :width="12"
        />
      </div>

      <div
        v-if="!isForSearchPage"
        class="flex mb-5 relative"
      >
        <LoadingStateTextBar
          class="mr-1 ml-6"
          :width="74"
        />
        <div class="absolute w-full bg-light-1 top-1/2 h-px" />
      </div>

      <div class="flex mb-2 md:mb-5 w-full">
        <div class="flex mb-4 flex-1">
          <div
            class="rounded-full w-4 h-4 mr-2 "
            :class="{
              'bg-green-faded': !isForSearchPage,
              'bg-dark-6': isForSearchPage,
            }"
          />
          <LoadingStateTextBar
            class="mr-1"
            :width="78"
          />
          <LoadingStateTextBar
            class="mr-1"
            :width="62"
          />
          <LoadingStateTextBar
            class="mr-1"
            :width="64"
          />
        </div>

        <div class="hidden md:flex mb-4 flex-1">
          <div
            class="rounded-full w-4 h-4 mr-2"
            :class="{
              'bg-red-faded': !isForSearchPage,
              'bg-dark-6': isForSearchPage,
            }"
          />
          <LoadingStateTextBar
            class="mr-1"
            :width="118"
          />
          <LoadingStateTextBar
            class="mr-1"
            :width="38"
          />
        </div>
      </div>

      <div class="flex w-full">
        <div class="flex flex-1">
          <div
            class="rounded-full w-4 h-4 mr-2"
            :class="{
              'bg-red-faded': !isForSearchPage,
              'bg-dark-6': isForSearchPage,
            }"
          />
          <LoadingStateTextBar
            class="mr-1"
            :width="110"
          />
          <LoadingStateTextBar
            class="mr-1"
            :width="87"
          />
        </div>

        <div class="hidden md:flex flex-1">
          <div
            class="rounded-full w-4 h-4 mr-2"
            :class="{
              'bg-red-faded': !isForSearchPage,
              'bg-dark-6': isForSearchPage,
            }"
          />
          <LoadingStateTextBar
            class="mr-1"
            :width="78"
          />
          <LoadingStateTextBar
            class="mr-1"
            :width="62"
          />
          <LoadingStateTextBar
            class="mr-1"
            :width="80"
          />
        </div>
      </div>
    </div>

    <div
      v-if="!isForSearchPage"
      class="h-fit-content flex w-full bg-light-2  px-4 py-3 items-center"
    >
      <div class="bg-light-3 border border-solid border-dark-6 p-2 flex rounded mr-1">
        <LoadingStateTextBar
          class="mr-1"
          :width="14"
        />
        <LoadingStateTextBar
          class="mr-6"
          :width="40"
        />
        <LoadingStateTextBar :width="14" />
      </div>

      <div class="bg-light-3 border border-solid border-dark-6 p-2 flex rounded mr-1">
        <LoadingStateTextBar
          class="mr-1"
          :width="14"
        />
        <LoadingStateTextBar :width="40" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    forPage: {
      type: String,
      default: 'general',
      validate: (val) => ['general', 'search'].includes(val),
    },
  },

  computed: {
    isForSearchPage() {
      return this.forPage === 'search';
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~/assets/scss/mixins.scss';
  .h-fit-content {
    height: fit-content
  }

  .shine-div {
    position: relative;
    overflow: hidden;
    @include shine(1.5s);
  }
</style>
