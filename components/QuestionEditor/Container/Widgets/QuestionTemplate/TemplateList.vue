<template>
  <Accordion
    isOpened
    accordianCloseIcon="fa fa-caret-down mr-2"
    accordianOpenIcon="fa fa-caret-up mr-2"
    accordianContainerClasses="bg-light-10% text-light-3 mb-3 rounded"
    collapsedAccordianClasses="bg-light-20% rounded"
  >
    <template #title>
      <div class="px-2 py-0.5">
        {{ templateData.name }}
      </div>
    </template>
    <TemplateItem
      v-for="(templateItem, itemIndex) in templateData.data"
      :key="itemIndex"
      :class="{ 'pb-4': itemIndex === templateData.data.length - 1 }"
      :templateItem="templateItem"
      @template-selected="$emit('template-selected', templateItem, templateData.name)"
      @template-hovered="$emit('template-hovered', templateItem)"
      @template-hover-canceled="$emit('template-hover-canceled')"
    />
  </Accordion>
</template>

<script>
import Accordion from '~/components/Accordian.vue';
import TemplateItem from './TemplateItem.vue';

export default {

  components: {
    Accordion,
    TemplateItem,
  },
  props: {
    templateData: {
      type: Object,
      required: true,
    },
  },
  emits: ['template-selected', 'template-hovered', 'template-hover-canceled'],
};
</script>
