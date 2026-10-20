import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DataSet, Table, Spin, Button, useModal } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { noop, isEmpty, throttle } from 'lodash';
// import querystring from 'querystring';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';
import SupplierLov from 'srm-front-boot/lib/components/SupplierLov';

import { TooltipButtonPro } from '@/routes/components/TooltipButton';
import { idValidation } from '@/routes/components/Widget/dataVerification';
import { SupplierBulkExpiredModalDS } from '@/routes/ssrc/InquiryHallNew/Update/BulkAddSupplierDS';
import SupplierBatchAddExpiredModal from '@/routes/ssrc/InquiryHallNew/Update/SupplierBatchAddExpiredModal';

import {
  wholeValidateSupplierAndSave,
  wholeBatchDeleteSupplierLinesValid,
  wholeSupplierSave,
} from '@/services/inquiryHallNewService';

import { SupplierLovDS } from '../Stores/supplierLineDS';

import Styles from '../index.less';

const Suppliers = (props = {}) => {
  const {
    // contentRef,
    organizationId,
    doubleUnitFlag = false,
    rfxHeaderId,
    customizeUnitCode = '',
    supplierDS,
    customizeTable = noop,
    custLoading,
    // basicFormDS,
    // history,
    btnCustomizeUnitCode = null,
    companyId,
    fetchSourceSupplierRelativeConfigData = noop,
    allowInputSupplierNameFlag = 0,
  } = props;

  const uModal = useModal();

  const [loading, setLoading] = useState(false);
  const [supplierQualificationData, setSupplierQualificationData] = useState([]); // 供应商资格认证数据

  const supplierLovDS = useMemo(() => new DataSet(SupplierLovDS()), [companyId]);

  let supplierBulkExpiredModalDS = null;

  // 暴露子组件的api给父组件使用
  // useImperativeHandle(contentRef, () => ({
  // }));

  useEffect(() => {
    queryLine();
  }, []);

  // supplier line query
  const queryLine = () => {
    if (!supplierDS) {
      return;
    }

    supplierDS.query(undefined, undefined, true);
  };

  /**
   * 铺平供应商资质到期提醒数据
   */
  const renderDataSource = (dataSource = []) => {
    const arrayItem = [];
    if (isEmpty(dataSource)) {
      return arrayItem;
    }

    const attachmentsItem = dataSource.map((item = {}) => {
      const { expirAttachmentsDtos = [], ...otherItem } = item || {};
      if (expirAttachmentsDtos && expirAttachmentsDtos.length) {
        const attachmentsElement = expirAttachmentsDtos.map((element, index) => {
          return {
            index: `${otherItem.supplierCompanyId}#${index}`, // 用作唯一主键
            ...otherItem,
            ...element,
            supplierCompanyId: otherItem.supplierCompanyId,
          };
        });
        return attachmentsElement;
      } else {
        return otherItem;
      }
    });
    attachmentsItem.forEach((item) => {
      if (Array.isArray(item)) {
        arrayItem.push(...item);
      } else {
        arrayItem.push(item);
      }
    });
    return arrayItem;
  };

  /**
   * 取消-关闭批量添加供应商模态框
   */
  const cancelBulkAddSupplier = () => {
    if (!supplierBulkExpiredModalDS) {
      return;
    }
    supplierBulkExpiredModalDS.clearCachedSelected();
    supplierBulkExpiredModalDS.unSelectAll();
    supplierBulkExpiredModalDS.reset();
  };

  // 批量添加供应商确认
  const newBulkAddSupplier = useCallback(
    throttle(async () => {
      idValidation(companyId);

      const data = supplierLovDS?.toData();
      const { supplierLovList = [] } = data?.[0] || {};

      if (isEmpty(supplierLovList)) {
        notification.warning({
          message: intl
            .get('hzero.common.message.confirm.selected.atLeast')
            .d('请至少选择一行数据'),
        });
        return false;
      }

      const selectLines = supplierLovList;
      if (!organizationId || loading) {
        return;
      }

      const newParams = selectLines.map((item) => {
        const {
          mail,
          mobilephone,
          contactMail,
          contactPhone,
          name = null,
          supplierName,
          supplierCompanyName,
          supplierNum,
          supplierCompanyNum,
          internationalTelCode = null,
        } = item || {};
        return {
          ...item,
          contactName: name,
          rfxHeaderId,
          tenantId: organizationId,
          contactMail: mail || contactMail,
          sourceFrom: 'RFX',
          contactMobilephone: mobilephone || contactPhone,
          mobilephone: mobilephone || contactPhone,
          supplierCompanyName: supplierCompanyName || supplierName,
          supplierCompanyNum: supplierCompanyNum || supplierNum,
          internationalTelCode,
        };
      });

      setLoading(true);
      let res = null;
      try {
        res = await wholeValidateSupplierAndSave({
          data: newParams,
          queryParams: {
            rfxHeaderId,
            customizeUnitCode,
            companyId,
          },
          organizationId,
        });
        setLoading(false);
        supplierLovDS.loadData();

        if (res && res.failed) {
          notification.warning({
            message: res.message,
          });
          return;
        }

        const supplierAttachments = res?.filter((item = {}) => item?.expirAttachmentsDtosLen);
        if (!isEmpty(supplierAttachments)) {
          const flatData = renderDataSource(res);
          setSupplierQualificationData(res);
          openSupplierQualification(flatData, res);
        }

        queryLine();
        // cancelBulkAddSupplier();
      } catch (e) {
        throw e;
      }
    }, 1000),
    [
      supplierLovDS,
      queryLine,
      openSupplierQualification,
      companyId,
      supplierBulkExpiredModalDS,
      loading,
    ]
  );

  // 供应商存在资质过期时
  const openSupplierQualification = useCallback(
    (expireSupplier = [], allSupplierData = []) => {
      supplierBulkExpiredModalDS = new DataSet(SupplierBulkExpiredModalDS());
      supplierBulkExpiredModalDS.loadData(expireSupplier);
      supplierBulkExpiredModalDS.selectAll();

      const Props = {
        organizationId,
        supplierBulkExpiredModalDS,
      };

      return uModal.open({
        destroyOnClose: true,
        title: intl
          .get(`ssrc.inquiryHall.view.message.title.supplierQualification`)
          .d('供应商资质到期提醒'),
        children: <SupplierBatchAddExpiredModal {...Props} />,
        style: { width: '800px' },
        bodyStyle: { maxHeight: 400 },
        onOk: () => handleAddExpires(allSupplierData),
        okProps: {
          loading,
        },
        onCancel: cancelAddExpires,
      });
    },
    [
      supplierBulkExpiredModalDS,
      supplierBulkExpiredModalDS?.selected,
      organizationId,
      handleAddExpires,
      supplierQualificationData,
      loading,
    ]
  );

  // 供应商资质到期提醒 model ok
  const handleAddExpires = useCallback(
    throttle(async (allSupplierData = []) => {
      const selectedRows = supplierBulkExpiredModalDS.toJSONData();
      let newParams = [];

      const companyArray = [...new Set(selectedRows.map((item) => item.supplierCompanyId))];
      companyArray.forEach((supplierCompanyId) => {
        const supplierQualificationList = allSupplierData.filter(
          (element) => element.supplierCompanyId === supplierCompanyId
        );
        const newSupplierQualificationList = supplierQualificationList.map((supplierItem = {}) => {
          return {
            ...supplierItem,
            rfxHeaderId,
            tenantId: organizationId,
            contactMail: supplierItem.mail || supplierItem.contactMail,
            contactMobilephone: supplierItem.mobilephone || supplierItem.contactPhone,
          };
        });
        newParams = [...newParams, ...newSupplierQualificationList];
      });

      if (isEmpty(newParams) || loading) {
        return;
      }

      const Data = {
        data: newParams,
        organizationId,
        rfxHeaderId,
        queryParams: {
          rfxHeaderId,
          tenantId: organizationId,
          customizeUnitCode,
        },
      };

      try {
        setLoading(true);
        const result = await wholeSupplierSave(Data);
        setLoading(false);
        const res = getResponse(result);
        if (res && res.failed) {
          return;
        }
        cancelAddExpires();
        queryLine();
      } catch (e) {
        throw e;
      }
    }, 1000),
    [
      loading,
      openSupplierQualification,
      supplierBulkExpiredModalDS,
      supplierBulkExpiredModalDS?.selected,
      supplierQualificationData,
      queryLine,
      cancelAddExpires,
      customizeUnitCode,
      organizationId,
      newBulkAddSupplier,
    ]
  );

  // 供应商资质到期提醒 model cancel
  const cancelAddExpires = () => {
    if (!supplierBulkExpiredModalDS) {
      return;
    }
    supplierBulkExpiredModalDS.reset();
    cancelBulkAddSupplier();
  };

  // new supplier lov props
  const supplierLovProps = useMemo(
    () => ({
      dataSet: supplierLovDS,
      mode: 'button',
      name: 'supplierLovList',
      clearButton: false,
      icon: 'auto_complete',
      placeholder: intl
        .get('ssrc.inquiryHall.model.inquiryHall.button.bulkAddSupplier')
        .d('批量添加供应商'),
      modalProps: {
        style: { maxWidth: '1500px', width: '1000px' },
        onOk: newBulkAddSupplier,
        okProps: {
          wait: 800,
          waitType: 'debounce',
        },
        onCancel: () => {
          supplierLovDS.loadData();
        },
      },
      beforeQuery: () => fetchSourceSupplierRelativeConfigData({ excludeSupplierDetailFlag: 1 }),
    }),
    [supplierLovDS, newBulkAddSupplier]
  );

  // supplier clear selected
  const supplierDSClearSelected = useCallback(() => {
    supplierDS.unSelectAll();
    supplierDS.clearCachedSelected();
  }, [supplierDS]);

  /**
   * delete supplier line
   * 先调用校验接口校验要删除的数据是否生成了报价
   * */
  const deleteLine = useCallback(
    throttle(async () => {
      const selectedData = supplierDS.selected;
      if (!selectedData?.length) {
        return;
      }

      const addData = []; // 新建record
      const oldData = []; // 保存 record
      const oldValidateData = []; // 保存过数据
      selectedData.forEach((record = {}) => {
        const rfxLineSupplierId = record.get('rfxLineSupplierId');

        if (!rfxLineSupplierId) {
          addData.push(record);
        }

        if (rfxLineSupplierId) {
          oldData.push(record);
          const data = record.toData();
          oldValidateData.push(data);
        }
      });

      if (addData.length) {
        supplierDS.remove(addData, 1);
      }

      if (!oldData.length) {
        return;
      }

      let result = null;
      try {
        result = await wholeBatchDeleteSupplierLinesValid({
          data: oldValidateData,
          organizationId,
        });
        if (!result || (result && result?.field)) {
          notification.error();
          return;
        }

        let deleteMessage = intl
          .get('ssrc.common.view.delete_selected_row_confirm')
          .d('确认删除选中行？');
        if (Array.isArray(result) && !isEmpty(result)) {
          const supplierCompanyNames = [];
          result.forEach((supplier = {}) => {
            const { supplierCompanyName } = supplier || {};
            if (supplierCompanyName) {
              supplierCompanyNames.push(supplierCompanyName);
            }
          });
          const suppliers = supplierCompanyNames.join() || '';
          deleteMessage = intl
            .get('ssrc.inquiryHall.view.confirm.wholeDeleteSuppliersHasQuotated', {
              suppliers,
            })
            .d(`供应商${suppliers}的报价信息将进行删除，是否确认`);
        }

        supplierDS.delete(oldData, {
          title: intl.get('ssrc.common.message.tip').d('提示'),
          contentStyle: {
            minWidth: '600px',
            wordBreak: 'break-all',
          },
          children: deleteMessage,
          onCancel: supplierDSClearSelected,
        });
      } catch (e) {
        throw e;
      }
    }, 800),
    [supplierDS, supplierDSClearSelected]
  );

  // create
  const createLine = useCallback(
    throttle(() => {
      const data = {
        rfxHeaderId,
        tenantId: organizationId,
        status: 'update',
      };

      supplierDS.create(data, 0);
    }, 500),
    [supplierDS, rfxHeaderId, organizationId]
  );

  // save line
  const saveLine = useCallback(
    throttle(async () => {
      supplierDS.forEach((itemLine) => {
        // eslint-disable-next-line no-param-reassign
        itemLine.status = 'update';
      });

      const validateFlag = await supplierDS.validate(true);
      if (!validateFlag) {
        return;
      }

      try {
        let result = await supplierDS.submit();
        result = getResponse(result);
        if (!result || !result.success) {
          return;
        }
      } catch (e) {
        throw e;
      }
    }, 800),
    [supplierDS, queryLine]
  );

  // change contact
  // const changeContact = (val = {}, record = {}) => {
  //   const {
  //     mobilephone = null,
  //     mail = null,
  //     name: contactName = null,
  //     companyContactId = null,
  //     internationalTelCode = null,
  //   } = val || {};

  //   record.set({
  //     supplierContactId: { supplierContactId: companyContactId, contactName },
  //     contactName,
  //     contactMobilephone: mobilephone,
  //     internationalTelCode,
  //     contactMail: mail,
  //   });
  // };

  // table button
  const getBtns = useCallback(() => {
    const supplierLovQueryData = { companyId };

    const buttons = [
      <Button
        icon="playlist_add"
        onClick={createLine}
        name="create"
        hidden={!allowInputSupplierNameFlag}
      >
        {intl.get('hzero.common.button.add').d('新增')}
      </Button>,
      <SupplierLov {...supplierLovProps} queryData={supplierLovQueryData} disabled={!companyId}>
        {intl.get('ssrc.inquiryHall.model.inquiryHall.button.bulkAddSupplier').d('批量添加供应商')}
      </SupplierLov>,
      <TooltipButtonPro
        onClick={deleteLine}
        disabled={!supplierDS?.selected?.length}
        icon="delete_sweep"
        name="delete"
        funcType="flat"
        help={intl
          .get('ssrc.common.view.message.supplier-line.select.tip')
          .d('请先勾选供应商行')}
      >
        {intl.get(`hzero.common.button.batchdelete`).d('批量删除')}
      </TooltipButtonPro>,
      <TooltipButtonPro
        icon="save"
        disabled={!companyId || (!supplierDS?.length && !supplierDS?.cachedCreated?.length)}
        onClick={saveLine}
        name="save"
        help={intl
          .get('ssrc.common.view.message.supplier-line.add.tip')
          .d('请先新增供应商行')}
      >
        {intl.get('hzero.common.button.save').d('保存')}
      </TooltipButtonPro>,
    ].filter(Boolean);
    return buttons;
  }, [
    allowInputSupplierNameFlag,
    companyId,
    supplierLovProps,
    supplierDS,
    deleteLine,
    createLine,
    saveLine,
  ]);

  // supplier lov select data on ok
  const supplierLovOk = useCallback(
    (options = {}) => {
      const CurrentRecord = supplierDS?.current;
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
    [supplierDS]
  );

  // select lov update current line fields
  const updateCurrentLineFields = (supplierLovSelectedData = {}, CurrentRecord = {}) => {
    if (!CurrentRecord) {
      return;
    }

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
      stageName = null,
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
    });
    CurrentRecord.set('supplierId', supplierId);
    CurrentRecord.set('supplierName', supplierName);
    CurrentRecord.set('supplierNum', supplierNum);
    CurrentRecord.set('supplierCompanyName', {
      supplierCompanyName: supplierCompanyName || supplierName,
    });
    CurrentRecord.set('supplierContactId', { supplierContactId, contactName: name });
    CurrentRecord.set('contactName', name);
    CurrentRecord.set('contactMobilephone', mobilephone);
    CurrentRecord.set('supplierType', supplierTypeText);
    CurrentRecord.set('contactMail', mail);
    CurrentRecord.set('internationalTelCode', internationalTelCode);
    CurrentRecord.set('supplierTenantId', supplierTenantId);
    CurrentRecord.set('stageDescription', stageName);
  };

  // supplier lov props constructor
  const getSupplierLovProps = useCallback(
    (options = {}) => {
      const queryData = {
        companyId,
      };

      const supplierLovFieldProps = {
        clearButton: true,
        noCache: true,
        modalProps: {
          style: { maxWidth: '1200px', width: '800px' },
          onOk: supplierLovOk,
        },
        onChange: supplierLovClear,
        disabled: !companyId,
        beforeQuery: () => fetchSourceSupplierRelativeConfigData({ excludeSupplierDetailFlag: 1 }),
      };

      return {
        queryData, // 初始化查询参数 body payload
        ...supplierLovFieldProps,
        ...options,
      };
    },
    [companyId, supplierLovOk, fetchSourceSupplierRelativeConfigData, supplierLovClear]
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

  // supplier lov change value
  const supplierLovClear = useCallback(
    (value) => {
      const CurrentRecord = supplierDS?.current;
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
    [supplierDS]
  );

  const getColumns = useCallback(() => {
    return [
      {
        name: 'supplierCompanyId',
        width: 180,
        editor: () => {
          const { ...resetProps } = getSupplierLovProps() || {};
          return (
            <SupplierLov
              {...resetProps}
              dataSet={supplierDS}
              valueChangeAction="input"
              restrict="\S"
            />
          );
        },
      },
      {
        name: 'supplierCompanyName',
        editor: (record) => {
          const { ...supplierCompanyNameResetProps } = getSupplierNameLovProps() || {};
          const { supplierCompanyNum } = record.get('supplierCompanyId') || {};
          return supplierCompanyNum || !allowInputSupplierNameFlag ? (
            false
          ) : (
            <SupplierLov
              {...supplierCompanyNameResetProps}
              name="supplierCompanyName"
              dataSet={supplierDS}
              combo
              valueChangeAction="input"
              restrict="\S"
            />
          );
        },
      },
      // {
      //   name: 'supplierContactId',
      //   width: 150,
      //   editor: (record) => {
      //     return (
      //       <Lov
      //         name="supplierContactId"
      //         record={record}
      //         onChange={(val) => changeContact(val, record)}
      //       />
      //     );
      //   },
      // },
      // {
      //   name: 'contactWrap',
      //   width: 150,
      //   className: 'ssrc-mobile-wrapper-container',
      //   renderer: ({ record }) => {
      //     const { supplierCompanyNum } = record.get('supplierCompanyId') || {};
      //     if (supplierCompanyNum) {
      //       return (
      //         <Lov
      //           name="supplierContactId"
      //           record={record}
      //           onChange={(val) => changeContact(val, record)}
      //           style={{
      //             height: '0.28rem',
      //             lineHeight: '0.26rem',
      //             paddingTop: 0,
      //           }}
      //         />
      //       );
      //     }

      //     return (
      //       <TextField
      //         name="contactName"
      //         record={record}
      //         style={{
      //           height: '0.28rem',
      //           lineHeight: '0.26rem',
      //           paddingTop: 0,
      //         }}
      //       />
      //     );
      //   },
      // },
      {
        name: 'contactName',
        width: 160,
        editor: true,
      },
      {
        name: 'contactMobilephone',
        width: 180,
        editor: true,
      },
      {
        name: 'contactMail',
        width: 180,
        editor: true,
      },
    ].filter(Boolean);
  }, [doubleUnitFlag, getSupplierLovProps, allowInputSupplierNameFlag, getSupplierNameLovProps]);

  return (
    <div style={{ marginBottom: '16px' }}>
      <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
        <div className={Styles['ssrc-border-left-line']} />
        {intl.get(`ssrc.common.supplier`).d('供应商')}
      </h3>

      <Spin spinning={loading}>
        {customizeTable(
          { code: customizeUnitCode, buttonCode: btnCustomizeUnitCode },
          <Table
            bordered
            custLoading={custLoading}
            dataSet={supplierDS}
            rowKey="rfxLineSupplierId"
            columns={getColumns()}
            buttons={getBtns()}
            style={{ maxHeight: '40vh' }}
            className={Styles['ssrc-whole-supplier-modal-wrap']}
          />
        )}
      </Spin>
    </div>
  );
};

export default observer(Suppliers);
