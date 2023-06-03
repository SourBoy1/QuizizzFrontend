<template>
  <div class="flex flex-col xs:bg-light rounded-lg sm:p-8 p-4 w-full sm:w-3/4 max-w-120 main-form h-full xs:h-auto">
    <p class="font-semibold text-base mt-2 mb-3">
      <i18n>Provide quiz details</i18n>
    </p>

    <div class="mb-4 flex flex-col">
      <Input
        aria-required="true"
        autocomplete="off"
        required
        inputClasses="font-semibold"
        :label="$i18n('Enter a topic')"
        :placeholder="$i18n('Integers, Pronouns etc')"
        :tabindex="0"
        :value="formValues.topic"
        @input="(value) => handleFormUpdate('topic', value)"
      />
    </div>
    <div class="flex md:flex-row flex-col mb-4">
      <SelectBox
        aria-required="true"
        class="flex-1 md:mr-4 mr-0 md:mb-0 mb-4"
        icon="far fa-book"
        :label="$i18n('Subject')"
        :list="sortedSubjectsList"
        customClasses="bg-light-3"
        :placeholder="$i18n('Select subject')"
        :truncateLength="truncateLength(formValues.subject)"
        :value="formValues.subject"
        @input="(value) => handleFormUpdate('subject', value)"
      />
      <SelectBox
        aria-required="true"
        class="flex-1"
        icon="far fa-graduation-cap"
        :label="$i18n('Grade')"
        customClasses="bg-light-3"
        :list="gradesList"
        :placeholder="$i18n('Select grade')"
        :value="formValues.grade"
        @input="(value) => handleFormUpdate('grade', value)"
      />
    </div>
    <div class="mb-6">
      <label class="font-semibold text-xs mb-1 ml-1 text-dark-4">
        <i18n>How many questions do you want?</i18n>
      </label>
      <div class="mt-2 w-full flex items-center space-x-2">
        <button
          v-for="numberOfQuestions in [10, 15, 20]"
          :key="numberOfQuestions"
          class="flex-1 rounded-md h-12 text-dark-3 text-sm bg-light-3 border-1 border-dark-6 hover:border-lilac hover:bg-lilac-faded hover:text-lilac"
          :class="numberOfQuestions === formValues.numberOfQuestions ? 'border-lilac bg-lilac-faded text-lilac' : ''"
          :aria-label="$i18n('Generate questions')"
          @click="handleFormUpdate('numberOfQuestions', numberOfQuestions)"
        >
          {{ numberOfQuestions }}
        </button>
      </div>
    </div>
    <Button
      class="mt-auto mx-auto w-full"
      :class="isDesktop ? 'ml-0' : ''"
      :title="$i18n('Generate quiz')"
      :aria-label="$i18n('Generate quiz')"
      :disabled="!isFormValid"
      licon="fas fa-wand-magic-sparkles"
      @click="$emit('submit')"
    />
  </div>
</template>

<script>

export default {

  props: {
    sortedSubjectsList: {
      type: Array,
      required: true,
    },
    gradesList: {
      type: Array,
      required: true,
    },
    formValues: {
      type: Object,
      required: true,
    },
    handleFormUpdate: {
      type: Function,
      required: true,
    },
    isFormValid: {
      type: Boolean,
      required: true,
    },
    isDesktop: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['submit'],

  methods: {
    truncateLength(value) {
      // truncates the subject name to 15 characters if it's longer than 20 eg:"professional development, information technology"
      if (value.length > 20) {
        return 15;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@media screen and (max-width: 450px) {
  .main-form {
    min-height: inherit;
  }
}
</style>
