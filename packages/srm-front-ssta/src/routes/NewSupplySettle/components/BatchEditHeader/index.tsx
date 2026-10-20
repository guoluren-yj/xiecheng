import type { ReactElement } from 'react';
import React, { Fragment, useState, useMemo, useEffect, useCallback } from 'react';
import { Steps } from 'choerodon-ui';
import { observer } from 'mobx-react';
import { Button, DataSet } from 'choerodon-ui/pro';
import { isEmpty, flow, isFunction } from 'lodash';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';

import intl from 'utils/intl';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import EditStep from './EditStep';
import SelectStep from './SelectStep';
import { editDS, selectDS } from './storeDS';
import DynamicAlert from '../../../Components/DynamicAlert';
import styles from './index.less';

const { Step } = Steps;

export type DocType = 'PAYMENT' | 'PREPAYMENT';
type BatchEditCode = Record<'SELECT' | 'EDIT', string>
export const payBatchEditCode: BatchEditCode = {
  SELECT: 'SSTA.PAY_SETTLE_SUP.BATCH_EDIT_SELECT',
  EDIT: 'SSTA.PAY_SETTLE_SUP.BATCH_EDIT_EDIT',
};

export const preBatchEditCode: BatchEditCode = {
  SELECT: 'SSTA.PRE_SETTLE_SUP.BATCH_EDIT_SELECT',
  EDIT: 'SSTA.PRE_SETTLE_SUP.BATCH_EDIT_EDIT',
};

export const batchEditCodeMap: Record<DocType, BatchEditCode> = {
  PAYMENT: payBatchEditCode,
  PREPAYMENT: preBatchEditCode,
};

interface BatchEditHeaderProps {
  modal?: any,
  documentType: DocType,
  settleHeaderIds: string,
  okCallback: () => void,
  customizeForm: Function,
  customizeTable: Function,
}

const BatchEditHeader = flow(
  observer,
  withCustomize({
    unitCode: [
      ...Object.values(payBatchEditCode),
      ...Object.values(preBatchEditCode),
    ],
  }),
)((props: BatchEditHeaderProps) => {

  const {
    modal,
    okCallback,
    documentType,
    customizeForm,
    customizeTable,
    settleHeaderIds,
  } = props;
  const [stepCurrent, setStepCurrent] = useState(0);
  const selectDs = useMemo(() => new DataSet(selectDS(settleHeaderIds, documentType)), [settleHeaderIds, documentType]);
  const editDs = useMemo(() => new DataSet({
    ...editDS(documentType),
    children: { settleHeaderList: selectDs },
  }), [selectDs, documentType]);
  const { selected } = selectDs;

  const handleSubmit = useCallback(async () => {
    const res = await editDs.submit();
    if (!res) return false;
    if (isFunction(okCallback)) okCallback();
  }, [editDs, okCallback]);

  useEffect(() => {
    if (modal) modal.handleOk(handleSubmit);
  }, [modal, handleSubmit]);

  const footer = useCallback((okBtn, cancelBtn) => {
    return (
      <Fragment>
        {stepCurrent === 1 && okBtn}
        {stepCurrent === 0 && (
          <Button
            color={ButtonColor.primary}
            onClick={() => setStepCurrent(1)}
            disabled={isEmpty(selected)}
          >
            {intl.get(`ssta.common.button.nextStep`).d('下一步')}
          </Button>
        )}
        {stepCurrent === 1 && (
          <Button onClick={() => setStepCurrent(0)}>
            {intl.get(`ssta.common.button.prevStep`).d('上一步')}
          </Button>
        )}
        {cancelBtn}
      </Fragment>
    );
  }, [stepCurrent, selected]);

  useEffect(() => {
    if (modal) modal.update({ footer });
  }, [modal, footer]);

  return (
    <div className={styles['settle-header-batch-edit']}>
      <DynamicAlert
        placement='modal-top'
        message={intl.get('ssta.supplySettle.view.message.batchEditDocument').d('可通过该功能批量更新单据信息，仅当维护字段值时更新对应单据字段，维护空值不覆盖原值')}
      />
      <div className={styles['batch-edit-steps-bar']}>
        <Steps size='small' current={stepCurrent}>
          <Step title={intl.get('ssta.supplySettle.view.title.selectSettleDoc').d('选择结算单')} />
          <Step title={intl.get('ssta.supplySettle.view.title.batchEdit').d('批量编辑')} />
        </Steps>
      </div>
      <div className={styles['batch-edit-step-content']}>
        {stepCurrent === 0 && <SelectStep selectDs={selectDs} documentType={documentType} customizeTable={customizeTable} />}
        {stepCurrent === 1 && <EditStep editDs={editDs} documentType={documentType} customizeForm={customizeForm} />}
      </div>
    </div>
  );
}) as (props: BatchEditHeaderProps) => ReactElement;

export default BatchEditHeader;