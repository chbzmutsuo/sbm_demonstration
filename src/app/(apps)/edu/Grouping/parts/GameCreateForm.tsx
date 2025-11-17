import {ColBuilder} from '@app/(apps)/edu/class/ColBuilder'
import {transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'

import SimpleTable from '@cm/components/utils/SimpleTable'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'

import {doTransaction} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import {Alert} from '@cm/components/styles/common-components/Alert'
import {Button} from '@cm/components/styles/common-components/Button'
import {R_Stack} from '@cm/components/styles/common-components/common-components'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {toast} from 'react-toastify'
import {myFormDefaultUpsert} from '@cm/lib/formMethods/myFormDefaultUpsert'

const GameCreateForm = ({newGameFormData, setnewGameFormData}) => {
  const useGlobalProps = useGlobal()
  const {session, toggleLoad, accessScopes, router} = useGlobalProps
  const {schoolId} = accessScopes().getGroupieScopes()
  const columns = ColBuilder.game({useGlobalProps})
  const {BasicForm, latestFormData} = useBasicFormProps({columns, formData: newGameFormData ?? {}})
  const secretKey = `${session?.id}${Math.floor(Math.random() * 90000) + 10000}`

  const {GameStudent} = newGameFormData
  const copyMode = GameStudent

  return (
    <>
      {copyMode && <Alert color={`red`}>コピー元の所属生徒【{GameStudent.length}名】を自動で紐付けます。</Alert>}
      <R_Stack className={`items-start gap-10`}>
        <BasicForm
          latestFormData={latestFormData}
          onSubmit={async () => {
            toggleLoad(async () => {
              const {result: newGame} = await myFormDefaultUpsert({
                latestFormData: {...latestFormData, id: 0, secretKey, schoolId},
                extraFormState: {},
                dataModelName: 'game',
                additional: {},
                formData: newGameFormData,
                columns,
              })

              if (copyMode) {
                const GameStudentQueries: transactionQuery<'gameStudent', 'create'>[] = []
                GameStudent.forEach(d => {
                  const {studentId, gameId} = d
                  GameStudentQueries.push({
                    model: 'gameStudent',
                    method: 'create',
                    queryObject: {
                      data: {
                        studentId,
                        gameId: newGame.id,
                      },
                    },
                  })
                })
                await doTransaction({transactionQueryList: GameStudentQueries})
                toast.success('コピーしました')
              }

              setnewGameFormData(null)
            })
            router.refresh()
          }}
        >
          <Button>{GameStudent ? 'コピー' : '新規'}</Button>
        </BasicForm>
        {GameStudent && (
          <div {...{style: {width: `fit-content`}}}>
            <SimpleTable
              {...{
                style: {width: 200},
                bodyArr: GameStudent?.map(s => {
                  const {Student} = s
                  return [Student.name]
                }),
              }}
            />
          </div>
        )}
      </R_Stack>
    </>
  )
}

export default GameCreateForm
