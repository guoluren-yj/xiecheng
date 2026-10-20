import React, { useContext } from 'react';
import { TextArea } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import { TopSection, SecondSection } from '_components/Section';
import CollapseForm from '_components/CollapseForm';

import Store from '../store/index';

export default observer(function ProgrammeCard() {
  const {
    routerParams: { sourceCategory },
    commonDs: { rfFormDs },
    ref: { programmeRef },
    customizeCollapseForm,
    getHocInstance,
  } = useContext(Store);
  return (
    <TopSection
      title={
        sourceCategory === 'RFP'
          ? intl.get('ssrc.rf.view.card.title.programme').d('方案要求')
          : intl.get('ssrc.rf.view.card.title.inquiryContent').d('征询内容')
      }
      code={`SSRC.INQUIRY_HALL.RF_EDIT.FORM_CARD_${sourceCategory}`}
      getHocInstance={getHocInstance}
      className="card-warp"
      id="programmeCard"
    >
      <SecondSection code="form">
        {customizeCollapseForm(
          {
            code: `SSRC.INQUIRY_HALL.RF_EDIT.FORM_${sourceCategory}`,
            dataSet: rfFormDs,
          },
          <CollapseForm
            dataSet={rfFormDs}
            columns={3}
            labelLayout="float"
            formRef={(ref) => {
              programmeRef.current = ref;
            }}
            useWidthPercent
          >
            <TextArea name="rfContent" colSpan={2} resize rows={3} />
          </CollapseForm>
        )}
      </SecondSection>
    </TopSection>
  );
});
