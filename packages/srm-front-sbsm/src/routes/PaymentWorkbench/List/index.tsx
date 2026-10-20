import React, { Fragment, useContext, useMemo, useState, useCallback } from 'react';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react';
import { Tabs, Modal, useModal } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { SRM_SBDM } from '_utils/config';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import ExcelExportPro from 'components/ExcelExportPro';
import PrintProButton from '_components/PrintProButton';
import DynamicButtons from '_components/DynamicButtons';
import { getResponse, filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';

import { checkCurrency } from '../utils/api';
import { useModalOpen } from '../../../hooks';
import commonStyles from '../../../common.less';
import StoreProvider, { Store } from './stores';
import WholeTable from './components/WholeTable';
import PaymentTable from './components/PaymentTable';
import PaymentWorkbenchCreate from '../Detail/Create';
import { formatDynamicBtns } from '../../../utils/utils';
import SettlementTable from './components/StatementTable';
import InitateBep from '../Detail/components/InitiatePay/Bep';
import { ActiveKey, ListBtnsCustCode, ListTabsCustCode } from '../utils/type';

const { TabPane, TabGroup } = Tabs;

const TemplateCodeMap: Record<ActiveKey, string> = {
  [ActiveKey.WholeAll]: 'SRM_C_SBSM_PAY_HEADER_EXPORT',
  [ActiveKey.WholeEdit]: 'SRM_C_SBSM_PAY_HEADER_EXPORT',
  [ActiveKey.WholeApprove]: 'SRM_C_SBSM_PAY_HEADER_EXPORT',
  [ActiveKey.WholeConfirm]: 'SRM_C_SBSM_PAY_HEADER_EXPORT',
  [ActiveKey.WholeReverse]: 'SRM_C_SBSM_PAY_HEADER_EXPORT',
  [ActiveKey.DetailPayment]: 'SRM_C_SBSM_PAY_HEADER_LINE_EXPORT',
  [ActiveKey.DetailStatement]: 'SRM_C_SBSM_PAY_HEADER_STATEMENT_LINE_EXPORT',
};

// 列表页导出组件requestUrl
const ListExportUrlMap: Record<ActiveKey, string> = {
  [ActiveKey.WholeAll]: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-header-export/all`,
  [ActiveKey.WholeEdit]: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-header-export/edit`,
  [ActiveKey.WholeApprove]: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-header-export/approve`,
  [ActiveKey.WholeConfirm]: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-header-export/pay-confirm`,
  [ActiveKey.WholeReverse]: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-header-export/pay-reverse`,
  [ActiveKey.DetailPayment]: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-header-export/line`,
  [ActiveKey.DetailStatement]: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-header-export/statement-line`,
};

const List = observer(() => {
  const {
    dsMap,
    remote,
    cacheState,
    permissionMap,
    customizeTable,
    customizeTabPane,
    customizeBtnGroup,
    defaultActiveKey,
    fetchTabKeysCount,
  } = useContext(Store);
  const modalOpen = useModalOpen(useModal());
  const [activeKey, setActiveKey] = useState(defaultActiveKey);
  const currentListDs = useMemo(() => dsMap[activeKey], [dsMap, activeKey]);
  const { selected, queryDataSet } = currentListDs;
  const loading = currentListDs.status !== 'ready';

  // 切换Tab页回调
  const handleTabChange = useCallback((key) => {
    const currentDs = dsMap[key];
    setActiveKey(key);
    cacheState.set('activeKey', key);
    if (currentDs.getState('queryStatus') === 'ready') currentDs.query(currentDs.currentPage);
    fetchTabKeysCount([key]);
  },
    [dsMap, cacheState, fetchTabKeysCount]
  );

  const getExportParams = useCallback(() => {
    const idList = selected.map((item) => item.key);
    const { primaryKey } = currentListDs.props;
    const queryData = queryDataSet?.current?.toData() || {};
    if (selected.length > 0) {
      return filterNullValueObject({ [`${primaryKey}List`]: idList });
    } else {
      return filterNullValueObject({
        ...queryData,
        actionType: currentListDs.getQueryParameter('actionType'),
        customizeUnitCode: currentListDs.getQueryParameter('customizeUnitCode'),
      });
    }
  }, [selected, currentListDs, queryDataSet]);

  const handleCreate = useCallback((otherProps = {}) => {
    Modal.open({
      drawer: true,
      closable: true,
      title: intl.get('hzero.common.button.create').d('新建'),
      className: commonStyles['sbsm-large-modal'],
      bodyStyle: { padding: '0 0 0 20px' },
      children: <PaymentWorkbenchCreate okCallback={() => currentListDs.query()} {...otherProps} />,
      footer: null,
    });
  }, [currentListDs]);

  const handleBatchSubmit = useCallback(async () => {
    const res = await currentListDs.setState('submitType', 'submit').submit();
    if (!res) return;
    notification.success({});
    currentListDs.query(undefined, undefined, false);
  }, [currentListDs]);

  const handleInitiateBep = useCallback(async () => {
    const topSelected = currentListDs.selected;
    const res = getResponse(await checkCurrency(topSelected.map(record => record?.key)));
    if (!res) return;
    modalOpen({
      size: 'large',
      editFlag: true,
      title: intl.get('sbsm.paymentWorkbench.view.button.bepEmailVrify').d('银企支付邮箱验证'),
      children: <InitateBep topSelected={topSelected} customizeTable={customizeTable} okCallback={() => currentListDs.query(undefined, undefined, false)} />,
    });
  }, [modalOpen, currentListDs, customizeTable]);

  const buttons = useMemo(() => {
    const normalBtns = [
      (permissionMap.get('create') || permissionMap.get('createAll')) && {
        name: 'create',
        child: intl.get(`hzero.common.button.create`).d('新建'),
        btnProps: {
          icon: 'add',
          wait: 1000,
          onClick: () => handleCreate(),
        },
      },
      activeKey === ActiveKey.WholeAll && permissionMap.get('batchSubmit') && {
        name: 'batchSubmit',
        child: intl.get('sbsm.common.button.batchSubmit').d('批量提交'),
        btnProps: {
          loading,
          wait: 1000,
          icon: 'check',
          disabled: isEmpty(selected) || selected.some(item => !['NEW', 'RETURN'].includes(item.get('payStatus'))),
          onClick: handleBatchSubmit,
        },
      },
      activeKey === ActiveKey.WholeConfirm && permissionMap.get('bepInitiate') && {
        name: 'bep',
        child: intl.get('sbsm.common.view.button.bep').d('银企支付'),
        btnProps: {
          loading,
          wait: 1000,
          icon: 'near_me',
          disabled: isEmpty(selected) || selected.some(item => item.get('payForm') !== 'BANK_CORPORATE_EXPRESS'),
          onClick: handleInitiateBep,
        },
      },
      (activeKey.startsWith('whole') && permissionMap.get('wholeExport') ||
        activeKey.startsWith('detail') && permissionMap.get('detailExport')) && {
        name: 'export',
        btnComp: ExcelExportPro,
        childFor: 'buttonText',
        child: isEmpty(selected)
          ? intl.get(`sbsm.common.view.button.export`).d('导出')
          : intl.get(`sbsm.common.view.button.selectedExport`).d('勾选导出'),
        btnProps: {
          templateCode: TemplateCodeMap[activeKey],
          otherButtonProps: { funcType: 'flat' },
          method: 'POST',
          allBody: true,
          requestUrl: ListExportUrlMap[activeKey],
          queryParams: getExportParams,
        },
      },
      permissionMap.get('print') && {
        name: 'print',
        btnComp: PrintProButton,
        childFor: 'buttonText',
        child: intl.get('sbsm.common.view.button.print').d('打印'),
        btnProps: {
          buttonProps: { funcType: 'flat', disabled: isEmpty(selected) },
          requestUrl: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-headers/print`,
          method: 'PUT',
          data: { payHeaderIds: selected.map((item) => item.key) },
          loading,
        },
      },
    ];
    const processBtns = remote ? remote.process('SBSM.PAYMENT_WORKBENCH_LIST_CUX.HEAD_BTNS', normalBtns, {
      selected,
      activeKey,
      handleCreate,
      currentListDs,
    }) : normalBtns;
    return formatDynamicBtns(processBtns);
  }, [
    remote,
    loading,
    selected,
    activeKey,
    handleCreate,
    currentListDs,
    permissionMap,
    getExportParams,
    handleInitiateBep,
    handleBatchSubmit,
  ]);

  const wholePaneList = useMemo(() => {
    return [
      {
        key: ActiveKey.WholeEdit,
        tab: intl.get(`sbsm.paymentWorkbench.view.title.editable`).d('可编辑'),
        showFlag: permissionMap.get('edit'),
      },
      {
        key: ActiveKey.WholeApprove,
        tab: intl.get(`sbsm.paymentWorkbench.view.title.approveable`).d('可审核'),
      },
      {
        key: ActiveKey.WholeConfirm,
        tab: intl.get(`sbsm.paymentWorkbench.view.title.paymentConfirm`).d('支付确认'),
      },
      {
        key: ActiveKey.WholeReverse,
        tab: intl.get(`sbsm.paymentWorkbench.view.title.reverseable`).d('可冲销'),
      },
      {
        key: ActiveKey.WholeAll,
        tab: intl.get(`sbsm.paymentWorkbench.view.title.all`).d('全部'),
      },
    ].filter(({ showFlag }) => showFlag !== false);
  }, [permissionMap]);

  const detailPaneList = useMemo(() => {
    return [
      {
        key: ActiveKey.DetailPayment,
        tab: intl.get(`sbsm.paymentWorkbench.view.title.paymentLine`).d('支付行'),
        children: <PaymentTable />,
      },
      {
        key: ActiveKey.DetailStatement,
        tab: intl.get(`sbsm.paymentWorkbench.view.title.statementLine`).d('流水行'),
        children: <SettlementTable />,
      },
    ];
  }, []);

  return (
    <Fragment>
      <Header title={intl.get('sbsm.paymentWorkbench.view.title.paymentWorkbench').d('支付工作台')}>
        {customizeBtnGroup(
          { code: ListBtnsCustCode, pro: true },
          <DynamicButtons defaultBtnType="c7n-pro" maxNum={5} buttons={buttons} />
        )}
      </Header>
      <Content>
        {customizeTabPane(
          { code: ListTabsCustCode, cascade: true },
          <Tabs keyboard={false} activeKey={activeKey} onChange={handleTabChange}>
            <TabGroup tab={intl.get(`sbsm.paymentWorkbench.view.title.wholeOrder`).d('整单')} key="whole">
              {wholePaneList.map(({ key, tab }) => (
                <TabPane
                  tab={tab}
                  key={key}
                  count={dsMap[key].getState('totalCount')}
                >
                  <WholeTable activeKey={key} />
                </TabPane>
                ))}
            </TabGroup>
            <TabGroup tab={intl.get(`sbsm.paymentWorkbench.view.title.detail`).d('明细')} key="detail">
              {detailPaneList.map(({ key, tab, children }) => (
                <TabPane
                  tab={tab}
                  key={key}
                  count={dsMap[key].getState('totalCount')}
                >
                  {children}
                </TabPane>
                ))}
            </TabGroup>
          </Tabs>
        )}
      </Content>
    </Fragment>
  );
});

const PaymentWorkbenchList = (props) => <StoreProvider {...props}><List /></StoreProvider>;

export default PaymentWorkbenchList;