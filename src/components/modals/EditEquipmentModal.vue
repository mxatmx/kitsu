<template>
  <base-modal
    :active="active"
    :title="$t('people.equipment') + ' - ' + person.full_name"
    @cancel="close"
  >
    <person-equipment :person="person" />

    <div class="flexrow right mt2">
      <button class="button flexrow-item is-link" type="button" @click="close">
        {{ $t('main.close') }}
      </button>
    </div>
  </base-modal>
</template>

<script>
import BaseModal from '@/components/modals/BaseModal.vue'
import PersonEquipment from '@/components/widgets/PersonEquipment.vue'

export default {
  name: 'edit-equipment-modal',

  components: {
    BaseModal,
    PersonEquipment
  },

  props: {
    active: {
      type: Boolean,
      default: false
    },
    person: {
      type: Object,
      required: true
    }
  },

  emits: ['close'],

  methods: {
    close() {
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
.right {
  justify-content: flex-end;
}
.modal-content {
  width: 800px;
  max-width: 90vw;
}
</style>
