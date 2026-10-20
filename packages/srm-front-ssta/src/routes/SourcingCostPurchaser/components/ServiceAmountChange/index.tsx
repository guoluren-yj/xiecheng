import React, { useMemo, useCallback, useEffect, Fragment } from 'react';
import { DataSet, Form, NumberField, Spin } from 'choerodon-ui/pro';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import type { Record as DSRecord } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import { serviceAmountChangeDS } from './storeDS';
import DynamicAlert from '../../../Components/DynamicAlert';

interface ServiceAmountChangeProps {
  modal?: any,
  serviceRecord: DSRecord | null | undefined,
  okCallback: Function,
  customizeForm: Function,
}

export const ServiceAmountChangeCode = 'SSTA.SERVICE_DETAIL_PUR.AMOUNT_CHANGE';

const ServiceAmountChange = withCustomize({
  unitCode: [ServiceAmountChangeCode],
})((props: ServiceAmountChangeProps) => {

  const { modal, serviceRecord, customizeForm, okCallback } = props;

  const serviceAmountChangeDs = useMemo<DataSet>(() => new DataSet(serviceAmountChangeDS(serviceRecord)), [serviceRecord]);

  const handleSubmit = useCallback(async () => {
    const res = await serviceAmountChangeDs.submit();
    if (!res) return false;
    if (okCallback) okCallback();
  }, [serviceAmountChangeDs, okCallback]);

  useEffect(() => {
    if (modal) modal.handleOk(handleSubmit);
  }, [modal, handleSubmit]);

  if (!serviceRecord) return <Spin />;

  return (
    <Fragment>
      <DynamicAlert
        placement='modal-top'
        message={intl
          .get(`ssta.sourcingCost.view.message.serviceAmountChangeAlert`)
          .d('服务费无进行中缴纳记录时，可通过当前功能进行服务费金额变更，同时为避免金额变化导致缴纳、开票信息维护不准确，变更过程中系统将限制不可进行服务费缴纳、录入发票操作')}
      />
      {customizeForm(
        { code: ServiceAmountChangeCode },
        <Form
          columns={1}
          useColon={false}
          dataSet={serviceAmountChangeDs}
          labelLayout={LabelLayout.float}
        >
          <NumberField name="amount" />
        </Form>
      )}
    </Fragment>
  );
});

export default ServiceAmountChange;