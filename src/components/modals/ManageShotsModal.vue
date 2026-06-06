<template>
  <div
    :class="{
      modal: true,
      'is-active': active
    }"
  >
    <div class="modal-background" @click="$emit('cancel')"></div>

    <div class="modal-content">
      <div class="box">
        <page-title class="title" :text="$t('shots.manage')" />
        <div class="explanation">{{ $t('shots.creation_explanation') }}</div>
        <div>
          <div class="flexrow">
            <combobox
              ref="shot-padding"
              :label="$t('shots.padding')"
              :options="shotPaddingOptions"
              class="shot-padding flexrow-item"
              v-model="shotPadding"
              v-show="shotMode === 'single'"
            />
          </div>
        </div>

        <div class="shot-columns">
          <div class="shot-column" v-if="isTVShow">
            <h2 class="subtitle">{{ $t('shots.episodes') }}</h2>

            <div class="list">
              <div
                :class="{
                  'entity-line': true,
                  selected: episode.id === selectedEpisodeId
                }"
                :key="episode.id"
                @click="selectEpisode(episode.id)"
                v-for="episode in displayedEpisodes"
              >
                {{ episode.name }}
              </div>
            </div>
            <div class="field">
              <input
                class="input"
                ref="addEpisodeInput"
                :placeholder="$t('episodes.fields.placeholder')"
                type="text"
                @keyup.tab="focusAddSequence"
                @keyup.enter="addEpisode"
                v-model="names.episode"
                v-focus
              />
              <button
                :class="{
                  button: true,
                  'is-success': true,
                  'is-loading': loading.addEpisode
                }"
                :disabled="!isAddEpisodeAllowed"
                @click="addEpisode"
              >
                {{ $t('main.add') }}
              </button>
            </div>
          </div>

          <div class="shot-column">
            <h2 class="subtitle">{{ $t('shots.sequences') }}</h2>
            <div class="list">
              <div
                :class="{
                  'entity-line': true,
                  selected: sequence.id === selectedSequenceId
                }"
                :key="sequence.id"
                @keyup.tab="focusAddShot"
                @click="selectSequence(sequence.id)"
                v-for="sequence in displayedSequences"
              >
                {{ sequence.name }}
              </div>
            </div>
            <div class="field">
              <input
                class="input"
                ref="addSequenceInput"
                :placeholder="$t('sequences.fields.placeholder')"
                type="text"
                @keyup.enter="addSequence"
                v-model="names.sequence"
              />
              <button
                :class="{
                  button: true,
                  'is-success': true,
                  'is-loading': loading.addSequence
                }"
                :disabled="!isAddSequenceAllowed"
                @click="addSequence"
              >
                {{ $t('main.add') }}
              </button>
            </div>
          </div>

          <div class="shot-column">
            <div class="shot-tabs">
              <button
                :class="['tab-button', { active: shotMode === 'single' }]"
                @click="shotMode = 'single'"
              >
                {{ $t('shots.single_tab') }}
              </button>
              <button
                :class="['tab-button', { active: shotMode === 'bulk' }]"
                @click="shotMode = 'bulk'"
              >
                {{ $t('shots.bulk_tab') }}
              </button>
            </div>

            <h2 class="subtitle">{{ $t('shots.title') }}</h2>

            <div class="list">
              <template v-if="shotMode === 'single'">
                <div
                  class="entity-line"
                  :key="shot.id"
                  v-for="shot in displayedShots"
                >
                  {{ shot.name }}
                </div>
              </template>
              <template v-else>
                <div
                  v-for="name in bulkPreviewNames"
                  :key="name"
                  :class="[
                    'entity-line',
                    { collision: isBulkNameCollision(name) }
                  ]"
                >
                  {{ name }}
                </div>
              </template>
            </div>

            <template v-if="shotMode === 'single'">
              <div class="field">
                <input
                  class="input"
                  :placeholder="$t('shots.fields.placeholder')"
                  ref="addShotInput"
                  type="text"
                  @keyup.enter="addShot"
                  v-model="names.shot"
                />
              </div>
              <div class="field">
                <button
                  :class="{
                    button: true,
                    'is-success': true,
                    'is-loading': loading.addShot
                  }"
                  :disabled="!isAddShotAllowed || loading.addShot"
                  @click="addShot"
                >
                  {{ $t('main.add') }}
                </button>
              </div>
            </template>

            <template v-else>
              <div class="field bulk-fields">
                <div class="bulk-field">
                  <label class="label is-small">{{
                    $t('shots.fields.start')
                  }}</label>
                  <input
                    class="input"
                    type="text"
                    :placeholder="$t('shots.fields.placeholder')"
                    v-model="bulk.start"
                  />
                </div>
                <div class="bulk-field">
                  <label class="label is-small">{{
                    $t('shots.fields.count')
                  }}</label>
                  <input
                    class="input"
                    type="number"
                    min="1"
                    max="500"
                    v-model.number="bulk.count"
                  />
                </div>
                <div class="bulk-field">
                  <label class="label is-small">{{
                    $t('shots.fields.step')
                  }}</label>
                  <input
                    class="input"
                    type="number"
                    min="1"
                    v-model.number="bulk.step"
                  />
                </div>
              </div>
              <p v-if="bulkStartError" class="help is-danger">
                {{ $t('shots.bulk_invalid_start') }}
              </p>
              <div class="field">
                <button
                  :class="{
                    button: true,
                    'is-success': true,
                    'is-loading': loading.bulkGenerate
                  }"
                  :disabled="!isBulkGenerateAllowed"
                  @click="generateShots"
                >
                  {{ $t('shots.bulk_generate') }}
                </button>
              </div>
            </template>
          </div>
        </div>

        <p class="has-text-right modal-footer">
          <button @click="$emit('cancel')" class="button is-link">
            {{ $t('main.close') }}
          </button>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import shotStore from '@/store/modules/shots'

import { modalMixin } from '@/components/modals/base_modal'

import stringHelpers from '@/lib/string'
import { sortByName } from '@/lib/sorting'

import Combobox from '@/components/widgets/Combobox.vue'
import PageTitle from '@/components/widgets/PageTitle.vue'

export default {
  name: 'manage-shots-modal',

  mixins: [modalMixin],

  components: {
    Combobox,
    PageTitle
  },

  props: {
    active: {
      default: true,
      type: Boolean
    }
  },

  emits: [
    'add-episode',
    'add-sequence',
    'add-shot',
    'add-shots-bulk',
    'cancel'
  ],

  data() {
    return {
      names: {
        episode: '',
        sequence: '',
        shot: ''
      },
      loading: {
        addEpisode: false,
        addSequence: false,
        addShot: false,
        bulkGenerate: false
      },
      sequences: [],
      displayedShots: [],
      selectedEpisodeId: null,
      selectedSequenceId: null,
      shotMode: 'single',
      bulk: {
        start: '',
        count: 20,
        step: 10
      },
      shotPaddingOptions: [
        { label: '1', value: '1' },
        { label: '2', value: '2' },
        { label: '10', value: '10' }
      ],
      shotPadding: '1'
    }
  },

  computed: {
    ...mapGetters([
      'currentProduction',
      'displayedEpisodes',
      'displayedSequences',
      'isTVShow'
    ]),

    isAddEpisodeAllowed() {
      const isEmpty = this.names.episode === ''
      const isExist = this.displayedEpisodes.find(episode => {
        return this.names.episode === episode.name
      })
      return !isEmpty && !isExist
    },

    isAddSequenceAllowed() {
      const isEmpty = this.names.sequence === ''
      const isExist = this.displayedSequences.find(sequence => {
        return this.names.sequence === sequence.name
      })
      return !isEmpty && !isExist && (this.selectedEpisodeId || !this.isTVShow)
    },

    isAddShotAllowed() {
      const isEmpty = this.names.shot === ''
      const isExist = this.displayedShots.find(shot => {
        return this.names.shot === shot.name
      })
      return !isEmpty && !isExist && this.selectedSequenceId
    },

    bulkStartError() {
      return this.bulk.start.length > 0 && !/\d+$/.test(this.bulk.start)
    },

    bulkPreviewNames() {
      if (
        !this.bulk.start ||
        this.bulkStartError ||
        !this.bulk.count ||
        !this.bulk.step
      ) {
        return []
      }
      return stringHelpers.generateBulkShotNames(
        this.bulk.start,
        this.bulk.count,
        this.bulk.step
      )
    },

    isBulkGenerateAllowed() {
      return (
        !this.bulkStartError &&
        this.bulkPreviewNames.length > 0 &&
        !!this.selectedSequenceId &&
        !this.bulkPreviewNames.some(name => this.isBulkNameCollision(name)) &&
        !this.loading.bulkGenerate
      )
    },

    shots() {
      return shotStore.cache.shots
    }
  },

  methods: {
    focusAddSequence() {
      this.$refs.addSequenceInput.focus()
    },

    focusAddShot() {
      this.$refs.addShotInput.focus()
    },

    selectEpisode(episodeId) {
      if (!this.isTVShow) {
        this.selectedEpisodeId = episodeId
        this.displayedShots = []
      } else {
        this.selectedEpisodeId = episodeId
        this.$router.push({
          name: 'episode-shots',
          params: {
            production_id: this.currentProduction.id,
            episode_id: episodeId
          }
        })
      }
    },

    selectSequence(sequenceId) {
      this.selectedSequenceId = sequenceId
      this.displayedShots = sortByName(
        this.shots.filter(shot => {
          return shot.sequence_id === sequenceId
        })
      )
    },

    addEpisode() {
      if (this.isAddEpisodeAllowed) {
        const episodeName = this.names.episode
        if (episodeName.length > 0) {
          this.loading.addEpisode = true
          const episode = {
            name: this.names.episode,
            project_id: this.currentProduction.id
          }
          this.$emit('add-episode', episode, episode => {
            this.loading.addEpisode = false
            this.selectEpisode(episode.id)
            this.names.episode = stringHelpers.generateNextName(episode.name)
          })
        }
      }
    },

    addSequence() {
      if (this.isAddSequenceAllowed) {
        const sequenceName = this.names.sequence
        if (
          sequenceName.length > 0 &&
          (this.selectedEpisodeId || !this.isTVShow)
        ) {
          this.loading.addSequence = true
          const sequence = {
            name: this.names.sequence,
            episode_id: this.selectedEpisodeId,
            project_id: this.currentProduction.id
          }
          this.$emit('add-sequence', sequence, sequence => {
            this.loading.addSequence = false
            this.selectEpisode(this.selectedEpisodeId)
            this.selectSequence(sequence.id)
            this.names.sequence = stringHelpers.generateNextName(sequence.name)
          })
        }
      }
    },

    isBulkNameCollision(name) {
      return !!this.displayedShots.find(shot => shot.name === name)
    },

    generateShots() {
      if (!this.isBulkGenerateAllowed) return
      this.loading.bulkGenerate = true
      const sequence = this.displayedSequences.find(
        s => s.id === this.selectedSequenceId
      )
      const episode = this.isTVShow
        ? this.displayedEpisodes.find(e => e.id === this.selectedEpisodeId)
        : null
      this.$emit(
        'add-shots-bulk',
        {
          shotNames: this.bulkPreviewNames,
          sequenceName: sequence?.name,
          episodeName: episode?.name ?? null
        },
        () => {
          this.loading.bulkGenerate = false
          this.selectSequence(this.selectedSequenceId)
          this.bulk.start = ''
        }
      )
    },

    addShot() {
      if (this.isAddShotAllowed && !this.loading.addShot) {
        const shotName = this.names.shot
        this.loading.addShot = true
        if (shotName.length > 0 && this.selectedSequenceId) {
          const shot = {
            name: this.names.shot,
            sequence_id: this.selectedSequenceId,
            project_id: this.currentProduction.id
          }
          this.$emit('add-shot', shot, shot => {
            this.loading.addShot = false
            this.selectSequence(this.selectedSequenceId)
            this.names.shot = stringHelpers.generateNextName(
              shot.name,
              parseInt(this.shotPadding)
            )
          })
        }
      }
    }
  },

  watch: {
    active() {
      if (this.active) {
        this.shotPadding = '1'
        this.sequences = this.displayedSequences
        if (this.isTVShow) {
          this.selectEpisode(this.displayedEpisodes[0].id)
        } else if (this.sequences.length > 0) {
          this.selectSequence(this.sequences[0].id)
        }

        setTimeout(() => {
          if (this.isTVShow) {
            this.$refs.addEpisodeInput.focus()
          } else {
            this.$refs.addSequenceInput.focus()
          }
        }, 100)
      }
    },

    selectedEpisodeId() {
      this.sequences = this.displayedSequences
      if (this.sequences.length > 0) {
        this.selectSequence(this.sequences[0].id)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.dark {
  .shot-column .list {
    border: 1px solid $dark-grey;
  }
}

.shot-columns {
  display: flex;
  height: 300px;
}

.shot-column {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.shot-column .list {
  border: 1px solid $light-grey;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  border-bottom: 0;
  flex: 1;
  margin-top: 4px;
  margin-right: 10px;
  overflow-y: scroll;
}

.shot-column .field {
  display: flex;
  margin-bottom: 0;
  margin-right: 10px;
  flex-direction: column;
}

.shot-column .button {
  margin-left: 0;
  border-radius: 0;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
}

.shot-column .input {
  border-radius: 0;
}

.entity-line {
  cursor: pointer;
  padding: 0.3em;
}

.entity-line:hover {
  background: var(--background-selectable);
}

.entity-line.selected {
  background: var(--background-selected);
  border: 0;
}

.modal-footer {
  padding: 1em 1em 0 1em;
}

input::placeholder {
  color: #bbb;
}

.explanation {
  margin-bottom: 1em;
}

.subtitle {
  margin-bottom: 0;
}

.shot-padding {
  margin-right: 1em;
}

.shot-tabs {
  display: flex;
  margin-bottom: 4px;
}

.tab-button {
  flex: 1;
  border: 1px solid $light-grey;
  background: transparent;
  cursor: pointer;
  padding: 4px 0;

  &.active {
    background: var(--background-selected);
  }

  &:first-child {
    border-radius: 4px 0 0 4px;
  }

  &:last-child {
    border-radius: 0 4px 4px 0;
    border-left: 0;
  }
}

.bulk-fields {
  display: flex;
  gap: 4px;
  margin-right: 10px;
  margin-bottom: 0;
}

.bulk-field {
  flex: 1;
  min-width: 0;
}

.entity-line.collision {
  color: $red;
  text-decoration: line-through;
}
</style>
