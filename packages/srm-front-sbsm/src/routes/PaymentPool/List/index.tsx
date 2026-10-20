import React, { Fragment, useContext, useMemo, useState, useCallback, useRef } from 'react';
import { isEmpty, omit } from 'lodash';
import { observer } from 'mobx-react';
import { Tabs, Modal, Icon, useModal } from 'choerodon-ui/pro';
import { DataToJSON } from 'choerodon-ui/dataset/data-set/enum';

import intl from 'utils/intl';
import { SRM_SBDM } from '_utils/config';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import ExcelExportPro from 'components/ExcelExportPro';
import DynamicButtons from '_components/DynamicButtons';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';

import ListTable from './components/ListTable';
import StoreProvider, { Store } from './stores';
import commonStyles from '../../../common.less';
import DynamicBtn from '../../../components/DynamicBtn';
import { formatDynamicBtns } from '../../../utils/utils';
import PaymentWorkbenchCreate from '../../PaymentWorkbench/Detail/Create';
import { ActiveKey, ListBtnsCustCode, ListTabsCustCode } from '../utils/type';
import { useModalOpen } from '../../../hooks';
import FillListInfo from './components/FillListInfo';
import BackTipList from './components/BackTipList';

const { TabPane } = Tabs;

const TemplateCodeMap = {
  [ActiveKey.All]: 'SRM_C_SBSM_PAY_POOL',
  [ActiveKey.Pending]: 'SRM_C_SBSM_PAY_POOL',
  [ActiveKey.Error]: 'SRM_C_SBSM_PAY_POOL_ERROR',
};

// 列表页导出组件requestUrl
const ListExportUrl: Record<ActiveKey, string> = {
  [ActiveKey.All]: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-pool-export/all`,
  [ActiveKey.Pending]: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-pool-export/pay`,
  [ActiveKey.Error]: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-pool-export/pay-error`,
};

const List = observer(() => {
  const {
    dsMap,
    cacheState,
    permissionMap,
    customizeTabPane,
    customizeBtnGroup,
    defaultActiveKey,
    fetchTabKeysCount,
    backTipsListDs,
  } = useContext(Store);

  const modalOpen = useModalOpen(useModal());
  const [activeKey, setActiveKey] = useState(defaultActiveKey);
  const currentListDs = useMemo(() => dsMap[activeKey], [dsMap, activeKey]);
  const { selected, queryDataSet } = currentListDs;
  const suspendFlag = queryDataSet?.current?.get('suspendFlag');
  const loading = currentListDs.status !== 'ready';
  const modalRef = useRef<any>();
  const modalBackRef = useRef<any>();

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
        action: currentListDs.getQueryParameter('action'),
        customizeUnitCode: currentListDs.getQueryParameter('customizeUnitCode'),
      });
    }
  }, [selected, currentListDs, queryDataSet]);

  const handleCreate = useCallback(() => {
    const selectedPoolData = currentListDs.selected.map((item) => item.toJSONData());
    Modal.open({
      drawer: true,
      closable: true,
      title: intl.get('hzero.common.button.create').d('新建'),
      className: commonStyles['sbsm-large-modal'],
      bodyStyle: { padding: '0 0 0 20px' },
      children: <PaymentWorkbenchCreate selectedPoolData={selectedPoolData} okCallback={() => currentListDs.query(undefined, undefined, false)} />,
      footer: null,
    });
  }, [currentListDs]);

  const handleCreateAll = useCallback(async () => {
    const confirmRes = await Modal.confirm({
      title: intl.get('sbsm.common.view.title.tip').d('提示'),
      children: intl
        .get('sbsm.common.view.message.confirmAllCreatePayDoc', { num: currentListDs.totalCount })
        .d(
          '已选择【{num}】条待支付事务，全选新建时会根据待支付事务上的付款形式自动并单，不支持调整，是否确认创建'
        ),
    });
    if (confirmRes !== 'ok') return;
    currentListDs.dataToJSON = DataToJSON.all;
    const res = await currentListDs
      .setState('submitType', 'createAll')
      .submit()
      .finally(() => {
        currentListDs.dataToJSON = DataToJSON.selected;
      });
    if (!res) return;
    notification.success({});
  }, [currentListDs]);

  const handleHold = useCallback(async () => {
    const res = await currentListDs.setState('submitType', 'hold').forceSubmit();
    if (!res) return;
    currentListDs.query(undefined, undefined, false);
    fetchTabKeysCount([activeKey]);
  }, [activeKey, currentListDs, fetchTabKeysCount]);

  const handleRevokeHold = useCallback(async () => {
    const res = await currentListDs.setState('submitType', 'revokeHold').forceSubmit();
    if (!res) return;
    currentListDs.query(undefined, undefined, false);
    fetchTabKeysCount([activeKey]);
  }, [activeKey, currentListDs, fetchTabKeysCount]);

  const handleReturnFinal = useCallback(async (allFlag?: string | number) => {
    const backParams = currentListDs.getState('backParams');
    const res = await currentListDs.setState('backParams', filterNullValueObject({...backParams, allFlag})).setState('submitType', 'return').forceSubmit();
    if (!res) return;
    await currentListDs.query(undefined, undefined, false);
    currentListDs.clearCachedSelected();
    currentListDs.unSelectAll();
    fetchTabKeysCount([activeKey]);
    if(modalRef.current && modalRef.current?.close) modalRef.current.close();
    if(modalBackRef.current && modalBackRef.current?.close) modalBackRef.current.close();
  }, [activeKey, currentListDs, fetchTabKeysCount, modalRef]);

  const handleReturnCallback = useCallback(async (data) => {
    const backParams = filterNullValueObject(omit(data, '__dirty'));
    currentListDs.setState('backParams', backParams);
    const payIdList = selected?.map((item) => item?.get('payId'));
    const res = await backTipsListDs.setState('payIdList', payIdList).query();
    if (!res) return;
    if (res?.totalElements === 0) {
      handleReturnFinal();
    } else {
      modalBackRef.current = Modal.open({
        // drawer: true,
        closable: true,
        style: {
          width: 960,
        },
        children: <BackTipList backTipsListDs={backTipsListDs} okCallback={handleReturnFinal} />,
        cancelButton: false,
      });
      return false; // 不关闭退回原因弹框
    }
  }, [handleReturnFinal, currentListDs, selected, backTipsListDs]);

  const handleReturn = useCallback(async () => {
    modalRef.current = modalOpen({
      size: 'small',
      children: <FillListInfo okCallback={handleReturnCallback} action='back' />,
      editFlag: true,
    });
  }, [modalOpen, handleReturnCallback]);

  const buttons = useMemo(() => {
    return formatDynamicBtns([
      activeKey === ActiveKey.Pending && (permissionMap.get('create') || permissionMap.get('createAll')) && {
        name: 'create',
        group: true,
        child: (...customChildArgs) => (
          <DynamicBtn
            icon="add"
            loading={loading}
            customChildArgs={customChildArgs}
            text={intl.get(`hzero.common.button.create`).d('新建')}
            extra={<Icon type="expand_more" style={{ fontSize: 14, margin: '-2px 0 0 4px' }} />}
          />
        ),
        children: [
          permissionMap.get('create') && {
            name: 'selectedCreate',
            child: intl.get(`sbsm.common.view.button.selectedCreate`).d('勾选新建'),
            btnProps: {
              loading,
              icon: 'add',
              wait: 1000,
              disabled: isEmpty(selected),
              onClick: handleCreate,
            },
          },
          permissionMap.get('createAll') && {
            name: 'allCreate',
            child: intl.get(`sbsm.common.button.allCreate`).d('全选新建'),
            btnProps: { loading, wait: 1000, onClick: handleCreateAll },
          },
        ],
      },
      activeKey !== ActiveKey.Error && Number(suspendFlag) === 0 && permissionMap.get('hold') && {
        name: 'hold',
        child: intl.get(`sbsm.common.view.button.hold`).d('暂挂'),
        btnProps: {
          loading,
          icon: 'enhanced_encryption-o',
          funcType: 'flat',
          color: 'default',
          wait: 1000,
          disabled: isEmpty(selected),
          onClick: handleHold,
        },
      },
      activeKey !== ActiveKey.Error && Number(suspendFlag) === 1 && permissionMap.get('hold') && {
        name: 'revokeHold',
        child: intl.get(`sbsm.common.view.button.revokeHold`).d('撤销暂挂'),
        btnProps: {
          loading,
          icon: 'no_encryption-o',
          funcType: 'flat',
          color: 'default',
          wait: 1000,
          disabled: isEmpty(selected),
          onClick: handleRevokeHold,
        },
      },
      activeKey === ActiveKey.All && permissionMap.get('return') && {
        name: 'return',
        child: intl.get(`hzero.common.button.return`).d('退回'),
        btnProps: {
          loading,
          icon: 'reply',
          funcType: 'flat',
          color: 'default',
          wait: 1000,
          disabled: isEmpty(selected),
          onClick: handleReturn,
        },
      },
      permissionMap.get('export') && {
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
          requestUrl: ListExportUrl[activeKey],
          queryParams: getExportParams,
        },
      },
    ]);
  }, [
    loading,
    selected,
    activeKey,
    handleHold,
    suspendFlag,
    handleCreate,
    handleReturn,
    permissionMap,
    handleCreateAll,
    getExportParams,
    handleRevokeHold,
  ]);

  const TabColumns = useMemo(() => {
    return [
      {
        key: ActiveKey.Pending,
        tab: intl.get(`sbsm.paymentPool.view.title.pendingPayment`).d('待支付'),
      },
      {
        key: ActiveKey.Error,
        tab: intl.get(`sbsm.paymentPool.view.title.errorRecordPool`).d('错误记录池'),
      },
      {
        key: ActiveKey.All,
        tab: intl.get(`sbsm.paymentPool.view.title.all`).d('全部'),
      },
    ];
  }, []);

  return (
    <Fragment>
      <Header title={intl.get('sbsm.paymentPool.view.title.paymentPool').d('支付池')}>
        {customizeBtnGroup(
          { code: ListBtnsCustCode, pro: true },
          <DynamicButtons defaultBtnType="c7n-pro" maxNum={5} buttons={buttons} />
        )}
      </Header>
      <Content>
        {customizeTabPane(
          { code: ListTabsCustCode },
          <Tabs keyboard={false} activeKey={activeKey} onChange={handleTabChange}>
            {TabColumns.map(({ key, tab }) => (
              <TabPane
                tab={tab}
                key={key}
                count={dsMap[key].getState('totalCount')}
              >
                <ListTable activeKey={key} />
              </TabPane>
            ))}
          </Tabs>
        )}
      </Content>
    </Fragment>
  );
});

const PaymentPoolList = (props) => <StoreProvider {...props}><List /></StoreProvider>;

export default PaymentPoolList;
