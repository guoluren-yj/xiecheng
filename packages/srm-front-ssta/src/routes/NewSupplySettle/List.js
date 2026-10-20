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
import { Modal, useModal } from 'choerodon-ui/pro';
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
import DynamicButtons from '_components/DynamicButtons';
import { getResponse, filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';

import Create from './Create';
import { Store } from './StoreProvider';
import styles from '@/routes/common.less';
import { formatDynamicBtns, transformQselectDate, transformSupplierData } from '@/utils/utils';
import WholeTable from './components/WholeTable';
import DetailTable from './components/DetailTable';
import FilledListInfoModal from './components/FilledListInfoModal';
import DynamicBtn from '@/components/DynamicBtn';
import QuoteCreatePrePay from './PrePayment/QuoteCreate';
import {
  printList,
  syncPrintData,
  confirmValidate,
  confirmSupplySettle,
  confirmSupplierCancel,
  confirmSupplierDelete,
  fetchInvoicePlatformRed,
} from '@/services/settlePoolServices';
import { getBusinessRules } from '@/services/invoicePurPoolService';
import { handleViewTaskProgress } from '@/routes/ExecutionProgress/modal';
import { useModalOpen } from './hooks';

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
  all: 'SSTA_SETTLE_HEADER_SUPPLIER_ALL_EXPORT',
  update: 'SSTA_SETTLE_HEADER_SUPPLIER_UPDATE_EXPORT',
  approve: 'SSTA_SETTLE_HEADER_SUPPLIER_APPROVE_EXPORT',
  cancel: 'SSTA_SETTLE_HEADER_SUPPLIER_CANCEL_EXPORT',
  invoice: 'SSTA_SETTLE_LINE_SUPPLIER_EXPORT',
  payment: 'SSTA_SETTLE_LINE_SUPPLIER_PAYMENT_EXPORT',
  prepayment: 'SSTA_SETTLE_LINE_SUPPLIER_PREPAYMENT_EXPORT',
  demension: 'SSTA_SETTLE_LINE_SUPPLIER_DEMENSION_EXPORT',
};

export const createTypeMap = {
  invCreate: { settleType: 'INVOICE', baseAffairFlag: true },
  invAdvanceCreate: { settleType: 'INVOICE', baseAffairFlag: true, advanceInvFlag: true }, // 先发票后事务
  payCreateBaseAffair: { settleType: 'PAYMENT', baseAffairFlag: true },
  payCreateBaseInv: { settleType: 'PAYMENT', baseInvFlag: true },
  payIncludeInvCreateBaseAffair: { settleType: 'INVOICE_PAYMENT', baseAffairFlag: true },
};

const List = () => {
  const {
    dsMap,
    history,
    detailKeys,
    urlActiveKey,
    permissionMap,
    createTitleMap,
    defaultActiveKey,
    customizeTabPane,
    customizeBtnGroup,
    fetchTabKeysCount,
    cacheState,
    location,
    remoteProps,
  } = useContext(Store);
  const initRecords = useRef({});
  const modalOpen = useModalOpen(useModal());
  const [activeKey, setActiveKey] = useState(defaultActiveKey);
  const [remotePageData, setRemoteData] = useState(null); // 二开初始化数据
  const [enableDirInvFlag, setEnableDirInvFlag] = useState(false);

  const tableDs = dsMap[activeKey];
  const { selected } = tableDs;
  const loading = tableDs.status !== 'ready';
  const detailFlag = detailKeys.includes(activeKey);

  useEffect(() => {
    remoteInit(); // 页面加载埋点
  }, []);

  useEffect(() => {
    fetchEnableDirInvConfig();
  }, [fetchEnableDirInvConfig]);

  const fetchEnableDirInvConfig = useCallback(async () => {
    const res = getResponse(await getBusinessRules({ cnfCode: 'SITE.SSTA.ENABLE_DIRECT_INVOICE' }));
    if (res) {
      setEnableDirInvFlag(Boolean(res));
    }
  }, [setEnableDirInvFlag]);

  const remoteInit = async () => {
    if (remoteProps) {
      await remoteProps.event.fireEvent('remoteInit', {
        remotePageData,
        setRemoteData,
      });
    }
  };

  useEffect(() => {
    if (urlActiveKey) {
      setActiveKey(urlActiveKey);
    }
  }, [urlActiveKey]);

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
            .get('ssta.common.view.title.quoteDoToCreatePreColApply')
            .d('引用单据创建预收款申请'),
          className: styles['ssta-large-modal'],
          children: <QuoteCreatePrePay history={history} permissionMap={permissionMap} />,
          footer: null,
        });
      } else {
        history.push({
          pathname: '/ssta/new-supply-settle/pre-payment-create',
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

  const handleConfirm = useCallback(
    async (info = {}, infoCode = '') => {
      const validateOk = async () => {
        const { customizeUnitCode = '' } = tableDs.queryParameter;
        const res = getResponse(
          await confirmSupplySettle({
            body: selectData,
            isOnlyPre: !hasNotPre,
            ...tableDs.queryParameter,
            customizeUnitCode: `${customizeUnitCode},${infoCode}`,
          })
        );
        tableDs.status = 'ready';
        if (!res) return false;
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
      // 预收款与其他结算单类型确认接口区分
      if (hasPre && hasNotPre) {
        notification.warning({
          message: intl.get('hzero.common.notification.error').d('操作失败'),
          description: intl
            .get('ssta.supplySettle.view.message.documentTypeDifferent')
            .d('请勾选同一结算单类型单据进行批量操作'),
        });
        return false;
      }
      tableDs.status = 'loading';
      const results = await Promise.all(
        selectData.map((item) =>
          ['SUBMITED', 'WAIT_SUPPLIER_CONFIRM'].includes(item.settleStatus)
            ? confirmValidate({ body: item, role: 'supplier' })
            : {}
        )
      );
      const err = results.find((item) => item && item.failed === true);
      const validateErr = results.find((item) => item && item.validatedCode === 'ERROR');
      if (err) {
        getResponse(err);
        tableDs.status = 'ready';
        return false;
      } else if (validateErr) {
        tableDs.status = 'ready';
        notification.error({
          message: intl.get('hzero.common.notification.error').d('操作失败'),
          description: validateErr.msg,
        });
        return false;
      } else {
        return checkWarn();
      }
    },
    [tableDs, fetchTotalCount]
  );

  const getQueryParams = useCallback(() => {
    const queryData = tableDs.queryDataSet?.current?.toData() || {};
    return filterNullValueObject({
      ...queryData,
      ...transformQselectDate(queryData, { dateRange: 'creationDate' }),
      ...transformSupplierData(queryData.supplierCompanyId),
      ...tableDs.queryParameter,
      action: activeKey.toUpperCase(),
    });
  }, [activeKey, tableDs]);

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
      [rowKeysPropName]: selected.map((record) => record.get(primaryKey)).join(),
    };
  }, [activeKey, tableDs, selected]);

  // 取消之前判断
  const handleCancelBefore = useCallback(() => {
    // directInvoicingType
    const list = selected?.map((record) => record?.get('directInvoicingType'));
    if (list?.includes('INVOICE_PLATFORM') && list?.includes('EC')) {
      notification.error({
        message: intl.get('hzero.common.notification.error').d('操作失败'),
        description: intl
          .get('ssta.common.view.message.cancelInvoiceTips')
          .d(
            '批量取消失败，失败原因是您当前同时勾选电商以及开票平台直连开票单据，由于单据后续取消逻辑有差异，暂不支持一起取消，请分批勾选'
          ),
      });
      return;
    }
    operateBeforeConfirm('CANCEL', handleCancel);
  }, [operateBeforeConfirm, handleCancel, selected]);

  // 在做取消回退相关操作之前先弹框确认
  const operateBeforeConfirm = useCallback(
    async (type, onOk) => {
      if (['CONFIRM', 'RETURN', 'CANCEL'].includes(type)) {
        let redList = [];
        const settleTypeList = selected.map((item) => item.get('settleType'));
        const settleStatusList = selected.map((item) => item.get('settleStatus'));
        const settleList = Array.from(new Set(settleTypeList));
        const statusList = Array.from(new Set(settleStatusList));
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
        modalOpen({
          editFlag: true,
          size: !isEmpty(redList) ? 'middle' : 'small',
          title:
            type === 'CANCEL'
              ? intl.get(`ssta.supplySettle.view.title.cancelInfo`).d('取消信息')
              : intl.get(`ssta.supplySettle.view.title.approveInfo`).d('审核信息'),
          children: (
            <FilledListInfoModal
              onOk={onOk}
              action={type}
              settleType={settleList[0]}
              settleStatus={statusList[0]}
              enableDirInvFlag={enableDirInvFlag}
              redList={redList}
            />
          ),
        });
      } else {
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
        if (remoteProps) {
          const beforeCancelRes = await remoteProps.event.fireEvent('beforeCancel', {
            modalOpen,
            tableDs,
          });
          if (beforeCancelRes === false) return false;
        }
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
            if (isEmpty(res)) onOk();
            else {
              modalOpen({
                editFlag: true,
                size: 'middle',
                title: intl.get(`ssta.purchaseSettle.view.title.cancelInfo`).d('取消信息'),
                children: (
                  <FilledListInfoModal
                    onOk={onOk}
                    action="DELETE"
                    settleType="INVOICE"
                    settleStatus="RETURN"
                    enableDirInvFlag={enableDirInvFlag}
                    redList={res}
                    isDelete
                  />
                ),
              });
            }
          } else onOk();
        };
        const confirmMsg = remoteProps
          ? remoteProps.process('SSTA_SUPPLYSETTLE_LIST.CANCEL_CONFIRM_TIPS', message, {
              tableDs,
            })
          : message;
        const res = await Modal.confirm({
          title: intl.get('ssta.common.view.message.tip').d('提示'),
          children: confirmMsg,
          onOk: handleRedInv,
        });
        return res === 'ok';
      }
    },
    [selected, modalOpen, remoteProps, tableDs, enableDirInvFlag]
  );

  const handleDelete = useCallback(async () => {
    const validateOk = async () => {
      const res = await tableDs.setState('submitType', 'delete').submit();
      if (!res) return false;
      tableDs.query(undefined, undefined, false);
      fetchTotalCount();
    };
    const validateSelect = await tableDs.validate();
    if (!validateSelect) return false;
    tableDs.status = 'loading';
    const res = getResponse(
      await confirmSupplierDelete({
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
  }, [tableDs, fetchTotalCount]);

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
          await confirmSupplierCancel({
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
      // 提示对 【已确认】状态的发票结算单点击取消时，判断 单据主结算策略-发票匹配规则&直连开票类
      const ecSettleNums = (tableDs.toJSONData() || [])
        .filter((data) => {
          const { invoiceMatchRuleCode, directInvoicingType, settleType, settleStatus } =
            data || {};
          return (
            invoiceMatchRuleCode === 'DIRECT_INVOICING' &&
            directInvoicingType === 'EC' &&
            settleType === 'INVOICE' &&
            settleStatus === 'CONFIRM'
          );
        })
        .map((item) => item.settleNum);
      if (!ecSettleNums.length) return handleCancelOpr();
      const ecSettleNumsStr = ecSettleNums.join('`');
      Modal.confirm({
        title: intl.get('ssta.common.view.message.tip').d('提示'),
        children: intl
          .get(`ssta.common.view.message.cancelEcInvoiceWarning`, {
            ecSettleNumsStr,
          })
          .d(
            '请注意：您当前正对线上直连开票成功的电商发票结算单{ecSettleNumsStr}进行取消，由于第三方电商暂未提供线上取消接口，您在srm取消时，需线下联系电商人员处理对方系统数据，否则将会阻塞您下次线上直连开票流程。'
          ),
        onOk: () => {
          return handleCancelOpr();
        },
      });
    },
    [tableDs, fetchTotalCount]
  );

  const handleReturn = useCallback(
    async (filledInfo = {}, filledInfoCode = '') => {
      const res = await tableDs
        .setState('submitType', 'return')
        .setState('filledParams', { filledInfo, filledInfoCode })
        .submit();
      if (!res) return false;
      tableDs.query(undefined, undefined, false);
      fetchTotalCount();
    },
    [tableDs, fetchTotalCount]
  );

  const handlePrint = useCallback(async () => {
    const flag = checkPrintWindow();
    tableDs.status = 'loading';
    const selectData = tableDs.toJSONData();
    const settleHeaderIds = selectData.map((item) => item.settleHeaderId);
    const params = {
      list: settleHeaderIds,
      responseType: flag ? 'blob' : 'json',
      headers: flag ? {} : { 's-print-using-preview': '1' },
      menuCamp: 'SUPPLIER',
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

  const createBtns = useMemo(() => {
    return [
      permissionMap.get('updatePane') &&
        permissionMap.get(`invoice`) && {
          name: 'invCreate',
          child: intl.get(`ssta.supplySettle.button.createInvoiceApply`).d('新建发票申请'),
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
              text={intl.get(`ssta.supplySettle.button.createInvoiceApply`).d('新建发票申请')}
              extra={<Icon type="expand_more" style={{ fontSize: 14, margin: '-2px 0 0 4px' }} />}
            />
          ),
          children: [
            permissionMap.get(`invoiceAdvance`) && {
              name: 'invAdvanceCreate',
              child: intl.get(`ssta.supplySettle.button.invAdvanceAffair`).d('先发票后事务'),
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
              text={intl.get(`ssta.supplySettle.button.createCollectionApply`).d('新建收款申请')}
              extra={<Icon type="expand_more" style={{ fontSize: 14, margin: '-2px 0 0 4px' }} />}
            />
          ),
          children: [
            permissionMap.get(`payment`) && {
              name: 'payCreateBaseAffair',
              child: intl
                .get(`ssta.supplySettle.button.onlyColApplyBaseAffair`)
                .d('收款申请（仅收款）-基于事务'),
              btnProps: {
                loading,
                icon: 'add',
                onClick: () => handleCreate(createTypeMap.payCreateBaseAffair),
              },
            },
            permissionMap.get(`payInvoice`) && {
              name: 'payCreateBaseInv',
              child: intl
                .get(`ssta.supplySettle.button.onlyColApplyBaseInvoice`)
                .d('收款申请（仅收款）-基于发票'),
              btnProps: {
                loading,
                icon: 'add',
                onClick: () => handleCreate(createTypeMap.payCreateBaseInv),
              },
            },
            permissionMap.get(`invoicePayment`) && {
              name: 'payIncludeInvCreateBaseAffair',
              child: intl
                .get(`ssta.supplySettle.button.colApplyIncludeInvBaseAffair`)
                .d('收款申请（含发票）-基于事务'),
              btnProps: {
                loading,
                icon: 'add',
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
          child: intl.get(`ssta.supplySettle.button.preCollectionApplyCreate`).d('新建预收款申请'),
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
                .get(`ssta.purchaseSettle.button.preCollectionApplyCreate`)
                .d('新建预收款申请')}
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
                onClick: () => handleCreatePrePayment('quote'),
              },
            },
            permissionMap.get(`prePaymentManual`) && {
              name: 'prePaymentManual',
              child: intl.get(`ssta.common.button.createManually`).d('手工新建'),
              btnProps: {
                loading,
                icon: 'add',
                onClick: handleCreatePrePayment,
              },
            },
          ],
        },
    ];
  }, [loading, permissionMap, handleCreate, handleCreatePrePayment]);

  const wholeBtns = useMemo(() => {
    const normalBtns = [
      activeKey === 'cancel' && {
        name: 'cancel',
        child: intl.get('hzero.common.button.cancel').d('取消'),
        btnProps: {
          icon: 'cancel',
          disabled: isEmpty(selected),
          loading,
          onClick: () => handleCancelBefore,
        },
      },
      permissionMap.get(`confirmBtn`) &&
        activeKey === 'approve' && {
          name: 'confirm',
          child: intl.get('hzero.common.button.confirm').d('确认'),
          btnProps: {
            icon: 'check',
            disabled: isEmpty(selected),
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
            disabled: isEmpty(selected),
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
          // 当选中的数据有直连开票异常且直连开票类型为电商的时候，取消操作置灰
          disabled:
            isEmpty(selected) ||
            selected.findIndex(
              (v) =>
                v.get('settleStatus') === 'INVOICE_EXCEPTION' &&
                v.get('directInvoicingType') === 'EC'
            ) > -1,
          loading,
          onClick: () => operateBeforeConfirm('DELETE', handleDelete),
        },
      },
      permissionMap.get(`printListBtn`) && {
        name: 'print',
        child: intl.get('hzero.common.button.print').d('打印'),
        btnProps: {
          icon: 'print',
          disabled: isEmpty(selected),
          loading,
          wait: 1000,
          onClick: handlePrint,
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
            menuCamp: 'SUPPLIER',
          },
          successCallBack: handleNewPrintOkCallback,
          loading,
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
          requestUrl: `${prefix}/settle-headers/supplier/excel-export/${activeKey}`,
          queryParams: isEmpty(selected) ? getQueryParams() : getSelectedKeys(),
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
          methode: 'GET',
          templateCode: exportModelCode[activeKey],
          otherButtonProps: {
            type: 'c7n-pro',
            funcType: 'flat',
            icon: 'unarchive',
            loading,
          },
          requestUrl: `${prefix}/settle-headers/supplier/excel-export/${activeKey}`,
          queryParams: isEmpty(selected) ? getQueryParams() : getSelectedKeys(),
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
      ? remoteProps.process('SSTA_SUPPLY_SETTLE_LIST_WHOLE_BTNS_CUX', normalBtns, {
          loading,
          tableDs,
          activeKey,
          remotePageData,
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
    remotePageData,
    handlePrint,
    getQueryParams,
    getSelectedKeys,
    operateBeforeConfirm,
    createBtns,
    handleNewPrintOkCallback,
    handleDelete,
    // handleCancel,
    handleReturn,
    handleConfirm,
    handleCancelBefore,
  ]);

  const detailBtns = useMemo(
    () =>
      formatDynamicBtns([
        ...createBtns,
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
            requestUrl: `${prefix}/${detailExportSuffix[activeKey]}/supplier/export`,
            queryParams: isEmpty(selected) ? getQueryParams() : getSelectedKeys(),
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
            methode: 'GET',
            templateCode: exportModelCode[activeKey],
            otherButtonProps: {
              type: 'c7n-pro',
              funcType: 'flat',
              icon: 'unarchive',
              loading,
            },
            requestUrl: `${prefix}/${detailExportSuffix[activeKey]}/supplier/export/new`,
            queryParams: isEmpty(selected) ? getQueryParams() : getSelectedKeys(),
          },
        },
      ]),
    [activeKey, getQueryParams, getSelectedKeys, loading, permissionMap, selected, createBtns]
  );

  const handleRecordInit = useCallback((type) => {
    initRecords.current[type] = true;
  }, []);

  return (
    <Fragment>
      <Header
        title={intl.get('ssta.supplySettle.view.message.title.supplySettle').d('销售方结算单')}
      >
        {customizeBtnGroup(
          {
            code: detailFlag
              ? 'SSTA.SUPPLY_SETTLE_LIST.DETAIL_BTNS'
              : 'SSTA.SUPPLY_SETTLE_LIST.WHOLE_BTNS',
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
            code: 'SSTA.SUPPLY_SETTLE_LIST.TAB',
            cascade: true,
          },
          <Tabs keyboard={false} activeKey={activeKey} onChange={handleTabChange}>
            <TabGroup tab={intl.get(`ssta.common.view.title.wholeTab`).d('整单')} key="whole">
              {permissionMap?.get(`updatePane`) && (
                <TabPane
                  tab={intl.get(`ssta.supplySettle.button.maintainable`).d('可维护')}
                  key="update"
                  count={dsMap.update.getState('totalCount')}
                >
                  <WholeTable type="update" modalOpen={modalOpen} onRecordInit={handleRecordInit} />
                </TabPane>
              )}
              {permissionMap?.get(`auditPane`) && (
                <TabPane
                  tab={intl.get(`ssta.supplySettle.button.auditable`).d('可审核')}
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
                  tab={intl.get(`ssta.supplySettle.button.cancelable`).d('可取消')}
                  key="cancel"
                  count={dsMap.cancel.getState('totalCount')}
                >
                  <WholeTable type="cancel" modalOpen={modalOpen} onRecordInit={handleRecordInit} />
                </TabPane>
              )}
              <TabPane
                tab={intl.get(`ssta.supplySettle.button.all`).d('全部')}
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
                permissionMap.get(`invoicePayment`)) && (
                <TabPane
                  tab={intl.get('ssta.common.view.title.collectionTitleLine').d('收款结算单行')}
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
                  tab={intl.get('ssta.common.view.title.preColSettleLine').d('预收款结算单行')}
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
                permissionMap.get(`invoicePayment`)) && (
                <TabPane
                  tab={intl.get('ssta.common.view.title.dimensionColLine').d('多维度收款行')}
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
