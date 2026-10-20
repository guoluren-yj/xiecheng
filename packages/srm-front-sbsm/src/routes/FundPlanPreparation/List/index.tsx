import React, { Fragment, useContext, useMemo, useCallback, useEffect, useState } from 'react';
import { Tabs, Modal, Tooltip } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import Import from 'components/Import';
import { Header, Content } from 'components/Page';
import ExcelExportPro from 'components/ExcelExportPro';
import DynamicButtons from "srm-front-boot/lib/components/DynamicButtons";
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import { SRM_SBDM } from '_utils/config';

import type { StoreValueType } from './stores';
import StoreProvider, { Store } from './stores';
import WholeTable from './components/WholeTable';
import DetailTable from './components/DetailTable';
import { ActiveKey, ListTabsCustCode, ListTableBtnCode, ActionExportType } from '../utils/type';
import { formatDynamicBtns } from '../../../utils/utils';
import CreateList from './Create';
import styles from '../../../common.less';

const { TabPane, TabGroup } = Tabs;

const TemplateCodeMap: Record<ActiveKey, string> = {
  [ActiveKey.WholePending]: 'SRM_C_SRM_SBSM_FP_PREP_HEADER_EXPORT',
  [ActiveKey.WholeApprove]: 'SRM_C_SRM_SBSM_FP_PREP_HEADER_EXPORT',
  [ActiveKey.WholeAll]: 'SRM_C_SRM_SBSM_FP_PREP_HEADER_EXPORT',
  [ActiveKey.DetailAll]: 'SRM_C_SRM_SBSM_FP_PREP_LINE_EXPORT ',
};

// 列表页导出组件requestUrl
const ListExportUrl: Record<ActiveKey, string> = {
  [ActiveKey.WholeAll]: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/prep-headers/export`,
  [ActiveKey.WholeApprove]: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/prep-headers/export`,
  [ActiveKey.WholePending]: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/prep-headers/export`,
  [ActiveKey.DetailAll]: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/prep-lines/export`,
};


const List = observer(() => {
  const {
    dsMap,
    defaultActiveKey,
    cacheState,
    getTotalCount,
    isOpenClearCashed,
    location,
    setIsOpenClearCashed,
    // handleToDetail,
    customizeTabPane,
    customizeBtnGroup,
    history,
    permissionMap,
  } = useContext(Store) as StoreValueType;

  const [activeKey, setActiveKey]: any = useState(defaultActiveKey);
  const { state } = location || {};

  const tableDs = dsMap[activeKey];
  const { selected, queryDataSet } = tableDs;

  // 切换Tab页回调
  const handleTabChange = useCallback((key) => {
    const currentDs = dsMap[key];
    setActiveKey(key);
    cacheState.set('activeKey', key);
    if (currentDs.getState('queryStatus') === 'ready') currentDs.query(currentDs.currentPage);
  },
    [setActiveKey, dsMap, cacheState]
  );

  useEffect(() => {
    getTotalCount(activeKey);
  }, [getTotalCount, activeKey]);

  // 如果是在详情操作后返回的列表页需要情况缓存的勾选
  useEffect(() => {
    if (tableDs && isOpenClearCashed && state?._back !== -1) {
      const { selected } = tableDs;
      tableDs.batchUnSelect(selected);
      setIsOpenClearCashed(false);
    }
  }, [tableDs, isOpenClearCashed, state, setIsOpenClearCashed]);

  const handleAfterCloseExcel = useCallback(() => {
    tableDs.query(undefined, undefined, false);
    getTotalCount(activeKey);
  }, [tableDs, activeKey, getTotalCount]);

  // 点击提交
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

  const getQueryParams = useCallback(() => {
    const idList = selected.map((item) => item.key);
    const queryData = queryDataSet?.current?.toData() || {};
    const { primaryKey } = tableDs.props;
    if (selected.length > 0) {
      return filterNullValueObject({ [`${primaryKey}List`]: idList });
    } else {
      return filterNullValueObject({...queryData, exportSearchbarUnitCode: tableDs.getQueryParameter('customizeUnitCode')});
    }
  }, [tableDs, selected, queryDataSet]);

  const handleAdd = useCallback(() => {
    Modal.open({
      drawer: true,
      closable: true,
      title: intl.get('sbsm.fundPlan.view.title.create').d('新建'),
      className: styles['sbsm-large-modal'],
      children: <CreateList ds={tableDs} history={history} />,
    });
  }, [tableDs, history]);

  const buttons: any = useMemo(() => {
    const btns: any = [
      {
        name: 'create',
        child: intl.get('sbsm.fundPlan.view.title.create').d('新建'),
        btnProps: {
          type: 'c7n-pro',
          icon: 'add',
          onClick: handleAdd,
        },
      },
      permissionMap?.get('batchSubmit') && activeKey !== ActiveKey.DetailAll && {
          name: 'submit',
          child: intl.get('hzero.common.button.submit').d('提交'),
          btnProps: {
            type: 'c7n-pro',
            icon: 'check',
            onClick: handleSubmit,
            disabled: isEmpty(selected) || selected.some((record) => !['RETURN', 'NEW'].includes(record?.get('prepReportStatus'))),
          },
      },
      permissionMap?.get('initialExcelImport') && {
        name: 'initialExcelImport',
        btnComp: Import,
        btnProps: {
          businessObjectTemplateCode: 'SBSM.PREP_HEADER_INFANCY',
          prefixPatch: '/sbdm',
          buttonText: (
            <Tooltip
              title={intl
                .get('sbsm.fundPlan.view.tooltip.prepReportInitialExcelImport')
                .d(
                  '该功能仅供项目上线时，编制提报单期初数据切换（仅支持引用编制来源单据创建场景，不支持引用阶段创建场景），导入后即按业务规则定义的审批方式/并单规则等配置生成编制提报单并自动提交，若需生成已确认状态结算单，注意配置审批方式=无需审批），切换完毕即收回，不可用于上线后用户使用'
                )}
              placement="bottom"
            >
              {intl.get('sbsm.fundPlan.view.button.prepReportInitialExcelImport').d('编制提报单期初EXCEL导入')}
            </Tooltip>
          ),
          successCallBack: handleAfterCloseExcel,
          args: { templateCode: 'SBSM.PREP_HEADER_INFANCY' },
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
    ].filter((v) => v);
    return formatDynamicBtns(btns);
  }, [
    selected,
    getQueryParams,
    handleAdd,
    permissionMap,
    handleAfterCloseExcel,
    handleSubmit,
    activeKey,
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
      <Header title={intl.get('sbsm.fundPlan.view.title.fundPlanPreparation').d('资金计划编制工作台')}>
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

const FundPlanPrefabricationList = (props) => <StoreProvider {...props}><List /></StoreProvider>;

export default FundPlanPrefabricationList;
