import React, { Fragment, useMemo, useContext, useCallback } from 'react';
import { Modal, Spin } from 'choerodon-ui/pro';
import { Collapse } from 'choerodon-ui';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';

import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import DynamicButtons from '_components/DynamicButtons';

import Summary from './Summary';
import CostRule from './CostRule';
import BasicInfo from './BasicInfo';
import PayRecord from './PayRecord';
import type { StoreValueType } from './stores';
import StoreProvider, { Store } from './stores';
import { formatDynamicBtns } from '../../../utils/utils';
import SyncRecord from '../components/SyncRecord';
import InvoiceRecord from '../components/InvoiceRecord';
import { ServiceDetailBtnsUnitCode } from '../utils/type';
import OperationRecord from '../components/OperationRecord';
import styles from '../index.less';

const { Panel } = Collapse;
const defaultActiveKey = [
  'basic',
  'pay',
  'invoicing',
  'sync',
];

const Detail = () => {

  const {
    remote,
    pubFlag,
    allFlag,
    loading,
    modalFlag,
    serverFeesId,
    serviceHeaderDs,
    customizeTable,
    customizeBtnGroup,
  } = useContext<StoreValueType>(Store);

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
        key: 'invoicing',
        header: intl.get(`ssta.sourcingCost.view.title.invocingRecord`).d('开票记录'),
        content: (
          <InvoiceRecord
            docType='service'
            customizeTable={customizeTable}
            feeDs={serviceHeaderDs}
          />
        ),
      },
      {
        key: 'sync',
        header: intl.get(`ssta.sourcingCost.view.title.syncRecord`).d('同步记录'),
        content: <SyncRecord feeDs={serviceHeaderDs} docType='service' />,
      },
    ].filter((item) => item);
  }, [serviceHeaderDs, customizeTable]);

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
      children: <OperationRecord serverFeesId={serverFeesId} />,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  }, [serverFeesId]);

  const buttons = useMemo(() => {
    const normalBtns = [
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
    const otherProps = { allFlag, loading, serviceHeaderDs };
    const processBtns = remote
      ? remote.process('SSTA.SERVICE_DETAIL_SUP_CUX.HEAD_BTNS', normalBtns, otherProps)
      : normalBtns;
    return formatDynamicBtns(processBtns);
  }, [
    remote,
    loading,
    allFlag,
    serviceHeaderDs,
    handleViewCostRule,
    handleViewOperation,
  ]);

  return (
    <Fragment>
      {!modalFlag && (
        <Header
          backPath={pubFlag ? undefined : "/ssta/supplier-sourcing-cost/list"}
          title={intl.get('ssta.sourcingCost.view.title.serviceFeeDetail').d('服务费详情')}
        >
          {customizeBtnGroup(
            { code: ServiceDetailBtnsUnitCode.HEAD, pro: true },
            <DynamicButtons maxNum={5} defaultBtnType='c7n-pro' buttons={buttons} />
          )}
        </Header>
      )}
      <Content className={`${modalFlag && styles['ssta-detail-modal-content']} ${styles['ssta-detail-content-sourcingCost']}`}>
        <Spin spinning={loading}>
          <Summary />
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
};

const ServiceDetail = (props) => <StoreProvider {...props}><Detail /></StoreProvider>;

export default ServiceDetail;