export interface Notification {
  id: number
  title: string
  message: string
  action_type: 'Add' | 'Update' | 'Delete'
  action_by: string
  action_at: string
  is_read: boolean
}
