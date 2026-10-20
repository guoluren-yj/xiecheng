/*
 * PurchaserInvestigationWorkbench - 采购方调查表工作台
 * @date: 2022/11/16 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { routerRedux } from 'dva/router';
import { DataSet, Modal, Tabs, Spin } from 'choerodon-ui/pro';
import { isEmpty, compose, uniq } from 'lodash';
import { Button as PerButton } from 'components/Permission';
import { observer } from 'mobx-react-lite';
import querystring from 'querystring';

import { SRM_SSLM } from '_utils/config';
import intl from 'utils/intl';
import remotes from 'utils/remote';
import withProps from 'utils/withProps';
import CommonImport from 'components/Import';
import DynamicButtons from '_components/DynamicButtons';
import formatterCollections from 'utils/intl/formatterCollections';
import { Content, Header } from 'components/Page';
import { getResponse, getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import notification from 'utils/notification';
import ExcelExportPro from 'components/ExcelExportPro';

import { investigateRelease, investigateDelete } from '@/services/investigationCreateService';
import {
  handleCancel,
  checkInvestigation,
  handleDetailExport,
} from '@/services/sendInvestigationService';
import {
  queryTabsCount,
  batchReject,
  batchApprove,
} from '@/services/purchaserInvestWorkbenchService';
import { downloadFile } from 'hzero-front/lib/services/api';

import ListTable from './components/ListTable';
import { getTabPane, handleRejectModal } from './utils';
import { investigateRejectModalDS } from './Detail/stores/indexDS';
import { getListDS } from './stores/indexDS';

const organizationId = getCurrentOrganizationId();

const Index = ({
  remote,
  waitReleaseDs,
  waitApproveDs,
  allDs,
  dispatch,
  customizeForm,
  customizeTable,
  customizeTabPane,
  customizeBtnGroup,
  mixObj = {},
  location,
}) => {
  const routerParams = useMemo(() => querystring.parse(location.search.substr(1)) || {}, [
    location,
  ]);
  const { tabKey = '' } = routerParams;

  const [activeKey, setActiveKey] = useState(tabKey || mixObj.currentKey || 'waitRelease');
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState({});
  const [cancelLoading, setCancelLoading] = useState(false);

  const allLoading = loading || cancelLoading;

  // tab改变时的查询
  useEffect(() => {
    handleQuery();
    handleQueryTabsCount();
  }, [activeKey]);

  useEffect(() => {
    if (tabKey) {
      handleTabChange(tabKey);
    }
  }, [tabKey]);

  // tab改变时的回调
  const handleTabChange = useCallback(
    key => {
      setActiveKey(key);
      // eslint-disable-next-line no-param-reassign
      mixObj.currentKey = key;
    },
    [activeKey]
  );

  /**
   * 查询tab页单据数量
   */
  const handleQueryTabsCount = useCallback(() => {
    queryTabsCount().then(res => {
      if (getResponse(res)) {
        setCount(res);
      }
    });
  }, []);

  /**
   * 处理新建
   */
  const handleCreate = useCallback(() => {
    dispatch(
      routerRedux.push({
        pathname: `/sslm/purchaser-investigation/detail/create`,
      })
    );
  }, []);

  // 查询
  const handleQuery = useCallback(() => {
    switch (activeKey) {
      case 'waitRelease':
        if (waitReleaseDs?.getState('queryStatus') === 'ready') {
          waitReleaseDs.query(waitReleaseDs.currentPage);
        }
        break;
      case 'waitApprove':
        if (waitApproveDs?.getState('queryStatus') === 'ready') {
          waitApproveDs.query(waitApproveDs.currentPage);
        }
        break;
      case 'all':
        if (allDs?.getState('queryStatus') === 'ready') {
          allDs.query(allDs.currentPage);
        }
        break;
      default:
        break;
    }
  }, [activeKey]);

  /**
   * 勾选发布
   */
  const handleAllRelease = () => {
    const selectList = waitReleaseDs.toJSONData();
    const selectIdList = selectList.map(item => item.investgHeaderId);
    const payload = {
      organizationId,
      body: selectIdList,
    };
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl
        .get('sslm.investDefOrg.view.title.releaseSelected')
        .d('确认发布选中的调查表？'),
      onOk: () => {
        handleRelease(payload, 'selected');
      },
    });
  };

  /**
   * 不同页签发布按钮
   */
  const handleRelease = useCallback(
    (payload, type = '') => {
      const currentDs = activeKey === 'waitRelease' ? waitReleaseDs : allDs;
      setLoading(true);
      investigateRelease(payload)
        .then(res => {
          if (getResponse(res)) {
            // 查询
            notification.success();
            if (type === 'selected') {
              currentDs.unSelectAll();
              currentDs.clearCachedSelected();
            }
            currentDs.query();
          }
        })
        .finally(() => setLoading(false));
    },
    [activeKey]
  );

  /**
   * 勾选删除
   */
  const handleAllDelete = () => {
    const selectList = waitReleaseDs.toJSONData();
    const selectIdList = selectList.map(item => item.investgHeaderId);
    const payload = {
      organizationId,
      body: selectIdList,
    };
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl.get('hzero.common.message.confirm.deleteChooseRecord').d('是否删除选中记录？'),
      onOk: () => {
        handleDelete(payload, 'selected');
      },
    });
  };

  /**
   * 删除
   */
  const handleDelete = useCallback(
    (payload, type = '') => {
      const currentDs = activeKey === 'waitRelease' ? waitReleaseDs : allDs;
      setLoading(true);
      investigateDelete(payload)
        .then(res => {
          if (getResponse(res)) {
            // 查询
            notification.success();
            if (type === 'selected') {
              currentDs.unSelectAll();
              currentDs.clearCachedSelected();
            }
            currentDs.query();
          }
        })
        .finally(() => setLoading(false));
    },
    [activeKey]
  );

  /**
   * 导出参数
   * @param {Object} page 查询字段
   */
  const handleParams = useCallback(() => {
    const selectList = allDs.toJSONData();
    const selectIdList = selectList.map(item => item.investgHeaderId);
    let queryParams = {};
    if (allDs.queryDataSet?.current) {
      const params = allDs.queryDataSet.current.toData();
      const { __dirty, ...others } = params;
      queryParams = others;
    }
    return filterNullValueObject({
      ...queryParams,
      investgHeaderIds: selectIdList,
    });
  }, []);

  /**
   * 批量取消按钮回调
   */
  const handleBatchCancel = useCallback(() => {
    const selectList = allDs.toJSONData();
    const selectIdList = selectList.map(item => item.investgHeaderId);
    handleCheckCancel(selectIdList, 'select');
  }, []);

  /**
   * 取消按钮校验
   */
  const handleCheckCancel = useCallback((payload = [], type = 'select') => {
    setLoading(true);
    checkInvestigation(payload)
      .then(res => {
        if (getResponse(res)) {
          const { sevenFlag, inviteFlag, allFlag } = res;
          if (sevenFlag || inviteFlag || allFlag) {
            Modal.confirm({
              title: intl.get('hzero.common.message.confirm.title').d('提示'),
              children: allFlag
                ? intl
                    .get('sslm.investigationCorrelation.view.message.allWarn')
                    .d('发布未超过七天的邀约调查表取消后，邀约将被拒绝，是否确认取消？')
                : inviteFlag
                ? intl
                    .get('sslm.investigationCorrelation.view.message.inviteWarn')
                    .d('邀约调查表取消后，该邀约将被拒绝，是否确认取消？')
                : intl
                    .get('sslm.investigationCorrelation.view.message.sevenWarn')
                    .d('调查表发布未超过七天，是否确认取消？'),
              onOk: () => {
                cancelCallBack(payload, type);
              },
            });
          } else {
            cancelCallBack(payload, type);
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  /**
   * 取消
   */
  const cancelCallBack = (payload, type) => {
    // const selectList = allDs.toJSONData();
    // const selectIdList = selectList.map(item => item.investgHeaderId);
    setCancelLoading(true);
    handleCancel(payload)
      .then(res => {
        if (getResponse(res)) {
          notification.success();
          if (type === 'select') {
            allDs.unSelectAll();
            allDs.clearCachedSelected();
          }
          allDs.query();
        }
      })
      .finally(() => setCancelLoading(false));
  };

  const handleDetailExportInfo = () => {
    setLoading(true);
    const selectedRows = allDs.toJSONData();
    const payload = selectedRows;
    handleDetailExport(payload)
      .then(res => {
        if (res) {
          downloadFile({ requestUrl: res });
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // 审批通过
  const handleApprovalAdopt = useCallback(() => {
    const selectedRows = waitApproveDs.toJSONData();
    setLoading(true);
    batchApprove(selectedRows)
      .then(response => {
        const res = getResponse(response);
        if (res) {
          notification.success();
          waitApproveDs.query(waitApproveDs.currentPage, {}, false);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // 审批拒绝
  const handleApprovalRefuse = () => {
    const selectedRows = waitApproveDs.toJSONData();
    const dataSet = new DataSet(investigateRejectModalDS());
    if (dataSet.current) {
      dataSet.current.set({
        companyIds: uniq(selectedRows.map(n => n.companyId)).join(),
      });
    }
    const onOk = () => {
      return new Promise(async resolve => {
        const validateFlag = await dataSet.validate();
        if (validateFlag) {
          const data = (dataSet.current && dataSet.current.toJSONData()) || {};
          const payload = selectedRows.map(rows => {
            const { investigateTemplateId, investigateType, remark, ...rest } = rows;
            return { ...rest, ...data };
          });
          setLoading(true);
          const response = await batchReject({
            data: payload,
            customizeUnitCode: 'SSLM.INVESTIGATION_WAIT_APPROVE.REJECT_FORM',
          });
          setLoading(false);
          if (getResponse(response)) {
            resolve();
            notification.success();
            handleQueryTabsCount();
            waitApproveDs.query(waitApproveDs.currentPage, {}, false);
          } else {
            resolve(false);
          }
        } else {
          resolve(false);
        }
      });
    };
    handleRejectModal({
      onOk,
      dataSet,
      customizeForm,
      customizeUnitCode: 'SSLM.INVESTIGATION_WAIT_APPROVE.REJECT_FORM',
    });
  };

  // 按钮集合
  const OperationButtons = observer(props => {
    const { dataSetList = {}, activeKey: currentKey } = props;
    const dataSet = dataSetList[currentKey];
    const allSelectList = dataSet && dataSet.toJSONData();

    // 状态不是已发布或者已拒绝，并且状态是已发布或者已拒绝且调查表是合并过的都不能取消
    const isDisabled =
      isEmpty(allSelectList) ||
      !isEmpty(
        allSelectList.filter(
          n =>
            (n.processStatus !== 'RELEASE' && n.processStatus !== 'REJECT') ||
            (['RELEASE', 'REJECT'].includes(n.processStatus) &&
              n.mainInvestigateFlag === 0 &&
              n.mergerInvestigateFlag === 1)
        )
      );

    const shoReleaseBtn = currentKey === 'waitRelease';
    const showApproveBtn = currentKey === 'waitApprove';
    const showAllTabBtn = currentKey === 'all';

    const code = shoReleaseBtn
      ? 'SSLM.INVESTIGATION_WAIT_RELEASE.HEADER_BTNS'
      : showApproveBtn
      ? 'SSLM.INVESTIGATION_WAIT_APPROVE.HEADER_BTNS'
      : 'SSLM.INVESTIGATION_ALL.HEADER_BTNS';

    const btns = [
      {
        name: 'add',
        btnProps: {
          loading: allLoading,
          icon: 'add',
          color: 'primary',
          onClick: handleCreate,
          wait: 500,
          waitType: 'throttle',
        },
        child: intl.get(`hzero.common.button.create`).d('新建'),
      },
      {
        name: 'release',
        hidden: !shoReleaseBtn,
        btnProps: {
          loading: allLoading,
          icon: 'near_me',
          funcType: 'flat',
          disabled: isEmpty(allSelectList),
          onClick: handleAllRelease,
          wait: 500,
          waitType: 'throttle',
        },
        child: intl.get('hzero.common.button.release').d('发布'),
      },
      {
        name: 'batchDelete',
        hidden: !shoReleaseBtn,
        btnProps: {
          loading: allLoading,
          icon: 'delete_sweep',
          funcType: 'flat',
          disabled: isEmpty(allSelectList),
          onClick: handleAllDelete,
          wait: 500,
          waitType: 'throttle',
        },
        child: intl.get('sslm.common.button.batchDelete').d('批量删除'),
      },
      {
        name: 'agree',
        hidden: !showApproveBtn,
        btnProps: {
          loading,
          icon: 'check',
          funcType: 'flat',
          disabled: isEmpty(allSelectList),
          onClick: handleApprovalAdopt,
        },
        child: intl.get('hzero.common.button.approvalAdopt').d('审批通过'),
      },
      {
        name: 'investigateRefuse',
        hidden: !showApproveBtn,
        btnProps: {
          loading,
          icon: 'close',
          funcType: 'flat',
          disabled: isEmpty(allSelectList),
          onClick: handleApprovalRefuse,
        },
        child: intl.get(`hzero.common.view.message.title.reject`).d('审批拒绝'),
      },
      {
        name: 'cancel',
        hidden: !showAllTabBtn,
        child: intl.get('hzero.common.button.cancel').d('取消'),
        btnProps: {
          funcType: 'flat',
          icon: 'close',
          onClick: handleBatchCancel,
          disabled: isDisabled,
          loading: allLoading,
          wait: 500,
          waitType: 'throttle',
        },
      },
      {
        name: 'exportPro',
        btnComp: ExcelExportPro,
        hidden: !showAllTabBtn,
        btnProps: {
          requestUrl: `${SRM_SSLM}/v1/${organizationId}/investigate/sending/export`,
          queryParams: () => handleParams(),
          templateCode: 'SRM_C_SRM_SSLM_INVESTG_HEADER_LIST',
          buttonText: isEmpty(allSelectList)
            ? intl.get('hzero.common.button.export').d('导出')
            : intl.get('hzero.common.button.selectedExport').d('勾选导出'),
          otherButtonProps: {
            loading: allLoading,
            funcType: 'flat',
            permissionList: [
              {
                code: 'srm.partner.purchaser-investigation-workbench.api.ps.export',
                type: 'button',
                meaning: '我发出的调查表-导出',
              },
            ],
          },
        },
      },
      {
        btnComp: PerButton,
        name: 'detailExport',
        hidden: !showAllTabBtn,
        child: intl.get('sslm.investigationCorrelation.button.detailExport').d('详情导出'),
        btnProps: {
          funcType: 'flat',
          icon: 'unarchive',
          type: 'c7n-pro',
          onClick: handleDetailExportInfo,
          disabled: isEmpty(allSelectList),
          loading: allLoading,
          permissionList: [
            {
              code: `srm.partner.purchaser-investigation-workbench.api.detail.export`,
              type: 'button',
              meaning: '采购方调查表工作台-详情导出',
            },
          ],
        },
      },
      {
        name: 'import',
        btnComp: CommonImport,
        hidden: !showAllTabBtn,
        btnProps: {
          buttonText: intl.get('hzero.common.button.import').d('导入'),
          businessObjectTemplateCode: 'SRM_C_SRM_SSLM_INVESTG_HEADER_IMPORT',
          prefixPatch: SRM_SSLM,
          refreshButton: true,
          successCallBack: () => {
            dataSet.query();
          },
          buttonProps: {
            funcType: 'flat',
            loading: allLoading,
          },
        },
      },
    ];
    const buttons = remote.process('SSLM_PURCHASER_INVESTIG_WORKBEBCH_LIST_HEADER_BTNS', btns, {
      dataSet,
      currentKey,
    });

    return customizeBtnGroup(
      {
        code,
        pro: true,
      },
      <DynamicButtons buttons={buttons} defaultBtnType="c7n-pro" />
    );
  });

  const tabPaneList = useMemo(() => getTabPane(), []);
  const dataObj = {
    waitRelease: waitReleaseDs,
    waitApprove: waitApproveDs,
    all: allDs,
  };

  return (
    <React.Fragment>
      <Header
        title={intl
          .get('sslm.investTempConfig.view.title.purchaserInvestigate')
          .d('采购方调查表工作台')}
      >
        <React.Fragment>
          <OperationButtons
            activeKey={activeKey}
            dataSetList={{
              all: allDs,
              waitRelease: waitReleaseDs,
              waitApprove: waitApproveDs,
            }}
          />
        </React.Fragment>
      </Header>
      <Content>
        <Spin spinning={allLoading}>
          {customizeTabPane(
            {
              code: 'SSLM.INVESTIGATION_WORKBENCH_LIST.TABPANE',
            },
            <Tabs activeKey={activeKey} onChange={handleTabChange}>
              {tabPaneList.map(pane => (
                <Tabs.TabPane tab={pane.tab} key={pane.key} count={count[pane.countKey]}>
                  <ListTable
                    remote={remote}
                    dispatch={dispatch}
                    activeKey={activeKey}
                    dataSet={dataObj[pane.key]}
                    searchCode={pane.searchCode}
                    customizeTable={customizeTable}
                    customizeCode={pane.customizeCode}
                    onDelete={handleDelete}
                    onRelease={handleRelease}
                    onCancel={handleCheckCancel}
                    routerParams={routerParams}
                  />
                </Tabs.TabPane>
              ))}
            </Tabs>
          )}
        </Spin>
      </Content>
    </React.Fragment>
  );
};

export default compose(
  formatterCollections({
    code: [
      'sslm.common',
      'sslm.investDefOrg',
      'spfm.disposeInvite',
      'sslm.investigCorrelat',
      'sslm.investTempConfig',
      'sslm.investigationCorrelation',
    ],
  }),
  WithCustomize({
    unitCode: [
      'SSLM.INVESTIGATION_WAIT_RELEASE.TABLE_LIST',
      'SSLM.INVESTIGATION_WAIT_APPROVE.TABLE_LIST',
      'SSLM.INVESTIGATION_ALL.LIST_TABLE',
      'SSLM.INVESTIGATION_WORKBENCH_LIST.TABPANE', // 列表页-标签页
      'SSLM.INVESTIGATION_WAIT_APPROVE.HEADER_BTNS', // 待审批-列表头按钮
      'SSLM.INVESTIGATION_WAIT_APPROVE.REJECT_FORM',
      'SSLM.INVESTIGATION_WAIT_RELEASE.HEADER_BTNS',
      'SSLM.INVESTIGATION_ALL.HEADER_BTNS',
    ],
  }),
  withProps(
    () => {
      const waitReleaseDs = new DataSet(getListDS('waitRelease'));
      const waitApproveDs = new DataSet(getListDS('waitApprove'));
      const allDs = new DataSet(getListDS('all'));
      const mixObj = {
        currentKey: 'waitRelease',
      };
      return {
        waitReleaseDs,
        waitApproveDs,
        allDs,
        mixObj,
      };
    },
    { cacheState: true }
  ),
  remotes({
    code: 'SSLM_PURCHASER_INVESTIG_WORKBEBCH_LIST',
    name: 'remote',
  })
)(Index);
