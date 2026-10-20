import React, { useContext, useCallback } from 'react';
import { Output, Tooltip } from 'choerodon-ui/pro';

import { AFBasic } from '_components/AFCards';
import DynamicButtons from '_components/DynamicButtons';

import { Store } from '../stores';
import commonStyles from '../../../../common.less';
import { DetailBtnsCustCode, FlowCardCustCodeMap } from '../../utils/type';

const tagFields = ['payFormMeaning'];

const WorkflowCard = (props) => {

  const { buttons = [] } = props;
  const {
    headerDs,
    customizeCommon,
    customizeBtnGroup,
  } = useContext(Store);

  const contentBottomRender = useCallback(() => {
    return (
      <div className={commonStyles['workflow-basic-bottom']}>
        {customizeBtnGroup(
          { code: DetailBtnsCustCode, pro: true },
          <DynamicButtons defaultBtnType='c7n-pro' buttons={buttons} />
        )}
      </div>
    );
  }, [buttons, customizeBtnGroup]);

  const contentRemainRender = useCallback(() => {
    const label = headerDs.getField('payAmount')?.get('label');
    return (
      <div className={commonStyles['workflow-basic-right']}>
        <div className={commonStyles['workflow-basic-right-label']}>{label}</div>
        <div className={commonStyles['workflow-basic-right-value']}>
          <Output
            name="payAmount"
            dataSet={headerDs}
            className={commonStyles['workflow-basic-right-amount']}
            renderer={({ text }) => <Tooltip title={text}>{text}</Tooltip>}
          />
          <Output name="currencyCode" dataSet={headerDs} />
        </div>
      </div>
    );
  }, [
    headerDs,
  ]);

  return (
    <div className={commonStyles['workflow-card-wrapper']}>
      {customizeCommon(
        {
          code: FlowCardCustCodeMap.Basic,
          processUnitTag: 'AF-BASIC',
        },
        <AFBasic
          maxTagCount={3}
          dataSet={headerDs}
          titleField="payNum"
          tagFields={tagFields}
          contentRemainWidth="25%"
          contentBottomRender={contentBottomRender}
          contentRemainRender={contentRemainRender}
        />
      )}
    </div>
  );
};

export default WorkflowCard;
