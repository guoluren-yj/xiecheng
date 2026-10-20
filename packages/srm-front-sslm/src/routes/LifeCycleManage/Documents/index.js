/*
 * @Date: 2022-12-08 15:11:47
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { isEmpty } from 'lodash';
import { Button } from 'choerodon-ui/pro';
import React, { Fragment, useCallback, useContext, useState, useEffect } from 'react';

import intl from 'utils/intl';
import SearchBarTable from '_components/SearchBarTable';

import ListTooltip from '@/routes/components/AiApprove/ListTooltip';
import MultipleTextField from '@/routes/components/MultipleTextField';
import { tableMaxHeight, renderStatus } from '@/routes/components/utils';
import {
  queryAllApprovalData,
  renderApprovaBtn,
  renderApproveProgress,
} from '@/routes/components/WorkFlowApproval';
import { getPermissionList } from '@/routes/components/utils/utils';

import { Context } from '../Context';

let searchBarRef; // 筛选器ref

const Index = ({ dataSet, searchCode, customizeUnitCode }) => {
  const [pageChacheFlag, setPageChacheFlag] = useState(true);
  const context = useContext(Context);
  const { onSubmit, onDetail, activeKey, customizeTable, lifeCycleManageRemote } = context;
  const [approvalInfo, setApprovalInfo] = useState({});

  useEffect(() => {
    dataSet.addEventListener('load', handleDsLoadAfter);
    return () => {
      dataSet.removeEventListener('load', handleDsLoadAfter);
    };
  }, []);

  const handleDsLoadAfter = (dataSetProps = {}) => {
    const { dataSet: ds } = dataSetProps;
    const businessKeys = ds.filter(r => r.get('businessKey')).map(r => r.get('businessKey'));
    queryAllApprovalData({ businessKeys }).then(response => {
      if (response) {
        const { approvalDataMap, revokeDataMap, approvalHistoryMap } = response;
        setApprovalInfo({
          approvalDataMap,
          revokeDataMap,
          approvalHistoryMap,
        });
      }
    });
  };

  // 跳转详情
  const handleDetail = useCallback((record, status) => {
    const { requisitionId, documentType } = record.get(['requisitionId', 'documentType']);
    onDetail({ requisitionId, documentType }, status);
  }, []);

  const getPermissionCode = () => {
    const permissionCodeList = {
      approvaPermission: {
        code: ['approval'].includes(activeKey)
          ? 'srm.partner.lifecycle.management.button.approving-list.approval'
          : 'srm.partner.lifecycle.management.button.all-list.approval',
        type: 'approva',
      },
      revokePermission: {
        code: ['approval'].includes(activeKey)
          ? 'srm.partner.lifecycle.management.button.approving-list.repeal-approval'
          : 'srm.partner.lifecycle.management.button.all-list.repeal-approval',
        type: 'revoke',
      },
    };
    return getPermissionList(permissionCodeList);
  };

  // 获取列
  const getColumns = () => {
    const columns = [
      {
        name: 'processStatus',
        width: 100,
        renderer: renderStatus,
      },
      {
        name: 'aiApproveStatus',
        width: 140,
        title: intl.get('sslm.common.button.intelligentReview').d('智能预审'),
        renderer: params => (params.value ? <ListTooltip {...params} /> : '-'),
      },
      ['all', 'approval'].includes(activeKey) && {
        name: 'operation',
        width: 120,
        renderer: ({ record, dataSet: ds }) => {
          const processStatus = record.get('processStatus');
          const allPageBtnFlag =
            ['NEW', 'REJECTED'].includes(processStatus) && ['all'].includes(activeKey);
          const approvalProps = {
            onSuccess: () => ds.query(),
            processDataMap: approvalInfo,
            record,
            permissionListMap: getPermissionCode(),
          };
          const remoteBtns = lifeCycleManageRemote
            ? lifeCycleManageRemote.process(
                'SSLM_LIFE_CYCLE_MANAGE_DOCUMENTS_LIST_TABLE_LINE_BTNS',
                [],
                { record, ds, activeKey }
              )
            : [];
          const btns = [renderApprovaBtn(approvalProps), ...remoteBtns].filter(Boolean);
          return allPageBtnFlag ? (
            <Fragment>
              <Button
                funcType="link"
                style={{ marginRight: 8 }}
                onClick={() => handleDetail(record)}
              >
                {intl.get('hzero.common.button.edit').d('编辑')}
              </Button>
              <Button funcType="link" onClick={() => onSubmit(record)}>
                {intl.get(`hzero.common.button.submit`).d('提交')}
              </Button>
            </Fragment>
          ) : !isEmpty(btns) ? (
            btns
          ) : (
            '-'
          );
        },
      },
      {
        name: 'documentNumber',
        width: 150,
        renderer: ({ value, record }) => (
          <a
            onClick={() => {
              const status = activeKey === 'all' ? 'read' : 'detail';
              handleDetail(record, status);
            }}
          >
            {value}
          </a>
        ),
      },
      {
        name: 'supplierCompanyName',
      },
      {
        name: 'dimensionCode',
        width: 100,
      },
      {
        name: 'companyName',
        width: 150,
      },
      {
        name: 'documentType',
        width: 100,
      },
      {
        name: 'fromStageId',
        width: 100,
        renderer: ({ record }) => record.get('fromStageDescription'),
      },
      {
        name: 'toStageId',
        width: 100,
        renderer: ({ record }) => record.get('toStageDescription'),
      },
      {
        name: 'realName',
        width: 100,
      },
      {
        name: 'creationDate',
        width: 120,
      },
      activeKey === 'all' && {
        name: 'approveDate',
        width: 120,
      },
      activeKey === 'all' && {
        name: 'approvalProgress',
        width: 160,
        title: intl.get('sslm.common.view.title.approvalProgress').d('审批进度'),
        renderer: ({ record }) => {
          const { approvalHistoryMap } = approvalInfo || {};
          return renderApproveProgress({ approvalHistoryMap, record });
        },
      },
    ].filter(Boolean);
    return columns;
  };

  // 筛选器左侧渲染
  const renderLeftSearchBar = useCallback((_, queryDataSet) => {
    return (
      <MultipleTextField
        dataSet={queryDataSet}
        name="multiSelectReqNums"
        placeholder={intl
          .get('sslm.lifeCycleManage.modal.placeholder.multiSelectReqNums')
          .d('请输入单据编号、供应商名称查询')}
      />
    );
  }, []);
  const leftConfig = {
    render: renderLeftSearchBar,
  };
  const searchBarLeftConfig = lifeCycleManageRemote
    ? lifeCycleManageRemote.process(
        'SSLM_LIFE_CYCLE_MANAGE_DOCUMENTS_SEARCH_BAR_LEFT',
        leftConfig,
        { context }
      )
    : leftConfig;

  // 处理筛选器默认查询
  const handleQuery = ({ params }) => {
    // changeFlag 解决详情返回列表时，仅改变列表页排序字段时，无法触发查询问题
    if (dataSet.getState('initQueryStatus') === 'ready' || searchBarRef?.state?.changeFlag) {
      if (dataSet.queryDataSet?.current) {
        const clearParams = {}; // 清理
        const dataObj = dataSet.queryDataSet.current.toData();
        if (dataObj) {
          for (const key in dataObj) {
            if (!['multiSelectReqNums'].includes(key)) {
              // 排除掉自定义的查询条件
              if (!Object.prototype.hasOwnProperty.call(params, key)) {
                clearParams[key] = undefined;
              }
            }
          }
        }
        // 处理多单号
        const reqList = params.multiSelectReqNums;
        clearParams.multiSelectReqNums = isEmpty(reqList) ? null : reqList.join(',');
        dataSet.queryDataSet.current.set({
          ...params,
          ...clearParams,
        });
        if (pageChacheFlag) {
          dataSet.query(dataSet.currentPage);
        } else {
          dataSet.query();
        }
      } else {
        // 解决设置默认值查询不生效问题
        searchBarRef.handleQuery(true);
      }
    }
  };

  // 清空、重置回调
  const clearValues = useCallback(() => {
    if (dataSet.queryDataSet && dataSet.queryDataSet.current) {
      dataSet.queryDataSet.current.reset();
      dataSet.setState('initQueryStatus', 'ready');
    }
  }, [dataSet]);

  // 筛选器field改变时的回调
  const handleFieldChange = useCallback(() => {
    setPageChacheFlag(false);
    dataSet.setState('initQueryStatus', 'ready');
  }, [dataSet]);

  return (
    <div style={{ height: `calc(100vh - 258px)` }}>
      {customizeTable(
        {
          code: customizeUnitCode,
        },
        <SearchBarTable
          cacheState
          dataSet={dataSet}
          columns={getColumns()}
          searchCode={searchCode}
          key={customizeUnitCode}
          style={{ maxHeight: tableMaxHeight.hasTab }}
          searchBarRef={ref => {
            searchBarRef = ref;
          }}
          searchBarConfig={{
            left: searchBarLeftConfig,
            onQuery: handleQuery,
            onReset: clearValues,
            onClear: clearValues,
            onFieldChange: handleFieldChange,
          }}
        />
      )}
    </div>
  );
};

export default Index;
