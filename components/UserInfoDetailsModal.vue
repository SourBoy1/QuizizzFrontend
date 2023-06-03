<template>
  <Modal
    v-if="shouldShow"
    title=""
    subtitle=""
    size="xl"
    backgroundColor="bg-light-3"
    :hideHeader="true"
    :hideFooter="true"
    :stickToBottom="isMobile"
    :zeroPadding="true"
    :fullWidth="false"
    :fixedHeight="false"
    @close="onClose"
  >
    <div class="pb-6 rounded-lg">
      <div :class="['max-w-144 max-h-144 overflow-y-auto', { 'mobile-height': isMobile }]">
        <div :class="['header text-light text-center bg-purple-dark rounded-t-lg', isMobile ? 'p-6' : 'p-8']">
          <div class="text-xl font-bold">
            <i18n>Welcome back to Quizizz 🎉 </i18n>
          </div>
          <div class="mt-1 text-xs opacity-60">
            <i18n>
              Enjoy all the new and improved tools added to help you teach seamlessly with Quizizz! Please confirm the details below:
            </i18n>
          </div>
        </div>
        <div :class="['body bg-light', isMobile ? 'pt-6 px-4' : 'pt-8 px-8 rounded-b-lg']">
          <div class="roles">
            <i18n class="ml-2 text-xs font-semibold text-dark-4">
              Which of the following best describes your role?
            </i18n>
            <div :class="`text-xs mt-2 p-1 grid grid-cols-${isMobile ? 2 : 3} gap-2`">
              <div
                v-for="role in roles"
                :key="role.name"
                :class="[
                  'box-border text-dark-3 text-center font-semibold px-2.5 py-3 rounded whitespace-nowrap cursor-pointer hover:bg-light-1',
                  isRoleSelected(role) ? 'selected bg-light-1' : 'role',
                ]"
                @click="onRoleClick(role)"
              >
                {{ role.title }}
              </div>
            </div>
          </div>
          <div
            v-show="showRoleInput"
            class="mt-2"
          >
            <Input
              ref="otherRoleText"
              v-model="otherRoleText"
              class="mr-2.5"
              :noRing="true"
              :placeholder="$i18n('Please enter your role')"
            />
          </div>
          <div
            v-if="showSubjectsAndGrades"
            class="mt-5 subjectsList"
          >
            <i18n class="ml-2 text-xs font-semibold text-dark-4">
              Please confirm your subjects
            </i18n>
            <div
              v-click-outside="() => handleTagSelectorBlur()"
              class="mt-1"
              @click.stop
            >
              <TagInput
                :key="'subjects'"
                :placeholder="''"
                :listSelector="{
                  enabled: true,
                  dropdownTags: subjectsList,
                }"
                :existingTags="selectedSubjects"
                :isInFocus="activeTag === 'subjects'"
                :showInput="false"
                :errorOnMaxTags="$i18n('You can select at max 5 subjects')"
                :singleLineToolTip="true"
                @inputFocus="handleTagSelectorFocus"
                @setTags="handleSubjectSelected"
              />
            </div>
          </div>
          <div
            v-if="showSubjectsAndGrades"
            class="mt-5 gradesList"
          >
            <i18n class="ml-2 text-xs font-semibold text-dark-4">
              Please confirm grades you teach
            </i18n>
            <div
              v-click-outside="() => handleTagSelectorBlur()"
              class="mt-1"
              @click.stop
            >
              <TagInput
                :key="'grades'"
                :placeholder="''"
                :errorOnMaxTags="$i18n('You can select at max 5 grades')"
                :listSelector="{
                  enabled: true,
                  dropdownTags: gradesList,
                }"
                :existingTags="selectedGrades"
                :isInFocus="activeTag === 'grades'"
                :showInput="false"
                @inputFocus="handleTagSelectorFocus"
                @setTags="handleGradeSelected"
              />
            </div>
          </div>
          <div class="mt-8 text-center action">
            <Button
              type="primary"
              size="md"
              :title="$i18n('Continue to Quizizz')"
              :fullWidth="true"
              :disabled="disableButton"
              @click="onContinue"
            />
          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script>
import { mapGetters } from 'vuex';
import get from 'lodash/get';

import Grades from '~/config/Grades.js';
import getSubjectsList from '~/config/Subjects.js';
import UserAPIService from '~/services/apis/UserAPIService';

export default {
  props: {
  },

  data() {
    return {
      shouldShow: false,
      selectedRole: '',
      activeTag: '',
      subjects: [],
      grades: [],
      otherRoleText: '',

      roles: [
        {
          name: 'teacher',
          title: this.$i18n('Teacher'),
        },
        {
          name: 'department_head',
          title: this.$i18n('Department Head'),
        },
        {
          name: 'instructional_tech_coach',
          title: this.$i18n('Instructional/Tech Coach'),
        },
        {
          name: 'school_admin',
          title: this.$i18n('School Admin'),
        },
        {
          name: 'district_admin',
          title: this.$i18n('District Admin'),
        },
        {
          name: 'others',
          title: this.$i18n('Others'),
        },
      ],
    };
  },

  computed: {
    ...mapGetters('root', ['isMobile']),

    gradesList() {
      return Grades.map((grade) => ({
        title: grade.text,
        value: grade.text,
      }));
    },

    subjectsList() {
      return getSubjectsList().map((sub) => ({
        title: sub.text,
        value: sub.val,
      }));
    },

    selectedSubjects() {
      return this.subjects;
    },

    selectedGrades() {
      return this.grades.map((grade) => Grades.find((gradeData) => gradeData.val === grade).text);
    },

    showSubjectsAndGrades() {
      return this.selectedRole === 'teacher';
    },

    showRoleInput() {
      return this.selectedRole === 'others';
    },

    disableButton() {
      return !this.selectedRole
      || (this.selectedRole === 'teacher' && (!this.grades.length || !this.subjects.length))
      || (this.selectedRole === 'others' && !this.otherRoleText);
    },

    isLoggedIn() {
      return this.$user.isLoggedIn;
    },
  },

  watch: {
    selectedRole() {
      if (this.showRoleInput && this.$refs.otherRoleText) {
        this.$nextTick(() => {
          this.$refs.otherRoleText.$refs.input.focus();
        });
      }
    },
  },

  mounted() {
    this.$eventBus.$on('userInfoModal:show', this.show);
  },

  created() {
    if (this.isLoggedIn) {
      this.populateData();
    }
  },

  beforeUnmount() {
    this.$eventBus.$off('userInfoModal:show', this.show);
  },

  methods: {
    populateData() {
      this.subjects = get(this.$user, 'subjectTags', []);
      this.grades = get(this.$user, 'grades', []);
    },

    handleTagSelectorBlur() {
      if (this.activeTag) {
        this.activeTag = '';
      }
    },

    isRoleSelected(role) {
      return role.name === this.selectedRole;
    },

    handleTagSelectorFocus(eventData) {
      this.activeTag = eventData.key;
    },

    handleSubjectSelected(eventData) {
      this.subjects = eventData;
    },

    handleGradeSelected(eventData) {
      const gradeValue = eventData.map((grade) => Grades.find((gradeData) => gradeData.text === grade).val);
      this.grades = gradeValue;
    },

    onRoleClick(role) {
      this.selectedRole = role.name;
    },

    show() {
      this.shouldShow = true;
    },

    onContinue() {
      if (this.disableButton) {
        return;
      }

      let payload = {
        role: this.selectedRole === 'others' ? this.otherRoleText : this.selectedRole,
        occupation: this.selectedRole === 'others' ? 'other' : this.selectedRole,
        displayWelcomeBackModal22: false,
      };

      if (this.selectedRole === 'teacher') {
        payload = {
          ...payload,
          subject_tags: this.subjects,
          grades: this.grades,
        };
      }

      UserAPIService.updateInfo(payload);
      this.close();
    },

    onClose() {
      UserAPIService.updateInfo({
        displayWelcomeBackModal22: false,
      });
      this.close();
    },

    close() {
      this.shouldShow = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.selected {
  outline: 2px solid #A076CC;
}

.role {
  outline: 1px solid #E5E5E5
}

.mobile-height {
  height: 80vh;
}
</style>
