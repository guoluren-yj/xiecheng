/*
 * @Descripttion: 寻源过程控制--征询阶段
 * @version:
 * @Author: yiping.liu<yiping.liu@going-link.com>
 * @Date: 2021-07-21 17:41:38
 * @LastEditors: yiping.liu
 */
import React, { useEffect, useContext } from 'react';
import { observer } from 'mobx-react';

import { DateTimePicker, NumberField } from 'choerodon-ui/pro';
import CollapseForm from '_components/CollapseForm';

import { ComponentDiffRender } from '../utils';
import Store from '../store';

const Consultation = observer((props) => {
  const { consultationDs, startVisible, endVisible } = props;
  const { customizeCollapseForm } = useContext(Store);

  useEffect(() => {}, []);

  return (
    <React.Fragment>
      {customizeCollapseForm(
        {
          code: 'SSRC.INQUIRY_HALL.RF_CONTROL.QUOTATION_STAGE',
          dataSet: consultationDs,
        },
        <CollapseForm dataSet={consultationDs} columns={3} labelLayout="float" useWidthPercent>
          <ComponentDiffRender
            name="quotationStartDate"
            special
            record={consultationDs}
            historyDTO="rfConfRuleOriginalDTO"
          >
            {startVisible && <DateTimePicker name="quotationStartDate" />}
          </ComponentDiffRender>
          <ComponentDiffRender
            name="quotationEndDate"
            special
            record={consultationDs}
            historyDTO="rfConfRuleOriginalDTO"
          >
            {endVisible && <DateTimePicker name="quotationEndDate" />}
          </ComponentDiffRender>
          <ComponentDiffRender
            name="minQuotedSupplier"
            special
            record={consultationDs}
            historyDTO="rfConfRuleOriginalDTO"
          >
            <NumberField name="minQuotedSupplier" />
          </ComponentDiffRender>
          <ComponentDiffRender
            name="clarifyEndDate"
            special
            record={consultationDs}
            historyDTO="rfConfRuleOriginalDTO"
          >
            <DateTimePicker name="clarifyEndDate" />
          </ComponentDiffRender>
        </CollapseForm>
      )}
    </React.Fragment>
  );
});

export default Consultation;
