import React, { useMemo, useCallback, useLayoutEffect } from 'react';
import {
  Form,
  DataSet,
  // Modal,
  Icon,
  Tooltip,
  NumberField,
  DatePicker,
  Button,
  CheckBox,
  Lov,
  useModal,
  TextArea,
  TextField,
} from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { noop, throttle, isEmpty } from 'lodash';

import intl from 'utils/intl';
import notification from 'utils/notification';
import SupplierLov from 'srm-front-boot/lib/components/SupplierLov';

import { handleFormDSFieldsValue } from '@/routes/components/Widget/Forms/handleFormDSFieldsValue';
import { batchMaintainFormDS } from '../Stores/batchMaintainDS';

let _modal = null;

const BatchMaintain = (props = {}) => {
  const {
    basicFormDS,
    organizationId,
    offlineEntryRemote,
    // quotationName,
    customizeUnitCode = null,
    customizeForm = noop,
    disabled,
    title = null,
    text = intl.get('ssrc.inquiryHall.model.inquiryHall.batchMaintenance').d('批量维护'),
    confirmBatchMaintain = noop,
    fetchSourceSupplierRelativeConfigData = noop,
    // cancelBatchMaintain = noop,
    // resetBatchMaintain = noop,
    btnName = null,
    lineDS = null,
    allowInputSupplierNameFlag = 0,
  } = props;

  const Modal = useModal();

  const { companyId } = basicFormDS?.current ? basicFormDS.current.get(['companyId']) : {};
  // const purchaseTurnFlag = sourceFrom === 'DEMAND_POOL' || purchaseRequestFlag === 1; // 申请转标识
const batchMaintainFormProps = batchMaintainFormDS({
  organizationId,
  basicFormDS,
  // purchaseTurnFlag,
  offlineEntryRemote,
  allowInputSupplierNameFlag,
});
  const baseDS = useMemo(
    () =>
      new DataSet(
        offlineEntryRemote
          ? offlineEntryRemote.process(
              'SSRC_WHOLE_OFFLINE_ENTRY_UPDATE_LINE_BATCH_MAIN_FORM_MODAL_DS_PROPS',
              batchMaintainFormProps,
              {
                basicFormDS,
              }
            )
          : batchMaintainFormProps
      ),
    [organizationId, title, basicFormDS, allowInputSupplierNameFlag]
  );

  const { supplierCompanyId: currentSupplierCompanyId } = baseDS?.current
    ? baseDS.current?.get?.(['supplierCompanyId'])
    : {};

  // ok
  const handleOk = useCallback(
    throttle(async () => {
      if (!baseDS?.current) {
        return;
      }

      const { current } = baseDS;
      current.set('status', 'update');
      const validationFlag = await baseDS.validate();
      if (!validationFlag) {
        return false;
      }

      const data = handleFormDSFieldsValue({
        ds: baseDS,
      });
      const formData = current.toData();
      if (isEmpty(data) || isEmpty(formData)) {
        return;
      }
      delete formData?.__dirty;

      confirmBatchMaintain({
        data,
        ds: baseDS,
        formData,
      });
      handleCancel();
    }, 300),
    [baseDS, baseDS?.current, baseDS?.status, handleFormDSFieldsValue, confirmBatchMaintain]
  );

  const handleCancel = useCallback(() => {
    if (!baseDS) {
      return;
    }

    baseDS.reset();
    baseDS.loadData();
    // cancelBatchMaintain();
  }, [baseDS]);

  // 重置
  const resetBatchMaintainItemLine = useCallback(() => {
    if (!baseDS) {
      return;
    }

    baseDS.loadData();
  }, [baseDS]);

  useLayoutEffect(() => {
    if (!_modal) {
      return;
    }

    _modal.update({
      children: renderContent(),
    });
  }, [
    renderContent,
    _modal,
    currentSupplierCompanyId,
    startBatchMaintainItemLine,
    resetBatchMaintainItemLine,
    baseDS,
    baseDS?.current,
    lineDS?.selected,
    renderContent,
    handleCancel,
    handleOk,
    organizationId,
    basicFormDS,
    Modal,
    currentSupplierCompanyId,
  ]);

  // 发起批量
  const startBatchMaintainItemLine = useCallback(() => {
    baseDS.create({}, 0);

    // 需要批量编辑的行如果都是申请转的，则批量编辑禁用业务实体，库存组织
    const outterLineDS = !isEmpty(lineDS?.selected) ? lineDS.selected : lineDS;
    const outterLinePrHeaderIdFlag = outterLineDS?.every((record) => !!record.get('prHeaderId'));
    if (outterLinePrHeaderIdFlag) {
      baseDS.setState('outterLinePrHeaderIdFlag', outterLinePrHeaderIdFlag);
    }
    _modal = Modal.open({
      drawer: true,
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

    return _modal;
  }, [
    resetBatchMaintainItemLine,
    baseDS,
    _modal,
    baseDS?.current,
    lineDS?.selected,
    renderContent,
    handleCancel,
    handleOk,
    organizationId,
    basicFormDS,
    Modal,
    currentSupplierCompanyId,
  ]);

  // supplier lov select data on ok
  const supplierLovOk = useCallback(
    (options = {}) => {
      const CurrentRecord = baseDS?.current;
      if (!CurrentRecord) {
        return;
      }

      const { currentField = 'supplierCompanyId' } = options || {};
      const supplierLovSelectedData = CurrentRecord?.get(currentField);
      if (isEmpty(supplierLovSelectedData)) {
        notification.warning({
          message: intl
            .get('hzero.common.message.confirm.selected.atLeast')
            .d('请至少选择一行数据'),
        });
        return false;
      }

      updateCurrentLineFields(supplierLovSelectedData, CurrentRecord);
    },
    [baseDS]
  );

  // select lov update current line fields
  const updateCurrentLineFields = (supplierLovSelectedData = {}, CurrentRecord = {}) => {
    const {
      supplierId = null,
      supplierNum = null,
      supplierName = null,
      supplierCompanyId = null,
      supplierCompanyName = null,
      supplierCompanyNum = null,
      supplierContactId = null,
      supplierTenantId = null,
      name = null,
      mobilephone = null,
      mail = null,
      internationalTelCode = null,
    } = supplierLovSelectedData || {};

    const ErrorFlag = !supplierCompanyId && !supplierId && !supplierCompanyName && !supplierName;
    if (ErrorFlag) {
      notification.warning({
        message: intl.get('hzero.common.notification.warn').d('操作异常'),
      });
      return false;
    }

    const supplierTypeText = supplierId && !supplierCompanyId ? 'external' : 'internal';

    CurrentRecord.set('supplierCompanyId', {
      supplierCompanyNum: supplierCompanyNum || supplierNum,
      supplierCompanyId,
      cuxSupplierLovData: supplierLovSelectedData,
    });
    CurrentRecord.set('supplierId', supplierId);
    CurrentRecord.set('supplierName', supplierName);
    CurrentRecord.set('supplierNum', supplierNum);
    CurrentRecord.set('supplierCompanyName', {
      supplierCompanyName: supplierCompanyName || supplierName,
    });
    CurrentRecord.set('contactName', name);
    CurrentRecord.set('supplierContactId', supplierContactId);
    CurrentRecord.set('contactMobilephone', mobilephone);
    CurrentRecord.set('supplierType', supplierTypeText);
    CurrentRecord.set('contactMail', mail);
    CurrentRecord.set('internationalTelCode', internationalTelCode);
    CurrentRecord.set('supplierTenantId', supplierTenantId);
  };

  // supplier lov change value
  const supplierLovChange = useCallback(
    (value) => {
      const CurrentRecord = baseDS?.current;
      if (!CurrentRecord) {
        return;
      }

      if (!value) {
        CurrentRecord.set({
          supplierId: null,
          supplierCompanyId: null,
          supplierName: null,
          supplierNum: null,
          supplierCompanyName: null,
          contactName: null,
          supplierContactId: null,
          contactMobilephone: null,
          supplierType: null,
          contactMail: null,
          internationalTelCode: null,
          supplierTenantId: null,
          stageDescription: null,
        });
      } else {
        const { supplierCompanyId, supplierCompanyName } = value || {};
        const newValue = value || {};
        if (supplierCompanyName && supplierCompanyName === supplierCompanyId) {
          newValue.supplierCompanyId = null;
        }
        updateCurrentLineFields(newValue, CurrentRecord);
      }
    },
    [baseDS?.current, allowInputSupplierNameFlag]
  );

  const getSupplierLovProps = useCallback(
    (options = {}) => {
      const companyIdValue = companyId?.companyId;
      const queryData = {
        companyId: companyIdValue,
      };

      const supplierLovProps = {
        clearButton: true,
        noCache: true,
        modalProps: {
          style: { maxWidth: '1200px', width: '800px' },
          onOk: supplierLovOk,
        },
        onChange: supplierLovChange,
        disabled: !companyIdValue,
        beforeQuery: fetchSourceSupplierRelativeConfigData,
      };

      return {
        queryData, // 初始化查询参数 body payload
        ...supplierLovProps,
        ...options,
      };
    },
    [
      companyId,
      supplierLovOk,
      fetchSourceSupplierRelativeConfigData,
      supplierLovChange,
      allowInputSupplierNameFlag,
    ]
  );

  // supplier_company_name lov modal ok
  const getSupplierNameLovProps = useCallback(
    (options = {}) => {
      const commonSupplierLovProps = getSupplierLovProps(options) || {};

      commonSupplierLovProps.modalProps = {
        ...(commonSupplierLovProps.modalProps || {}),
        onOk: () =>
          supplierLovOk({
            currentField: 'supplierCompanyName',
          }),
      };

      return commonSupplierLovProps;
    },
    [getSupplierLovProps, companyId, fetchSourceSupplierRelativeConfigData, supplierLovOk]
  );

  // ou_id
  const changeOuId = useCallback(
    (value) => {
      const { current } = baseDS || {};
      if (!current) {
        return;
      }
      current.set({
        ouId: {
          ouId: value?.ouId,
          ouName: value?.ouName,
        },
        invOrganizationId: null,
      });
    },
    [baseDS?.current]
  );

  // change quotation currency
  const changeCurrency = (data = {}) => {
    const { current } = baseDS || {};
    if (!current) {
      return;
    }
    const {
      currencyCode,
      currencyName,
      defaultPrecision,
      financialPrecision: currentFinancialPrecision,
    } = data || {};

    const forceUpdateFields = current.get('forceUpdateFields') || {};

    current.set({
      quotationCurrencyCode: { quotationCurrencyCode: currencyCode, currencyCode, currencyName },
      forceUpdateFields: {
        ...forceUpdateFields,
        quotationCurrencyCode: {
          defaultPrecision,
          financialPrecision: currentFinancialPrecision,
        },
      },
    });
  };

  // form content
  const renderContent = useCallback(() => {
    if (!baseDS) {
      return;
    }

    const { supplierCompanyNum } = currentSupplierCompanyId || {};
    const { ...resetProps } = getSupplierLovProps() || {};
    const { ...supplierCompanyNameResetProps } = getSupplierNameLovProps() || {};

    return (
      <div>
        <div
          style={{
            margin: '-20px -20px 10px',
            background: 'rgb(230, 242, 253)',
            padding: '10px 24px',
            fontSize: '13px',
            color: 'rgb(48, 145, 242)',
          }}
        >
          <Icon type="icon icon-help" />
          <span style={{ paddingLeft: '4px' }}>{title}</span>
        </div>

        {customizeForm(
          { code: customizeUnitCode },
          <Form columns={1} labelLayout="float" dataSet={baseDS}>
            <CheckBox name="suggestedFlag" />
            <NumberField name="allottedRatio" />
            <TextArea name="suggestedRemark" />
            <CheckBox name="controlProtocolFlag" />
            <CheckBox name="controlOrderFlag" />
            <Lov name="ouId" onChange={changeOuId} />
            <Lov name="invOrganizationId" />
            <DatePicker name="demandDate" />
            <SupplierLov
              name="supplierCompanyId"
              {...resetProps}
              dataSet={baseDS}
              valueChangeAction="input"
              restrict="\S"
            />
            {supplierCompanyNum || !allowInputSupplierNameFlag ? (
              <TextField name="supplierCompanyName" />
            ) : (
              <SupplierLov
                {...supplierCompanyNameResetProps}
                dataSet={baseDS}
                name="supplierCompanyName"
                combo
                valueChangeAction="input"
                restrict="\S"
              />
            )}
            <Lov name="paymentTermId" />
            <Lov name="paymentTypeId" />
            <CheckBox name="taxIncludedFlag" />
            <Lov name="taxId" />
            <Lov name="quotationCurrencyCode" onChange={(value) => changeCurrency(value)} />
            <NumberField name="exchangeRate" />
            <CheckBox name="freightIncludedFlag" />
            <NumberField name="freightAmount" />
            <NumberField name="currentDeliveryCycle" />
            <DatePicker name="currentPromisedDate" />
            <NumberField name="priceBatchQuantity" />
            <DatePicker name="currentExpiryDateFrom" />
            <DatePicker name="currentExpiryDateTo" />
          </Form>
        )}
      </div>
    );
  }, [
    customizeUnitCode,
    baseDS,
    baseDS?.current,
    getSupplierLovProps,
    getSupplierNameLovProps,
    changeOuId,
    Modal,
    title,
    allowInputSupplierNameFlag,
    currentSupplierCompanyId,
    _modal,
  ]);

  return (
    <Tooltip title={title}>
      <Button
        funcType="flat"
        icon="mode_edit"
        onClick={startBatchMaintainItemLine}
        disabled={disabled}
        wait={500}
        waitType="debounce"
        name={btnName}
      >
        {text}
      </Button>
    </Tooltip>
  );
};

export default observer(BatchMaintain);
