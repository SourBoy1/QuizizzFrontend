<template>
  <Modal
    icon=""
    containerClasses="editable-option-modal-width"
    size="custom"
    :title="$i18n('Import as')"
    :subtitle="''"
    @close="$emit('close')"
  >
    <div class="relative z-0 flex flex-col gap-2 font-open-sans">
      <div
        class="flex flex-row py-2 px-3 hover:bg-lilac-10% hover:border-[#8854C0] rounded border border-[#e5e5e5] w-[394px] max-h-56 cursor-pointer"
        @click="$emit('startImport', true)"
      >
        <div class="bg-lilac-faded rounded-full h-[40px] w-[40px] flex justify-center items-center mr-3">
          <FA
            class="fas fa-pen text-lilac-dark"
            :size="14"
          />
        </div>
        <div class="flex flex-col">
          <div class="flex flex-row gap-2 items-center">
            <div class="text-sm leading-6 font-semibold text-dark2">
              <i18n>Editable Slides</i18n>
            </div>
            <div class="w-[39px] h-4 px-2 font-semibold rounded bg-lilac-dark text-[10px] leading-4 text-light-3">
              <i18n>New</i18n>
            </div>
          </div>
          <div class="text-xs leading-5 font-normal text-dark-4">
            <i18n>You can edit text and images on your slides.</i18n>
          </div>
        </div>
      </div>
      <div
        class="flex flex-row py-2 px-3 hover:bg-lilac-10% hover:border-[#8854C0] rounded border border-[#e5e5e5] w-[394px] max-h-56 cursor-pointer"
        @click="$emit('startImport', false)"
      >
        <div class="bg-lilac-faded rounded-full h-[40px] w-[40px] flex justify-center items-center mr-3">
          <div class="absolute">
            <FA
              class="fas fa-pen text-lilac-dark"
              :size="14"
            />
          </div>
          <div class="absolute">
            <FA
              class="fas fa-slash text-lilac-dark"
              :size="14"
            />
          </div>
        </div>
        <div class="flex flex-col">
          <div class="text-sm leading-6 font-semibold text-dark-2">
            <i18n>Uneditable Slides</i18n>
          </div>
          <div class="text-xs leading-5 font-normal text-dark-4">
            <i18n>Your slides will be imported as static images.</i18n>
          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script>

export default {
  props: {
    questionIndex: {
      type: Number,
      default: 0,
    },
    isQuizDraft: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['close', 'startImport'],

  data() {
    return {
      shouldShowAnswers: false,
      currentQuestion: null,
    };
  },
};
</script>

<style lang="scss" scoped>
  .font-open-sans {
    font-family: 'Open Sans', sans-serif !important;
  }
  .icon-container {
    background: #EDE6F6;
    border-radius: 40px;
    height: 40px;
    width: 40px;
    margin-right: 12px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .editable-option-modal-width {
    max-width: 426px !important;
  }
</style>
