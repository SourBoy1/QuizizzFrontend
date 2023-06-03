<template>
  <div
    class="bg-dark-20% rounded-lg relative"
    :class="{
      'options-group-mobile snap-center': isForMobile,
      'border border-red-light bg-red-10%': highlightErrorInGroup,
    }"
  >
    <!-- Option Group Header -->
    <div
      class="rounded-t-lg h-14 relative"
      :class="[groupTitleBg, { 'sticky top-0 z-10': isForMobile }]"
      @mouseover="showControls = true"
      @mouseleave="showControls = false"
    >
      <Input
        v-if="editMode"
        ref="groupNameInput"
        v-model="groupName"
        :inputId="`name-${groupIndex}`"
        name="name"
        inputType="text"
        class="p-2"
        :placeholder="$i18n('type group name here...')"
        :inputClasses="'bg-transparent focus:bg-dark-50% rounded-lg h-10'"
        :noBorder="true"
        :maxlength="40"
        autocomplete="off"
        textColorClass="font-semibold text-xl md:text-xl text-light placeholder-light-50%"
        :onBlur="handleOptionsGroupName"
        @input="handleInput"
        @keydown.enter="handleOptionsGroupName"
      />
      <div
        v-if="group?.name && !isEditing"
        class="px-5 py-3 text-light text-xl font-semibold h-14"
      >
        {{ group.name }}
      </div>
      <!-- Edit element -->
      <div
        v-if="(showControls || isForMobile || deleteSelected)"
        class="absolute top-2 right-3 flex"
      >
        <template v-if="!editMode">
          <button
            v-tooltip="$i18n('Edit')"
            type="button"
            :class="['bg-light-20% text-light w-10 h-10 hover:text-light-50% active:text-light-50 rounded-lg mr-1']"
            @click.stop="handleEditName"
          >
            <FA
              icon="fas fa-pencil"
              :size="14"
            />
          </button>

          <!-- Delete element -->
          <PopoverConfirmer
            type="danger"
            placement="top"
            :content="{
              title: $i18n('Delete {$1} ?', [group?.name]),
              subTitle: $i18n('Deleting the group would also delete all the options under this group'),
            }"
            :button1="{
              title: $i18n('Cancel'),
            }"
            :button2="{
              title: $i18n('Delete'),
            }"
            :bodyClasses="'max-w-75'"
            :buttonNumsThatAutoClosePopover="[1]"
            @show="deleteSelected = true"
            @hide="deleteSelected = false"
            @button2Clicked="handleTargetGroupDeletion"
          >
            <button
              type="button"
              :class="['bg-light-20% text-light w-10 h-10 hover:text-light-50% active:text-light-50 rounded-lg']"
            >
              <FA
                icon="fas fa-trash"
                :size="14"
              />
            </button>
          </PopoverConfirmer>
        </template>

        <button
          v-if="editMode"
          v-tooltip="$i18n('Save')"
          type="button"
          :class="['bg-light-20% text-light w-10 h-10 hover:text-light-50% active:text-light-50 rounded-lg mr-1']"
          @click.stop="handleOptionsGroupName"
        >
          <FA
            icon="fas fa-arrow-turn-down-left"
            :size="14"
          />
        </button>
      </div>
    </div>

    <!-- Options Container -->
    <div
      v-if="!isForMobile"
      class="p-2 relative h-90 overflow-scroll flex flex-col gap-2"
    >
      <draggable
        v-if="group?.name && !isForMobile"
        class="overflow-auto h-90 flex flex-col gap-2"
        ghostClass="classification-option-ghost"
        dragClass="classification-option-drag"
        :animation="150"
        :easing="'cubic-bezier(1,0,0,1)'"
        :modelValue="options"
        item-key="_id"
        :group="{ name: group?.name, pull: true, put: true }"
        @update:modelValue="handleOptionsUpdate"
      >
        <template #item="{ element }">
          <Option
            :key="element?._id"
            :option="element"
            :optionIndex="optionIndexFromStore(element)"
            :deleteOption="deleteOption"
            :questionType="questionType"
            :isOnlyOptionInGroup="isOnlyOptionInGroup"
            :handleTargetGroupDeletion="handleTargetGroupDeletion"
            :isForMobile="isForMobile"
          />
        </template>
      </draggable>
    </div>
    <div
      v-if="group?.id"
      class="p-2"
      :class="isForMobile ? 'sticky top-0 z-9' : 'absolute bottom-0 left-0 right-0'"
    >
      <Button
        v-tooltip="addOptionTooltip"
        class="w-full"
        type="transparent"
        size="lg"
        rounded="sm"
        licon="fa fa-square-plus"
        :title="$i18n('Add option')"
        :aria-label="$i18n('Add option')"
        :notCenterJustified="isForMobile"
        @click.stop="addNewOption"
      />
    </div>

    <div
      v-if="isForMobile"
      class="p-2 relative overflow-scroll flex flex-col gap-2"
    >
      <div
        v-for="(element, index) in options"
        :key="index"
      >
        <Option
          :ref="`option-${element?._id}`"
          :key="element?._id"
          :option="element"
          :optionIndex="optionIndexFromStore(element)"
          :deleteOption="deleteOption"
          :questionType="questionType"
          :isOnlyOptionInGroup="isOnlyOptionInGroup"
          :handleTargetGroupDeletion="handleTargetGroupDeletion"
          :isForMobile="isForMobile"
        />
      </div>
    </div>
    <AddOptionModal
      v-if="showAddOptionModal"
      :editorProps="getOptionToolbarProps"
      @close="showAddOptionModal = false"
    />
  </div>
</template>

<script lang="ts">
import { mapGetters } from 'vuex';
import ObjectId from 'bson-objectid';
import draggable from 'vuedraggable';

import isEmpty from 'lodash/isEmpty';
import cloneDeep from 'lodash/cloneDeep';
import differenceBy from 'lodash/differenceBy';

import QuestionOption from '~/models/QuestionOption';
import AddOptionModal from '@/components/Classification/EditOptionModal.vue';
import Constants from '~/config/Constants';
import Option from './Option.vue';

export default {

  components: {
    Option,
    draggable,
    AddOptionModal,
  },

  props: {
    group: {
      type: Object,
      default: () => ({}),
    },

    groupIndex: {
      type: Number,
      default: 0,
    },

    optionIds: {
      type: Array,
      default: () => ([]),
    },

    questionType: {
      type: String,
      required: true,
    },

    options: {
      type: Array,
      default: () => ([]),
    },

    isForMobile: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['createdGroup'],

  data() {
    return {
      groupName: this.group.name || '',
      showControls: false,
      isEditing: false,
      showAddOptionModal: false,
      deleteSelected: false,
    };
  },

  computed: {
    ...mapGetters('slideEditor', ['currentSlide']),
    ...mapGetters('contentEditor', ['questionEditorDimensions', 'quizType']),
    ...mapGetters('uiManager', ['editorSaveValidations']),

    questionAnswer() {
      return this.currentSlide.structure.answer ?? [];
    },

    questionOptions() {
      return this.currentSlide.structure.options ?? [];
    },

    questionTargets() {
      return this.currentSlide.structure.targets ?? [];
    },

    groupTitleBg() {
      const colors = [
        'bg-brand-a',
        'bg-brand-b',
        'bg-brand-c',
        'bg-brand-d',
      ];

      return colors[this.groupIndex];
    },

    editMode() {
      return !this.group.name || this.isEditing;
    },

    currentGroupOptions() {
      return this.optionIds?.map((op) => this.questionOptions.find((i) => i._id === op));
    },

    groupId() {
      return this.group?.id || '';
    },

    isMaxNumOptions() {
      const maxNumOfOptions = this.$constants.QuestionOptionLimits[this.questionType]?.max;
      return this.questionOptions.length >= maxNumOfOptions;
    },

    isMinNumOptions() {
      return this.questionOptions <= this.$constants.QuestionOptionLimits[this.questionType]?.min;
    },

    isOnlyOptionInGroup() {
      return this.currentGroupOptions.length === 1;
    },

    addOptionTooltip() {
      if (this.isMaxNumOptions) {
        return {
          content: this.$i18n('You cannot add more than {$1} options', [this.questionOptions.length]), theme: 'error-tooltip', triggers: ['hover'], placement: 'top',
        };
      }

      return { content: this.$i18n('Add an option'), triggers: ['hover'], placement: 'top' };
    },

    getOptionToolbarProps() {
      return {
        option: {},
        createNewOptionFromMobile: this.createNewOptionFromMobile,
        isNewOptionCreation: true,
      };
    },

    allOptionNames() {
      const options = [];
      this.questionOptions.forEach((option) => {
        options.push(option.text);
      });
      return options;
    },

    highlightErrorInGroup() {
      if (this.editorSaveValidations.length > 1) {
        if (!this.editorSaveValidations[0]?.isValid
          && this.editorSaveValidations[0]?.errorCode === Constants.QuestionValidationErrorCodes.TOO_FEW_OPTION_GROUPS) {
          return this.groupIndex <= 1 && !this.group?.name;
        }
      }
      return false;
    },
  },

  watch: {
    groupId: {
      immediate: true,
      handler(current) {
        if (current && !this.currentGroupOptions?.length) {
          if (this.isForMobile) {
            this.$emit('createdGroup', this.group);
            this.$nextTick().then(() => { this.addNewOption(); });
          } else {
            this.addNewOption();
          }
        }
      },
    },
  },

  methods: {
    handleInput(value) {
      this.groupName = value;
    },

    updateSingleOptionGroupById(target, id) {
      this.$store.dispatch('slideEditor/updateSingleTargetById', { target, id });
    },

    async handleOptionsGroupName() {
      if (this.groupName) {
        this.isEditing = false;
        if (this.allOptionGroupNames(this.groupIndex).indexOf(this.groupName) !== -1) {
          this.$toasts.add({
            type: Constants.ToastTypes.ERROR,
            icon: 'fas fa-times-circle',
            title: this.$i18n('Group with this name already exists!'),
          });
          return;
        }
        if (this.group.id) {
          this.updateSingleOptionGroupById({ ...this.group, name: this.groupName }, this.group.id);
        } else {
          // freshly created options group
          const newTargetId = ObjectId().toHexString();
          await this.$store.dispatch(
            'slideEditor/updateMultipleQuestionProperties',
            {
              targets: [...this.questionTargets, {
                id: newTargetId,
                name: this.groupName,
              }],
            },
          );
          this.groupName = '';
        }
      }
    },

    handleTargetGroupDeletion() {
      const targetGroupId = this.group.id;
      const updatedOptions = differenceBy(this.questionOptions, this.currentGroupOptions, '_id');
      this.$store.dispatch(
        'slideEditor/updateMultipleQuestionProperties',
        {
          targets: this.questionTargets.filter((tg) => tg.id !== targetGroupId),
          answer: this.questionAnswer.filter((answer) => answer.targetId !== targetGroupId),
          options: updatedOptions,
        },
      );
      this.validateQuestion();
    },

    optionIndexFromStore(option) {
      return this.questionOptions.findIndex((i) => i?._id === option?._id);
    },

    addNewOption() {
      if (this.isMaxNumOptions) {
        return;
      }
      if (this.isForMobile) {
        this.showAddOptionModal = true;
        return;
      }
      const newOption = QuestionOption();
      const target = this.questionTargets.find((item) => item.id === this.group.id);
      const answers = !isEmpty(this.questionAnswer) ? cloneDeep(this.questionAnswer) : [];
      const answerToUpdate = answers.find((item) => item.targetId === target?.id);
      if (!isEmpty(answerToUpdate)) {
        answerToUpdate.optionId.push(newOption._id);
      } else {
        answers.push({
          optionId: [newOption._id],
          targetId: target?.id,
        });
      }
      if (target) {
        this.$store.dispatch(
          'slideEditor/updateQuestionOptions',
          {
            options: [...this.questionOptions, newOption],
            answer: answers,
          },
        );
      }
      this.validateQuestion();
    },

    createNewOptionFromMobile(data) {
      const { media, text } = data;
      if (this.isMaxNumOptions) {
        return;
      }
      if (this.allOptionNames.indexOf(text) !== -1) {
        this.$toasts.add({
          type: Constants.ToastTypes.ERROR,
          icon: 'fas fa-times-circle',
          title: this.$i18n('Option with this name already exists!'),
        });
        return;
      }
      const newOption = QuestionOption();
      const target = this.questionTargets.find((item) => item.id === this.group.id);
      const answers = !isEmpty(this.questionAnswer) ? cloneDeep(this.questionAnswer) : [];
      const answerToUpdate = answers.find((item) => item.targetId === target?.id);
      if (isEmpty(media)) {
        // create text option
        newOption.text = text;
        newOption.type = 'text';
      } else {
        // create media option
        newOption.text = '';
        newOption.media = [media];
        newOption.type = 'image';
      }
      if (!isEmpty(answerToUpdate)) {
        answerToUpdate.optionId.push(newOption._id);
      } else {
        answers.push({
          optionId: [newOption._id],
          targetId: target?.id,
        });
      }
      if (target) {
        this.$store.dispatch(
          'slideEditor/updateQuestionOptions',
          {
            options: [...this.questionOptions, newOption],
            answer: answers,
          },
        );
      }
      this.validateQuestion();
    },

    deleteOption(optionId) {
      let optionsToDelete = cloneDeep(this.questionOptions);
      const target = this.questionTargets.find((item) => item.id === this.group.id);
      const answers = !isEmpty(this.questionAnswer) ? cloneDeep(this.questionAnswer) : [];
      let answerToUpdate = answers.find((item) => item.targetId === target?.id);
      const answerToUpdateIndex = answers.findIndex((item) => item.targetId === target?.id);
      optionsToDelete = optionsToDelete.filter((op) => op._id !== optionId);
      if (!isEmpty(answerToUpdate)) {
        answerToUpdate = {
          ...answerToUpdate,
          optionId: answerToUpdate.optionId.filter((op) => op !== optionId),
        };
        answers.splice(answerToUpdateIndex, 1);
        answers.push(answerToUpdate);
      } else {
        answers.push({
          optionId: [],
          targetId: target?.id,
        });
      }
      this.$store.dispatch(
        'slideEditor/updateQuestionOptions',
        {
          options: optionsToDelete,
          answer: answers,
        },
      );
      this.validateQuestion();
    },

    updateSingleOptionValue(option, indexInStoreOptions) {
      this.$store.dispatch('slideEditor/updateSingleQuestionOption', {
        option,
        index: indexInStoreOptions,
      });
    },

    updateQuestionOptions(options) {
      this.$store.dispatch('slideEditor/updateQuestionOptions', { options });
    },

    validateQuestion() {
      this.$nextTick(() => {
        this.$eventBus.$emit('editor:validateQuestion');
      });
    },

    handleEditName() {
      this.isEditing = true;
      const self = this;
      this.$nextTick().then(() => {
        self.$refs?.groupNameInput.$refs?.input?.focus();
        self.$refs?.groupNameInput.$refs?.input?.click();
      });
    },

    handleOptionsUpdate(updatedValue) {
      const updatedAnswer = cloneDeep(this.questionAnswer);
      updatedAnswer?.forEach((answer) => {
        const result = updatedValue.map(({ _id: id }) => id);
        if (answer.targetId === this.groupId) {
          // eslint-disable-next-line no-param-reassign
          answer.optionId = result;
        }
      });
      this.$store.dispatch('slideEditor/updateQuestionAnswer', { answer: updatedAnswer });
      this.validateQuestion();
    },

    allOptionGroupNames(groupIndex) {
      const groupNames = [];
      this.questionTargets.forEach((og, index) => {
        if (index === groupIndex) {
          return;
        }
        groupNames.push(og.name);
      });
      return groupNames;
    },
  },
};
</script>

<style lang="scss" scoped>
  .options-group-mobile {
    overflow: auto;
    width: calc(100vw - 72px);
    height: calc(100% - 48px);
  }

  .classification-option-ghost {
    opacity: 0.2;
  }

  .classification-option-drag, .classification-option-ghost {
    cursor: grab !important;
    cursor: -moz-grab !important;
    cursor: -webkit-grab !important;
  }

  /* (Optional) Apply a "closed-hand" cursor during drag operation. */
  .classification-option-drag:active, .classification-option-ghost:active {
    cursor: grabbing !important;
    cursor: -moz-grabbing !important;
    cursor: -webkit-grabbing !important;
  }
</style>
