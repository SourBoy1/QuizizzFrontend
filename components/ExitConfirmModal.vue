<template>
  <Modal
    size="md"
    class="exit-confirm-modal"
    title=""
    subtitle=""
    :button1="{
      title: $i18n('NO'),
      type: 'transparent-floating-dark',
    }"
    :button2="{
      title: $i18n('YES'),
      type: 'secondary',
    }"
    @close="$emit('close')"
    @button1-click="$emit('close')"
    @button2-click="$emit('confirm')"
  >
    <div>
      <p class="text-base font-normal">
        {{ $i18n('Are you sure you want to exit?') }}
      </p>
    </div>
  </Modal>
</template>

<script></script>
