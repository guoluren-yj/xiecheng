/*
 * @Description: 采购方结算单——整单筛选器
 * @Date: 2022-01-27 22:11:23
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
// import { stringify } from 'querystring';
import React, { useMemo, useCallback, useContext, memo, useRef, useEffect } from 'react';
import { Modal, Select, Button, useDataSet } from 'choerodon-ui/pro';
import { Divider } from 'choerodon-ui';

import intl from 'utils/intl';
import SearchBarTable from '_components/SearchBarTable';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';

import styles from '@/routes/common.less';
import { dateRangeTransform, lovOptionDS } from '@/utils/utils';
import StatusTag, { statusTagRender } from '@/routes/Components/StatusTag';
import { formatColumnCommand } from '@/routes/Components/ColumnBtnGroup';
import {
  // getDirectInvoiceApplysettleNum,
  getSettleHeaderDataSup,
} from '@/services/settlePoolServices';
import MultiTextFilter from '@/routes/Components/MultiTextFilter';
import { Store, wholeTableUnitCodes, wholeSearchUnitCodes } from '../StoreProvider';
import PayRecord from './PayRecord';
import Create from '../Create';
import { settleActionFlagger } from '../../../utils/amountConfig';
import PayApplyExcuteQuery from './PayApplyExcuteQuery';

const tenantId = getCurrentOrganizationId();

export default memo(({ type, modalOpen, onRecordInit }) => {
  const {
    dsMap,
    history,
    location,
    createTitleMap,
    handleToDetail,
    permissionMap,
    customizeTable,
    fetchTabKeysCount,
    isOpenClearCashed,
    setIsOpenClearCashed,
    defaultDateRange,
    defaultSettleNums,
    defaultSettleType,
    defaultSettleStatus,
    remoteProps,
  } = useContext(Store);
  const tableDs = dsMap[type];
  const searchBarRef = useRef({});

  useEffect(() => {
    if (onRecordInit) onRecordInit(type);
  }, [onRecordInit, type]);

  const settleTypeOptionDs = useDataSet(
    () => lovOptionDS({ lovCode: 'SSTA.SETTLE_DOCUMENT_TYPE' }),
    []
  );

  /**
   * 筛选器查询回调
   */
  const handleQuery = useCallback(
    ({ params }) => {
      tableDs.queryDataSet.loadData([params]);
      const { _back } = location.state || {};
      if (_back && isOpenClearCashed) {
        if (_back !== -1) tableDs.batchUnSelect(tableDs.selected);
        setIsOpenClearCashed(false);
        tableDs.query(tableDs.currentPage);
      } else {
        tableDs.query();
      }
    },
    [location, tableDs, isOpenClearCashed, setIsOpenClearCashed]
  );

  const handleFieldChange = useCallback(({ value, name, record }) => {
    if (name === 'dateRange') {
      record.set('creationDate', dateRangeTransform(value, true));
    }
  }, []);

  const handleBeforeToDetail = useCallback(
    async (record, action = '') => {
      const { settleHeaderId, documentType } = record.get(['settleHeaderId', 'documentType']);
      if (documentType === 'PREPAYMENT') {
        handleToDetail(record, action === 'all' ? 'NUM' : action.toUpperCase());
      } else if (action !== 'update') {
        handleToDetail(record, action);
      } else if (action === 'update') {
        const res = getResponse(await getSettleHeaderDataSup({ settleHeaderId, documentType }));
        if (!res) return;
        const { step } = res;
        if (step && step === 'END') {
          handleToDetail(record, action);
        } else {
          handleContinueCreate(res);
        }
      }
    },
    [handleToDetail, handleContinueCreate]
  );

  const handleContinueCreate = useCallback(
    (settleDetail) => {
      const {
        step,
        settleType,
        branchStep,
        settleHeaderId,
        settleNum = '',
        currencyCode = '',
        taxIncludedAmount = '',
      } = settleDetail;
      const baseTitle = `${createTitleMap[settleType]}-${settleNum} `;
      const filledTitle = `${taxIncludedAmount} ${currencyCode}`;
      const createProps = {
        step,
        history,
        settleType,
        branchStep,
        settleHeaderId,
        onQueryList: async (clearCache) => {
          await tableDs.query();
          if (clearCache) tableDs.clearCachedSelected();
        },
      };
      Modal.open({
        drawer: true,
        closable: true,
        title: settleType === 'PAYMENT' ? baseTitle : baseTitle + filledTitle,
        className: styles['ssta-large-modal'],
        children: <Create {...createProps} />,
        bodyStyle: { paddingTop: 0, paddingBottom: 0 },
        footer: null,
      });
    },
    [history, createTitleMap, tableDs]
  );

  const handleWithdraw = useCallback(
    (record) => {
      Modal.confirm({
        title: intl.get('ssta.common.view.message.tip').d('提示'),
        children: intl.get(`ssta.costSheet.model.costSheet.withdrawning`).d('是否撤回？'),
        onOk: async () => {
          tableDs.dataToJSON = 'dirty';
          Object.assign(record, { status: 'update' });
          const res = await tableDs.setState('submitType', 'withdraw').submit();
          tableDs.dataToJSON = 'selected';
          if (!res) return;
          tableDs.query();
          fetchTabKeysCount([type]);
        },
      });
    },
    [type, tableDs, fetchTabKeysCount]
  );

  const handleDeleteSettle = useCallback(async(record) => {
    const confirmRes = await Modal.confirm({
      title: intl.get('ssta.common.view.message.tip').d('提示'),
      children: intl
        .get('ssta.common.view.message.deleteSettleConfirm')
        .d('删除后将无法恢复，确认要删除当前单据吗?'),
    });
    if (confirmRes !== 'ok') return;
    tableDs.dataToJSON = 'dirty';
    Object.assign(record, { status: 'update' });
    const res = await tableDs.setState('submitType', 'deleteSettle').submit();
    tableDs.dataToJSON = 'selected';
    if (!res) return;
    tableDs.query();
    fetchTabKeysCount([type]);
  }, [type, tableDs, fetchTabKeysCount]);

  const handleViewPayRecord = useCallback((settleHeaderId) => {
    Modal.open({
      drawer: true,
      title: intl.get('hzero.common.button.viewCollectionDetail').d('查看收款记录'),
      closable: true,
      key: Modal.key(),
      className: styles['ssta-medium-modal'],
      children: <PayRecord settleHeaderId={settleHeaderId} />,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  }, []);

  const handlePayApplyQuery = useCallback(
    (record) => {
      modalOpen({
        title: intl.get('hzero.common.button.viewDetails').d('查看详情'),
        size: 'large',
        editFlag: false,
        drawer: true,
        key: Modal.key(),
        destroyOnClose: true,
        closable: true,
        className: styles['ssta-detailDrawer-modal'],
        children: (
          <PayApplyExcuteQuery record={record} history={history} customizeTable={customizeTable} />
        ),
      });
    },
    [history, modalOpen, customizeTable]
  );

  const getOperationCommand = useCallback(
    ({ record }) => {
      const { camp, settleStatus, showFlag = false } = record.get([
        'camp',
        'settleStatus',
        'showFlag',
      ]);
      const [updateBtn, approveBtn, cancelBtn] = settleActionFlagger(record, 'supplier', [
        'UPDATE',
        'APPROVE',
        'CANCEL',
      ]);
      const normalBtns = [
        {
          name: 'update',
          text: intl.get('hzero.common.button.edit').d('编辑'),
          onClick: () => handleBeforeToDetail(record, 'update'),
          showFlag: type === 'all' && updateBtn && permissionMap.get('updatePane'),
          wait: 1000,
        },
        {
          name: 'approve',
          text: intl.get('ssta.common.button.approve').d('审核'),
          onClick: () => handleToDetail(record, 'approve'),
          showFlag: approveBtn && permissionMap.get('auditPane'),
        },
        {
          name: 'cancel',
          text: intl.get('hzero.common.button.cancel').d('取消'),
          onClick: () => handleToDetail(record, 'cancel'),
          showFlag: type === 'all' && cancelBtn && permissionMap.get('cancelPane'),
        },
        {
          name: 'show',
          text: intl.get('hzero.common.button.viewCollectionDetail').d('查看收款记录'),
          onClick: () => handleViewPayRecord(record.get('settleHeaderId')),
          showFlag: type === 'all' && showFlag,
        },
        {
          name: 'withdraw', // 功能/工作流/外部系统审批撤回
          text: intl.get('ssta.costSheet.model.costSheet.withdraw').d('撤回'),
          onClick: () => handleWithdraw(record),
          showFlag:
            type === 'all' &&
            camp === 'SUPPLIER' &&
            ((['SUBMITED'].includes(settleStatus) && permissionMap.get('recallBtn')) ||
              (['SUBMITED_APPROVING'].includes(settleStatus) &&
                permissionMap.get('recallWorkflowBtn')) ||
              (['ES_SUBMITED_APPROVING'].includes(settleStatus) &&
                permissionMap.get('recallExtSysBtn'))),
        },
        {
          name: 'payApplyQuery',
          text: intl.get('ssta.common.button.collectApplyQuery').d('收款申请执行查询'),
          onClick: () => handlePayApplyQuery(record),
          showFlag:
            type === 'all' &&
            record.get('settleType') === 'INVOICE' &&
            permissionMap?.get('payApplyExeQuery'),
        },
        {
          name: 'deleteSettle',
          text: intl.get('hzero.common.button.detele').d('删除'),
          onClick: () => handleDeleteSettle(record),
          showFlag: type === 'all' && settleStatus === 'NEW' && permissionMap.get('deleteSettle'),
          wait: 1000,
        },
      ];
      const otherProps = { type, record, tableDs };
      const buttons = remoteProps
        ? remoteProps.process('SSTA_SUPPLYSETTLE_LIST.WHOLE_OPR_BTNS', normalBtns, otherProps)
        : normalBtns;
      return formatColumnCommand({ buttons });
    },
    [
      type,
      tableDs,
      remoteProps,
      handleBeforeToDetail,
      handleToDetail,
      handleViewPayRecord,
      handleWithdraw,
      permissionMap,
      handlePayApplyQuery,
      handleDeleteSettle,
    ]
  );

  const columns = useMemo(() => {
    const standartColumns = [
      {
        name: 'settleStatusMeaning',
        width: 120,
        renderer: (rendererProps) => statusTagRender({ ...rendererProps, name: 'settleStatus' }),
      },
      ['all', 'approve'].includes(type) && {
        name: 'operation',
        title: intl.get('hzero.common.button.operator').d('操作'),
        width: 160,
        align: 'left',
        command: getOperationCommand,
      },
      {
        name: 'settleNum',
        width: 220,
        renderer: ({ record, value }) => {
          return (
            <Button
              wait={1000}
              funcType="link"
              color="primary"
              style={{ userSelect: 'text' }}
              onClick={() => handleBeforeToDetail(record, type)}
            >
              {value}
            </Button>
          );
        },
      },
      {
        width: 170,
        name: 'settleTypeMeaning',
      },
      {
        width: 150,
        name: 'invOrganizationName',
      },
      {
        name: 'companyName',
        width: 250,
      },
      {
        name: 'supplierCompanyName',
        width: 250,
      },
      {
        name: 'currencyCode',
        width: 100,
      },
      {
        name: 'netAmount',
        width: 160,
      },
      {
        name: 'taxAmount',
        width: 120,
      },
      {
        name: 'taxIncludedAmount',
        width: 150,
      },
      {
        name: 'paymentAmount',
        width: 120,
      },
      {
        name: 'applyAmount',
        width: 120,
      },
      {
        name: 'prepaymentAmount',
        width: 120,
      },
      {
        name: 'syncStatusMeaning',
        width: 120,
        renderer: (rendererProps) => statusTagRender({ ...rendererProps, name: 'syncStatus' }),
      },
      {
        name: 'processRemark',
        width: 150,
      },
      {
        name: 'creationDate',
        type: 'date',
        width: 150,
      },
      {
        name: 'createdUserName',
        width: 150,
      },
      {
        name: 'campMeaning',
      },
      {
        width: 150,
        name: 'isPrint',
        renderer: ({ value, text }) => (
          <StatusTag text={text} color={Number(value) === 1 ? 'green' : 'gray'} />
        ),
      },
      {
        name: 'sourceSupplierCompanyName',
        width: 150,
      },
      {
        name: 'sourceSupplierCompanyNum',
        width: 150,
      },
      {
        name: 'supplierSiteCode',
        width: 150,
      },
      !['sync', 'cancel'].includes(type) && {
        name: 'confirmCollaborativeMode',
        width: 150,
      },
      {
        name: 'refundStatus',
        width: 120,
      },
      {
        name: 'prepaymentRefundAmount',
        width: 120,
      },
    ];
    const otherProps = {};
    return remoteProps
      ? remoteProps.process('SSTA_SUPPLYSETTLE_LIST_COLUMNS', standartColumns, otherProps)
      : standartColumns;
  }, [type, handleBeforeToDetail, remoteProps, getOperationCommand]);

  // 后续路由字段默认值更改同步更新字段值
  useEffect(() => {
    const { customizeDs, setFields, handleQuery } = searchBarRef.current;
    const customizeDsCurrent = customizeDs?.current;
    // 自定义的查询条件更新
    if (customizeDsCurrent) {
      customizeDsCurrent.init({
        settleType: defaultSettleType,
        settleNums: defaultSettleNums?.split(','),
      });
    }
    // 个性化配置的查询条件更新
    if (setFields) {
      setFields(
        {
          dateRange: defaultDateRange,
          settleStatus: defaultSettleStatus,
          creationDate: dateRangeTransform(defaultDateRange, true),
        },
        'init'
      );
    }
    if (handleQuery) handleQuery();
  }, [defaultDateRange, defaultSettleNums, defaultSettleType, defaultSettleStatus]);

  // 初始化页面时添加customizeDs默认值
  const handleBindSeachBarRef = useCallback(
    (ref) => {
      searchBarRef.current = ref;
      const { customizeDs } = ref;
      if (!customizeDs.current) customizeDs.create({});
      customizeDs.current.init({
        settleType: defaultSettleType,
        settleNums: defaultSettleNums?.split(','),
      });
    },
    [defaultSettleType, defaultSettleNums]
  );

  return (
    <div className="ssta-search-left-more-fields" style={{ height: 'calc(100vh - 260px)' }}>
      {customizeTable(
        {
          code: wholeTableUnitCodes[type],
        },
        <SearchBarTable
          virtual
          virtualCell
          cacheState
          columns={columns}
          dataSet={tableDs}
          searchCode={wholeSearchUnitCodes[type]}
          searchBarRef={handleBindSeachBarRef}
          searchBarConfig={{
            onQuery: handleQuery,
            onFieldChange: handleFieldChange,
            fieldProps: {
              companyId: { lovPara: { tenantId } },
              supplierCompanyId: { lovPara: { tenantId } },
              settleConfigNum: { lovPara: { tenantId } },
              sourceSupplierCompanyId: { lovPara: { tenantId } },
              currencyCode: { lovPara: { tenantId } },
              settleStatus: {
                // defaultValue为假值时个性化配置才会生效
                defaultValue: defaultSettleStatus && (() => defaultSettleStatus),
              },
              dateRange: {
                // defaultValue为假值时个性化配置才会生效
                defaultValue: defaultDateRange && (() => defaultDateRange),
              },
              supplierSiteId: {
                dynamicProps: {
                  disabled: ({ record }) => !record.get('supplierCompanyId')?.supplierId,
                  lovPara: ({ record }) => ({
                    supplierId: record.get('supplierCompanyId')?.supplierId,
                    tenantId,
                  }),
                },
              },
              creationDate: {
                defaultValue: ({ record }) =>
                  dateRangeTransform(defaultDateRange || record.get('dateRange'), true),
                dynamicProps: {
                  disabled: ({ record }) => {
                    const dateRange = defaultDateRange || record.get('dateRange');
                    return dateRange && dateRange !== 'ALL TIME';
                  },
                },
              },
              settleType: { disabled: true },
            },
            left: {
              render: (_, customizeDs) => (
                <div>
                  <Select
                    name="settleType"
                    dataSet={customizeDs}
                    options={settleTypeOptionDs}
                    placeholder={intl
                      .get('ssta.common.view.message.settleTypeForSearch')
                      .d('请选择结算单类型查询')}
                  />
                  <Divider type="vertical" />
                  <MultiTextFilter
                    name="settleNums"
                    dataSet={customizeDs}
                    placeholder={intl
                      .get('ssta.supplySettle.modal.settleNum')
                      .d('请输入结算单编号查询')}
                  />
                </div>
              ),
            },
          }}
          style={{ maxHeight: 'calc(100% - 22px)' }}
        />
      )}
    </div>
  );
});
