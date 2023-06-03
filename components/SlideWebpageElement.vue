<template>
  <div class="slide-webpage-element w-full h-full relative z-20 bg-dark-3">
    <div
      class="bg-dark-4 border border-light-20% flex flex-col w-full h-full rounded-t-lg"
    >
      <div class="p-2 flex items-center z-10">
        <Button
          v-if="embeddable"
          type="transparent"
          :title="$i18n('Home')"
          licon="fas fa-house-chimney"
          @click="handleHome"
        />
        <div class="text-light-3 px-2 embed-title">
          {{ title }}
        </div>
        <Button
          class="mr-2"
          type="transparent"
          :title="$i18n('Open in new tab')"
          licon="fas fa-external-link-alt"
          @click="handleOpenNewTab"
        />
        <Button
          type="transparent"
          :title="$i18n('Copy link')"
          licon="fas fa-copy"
          @click="$clipboard.copy(url)"
        />
      </div>
      <div class="px-2 pb-2 flex-grow overflow-hidden">
        <iframe
          v-if="embeddable"
          ref="iframe"
          class="bg-light-3"
          width="100%"
          height="100%"
          :src="url"
          frameborder="0"
        />
        <img
          v-else
          class="w-full h-full"
          src="https://cf.quizizz.com/img/presentation/blurred-webpage-bg.png"
          alt="web page not embeddable"
        />
        <div
          v-if="!embeddable"
          class="absolute inset-0 flex justify-center items-center"
        >
          <div class="bg-light-3 rounded-lg p-4 w-116">
            <div class="flex">
              <div
                class="w-10 h-10 rounded-full bg-lilac-faded text-lilac inline-flex justify-center items-center"
              >
                <FA
                  icon="fas fa-link"
                  :size="16"
                />
              </div>
              <div class="ml-3">
                <div class="text-base font-bold text-dark-2">
                  {{ title }}
                </div>
                <div class="text-xs text-dark-4">
                  <i18n>You can open this webpage in a new tab.</i18n>
                </div>
              </div>
            </div>
            <div class="mt-9 flex justify-end">
              <Button
                licon="fas fa-external-link-alt"
                :title="$i18n('Open in a new tab')"
                @click="handleOpenNewTab"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    url: {
      type: String,
      default: '',
    },
    embeddable: {
      type: Boolean,
      default: true,
    },
    title: {
      type: String,
      default: '',
    },
  },

  methods: {
    handleOpenNewTab() {
      window.open(this.url);
    },
    handleHome() {
      this.$refs.iframe.setAttribute('src', this.url);
    },
  },
};
</script>

<style>
.embed-title {
  max-width: 850px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
</style>
