<template>
  <div class="modal" :class="{ 'is-active': active }">
    <div class="modal-background" @click="close"></div>
    <div class="modal-content">
      <div class="box">
        <h1 class="title">{{ $t('people.title') }} - {{ equipment.name }}</h1>

        <p class="mb1">
          {{
            $t(
              'hardware_items.select_person',
              'Select a person to assign this item to:'
            )
          }}
        </p>

        <combobox-person
          v-model="selectedPersonId"
          :with-margin="false"
          class="mb1"
        />

        <div class="flexrow right mt2">
          <button
            class="button flexrow-item is-primary"
            :disabled="!selectedPersonId || isLoading"
            type="button"
            @click="assignPerson"
          >
            <template v-if="isLoading">
              <spinner class="mr05 mt05" :size="20" is-white />
              {{ $t('main.loading') }}
            </template>
            <template v-else>{{ $t('main.add', 'Add') }}</template>
          </button>

          <button
            class="button flexrow-item is-link"
            type="button"
            @click="close"
          >
            {{ $t('main.close') }}
          </button>
        </div>

        <hr />
        <h2 class="subtitle mt2">
          {{ $t('hardware_items.assigned_people', 'Assigned People') }}
        </h2>

        <table class="table is-fullwidth mt1" v-if="assignedPeople.length > 0">
          <tbody>
            <tr v-for="person in assignedPeople" :key="person.id">
              <td>{{ person.full_name }}</td>
              <td class="has-text-right">
                <button
                  class="button is-small is-danger is-outlined"
                  :disabled="isLoading"
                  @click="removePerson(person.id)"
                >
                  {{ $t('main.remove', 'Remove') }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <p class="has-text-grey" v-else>
          {{ $t('hardware_items.no_assigned_people', 'No people assigned.') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { modalMixin } from '@/components/modals/base_modal'
import ComboboxPerson from '@/components/widgets/ComboboxPerson.vue'
import Spinner from '@/components/widgets/Spinner.vue'

export default {
  name: 'edit-equipment-persons-modal',

  mixins: [modalMixin],

  components: {
    ComboboxPerson,
    Spinner
  },

  props: {
    active: {
      type: Boolean,
      default: false
    },
    equipment: {
      type: Object,
      required: true
    },
    equipmentType: {
      type: String, // 'software' or 'hardware'
      required: true
    }
  },

  data() {
    return {
      isLoading: false,
      selectedPersonId: ''
    }
  },

  emits: ['close'],

  computed: {
    ...mapGetters([
      'getPersonSoftwareLicenses',
      'getPersonHardwareItems',
      'activePeople'
    ]),

    assignedPeople() {
      // Find all people who have this equipment assigned to them in the map
      return this.activePeople.filter(person => {
        if (this.equipmentType === 'software') {
          const licenses = this.getPersonSoftwareLicenses(person.id) || []
          return licenses.some(license => license.id === this.equipment.id)
        } else {
          const hardware = this.getPersonHardwareItems(person.id) || []
          return hardware.some(item => item.id === this.equipment.id)
        }
      })
    }
  },

  mounted() {
    // Ensure we have loaded the relation maps into memory for all users
    if (this.equipmentType === 'software') {
      this.loadPersonSoftwareLicenses()
    } else {
      this.loadPersonHardwareItems()
    }
  },

  methods: {
    ...mapActions([
      'loadPersonSoftwareLicenses',
      'loadPersonHardwareItems',
      'linkSoftwareLicenseToPerson',
      'unlinkSoftwareLicenseFromPerson',
      'linkHardwareItemToPerson',
      'unlinkHardwareItemFromPerson'
    ]),

    close() {
      this.selectedPersonId = ''
      this.$emit('close')
    },

    async assignPerson() {
      if (!this.selectedPersonId) return

      this.isLoading = true
      try {
        if (this.equipmentType === 'software') {
          await this.linkSoftwareLicenseToPerson({
            personId: this.selectedPersonId,
            softwareLicenseId: this.equipment.id
          })
          await this.loadPersonSoftwareLicenses()
        } else {
          await this.linkHardwareItemToPerson({
            personId: this.selectedPersonId,
            hardwareItemId: this.equipment.id
          })
          await this.loadPersonHardwareItems()
        }
        this.selectedPersonId = ''
      } catch (err) {
        console.error('Failed to assign equipment to person:', err)
      } finally {
        this.isLoading = false
      }
    },

    async removePerson(personId) {
      this.isLoading = true
      try {
        if (this.equipmentType === 'software') {
          await this.unlinkSoftwareLicenseFromPerson({
            personId,
            softwareLicenseId: this.equipment.id
          })
          await this.loadPersonSoftwareLicenses()
        } else {
          await this.unlinkHardwareItemFromPerson({
            personId,
            hardwareItemId: this.equipment.id
          })
          await this.loadPersonHardwareItems()
        }
      } catch (err) {
        console.error('Failed to remove equipment from person:', err)
      } finally {
        this.isLoading = false
      }
    }
  },

  watch: {
    active() {
      if (this.active) {
        if (this.equipmentType === 'software') {
          this.loadPersonSoftwareLicenses()
        } else {
          this.loadPersonHardwareItems()
        }
      } else {
        this.selectedPersonId = ''
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.right {
  justify-content: flex-end;
}
.modal-content {
  width: 600px;
  max-width: 90vw;
}
</style>
