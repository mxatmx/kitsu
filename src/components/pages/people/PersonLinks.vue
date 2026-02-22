<template>
  <div class="columns">
    <div class="column column-people">
      <label class="label">{{ $t('people.title') }}</label>
      <ul class="element-list">
        <li
          :class="{
            selected: selectedPerson && selectedPerson.id === person.id
          }"
          v-for="person in people"
          :key="person.id"
          @click="selectPerson(person)"
        >
          <people-avatar class="mr1" :person="person" :size="30" />
          {{ person.full_name }}
        </li>
      </ul>
    </div>
    <div class="column column-middle">
      <label class="label">
        {{ $t('people.linked_items') }}
      </label>
      <ul class="element-list">
        <li v-if="selectedPerson === null">
          {{ $t('people.select_person') }}
        </li>
        <li v-else-if="personLinkedItems.length === 0">
          {{ $t('people.no_items_linked') }}
        </li>
        <template v-else>
          <li
            :key="item.id"
            v-for="item in personLinkedItems"
            @click="removeItem(item)"
          >
            <div class="item-info">
              {{ item.name }}
            </div>
          </li>
        </template>
      </ul>
    </div>
    <div class="column column-items">
      <label class="label">
        {{ $t('people.available_items') }}
      </label>
      <ul class="element-list">
        <li
          :key="item.id"
          v-for="item in availableItems"
          @click="selectItem(item)"
        >
          {{ item.name }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { computed, defineEmits, ref } from 'vue'
import { useStore } from 'vuex'

import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'

const store = useStore()

const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  linkedItems: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['link-item', 'unlink-item'])

// Data

const selectedPerson = ref(null)

// Computed

const people = computed(() => {
  return store.getters.activePeopleWithoutBot
})

const personLinkedItems = computed(() => {
  return props.linkedItems[selectedPerson.value?.id] || []
})

const availableItems = computed(() => {
  const itemIds = personLinkedItems.value.map(item => item.id)
  return props.items.filter(item => !itemIds.includes(item.id))
})

// Methods

const selectPerson = person => {
  selectedPerson.value = selectedPerson.value === person ? null : person
}

const selectItem = item => {
  if (!selectedPerson.value) return
  emit('link-item', {
    personId: selectedPerson.value.id,
    itemId: item.id
  })
}

const removeItem = item => {
  if (!selectedPerson.value) return
  emit('unlink-item', {
    personId: selectedPerson.value.id,
    itemId: item.id
  })
}
</script>

<style lang="scss" scoped>
.columns {
  display: flex;
  gap: 2rem;
  flex: 1;
}

.column {
  flex: 1;
  min-width: 0;
  overflow-y: none;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.column-people,
.column-items {
  border-radius: 8px;
}

ul.element-list {
  padding: 0;
  border: 1px solid var(--border-alt);
  border-radius: 8px;
  flex: 1;
  margin: 0;
  overflow-y: auto;
  list-style: none;

  li {
    align-items: center;
    border-bottom: 1px solid var(--border-alt);
    cursor: pointer;
    display: flex;
    margin-bottom: 0;
    padding: 0.5rem;

    &:hover {
      background-color: var(--background-selectable);
    }

    &.selected {
      background-color: var(--background-selected);
    }
  }
}

.mr1 {
  margin-right: 0.5rem;
}
</style>
