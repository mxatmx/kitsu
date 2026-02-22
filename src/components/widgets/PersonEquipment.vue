<template>
  <div class="person-equipment columns">
    <div class="column">
      <h2 class="subtitle">
        {{ $t('software_licenses.title') }}
      </h2>

      <spinner class="mt1" v-if="isLoading" />

      <template v-else>
        <div class="flexrow mb1" v-if="availableSoftwareOptions.length > 0">
          <combobox
            class="flexrow-item"
            :options="availableSoftwareOptions"
            :with-margin="false"
            v-model="selectedSoftwareId"
          />
          <button
            class="button is-success flexrow-item"
            :disabled="!selectedSoftwareId"
            @click="addSoftware"
          >
            {{ $t('main.add') }}
          </button>
        </div>
        <p class="empty-text mb1" v-else-if="linkedSoftware.length === 0">
          {{ $t('people.no_software_available') }}
        </p>

        <ul class="element-list" v-if="linkedSoftware.length > 0">
          <li v-for="item in linkedSoftware" :key="item.id" class="list-item">
            <span class="item-name">{{ item.name }}</span>
            <span class="remove-link" @click="removeSoftware(item)">
              {{ $t('main.remove') }}
            </span>
          </li>
        </ul>
        <p class="empty-text mt1" v-else>
          {{ $t('people.no_equipment_assigned') }}
        </p>
      </template>
    </div>

    <div class="column">
      <h2 class="subtitle">
        {{ $t('hardware_items.title') }}
      </h2>

      <spinner class="mt1" v-if="isLoading" />

      <template v-else>
        <div class="flexrow mb1" v-if="availableHardwareOptions.length > 0">
          <combobox
            class="flexrow-item"
            :options="availableHardwareOptions"
            :with-margin="false"
            v-model="selectedHardwareId"
          />
          <button
            class="button is-success flexrow-item"
            :disabled="!selectedHardwareId"
            @click="addHardware"
          >
            {{ $t('main.add') }}
          </button>
        </div>
        <p class="empty-text mb1" v-else-if="linkedHardware.length === 0">
          {{ $t('people.no_hardware_available') }}
        </p>

        <ul class="element-list" v-if="linkedHardware.length > 0">
          <li v-for="item in linkedHardware" :key="item.id" class="list-item">
            <span class="item-name">{{ item.name }}</span>
            <span class="remove-link" @click="removeHardware(item)">
              {{ $t('main.remove') }}
            </span>
          </li>
        </ul>
        <p class="empty-text mt1" v-else>
          {{ $t('people.no_equipment_assigned') }}
        </p>
      </template>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import Combobox from '@/components/widgets/Combobox.vue'
import Spinner from '@/components/widgets/Spinner.vue'

export default {
  name: 'person-equipment',

  components: {
    Combobox,
    Spinner
  },

  props: {
    person: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      isLoading: true,
      selectedSoftwareId: '',
      selectedHardwareId: ''
    }
  },

  computed: {
    ...mapGetters([
      'softwareLicenses',
      'getPersonSoftwareLicenses',
      'hardwareItems',
      'getPersonHardwareItems'
    ]),

    linkedSoftware() {
      return this.getPersonSoftwareLicenses(this.person.id)
    },

    availableSoftwareOptions() {
      const linkedIds = this.linkedSoftware.map(s => s.id)
      return this.softwareLicenses
        .filter(s => !linkedIds.includes(s.id))
        .map(s => ({
          label: s.name,
          value: s.id
        }))
    },

    linkedHardware() {
      return this.getPersonHardwareItems(this.person.id)
    },

    availableHardwareOptions() {
      const linkedIds = this.linkedHardware.map(h => h.id)
      return this.hardwareItems
        .filter(h => !linkedIds.includes(h.id))
        .map(h => ({
          label: h.name,
          value: h.id
        }))
    }
  },

  async mounted() {
    this.isLoading = true
    try {
      await Promise.all([
        this.loadSoftwareLicenses(),
        this.loadHardwareItems(),
        this.fetchPersonSoftwareLicenses(this.person.id),
        this.fetchPersonHardwareItems(this.person.id)
      ])
    } catch (err) {
      console.error('Failed to load equipment data:', err)
    }
    this.isLoading = false
  },

  methods: {
    ...mapActions([
      'loadSoftwareLicenses',
      'loadHardwareItems',
      'fetchPersonSoftwareLicenses',
      'fetchPersonHardwareItems',
      'linkSoftwareLicenseToPerson',
      'unlinkSoftwareLicenseFromPerson',
      'linkHardwareItemToPerson',
      'unlinkHardwareItemFromPerson'
    ]),

    async addSoftware() {
      if (!this.selectedSoftwareId) return
      await this.linkSoftwareLicenseToPerson({
        personId: this.person.id,
        softwareLicenseId: this.selectedSoftwareId
      })
      this.selectedSoftwareId = ''
    },

    async removeSoftware(item) {
      await this.unlinkSoftwareLicenseFromPerson({
        personId: this.person.id,
        softwareLicenseId: item.id
      })
    },

    async addHardware() {
      if (!this.selectedHardwareId) return
      await this.linkHardwareItemToPerson({
        personId: this.person.id,
        hardwareItemId: this.selectedHardwareId
      })
      this.selectedHardwareId = ''
    },

    async removeHardware(item) {
      await this.unlinkHardwareItemFromPerson({
        personId: this.person.id,
        hardwareItemId: item.id
      })
    }
  },

  watch: {
    'person.id'() {
      this.isLoading = true
      Promise.all([
        this.fetchPersonSoftwareLicenses(this.person.id),
        this.fetchPersonHardwareItems(this.person.id)
      ])
        .catch(err => console.error('Failed to reload equipment:', err))
        .finally(() => {
          this.isLoading = false
        })
    },
    availableSoftwareOptions: {
      immediate: true,
      handler(options) {
        if (options && options.length > 0 && !this.selectedSoftwareId) {
          this.selectedSoftwareId = options[0].value
        }
      }
    },
    availableHardwareOptions: {
      immediate: true,
      handler(options) {
        if (options && options.length > 0 && !this.selectedHardwareId) {
          this.selectedHardwareId = options[0].value
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.person-equipment {
  padding: 1rem 0;
}

.element-list {
  border: 1px solid var(--border);
  border-radius: 4px;
  max-height: 400px;
  overflow-y: auto;
  list-style: none;
  margin: 0;
  padding: 0;

  .list-item {
    padding: 0.5rem 0.75rem;
    border-bottom: 1px solid var(--border-alt);
    display: flex;
    align-items: center;
    justify-content: space-between;

    &:last-child {
      border-bottom: none;
    }

    .item-name {
      font-weight: 500;
    }
  }
}

.remove-link {
  cursor: pointer;
  color: $red;
  font-size: 0.85em;

  &:hover {
    text-decoration: underline;
  }
}

.empty-text {
  color: var(--text-alt);
  font-style: italic;
}

.subtitle {
  font-size: 1.2em;
  font-weight: bold;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text);
}
</style>
