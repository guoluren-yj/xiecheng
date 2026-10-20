/*
 * @Description: 付款计划详情-基本信息
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @Date: 2022-09-26 13:45:58
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2022, Hand
 */
import React, { useContext, useMemo, Fragment } from 'react';
import { math } from 'choerodon-ui/dataset';

import intl from 'utils/intl';

import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import EditorForm from '../../../Components/EditorForm';
import DynamicAlert from '../../../Components/DynamicAlert';
import { DetailCustomizeCode } from '../../utils/type';
import { statusTagRender } from '../../../Components/StatusTag';

const PlanBasic = () => {
  const {
    editFlag,
    planHeaderDs,
    customizeForm,
  } = useContext(Store) as StoreValueType;

  const { executedAmount, sourceCodeMeaning } = planHeaderDs.current?.get(['executedAmount', 'sourceCodeMeaning']) || {};

  const alertMessage = useMemo(() => {
    if (math.isZero(executedAmount)) {
      return intl
        .get(`ssta.paymentPlan.view.message.payPlanBasicAlertNoExecuted`, { sourceCodeMeaning })
        .d('当前付款计划已按最新{sourceCodeMeaning}金额/条款进行预处理，请确认系统处理是否准确');
    } else {
      return intl
        .get(`ssta.paymentPlan.view.message.payPlanBasicAlertExistExecuted`, { sourceCodeMeaning })
        .d('当前计划存在已执行计划总额，不可变更付款条款或取消付款计划，若存在{sourceCodeMeaning}总额或付款条款变更，请手工调整付款计划');
    }
  }, [executedAmount, sourceCodeMeaning]);

  const editorColumns = useMemo(() => {
    return [
      'planNum',
      'planDesc',
      'versionNumber',
      { name: 'planStatus', disabled: true, renderer: editFlag ? ({ text }) => text : statusTagRender },
      'realName',
      'creationDate',
      'sourceCode',
      'sourceDisplayNum',
      'currencyCode',
      'companyNum',
      'companyName',
      'ouName',
      'displaySupplierNum',
      'displaySupplierName',
      'purchaseAgentName',
      'sourceAmount',
      'termNum',
      'termVersionNumber',
      'paymentAmount',
      'executedAmount',
      'paymentBalance',
      'paymentDiffAmount',
      'prepayFlag',
      'stageFlag',
      'accountPeriodType',
      'enableTermFlag',
    ];
  }, [editFlag]);

  return (
    <Fragment>
      {editFlag && <DynamicAlert message={alertMessage} />}
      <EditorForm
        useWidthPercent
        columns={3}
        useColon={false}
        dataSet={planHeaderDs}
        editorFlag={editFlag}
        editorColumns={editorColumns}
        customizeForm={customizeForm}
        customizeOptions={{ code: DetailCustomizeCode.BasicFormCode, readOnly: !editFlag }}
      />
    </Fragment>
  );
};

export default PlanBasic;
