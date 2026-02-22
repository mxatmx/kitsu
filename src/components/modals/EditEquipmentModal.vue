<template>
  <div class="modal" :class="{ 'is-active': active }">
    <div class="modal-background" @click="close"></div>
    <div class="modal-content">
      <div class="box">
        <h1 class="title">
          {{ $t('people.equipment') }} - {{ person.full_name }}
        </h1>

        <person-equipment :person="person" />

        <div class="flexrow right mt2">
          <button
            class="button flexrow-item is-link"
            type="button"
            @click="close"
          >
            {{ $t('main.close') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { modalMixin } from '@/components/modals/base_modal'
import PersonEquipment from '@/components/widgets/PersonEquipment.vue'

export default {
  name: 'edit-equipment-modal',

  mixins: [modalMixin],

  components: {
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
