<template>
  <Modal
    :title="$i18n('Import questions from spreadsheet')"
    :subtitle="$i18n('Please upload an excel spreadsheet that follows the sample template')"
    containerClasses="import-sheets-modal"
    headerCustomClasses="mb-0"
    icon="far fa-file-excel"
    type="default"
    :button1="button1"
    :button2="button2"
    size="custom"
    @close="$emit('close')"
    @button1-click="$emit('close')"
    @button2-click="handleButton2Click"
  >
    <div
      v-if="showQuestionLimitDisclaimer"
      class="excel-container-upload bg-light-2 border border-dashed border-dark-10% relative my-8 flex flex-col justify-center items-center"
    >
      <input
        ref="fileInput"
        class="absolute z-40 w-full h-full opacity-0 cursor-pointer"
        type="file"
        accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
        @input="handleInput"
      />
      <img
        :class="['absolute bottom-0 right-0', isDesktop ? 'h-75' : 'h-30']"
        src="https://cf.quizizz.com/img/editor/500-limit.png"
        alt="500-limit-error"
      />
      <div :class="['self-start w-4/6', isDesktop ? 'ml-12' : 'w-4/5 self-center']">
        <h1 class="text-base font-semibold text-dark-2">
          <i18n>Unfortunately you cannot add more than 500 questions to a quiz.</i18n>
        </h1>
        <h1 class="mt-2 text-sm text-dark-2">
          <i18n>A teacher once added 11,000 and their laptop ran so hot it burned a hole in their desk. The quiz was still safe with us. But at what cost?</i18n>
        </h1>
        <Button
          :title="$i18n('Upload another file')"
          :fullHeight="true"
          size="md"
          type="primary"
          buttonClasses="h-8 bg-lilac-faded text-lilac mt-4"
          licon="far fa-upload"
          :hasLIcon="true"
        />
        <div class="ml-5 italic text-tn text-dark-3">
          <i18n>or drag and drop the file here</i18n>
        </div>
        <div
          v-if="uploading"
          class="loading absolute inset-0 bg-dark-50% text-light-3 z-20 flex justify-center items-center"
        >
          <FA
            class="animate-spin"
            icon="far fa-sync"
            :size="48"
          />
        </div>
      </div>
    </div>
    <div
      v-else-if="!uploaded"
      class="excel-container-upload bg-light-2 border border-dashed border-dark-10% relative my-8 flex flex-col justify-center items-center"
    >
      <img
        src="https://cf.quizizz.com/img/icons/import_excel.png"
        alt="import-excel"
      />
      <div class="text-xs font-semibold text-dark-3">
        <i18n>Drag and drop or</i18n>
      </div>
      <div class="text-xs font-semibold text-dark-3">
        <i18n>Click here to upload spreadsheet</i18n>
      </div>
      <input
        ref="fileInput"
        class="absolute z-10 w-full h-full opacity-0 cursor-pointer"
        type="file"
        accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
        @input="handleInput"
      />
      <div
        v-if="uploading"
        class="loading absolute inset-0 bg-dark-50% text-light-3 z-20 flex justify-center items-center"
      >
        <FA
          class="animate-spin"
          icon="far fa-sync"
          :size="48"
        />
      </div>
    </div>
    <div v-else>
      <div
        class="mt-8 mb-4 border bg-light-2 border-dark-6"
        @mousedown="ev => { focussed(ev, -1, '') }"
      >
        <div
          ref="tableContainerWrapper"
          class="relative flex overflow-auto excel-container"
        >
          <div class="sticky left-0 z-30 flex flex-col w-12 num-col bg-light-2">
            <div class="flex justify-center w-12 h-6 border-b border-r num-cell border-dark-6">
            &nbsp;
            </div>
            <div
              v-for="(row, index) in extracted "
              :key="index"
              class="z-40 flex justify-center w-12 h-6 border-b border-r num-cell bg-light-2 border-dark-6"
              :class="{ 'bg-red-faded text-red-light': rowError(index) }"
            >
              {{ index + 1 }}
            </div>
          </div>

          <div
            ref="tableContainer"
            class="absolute flex flex-col table-part left-12"
          >
            <div class="sticky top-0 z-10 flex header bg-light-2">
              <div
                v-for="col in questionColumnsForExcel"
                :key="col.name"
                class="flex justify-between h-6 px-2 text-sm font-semibold border-b border-r border-dark-6 text-dark-3 shrink-0"
                :class="[`w-${col.width}`, { 'bg-red-faded text-red-light': colError(col.value) }]"
              >
                {{ col.name }}
                <Tooltip
                  v-if="col.hasTooltip"
                  ref="tooltip"
                  v-bind="tooltipData(col)"
                  :tooltipContentStyle="{ textAlign: 'left' }"
                  class="relative z-on-overlay"
                >
                  <FA
                    icon="fas fa-info-circle"
                    class="ml-3"
                  />
                </Tooltip>
              </div>
            </div>

            <div class="flex flex-col mb-10 excel-data-questions">
              <div
                v-for="(item, index) in extracted"
                :key="index"
                class="flex h-6"
              >
                <div
                  :class="[
                    'w-64 h-6 shrink-0',
                    { 'z-10': index === selectedIndex && selectedField === 'questionText' },
                  ]"
                >
                  <textarea
                    :id="`questionText${index}`"
                    v-model="item.text"
                    :class="[
                      'px-2 text-sm font-semibold text-dark-3 border-r border-b border-dark-6 placeholder-dark-5 resize-none overflow-hidden',
                      { 'bg-red-faded': hasError(index, 'questionText') },
                      index === selectedIndex && selectedField === 'questionText' ? 'w-80 h-16 border border-lilac shadow-lg overflow-scroll' : 'w-full h-full text-ellipsis',
                    ]"
                    type="text"
                    :placeholder="$i18n('Required')"
                    @focus="ev => { focussed(ev, index, 'questionText') }"
                    @mousedown="ev => { focussed(ev, index, 'questionText') }"
                    @keydown.enter.exact.prevent="ev => { ev.target.blur() }"
                    @keydown.enter.shift.exact.prevent="item.text += '\n'"
                    @blur="ev => { focussed(ev, -1, '') }"
                    @input="debouncedValidateQuestions"
                  />
                </div>
                <div
                  class="w-40 shrink-0"
                  :class="[{ 'z-10': index === selectedIndex && selectedField === 'questionType' }]"
                  @mousedown="ev => { focussed(ev, index, 'questionType') }"
                >
                  <SelectBox
                    v-model="item.questionType"
                    :list="getQuestionTypes"
                    :ariaLabel="$i18n('Question Type')"
                    size="md"
                    listTextSize="text-sm"
                    iconSize="xs"
                    listContainerClasses="excel-select-box-container"
                    customClasses="excel-select-box font-semibold h-6 text-dark-3 bg-white border-b border-r border-dark-6 rounded-r-none rounded-l-none"
                    :noBorder="true"
                    listMarginTop="mt-7"
                    @input="debouncedValidateQuestions"
                  />
                </div>

                <div
                  v-for="optNumber in 5"
                  :key="`option${optNumber}-${index}`"
                  :class="['w-32 h-6 shrink-0', { 'z-10': index === selectedIndex && selectedField === `option${optNumber}${index}` }]"
                >
                  <textarea
                    :id="`option${optNumber}${index}`"
                    v-model="item[`option${optNumber}`]"
                    :class="[
                      'px-2 text-sm font-semibold text-dark-3 border-r border-b border-dark-6 placeholder-dark-5 resize-none overflow-hidden',
                      { 'bg-red-faded': hasError(index, `option${optNumber}`) },
                      (index === selectedIndex && selectedField === `option${optNumber}${index}`) ? 'w-80 h-16 border border-lilac shadow-lg overflow-scroll' : 'w-full h-full text-ellipsis whitespace-nowrap overflow-hidden',
                    ]"
                    type="text"
                    :placeholder="(isRequired(optNumber, item.questionType)) ? $i18n('Required') : $i18n('Optional')"
                    @focus="ev => { focussed(ev, index, `option${optNumber}${index}`) }"
                    @mousedown="ev => { focussed(ev, index, `option${optNumber}${index}`) }"
                    @keydown.enter.exact.prevent="ev => { ev.target.blur() }"
                    @keydown.enter.shift.exact.prevent="item[`option${optNumber}`] += '\n'"
                    @blur="ev => { focussed(ev, -1, '') }"
                    @input="debouncedValidateQuestions"
                  />
                </div>

                <div
                  ref="correct"
                  class="w-32 h-6 shrink-0"
                >
                  <input
                    :id="`correct${index}`"
                    v-model="item.correct"
                    :class="[
                      'w-full h-full px-2 text-sm font-semibold text-dark-3 border-r border-b border-dark-6 placeholder-dark-5',
                      { 'bg-red-faded ': hasError(index, 'correct') },
                    ]"
                    type="text"
                    :placeholder="$i18n('1-5')"
                    @focus="ev => { focussed(ev, index, 'correct') }"
                    @mousedown="ev => { focussed(ev, index, 'correct') }"
                    @blur="ev => { focussed(ev, -1, '') }"
                    @input="debouncedValidateQuestions"
                  />
                </div>

                <div
                  ref="time"
                  class="w-20 shrink-0"
                  :class="[{ 'z-10': index === selectedIndex && selectedField === 'time' }]"
                  @mousedown="ev => { focussed(ev, index, 'time') }"
                >
                  <SelectBox
                    v-model="item.time"
                    :list="getTimeOptions"
                    :ariaLabel="$i18n('Time')"
                    size="md"
                    listTextSize="text-sm"
                    iconSize="xs"
                    listContainerClasses="excel-select-box-container"
                    customClasses="excel-select-box font-semibold h-6 text-dark-3 bg-white border-b border-r border-dark-6 rounded-r-none rounded-l-none z-0"
                    :noBorder="true"
                    listMarginTop="mt-7"
                  />
                </div>

                <div
                  ref="url"
                  :class="['w-64 h-6 shrink-0', { 'z-10': index === selectedIndex && selectedField === `url${index}` }]"
                >
                  <textarea
                    :id="`url${index}`"
                    v-model="item.url"
                    :class="[
                      'px-2 text-sm font-semibold text-dark-3 border-r border-b border-dark-6 placeholder-dark-5 resize-none overflow-hidden',
                      { 'bg-red-faded': hasError(index, 'url') },
                      (index === selectedIndex && selectedField === `url${index}`) ? 'w-80 h-16 border border-lilac shadow-lg overflow-scroll' : 'w-full h-full',
                    ]"
                    type="text"
                    :placeholder="$i18n('Optional')"
                    @focus="ev => { focussed(ev, index, `url${index}`) }"
                    @mousedown="ev => { focussed(ev, index, `url${index}`) }"
                    @keydown.enter.exact.prevent="ev => { ev.target.blur() }"
                    @blur="ev => { focussed(ev, -1, '') }"
                    @input="debouncedValidateQuestions"
                  />
                </div>

                <div class="flex justify-center w-16 h-6 px-2 text-sm font-semibold text-dark-3 shrink-0">
                  <PopoverConfirmer
                    type="danger"
                    placement="top"
                    :content="{
                      title: $i18n('Are you sure you want to delete this question?'),
                    }"
                    :button2="{
                      title: $i18n('Delete'),
                    }"
                    @button2Clicked="ev => { deleteRow(ev, index) }"
                  >
                    <button>
                      <FA
                        icon="far fa-trash-alt"
                        :size="12"
                      />
                    </button>
                  </PopoverConfirmer>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          class="flex justify-between h-8 px-2 text-xs font-semibold self"
          :class="areErrorsPresent ? 'bg-red-faded text-red-dark' : 'bg-green-faded text-green-dark'"
        >
          <div class="flex items-center gap-2 w-100">
            <div
              v-if="!areErrorsPresent"
              class="flex gap-2"
            >
              <FA
                icon="fas fa-check-circle"
                :size="12"
              />
              <span><i18n>Looks good!</i18n></span>
            </div>
            <div
              v-else-if="(areErrorsPresent && errorType)"
              class="flex gap-2"
            >
              <FA
                icon="fa fa-info-circle"
                :size="12"
              />
              <span>{{ errorType }}</span>
            </div>
          </div>
          <div
            v-if="areErrorsPresent"
            class="items-center mt-1"
          >
            <Button
              size="xs"
              :title="$i18n('Next error')"
              :aria-label="$i18n('Next error')"
              type="white"
              class=""
              @click="nextError()"
            />
          </div>
        </div>
      </div>
    </div>

    <div
      slot="footer-text"
      class="flex items-center mr-auto"
    >
      <a
        v-if="!uploaded"
        class="flex items-center text-xs text-dark-2 font-semibold rounded hover:bg-dark-5% p-1"
        href="https://cf.quizizz.com/xlsx/QuizizzSampleSpreadsheetUpdated.xlsx"
        target="_BLANK"
      >
        <img
          class="w-6 h-6 mr-1"
          src="https://cf.quizizz.com/img/icons/msExcel.png"
          alt="msExcel"
        />
        <i18n>Download sample template</i18n>
      </a>
      <div v-else>
        <Button
          class="mr-auto"
          :title="$i18n('Back')"
          size="md"
          type="other"
          licon="fas fa-arrow-left"
          @click="handleBackBtnClick()"
        />
      </div>
    </div>
  </modal>
</template>
<script>
import { mapGetters } from 'vuex';

import isNumber from 'lodash/isNumber';
import isNaN from 'lodash/isNaN';
import isEmpty from 'lodash/isEmpty';
import debounce from 'lodash/debounce';
import find from 'lodash/find';
import escape from 'lodash/escape';
import isString from 'lodash/isString';

import {
  ExcelImportErrorMessages, QuestionColumnsForExcel, ExcelImportErrorFields, ExcelImportErrorTypes,
} from '~/config/ExcelImport';
import Constants from '~/config/Constants';
import QuizService from '../services/apis/QuizService';
import UrlUtils from '../utils/UrlUtils';
import QLogger from '../services/QLogger';
import Question from '../models/Question';
import Structure from '../models/Structure';
import QuestionQuery from '../models/QuestionQuery';
import QuestionOption from '../models/QuestionOption';
import { getSingleSlideValidationErrors, shouldQuestionTypeHaveCorrectAnswer } from '../utils/QuizUtils';

export default {
  props: {
    questionImportLimit: {
      type: Number,
      default: Constants.MaxQuestionsLimit,
    },
  },
  emits: ['close', 'saveSpreadSheetQuestions'],

  data() {
    return {
      uploading: false,
      uploaded: false,
      extracted: [],
      selectedIndex: -1,
      selectedField: '',
      errors: [],
      errorIndex: 0,
      errorType: '',
      isDoneButtonLoading: false,
      showToastForUnimportedQuestions: false,
      showQuestionLimitDisclaimer: false,
      questionColumnsForExcel: QuestionColumnsForExcel,
    };
  },

  computed: {
    ...mapGetters('contentEditor', ['quizId', 'quizType']),
    ...mapGetters('root', ['isDesktop']),
    button1() {
      return {
        title: this.$i18n('Cancel'),
        type: 'other',
      };
    },

    button2() {
      return {
        title: this.$i18n('Import'),
        disabled: !this.uploaded || !isEmpty(this.errors),
        loading: this.isDoneButtonLoading,
        buttonClasses: this.isDoneButtonLoading ? 'pointer-events-none cursor-not-allowed' : '',
      };
    },

    getQuestionTypes() {
      const options = Object.values(this.$constants.QuestionTypesForExcel).map((item) => ({
        title: item,
        value: item,
      }));
      return options;
    },

    getTimeOptions() {
      return this.$constants.QuestionDefaultTimesInSecs.map((item) => ({
        title: `${item}`,
        value: item,
      }));
    },

    rowError() {
      return (index) => this.errors.find((item) => item.index === index);
    },

    colError() {
      return (value) => this.errors.find((item) => item.field === value);
    },

    tooltipData() {
      return (entity) => ({
        text: this.$i18n('{$1}', [entity.text]),
        theme: 'dark',
        showOnHover: entity.hasTooltip,
        position: 'bottom',
        tooltipSize: 'sm',
      });
    },

    areErrorsPresent() {
      return this.errors.length > 0;
    },
    isRequired() {
      return (optionNumber, questionType) => {
        if (optionNumber === 1 && [this.$constants.QuestionTypesForExcel.FILL_IN_THE_BLANK].includes(questionType)) {
          return true;
        }
        return optionNumber <= 2 && [this.$constants.QuestionTypesForExcel.MULTIPLE_CHOICE, this.$constants.QuestionTypesForExcel.CHECKBOX, this.$constants.QuestionTypesForExcel.POLL].includes(questionType);
      };
    },

  },

  watch: {
    uploaded(newVal) {
      if (newVal) {
        this.validateQuestions();
      }
    },
  },

  created() {
    this.debouncedValidateQuestions = debounce(this.validateQuestions, 500);
  },

  methods: {

    handleBackBtnClick() {
      this.uploaded = false;
    },

    async handleInput(ev) {
      if (ev.target?.files?.length === 0 || !['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'].includes(ev.target?.files[0]?.type)) {
        return;
      }
      this.uploading = true;
      let url = '';
      try {
        url = await this.$fileUpload.uploadFileToS3(ev.target.files[0], {
          destination: 'uploadedSheets',
          folder: '_excel',
          metadata: {
            'Content-Type': ev.target.files[0].type,
          },
        });
      } catch (err) {
        QLogger.error('Error at ImportSpreadsheetModal.handleInput', err);
        this.$toasts.add({
          type: this.$constants.ToastTypes.ERROR,
          icon: 'fas fa-times-circle',
          title: this.$i18n('Something went wrong while uploading the file!'),
        });
        return;
      }
      this.$refs.fileInput.value = '';
      if (!url) {
        return;
      }
      const key = url.substring(url.indexOf('_excel/'));
      const { success, error, extracted } = await QuizService.uploadQuiz(key);
      if (!success) {
        if (error === ExcelImportErrorMessages.INVALID_SHEET) {
          this.$toasts.add({
            type: this.$constants.ToastTypes.ERROR,
            icon: 'fas fa-times-circle',
            title: error,
          });
        } else {
          this.$toasts.add({
            type: this.$constants.ToastTypes.ERROR,
            icon: 'fas fa-times-circle',
            title: this.$i18n('Something went wrong while uploading the file!'),
          });
        }
        this.uploading = false;
        return;
      }
      this.uploading = false;
      if (extracted.length > this.questionImportLimit) {
        this.showQuestionLimitDisclaimer = true;
        url = '';
        return;
      }
      this.showQuestionLimitDisclaimer = false;
      this.uploaded = true;
      for (const row of extracted) {
        row.option1 = row.option1?.toString();
        row.option2 = row.option2?.toString();
        row.option3 = row.option3?.toString();
        row.option4 = row.option4?.toString();
        row.option5 = row.option5?.toString();
        row.option6 = row.option6?.toString();

        if (Array.isArray(row.correct)) {
          row.correct = row.correct.map((item) => item + 1).join(',');
        } else if (isNumber(row.correct)) {
          row.correct += 1;
          row.correct = `${row.correct}`;
        }

        if (row.questionType === this.$constants.QuestionTypes.OPEN || row.questionType === this.$constants.QuestionTypes.DRAW) {
          row.option1 = '-';
          row.option2 = '-';
          row.option3 = '-';
          row.option4 = '-';
          row.option5 = '-';
        }

        if ([this.$constants.QuestionTypes.OPEN, this.$constants.QuestionTypes.BLANK, 'SURVEY', this.$constants.QuestionTypes.DRAW].includes(row.questionType)) {
          row.correct = '-';
        }
        if (!row.time) {
          row.time = '30';
        }
        row.questionType = this.questionTypeToLabel(row.questionType);
      }
      this.extracted = extracted;
    },

    questionTypeToLabel(type) {
      switch (type) {
        case 'SURVEY': return this.$constants.QuestionTypesForExcel.POLL;
        case this.$constants.QuestionTypes.MSQ: return this.$constants.QuestionTypesForExcel.CHECKBOX;
        case this.$constants.QuestionTypes.BLANK: return this.$constants.QuestionTypesForExcel.FILL_IN_THE_BLANK;
        case this.$constants.QuestionTypes.OPEN: return this.$constants.QuestionTypesForExcel.OPEN_ENDED;
        case this.$constants.QuestionTypes.DRAW: return this.$constants.QuestionTypesForExcel.DRAW;
        case this.$constants.QuestionTypes.MCQ:
        default:
          return this.$constants.QuestionTypesForExcel.MULTIPLE_CHOICE;
      }
    },

    focussed(ev, index, field) {
      this.selectedIndex = index;
      this.selectedField = field;
      const error = this.errors.find((item) => item.id === ev.target.id);
      this.errorType = this.getErrorType(error);
      ev.stopPropagation();
    },

    deleteRow(ev, index) {
      this.extracted.splice(index, 1);
      this.selectedIndex = -1;
      this.selectedField = '';
      this.validateQuestions();
      if (this.extracted.length === 0) {
        this.uploaded = false;
      }
    },

    validateQuestion(index, ev) {
      const _question = this.extracted[index];
      const isQuestionQueryPresent = _question.text || _question.url;
      const isValidURL = UrlUtils.isValidURL(_question.url);
      const correct = _question?.correct?.trim();
      const errorFields = [];
      /**
       * * Check if question text is present
       * ! STARTS
       */
      if (!isQuestionQueryPresent) {
        errorFields.push(ExcelImportErrorFields.QUESTION_TEXT);
      }
      /**
       * * Check if question text is present
       * ! ENDS
       */

      /**
       * * Check if the question has a URL & is a valid URL
       * ! STARTS
       */
      if ((_question.url && !isValidURL)) {
        errorFields.push(ExcelImportErrorFields.URL);
      }
      /**
       * * Check if the question has a URL & is a valid URL
       * ! ENDS
       */

      /**
       * * Except for OPEN & DRAW, check if option 1 exists
       * ! STARTS
       */

      if (!_question.option1 && ![this.$constants.QuestionTypesForExcel.OPEN_ENDED, this.$constants.QuestionTypesForExcel.DRAW].includes(_question.questionType)) {
        errorFields.push(ExcelImportErrorFields.OPTION_1);
      }
      /**
       * * Except for OPEN & DRAW, check if option 1 exists
       * ! ENDS
       */

      /**
       * * Except for FIB, OPEN, DRAW, check if option 2 exists
       * ! STARTS
       */

      if (!_question.option2 && ![this.$constants.QuestionTypesForExcel.FILL_IN_THE_BLANK, this.$constants.QuestionTypesForExcel.OPEN_ENDED, this.$constants.QuestionTypesForExcel.DRAW].includes(_question.questionType)) {
        errorFields.push(ExcelImportErrorFields.OPTION_2);
      }
      /**
       * * Except for FIB, OPEN, DRAW, check if option 2 exists
       * ! ENDS
       */

      /**
       * * Validate Correct Answer for MCQ
       * ! STARTS
       */

      if (_question.questionType === this.$constants.QuestionTypesForExcel.MULTIPLE_CHOICE) {
        if (!correct || correct.includes(',') || correct < 1 || correct > 5) {
          errorFields.push(ExcelImportErrorFields.CORRECT);
        } else {
          const answer = Number(correct?.trim());
          if (isNaN(answer) || answer < 0 || answer > 5) {
            errorFields.push(ExcelImportErrorFields.CORRECT);
          }
        }
      }
      /**
       * * Validate Correct Answer for MCQ
       * ! ENDS
       */

      /**
       * * Validate Correct Answer for MSQ
       * ! STARTS
       */

      if (_question.questionType === this.$constants.QuestionTypesForExcel.CHECKBOX) {
        if (!correct || !correct.includes(',')) {
          errorFields.push(ExcelImportErrorFields.CORRECT);
        } else {
          const splits = correct.split(',');
          splits.forEach((split) => {
            if (isEmpty(split)) {
              errorFields.push(ExcelImportErrorFields.CORRECT);
            }
            const answer = Number(split?.trim());
            if (isNaN(answer) || answer < 0 || answer > 5) {
              errorFields.push(ExcelImportErrorFields.CORRECT);
            }
          });
        }
      }
      /**
       * * Validate Correct Answer for MSQ
       * ! ENDS
       */
      if (!isEmpty(errorFields)) {
        errorFields.forEach((field) => {
          this.errors.push({ index, field, id: field + index });
        });
      }
      if (this.uploaded) {
        const error = this.errors.find((item) => item.id === ev?.target?.id);
        this.errorType = this.getErrorType(error);
      }
    },

    validateQuestions(ev) {
      this.errors = [];
      for (let i = 0; i < this.extracted.length; i++) {
        this.validateQuestion(i, ev);
      }
    },

    async handleButton2Click() {
      if (!isEmpty(this.errors)) {
        this.isDoneButtonLoading = true;
        this.$toasts.add({
          type: this.$constants.ToastTypes.ERROR,
          icon: 'fas fa-times-circle',
          title: this.$i18n('Few questions have invalid data!'),
        });
        const eventName = this.$webEvents.getQuizEditorEvent(this.quizType, this.$webEvents.IMPORT_SPREADSHEET_ERROR);
        this.$analytics.logEvent(
          eventName,
          {
            quizId: this.quizId,
            errorCategory: 'question validation error',
          },
        );
        this.isDoneButtonLoading = false;
        return;
      }
      const processedQuestions = await this.getProcessedQuestion();
      const doneCallback = () => {
        this.isDoneButtonLoading = true;
      };
      this.isDoneButtonLoading = true;
      if (this.showToastForUnimportedQuestions) {
        this.$toasts.add({
          type: this.$constants.ToastTypes.ERROR,
          icon: 'fas fa-times-circle',
          title: this.$i18n('Few questions have invalid data!'),
        });
        const eventName = this.$webEvents.getQuizEditorEvent(this.quizType, this.$webEvents.IMPORT_SPREADSHEET_ERROR);
        this.$analytics.logEvent(
          eventName,
          {
            quizId: this.quizId,
            errorCategory: 'unimported questions error',
          },
        );
        this.showToastForUnimportedQuestions = false;
      }

      const eventName = this.$webEvents.getQuizEditorEvent(this.quizType, this.$webEvents.SPREADSHEET_SAVE);
      this.$analytics.logEvent(
        eventName,
        {
          quizId: this.quizId,
          source: this.$route.name,
        },
      );
      this.$emit('saveSpreadSheetQuestions', processedQuestions, doneCallback);
    },

    hasError(index, field) {
      return !!find(this.errors, (item) => item.index === index && item.field === field);
    },

    async getProcessedQuestion() {
      const questions = [];
      await this.extracted.reduce(async (result, rawQuestion) => {
        const queryMedia = [];
        let questionType = this.transformTypeToConsumableQuestionType(rawQuestion.questionType);
        let hasCorrectAnswer = true;
        let queryType = '';
        let answer = this.transformCorrectToConsumableAnswer(rawQuestion.correct);
        const time = (rawQuestion.time || 30) * 1000;
        const options = [];
        if (questionType !== this.$constants.QuestionTypes.DRAW) {
          for (let i = 0; i < rawQuestion.numOptions; i++) {
            if (!isEmpty(rawQuestion[`option${i + 1}`])) {
              options.push(QuestionOption({ text: escape(rawQuestion[`option${i + 1}`]) }));
            }
          }
        }

        if (!shouldQuestionTypeHaveCorrectAnswer({ type: questionType })) {
          hasCorrectAnswer = false;

          if (questionType === this.$constants.QuestionTypes.POLL) {
            answer = -1;
            // changing the type to MSQ or MCQ again, as questionType `POLL` isn't handled on backend
            questionType = Array.isArray(answer) ? this.$constants.QuestionTypes.MSQ : this.$constants.QuestionTypes.MCQ;
          }
        }
        if (!isEmpty(rawQuestion.url)) {
          queryMedia.push({ url: rawQuestion.url, type: 'image' });
        } else if ((questionType === this.$constants.QuestionTypes.DRAW)) {
          queryMedia.push({ url: this.$constants.DrawQuestionBlankImage, type: 'image' });
        }
        if (!isEmpty(rawQuestion.text)) {
          queryType = 'text';
        }
        if (!isEmpty(queryMedia)) {
          queryType += `${isEmpty(rawQuestion.text) ? '' : '_'}image`;
        }
        const cookedQuestion = Question({
          time,
          type: questionType,
          structure: Structure({
            answer,
            kind: questionType,
            options,
            settings: {
              hasCorrectAnswer,
            },
            query: QuestionQuery({
              type: queryType,
              text: escape(rawQuestion.text),
              media: queryMedia,
            }),
          }),
        });
        const validationErrors = await getSingleSlideValidationErrors(cookedQuestion);
        if (isEmpty(validationErrors)) {
          questions.push(cookedQuestion);
        } else {
          this.showToastForUnimportedQuestions = true;
          QLogger.error(`Error at ImportSpreadsheetModal.getProcessedQuestion: Not including the following question due to these errors ${validationErrors}`, cookedQuestion);
        }
        return await result;
      }, []);

      return questions;
    },

    transformCorrectToConsumableAnswer(rawCorrectValue) {
      let answer = rawCorrectValue?.trim();
      if (isString(answer) && answer.includes(',')) {
        try {
          answer = JSON.parse(`[${answer}]`);
          answer = answer.map((item) => item - 1);
        } catch (err) {
          QLogger.error('Error at ImportSpreadsheetModal.transformCorrect', err);
        }
      } else if (Array.isArray(answer)) {
        answer = answer.map((item) => item - 1);
      } else if (!!answer && answer >= 0) {
        answer = answer > 0 ? +answer - 1 : 0;
      }
      if (Array.isArray(answer)) {
        answer = answer.reduce((result, optIndex) => {
          const parsed = parseInt(optIndex, 10);
          // TODO(sarthak): handle this with ui validation checks
          if (!isNaN(answer)) {
            result.push(parsed);
          }
          return result;
        }, []);
      }
      return answer;
    },

    transformTypeToConsumableQuestionType(rawType) {
      switch (rawType) {
        case this.$constants.QuestionTypesForExcel.FILL_IN_THE_BLANK:
          return this.$constants.QuestionTypes.BLANK;

        case this.$constants.QuestionTypesForExcel.OPEN_ENDED:
          return this.$constants.QuestionTypes.OPEN;

        case this.$constants.QuestionTypesForExcel.CHECKBOX:
          return this.$constants.QuestionTypes.MSQ;

        case this.$constants.QuestionTypesForExcel.POLL:
          return this.$constants.QuestionTypes.POLL;

        case this.$constants.QuestionTypesForExcel.DRAW:
          return this.$constants.QuestionTypes.DRAW;

        case this.$constants.QuestionTypesForExcel.MULTIPLE_CHOICE:
        default:
          return this.$constants.QuestionTypes.MCQ;
      }
    },

    getErrorType(error) {
      const lowerCasedField = error?.field?.toLowerCase() ?? '';
      if (lowerCasedField.includes('option')) {
        return ExcelImportErrorTypes.MISSING_ANSWER_OPTION;
      }
      if (lowerCasedField.includes('correct')) {
        return ExcelImportErrorTypes.INVALID_CORRECT_OPTION;
      }
      if (lowerCasedField.includes('url')) {
        return ExcelImportErrorTypes.INVALID_URL;
      }
      if (lowerCasedField.includes('questiontext')) {
        return ExcelImportErrorTypes.MISSING_QUESTION_TEXT;
      }
      return this.$i18n('{$1}{$2} found in this spreadsheet', [this.errors.length, this.errors.length > 1 ? ' errors' : ' error']);
    },

    nextError() {
      const error = this.errors[this.errorIndex % this.errors.length];
      const errorId = error?.id ?? '';
      document.getElementById(errorId)?.focus();
      this.errorIndex += 1;
    },
  },
};
</script>

<style lang='scss'>

$modalMaxWidth: 1280px;
$containerBeforeImportHeight: 450px;
$containerAfterImportHeight: 432px;

.import-sheets-modal{
  max-width: $modalMaxWidth !important;
  width: 80% !important;

.excel-container-upload{
    height: $containerBeforeImportHeight;
  }

  .excel-container {
  height: $containerBeforeImportHeight;
}

  textarea::placeholder,input::placeholder {
    font-style: italic;
  }
}
.excel-select-box-container {
  margin-top: 1.75rem !important;
}

</style>
