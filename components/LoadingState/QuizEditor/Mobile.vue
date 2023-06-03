<template>
  <div class="w-full h-full relative flex flex-col">
    <div class="flex bg-purple h-12 p-2 items-center z-100">
      <div class="shrink-0">
        <img
          class="h-6"
          src="https://cf.quizizz.com/img/quizizz_logos/white-brandmark-600x164.png"
        />
      </div>

      <div class="ml-auto h-8 w-16 rounded bg-light-10%  shine-div" />
      <div class="ml-2 h-8 w-26 rounded bg-light-66% shine-div" />
    </div>

    <div class="flex justify-center">
      <div class="flex h-full bg-light-1 flex-col items-center w-full px-4">
        <div class="p-4 flex bg-light-3 shadow-soft-low-high rounded-b-lg h-24 mb-6 w-full">
          <div class="flex flex-col h-full w-full">
            <div class="flex justify-center mb-2">
              <LoadingStateTextBar class="mr-1" />
              <LoadingStateTextBar
                class="mr-1"
                :width="48"
              />
              <LoadingStateTextBar
                class="mr-1"
                :width="32"
              />
              <LoadingStateTextBar :width="80" />
            </div>

            <div class="border border-solid border-dark-6 p-1 rounded h-full justify-right w-full">
              <div class="w-18 h-full bg-lilac-faded float-right shine-div" />
            </div>
          </div>
        </div>

        <div class="flex flex-col w-full max-w-156">
          <LoadingStateQuestionDetailsCard class="mb-4" />
          <LoadingStateQuestionDetailsCard />
        </div>
      </div>

      <div class="hidden md:block p-4 rounded-2xl border border-solid border-dark-6 max-h-99 mt-6">
        <div class="w-full h-38 bg-light-2 mb-5 border-dashed border border-dark-6" />
        <div class="flex mb-6 items-center justify-between">
          <div class="flex">
            <LoadingStateTextBar
              :width="64"
              class="mr-1"
            />
            <LoadingStateTextBar
              class="mr-1"
              :width="48"
            />
            <LoadingStateTextBar
              class="mr-1"
              :width="32"
            />
            <LoadingStateTextBar :width="80" />
          </div>

          <div class="flex mb-2 w-6 h-6 rounded border border-solid border-dark-6" />
        </div>

        <div class="flex">
          <LoadingStateTextBar
            type="lilac"
            class="mr-1"
            :width="12"
            :height="12"
          />
          <LoadingStateTextBar
            type="lilac"
            :width="36"
            :height="12"
          />

          <span class="w-1 h-1 rounded-full bg-lilac-fases mx-2" />

          <LoadingStateTextBar
            type="lilac"
            class="mr-1"
            :width="12"
            :height="12"
          />
          <LoadingStateTextBar
            type="lilac"
            :width="36"
            :height="12"
          />

          <span class="w-1 h-1 rounded-full bg-lilac-fases mx-2" />

          <LoadingStateTextBar
            type="lilac"
            class="mr-1"
            :width="12"
            :height="12"
          />
          <LoadingStateTextBar
            type="lilac"
            :width="36"
            :height="12"
          />
        </div>

        <div class="w-full bg-light-1 my-6 h-px" />

        <div class="flex mb-5">
          <LoadingStateTextBar
            :height="12"
            :width="12"
            class="mr-2"
          />
          <LoadingStateTextBar
            :height="12"
            class="mr-2"
            :width="48"
          />
          <LoadingStateTextBar
            :height="12"
            class="mr-2"
            :width="96"
          />
        </div>

        <div class="flex mb-5">
          <LoadingStateTextBar
            :height="12"
            :width="12"
            class="mr-2"
          />
          <LoadingStateTextBar
            :height="12"
            class="mr-2"
            :width="72"
          />
          <LoadingStateTextBar
            :height="12"
            class="mr-2"
            :width="48"
          />
          <LoadingStateTextBar
            :height="12"
            class="mr-2"
            :width="96"
          />
          <LoadingStateTextBar
            :height="12"
            :width="76"
          />
        </div>

        <div class="flex">
          <LoadingStateTextBar
            :height="12"
            :width="12"
            class="mr-2"
          />
          <LoadingStateTextBar
            :height="12"
            class="mr-2"
            :width="80"
          />
          <LoadingStateTextBar
            :height="12"
            class="mr-2"
            :width="56"
          />
          <LoadingStateTextBar
            :height="12"
            :width="88"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {

};
</script>

<style lang="scss" scoped>
@import '~/assets/scss/mixins.scss';

  .shine-div {
    position: relative;
    overflow: hidden;
    @include shine(1.5s);
  }
</style>
