import React, { useMemo, useContext } from 'react';
import { Spin } from 'choerodon-ui/pro';
import { Collapse } from 'choerodon-ui';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import commonStyles from '@/routes/common.less';
import { NavigationAnchor } from '@/routes/Components';
import LogisticsInfo from '@/routes/Components/LogisticsInfo';
import AmountSummary from '../components/AmountSummary';
import BasicInfo from '../components/BasicInfo';
import AttachmentInfo from '../components/AttachmentInfo';
import OtherInfo from '../components/OtherInfo';
import SettleLine from '../components/SettleLine';
import TaxInvoice from '../components/TaxInvoice';
import PaymentInfo from '../components/PaymentInfo';
import DirectInvInfoNew from '../components/DirectInvInfoNew';
import CuszLineSlot from '../components/CuszLineSlot';
import { Store } from './StoreProvider';
import WorkflowCard from '../components/WorkflowCard';
import PaymentStage from '../components/PaymentStage';

const { Panel } = Collapse;
const collapseCode = 'SSTA.SUPPLY_SETTLE_DETAIL.COLLAPSE';

export default (props) => {
  const { headerBtns } = props;
  const {
    loading,
    settleList,
    custConfig,
    documentType,
    payAreaShow,
    settleLineDs,
    settleHeaderDs,
    settleHeaderId,
    customizeCollapse,
    invoiceMatchRuleCode,
    uxCssObj,
    isNewPub,
    modalFlag,
    isOverviewPub,
    updateFlag,
    approveFlag,
    remoteProps,
  } = useContext(Store);
  const logisticsInfoStr = settleHeaderDs.current?.get('logisticsInfo');
  const { uxDisplayAreas } = uxCssObj;

  const paneList = useMemo(() => {
    const sourcePanelList = [
      !isNewPub && {
        key: 'basic',
        title: intl.get(`ssta.supplySettle.view.title.basicInfo`).d('基本信息'),
        content: <BasicInfo />,
      },
      {
        key: 'line',
        title: intl.get(`ssta.supplySettle.view.title.settleDetailInfo`).d('结算明细信息'),
        content: <SettleLine />,
        className: commonStyles['ssta-no-expand-search-bar-wrapper'],
      },
      {
        key: 'cuszLine',
        title: intl.get(`ssta.purchaseSettle.view.title.settleDetailInfo`).d('结算明细信息'),
        content: <CuszLineSlot />,
      },
      documentType === 'INVOICE' && {
        key: 'tax',
        title: intl.get(`ssta.supplySettle.view.title.taxInvoiceDetail`).d('税务发票明细'),
        content: <TaxInvoice />,
      },
      payAreaShow && {
        key: 'pay',
        title: intl.get(`ssta.supplySettle.view.title.collectionInfo`).d('收款信息'),
        content: <PaymentInfo />,
      },
      documentType === 'PAYMENT' && {
        key: 'paymentStage',
        title: intl.get(`ssta.purchaseSettle.view.title.paymentStage`).d('付款阶段信息'),
        content: <PaymentStage />,
      },
      documentType === 'INVOICE' &&
        invoiceMatchRuleCode === 'DIRECT_INVOICING' && {
          key: 'direct',
          title: intl.get(`ssta.supplySettle.view.title.invoiceBillInfo`).d('税务开票信息'),
          content: <DirectInvInfoNew />,
        },
      !isNewPub && {
        key: 'other',
        title: intl.get(`ssta.supplySettle.message.panel.otherInfo`).d('其他信息'),
        content: <OtherInfo />,
      },
      logisticsInfoStr && {
        key: 'logistics',
        title: intl.get(`ssta.common.view.title.logisticsInfo`).d('物流信息'),
        content: <LogisticsInfo dataSourceStr={logisticsInfoStr} />,
      },
      {
        key: 'attachment',
        title: intl.get(`ssta.supplySettle.message.panel.attachment`).d('附件'),
        content: <AttachmentInfo />,
      },
    ].filter(Boolean);
    // 二开埋点 【srm-front-cux-3sbio】
    return remoteProps
      ? remoteProps.process('SSTA_SUPPLYSETTLE_DETAIL_PROCESS_PANEL_LIST', sourcePanelList, {
          settleHeaderDs,
          settleHeaderId,
          updateFlag,
          approveFlag,
        })
      : sourcePanelList;
  }, [
    isNewPub,
    documentType,
    invoiceMatchRuleCode,
    payAreaShow,
    logisticsInfoStr,
    remoteProps,
    settleHeaderDs,
    updateFlag,
    approveFlag,
    settleHeaderId,
  ]);

  const defaultActiveKey = useMemo(() => {
    if (isOverviewPub) {
      return ['line', 'attachment'];
    } else {
      return paneList.map((item) => item.key);
    }
  }, [paneList, isOverviewPub]);

  const linkList = useMemo(
    () =>
      paneList.map((item) => {
        const { key, title } = item;
        return { key, title, href: `supply-settle-${key}-${settleHeaderId}` };
      }),
    [paneList, settleHeaderId]
  );

  return (
    <div
      id={`supply-settle-detail-content-${settleHeaderId}`}
      className={`${modalFlag && commonStyles['ssta-detail-modal-content']} ${
        commonStyles['ssta-detail-content']
      } ssta-detail-splite-content`}
    >
      <Spin spinning={loading}>
        {isNewPub && <WorkflowCard headerBtns={headerBtns} />}
        {!isOverviewPub && (uxDisplayAreas || []).length > 0 && <AmountSummary />}
        <div className="ssta-detail-collapse-content">
          {customizeCollapse(
            {
              code: collapseCode,
            },
            <Collapse
              ghost
              trigger="icon"
              expandIconPosition="text-right"
              defaultActiveKey={defaultActiveKey}
            >
              {paneList.map((item) => {
                const { key, title, content, className = '' } = item;
                const dataSet = key === 'line' ? settleLineDs : settleHeaderDs;
                return (
                  <Panel
                    forceRender
                    key={key}
                    header={title}
                    dataSet={dataSet}
                    id={`supply-settle-${key}-${settleHeaderId}`}
                    className={className}
                  >
                    {content}
                  </Panel>
                );
              })}
            </Collapse>
          )}
        </div>
        {isEmpty(settleList) && (
          <NavigationAnchor
            linkList={linkList}
            currentOffsetTop={360}
            custConfig={custConfig[collapseCode]}
            id={`supply-settle-detail-content-${settleHeaderId}`}
          />
        )}
      </Spin>
    </div>
  );
};
