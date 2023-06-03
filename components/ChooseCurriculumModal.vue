<template>
  <Modal
    :title="$i18n('Pick a curriculum')"
    :subtitle="$i18n('Get student performance in \'Reports\' aggregated by each standard')"
    :button1="{
      title: $i18n('Skip'),
      type: 'other',
      size: 'md',
    }"
    :button2="{
      title: $i18n('Save'),
      type: 'primary',
      size: 'md',
      loading: loading,
    }"
    :overflowY="false"
    @button1-click="$emit('cancel')"
    @button2-click="$emit('save', selected)"
    @close="$emit('close')"
  >
    <Dropdown
      ref="curriculumDropdown"
      class="w-full rounded-md curriculum-dropdown border-1 border-dark-6"
      size="sm"
      type="default"
      shouldShowToggleButton
      autoPosition
      :iconComponent="dropdownIcon"
      :title="selectedItem ? selectedItem : $i18n('Pick a curriculum for this quiz')"
      :selectedItem="selectedItem"
      :aria-label="$i18n('Curriculum selection')"
      listWidth="w-full"
    >
      <CurriculumSelectionDropdown
        isSkippable
        :list="curriculumList"
        @selected="setSelectedCurriculum"
        @skip="$emit('cancel')"
      />
    </Dropdown>
  </Modal>
</template>

<script>
import { h as hydrate } from 'vue';
import get from 'lodash/get';

import FA from '~/components/FA.vue';

import CurriculumService from '~/services/apis/CurriculumService';

export default {
  emits: ['cancel', 'save', 'close'],
  data() {
    return {
      isCurriculumListLoading: false,
      curriculumList: [],
      selected: null,
      selectedItem: null,
      loading: false,
    };
  },

  computed: {
    dropdownIcon() {
      return {
        render() {
          return hydrate(FA, {
            icon: 'fas fa-alt-down',
            size: 11,
          });
        },
      };
    },
  },

  async created() {
    this.isCurriculumListLoading = true;

    const curriculumList = await CurriculumService.getCurriculumList();

    this.curriculumList = get(curriculumList, 'data.data.curriculums', []);
    this.isCurriculumListLoading = false;
  },

  methods: {
    setLoading(isLoading) {
      this.loading = isLoading;
    },

    setSelectedCurriculum(curriculum) {
      this.selected = curriculum;
      this.selectedItem = curriculum.name;
      this.$refs.curriculumDropdown.close();
    },
  },
};
</script>
