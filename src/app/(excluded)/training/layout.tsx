import {Metadata} from 'next'
import Admin from '@cm/components/layout/Admin/Admin'

const AppName = '筋トレ記録'
export const metadata: Metadata = {title: AppName}

export default async function TrainingLayout({children}) {
  return (
    <Admin
      {...{
        AppName: AppName,
        Logo: '💪',
        PagesMethod: 'training_PAGES',
      }}
    >
      <div className="min-h-screen bg-slate-50">{children}</div>
    </Admin>
  )
}
