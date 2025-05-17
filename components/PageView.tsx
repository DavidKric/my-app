'use client'
import { FC } from 'react'
import { PageWrapper, Overlay } from '@allenai/pdf-components'
import AnnotationOverlay from './AnnotationOverlay'
import AnnotationAdder from './AnnotationAdder'
import { useAdderOnPage } from 'components/hooks/useAdderOnPage'

const PageView: FC<{ pageIndex: number }> = ({ pageIndex }) => {
  const { showAdder, rect, rects, text } = useAdderOnPage(pageIndex)
  return (
    <PageWrapper pageIndex={pageIndex} className="pdf-page">
      <Overlay>
        <AnnotationOverlay pageIndex={pageIndex} />
        {showAdder && rect && (
          <AnnotationAdder rect={rect} rects={rects} text={text} pageIndex={pageIndex} />
        )}
      </Overlay>
    </PageWrapper>
  )
}

export default PageView
