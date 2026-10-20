import type { ReactElement } from 'react';
import React, { useMemo, useCallback, Fragment } from 'react';
import { Button, DataSet, Spin } from 'choerodon-ui/pro';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { Steps } from 'choerodon-ui';
import { observer } from 'mobx-react';
import { flow, isFunction } from 'lodash';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

import InvoiceLine from './InvoiceLine';
import type { DocType } from './storeDS';
import InvoiceHeader from './InvoiceHeader';
import { invoiceHeaderDS, invoiceLineDS, primaryKeyMap } from './storeDS';
import commonStyles from '../../../common.less';

const { Step } = Steps;

interface InvoiceStepProps {
  modal?: any,
  docType: DocType,
  invoiceHeaderId?: string | number,
  feeData: Record<string, any>,
  onRefreshAll: Function,
}

const showLineFlag = false;

const InvoiceStep = flow(
  observer,
  formatterCollections({ code: ['ssta.invoice', 'ssta.common'] }),
)((props: InvoiceStepProps) => {
  const { modal, docType, invoiceHeaderId, feeData, onRefreshAll } = props;
  const primaryKey = primaryKeyMap[docType];
  const invoiceLineDs = useMemo<DataSet>(() => new DataSet(invoiceLineDS(primaryKey)), [primaryKey]);
  const invoiceHeaderDs = useMemo<DataSet>(() => new DataSet({
    ...invoiceHeaderDS(invoiceHeaderId, docType, feeData),
    // children: { invoiceLineList: invoiceLineDs },
  }), [invoiceHeaderId, docType, feeData]);
  const loading = invoiceHeaderDs.status !== 'ready';
  const stepCurrent = invoiceHeaderDs.getState('stepCurrent') || 0;

  const handleSave = useCallback(async () => {
    const invoiceHeaderId = invoiceHeaderDs.current?.get(primaryKey);
    const submitType = invoiceHeaderId ? 'update' : 'create';
    const res = await invoiceHeaderDs.setState('submitType', submitType).submit();
    return res;
  }, [invoiceHeaderDs, primaryKey]);

  const handleSubmit = useCallback(async () => {
    const res = await handleSave();
    if (!res) return;
    if (isFunction(onRefreshAll)) await onRefreshAll();
    modal.close();
  }, [handleSave, modal, onRefreshAll]);

  const handlePrevStep = useCallback(async () => {
    const res = await handleSave();
    if (!res) return;
    invoiceHeaderDs.query();
    const stepCurrent = invoiceHeaderDs.getState('stepCurrent') || 0;
    invoiceHeaderDs.setState('stepCurrent', stepCurrent - 1);
  }, [handleSave, invoiceHeaderDs]);

  const handleNextStep = useCallback(async () => {
    const res = await handleSave();
    if (!res) return;
    if (!invoiceHeaderDs.getQueryParameter(primaryKey)) {
      const { [primaryKey]: newHeaderId } = res.content?.[0] || {};
      invoiceHeaderDs.setQueryParameter(primaryKey, newHeaderId);
    }
    invoiceHeaderDs.query();
    const stepCurrent = invoiceHeaderDs.getState('stepCurrent') || 0;
    invoiceHeaderDs.setState('stepCurrent', stepCurrent + 1);
  }, [handleSave, invoiceHeaderDs, primaryKey]);

  const stepList = useMemo(() => {
    const okBtn = (
      <Button color={ButtonColor.primary} loading={loading} onClick={handleSubmit}>
        {intl.get('hzero.common.button.confirm').d('确定')}
      </Button>
    );
    const cancelBtn = (
      <Button loading={loading} onClick={modal.close}>
        {intl.get('hzero.common.button.cancel').d('取消')}
      </Button>
    );
    const prevBtn = (
      <Button loading={loading} onClick={handlePrevStep}>
        {intl.get(`ssta.common.button.prevStep`).d('上一步')}
      </Button>
    );
    const nextBtn = (
      <Button loading={loading} onClick={handleNextStep}>
        {intl.get(`ssta.common.button.nextStep`).d('下一步')}
      </Button>
    );
    return [
      {
        key: 'INVOICE_HEADER',
        title: intl.get('ssta.invoice.view.title.invoiceHeader').d('发票头'),
        content: <InvoiceHeader primaryKey={primaryKey} invoiceHeaderDs={invoiceHeaderDs} />,
        footerBtns: (
          <Fragment>
            {okBtn}
            {showLineFlag && nextBtn}
            {cancelBtn}
          </Fragment>
        ),
      },
      ...(showLineFlag ? [{
        key: 'INVOICE_LINE',
        title: intl.get('ssta.invoice.view.title.invoiceLine').d('发票行'),
        content: <InvoiceLine invoiceLineDs={invoiceLineDs} invoiceHeaderDs={invoiceHeaderDs} />,
        footerBtns: (
          <Fragment>
            {okBtn}
            {prevBtn}
            {cancelBtn}
          </Fragment>
        ),
      }] : []),
    ];
  }, [modal, loading, primaryKey, invoiceHeaderDs, invoiceLineDs, handleSubmit, handlePrevStep, handleNextStep]);

  if (!invoiceHeaderDs.current) return <Spin />;

  return (
    <div className={commonStyles['create-steps-wrapper']}>
      {showLineFlag && (
        <Steps
          size="small"
          current={stepCurrent}
          style={{ paddingBottom: 16, marginBottom: 16, borderBottom: '1px solid #f5f5f5' }}
        >
          {stepList.map(({ title, key }) => <Step title={title} key={key} />)}
        </Steps>
      )}
      <div className="create-steps-content">{stepList[stepCurrent]?.content}</div>
      <div className="ssta-body-footer">{stepList[stepCurrent]?.footerBtns}</div>
    </div>
  );
}) as (props: InvoiceStepProps) => ReactElement;

export default InvoiceStep;