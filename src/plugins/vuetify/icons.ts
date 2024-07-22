import { Icon } from '@iconify/vue'
import type { IconProps, IconSet } from 'vuetify'
import { aliases } from 'vuetify/lib/iconsets/mdi'

const alertTypeIcon = {
  success: 'mdi-check-circle-outline',
  info: 'mdi-information-outline',
  warning: 'mdi-alert-outline',
  error: 'mdi-alert-circle-outline',
}

const modifiedAliases = Object.assign(aliases, alertTypeIcon)

export const iconify: IconSet = {
  component: (props: IconProps) => h(Icon, props),
}

export const icons = {
  defaultSet: 'iconify',
  mergedAliases: modifiedAliases,
  sets: {
    iconify,
  },
}
