import React, { useMemo, useCallback } from 'react';
import {
  Form,
  DataSet,
  Modal,
  Icon,
  Tooltip,
  NumberField,
  DatePicker,
  Button,
  Lov,
  CheckBox,
} from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { noop, throttle, isEmpty } from 'lodash';

import intl from 'utils/intl';

import { handleFormDSFieldsValue } from '@/routes/components/Widget/Forms/handleFormDSFieldsValue';
import { batchMaintainFormDS } from '../Stores/batchMaintainDS';

const BatchMaintain = (props = {}) => {
  const {
    organizationId,
    // quotationName,
    customizeUnitCode = null,
    customizeForm = noop,
    disabled,
    title = null,
    text = intl.get('ssrc.inquiryHall.model.inquiryHall.batchMaintenance').d('批量维护'),
    confirmBatchMaintain = noop,
    // cancelBatchMaintain = noop,
    // resetBatchMaintain = noop,
    quotationLineDS = null,
    quotationRemote,
    basicFormDS,
    bidFlag = false,
  } = props;

  const baseDS = useMemo(
    () =>
      new DataSet(
        quotationRemote
          ? quotationRemote.process(
              'SSRC_SUPPLIER_QUOTATION_NEW_PROCESS_BATCH_TABLE_DS',
              batchMaintainFormDS({ basicFormDS, organizationId }),
              {
                basicFormDS,
                bidFlag,
              }
            )
          : batchMaintainFormDS({ basicFormDS, organizationId })
      ),
    [basicFormDS]
  );

  // ok
  const handleOk = useCallback(
    throttle(async () => {
      let data = null;
      const validationFlag = await baseDS.validate();
      const { current } = baseDS;
      if (!validationFlag || !current) {
        return false;
      }
      data = current?.toData() || {};
      const currentData =
        handleFormDSFieldsValue({
          ds: baseDS,
        }) || {};
      delete data.__dirty;
      delete currentData.taxRate; // tax__rate 比较特殊
      confirmBatchMaintain({
        data,
        currentData,
        ds: baseDS,
      });
      handleCancel();
    }, 2000),
    [baseDS, confirmBatchMaintain]
  );

  const handleCancel = useCallback(() => {
    baseDS.loadData();
    baseDS.reset();
    // cancelBatchMaintain();
  }, [baseDS]);

  // 重置
  const resetBatchMaintainItemLine = useCallback(() => {
    baseDS.loadData();
    baseDS.reset();
  }, [baseDS]);

  // 发起批量
  const startBatchMaintainItemLine = useCallback(() => {
    Modal.open({
      drawer: true,
      key: Modal.key(),
      destroyOnClose: true,
      style: { width: '380px' },
      closable: true,
      title: intl.get('ssrc.supplierQuotation.view.button.batchMaintenance').d('批量维护'),
      children: renderContent(),
      onOk: handleOk,
      onCancel: handleCancel,
      footer: (okBtn, cancelBtn) => (
        <div>
          {okBtn}
          <Button onClick={resetBatchMaintainItemLine}>
            {intl.get('hzero.common.button.reset').d('重置')}
          </Button>
          {cancelBtn}
        </div>
      ),
    });
  }, [renderContent, handleCancel, handleOk]);

  // form content
  const renderContent = useCallback(() => {
    return (
      <div>
        <div
          style={{
            margin: '-20px -20px 20px',
            background: 'rgb(230, 242, 253)',
            padding: '10px 24px',
            fontSize: '13px',
            color: 'rgb(48, 145, 242)',
          }}
        >
          <Icon type="icon icon-help" />
          &nbsp;&nbsp;
          {isEmpty(quotationLineDS.selected)
            ? intl
                .get('ssrc.inquiryHall.model.inquiryHall.batchAllDataToEdit')
                .d('针对全部数据进行批量编辑')
            : intl
                .get('ssrc.inquiryHall.model.inquiryHall.batchCheckDataToEdit', {
                  length: quotationLineDS.selected.length,
                })
                .d(`已勾选${quotationLineDS.selected.length}条数据进行批量编辑`)}
        </div>
        {customizeForm(
          { code: customizeUnitCode },
          <Form columns={1} labelLayout="float" dataSet={baseDS}>
            <DatePicker name="currentExpiryDateFrom" />
            <DatePicker name="currentExpiryDateTo" />
            <NumberField name="currentDeliveryCycle" />
            <CheckBox name="taxIncludedFlag" />
            <Lov name="taxId" />
          </Form>
        )}
      </div>
    );
  }, [customizeUnitCode, baseDS]);

  return (
    <Button
      funcType="flat"
      onClick={startBatchMaintainItemLine}
      disabled={disabled}
      icon="mode_edit"
    >
      <Tooltip title={title}>{text}</Tooltip>
    </Button>
  );

  // return (
  //   <a onClick={startBatchMaintainItemLine} disabled={disabled} style={{ marginRight: '20px' }}>
  //     <Icon type="mode_edit" style={{ marginRight: '8px', fontSize: '14px' }} />
  //     <Tooltip title={title}>{text}</Tooltip>
  //   </a>
  // );
};

export default observer(BatchMaintain);
