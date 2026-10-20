import React, { Fragment, useCallback, useMemo } from 'react';
import { flowRight } from 'lodash';
import { Button, Tabs } from 'choerodon-ui/pro';
import qs from 'qs';

import withProps from 'utils/withProps';
import intl from 'utils/intl';
import {
  filterNullValueObject,
  getCurrentOrganizationId,
  generateUrlWithGetParam,
  getResponse,
} from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import notification from 'utils/notification';
import ExcelExport from 'components/ExcelExport';
import DynamicButtons from '_components/DynamicButtons';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import ExcelExportPro from 'components/ExcelExportPro';
import useTabs from '@/hooks/useTabs';
import { ObserverBtn, DropdownBtn } from '@/components/CommonButtons';
import { openTextArea } from '@/utils/modals';
import { getC7NExportQueryParams } from '@/utils/utils';

import AgmTable from './AgmTable';
import AgmLineTable from './AgmLineTable';
import { batchSubmitAgr, agreementApprove, agreementReject, updateSaleLine } from './api';

import getTabs from './getTabs';

const { TabGroup, TabPane } = Tabs;

let initTabKey = 'ALL';
const groupDefaultKey = { whole: 'ALL', detail: 'LINE_ALL' };
const approveCode = 'sagm.sale-agreement-workbench-list.button.agreement.approve';

const getWithProps = withProps(
  () => {
    const groupList = [
      {
        tab: intl.get('sagm.common.view.title.agreementTab').d('协议'),
        key: 'whole',
        tabComp: AgmTable,
      },
      {
        tab: intl.get('sagm.common.view.title.detailTab').d('明细'),
        key: 'detail',
        tabComp: AgmLineTable,
      },
    ];
    return { tabList: getTabs(), groupList };
  },
  {
    cacheState: true,
    keepOriginDataSet: true,
  }
);

function SagmWorkbench(props) {
  const {
    tabList = [],
    groupList = [],
    customizeTable,
    customizeBtnGroup,
    location: { search },
    match: { path = '' },
  } = props;
  // 领用商品跳转过来， 协议类型赋领用默认值
  const { req } = qs.parse(search.substr(1));
  const isReceive = req === 'receive';
  const [tabKey, onTabChange, tabsCount, setTabsCount] = useTabs(initTabKey, {
    tabList,
    queryCountFlagParam: {
      skuType: 'EC',
    },
    tabChange: (key, groupKey) => {
      initTabKey = key; // 缓存tab
      groupDefaultKey[groupKey] = key; // 缓存双层默认tab
    },
  });
  const isLine = tabKey.includes('LINE');

  const getCurrentTab = () => {
    return tabList.find((tab) => tab.key === tabKey) || {};
  };

  const onSubmitCallback = (res) => {
    const { batchStatus, batchResult } = res;
    // 0失败 1部分成功 2 全部成功
    const info = { message: batchResult };
    if (batchStatus === 2) {
      notification.success(info);
    } else if (batchStatus === 1) {
      notification.warning(info);
    } else {
      notification.error(info);
    }
    query();
  };

  const handleCommonBachEvent = async (api, type, callback) => {
    const { dataSet } = getCurrentTab();
    const selectedRow = dataSet.selected;
    let data = selectedRow.map((i) => i.toData());
    if (type === 'pass') {
      data = {
        agreementHeaderIdList: data.map((i) => i.agreementHeaderId),
      };
    }
    dataSet.status = 'loading';
    const res = getResponse(await api(data));
    dataSet.status = 'ready';
    if (res && callback) {
      callback(res);
    } else if (res) {
      notification.success();
      query();
    }
  };

  const handleBatchAbledFlag = async () => {
    const { dataSet } = getCurrentTab();
    const saleLines = dataSet.selected?.map((r) => r.toData());
    dataSet.status = 'submit';
    const params = { saleLines, suffix: saleLines[0]?.effectiveFlag ? 'expired' : 'effected' };
    const res = getResponse(await updateSaleLine(params));
    dataSet.status = 'ready';
    if (res) {
      notification.success();
      dataSet.query(dataSet.currentPage);
    }
  };

  const handleViewDetail = useCallback((record, _tabKey) => {
    const { wflApproveFlag, wflRevokeApproveFlag, taskId, processInstanceId, workflowBusinessKey } =
      record?.get([
        'wflApproveFlag',
        'wflRevokeApproveFlag',
        'taskId',
        'processInstanceId',
        'workflowBusinessKey',
      ]) || {};
    const status = _tabKey !== 'NEW' ? 'read' : 'edit';
    // const deleteYn = _tabKey === 'DELETED' ? 'y' : null;
    const detailPath = generateUrlWithGetParam(
      `/sagm/sale-agreement-workbench/detail/${status}`,
      filterNullValueObject({
        // deleteYn,
        agreementHeaderId: record.get('agreementHeaderId'),
        wflApproveFlag,
        wflRevokeApproveFlag,
        taskId,
        processInstanceId,
        businessKey: workflowBusinessKey?.[0],
      })
    );
    props.history.push(detailPath);
  }, []);

  const handleCreate = () => {
    props.history.push('/sagm/sale-agreement-workbench/detail/create');
  };

  const getQueryParams = () => {
    const { dataSet, params, searchBarCode } = tabList.find((f) => f.key === tabKey);
    const queryParams =
      dataSet.queryDataSet && dataSet.queryDataSet.current
        ? dataSet.queryDataSet.current.toJSONData()
        : {};
    return filterNullValueObject({ ...params, ...queryParams, customizeUnitCode: searchBarCode });
  };

  const query = async () => {
    const { dataSet } = getCurrentTab();
    const res = await dataSet.query(dataSet.currentPage);
    setTabsCount((pre) => ({ ...pre, [tabKey]: res.totalElements || 0 }));
  };

  /**
   * 审批拒绝
   */
  const handleApproveReject = () => {
    openTextArea({
      title: intl.get('small.common.view.approveReject').d('审批拒绝'),
      name: 'rejectRemark',
      maxLength: 100,
      label: intl.get('small.common.view.rejectReason').d('拒绝原因'),
      onOk: (param) =>
        agreementReject({
          agreementHeaderIdList: getCurrentTab().dataSet.selected.map((m) =>
            m.get('agreementHeaderId')
          ),
          remark: param.rejectRemark,
        }).then((res) => {
          if (getResponse(res)) {
            notification.success();
            query();
          }
        }),
    });
  };

  const dynamicButtons = useMemo(
    () =>
      [
        {
          name: 'add',
          btnComp: Button,
          child: intl.get('hzero.common.button.create').d('新建'),
          btnProps: {
            icon: 'add',
            onClick: () => handleCreate(),
            color: 'primary',
          },
        },
        {
          name: 'submit',
          show: tabKey === 'NEW',
          btnComp: ObserverBtn,
          btnProps: {
            icon: 'check',
            text: intl.get('sagm.common.view.button.batchSubmit').d('批量提交'),
            dataSet: getCurrentTab().dataSet,
            getDisable: (data) => data.length < 1,
            getTipTitle: (data) =>
              data.length < 1
                ? intl.get('sagm.common.button.disabledForNoData').d('请至少选择一行数据')
                : '',
            onClick: () => handleCommonBachEvent(batchSubmitAgr, '', onSubmitCallback),
          },
        },
        {
          name: 'approve',
          group: true,
          show: tabKey === 'WAITING_APPROVE',
          children: [
            {
              name: 'approvePass',
              child: intl.get('sagm.common.view.button.approvePass').d('审批通过'),
              observerBtnProps: () => ({
                hidden: getCurrentTab().dataSet?.selected?.length === 0,
                onClick: () => handleCommonBachEvent(agreementApprove, 'pass'),
              }),
            },
            {
              name: 'approveReject',
              child: intl.get('sagm.common.view.button.approveReject').d('审批拒绝'),
              observerBtnProps: () => ({
                hidden: getCurrentTab().dataSet?.selected?.length === 0,
                onClick: handleApproveReject,
              }),
            },
          ],
          child: (
            <DropdownBtn
              icon="authorize"
              funcType="flat"
              dataSet={getCurrentTab().dataSet}
              showTip
              permission
              permissionList={[
                {
                  code: approveCode,
                  type: 'button',
                  meaning: '协议工作台 -协议审批',
                },
              ]}
              text={intl.get('sagm.common.view.button.batchApprove').d('批量审批')}
            />
          ),
        },
        {
          name: 'disabled',
          show: tabKey === 'LINE_EFFECTED',
          btnComp: ObserverBtn,
          btnProps: {
            icon: 'not_interested',
            text: intl.get('sagm.common.view.button.batchDisabled').d('批量失效'),
            dataSet: getCurrentTab().dataSet,
            getDisable: (data) => data.length < 1,
            getTipTitle: (data) =>
              data.length < 1
                ? intl.get('sagm.common.button.disabledForNoData').d('请至少选择一行数据')
                : '',
            onClick: () => handleBatchAbledFlag(),
          },
        },
        {
          name: 'enabled',
          show: tabKey === 'LINE_EXPIRED',
          btnComp: ObserverBtn,
          btnProps: {
            icon: 'verified_user-o',
            text: intl.get('sagm.common.view.button.batchEnabled').d('批量生效'),
            dataSet: getCurrentTab().dataSet,
            getDisable: (data) => data.length < 1,
            getTipTitle: (data) =>
              data.length < 1
                ? intl.get('sagm.common.button.disabledForNoData').d('请至少选择一行数据')
                : '',
            onClick: () => handleBatchAbledFlag(),
          },
        },
        {
          name: 'exportNew',
          show: isLine,
          btnComp: ExcelExportPro,
          observerBtnProps: () => ({
            templateCode: 'SAGM_SALE_AGREEMENT_LINE_WORK_EXPORT',
            method: 'POST',
            allBody: true,
            requestUrl: `/sagm/v1/${getCurrentOrganizationId()}/sale-agreement-lines/work/export/new`,
            otherButtonProps: {
              type: 'c7n-pro',
              funcType: 'flat',
              icon: 'unarchive',
              permissionList: [
                {
                  code: `${path}.button.export-new`,
                  type: 'button',
                  meaning: '销售协议工作台-(新)列表行导出',
                },
              ],
            },
            queryParams: () => ({
              ...getQueryParams(),
              ...getC7NExportQueryParams(
                getCurrentTab().dataSet,
                'agreementLineId',
                getQueryParams,
                {
                  exportIdsName: 'agreementLineIds',
                }
              ),
            }),
            buttonText:
              getCurrentTab().dataSet.selected.length > 0
                ? intl.get('sagm.common.button.selectBatchExportNew').d('勾选导出')
                : intl.get('sagm.common.button.batchExportNew').d('(新)批量导出'),
            exportAsync: true,
          }),
        },
      ].filter((f) => f.show !== false),
    [tabKey, getCurrentTab().dataSet, getCurrentTab().dataSet?.selected]
  );
  return (
    <Fragment>
      <Header title={intl.get('sagm.saleAgreement.view.title.workbench').d('销售协议工作台')}>
        <DynamicButtons buttons={dynamicButtons} maxNum={5} defaultBtnType="c7n-pro" />
        {isLine &&
          customizeBtnGroup(
            {
              code: 'SAGM.SALE_WORKBENCH.BTNS',
              // 新版按钮组个性化（必须）
              pro: true,
            },
            <DynamicButtons
              buttons={[
                {
                  name: 'batchExport',
                  btnComp: ExcelExport,
                  btnProps: {
                    exportAsync: true,
                    queryParams: getQueryParams,
                    buttonText: intl.get('sagm.common.button.batchExport').d('批量导出'),
                    otherButtonProps: { type: 'c7n-pro', funcType: 'flat', icon: 'unarchive' },
                    requestUrl: `/sagm/v1/${getCurrentOrganizationId()}/sale-agreement-lines/work/export`,
                  },
                },
              ]}
            />
          )}
      </Header>
      <Content>
        <Tabs
          activeKey={tabKey}
          onChange={onTabChange}
          customizedCode="SAGM.SALE_AGREEMENT_WORKBENCH_HEADER.TABS"
        >
          {groupList.map((group) => (
            <TabGroup tab={group.tab} key={group.key} defaultActiveKey={groupDefaultKey[group.key]}>
              {tabList
                .filter((tab) => tab.groupKey === group.key)
                .map((m) => {
                  const { key, tab, dataSet, searchBarCode, customizeUnitCode } = m;
                  const TableComp = group.tabComp;
                  return (
                    <TabPane key={key} tab={tab} count={tabsCount[key]}>
                      <div style={{ height: 'calc(100vh - 260px)' }}>
                        <TableComp
                          tabKey={key}
                          dataSet={dataSet}
                          searchBarCode={searchBarCode}
                          customizeUnitCode={customizeUnitCode}
                          customizeTable={customizeTable}
                          onViewDetail={handleViewDetail}
                          isReceive={isReceive}
                        />
                      </div>
                    </TabPane>
                  );
                })}
            </TabGroup>
          ))}
        </Tabs>
      </Content>
    </Fragment>
  );
}

export default flowRight(
  withCustomize({ unitCode: getTabs('custCode') }),
  formatterCollections({
    code: ['sagm.common', 'sagm.saleAgreement', 'small.common', 'sagm.priceStrategy'],
  }),
  getWithProps
)(SagmWorkbench);
