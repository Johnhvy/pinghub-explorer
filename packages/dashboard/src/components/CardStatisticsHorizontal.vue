<script setup lang="ts">
import { controlledComputed } from '@vueuse/shared';

interface Props {
  title: string
  color?: string
  icon: string
  stats: number
  change?: number
}

const props = withDefaults(defineProps<Props>(), {
  color: 'primary',
})

const isPositive = controlledComputed(() => props.change, () => Math.sign(props.change||0) === 1)
</script>

<template>
  <VCard>
    <VCardText class="d-flex align-center">
      <VAvatar
        size="40"
        rounded
        :color="props.color"
        variant="tonal"
        class="me-4"
      >
        <VIcon
          :icon="props.icon"
          size="24"
        />
      </VAvatar>

      <div class="d-flex flex-column">
        <div class="d-flex align-center flex-wrap">
          <h6 class="text-h6">
            {{ (props.stats) }}
          </h6>
          <div
            v-if="props.change"
            :class="`${isPositive ? 'text-success' : 'text-error'}`"
          >
            <VIcon
              size="24"
              :icon="isPositive ? 'mdi-chevron-up' : 'mdi-chevron-down'"
            />
            <span class="text-caption">{{ Math.abs(props.change) }}%</span>
          </div>
        </div>
        <span class="text-caption">{{ props.title }}</span>
      </div>
    </VCardText>
  </VCard>
</template>
