import { stringify } from 'querystring';
import React, { Fragment, useMemo, useContext, useCallback } from 'react';
import { Spin, Modal } from 'choerodon-ui/pro';
import { Collapse } from 'choerodon-ui';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react';
import { DataSetStatus } from 'choerodon-ui/dataset/data-set/enum';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { Header, Content } from 'components/Page';
import DynamicButtons from '_components/DynamicButtons';

import Summary from './Summary';
import CostRule from './CostRule';
import BasicInfo from './BasicInfo';
import PayRecord from './PayRecord';
import type { StoreValueType } from './stores';
import StoreProvider, { Store } from './stores';
import SyncRecord from '../components/SyncRecord';
import TenderFeePay from '../components/TenderPay';
import { tenderActionFlagger } from '../utils/utils';
import InvoiceRecord from '../components/InvoiceRecord';
import { TenderDetailBtnsUnitCode } from '../utils/type';
import OperationRecord from '../components/OperationRecord';
import TenderPayConfirm from '../components/TenderPayConfirm';
import SelectInvoiceType from '../components/SelectInvoiceType';
import { TooltipButtonPro } from '../../Components/TooltipButton';
import { formatDynamicBtns, openEmbedPage } from '../../../utils/utils';
import { previewInvoicingApply, queryInvoicingApplyList } from '../utils/api';
import styles from '../index.less';

const { Panel } = Collapse;
const defaultActiveKey = [
  'basic',
  'pay',
  'invoice',
  'sync',
];

const Detail = observer(() => {

  const {
    remote,
    allFlag,
    pubFlag,
    loading,
    modalFlag,
    tenderFeesId,
    permissionMap,
    tenderHeaderDs,
    customizeTable,
    customizeBtnGroup,
    history,
  } = useContext<StoreValueType>(Store);

  const { payConfirmFlag } = tenderActionFlagger(tenderHeaderDs.current);

  const {
    payFlag,
    invoicingFlag,
  } = tenderActionFlagger(tenderHeaderDs.current);

  const paneList = useMemo(() => {
    return [
      {
        key: 'basic',
        header: intl.get(`ssta.sourcingCost.view.title.basicInfo`).d('基本信息'),
        content: <BasicInfo />,
      },
      {
        key: 'pay',
        header: intl.get(`ssta.sourcingCost.view.title.payRecord`).d('缴纳记录'),
        content: <PayRecord />,
      },
      {
        key: 'invoice',
        header: intl.get(`ssta.sourcingCost.view.title.invoicingRecord`).d('开票记录'),
        content: <InvoiceRecord docType='tender' customizeTable={customizeTable} feeDs={tenderHeaderDs} />,
      },
      {
        key: 'sync',
        header: intl.get(`ssta.sourcingCost.view.title.syncRecord`).d('同步记录'),
        content: <SyncRecord feeDs={tenderHeaderDs} docType='tender' />,
      },
    ].filter((item) => item);
  }, [tenderHeaderDs, customizeTable]);

  // 招标文件费用缴纳
  const handlePay = useCallback(() => {
    Modal.open({
      drawer: true,
      closable: true,
      key: Modal.key(),
      className: styles['ssta-medium-modal'],
      title: intl.get('ssta.sourcingCost.view.button.pay').d('缴纳') + tenderHeaderDs.current?.get('tenderFeesNum'),
      children: <TenderFeePay tenderFeesId={tenderFeesId} />,
    });
  }, [tenderFeesId, tenderHeaderDs]);

  // 缴纳确认
  const handleConfirmPay = useCallback(() => {
    Modal.open({
      drawer: true,
      closable: true,
      key: Modal.key(),
      className: styles['ssta-small-modal'],
      title: intl.get('ssta.sourcingCost.view.button.payConfirm').d('缴纳确认') + tenderHeaderDs.current?.get('tenderFeesNum'),
      children: <TenderPayConfirm tenderRecord={tenderHeaderDs.current} okCallback={() => tenderHeaderDs.query()} />,
    });
  }, [tenderHeaderDs]);

  // 开票
  const handleInvoicing = useCallback(async (invoiceType) => {
    tenderHeaderDs.status = DataSetStatus.loading;
    const previewRes = getResponse(await previewInvoicingApply({ tenderFeesId, invoiceType }));
    tenderHeaderDs.status = DataSetStatus.ready;
    if (!previewRes) return false;
    tenderHeaderDs.query();
    tenderHeaderDs.status = DataSetStatus.loading;
    const applyListRes = getResponse(await queryInvoicingApplyList(tenderFeesId));
    tenderHeaderDs.status = DataSetStatus.ready;
    if (!applyListRes || isEmpty(applyListRes)) return false;
    const applyList = applyListRes.map(({ applyNum, applyHeaderId }) => ({ applyNum, applyHeaderId }));
    const { applyHeaderId, billingType } = applyList[0];
    const tenderFeesNum = tenderHeaderDs.current?.get('tenderFeesNum');
    const baseSearch: Record<string, any> = { dataSource: 'SRM_TENDER_FEES', applyHeaderId, tenderFeesId, sourceDocId: tenderFeesId, sourceDocNum: tenderFeesNum, docSearchFlag: applyList.length > 1, type: 'edit', source: 'tenderSupDetail', apiType: 'normal', billingType };
    history.push({
      pathname: `/ssta/direct-pool-supply/apply/detail`,
      search: stringify(baseSearch),
    });
  }, [tenderFeesId, tenderHeaderDs, history]);

  const handleSelectInvoiceType = useCallback(() => {
    Modal.open({
      drawer: true,
      closable: true,
      key: Modal.key(),
      title: intl.get('ssta.sourcingCost.view.title.selectInvoiceType').d('请选择发票类型'),
      children: <SelectInvoiceType okCallback={handleInvoicing} />,
      className: styles['ssta-small-modal'],
    });
  }, [handleInvoicing]);

  const handleViewCostRule = useCallback(() => {
    Modal.open({
      drawer: true,
      closable: true,
      key: Modal.key(),
      title: intl.get('ssta.sourcingCost.view.button.sourcingCostRule').d('寻源费用规则'),
      className: styles['ssta-small-modal'],
      children: <CostRule />,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  }, []);

  const handleViewOperation = useCallback(() => {
    Modal.open({
      drawer: true,
      closable: true,
      key: Modal.key(),
      title: intl.get('hzero.common.button.operation').d('操作记录'),
      className: styles['ssta-medium-modal'],
      children: <OperationRecord tenderFeesId={tenderFeesId} />,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  }, [tenderFeesId]);

  const buttons = useMemo(() => {
    const normalBtns = [
      allFlag && payFlag && {
        name: 'pay',
        child: intl.get('ssta.sourcingCost.view.button.pay').d('缴纳'),
        btnProps: {
          loading,
          icon: 'auto_complete',
          onClick: handlePay,
        },
      },
      allFlag && payConfirmFlag && permissionMap?.get('tenderPayConfirm') && {
        name: 'payConfirm',
        child: intl.get('ssta.sourcingCost.view.button.payConfirm').d('缴纳确认'),
        btnProps: {
          loading,
          wait: 1500,
          icon: 'auto_complete',
          onClick: handleConfirmPay,
        },
      },
      allFlag && invoicingFlag && {
        name: 'invoicing',
        btnComp: TooltipButtonPro,
        child: intl.get('ssta.sourcingCost.view.button.invoicing').d('开票'),
        btnProps: {
          loading,
          wait: 1000,
          icon: 'payments-o',
          onClick: handleSelectInvoiceType,
          disabled: !tenderHeaderDs.current?.get('supplierTenantId'),
          tooltip: !tenderHeaderDs.current?.get('supplierTenantId') && intl.get('ssta.sourcingCost.view.button.invoiceEntry.help').d('供应商未关联平台供应商，暂不支持开票。'),
        },
      },
      {
        name: 'costRule',
        child: intl.get('ssta.sourcingCost.view.button.sourcingCostRule').d('寻源费用规则'),
        btnProps: {
          loading,
          icon: 'ballot',
          funcType: FuncType.flat,
          color: ButtonColor.default,
          onClick: handleViewCostRule,
        },
      },
      {
        name: 'operationRecord',
        child: intl.get('hzero.common.button.operation').d('操作记录'),
        btnProps: {
          loading,
          icon: 'assignment',
          funcType: FuncType.flat,
          color: ButtonColor.default,
          onClick: handleViewOperation,
        },
      },
    ];
    const otherProps = { allFlag, loading, tenderHeaderDs };
    const processBtns = remote
      ? remote.process('SSTA.TENDER_DETAIL_SUP_CUX.HEAD_BTNS', normalBtns, otherProps)
      : normalBtns;
    return formatDynamicBtns(processBtns);
  }, [
    remote,
    payFlag,
    allFlag,
    loading,
    handlePay,
    permissionMap,
    invoicingFlag,
    tenderHeaderDs,
    payConfirmFlag,
    handleConfirmPay,
    handleViewCostRule,
    handleViewOperation,
    handleSelectInvoiceType,
  ]);

  return (
    <Fragment>
      {!modalFlag && (
        <Header
          backPath={pubFlag ? undefined : "/ssta/supplier-sourcing-cost/list"}
          title={intl.get('ssta.sourcingCost.view.title.tenderFileFeeDetail').d('招标文件费详情')}
        >
          {customizeBtnGroup(
            { code: TenderDetailBtnsUnitCode.HEAD, pro: true },
            <DynamicButtons maxNum={5} defaultBtnType='c7n-pro' buttons={buttons} />
          )}
        </Header>
      )}
      <Content className={`${modalFlag && styles['ssta-detail-modal-content']} ${styles['ssta-detail-content-sourcingCost']}`}>
        <Spin spinning={loading}>
          {remote ? remote.render('SSTA.TENDER_DETAIL_SUP_CUX.HEAD_SUMMARY', <Summary />) : <Summary />}
          <Collapse
            ghost
            trigger="icon"
            expandIconPosition="text-right"
            defaultActiveKey={defaultActiveKey}
          >
            {paneList.map((item) => {
              const { content, ...panelProps } = item;
              return (
                <Panel {...panelProps}>
                  {content}
                </Panel>
              );
            })}
          </Collapse>
        </Spin>
      </Content>
    </Fragment>
  );
});

const TenderDetail = (props) => <StoreProvider {...props}><Detail /></StoreProvider>;

export default TenderDetail;
