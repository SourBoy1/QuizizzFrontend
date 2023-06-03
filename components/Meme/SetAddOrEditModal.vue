<template>
  <Modal
    class="edit-memeset-modal"
    :title="title"
    subtitle=""
    :size="'md'"
    :stickToBottom="!isDesktop"
    :shouldCloseOnEscape="true"
    :dismissOnOverlayClick="false"
    :button1="{
      title: $i18n('Cancel'),
      type: 'other',
    }"
    :button2="{
      title: $i18n('Done'),
      loading: isLoading,
      disabled: !memesetData.name,
    }"
    @button1-click="$emit('close')"
    @button2-click="handleCreateOrUpdate"
    @close="$emit('close')"
  >
    <div class="flex flex-col">
      <Input
        v-model="memesetData.name"
        class="mb-6"
        required
        :label="$i18n('Name your meme set')"
        :placeholder="$i18n('Enter meme set name')"
        @keyup.enter="handleCreateOrUpdate"
      />
      <SelectBox
        v-model="memesetData.lang"
        :aria-label="$i18n('Select preferred language')"
        inputId="lang-input"
        :list="languages"
      />
      <div class="flex mt-5">
        <Radio
          inputId="public"
          name="public"
          :label="$i18n('Public')"
          size="md"
          :checked="memesetType === 'public'"
          @change="handleChangeOfMemesetType"
        />
        <Radio
          inputId="private"
          name="private"
          size="md"
          :label="$i18n('Private')"
          class="mx-4"
          :checked="memesetType === 'private'"
          @change="handleChangeOfMemesetType"
        />
      </div>
    </div>
  </Modal>
</template>

<script>
import { mapGetters } from 'vuex';

import QuizService from '~/services/apis/QuizService';

export default {
  props: {
    title: {
      type: String,
      default: '',
    },
    memesetId: {
      type: String,
      default: null,
    },
    memesetName: {
      type: String,
      default: '',
    },
    memesetLang: {
      type: String,
      default: '',
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    isEditModal: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['close'],

  data() {
    return {
      isLoading: false,
      memesetType: this.isPublic ? 'public' : 'private',
      memesetData: {
        name: this.memesetName,
        lang: this.memesetLang,
      },

      languages: [
        {
          title: 'English',
          value: 'English',
        },
        {
          title: 'Spanish',
          value: 'Spanish',
        },
        {
          title: 'French',
          value: 'French',
        },
        {
          title: 'Dutch',
          value: 'Dutch',
        },
        {
          title: 'Polish',
          value: 'Polish',
        },
        {
          title: 'Russian',
          value: 'Russian',
        },
      ],
    };
  },

  computed: {
    ...mapGetters('root', ['isDesktop']),
  },

  methods: {
    handleChangeOfMemesetType(e) {
      this.memesetType = e.target.name;
      this.memesetData.isPublic = e.target.name === 'public';
    },

    async handleCreateMemeset() {
      this.isLoading = true;
      const response = await QuizService.createMemeset(this.memesetData);
      if (!response.success) {
        this.$toasts.add({
          type: this.$constants.ToastTypes.ERROR,
          icon: 'fas fa-times-circle',
          title: this.$i18n('Something went wrong while creating the meme set!'),
        });
        this.isLoading = false;
        return;
      }
      this.isLoading = false;
      this.$emit('close');
      this.$router.push(`/admin/memes/${response.data.data._id}`);
      this.$toasts.add({
        type: this.$constants.ToastTypes.SUCCESS,
        icon: 'fas fa-check-circle',
        title: this.$i18n('Meme set created successfully!'),
      });
    },

    async handleUpdateMemeset() {
      this.isLoading = true;
      const response = await QuizService.updateMemeset(this.memesetId, this.memesetData);
      if (!response.success) {
        this.$toasts.add({
          type: this.$constants.ToastTypes.ERROR,
          icon: 'fas fa-times-circle',
          title: this.$i18n('Something went wrong while updating the meme set!'),
        });
        this.isLoading = false;
        return;
      }
      this.isLoading = false;
      this.$emit('close');
      this.$toasts.add({
        type: this.$constants.ToastTypes.SUCCESS,
        icon: 'fas fa-check-circle',
        title: this.$i18n('Meme set updated successfully!'),
      });
      this.$router.go();
    },

    handleCreateOrUpdate() {
      if (this.isEditModal) {
        this.handleUpdateMemeset();
      } else {
        this.handleCreateMemeset();
      }
    },
  },
};
</script>
