import type { Permission } from '~/types/permission'

export interface UserSystem {
  id: number
  firstName: string
  lastName: string
  username: string
  email: string
  pass?: string
  permission?: Permission | null
  createdBy?: number | null
  createdByName?: string
  createdAt: string
}
