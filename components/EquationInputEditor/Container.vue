<template>
  <div
    :class="isDesktop ? 'equation-input-container' : 'equation-input-container-mobile'"
    class=" h-full bg-dark-20% flex flex-col relative items-center justify-between rounded-lg"
  >
    <div
      v-if="!isDesktop"
      class="w-full mb-2.5 bg-dark-20% flex justify-center"
    >
      <Checkbox
        class="text-light-3 py-2.5 hover:text-light-3"
        :labelStyles="getLabelStyles"
        inputId="equivalence-mobile"
        :checked="equivalence"
        size="md"
        :label="$i18n('Mathematical equivalence')"
        @change="handleEquivalenceChange"
      />
    </div>
    <EquationInputEditor
      :latexValue="answer"
      :isDesktop="isDesktop"
      @update:latexValue="handleUpdateValue"
      @update:angleMode="handleUpdateValue"
    />
    <div class="w-full">
      <div
        v-if="isDesktop"
        class="flex gap-1 bottom-2 mb-0 mx-auto p-3 justify-between items-center bg-dark-20% rounded w-full md:px-4 md:rounded-lg md:py-2.5 md:mt-4 md:mx-auto md:max-w-[600px]"
      >
        <div class="flex items-center gap-1">
          <label
            id="math-equi"
            class="text-light-3 font-bold text-xl"
          ><i18n>Mathematical equivalence</i18n></label>
          <MathEquivalencePopover
            :iconSize="18"
            iconClasses="text-sm text-light-66% hover:cursor-pointer ml-1"
            placement="top"
          />
        </div>
        <Switchbox
          ref="switchbox"
          class="custom-response-toggler ml-4"
          :inputId="getUUID"
          name="Mathematical Equivalence"
          aria-label="$i18n('Mathematical Equivalence')"
          size="md"
          theme="translucent"
          :value="equivalence"
          @change="handleEquivalenceChange"
        />
      </div>
      <!-- disabling it for now -->
      <div
        v-if="false"
        class="absolute top-2 right-2"
      >
        <Button
          licon="fas fa-question-circle"
          :aria-label="$i18n('See how it works')"
          :title="$i18n('See how it works')"
          :tabindex="145"
          rounded="sm"
          customClasses="backdrop-blur-md bg-light-20% text-light-3"
          size="sm"
          type="custom"
          @click="handleSeeHowItWorks"
        />
      </div>
      <CustomResponseController
        class="px-3 mt-2 mb-0 w-11/12 md:mt-2 md:border-1"
        :receivedCanSubmitCustomResponse="getCanSubmitCustomResponse()"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import debounce from 'lodash/debounce';

import { getUUID } from '~/services/UIDService.js';

import QuestionOption from '~/models/QuestionOption';
import Constants from '~/config/Constants';
import QLogger from '~/services/QLogger';

export default {
  emits: ['toggleEquationTypeOnboardingModal'],

  data() {
    return {
      answer: '',
      equivalence: true,
    };
  },

  computed: {
    ...mapGetters('root', ['isDesktop']),
    ...mapGetters('slideEditor', ['currentSlide']),
    getLabelStyles() {
      if (this.isDesktop) {
        return {
          fontSize: '18px',
          ':hover': {
            color: '#fff',
          },
        };
      }
      return {
        fontSize: '14px',
        ':hover': {
          color: '#fff',
        },
      };
    },

    questionOptions() {
      return this.currentSlide.structure.options;
    },

    getUUID() {
      return getUUID();
    },

    questionSettings() {
      return this.currentSlide.structure.settings;
    },
  },

  created() {
    this.deboundedUpdateSingleOptionValue = debounce(this.updateSingleOptionValue.bind(this), 100, { leading: true, trailing: true });
    this.debouncedUpdateAnswerValue = debounce(this.updateAnswerValue.bind(this), 100, { leading: true, trailing: true });
  },

  mounted() {
    this.answer = this.currentSlide.structure?.options[0]?.math?.latex[0] || '';
    if (this.currentSlide.structure?.options[0]?.matcher) { this.equivalence = this.currentSlide.structure?.options[0]?.matcher === Constants.MathQuestionMatchers.EQUIVALENCE; }
  },

  methods: {
    handleSeeHowItWorks() {
      this.$emit('toggleEquationTypeOnboardingModal');
    },

    async validateMath(latex) {
      if (!latex) { return; }
      const parsed = await import('kas-npm').then((module) => module.parse(latex).parsed).catch((err) => {
        QLogger.error('Error while parsing math equation', err);
        return true;
      });
      this.$store.dispatch('uiManager/setIsValidMathEquation', parsed);
    },

    handleUpdateValue(latex, angleMode) {
      this.answer = latex;
      if (!this.answer) {
        this.updateOptionsValue([]);
      } else {
        const baseAnswer = {
          math: {
            latex: [this.answer],
          },
          hasMath: true,
          type: 'text',
          text: `<p><katex latex="${this.answer}"></katex></p>`,
          matcher: this.equivalence ? Constants.MathQuestionMatchers.EQUIVALENCE : Constants.MathQuestionMatchers.EXACT,
        };
        if (angleMode) {
          baseAnswer.math = {
            ...baseAnswer.math,
            meta: {
              angleMode,
            },
          };
        }
        this.deboundedUpdateSingleOptionValue(QuestionOption(baseAnswer), 0);
      }
      this.debouncedUpdateAnswerValue();
    },

    async updateSingleOptionValue(option, indexInStoreOptions) {
      this.$store.dispatch('slideEditor/updateSingleQuestionOption', {
        option,
        index: indexInStoreOptions,
      });

      await this.validateMath(this.answer);
      this.$nextTick(() => {
        this.$eventBus.$emit('editor:validateQuestion');
      });
    },

    updateAnswerValue() {
      this.$store.dispatch('slideEditor/updateQuestionAnswer', { answer: 0 });
    },

    updateOptionsValue(options) {
      this.$store.dispatch('slideEditor/updateQuestionOptions', { options });

      this.$nextTick(() => {
        this.$eventBus.$emit('editor:validateQuestion');
      });
    },

    async handleEquivalenceChange() {
      this.equivalence = !this.equivalence;
      if (!this.answer) {
        await this.updateSingleOptionValue([]);
      } else {
        this.updateSingleOptionValue(QuestionOption({
          ...this.questionOptions[0],
          matcher: this.equivalence ? Constants.MathQuestionMatchers.EQUIVALENCE : Constants.MathQuestionMatchers.EXACT,
        }), 0);
      }
    },

    getCanSubmitCustomResponse() {
      return this.questionSettings.canSubmitCustomResponse;
    },
  },
};
</script>

<style lang="scss" scoped>

.equation-input-container-mobile {
  width: 100%;
}

.equi-checkbox {
  accent-color: #00a06a;
}

ul > li {
  list-style-type: disc;
}

.learn-more-btn {
  bottom: -20px;
  right: -192px
}
</style>
