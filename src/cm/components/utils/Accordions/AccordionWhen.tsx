import Accordion from 'src/cm/components/utils/Accordions/Accordion'

const AccordionWhen = ({label, when, children}) => {
  if (when) {
    return <Accordion {...{label}}>{children}</Accordion>
  }
  return <>{children}</>
}

export default AccordionWhen
