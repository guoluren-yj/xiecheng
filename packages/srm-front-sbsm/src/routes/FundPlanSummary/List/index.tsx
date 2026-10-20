import React, { Fragment, useContext, useMemo, useCallback, useState } from 'react';
import { isNil, isEmpty } from 'lodash';
import { observer } from 'mobx-react';
import { Tabs, Modal, Tooltip } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import Import from 'components/Import';
import { Header, Content } from 'components/Page';
import ExcelExportPro from 'components/ExcelExportPro';
import DynamicButtons from "srm-front-boot/lib/components/DynamicButtons";
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import { SRM_SBDM } from '_utils/config';

import StoreProvider, { Store } from './stores';
import WholeTable from './components/WholeTable';
import DetailTable from './components/DetailTable';
import QuoteCreate from '../components/Quote/Create';
import { formatDynamicBtns } from '../../../utils/utils';
import { ActiveKey, ListTabsCustCode, ListTableBtnCode, ActionExportType } from '../utils/type';
import styles from '../../../common.less';

const { TabPane, TabGroup } = Tabs;
const TemplateCodeMap: Record<ActiveKey, string> = {
  [ActiveKey.WholePending]: 'SRM_C_SBSM_BALANCE_HEADER_EXPORT',
  [ActiveKey.WholeApprove]: 'SRM_C_SBSM_BALANCE_HEADER_EXPORT',
  [ActiveKey.WholeAll]: 'SRM_C_SBSM_BALANCE_HEADER_EXPORT',
  [ActiveKey.DetailAll]: 'SRM_C_SBSM_BALANCE_LINE_EXPORT ',
};

// 列表页导出组件requestUrl
const ListExportUrl: Record<ActiveKey, string> = {
  [ActiveKey.WholeAll]: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/balance-headers/export`,
  [ActiveKey.WholeApprove]: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/balance-headers/export`,
  [ActiveKey.WholePending]: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/balance-headers/export`,
  [ActiveKey.DetailAll]: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/balance-lines/export`,
};

const List = observer(() => {
  const {
    dsMap,
    cacheState,
    permissionMap,
    handleToDetail,
    fetchTabKeysCount,
    defaultActiveKey,
    customizeTabPane,
    customizeBtnGroup,
  } = useContext(Store);

  const [activeKey, setActiveKey] = useState<ActiveKey>(defaultActiveKey);
  const tableDs = dsMap[activeKey];
  const { selected, queryDataSet } = tableDs;

  const fetchTotalCount = useCallback(() => {
    fetchTabKeysCount([activeKey]);
  }, [activeKey, fetchTabKeysCount]);

  const handleTabChange = useCallback((key) => {
    const currentDs = dsMap[key];
    setActiveKey(key);
    fetchTabKeysCount([key]);
    cacheState.set('activeKey', key);
    if (currentDs.getState('queryStatus') === 'ready') currentDs.query(currentDs.currentPage);
  },
    [setActiveKey, dsMap, cacheState, fetchTabKeysCount]
  );

  const onCreateOkCallback = useCallback((result) => {
    const { balHeaderId } = result;
    if(isNil(balHeaderId)) return;
    handleToDetail(balHeaderId, 'edit');
  }, [handleToDetail]);

  const handleAdd = useCallback(() => {
    Modal.open({
      drawer: true,
      closable: true,
      title: intl.get('sbsm.fundPlan.view.title.create').d('新建'),
      className: styles['sbsm-large-modal'],
      children: <QuoteCreate okCallback={onCreateOkCallback} />,
    });
  }, [onCreateOkCallback]);

  const handleSubmit = useCallback(async() => {
    const res = await tableDs.setState('submitType', 'submit').submit();
    if (!res) return;
    await tableDs.query();
    tableDs.clearCachedSelected();
    tableDs.unSelectAll();
    notification.success({
      description: intl.get('sbsm.fundPlan.view.message.submitTips').d('批量提交中，您可以离开当前页面，提交失败的单据，将通过系统消息展示失败原因，并重新展示在待提交列表'),
    });
  }, [tableDs]);

  const handleAfterCloseExcel = useCallback(() => {
    tableDs.query(undefined, undefined, false);
    fetchTotalCount();
  }, [tableDs, fetchTotalCount]);

  const getQueryParams = useCallback(() => {
    const idList = selected.map((item) => item.key);
    const queryData = queryDataSet?.current?.toData() || {};
    const { primaryKey } = tableDs.props;
    if (selected.length > 0) {
      return filterNullValueObject({ [`${primaryKey}List`]: idList });
    } else {
      return filterNullValueObject({...queryData, exportSearchbarUnitCode: tableDs.getQueryParameter('customizeUnitCode') });
    }
  }, [tableDs, selected, queryDataSet]);

  const buttons: any = useMemo(() => {
    const btns: any = [
      ActiveKey.WholeAll === activeKey && {
        name: 'create',
        child: intl.get('sbsm.fundPlan.view.title.create').d('新建'),
        btnProps: {
          type: 'c7n-pro',
          icon: 'add',
          color: 'primary',
          onClick: handleAdd,
        },
      },
      ActiveKey.WholeAll === activeKey && {
        name: 'submit',
        child: intl.get('hzero.common.button.submit').d('提交'),
        btnProps: {
          type: 'c7n-pro',
          icon: 'check',
          onClick: handleSubmit,
          disabled: isEmpty(selected) || selected.some((record) => !['RETURN', 'NEW'].includes(record?.get('balStatus'))),
        },
      },
      permissionMap?.get('initialExcelImport') && {
        name: 'initialExcelImport',
        btnComp: Import,
        btnProps: {
          businessObjectTemplateCode: 'SBSM.BAL_HEADER_INFANCY',
          prefixPatch: '/sbdm',
          buttonText: (
            <Tooltip
              title={intl
                .get('sbsm.fundPlan.view.tooltip.prepSumInitialExcelImport')
                .d(
                  '该功能仅供项目上线时，编制汇总单期初数据切换（仅支持引用编制来源单据创建场景，不支持引用阶段创建场景），导入后即按业务规则定义的审批方式/并单规则等配置生成编制提报单并自动提交，若需生成已确认状态结算单，注意配置审批方式=无需审批），切换完毕即收回，不可用于上线后用户使用'
                )}
              placement="bottom"
            >
              {intl.get('sbsm.fundPlan.view.button.prepSumInitialExcelImport').d('编制汇总单期初EXCEL导入')}
            </Tooltip>
          ),
          successCallBack: handleAfterCloseExcel,
          args: { templateCode: 'SBSM.BAL_HEADER_INFANCY' },
          buttonProps: { funcType: 'flat' },
        },
      },
      permissionMap?.get('export') && {
        name: 'export',
        btnComp: ExcelExportPro,
        childFor: 'buttonText',
        child: isEmpty(selected)
          ? intl.get(`hzero.common.button.export`).d('导出')
          : intl.get(`hzero.common.button.exportSelect`).d('勾选导出'),
        btnProps: {
          templateCode: TemplateCodeMap[activeKey],
          allBody: true,
          method: 'POST',
          requestUrl: `${ListExportUrl[activeKey]}?tab=${ActionExportType[activeKey]}`,
          queryParams: getQueryParams,
          otherButtonProps: {
            funcType: 'flat',
            permissionList: [],
          },
        },
      },
    ].filter(Boolean);
    return formatDynamicBtns(btns);
  }, [
    activeKey,
    handleAdd,
    permissionMap,
    handleAfterCloseExcel,
    handleSubmit,
    selected,
    getQueryParams,
  ]);

  const wholeColumns = useMemo(() => {
    return [
      {
        key: ActiveKey.WholePending,
        tab: intl.get(`sbsm.fundPlan.view.whole.pending`).d('待提交'),
      },
      {
        key: ActiveKey.WholeApprove,
        tab: intl.get(`sbsm.fundPlan.view.whole.approve`).d('待审批'),
      },
      {
        key: ActiveKey.WholeAll,
        tab: intl.get(`sbsm.fundPlan.view.whole.all`).d('全部'),
      },
    ];
  }, []);


  const detailColumns = useMemo(() => {
    return [
      {
        key: ActiveKey.DetailAll,
        tab: intl.get(`sbsm.fundPlan.view.detail.allLine`).d('明细行'),
      },
    ];
  }, []);

  return (
    <Fragment>
      <Header title={intl.get('sbsm.fundPlan.view.title.fundPlanSummaryWorkBench').d('资金计划汇总工作台')}>
        {customizeBtnGroup(
          { code: ListTableBtnCode, pro: true },
          <DynamicButtons unitCode={ListTableBtnCode} buttons={buttons} maxNum={5} defaultBtnType="c7n-pro" />
        )}
      </Header>
      <div>
        <Content>
          {customizeTabPane(
            {
              code: ListTabsCustCode,
              cascade: true,
            },
            <Tabs keyboard={false} activeKey={activeKey} onChange={handleTabChange}>
              <TabGroup tab={intl.get(`sbsm.fundPlan.view.tabs.whole`).d('整单')} key="whole">
                {wholeColumns.map(({ key, tab }) => (
                  <TabPane
                    tab={tab}
                    key={key}
                    count={dsMap[key].getState('totalCount')}
                  >
                    <WholeTable activeKey={key} />
                  </TabPane>
                ))}
              </TabGroup>
              <TabGroup tab={intl.get(`sbsm.fundPlan.view.tabs.detail`).d('明细')} key="detail">
                {detailColumns.map(({ key, tab }) => (
                  <TabPane
                    tab={tab}
                    key={key}
                    count={dsMap[key].getState('totalCount')}
                  >
                    <DetailTable activeKey={key} />
                  </TabPane>
                ))}
              </TabGroup>
            </Tabs>
          )}
        </Content>
      </div>
    </Fragment>
  );
});

const FundPlanSummaryList = (props) => <StoreProvider {...props}><List /></StoreProvider>;

export default FundPlanSummaryList;
