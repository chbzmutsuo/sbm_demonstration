import {optionType} from 'src/cm/class/Fields/col-operator-types'
import {contextsType} from '@cm/components/DataLogic/TFs/MyForm/components/HookFormControl/Control/MySelect/my-select-types'

import {breakLines} from 'src/cm/lib/value-handler'

import {IconBtnForSelect} from '@cm/components/styles/common-components/IconBtn'
import {colorVariants} from '@cm/lib/methods/colorVariants'

export const SelectOption = (props: {contexts: contextsType; option: optionType; optionStyle: any}) => {
  const contexts = props.contexts

  const {option, optionStyle} = props
  const {filteredOptions, handleOptionClick} = contexts.MySelectContextValue

  const label = option?.['label'] ?? '指定しない'

  if (typeof label === `object`) return <></>
  return (
    <span
      // type="button"
      id={`option-${option.id}`}
      onClick={() => {
        setTimeout(async () => {
          await handleOptionClick(option, filteredOptions)
        }, 50)
      }}
      className={'onHover '}
    >
      <IconBtnForSelect color={(option.color ?? '#cecece') as colorVariants} style={{maxWidth: `80vw`, ...optionStyle}}>
        {breakLines(label)}
      </IconBtnForSelect>
    </span>
  )
}
