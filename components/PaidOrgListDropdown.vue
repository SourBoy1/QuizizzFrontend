<template>
  <div
    v-click-outside="() => $emit('click')"
    class="bg-light-3 z-on-overlay pt-2 border border-dark-6 rounded shadow-md"
    :style="displayPosition"
    tabindex="0"
  >
    <ul class="space max-h-100 pt-1 overflow-y-auto overflow-x-hidden flex flex-col">
      <Input
        ref="paidOrgSearchInput"
        licon="fas fa-search"
        :placeholder="$i18n('Search in your district')"
        class="placeholder-dark-5 px-2 mb-2"
        inputClasses="h-7"
        autofocus
        liconClasses="self-baseline"
        @input="handlePaidOrgSearchInput"
      />
      <li
        v-for="(paidOrg, idx) in paidOrgList"
        :key="paidOrg.id"
      >
        <button
          :disabled="isSwitchingPaidOrg"
          class="w-full flex flex-col py-2 hover:bg-dark-5%"
          @click.stop="selectPaidOrg(paidOrg)"
        >
          <div class="w-full flex flex-col pl-2 pr-4 pb-2">
            <div
              v-if="isSwitchingPaidOrg !== paidOrg.id"
              class="flex"
            >
              <div class="flex flex-col">
                <h1 class="text-xs font-semibold text-dark-3 mb-1">
                  {{ paidOrg.name }}
                </h1>
                <h2 class="mt-1 text-dark-4 text-xs font-normal">
                  {{ paidOrg.address }}
                </h2>
              </div>
              <FA
                v-if="isSelectedPaidOrg(paidOrg.id)"
                icon="fas fa-check"
                class="ml-auto text-dark-2 font-normal"
                :size="9"
              />
            </div>
            <div
              v-else
              class="w-full flex justify-center"
            >
              <FA
                icon="fas fa-sync"
                class="animate-spin text-dark-3"
                :size="16"
              />
            </div>
          </div>
        </button>
        <hr
          v-if="idx < paidOrgList.length - 1"
          class="w-full text-dark-5%"
        />
      </li>
    </ul>
  </div>
</template>

<script>
import debounce from 'lodash/debounce';

import OrganizationService from '~/services/apis/OrganizationService';

export default {
  emits: ['click'],

  data() {
    return {
      displayPosition: {},
      isSwitchingPaidOrg: false,

      paidOrgList: [],
      allPaidOrgList: [],
    };
  },

  mounted() {
    // added sidebar layout as default
    const { top = 58, left = 10, width = 50 } = document.querySelector('#paid-org-dropdown-btn')?.getBoundingClientRect() ?? {};

    this.displayPosition = {
      position: 'fixed',
      top: `${top}px`,
      left: `${left + width}px`,
    };

    const allPaidOrgs = this.$user.paidOrganizations.map((paidOrg) => ({
      id: paidOrg.id,
      name: paidOrg.displayName || paidOrg.organizationName,
      address: `${paidOrg.state ? `${paidOrg.state},` : ''}${paidOrg.country ?? ''}`,
    })) || [];

    this.paidOrgList = allPaidOrgs;
    this.allPaidOrgList = allPaidOrgs;
  },

  methods: {
    isSelectedPaidOrg(paidOrgId) {
      return (this.$user?.paidOrganization === paidOrgId);
    },

    handlePaidOrgSearchInput: debounce(function handlePaidOrgSearchInput(searchText) {
      if (!searchText.trim()) {
        this.paidOrgList = this.allPaidOrgList;
      }

      this.paidOrgList = this.allPaidOrgList.filter((paidOrg) => {
        if (paidOrg.name) {
          return `${paidOrg.name.toLowerCase()}${paidOrg.address.toLowerCase()}`.includes(searchText.toLowerCase());
        }

        return false;
      });
    }, 300),

    async selectPaidOrg(paidOrg) {
      this.isSwitchingPaidOrg = paidOrg.id;
      const isSuccess = await OrganizationService.setCurrentPaidOrganization(paidOrg.id);
      this.isSwitchingPaidOrg = false;

      if (!isSuccess) {
        this.$toasts.add({
          type: this.$constants.ToastTypes.ERROR,
          icon: 'fas fa-times-circle',
          title: this.$i18n('Unable to switch to {$1}', [paidOrg?.name ?? 'the organization']),
        });
      }
    },
  },
};
</script>
