/*
 * @Description: file content
 * @Date: 2022-02-15 21:25:16
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import { stringify } from 'querystring';
import React, {
  Fragment,
  useContext,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  useState,
} from 'react';
import { Modal, Tooltip, useModal } from 'choerodon-ui/pro';
import { Icon, Tabs } from 'choerodon-ui';
import { observer } from 'mobx-react';
import { isEmpty } from 'lodash';
import { checkPrintWindow, getPdfPreviewUrl } from 'srm-front-boot/lib/utils/utils';

import intl from 'utils/intl';
import { SRM_SSTA } from '_utils/config';
import notification from 'utils/notification';
import ExcelExport from 'components/ExcelExport';
import { Header, Content } from 'components/Page';
import ExcelExportPro from 'components/ExcelExportPro';
import PrintProButton from '_components/PrintProButton';
import NewCommonImport from 'components/Import';
import DynamicButtons from '_components/DynamicButtons';
import { getResponse, filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';

import styles from '@/routes/common.less';
import {
  formatDynamicBtns,
  getValidationResponse,
  transformQselectDate,
  transformSupplierData,
} from '@/utils/utils';
import {
  printList,
  syncPrintData,
  confirmValidate,
  confirmPurchaseSettle,
  confirmPurchaserCancel,
  confirmPurchaserDelete,
  fetchInvoicePlatformRed,
} from '@/services/settlePoolServices';
import { getBusinessRules } from '@/services/invoicePurPoolService';
import { getCustomValidationResponse } from '@/components/CustomValidation';
import { Store } from './StoreProvider';
import WholeTable from './components/WholeTable';
import DetailTable from './components/DetailTable';
import FilledListInfoModal from './components/FilledListInfoModal';
import Create from './Create';
import { useModalOpen } from './hooks';
import DynamicBtn from '@/components/DynamicBtn';
import QuoteCreatePrePay from './PrePayment/QuoteCreate';
import { handleViewBatchNum } from './BatchSubmit/modal';
import { handleViewTaskProgress } from '@/routes/ExecutionProgress/modal';

export const createTypeMap = {
  invCreate: { settleType: 'INVOICE', baseAffairFlag: true }, // 先事务后发票
  invAdvanceCreate: { settleType: 'INVOICE', baseAffairFlag: true, advanceInvFlag: true }, // 先发票后事务
  payCreateBaseAffair: { settleType: 'PAYMENT', baseAffairFlag: true },
  payCreateBaseInv: { settleType: 'PAYMENT', baseInvFlag: true },
  payIncludeInvCreateBaseAffair: { settleType: 'INVOICE_PAYMENT', baseAffairFlag: true },
};

const { TabPane, TabGroup } = Tabs;
const organizationId = getCurrentOrganizationId();
const prefix = `${SRM_SSTA}/v1/${organizationId}`;
const detailExportSuffix = {
  invoice: 'settle-lines/invoice',
  payment: 'settle-lines/payment',
  prepayment: 'pre-payment-lines',
  demension: 'settle-lines/mutil-payment',
};
const exportModelCode = {
  all: 'SSTA_SETTLE_HEADER_PURCHASE_ALL_EXPORT',
  update: 'SSTA_SETTLE_HEADER_PURCHASE_UPDATE_EXPORT',
  approve: 'SSTA_SETTLE_HEADER_PURCHASE_APPROVE_EXPORT',
  cancel: 'SSTA_SETTLE_HEADER_PURCHASE_CANCEL_EXPORT',
  sync: 'SSTA_SETTLE_HEADER_PURCHASE_SYNC_EXPORT',
  invoice: 'SSTA_SETTLE_LINE_PURCHASE_EXPORT',
  payment: 'SSTA_SETTLE_LINE_PURCHASE_PAYMENT_EXPORT',
  prepayment: 'SSTA_SETTLE_LINE_PURCHASE_PREPAYMENT_EXPORT',
  demension: 'SSTA_SETTLE_LINE_PURCHASE_DEMENSION_EXPORT',
};

const List = () => {
  const {
    dsMap,
    history,
    detailKeys,
    urlActiveKey,
    permissionMap,
    defaultActiveKey,
    customizeTabPane,
    customizeBtnGroup,
    fetchTabKeysCount,
    createTitleMap,
    cacheState,
    location,
    remoteProps,
  } = useContext(Store);
  const initRecords = useRef({});
  const modalOpen = useModalOpen(useModal());
  const [activeKey, setActiveKey] = useState(defaultActiveKey);
  const [enableDirInvFlag, setEnableDirInvFlag] = useState(false);

  const tableDs = dsMap[activeKey];
  const { selected } = tableDs;
  const loading = tableDs.status !== 'ready';
  const detailFlag = detailKeys.includes(activeKey);
  const batchApproveModal = useRef();

  useEffect(() => {
    if (urlActiveKey) {
      setActiveKey(urlActiveKey);
    }
  }, [urlActiveKey]);

  useEffect(() => {
    fetchEnableDirInvConfig();
  }, [fetchEnableDirInvConfig]);

  const fetchEnableDirInvConfig = useCallback(async () => {
    const res = getResponse(await getBusinessRules({ cnfCode: 'SITE.SSTA.ENABLE_DIRECT_INVOICE' }));
    if (res) {
      setEnableDirInvFlag(Boolean(res));
    }
  }, [setEnableDirInvFlag]);

  useEffect(() => {
    // 埋点
    if (remoteProps && remoteProps.event) {
      remoteProps.event.fireEvent('onMountCux', {
        location,
        handleCreate,
        handleCreatePrePayment,
      });
    }
  }, [location, remoteProps, handleCreate, handleCreatePrePayment]);

  const fetchTotalCount = useCallback(
    (countTabKeys = [activeKey]) => {
      fetchTabKeysCount(countTabKeys);
    },
    [fetchTabKeysCount, activeKey]
  );

  const handleTabChange = useCallback(
    (value) => {
      setActiveKey(value);
      const currentTableDs = dsMap[value];
      if (initRecords.current[value]) currentTableDs.query(currentTableDs.currentPage);
      fetchTabKeysCount([value]);
      cacheState.set('activeKey', value);
    },
    [dsMap, fetchTabKeysCount, cacheState]
  );
  // 新建预付款结算单
  const handleCreatePrePayment = useCallback(
    (mode) => {
      if (mode === 'quote') {
        Modal.open({
          drawer: true,
          closable: true,
          title: intl
            .get('ssta.common.view.title.quoteDoToCreatePrePayApply')
            .d('引用单据创建预付款申请'),
          className: styles['ssta-large-modal'],
          children: <QuoteCreatePrePay history={history} permissionMap={permissionMap} />,
          footer: null,
        });
      } else {
        history.push({
          pathname: '/ssta/new-purchase-settle/pre-payment-create',
          search: stringify({
            source: 'create',
            documentType: 'PREPAYMENT',
          }),
        });
      }
    },
    [history, permissionMap]
  );

  // 新建发票、付款申请结算单
  const handleCreate = useCallback(
    async (createProps) => {
      const { settleType } = createProps;
      Object.assign(createProps, {
        history,
        onQueryList: async (clearCache) => {
          fetchTotalCount();
          tableDs.query(undefined, undefined, !clearCache);
        },
      });
      Object.assign(createProps, {
        history,
        onQueryList: async (clearCache) => {
          fetchTotalCount();
          tableDs.query(undefined, undefined, !clearCache);
        },
      });
      Modal.open({
        drawer: true,
        closable: true,
        title: createTitleMap[settleType],
        className: styles['ssta-large-modal'],
        bodyStyle: { paddingTop: 0, paddingBottom: 0 },
        children: <Create {...createProps} />,
        footer: null,
      });
    },
    [history, createTitleMap, tableDs, fetchTotalCount]
  );

  const handleCustMessage = useCallback(
    (e) => {
      if (e?.origin === window.location.origin) {
        if (e?.data?.type === 'createPayIncludeInvWithParams') {
          handleCreate({
            ...createTypeMap.payIncludeInvCreateBaseAffair,
            extraParams: e.data.payload,
          });
        }
      }
    },
    [handleCreate]
  );

  useEffect(() => {
    window.addEventListener('message', handleCustMessage);
    return () => {
      window.removeEventListener('message', handleCustMessage);
    };
  }, [handleCustMessage]);

  const handleAfterCloseExcel = useCallback(() => {
    tableDs.query(undefined, undefined, false);
    fetchTotalCount();
  }, [tableDs, fetchTotalCount]);

  const handleSync = useCallback(async () => {
    const res = await tableDs.setState('submitType', 'sync').submit();
    if (!res) return;
    getValidationResponse(res.content[0], (onlyReFresh) => {
      tableDs.query();
      if (onlyReFresh) return;
      tableDs.batchUnSelect(selected);
      fetchTotalCount();
    });
  }, [tableDs, selected, fetchTotalCount]);

  const handleConfirm = useCallback(
    async (info = {}, infoCode = '') => {
      const validateOk = async () => {
        const { customizeUnitCode = '' } = tableDs.queryParameter;
        const res = getResponse(
          await confirmPurchaseSettle({
            body: selectData,
            isOnlyPre: !hasNotPre,
            ...tableDs.queryParameter,
            customizeUnitCode: `${customizeUnitCode},${infoCode}`,
          })
        );
        tableDs.status = 'ready';
        if (!res) return;
        if (remoteProps) {
          remoteProps.event.fireEvent('batchConfirmCuxCallback', {
            tableDs,
            selectData,
          });
        }
        notification.success();
        tableDs.query(undefined, undefined, false);
        fetchTotalCount();
      };
      const checkWarn = () => {
        const validateWarnIndex = results.findIndex(
          (item) => item && item.validatedCode === 'WARNING'
        );
        if (validateWarnIndex > -1) {
          Modal.confirm({
            title: intl.get('ssta.common.view.message.tip').d('提示'),
            children: results[validateWarnIndex].msg,
            autoCenter: true,
            onOk: () => {
              results.splice(validateWarnIndex, 1, {});
              return checkWarn();
            },
            onCancel: () => {
              results.splice(validateWarnIndex, 1);
              selectData.splice(validateWarnIndex, 1);
              tableDs.status = 'ready';
              return checkWarn();
            },
          });
        } else if (selectData.length > 0) {
          return validateOk();
        }
      };
      const selectData = tableDs.toJSONData().map((item) => {
        // 把弹框内容加到每个item里面
        return { ...item, ...info };
      });
      const hasPre = selectData.some((item) => item.documentType === 'PREPAYMENT');
      const hasNotPre = selectData.some((item) => item.documentType !== 'PREPAYMENT');
      // 预付款与其他结算单类型确认接口区分
      if (hasPre && hasNotPre) {
        notification.warning({
          message: intl.get('hzero.common.notification.error').d('操作失败'),
          description: intl
            .get('ssta.purchaseSettle.view.message.documentTypeDifferent')
            .d('请勾选同一结算单类型单据进行批量操作'),
        });
        return;
      }
      tableDs.status = 'loading';
      const results = await Promise.all(
        selectData.map((item) =>
          ['SUBMITED', 'WAIT_SUPPLIER_CONFIRM'].includes(item.settleStatus)
            ? confirmValidate({ body: item, role: 'purchaser' })
            : {}
        )
      );
      const err = results.find((item) => item && item.failed === true);
      const validateErr = results.find((item) => item && item.validatedCode === 'ERROR');
      if (err) {
        getResponse(err);
        tableDs.status = 'ready';
      } else if (validateErr) {
        tableDs.status = 'ready';
        notification.error({
          message: intl.get('hzero.common.notification.error').d('操作失败'),
          description: validateErr.msg,
        });
      } else {
        return checkWarn();
      }
    },
    [tableDs, fetchTotalCount]
  );

  const getQueryParams = useCallback(
    (splitFlag) => {
      const queryData = tableDs.queryDataSet?.current?.toData() || {};
      const { settleNums } = queryData;
      return filterNullValueObject({
        ...queryData,
        ...transformQselectDate(queryData, { dateRange: 'creationDate' }),
        ...transformSupplierData(queryData.supplierCompanyId),
        ...tableDs.queryParameter,
        action: activeKey.toUpperCase(),
        settleNums: settleNums && (splitFlag ? settleNums.split(',') : settleNums),
      });
    },
    [activeKey, tableDs]
  );

  const getSelectedKeys = useCallback(() => {
    const {
      props: { primaryKey },
      queryParameter,
    } = tableDs;
    const rowKeysPropName =
      primaryKey === 'settleHeaderId' ? `${primaryKey}s` : `${primaryKey}List`;
    return {
      ...queryParameter,
      action: activeKey.toUpperCase(),
      [rowKeysPropName]: selected.map((record) => record.get(primaryKey)),
    };
  }, [activeKey, tableDs, selected]);

  const getEcInvBatchCancelInfo = useCallback(() => {
    const withCancelEcSettleNumList = [];
    const withoutCancelEcSettleNumList = [];
    tableDs.selected.forEach((record) => {
      const {
        settleNum,
        settleType,
        settleStatus,
        directInvoicingType,
        invoiceMatchRuleCode,
        invoiceSettleCancelFlag,
      } = record.get([
        'settleNum',
        'settleType',
        'settleStatus',
        'directInvoicingType',
        'invoiceMatchRuleCode',
        'invoiceSettleCancelFlag',
      ]);
      if (
        settleType === 'INVOICE' &&
        ['INVOICE_EXCEPTION', 'INVOICE_SUCCESS', 'CONFIRM'].includes(settleStatus) &&
        invoiceMatchRuleCode === 'DIRECT_INVOICING' &&
        directInvoicingType === 'EC'
      ) {
        if (Number(invoiceSettleCancelFlag) === 1) {
          withCancelEcSettleNumList.push(settleNum);
        } else {
          withoutCancelEcSettleNumList.push(settleNum);
        }
      }
    });
    const withCancelMessage =
      !isEmpty(withCancelEcSettleNumList) &&
      intl
        .get('ssta.common.view.message.autoRedOffsetTaxInvoiceBatchTip', {
          settleNums: withCancelEcSettleNumList.join('、'),
        })
        .d(
          '结算单【{settleNums}】关联的结算策略配置票单同步取消，您取消发票结算单成功后，将自动红冲税票'
        );
    const withoutCancelMessage =
      !isEmpty(withoutCancelEcSettleNumList) &&
      intl
        .get('ssta.common.view.message.offlineProcessSyncCancelBatchTip', {
          settleNums: withoutCancelEcSettleNumList.join('、'),
        })
        .d(
          '您当前正发起取消发票结算单，结算单【{settleNums}】关联的结算策略未配置票单同步取消，srm取消成功后，需要您线下联系电商人员处理对方系统单据，否则将会阻塞您下次线上直连开票流程'
        );
    let message;
    if (withCancelMessage && withoutCancelMessage) {
      message = `${withoutCancelMessage}；${withCancelMessage}`;
    } else if (withCancelMessage) {
      message = withCancelMessage;
    } else if (withoutCancelMessage) {
      message = withoutCancelMessage;
    }
    return { ecInvCancelMsg: message, withCancelEcSettleFlag: !isEmpty(withCancelEcSettleNumList) };
  }, [tableDs]);

  // 在做取消回退相关操作之前先弹框确认
  const operateBeforeConfirm = useCallback(
    async (type, onOk) => {
      const settleTypeList = selected.map((item) => item.get('settleType'));
      const settleStatusList = selected.map((item) => item.get('settleStatus'));
      const settleList = Array.from(new Set(settleTypeList));
      const statusList = Array.from(new Set(settleStatusList));
      let redList = [];

      const openFilledInfoModal = () => {
        modalOpen({
          editFlag: true,
          size: !isEmpty(redList) ? 'middle' : 'small',
          title: ['CANCEL', 'DELETE'].includes(type)
            ? intl.get(`ssta.purchaseSettle.view.title.cancelInfo`).d('取消信息')
            : intl.get(`ssta.purchaseSettle.view.title.approveInfo`).d('审核信息'),
          children: (
            <FilledListInfoModal
              onOk={onOk}
              action={type}
              selected={selected}
              settleType={settleList[0]}
              settleStatus={statusList[0]}
              getEcInvBatchCancelInfo={getEcInvBatchCancelInfo}
              enableDirInvFlag={enableDirInvFlag}
              redList={redList}
            />
          ),
        });
      };
      if (['CONFIRM', 'RETURN', 'CANCEL'].includes(type)) {
        if (settleList.length > 1) {
          notification.error({
            message: intl.get('hzero.common.notification.error').d('操作失败'),
            description: intl
              .get('ssta.common.view.message.diffSettleTypeError')
              .d('当前勾选结算单「结算单类型」不一致，请勾选类型一致的结算单进行批量操作'),
          });
          return;
        }
        if (statusList.length > 1) {
          notification.error({
            message: intl.get('hzero.common.notification.error').d('操作失败'),
            description: intl
              .get('ssta.common.view.message.diffSettleStatusError')
              .d('当前勾选结算单「结算单状态」不一致，请勾选状态一致的结算单进行批量操作'),
          });
          return;
        }
        const settleHeaderIdList = selected
          ?.filter(
            (v) =>
              v?.get('documentType') === 'INVOICE' &&
              v?.get('settleStatus') === 'CONFIRM' &&
              v?.get('directInvoicingType') === 'INVOICE_PLATFORM' &&
              v?.get('invoiceMatchRuleCode') === 'DIRECT_INVOICING' &&
              Number(v?.get('invoiceSettleCancelFlag')) === 1
          )
          .map((v) => v?.get('settleHeaderId'));
        if (enableDirInvFlag && !isEmpty(settleHeaderIdList) && type === 'CANCEL') {
          tableDs.status = 'loading';
          const res = getResponse(await fetchInvoicePlatformRed({ settleHeaderIdList }));
          tableDs.status = 'ready';
          if (!res) return;
          redList = res;
        }
        openFilledInfoModal();
      } else if (type === 'DELETE') {
        const { ecInvCancelMsg, withCancelEcSettleFlag } = getEcInvBatchCancelInfo();
        if (ecInvCancelMsg && withCancelEcSettleFlag) {
          openFilledInfoModal();
        } else {
          return onOk();
        }
      }
    },
    [selected, modalOpen, getEcInvBatchCancelInfo, enableDirInvFlag, tableDs]
  );

  // const handleRedInvConfirmInfo = useCallback(
  //   async (okCallback) => {
  //     const settleHeaderIdList = selected.map((record) => record.get('settleHeaderId'));
  //     modalOpen({
  //       editFlag: true,
  //       size: 'medium',
  //       title: intl
  //         .get('ssta.common.view.title.entryRedInvFormAndconfirmationCode')
  //         .d('红字发票表/确认单编码录入'),
  //       children: (
  //         <RedInvConfirmInfo settleHeaderIdList={settleHeaderIdList} okCallback={okCallback} />
  //       ),
  //     });
  //   },
  //   [modalOpen, selected]
  // );

  const handleDelete = useCallback(
    async (filledInfo = {}) => {
      const validateOk = async () => {
        const res = await tableDs
          .setState('submitType', 'delete')
          .setState('filledParams', { filledInfo })
          .submit();
        if (!res) return false;
        tableDs.query(undefined, undefined, false);
        fetchTotalCount();
      };
      const handleDeleteOpr = async () => {
        tableDs.status = 'loading';
        const res = getResponse(
          await confirmPurchaserDelete({
            body: tableDs.toJSONData(),
            ...tableDs.queryParameter,
          })
        );
        tableDs.status = 'ready';
        if (!res) return false;
        const { validatedCode, msg } = res;
        if (validatedCode === 'WARNING') {
          Modal.confirm({
            title: intl.get('ssta.common.view.message.tip').d('提示'),
            children: msg,
            onOk: () => {
              return validateOk();
            },
          });
          return false;
        } else if (validatedCode === 'ERROR') {
          notification.error({
            message: intl.get('hzero.common.notification.error').d('操作失败'),
            description: msg,
          });
          return false;
        } else {
          return validateOk();
        }
      };
      // 发票已退回取消红冲弹框
      const handleRedInv = async () => {
        const settleHeaderIdList = selected
          ?.filter(
            (v) =>
              v?.get('documentType') === 'INVOICE' &&
              v?.get('settleStatus') === 'RETURN' &&
              v?.get('directInvoicingType') === 'INVOICE_PLATFORM' &&
              v?.get('invoiceMatchRuleCode') === 'DIRECT_INVOICING' &&
              Number(v?.get('invoiceSettleCancelFlag')) === 1
          )
          .map((v) => v?.get('settleHeaderId'));
        if (enableDirInvFlag && !isEmpty(settleHeaderIdList)) {
          tableDs.status = 'loading';
          const res = getResponse(await fetchInvoicePlatformRed({ settleHeaderIdList }));
          tableDs.status = 'ready';
          if (!res) return;
          if (isEmpty(res)) handleDeleteOpr();
          else {
            modalOpen({
              editFlag: true,
              size: 'middle',
              title: intl.get(`ssta.purchaseSettle.view.title.cancelInfo`).d('取消信息'),
              children: (
                <FilledListInfoModal
                  onOk={handleDeleteOpr}
                  action="DELETE"
                  selected={selected}
                  settleType="INVOICE"
                  settleStatus="RETURN"
                  enableDirInvFlag={enableDirInvFlag}
                  redList={res}
                  isDelete
                />
              ),
            });
          }
        } else handleDeleteOpr();
      };

      const settleNumStr = selected
        .map((record) => `${record.get('settleTypeMeaning')}${record.get('settleNum')}`)
        .join();
      const message = (
        <span>
          <span>{intl.get('ssta.purchaseSettle.view.message.confirm').d('确定要')}</span>
          <span>{intl.get('hzero.common.button.cancel').d('取消')}</span>
          <span>{settleNumStr}</span>
        </span>
      );
      const validateSelect = await tableDs.validate();
      if (!validateSelect) return false;
      const { ecInvCancelMsg } = getEcInvBatchCancelInfo();
      if (remoteProps) {
        const beforeCancelRes = await remoteProps.event.fireEvent('beforeCancel', {
          tableDs,
          modalOpen,
        });
        if (beforeCancelRes === false) return false;
      }
      const confirmMsg = remoteProps
        ? remoteProps.process(
            'SSTA_PURCHASESETTLE_LIST.CANCEL_CONFIRM_TIPS',
            ecInvCancelMsg || message,
            {
              tableDs,
            }
          )
        : ecInvCancelMsg || message;
      const res = await Modal.confirm({
        title: intl.get('ssta.common.view.message.tip').d('提示'),
        children: confirmMsg,
        onOk: handleRedInv,
      });
      return res === 'ok';
    },
    [
      modalOpen,
      tableDs,
      selected,
      fetchTotalCount,
      getEcInvBatchCancelInfo,
      remoteProps,
      enableDirInvFlag,
    ]
  );

  const handleCancel = useCallback(
    async (filledInfo = {}, filledInfoCode = '') => {
      const validateOk = async () => {
        const res = await tableDs
          .setState('submitType', 'cancel')
          .setState('filledParams', {
            filledInfo,
            filledInfoCode,
          })
          .submit();
        if (!res) return false;
        tableDs.query(undefined, undefined, false);
        fetchTotalCount();
      };
      const handleCancelOpr = async () => {
        tableDs.status = 'loading';
        const res = getResponse(
          await confirmPurchaserCancel({
            body: tableDs.toJSONData().map((item) => ({
              ...item,
              ...filledInfo,
            })),
            ...tableDs.queryParameter,
          })
        );
        tableDs.status = 'ready';
        if (!res) return false;
        const { validatedCode, msg } = res;
        if (validatedCode === 'WARNING') {
          Modal.confirm({
            title: intl.get('ssta.common.view.message.tip').d('提示'),
            children: msg,
            onOk: () => {
              return validateOk();
            },
          });
          return false;
        } else if (validatedCode === 'ERROR') {
          notification.error({
            message: intl.get('hzero.common.notification.error').d('操作失败'),
            description: msg,
          });
          return false;
        } else {
          return validateOk();
        }
      };
      const validateSelect = await tableDs.validate();
      if (!validateSelect) return false;
      const { ecInvCancelMsg } = getEcInvBatchCancelInfo();
      if (!ecInvCancelMsg) return handleCancelOpr();
      const res = await Modal.confirm({
        title: intl.get('ssta.common.view.message.tip').d('提示'),
        children: ecInvCancelMsg,
        onOk: handleCancelOpr,
      });
      return res === 'ok';
    },
    [tableDs, fetchTotalCount, getEcInvBatchCancelInfo]
  );

  const handleReturn = useCallback(
    async (filledInfo = {}, filledInfoCode = '') => {
      const res = await tableDs
        .setState('submitType', 'return')
        .setState('filledParams', { filledInfo, filledInfoCode })
        .submit();
      if (!res) return;
      tableDs.query(undefined, undefined, false);
      fetchTotalCount();
    },
    [tableDs, fetchTotalCount]
  );

  const handleRepairInvBudgetWriteOff = useCallback(async () => {
    tableDs.dataToJSON = 'all';
    const res = await tableDs.setState('submitType', 'repairInvBudgetWriteOff').forceSubmit();
    tableDs.dataToJSON = 'selected';
    if (!res) return;
    tableDs.query();
  }, [tableDs]);

  const handlePrint = useCallback(async () => {
    const flag = checkPrintWindow();
    tableDs.status = 'loading';
    const selectData = tableDs.toJSONData();
    const settleHeaderIds = selectData.map((item) => item.settleHeaderId);
    const params = {
      list: settleHeaderIds,
      responseType: flag ? 'blob' : 'json',
      headers: flag ? {} : { 's-print-using-preview': '1' },
      menuCamp: 'PURCHASER',
    };
    const printRes = getResponse(await printList(params));
    if (!printRes) {
      tableDs.status = 'ready';
      return;
    }
    if (flag) {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const failedInfo = JSON.parse(reader.result);
          notification.error({
            description: failedInfo.message,
          });
          tableDs.status = 'ready';
        } catch (e) {
          const file = new Blob([printRes], { type: 'application/pdf' });
          const fileURL = URL.createObjectURL(file);
          window.open(fileURL);
          const syncRes = getResponse(await syncPrintData(selectData));
          tableDs.status = 'ready';
          if (!syncRes) return;
          notification.success();
          tableDs.query(undefined, undefined, false);
          fetchTotalCount();
        }
      };
      reader.readAsText(printRes);
    } else {
      // 添加如下代码
      const { fileUrl, bucketName, fileToken } = printRes || {};
      const url = await getPdfPreviewUrl({ fileUrl, bucketName, fileToken });
      window.open(url);
      const syncRes = getResponse(await syncPrintData(selectData));
      tableDs.status = 'ready';
      if (!syncRes) return;
      notification.success();
      tableDs.query(undefined, undefined, false);
      fetchTotalCount();
    }
  }, [tableDs, fetchTotalCount]);

  const handleNewPrintOkCallback = useCallback(async () => {
    tableDs.status = 'loading';
    const selectData = tableDs.toJSONData();
    const syncRes = getResponse(await syncPrintData(selectData));
    tableDs.status = 'ready';
    if (!syncRes) return;
    tableDs.query(undefined, undefined, false);
    fetchTotalCount();
  }, [tableDs, fetchTotalCount]);

  const handleBatchReSync = useCallback(async () => {
    const res = await tableDs.setState('submitType', 'batchReSync').forceSubmit();
    if (!res) return;
    tableDs.query();
  }, [tableDs]);

  const handleBathSubmitFinalAfterValidate = useCallback(
    async (options) => {
      const { handleBeforeSubmitFinal } = options || {};
      if (handleBeforeSubmitFinal) {
        const beforeSubmitFinalRes = await handleBeforeSubmitFinal();
        if (beforeSubmitFinalRes === false) return false;
      }
      const res = await tableDs.setState('submitType', 'batchSubmit').forceSubmit();
      if (!res) return false;
      if (batchApproveModal.current && batchApproveModal.current.close) {
        batchApproveModal.current.close();
      }
      await tableDs.query();
      fetchTotalCount();
      tableDs.clearCachedSelected();
      tableDs.unSelectAll();
      return true;
    },
    [tableDs, fetchTotalCount, batchApproveModal]
  );

  const handleBathSubmitFinal = useCallback(
    async (data, options) => {
      const res = await tableDs
        .setState('settleHeaderBatchApprove', data)
        .setState('submitType', 'batchValidate')
        .forceSubmit();
      if (!res) return false;
      const validatedResultDTO = res.content[0] || {};
      getCustomValidationResponse(
        validatedResultDTO,
        async (action) => {
          if (action === 'ok') {
            // 是点了弹框警告
            const res = await tableDs.setState('submitType', 'batchApproveCancel').forceSubmit();
            if (!res) return false;
          }
          handleBathSubmitFinalAfterValidate(options);
        },
        { okText: intl.get('ssta.common.view.message.sureDeleteBatchText').d('确认删除') }
      );
    },
    [tableDs, handleBathSubmitFinalAfterValidate]
  );

  const handleSubmitBatch = useCallback(async () => {
    // 需要显示出不符合条件的单号
    const list = selected
      ?.filter(
        (record) =>
          !(
            record?.get('settleType') === 'PAYMENT' &&
            ['NEW', 'RETURN'].includes(record?.get('settleStatus'))
          )
      )
      ?.map((record) => record?.get('settleNum'));
    if (list.length === 0) {
      // 提交（生产批次）二开校验
      const confirmMsg = remoteProps
        ? remoteProps.process(
            'SSTA_PURCHASESETTLE_LIST.SUBMIT_BATCH_TIPS',
            selected.map((item) => item.toData())
          )
        : { errorFlag: false, message: undefined };
      if (confirmMsg.errorFlag) {
        notification.error({
          description: confirmMsg.message,
        });
        return;
      }
      const confirmRes = await Modal.confirm({
        title: intl.get('ssta.common.view.message.tip').d('提示'),
        children: intl
          .get('ssta.common.view.help.batchSubmitConfirm', { length: selected?.length })
          .d('是否确认将勾选的{length}单结算单创建批次发起审批?'),
      });
      if (confirmRes !== 'ok') return;
      const res = await tableDs.setState('submitType', 'batchInsert').forceSubmit();
      if (!res) return;
      // 更新列表里面的批次号，避免直接关闭弹框，批次号没更新，点单号进去是上个批次号
      const { content } = res;
      const { batchId, batchNum } = content[0] || {};
      if (!batchId) return;
      tableDs.selected.forEach((item) => {
        item.init({ batchApproveId: batchId, batchApproveNum: batchNum });
      });
      tableDs.setState('batchApproveId', batchId);
      // 提交校验
      const response = await tableDs.setState('submitType', 'batchSubmitValidate').forceSubmit();
      if (!response) return;
      const contentValidate = response.content || [];
      // 失败的校验数据
      const failedList = contentValidate?.filter((item) => item?.validatedCode === 'ERROR');
      // 警告数据
      const warnList = contentValidate?.filter((item) => item?.validatedCode === 'WARNING');
      if (!isEmpty(failedList)) {
        notification.error({
          message: intl.get('hzero.common.notification.error').d('操作失败'),
          description: failedList?.map((item) => item?.msg).join('\n'),
          style: {
            whiteSpace: 'pre-line',
          },
        });
        return false;
      } else {
        // 如果是批次提交 调用批次提交接口
        getCustomValidationResponse(
          {
            validatedCode: !isEmpty(warnList) ? 'WARNING' : 'SUCCESS',
            msg: warnList?.map((item) => item?.msg).join('\n'),
          },
          () => {
            batchApproveModal.current = handleViewBatchNum({
              batchApproveId: batchId,
              operate: 'edit',
              handleOk: handleBathSubmitFinal,
              remoteProps,
              listSelected: selected.map((item) => item.toData()),
            });
          }
        );
      }
    } else {
      notification.error({
        message: intl.get('ssta.common.view.message.tip').d('提示'),
        description: intl
          .get('ssta.common.view.message.batchSubmit.tip', {
            settleNums: list?.join('、'),
          })
          .d(
            '仅支持新建/已退回状态的付款申请结算单，且审批方式配置均为「工作流审批（以结算单批次发起）」或均为外部系统审批（以结算单批次发起）」的结算单合并生成批次提交，结算单{settleNums}不满足要求，请按重新勾选'
          ),
      });
    }
  }, [selected, tableDs, handleBathSubmitFinal, remoteProps]);

  const createBtns = useMemo(() => {
    return [
      permissionMap.get('updatePane') &&
        permissionMap.get(`invoice`) && {
          name: 'invCreate',
          child: intl.get(`ssta.purchaseSettle.button.createInvoiceApply`).d('新建发票申请'),
          btnType: 'c7n-pro',
          btnProps: {
            loading,
            icon: 'add',
            onClick: () => handleCreate(createTypeMap.invCreate),
          },
        },
      // 不能通过个性化来控制聚合，ui无法兼容，且因为所有租户都分配了权限集，无法修改为权限集控制
      permissionMap.get('updatePane') &&
        permissionMap.get(`invoiceAdvance`) && {
          name: 'invAffairCreate',
          group: true,
          child: (...customChildArgs) => (
            <DynamicBtn
              icon="add"
              loading={loading}
              customChildArgs={customChildArgs}
              extra={<Icon type="expand_more" style={{ fontSize: 14, margin: '-2px 0 0 4px' }} />}
              text={intl.get(`ssta.purchaseSettle.button.createInvoiceApply`).d('新建发票申请')}
            />
          ),
          children: [
            permissionMap.get(`invoiceAdvance`) && {
              name: 'invAdvanceCreate',
              child: intl.get(`ssta.purchaseSettle.button.invAdvanceAffair`).d('先发票后事务'),
              btnProps: {
                loading,
                icon: 'add',
                onClick: () => handleCreate(createTypeMap.invAdvanceCreate),
              },
            },
          ],
        },
      permissionMap.get('updatePane') &&
        (permissionMap.get(`payment`) ||
          permissionMap.get(`payInvoice`) ||
          permissionMap.get(`invoicePayment`)) && {
          name: 'payCreate',
          group: true,
          child: (...customChildArgs) => (
            <DynamicBtn
              icon="add"
              loading={loading}
              customChildArgs={customChildArgs}
              text={intl.get(`ssta.purchaseSettle.button.createPaymentApply`).d('新建付款申请')}
              extra={<Icon type="expand_more" style={{ fontSize: 14, margin: '-2px 0 0 4px' }} />}
            />
          ),
          children: [
            permissionMap.get(`payment`) && {
              name: 'payCreateBaseAffair',
              child: intl
                .get(`ssta.purchaseSettle.button.onlyPayApplyBaseAffair`)
                .d('付款申请（仅付款）-基于事务'),
              btnProps: {
                loading,
                icon: 'add',
                funcType: 'flat',
                onClick: () => handleCreate(createTypeMap.payCreateBaseAffair),
              },
            },
            permissionMap.get(`payInvoice`) && {
              name: 'payCreateBaseInv',
              child: intl
                .get(`ssta.purchaseSettle.button.onlyPayApplyBaseInvoice`)
                .d('付款申请（仅付款）-基于发票'),
              btnProps: {
                loading,
                icon: 'add',
                funcType: 'flat',
                onClick: () => handleCreate(createTypeMap.payCreateBaseInv),
              },
            },
            permissionMap.get(`invoicePayment`) && {
              name: 'payIncludeInvCreateBaseAffair',
              child: intl
                .get(`ssta.purchaseSettle.button.payApplyIncludeInvBaseAffair`)
                .d('付款申请（含发票）-基于事务'),
              btnProps: {
                loading,
                icon: 'add',
                funcType: 'flat',
                onClick: () => handleCreate(createTypeMap.payIncludeInvCreateBaseAffair),
              },
            },
          ],
        },
      permissionMap.get('updatePane') &&
        permissionMap.get(`prePayment`) &&
        !permissionMap.get(`prePaymentQuote`) &&
        !permissionMap.get(`prePaymentManual`) && {
          name: 'preCreate',
          child: intl.get(`ssta.purchaseSettle.button.prepaymentApplyCreate`).d('新建预付款申请'),
          btnProps: {
            loading,
            icon: 'add',
            onClick: handleCreatePrePayment,
          },
        },
      permissionMap.get('updatePane') &&
        permissionMap.get(`prePayment`) &&
        (permissionMap.get(`prePaymentQuote`) || permissionMap.get(`prePaymentManual`)) && {
          name: 'preCreateNew',
          group: true,
          child: (...customChildArgs) => (
            <DynamicBtn
              icon="add"
              loading={loading}
              customChildArgs={customChildArgs}
              text={intl
                .get(`ssta.purchaseSettle.button.prepaymentApplyCreate`)
                .d('新建预付款申请')}
              extra={<Icon type="expand_more" style={{ fontSize: 14, margin: '-2px 0 0 4px' }} />}
            />
          ),
          children: [
            permissionMap.get(`prePaymentQuote`) && {
              name: 'prePaymentQuote',
              child: intl.get(`ssta.common.button.createByQuoteDocument`).d('引用单据新建'),
              btnProps: {
                loading,
                icon: 'add',
                funcType: 'flat',
                onClick: () => handleCreatePrePayment('quote'),
              },
            },
            permissionMap.get(`prePaymentManual`) && {
              name: 'prePaymentManual',
              child: intl.get(`ssta.common.button.createManually`).d('手工新建'),
              btnProps: {
                loading,
                icon: 'add',
                funcType: 'flat',
                onClick: handleCreatePrePayment,
              },
            },
          ],
        },
    ];
  }, [loading, permissionMap, handleCreate, handleCreatePrePayment]);

  const wholeBtns = useMemo(() => {
    const isWorkflowSelected = selected.some((item) =>
      ['SUBMITED_APPROVING', 'CANCEL_APPROVING'].includes(item.get('settleStatus'))
    );
    const normalBtns = [
      activeKey === 'sync' && {
        name: 'sync',
        child: intl.get('hzero.common.button.sync').d('同步'),
        btnProps: {
          icon: 'sync',
          disabled: isEmpty(selected),
          loading,
          onClick: handleSync,
          wait: 1000,
        },
      },
      activeKey === 'cancel' && {
        name: 'cancel',
        child: intl.get('hzero.common.button.cancel').d('取消'),
        btnProps: {
          icon: 'cancel',
          disabled: isEmpty(selected),
          loading,
          onClick: () => operateBeforeConfirm('CANCEL', handleCancel),
          wait: 1000,
        },
      },
      permissionMap.get(`confirmBtn`) &&
        activeKey === 'approve' && {
          name: 'confirm',
          child: intl.get('hzero.common.button.confirm').d('确认'),
          btnProps: {
            icon: 'check',
            disabled: isEmpty(selected) || isWorkflowSelected,
            loading,
            onClick: () => operateBeforeConfirm('CONFIRM', handleConfirm),
            wait: 1000,
          },
        },
      permissionMap.get(`returnBtn`) &&
        activeKey === 'approve' && {
          name: 'return',
          child: intl.get('hzero.common.button.return').d('退回'),
          btnProps: {
            icon: 'reply',
            disabled: isEmpty(selected) || isWorkflowSelected,
            loading,
            onClick: () => operateBeforeConfirm('RETURN', handleReturn),
            type: 'c7n-pro',
            wait: 1000,
            dataSet: tableDs,
          },
        },
      ...createBtns,
      activeKey === 'update' && {
        name: 'delete',
        child: intl.get('hzero.common.button.cancel').d('取消'),
        btnProps: {
          icon: 'cancel',
          disabled: isEmpty(selected),
          loading,
          wait: 1000,
          onClick: () => operateBeforeConfirm('DELETE', handleDelete),
        },
      },
      activeKey === 'update' &&
        permissionMap.get(`submitBatch`) && {
          name: 'submitBatch',
          child: (
            <>
              {intl.get('ssta.common.view.button.submitBatch').d('提交（生成批次）')}
              <Tooltip
                title={intl
                  .get('ssta.common.view.button.submitBatchHelp')
                  .d(
                    '仅支持审批方式配置为「工作流审批（以结算单批次发起）/外部系统审批（以结算单批次发起）」的付款申请结算单生成批次提交'
                  )}
              >
                <Icon style={{ marginLeft: '4px', fontSize: '14px' }} type="help" />
              </Tooltip>
            </>
          ),
          btnProps: {
            icon: 'check',
            disabled: isEmpty(selected),
            loading,
            wait: 1000,
            onClick: handleSubmitBatch,
          },
        },
      permissionMap.get(`printListBtn`) && {
        name: 'print',
        child: intl.get('hzero.common.button.print').d('打印'),
        btnProps: {
          icon: 'print',
          disabled: isEmpty(selected),
          loading,
          onClick: handlePrint,
          wait: 1000,
        },
      },
      permissionMap.get(`newPrintListBtn`) && {
        name: 'newPrint',
        btnComp: PrintProButton,
        childFor: 'buttonText',
        child: intl.get('ssta.common.view.button.newPrint').d('(新)打印'),
        btnProps: {
          buttonProps: { funcType: 'flat', disabled: isEmpty(selected) },
          requestUrl: `${prefix}/settle-headers/list-print-new`,
          method: 'PUT',
          data: {
            settleHeaderIdList: selected.map((record) => record.get('settleHeaderId')),
            menuCamp: 'PURCHASER',
          },
          successCallBack: handleNewPrintOkCallback,
          loading,
        },
      },
      permissionMap.get(`invBudgetWriteOffRepair`) && {
        name: 'invBudgetWriteOffRepair',
        child: intl
          .get('ssta.purchaseSettle.view.button.invBudgetWriteOffBeginDataRepair')
          .d('发票预算核销期初数据修复'),
        btnProps: {
          icon: 'rotate_right',
          loading,
          wait: 1000,
          onClick: handleRepairInvBudgetWriteOff,
        },
      },
      permissionMap.get(`invoiceNewImport`) && {
        name: 'invoiceNewImport',
        btnComp: NewCommonImport,
        btnProps: {
          businessObjectTemplateCode: 'SSTA_INVOICE_HEADER_INFANCY',
          prefixPatch: '/ssta',
          buttonText: (
            <Tooltip
              title={intl
                .get('ssta.common.button.tooltipInfomation.invoiceApplyImport')
                .d(
                  '该功能仅供项目上线时，发票申请期初数据切换（不允许单价、税率、税额调整，导入成功即按结算策略配置生成发票申请结算单并自动提交，建议配置部分开票），切换完毕即收回，不可用于上线后用户使用'
                )}
              placement="bottom"
            >
              {intl.get('ssta.common.button.invoiceApplyImport').d('发票申请期初EXCEL导入')}
            </Tooltip>
          ),
          successCallBack: handleAfterCloseExcel,
          args: {
            templateCode: 'SSTA_INVOICE_HEADER_INFANCY',
          },
          buttonProps: {
            type: 'c7n-pro',
            icon: 'archive',
            funcType: 'flat',
            loading,
          },
        },
      },
      permissionMap.get(`payNewImport`) && {
        name: 'payNewImport',
        btnComp: NewCommonImport,
        btnProps: {
          businessObjectTemplateCode: 'SSTA_PAYMENT_HEADER_INFANCY',
          prefixPatch: '/ssta',
          buttonText: (
            <Tooltip
              title={intl
                .get('ssta.common.button.tooltipInfomation.payApplyImport')
                .d(
                  '该功能仅供项目上线时，付款申请期初数据切换（不含预付款核销，导入成功即按结算策略配置生成付款申请结算单并自动提交，一个付款申请结算单最多1k行），切换完毕即收回，不可用于上线后用户使用'
                )}
              placement="bottom"
            >
              {intl.get('ssta.common.button.payApplyImport').d('付款申请期初EXCEL导入')}
            </Tooltip>
          ),
          successCallBack: handleAfterCloseExcel,
          args: {
            templateCode: 'SSTA_PAYMENT_HEADER_INFANCY',
          },
          buttonProps: {
            type: 'c7n-pro',
            icon: 'archive',
            funcType: 'flat',
            loading,
          },
        },
      },
      permissionMap.get(`preNewImport`) && {
        name: 'preNewImport',
        btnComp: NewCommonImport,
        btnProps: {
          businessObjectTemplateCode: 'SSTA_PREPAYMENT_HEADER_INFANCY',
          prefixPatch: '/ssta',
          buttonText: (
            <Tooltip
              title={intl
                .get('ssta.common.button.tooltipInfomation.preApplyImport')
                .d(
                  '该功能仅供项目上线时，预付款申请期初数据切换（仅支持引用单据创建场景，不支持供应商类型预付款，不含预付款核销），导入成功即按业务规则定义的协同模式/并单规则等配置生成预付款申请结算单并自动提交，若需生成已确认状态结算单，注意配置协同模式=单边协同，审批方式=无需审批，一个预付款申请结算单最多1k行），切换完毕即收回，不可用于上线后用户使用'
                )}
              placement="bottom"
            >
              {intl
                .get('ssta.common.button.preApplyImportOnlySupportQuote')
                .d('预付款申请期初EXCEL导入（引用单据创建场景）')}
            </Tooltip>
          ),
          successCallBack: handleAfterCloseExcel,
          args: {
            templateCode: 'SSTA_PREPAYMENT_HEADER_INFANCY',
          },
          buttonProps: {
            type: 'c7n-pro',
            icon: 'archive',
            funcType: 'flat',
            loading,
          },
        },
      },
      permissionMap.get(`payRecordImport`) && {
        name: 'payRecordImport',
        btnComp: NewCommonImport,
        btnProps: {
          businessObjectTemplateCode: 'SSTA.PAYMENT_RECORD',
          prefixPatch: '/ssta',
          buttonText: intl.get('ssta.common.button.payRecordExcelImport').d('付款记录EXCEL导入'),
          successCallBack: handleAfterCloseExcel,
          args: { templateCode: 'SSTA.PAYMENT_RECORD' },
          buttonProps: {
            type: 'c7n-pro',
            icon: 'archive',
            funcType: 'flat',
            loading,
          },
        },
      },
      permissionMap.get(`exportBtn`) && {
        name: 'export',
        btnComp: ExcelExport,
        childFor: 'buttonText',
        child: isEmpty(selected)
          ? intl.get(`ssta.common.button.export`).d('导出')
          : intl.get(`ssta.common.button.selectedExport`).d('勾选导出'),
        btnProps: {
          otherButtonProps: {
            type: 'c7n-pro',
            funcType: 'flat',
            icon: 'unarchive',
            loading,
          },
          method: 'GET',
          requestUrl: `${prefix}/settle-headers/purchaser/excel-export/${activeKey}`,
          queryParams: isEmpty(selected) ? getQueryParams : getSelectedKeys,
        },
      },
      permissionMap.get(`newExportBtn`) && {
        name: 'newExport',
        btnComp: ExcelExportPro,
        childFor: 'buttonText',
        child: isEmpty(selected)
          ? intl.get('ssta.common.button.newExport').d('(新)导出')
          : intl.get('ssta.common.button.newSelectedExport').d('(新)勾选导出'),
        btnProps: {
          templateCode: exportModelCode[activeKey],
          otherButtonProps: {
            type: 'c7n-pro',
            funcType: 'flat',
            icon: 'unarchive',
            loading,
          },
          method: 'POST',
          allBody: true,
          requestUrl: `${prefix}/settle-headers/purchaser/excel-export/${activeKey}/post`,
          queryParams: isEmpty(selected) ? getQueryParams : getSelectedKeys,
        },
      },
      permissionMap.get(`taskProgress`) && {
        name: 'task',
        child: intl.get('ssta.common.view.title.taskBtn').d('任务进度'),
        btnProps: {
          icon: 'publish2',
          onClick: () => handleViewTaskProgress({ taskDocType: 'INVOICE' }),
          loading,
        },
      },
    ];
    const processBtns = remoteProps
      ? remoteProps.process('SSTA_PURCHASESETTLE_LIST_WHOLE_BTNS', normalBtns, {
          loading,
          tableDs,
          activeKey,
          fetchTotalCount,
        })
      : normalBtns;
    return formatDynamicBtns(processBtns);
  }, [
    tableDs,
    selected,
    loading,
    activeKey,
    remoteProps,
    permissionMap,
    handleSync,
    handlePrint,
    getQueryParams,
    getSelectedKeys,
    operateBeforeConfirm,
    createBtns,
    handleAfterCloseExcel,
    handleNewPrintOkCallback,
    handleDelete,
    handleCancel,
    handleReturn,
    handleConfirm,
    handleRepairInvBudgetWriteOff,
    handleSubmitBatch,
    fetchTotalCount,
  ]);

  const detailBtns = useMemo(() => {
    const normalBtns = [
      ...createBtns,
      ['invoice', 'payment', 'prepayment'].includes(activeKey) && {
        name: 'reSync',
        child:
          activeKey === 'invoice'
            ? intl.get('ssta.common.view.button.syncFundingPlanPool').d('同步资金计划编制池')
            : intl.get('ssta.common.view.button.syncPayPool').d('同步支付池'),
        btnProps: {
          icon: 'sync',
          loading,
          funcType: 'flat',
          disabled: isEmpty(selected),
          onClick: handleBatchReSync,
          wait: 1000,
        },
      },
      permissionMap.get(`exportBtn`) && {
        name: 'export',
        btnComp: ExcelExport,
        childFor: 'buttonText',
        child: isEmpty(selected)
          ? intl.get(`ssta.common.button.export`).d('导出')
          : intl.get(`ssta.common.button.selectedExport`).d('勾选导出'),
        btnProps: {
          otherButtonProps: {
            type: 'c7n-pro',
            funcType: 'flat',
            icon: 'unarchive',
            loading,
          },
          method: 'GET',
          requestUrl: `${prefix}/${detailExportSuffix[activeKey]}/purchaser/export`,
          queryParams: isEmpty(selected) ? getQueryParams : getSelectedKeys,
        },
      },
      permissionMap.get(`newExportBtn`) && {
        name: 'newExport',
        btnComp: ExcelExportPro,
        childFor: 'buttonText',
        child: isEmpty(selected)
          ? intl.get('ssta.common.button.newExport').d('(新)导出')
          : intl.get('ssta.common.button.newSelectedExport').d('(新)勾选导出'),
        btnProps: {
          templateCode: exportModelCode[activeKey],
          otherButtonProps: {
            type: 'c7n-pro',
            funcType: 'flat',
            icon: 'unarchive',
            loading,
          },
          method: 'POST',
          allBody: true,
          requestUrl: `${prefix}/${detailExportSuffix[activeKey]}/purchaser/export/new/post`,
          queryParams: isEmpty(selected) ? getQueryParams(true) : getSelectedKeys,
        },
      },
    ];
    const processBtns = remoteProps
      ? remoteProps.process('SSTA_PURCHASESETTLE_LIST_WHOLE_BTNS_CUX', normalBtns, {
          loading,
          tableDs,
          activeKey,
          fetchTotalCount,
        })
      : normalBtns;
    return formatDynamicBtns(processBtns);
  }, [
    activeKey,
    getQueryParams,
    getSelectedKeys,
    loading,
    permissionMap,
    selected,
    createBtns,
    handleBatchReSync,
    remoteProps,
    tableDs,
    fetchTotalCount,
  ]);

  const handleRecordInit = useCallback((type) => {
    initRecords.current[type] = true;
  }, []);

  return (
    <Fragment>
      <Header
        title={intl.get('ssta.purchaseSettle.view.message.title.purchaseSettle').d('采购方结算单')}
      >
        {customizeBtnGroup(
          {
            code: detailFlag
              ? 'SSTA.PURCHASE_SETTLE_LIST.DETAIL_BTNS'
              : 'SSTA.PURCHASE_SETTLE_LIST.WHOLE_BTNS',
            pro: true,
          },
          <DynamicButtons
            maxNum={5}
            defaultBtnType="c7n-pro"
            buttons={detailFlag ? detailBtns : wholeBtns}
          />
        )}
      </Header>
      <Content className={styles['ssta-list-content']}>
        {customizeTabPane(
          {
            code: 'SSTA.PURCHASE_SETTLE_LIST.TAB',
            cascade: true,
          },
          <Tabs keyboard={false} activeKey={activeKey} onChange={handleTabChange}>
            <TabGroup tab={intl.get(`ssta.common.view.title.wholeTab`).d('整单')} key="whole">
              {permissionMap?.get(`updatePane`) && (
                <TabPane
                  tab={intl.get(`ssta.purchaseSettle.button.maintainable`).d('可维护')}
                  key="update"
                  count={dsMap.update.getState('totalCount')}
                >
                  <WholeTable type="update" modalOpen={modalOpen} onRecordInit={handleRecordInit} />
                </TabPane>
              )}
              {permissionMap?.get(`auditPane`) && (
                <TabPane
                  tab={intl.get(`ssta.purchaseSettle.button.auditable`).d('可审核')}
                  key="approve"
                  count={dsMap.approve.getState('totalCount')}
                >
                  <WholeTable
                    type="approve"
                    modalOpen={modalOpen}
                    onRecordInit={handleRecordInit}
                  />
                </TabPane>
              )}
              {permissionMap?.get(`cancelPane`) && (
                <TabPane
                  tab={intl.get(`ssta.purchaseSettle.button.cancelable`).d('可取消')}
                  key="cancel"
                  count={dsMap.cancel.getState('totalCount')}
                >
                  <WholeTable type="cancel" modalOpen={modalOpen} onRecordInit={handleRecordInit} />
                </TabPane>
              )}
              {permissionMap?.get(`syncPane`) && (
                <TabPane
                  tab={intl.get(`ssta.purchaseSettle.button.synchronizable`).d('可同步')}
                  key="sync"
                  count={dsMap.sync.getState('totalCount')}
                >
                  <WholeTable type="sync" modalOpen={modalOpen} onRecordInit={handleRecordInit} />
                </TabPane>
              )}
              <TabPane
                tab={intl.get(`ssta.purchaseSettle.button.all`).d('全部')}
                key="all"
                count={dsMap.all.getState('totalCount')}
              >
                <WholeTable type="all" modalOpen={modalOpen} onRecordInit={handleRecordInit} />
              </TabPane>
            </TabGroup>
            <TabGroup tab={intl.get(`ssta.common.view.title.detailTab`).d('明细')} key="detail">
              {permissionMap?.get(`invoice`) && (
                <TabPane
                  tab={intl.get('ssta.common.view.title.invoiceSettleLine').d('开票结算单行')}
                  key="invoice"
                  count={dsMap.invoice.getState('totalCount')}
                >
                  <DetailTable
                    type="invoice"
                    modalOpen={modalOpen}
                    onRecordInit={handleRecordInit}
                  />
                </TabPane>
              )}
              {(permissionMap?.get(`payment`) ||
                permissionMap?.get(`payInvoice`) ||
                permissionMap?.get(`invoicePayment`)) && (
                <TabPane
                  tab={intl.get('ssta.common.view.title.paymentSettleLine').d('付款结算单行')}
                  key="payment"
                  count={dsMap.payment.getState('totalCount')}
                >
                  <DetailTable
                    type="payment"
                    modalOpen={modalOpen}
                    onRecordInit={handleRecordInit}
                  />
                </TabPane>
              )}
              {permissionMap?.get(`prePayment`) && (
                <TabPane
                  tab={intl.get('ssta.common.view.title.prePaySettleLine').d('预付款结算单行')}
                  key="prepayment"
                  count={dsMap.prepayment.getState('totalCount')}
                >
                  <DetailTable
                    type="prepayment"
                    modalOpen={modalOpen}
                    onRecordInit={handleRecordInit}
                  />
                </TabPane>
              )}
              {(permissionMap?.get(`payment`) ||
                permissionMap.get(`payInvoice`) ||
                permissionMap?.get(`invoicePayment`)) && (
                <TabPane
                  tab={intl.get('ssta.common.view.title.dimensionPayLine').d('多维度付款行')}
                  key="demension"
                  count={dsMap.demension.getState('totalCount')}
                >
                  <DetailTable
                    type="demension"
                    modalOpen={modalOpen}
                    onRecordInit={handleRecordInit}
                  />
                </TabPane>
              )}
            </TabGroup>
          </Tabs>
        )}
      </Content>
    </Fragment>
  );
};

export default observer(List);
