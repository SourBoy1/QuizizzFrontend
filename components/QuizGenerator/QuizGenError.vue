<template>
  <div class="flex flex-col justify-center items-center">
    <img
      src="https://cf.quizizz.com/image/confused.png"
      :alt="$i18n('We couldn\'t generate this quiz')"
      :class="imageClass"
    />
    <h2
      v-if="title"
      class="font-semibold text-base text-dark-2 mt-2"
    >
      {{ title }}
    </h2>
    <p
      v-if="subTitle"
      class="text-sm font-normal text-dark-4 text-center w-fit mt-2 px-4"
    >
      {{ subTitle }}
    </p>
    <div class="mt-8 w-full flex xs:justify-between xs:flex-row flex-col items-center gap-4">
      <Button
        :title="secondaryButtonLabel"
        type="primary"
        size="md"
        class="w-10/12"
        licon="fa-solid fa-arrows-rotate"
        @click="$emit('secondary-click')"
      />
      <Button
        :title="primaryButtonLabel"
        size="md"
        class="w-10/12 !bg-light-1"
        type="link"
        @click="$emit('primary-click')"
      />
    </div>
  </div>
</template>

<script>

export default {

  props: {
    title: {
      type: String,
      default: '',
    },
    subTitle: {
      type: String,
      default: '',
    },
    imageClass: {
      type: String,
      default: 'xs:w-50 w-25 h-auto',
    },
    primaryButtonLabel: {
      type: String,
      default() {
        return this.$i18n('Create from scratch');
      },
    },

    secondaryButtonLabel: {
      type: String,
      default() {
        return this.$i18n('Retry');
      },
    },
  },
  emits: ['secondary-click', 'primary-click'],
};
</script>
