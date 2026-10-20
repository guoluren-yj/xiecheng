import { parse } from 'querystring';
import type { ParsedUrlQuery } from 'querystring';
import type { ReactElement } from 'react';
import React, { useMemo, useEffect, useState, useCallback, Fragment } from 'react';
import { Tabs, Card } from 'choerodon-ui';
import { observer } from 'mobx-react';
import { DataSet, Spin, Modal } from 'choerodon-ui/pro';
import { flow, isNil, isFunction } from 'lodash';
import { TabsPosition } from 'choerodon-ui/lib/tabs/enum';
import { stringify } from 'querystring';

import intl from 'utils/intl';
import { Header } from 'components/Page';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import DynamicButtons from '_components/DynamicButtons';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import { updateTab, getActiveTabKey } from 'utils/menuTab';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';

import DetailContent from './DetailContent';
import { formatDynamicBtns } from '../../utils/utils';
import type { DetailContentProps } from './DetailContent';
// import BatchEditHeader from './components/BatchEditHeader';
import { invApplyHeaderDS, invApplyLineDS } from './storeDS';
import { confirmSettleInvApply, confirmTenderInvApply, queryInvoicingApplyList } from './api';
import { queryTenderHeaderData } from '../SourcingCostSupplier/utils/api';
import { getSettleHeaderDataSup } from '../../services/settlePoolServices';
import EditorForm from '../Components/EditorForm';
import { formatErrorInfo } from '../Components/ErrorInfo/index';
import { headerCustCodeMap, lineCustCodeMap, HeaderBtnsCustCode, HeaderCollapseCustCode } from './type';
import styles from './index.less';
import OperationRecord from './components/OperationRecord';

type ParsedSearchType = ParsedUrlQuery & {
  type: 'confirm' | 'view' | 'edit' | 'all',
  list?: string,
  source?: string,
  apiType: 'transform' | 'normal', // 使用场景，默认为normal，会影响API接口
  tenderFeesId?: string | number, // 招标文件费id
  applyHeaderId?: string | number, // 发票申请单号
  settleHeaderId?: any, // 结算单id
  settleNum?: string | number, // 结算单id
  docSearchFlag?: string,
  sourceDocId?: string | number,
  sourceDocNum?: string | number,
  operateType?: string | number,
  docFlag?: string,
  dataSource?: string,
  billingType?: string,
};

interface ApplyItem {
  applyHeaderId: string | number,
  applyNum: string,
}

const InvoicingApply = flow(
  observer,
  // @ts-ignore
  withCustomize({
    unitCode: [
      ...Object.values(headerCustCodeMap),
      ...Object.values(lineCustCodeMap),
      HeaderBtnsCustCode, HeaderCollapseCustCode,
    ],
  }),
  formatterCollections({
    code: [
      'ssta.common',
      'ssta.commodity',
      'ssta.costSheet',
      'ssta.invoiceRule',
      'ssta.supplySettle',
      'ssta.invoiceRule',
      'ssta.directPoolSupply',
    ],
  }),
)((props) => {

  const {
    modal,
    match,
    location,
    onConfirm,
    customizeForm,
    customizeTable,
    confirmCallback,
    history,
    source,
    customizeBtnGroup,
  } = props;

  const { params } = match || {};
  const { search = '', state, pathname } = location || {};
  const { applyHeaderId: paramApplyHeaderId } = params || {};
  const {
    type,
    list,
    // apiType = 'normal',
    applyHeaderId: searchApplyHeaderId,
    sourceDocId,
    sourceDocNum,
    docSearchFlag,
    tenderFeesId,
    settleHeaderId,
    // operateType,
    docFlag,
    dataSource,
    billingType: billingTypeSearch,
  } = parse(search.substring(1)) as ParsedSearchType;
  const urlApplyHeaderId = paramApplyHeaderId || searchApplyHeaderId;
  const modalFlag = Boolean(modal);
  const confirmFlag = type === 'confirm';
  const editFlag = type === 'edit';
  const readOnlyFlag = type === 'view' || !type;
  const allFlag = type === 'all';
  const [applyList, setApplyList] = useState<ApplyItem[]>([]);
  const [activeKey, setActiveKey] = useState<string | number>(urlApplyHeaderId);
  const [confirmData, setConfirmData] = useState<Record<string, any>>({});
  const applyHeaderId = activeKey || urlApplyHeaderId;
  const invApplyLineDs = useMemo<DataSet>(() => new DataSet(invApplyLineDS()), []);
  const invApplyHeaderDs = useMemo<DataSet>(() => new DataSet({
    ...invApplyHeaderDS(applyHeaderId),
    children: {
      applyLineDTOList: invApplyLineDs,
    },
  }), [invApplyLineDs, applyHeaderId]);
  const loading = invApplyHeaderDs.status !== 'ready';
  const { applyStatus, billingType: billingTypeHeader } = invApplyHeaderDs?.current?.get(['applyStatus', 'billingType']) || {};
  const billingType = billingTypeSearch || billingTypeHeader;
  console.log(billingTypeSearch, billingTypeHeader, billingType)

  useEffect(() => {
    setActiveKey(urlApplyHeaderId);
    if (!isNil(list)) {
      try {
        setApplyList(JSON.parse(list));
      } catch (e) { throw e; }
    } else {
      setApplyList([]);
    }
  }, [list, urlApplyHeaderId]);

  useEffect(() => {
    if (docSearchFlag) {
      queryInvoicingApplyList(sourceDocId, dataSource, billingType).then((res) => {
        if (getResponse(res)) {
          setApplyList(res);
        }
      });
    }
  }, [docSearchFlag, sourceDocId, dataSource, billingType]);

  const handleInit = useCallback(async () => {
    // 查询结算单信息，提交时需要传给后端
    if (settleHeaderId) {
      const res = getResponse(
        await getSettleHeaderDataSup({ settleHeaderId, documentType: 'INVOICE' })
      );
      if (res) setConfirmData(res);
    } else if (tenderFeesId) {
      const res = getResponse(
        await queryTenderHeaderData({ tenderFeesId })
      );
      if (res) setConfirmData(res);
    }
  }, [settleHeaderId, tenderFeesId]);

  useEffect(() => {
    handleInit();
  }, [handleInit]);

  const handleTabChange = useCallback((newActiveKey) => {
    setActiveKey(newActiveKey);
  }, []);

  const handleCloseModal = useCallback(() => {
    if (modal) modal.close();
  }, [modal]);

  const handleConfirm = useCallback(async () => {
    if (isFunction(onConfirm)) {
      handleCloseModal();
      return onConfirm();
    }
    const sourceDocDataList: Array<[string | number | undefined, Function, Object]> = [
      [settleHeaderId, confirmSettleInvApply, confirmData],
      [tenderFeesId, confirmTenderInvApply, { ...confirmData, invoiceType: invApplyHeaderDs.current?.get('invoiceType') }],
    ];
    const sourceDocData = sourceDocDataList.find(([sourceDocId]) => Boolean(sourceDocId));
    if (!sourceDocData) return;
    const confirmSourceDocFunc = sourceDocData[1];
    const res = getResponse(await confirmSourceDocFunc(sourceDocData[2]));
    if (!res) return;
    notification.success({});
    handleCloseModal();
    if (isFunction(confirmCallback)) confirmCallback();
  }, [onConfirm, confirmData, settleHeaderId, tenderFeesId, confirmCallback, invApplyHeaderDs, handleCloseModal]);

  // const handleBatchEdit = useCallback(() => {
  //   const sourceDocId = settleHeaderId || tenderFeesId;
  //   Modal.open({
  //     drawer: true,
  //     closable: true,
  //     destroyOnClose: true,
  //     className: styles['ssta-medium-modal'],
  //     bodyStyle: { padding: 0 },
  //     title: intl.get('ssta.common.view.title.batchEdit').d('批量编辑'),
  //     children: (
  //       <BatchEditHeader sourceDocId={sourceDocId} invApplyHeaderDs={invApplyHeaderDs} />
  //     ),
  //   });
  // }, [settleHeaderId, tenderFeesId, invApplyHeaderDs]);

  // 校验前端数据
  const handleValidateFrontData = useCallback(async () => {
    const validateRes = await invApplyHeaderDs.validate();
    if (!validateRes) {
      formatErrorInfo(
        invApplyHeaderDs,
        invApplyLineDs,
        intl.get(`ssta.costSheet.view.message.invoiceLineInfo`).d('发票明细信息')
      );
    }
    return validateRes;
  }, [invApplyHeaderDs, invApplyLineDs]);

  const backPath = useMemo(() => {
    return state?.backPath || '/ssta/direct-pool-supply/list';
  }, [state]);

  // 返回
  const handleBack = useCallback(() => {
    if (state?.backPath) {
      updateTab({
        key: getActiveTabKey(),
        search: state?.backPath.split('?')[1],
        state: { backPath: null },
      });
    }
    if (source === 'settle') {
      history.push({
        pathname: `/ssta/purchaser-sourcing-cost/list`,
        // search: stringify({source: 'direct', type: 'all'}),
      });
    } else if (source === 'tenderPurList') {
      history.push({
        pathname: `/ssta/purchaser-sourcing-cost/tender/${sourceDocId}`,
        search: stringify({source: 'direct', type: 'view'}),
      });
    } else if (source === 'tenderPurDetail') {
      history.push({
        pathname: `/ssta/purchaser-sourcing-cost/tender/${sourceDocId}`,
        search: stringify({source: 'direct', type: 'view'}),
      });
    } else if (source === 'tenderSupList') {
      history.push({
        pathname: `/ssta/supplier-sourcing-cost/list`,
        // search: stringify({source: 'direct', type: 'all'}),
      });
    } else if (source === 'tenderSupDetail') {
      history.push({
        pathname: `/ssta/supplier-sourcing-cost/tender/${sourceDocId}`,
        search: stringify({source: 'direct', type: 'view'}),
      });
    } else {
      history.push({
        pathname: `/ssta/direct-pool-supply/list`,
        search: stringify({type: 'invoice-all'}),
      });
    }
  }, [state, source, sourceDocId, history]);

  // 保存
  const handleSave = useCallback(async() => {
    const validateRes = await handleValidateFrontData();
    if (!validateRes) return;
    const res = await invApplyHeaderDs.setState('submitType', 'update').submit();
    if (!res) return;
    await invApplyHeaderDs.query();
    return res;
  }, [handleValidateFrontData, invApplyHeaderDs]);

  // 提交
  const handleSubmit = useCallback(async() => {
    const saveRes = await handleSave();
    if (!saveRes) return;
    const res = await invApplyHeaderDs.setState('submitParam', {sourceDocId, sourceDocNum, dataSource, billingType}).setState('submitType', 'submit').submit();
    if (!res) return;
    handleBack();
  }, [handleSave, handleBack, sourceDocNum, sourceDocId, dataSource, billingType, invApplyHeaderDs]);

  // 删除
  const handleDelete = useCallback(async() => {
    const confirmRes = await Modal.confirm({
      title: intl.get('ssta.common.view.message.tip').d('提示'),
      children: intl
        .get('ssta.common.view.message.deleteDirectConfirm')
        .d('确认要删除当前单据吗?'),
    });
    if (confirmRes !== 'ok') return;
    const res = await invApplyHeaderDs.setState('submitParam', {sourceDocId, sourceDocNum, dataSource}).setState('submitType', 'delete').forceSubmit();
    if (!res) return;
    handleBack();
  }, [handleBack, sourceDocId, sourceDocNum, dataSource, invApplyHeaderDs]);

  const handleToLastDetail = useCallback(() => {
    console.log(parse(search.substring(1)),search)
    const pathSearch = {...parse(search.substring(1)), type: 'edit'};
    updateTab({
      key: getActiveTabKey(),
      search: stringify(pathSearch),
      state: {
        backPath: `${pathname}${search}`,
      },
    });
    history.push({
      pathname,
      search: stringify(pathSearch),
      state: {
        backPath: `${pathname}${search}`,
      },
    });
  }, [history, pathname, search, applyHeaderId, sourceDocNum, sourceDocId, docSearchFlag,search]);

  // 操作记录
  const handleOperationRecord = useCallback(() => {
    Modal.open({
      drawer: true,
      title: intl.get('hzero.common.button.operation').d('操作记录'),
      closable: true,
      key: Modal.key(),
      className: styles['ssta-medium-modal'],
      children: <OperationRecord applyHeaderId={applyHeaderId} />,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  }, [applyHeaderId]);

  const buttons = useMemo(() => {
    let btns: any = [];
    const commonBtn = [
      {
        name: 'operation',
        child: intl.get('hzero.common.button.operating').d('操作记录'),
        btnProps: {
          icon: 'operation_service_request',
          funcType: 'flat',
          color: 'default',
          loading,
          onClick: handleOperationRecord,
        },
      },
    ];
    if (readOnlyFlag) return [];
    else if (confirmFlag) {
      btns = [
        {
          name: 'check',
          child: intl.get('ssta.directPoolSupply.model.directPoolSupply.taxInvoiceConfirm').d('税务开票申请确认'),
          btnProps: {
            loading,
            icon: 'check',
            onClick: handleConfirm,
            wait: 1500,
            waitType: 'throttle',
          },
        },
        // {
        //   name: 'batchEdit',
        //   child: intl.get('ssta.common.view.button.batchEdit').d('批量编辑'),
        //   btnProps: {
        //     icon: 'mode_edit',
        //     loading,
        //     wait: 1500,
        //     onClick: handleBatchEdit,
        //   },
        // },
      ];
    } else if (editFlag) {
      btns =[
        {
          name: 'submit',
          child: intl.get('hzero.common.button.submit').d('提交'),
          btnProps: {
            icon: 'check',
            loading,
            wait: 1000,
            onClick: handleSubmit,
          },
        },
        {
          name: 'save',
          child: intl.get('hzero.common.button.save').d('保存'),
          btnProps: {
            icon: 'save',
            loading,
            onClick: handleSave,
          },
        },
        {
          name: 'delete',
          child: intl.get('hzero.common.button.detele').d('删除'),
          btnProps: {
            icon: 'delete',
            loading,
            onClick: handleDelete,
          },
        },
        ...commonBtn,
      ];
    } else if (allFlag) {
      return [
        ...commonBtn,
        ['NEW'].includes(applyStatus) && {
          name: 'updateBtn',
          child: intl.get('hzero.common.button.edit').d('编辑'),
          btnProps: {
            icon: 'mode_edit',
            loading,
            type: 'c7n-pro',
            // funcType: 'flat',
            color: 'primary',
            onClick: () => handleToLastDetail(),
          },
        },
      ];
    }
    return formatDynamicBtns(btns);
  }, [readOnlyFlag, confirmFlag, editFlag, loading, handleSubmit, handleSave, handleDelete, allFlag, handleToLastDetail, handleConfirm, applyStatus, handleOperationRecord]);

  const detailContentProps = useMemo<DetailContentProps>(() => {
    return {
      loading,
      modalFlag,
      customizeForm,
      customizeTable,
      invApplyLineDs,
      invApplyHeaderDs,
      editFlag,
    };
  }, [
    loading,
    modalFlag,
    customizeForm,
    customizeTable,
    invApplyLineDs,
    invApplyHeaderDs,
    editFlag,
  ]);

  const headerTitle = useMemo(() => {
    if (type === 'confirm') return intl.get('ssta.common.view.title.invoicingApplyConfirm').d('开票申请单确认');
    else if (type === 'edit') return intl.get('ssta.common.view.title.invoicingApplyEdit').d('开票申请单编辑');
    return intl.get('ssta.common.view.title.invoicingApplyView').d('开票申请单查看');
  }, [type]);

  const editorColumns = useMemo(() => {
    const applyInfo: any = applyList[0] || {};
    const { sourceDocTotalNetAmount, sourceDocTotalTaxAmount, sourceDocTotalAmount, purchaseCompanyName, purUnifiedSocialCode, saleCompanyName, saleUnifiedSocialCode } = applyInfo;
    return [
      {name: 'buyer', renderer: () => `${purchaseCompanyName || ''}${purUnifiedSocialCode || ''}`, disabled: true},
      {name: 'seller', renderer: () => `${saleCompanyName || ''}${saleUnifiedSocialCode || ''}`, disabled: true},
      'invoiceDate',
      {name: 'sourceDocTotalNetAmount', renderer: () => sourceDocTotalNetAmount, disabled: true},
      {name: 'sourceDocTotalTaxAmount', renderer: () => sourceDocTotalTaxAmount, disabled: true},
      {name: 'sourceDocTotalAmount', renderer: () => sourceDocTotalAmount, disabled: true},
    ];
  }, [applyList]);

  const getRenderHeaDer = useCallback(() => {
    return (
      <div className={styles['detail-tips-text']}>{intl.get(`ssta.common.direct.invoice.tips`).d('点击可切换开票申请单')}</div>
    );
  }, []);

  const handleBackList = useCallback(() => {
    if (state?.backPath) {
      updateTab({
        key: getActiveTabKey(),
        search: state?.backPath.split('?')[1],
        state: { backPath: null },
      });
    }
  }, [state]);

  if (!invApplyHeaderDs.current) return <Spin />;

  return (
    <Fragment>
      <Header title={headerTitle} backPath={!modalFlag && !docFlag && backPath} onBack={!modalFlag && !docFlag && handleBackList}>
        {customizeBtnGroup(
          { code: HeaderBtnsCustCode, pro: true },
          <DynamicButtons maxNum={5} defaultBtnType="c7n-pro" buttons={buttons} />
        )}
      </Header>
      <div className={`${styles['ssta-detail-wrapper-invoicingApply']} ${applyList.length > 1 && styles['ssta-detail-wrapper-invoicingApply-has-tabs']} ${!modalFlag && styles['ssta-detail-wrapper-invoicingApply-not-modal']}`}>
        {
          applyList.length > 1 && (
            <div className={styles['ssta-detail-wrapper-invoicingApply-header']}>
              <Card bordered={false} className={DETAIL_CARD_CLASSNAME} title={intl.get('ssta.common.view.title.invoicingInfoView').d('开票信息概览')}>
                <span className={styles.tips}>{intl.get('ssta.common.view.title.invoicingInfoViewTips').d('注意：由一张发票结算单拆分的多张开票申请单，只能批量提交或退回。')}</span>
                <EditorForm
                  useWidthPercent
                  columns={3}
                  useColon={false}
                  editorFlag={editFlag}
                  dataSet={invApplyHeaderDs}
                  editorColumns={editorColumns}
                />
              </Card>
            </div>
          )
        }
        {applyList.length > 1 ? (
          <Tabs defaultActiveKey={applyHeaderId} tabBarExtraContent={getRenderHeaDer()} tabPosition={TabsPosition.left} onChange={handleTabChange}>
            {applyList.map((item) => (
              <Tabs.TabPane tab={item.applyNum} key={item.applyHeaderId}>
                <DetailContent {...detailContentProps} />
              </Tabs.TabPane>
            ))}
          </Tabs>
        ) : (
          <DetailContent {...detailContentProps} />
        )}
      </div>
    </Fragment>
  );

}) as (props: any) => ReactElement;

export default InvoicingApply;
