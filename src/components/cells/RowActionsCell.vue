<template>
  <td class="actions has-text-right">
    <button
      class="button"
      :title="$t('row_actions.history')"
      data-test="button-history"
      tabindex="-1"
      @click="$emit('history-clicked')"
      v-if="!hideHistory"
    >
      <clock-icon class="icon is-small" />
    </button>

    <button
      class="button"
      :title="$t('row_actions.edit')"
      data-test="button-edit"
      tabindex="-1"
      @click="$emit('edit-clicked')"
      v-if="!hideEdit && !entry.canceled"
    >
      <edit-icon class="icon is-small" />
    </button>

    <button
      class="button"
      :title="$t('row_actions.change_avatar')"
      data-test="button-avatar"
      tabindex="-1"
      @click="$emit('avatar-clicked')"
      v-if="!hideAvatar"
    >
      <camera-icon class="icon is-small" />
    </button>

    <button
      class="button"
      :title="$t('row_actions.change_password')"
      data-test="button-change-password"
      tabindex="-1"
      @click="$emit('change-password-clicked')"
      v-if="!hideChangePassword && !entry.canceled && isCurrentUserAdmin"
    >
      <key-icon class="icon is-small" />
    </button>

    <button
      class="button"
      :title="$t('row_actions.equipment', 'Equipment')"
      data-test="button-equipment"
      tabindex="-1"
      @click="$emit('equipment-clicked')"
      v-if="!hideEquipment && !entry.canceled && isCurrentUserAdmin"
    >
      <monitor-icon class="icon is-small" />
    </button>

    <button
      class="button"
      :title="$t('row_actions.users', 'Users')"
      data-test="button-users"
      tabindex="-1"
      @click="$emit('users-clicked')"
      v-if="!hideUsers && !entry.canceled && isCurrentUserAdmin"
    >
      <users-icon class="icon is-small" />
    </button>

    <button
      class="button"
      :title="$t('row_actions.archive')"
      data-test="button-archive"
      tabindex="-1"
      @click="$emit('archive-clicked')"
      v-if="!hideArchive && !entry.canceled"
    >
      <archive-icon class="icon is-small" />
    </button>

    <button
      class="button"
      :title="$t('row_actions.restore')"
      data-test="button-restore"
      tabindex="-1"
      @click="$emit('restore-clicked')"
      v-if="!hideRestore || entry.canceled"
    >
      <rotate-ccw-icon class="icon is-small" />
    </button>

    <button
      class="button"
      :title="$t('row_actions.delete')"
      data-test="button-delete-admin"
      tabindex="-1"
      @click="$emit('delete-clicked')"
      v-if="!hideDelete && !entry.canceled && isCurrentUserAdmin"
    >
      <trash-icon class="icon is-small" />
    </button>

    <button
      class="button"
      :title="$t('row_actions.delete')"
      data-test="button-delete"
      tabindex="-1"
      @click="$emit('delete-clicked')"
      v-else-if="!hideDelete"
    >
      <trash-icon class="icon is-small" />
    </button>

    <button
      class="button"
      :title="$t('row_actions.refresh')"
      data-test="button-refresh"
      tabindex="-1"
      @click="$emit('refresh-clicked')"
      v-else-if="!hideRefresh"
    >
      <refresh-cw-icon class="icon is-small" />
    </button>
  </td>
</template>

<script setup>
import {
  ArchiveIcon,
  CameraIcon,
  ClockIcon,
  EditIcon,
  KeyIcon,
  MonitorIcon,
  RefreshCwIcon,
  RotateCcwIcon,
  TrashIcon,
  UsersIcon
} from 'lucide-vue-next'
import { computed } from 'vue'
import { useStore } from 'vuex'

defineProps({
  entry: { type: Object, default: () => ({}) },
  hideArchive: { type: Boolean, default: true },
  hideAvatar: { type: Boolean, default: true },
  hideChangePassword: { type: Boolean, default: true },
  hideDelete: { type: Boolean, default: false },
  hideEdit: { type: Boolean, default: false },
  hideEquipment: { type: Boolean, default: true },
  hideHistory: { type: Boolean, default: true },
  hideRefresh: { type: Boolean, default: true },
  hideRestore: { type: Boolean, default: true },
  hideUsers: { type: Boolean, default: true }
})

defineEmits([
  'archive-clicked',
  'avatar-clicked',
  'change-password-clicked',
  'delete-clicked',
  'edit-clicked',
  'equipment-clicked',
  'history-clicked',
  'refresh-clicked',
  'restore-clicked',
  'users-clicked'
])

const store = useStore()
const isCurrentUserAdmin = computed(() => store.getters.isCurrentUserAdmin)
</script>

<style lang="scss" scoped>
.button {
  margin-left: 0.2em;
}
</style>
