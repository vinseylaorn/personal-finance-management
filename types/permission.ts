export interface Permission {
  id: number
  name: string
  description?: string
  created_at?: string
  actions?: {
    view?: boolean
    create?: boolean
    edit?: boolean
    delete?: boolean
  }
}
