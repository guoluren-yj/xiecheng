// import queryString from 'querystring';
import { DataSet, Tabs, Modal } from 'choerodon-ui/pro'; //
// import { Divider, Radio } from 'choerodon-ui';
import React, { Fragment, useCallback, useState, useEffect } from 'react'; // useEffect
import { compose, isEmpty } from 'lodash';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import { SRM_SRPM } from '_utils/config';

import DynamicButtons from '_components/DynamicButtons';
import cuxRemote from 'hzero-front/lib/utils/remote';
import intl from 'utils/intl';
import { getPostParams } from '@/routes/utils';
import { observer } from 'mobx-react-lite';
import withProps from 'utils/withProps';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import { getCurrentOrganizationId } from 'utils/utils';
// import { Button as PermissionButton } from 'components/Permission';
import { queryListCount } from '@/services/RequisitionPlanServices';
import BeforeSubmit from './BeforeSubmit/index';
import UnderApproval from './UnderApproval/index';
import Approved from './Approved/index';
import AllByWhole from './AllByWhole/index';
import DetailByHold from './DetailByHold';
import DetailByWhole from './DetailByWhole/index';

import { listLineDS } from './BeforeSubmit/indexDS';
import { underApprovalDs } from './UnderApproval/indexDS';
import { approvedDs } from './Approved/indexDS';
import { wholeDs } from './AllByWhole/indexDS';
import { detailDs } from './DetailByWhole/indexDS';
import { detailByHoldDS } from './DetailByHold/indexDS';
import HoldInfo from './components/HoldInfo';

const { TabPane, TabGroup } = Tabs;

const organizationId = getCurrentOrganizationId();

const Index = ({
  dispatch,
  lineDs,
  underApprovalLineDs,
  approvedLineDs,
  wholeLineDs,
  detailByHoldDs,
  detailByWholeDs,
  requisitionPlan,
  location,
  customizeTabPane,
  getHocInstance,
  custConfig,
  remote,
}) => {
  const [tabType, setTabType] = useState(requisitionPlan.tabType);
  // const [initFlag, setInitFlag] = useState(requisitionPlan.initRpFlag); // 是否初始化过
  const [itemCount, setItemCount] = useState({});
  // const [cuxHiddenFlag, setScuxHiddenFlag] = useState(false);

  useEffect(() => {
    remote.event.fireEvent('cuxDocInit', {
      tabType,
      lineDs,
      underApprovalLineDs,
      approvedLineDs,
      wholeLineDs,
      detailByHoldDs,
      detailByWholeDs,
      location,
      dispatch,
      getCurrentDs,
    });
  }, []);

  const queryCount = () => {
    queryListCount().then((res) => {
      if (res && !res.failed) {
        const itemCountDate = {
          lineDsCount: res?.toSubmit,
          underApprovalCount: res?.submitted,
          approvedDsCount: res?.approved,
          wholeDsCount: res?.all,
          detailByWholeDsCount: res?.lineAll,
          detailByHoldDsCount: res?.lineSuspendedQuantity,
        };
        setItemCount(itemCountDate);
      } else {
        notification.error({ message: res?.message });
      }
    });
  };

  // tab切换的回调;
  const handleTabChange = useCallback((key) => {
    setTabType(key);
    dispatch({
      type: 'requisitionPlan/updateState',
      payload: { tabType: key, initRpFlag: true },
    });
    const currentDs = getCurrentDs(key);
    const queryData = currentDs.queryParameter;
    const { advancedData = {} } = queryData;
    if (currentDs.getState('initFlag')) {
      currentDs.query(currentDs.currentPage, advancedData, true);
    }

    queryCount();
  }, []);

  // 新建页面跳转
  const handleJumpDetail = useCallback(
    (record) => {
      if (record) {
        const rpHeaderId = record.get('rpHeaderId');

        let type =
          tabType === 'beforeSubmit' && ['NEW', 'REJECTED'].includes(record.get('rpStatus'))
            ? 'edit'
            : 'only-read';

        if (record.get('rpSourcePlatform') === 'EXTERNAL_SYSTEM') {
          type = `erp-${type}`;
        }

        dispatch(
          routerRedux.push({
            pathname: `/srpm/requisition-plan/${type}/${rpHeaderId}`,
          })
        );
      } else {
        dispatch(
          routerRedux.push({
            pathname: '/srpm/requisition-plan/create',
          })
        );
      }
    },
    [tabType]
  );

  const handleHold = useCallback(() => {
    Modal.open({
      drawer: true,
      closable: true,
      title: intl.get('srpm.common.view.button.hold').d('暂挂'),
      style: { width: '380px' },
      children: <HoldInfo listDs={detailByWholeDs} queryCount={queryCount} />,
    });
  }, [detailByWholeDs, queryCount]);

  const handleEnable = useCallback(async () => {
    const res = await detailByHoldDs.setState('submitType', 'enable').forceSubmit();
    if (!res) return;
    detailByHoldDs.query(undefined, undefined, false);
    queryCount();
  }, [detailByHoldDs, queryCount]);

  // 渲染 tabs
  const BtnTab = () => {
    return (
      <div key="advanced-query-slot">
        {customizeTabPane(
          {
            code: 'SRPM.RP_PLATFORM.OVERALL.TAB',
            cascade: true,
            pro: true,
            custDefaultActive: (activeKey, { firstRenderHiddenKeys = [] }) => {
              if (!requisitionPlan.initRpFlag) {
                const otherAcitve = custConfig['SRPM.RP_PLATFORM.OVERALL.TAB']?.fields || [];
                const activeCup = otherAcitve
                  .filter((e) => !firstRenderHiddenKeys.includes(e?.fieldCode))
                  .map((i) => i?.fieldCode);
                handleTabChange(
                  activeKey ||
                  (activeCup.includes(requisitionPlan?.tabType)
                    ? requisitionPlan.tabType
                    : activeCup[0])
                );
              } else {
                const setCustTab = getHocInstance?.().cache['SRPM.RP_PLATFORM.OVERALL.TAB'];
                const { key } = setCustTab?.activeKey || {};
                if (setCustTab && key && key.__default__ && tabType) {
                  setCustTab.activeKey.key.__default__ = tabType;
                }
              }
            },
          },
          <Tabs
            keyboard={false}
            activeKey={tabType}
            getHocInstance={getHocInstance}
            onChange={(value) => handleTabChange(value)}
            tabPosition="top"
          >
            <TabGroup tab={intl.get('srpm.common.modal.wholeTab').d('整单')} key="wholeTab">
              <TabPane
                tab={<span>{intl.get('srpm.common.title.beforeSubmit').d('待提交')}</span>}
                count={itemCount.lineDsCount}
                key="beforeSubmit"
              >
                <BeforeSubmit
                  lineDs={lineDs}
                  handleJumpDetail={handleJumpDetail}
                  queryCount={queryCount}
                  location={location}
                />
              </TabPane>
              <TabPane
                tab={<span>{intl.get('srpm.common.title.inApprove').d('审批中')}</span>}
                count={itemCount.underApprovalCount}
                key="underApproval"
              >
                <UnderApproval
                  lineDs={underApprovalLineDs}
                  handleJumpDetail={handleJumpDetail}
                  queryCount={queryCount}
                  location={location}
                />
              </TabPane>
              <TabPane
                tab={<span>{intl.get('srpm.common.title.approved').d('已审批')}</span>}
                count={itemCount.approvedDsCount}
                key="approved"
              >
                <Approved
                  lineDs={approvedLineDs}
                  handleJumpDetail={handleJumpDetail}
                  queryCount={queryCount}
                  location={location}
                />
              </TabPane>
              <TabPane
                tab={<span>{intl.get('srpm.common.title.allByWhole').d('全部')}</span>}
                count={itemCount.wholeDsCount}
                key="allByWhole"
              >
                <AllByWhole
                  lineDs={wholeLineDs}
                  handleJumpDetail={handleJumpDetail}
                  queryCount={queryCount}
                  dispatch={dispatch}
                  location={location}
                />
              </TabPane>
            </TabGroup>
            <TabGroup tab={intl.get('srpm.common.modal.detailTab').d('明细')} key="detailTab">
              <TabPane
                tab={<span>{intl.get('srpm.common.title.allByWhole').d('全部')}</span>}
                count={itemCount.detailByWholeDsCount}
                key="detailByWhole"
              >
                <DetailByWhole
                  lineDs={detailByWholeDs}
                  handleJumpDetail={handleJumpDetail}
                  queryCount={queryCount}
                  dispatch={dispatch}
                  location={location}
                />
              </TabPane>
              <TabPane
                tab={<span>{intl.get('srpm.common.view.title.pending').d('暂挂')}</span>}
                count={itemCount.detailByHoldDsCount}
                key="detailByHold"
              >
                <DetailByHold
                  lineDs={detailByHoldDs}
                  handleJumpDetail={handleJumpDetail}
                  queryCount={queryCount}
                  dispatch={dispatch}
                  location={location}
                />
              </TabPane>
            </TabGroup>
          </Tabs>
        )}
      </div>
    );
  };

  const getCurrentDs = (currentType) => {
    let currentDs = lineDs;
    switch (currentType || tabType) {
      case 'underApproval':
        currentDs = underApprovalLineDs;
        break;
      case 'approved':
        currentDs = approvedLineDs;
        break;
      case 'allByWhole':
        currentDs = wholeLineDs;
        break;
      case 'detailByWhole':
        currentDs = detailByWholeDs;
        break;
      case 'detailByHold':
        currentDs = detailByHoldDs;
        break;
      default:
        currentDs = lineDs;
        break;
    }
    return currentDs;
  };

  const getQueryFrom = (currentDs) => {
    const isDetailTab = tabType === 'detailByWhole';
    const { selected } = currentDs;
    const selectedData = selected.map((ele) => ele.toData());
    if (selectedData.length > 0) {
      if (isDetailTab) {
        const rpLineIds = selectedData.map((ele) => ele.rpLineId);
        return { rpLineIds };
      } else {
        const rpHeaderIds = selectedData.map((ele) => ele.rpHeaderId);
        return { rpHeaderIds };
      }
    } else {
      const queryTitleDatas = currentDs?.queryDataSet?.toJSONData() || [];
      const { multiSelectHeaderNums, multiSelectHeaderAndLineNums } = queryTitleDatas[0] || {};
      const queryData = currentDs.queryParameter;
      const { advancedData = {} } = queryData;
      const currentQueryDate = {
        ...advancedData,
        multiSelectHeaderNums,
        multiSelectHeaderAndLineNums,
      };
      return getPostParams({
        ...currentQueryDate,
        customizeUnitCode: isDetailTab
          ? 'SRPM.RP_PLATFORM.DETAIL_OVERALL.SEARCHBAR,SRPM.RP_PLATFORM.DETAIL_OVERALL.LIST'
          : 'SRPM.RP_PLATFORM.ALL_SEARCHBAR,SRPM.RP_PLATFORM.ALL.LIST',
      });
    }
  };

  const HeaderBtn = observer(({ currentDs }) => {
    const { selected } = currentDs;
    const noApprovedInSelected = selected.some(
      (record) => record.get('rpLineStatus') !== 'APPROVED'
    );
    const headerButtons = [
      {
        name: 'hold',
        btnType: 'c7n-pro',
        child: intl.get(`srpm.common.view.button.hold`).d('暂挂'),
        btnProps: {
          type: 'c7n-pro',
          funcType: 'flat',
          icon: 'enhanced_encryption-o',
          onClick: handleHold,
          hidden: tabType !== 'detailByWhole',
          disabled: isEmpty(selected) || noApprovedInSelected,
        },
      },
      {
        name: 'newExport',
        noNest: true,
        child: () => (
          <ExcelExportPro
            data-name="newExport"
            {...{
              templateCode: 'SRPM_REQUEST_PLAN_LINE_EXPORT',
              method: 'POST',
              allBody: true,
              buttonText:
                currentDs.selected.length > 0
                  ? intl.get('sprm.common.button.exportSelect').d('勾选导出-新')
                  : intl.get('hzero.common.export.new').d('导出-新'),
              requestUrl: `${SRM_SRPM}/v1/${organizationId}/request-plan/line-list/export?queryType=ALL`,
              queryParams: () => getQueryFrom(currentDs),
              otherButtonProps: {
                type: 'c7n-pro',
                funcType: 'flat',
                hidden: tabType !== 'detailByWhole',
              },
            }}
          />
        ),
      },
      {
        name: 'enable',
        btnType: 'c7n-pro',
        child: intl.get(`srpm.common.view.button.enable`).d('启用'),
        btnProps: {
          type: 'c7n-pro',
          funcType: 'raised',
          color: "primary",
          icon: 'no_encryption-o',
          onClick: handleEnable,
          hidden: tabType !== 'detailByHold',
          disabled: isEmpty(currentDs.selected),
        },
      },
      {
        name: 'new',
        btnType: 'c7n-pro',
        child: intl.get(`hzero.common.button.create`).d('新建'),
        btnProps: {
          type: 'c7n-pro',
          color: "primary",
          funcType: 'raised',
          icon: 'add',
          onClick: () => handleJumpDetail(),
          hidden: ['detailByWhole', 'detailByHold'].includes(tabType),
        },
      },
      {
        name: 'exportWhole',
        noNest: true,
        child: () => (
          <ExcelExportPro
            data-name="newExport"
            {...{
              templateCode: 'SRPM_REQUEST_PLAN_HEADER_EXPORT',
              method: 'POST',
              allBody: true,
              buttonText:
                currentDs.selected.length > 0
                  ? intl.get('sprm.common.button.exportSelect').d('勾选导出-新')
                  : intl.get('hzero.common.export.new').d('导出-新'),
              requestUrl: `${SRM_SRPM}/v1/${organizationId}/request-plan/list/export?queryType=ALL`,
              queryParams: () => getQueryFrom(currentDs),
              otherButtonProps: {
                type: 'c7n-pro',
                funcType: 'flat',
                hidden: tabType !== 'allByWhole',
              },
            }}
          />
        ),
      },
    ];
    const newHeaderBtn = remote.process ? remote.process('cuxHeaderBtnsList', headerButtons, { currentDs, lineDs, tabType }) : headerButtons;
    return (
      <DynamicButtons
        buttons={newHeaderBtn}
        maxNum={5}
        defaultBtnType="c7n-pro"
        permissions={[
          { code: `hzero.srm.requirement.requisition.plan.rp-platform.button.hold`, name: 'hold' },
          { code: `hzero.srm.requirement.requisition.plan.rp-platform.button.line.all.export`, name: 'expost' },
          { code: `hzero.srm.requirement.requisition.plan.rp-platform.button.enable`, name: 'enable' },
          { code: 'hzero.srm.requirement.requisition.plan.rp-platform.ps.new', name: 'new' },
          { code: 'hzero.srm.requirement.requisition.plan.rp-platform.button.all.export', name: 'exportWhole' },
        ]}
      />
    );
  });

  return (
    <Fragment>
      <Header title={intl.get('srpm.common.title.demandplanWorkbench').d('需求计划工作台')}>
        <HeaderBtn currentDs={getCurrentDs()} />
      </Header>
      <Content>{BtnTab()}</Content>
    </Fragment>
  );
};

export default compose(
  connect(({ requisitionPlan }) => ({
    requisitionPlan,
  })),
  formatterCollections({
    code: [
      'srpm.common',
      'hzero.common',
      'hzero.c7nProUI',
      'entity.company',
      'entity.business',
      'entity.organization',
      'entity.roles',
      'entity.item',
      'sprm.common',
    ],
  }),
  withCustomize({
    unitCode: ['SRPM.RP_PLATFORM.OVERALL.TAB'],
  }),
  cuxRemote(
    {
      code: 'SRPM_REQUISITION_LIST_PLAN',
      name: 'remote',
    },
    {}
  ),
  withProps(
    () => {
      const lineDs = new DataSet(listLineDS());
      const underApprovalLineDs = new DataSet(underApprovalDs());
      const approvedLineDs = new DataSet(approvedDs());
      const wholeLineDs = new DataSet(wholeDs());
      const detailByWholeDs = new DataSet(detailDs());
      const detailByHoldDs = new DataSet(detailByHoldDS());
      return {
        lineDs,
        underApprovalLineDs,
        approvedLineDs,
        wholeLineDs,
        detailByWholeDs,
        detailByHoldDs,
      };
    },
    { cacheState: true }
  )
)(Index);
