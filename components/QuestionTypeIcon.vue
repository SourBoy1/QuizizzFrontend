<template>
  <span
    class="question-type-icon relative flex items-center justify-center"
    :class="[{
      'text-dark-20% bg-dark-6': disabled,
      'border-2': isSelected,
    }, classes, containerClasses]"
  >
    <slot />
    <FA
      :icon="QuestionTypeIconMap[questionType]?.icon"
      :size="size"
    />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import isEmpty from 'lodash/isEmpty';
import Constants from '~/config/Constants';
import { QuestionTypeIconMap } from '~/config/QuestionTypeIconMap';
import FA from './FA.vue';

interface QuestionTypeIconProps {
  size?: number;
  classes?: string;
  type?: string;
  radius?: string;
  withBgBox?: boolean;
  shouldPaintBackground?: boolean;
  isSelected?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<QuestionTypeIconProps>(), {
  size: 12,
  classes: '',
  type: '',
  radius: '',
  withBgBox: true,
  shouldPaintBackground: true,
  isSelected: false,
  disabled: false,
});

const questionType = computed(() => {
  if (isEmpty(props.type)) {
    return Constants.QuestionTypes.MCQ;
  }

  return props.type;
});

const containerClasses = computed(() => {
  const classes: string[] = [];

  if (props.withBgBox) {
    if (props.shouldPaintBackground && !props.disabled) {
      classes.push(`bg-brand-${QuestionTypeIconMap[questionType.value].brandColor} text-light`);
    }

    if (!isEmpty(props.radius)) {
      classes.push(`rounded-${props.radius}`);
    } else {
      classes.push('rounded');
    }
  } else {
    classes.push(`text-brand-${QuestionTypeIconMap[questionType.value].brandColor}`);
  }

  return classes;
});
</script>
