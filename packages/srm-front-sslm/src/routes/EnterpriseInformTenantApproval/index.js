/*
 * @Date: 2023-04-04 15:39:25
 * @date: 2023-08-31
 * @author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import querystring from 'querystring';
import { routerRedux } from 'dva/router';
import { compose } from 'lodash';
import { DataSet, Tabs, Modal, Form, TextArea, Icon, TextField } from 'choerodon-ui/pro';
import React, { Fragment, useCallback, useState, useEffect } from 'react';

import intl from 'utils/intl';
import remotes from 'utils/remote';
import withProps from 'utils/withProps';
import { Header, Content } from 'components/Page';
import SearchBarTable from '_components/SearchBarTable';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse, filterNullValueObject } from 'utils/utils';
import notification from 'utils/notification';

import { tableHeight, tableMaxHeight, renderStatus, useSetState } from '@/routes/components/utils';
import {
  confirm,
  approveReject,
  tenantConfirmBefore,
  tenantConfirm,
} from '@/services/enterpriseInformService';
import {
  queryAllApprovalData,
  renderApprovaBtn,
  renderApproveProgress,
} from '@/routes/components/WorkFlowApproval';
import { getPermissionList } from '@/routes/components/utils/utils';

import { documentList } from './utils';
import { getListDS, approvalModalDS, getQueryParams } from './stores/getListDS';
import HeaderBtn from './HeaderBtn';

const { TabPane } = Tabs;

const Index = ({
  remote,
  dispatch,
  tenantApprovalDs,
  platformConfirmDs,
  mixObj,
  custLoading,
  customizeTable,
  customizeTabPane,
  customizeBtnGroup,
}) => {
  const [activeKey, setActiveKey] = useState(mixObj.activeKey);
  const [pageChacheFlag, setPageChacheFlag] = useState(true);
  const [loading, setLoading] = useState(false);

  const [state, setState] = useSetState({
    tenantApprovalInfo: {
      approvalDataMap: {},
      revokeDataMap: {},
      approvalHistoryMap: {}, // 审批进度
    },
    platformConfirmInfo: {
      approvalDataMap: {},
      revokeDataMap: {},
      approvalHistoryMap: {}, // 审批进度
    },
  });

  const { tenantApprovalInfo, platformConfirmInfo } = state;

  const approvalDs = new DataSet(approvalModalDS()); // 审批弹框ds
  const approvalRecord = approvalDs?.current || {};

  useEffect(() => {
    tenantApprovalDs.setState('dsKey', 'tenantApprovalInfo');
    platformConfirmDs.setState('dsKey', 'platformConfirmInfo');
    tenantApprovalDs.addEventListener('load', handleDsLoadAfter);
    platformConfirmDs.addEventListener('load', handleDsLoadAfter);
    return () => {
      tenantApprovalDs.removeEventListener('load', handleDsLoadAfter);
      platformConfirmDs.removeEventListener('load', handleDsLoadAfter);
    };
  }, []);

  const handleDsLoadAfter = (dataSetProps = {}) => {
    const { dataSet } = dataSetProps;
    const dsKey = dataSet.getState('dsKey');
    const businessKeys = dataSet.filter(r => r.get('businessKey')).map(r => r.get('businessKey'));
    queryAllApprovalData({ businessKeys }).then(response => {
      if (response) {
        const { approvalDataMap, revokeDataMap, approvalHistoryMap } = response;
        setState({
          [dsKey]: {
            approvalDataMap,
            revokeDataMap,
            approvalHistoryMap,
          },
        });
      }
    });
  };

  // 跳转详情
  const handleDetail = useCallback(
    record => {
      const { changeReqId, changeConfirmId, partnerTenantId } = record.get([
        'changeReqId',
        'changeConfirmId',
        'partnerTenantId',
      ]);
      const pageType = activeKey === 'tenantApproval' ? 'approval' : 'confirm';
      // 清空选择的记录
      dataSetList[activeKey].unSelectAll();
      dataSetList[activeKey].clearCachedSelected();
      dispatch(
        routerRedux.push({
          pathname: `/sslm/enterprise-inform-tenant-approval-new/detail/${changeConfirmId}`,
          search: querystring.stringify(
            filterNullValueObject({ changeReqId, partnerTenantId, pageType })
          ),
        })
      );
    },
    [activeKey]
  );

  // tab改变时的回调
  const handleTabChange = useCallback(key => {
    setActiveKey(key);
    // eslint-disable-next-line no-param-reassign
    mixObj.activeKey = key;
    switch (key) {
      case 'tenantApproval':
        if (tenantApprovalDs.getState('queryStatus') === 'ready') {
          tenantApprovalDs.query(tenantApprovalDs.currentPage);
        }
        break;
      case 'platformConfirm':
        if (platformConfirmDs.getState('queryStatus') === 'ready') {
          platformConfirmDs.query(platformConfirmDs.currentPage);
        }
        break;
      default:
        break;
    }
  }, []);

  const getPermissionCode = () => {
    const permissionCodeList = {
      approvaPermission: {
        code:
          activeKey === 'tenantApproval'
            ? 'srm.partner.my-partner.firm-info-change-confirm-new.button.list.approval'
            : 'srm.partner.my-partner.firm-info-change-confirm-new.button.platform.list.approval',
        type: 'approva',
      },
      revokePermission: {
        code:
          activeKey === 'tenantApproval'
            ? 'srm.partner.my-partner.firm-info-change-confirm-new.button.list.repeal-approval'
            : 'srm.partner.my-partner.firm-info-change-confirm-new.button.platform.list.repeal-approval',
        type: 'revoke',
      },
    };
    return getPermissionList(permissionCodeList);
  };

  const columns = [
    {
      name: 'reqStatusMeaning',
      width: 120,
      renderer: renderStatus,
    },
    {
      name: 'operation',
      width: 100,
      renderer: ({ record, dataSet }) => {
        const processDataMap =
          activeKey === 'tenantApproval' ? tenantApprovalInfo : platformConfirmInfo;
        const approvalProps = {
          onSuccess: () => dataSet.query(),
          processDataMap,
          record,
          permissionListMap: getPermissionCode(),
        };
        return renderApprovaBtn(approvalProps) || '-';
      },
    },
    {
      name: 'changeReqNumber',
      width: 140,
      renderer: ({ value, record }) => <a onClick={() => handleDetail(record)}>{value}</a>,
    },
    {
      name: 'changeLevelMeaning',
      width: 120,
    },
    {
      name: 'companyNum',
    },
    {
      name: 'companyName',
      width: 210,
    },
    {
      name: 'submitDate',
      width: 130,
    },
    {
      name: 'lastProcessTime',
      width: 130,
    },
    {
      name: 'approvalProgress',
      title: intl.get('sslm.common.view.title.approvalProgress').d('审批进度'),
      width: 160,
      renderer: ({ record }) => {
        const processDataMap =
          activeKey === 'tenantApproval' ? tenantApprovalInfo : platformConfirmInfo;
        const { approvalHistoryMap } = processDataMap;
        return renderApproveProgress({ approvalHistoryMap, record });
      },
    },
  ];

  const dataSetList = {
    tenantApproval: tenantApprovalDs,
    platformConfirm: platformConfirmDs,
  };

  // 审批回调
  const handleApprove = (key, resolve) => {
    setLoading(true);
    const data = approvalRecord.toJSONData();
    const { approvalOpinion } = data;
    const currentListDs = dataSetList[activeKey];
    const selectedListData = currentListDs.toJSONData().map(i => ({ ...i, approvalOpinion }));
    const handleApproval = key === 'approved' ? confirm : approveReject;
    handleApproval({ data: selectedListData })
      .then(res => {
        if (getResponse(res)) {
          notification.success();
          currentListDs.query(1, {}, false);
          if (resolve) {
            resolve();
          }
        } else if (resolve) {
          resolve(false);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleOpenApprovelModal = useCallback(
    key => {
      return new Promise(solve => {
        Modal.open({
          key: Modal.key(),
          closable: false,
          movable: false,
          destroyOnClose: true,
          drawer: true,
          style: { width: 380 },
          title: intl.get('sslm.enterpriseInform.model.application.approvalOpinion').d('审批意见'),
          children: (
            <Form record={approvalRecord} labelLayout="float">
              <TextArea name="approvalOpinion" />
            </Form>
          ),
          onOk: () => {
            return new Promise(resolve => {
              if (key === 'designated') {
                solve(true);
                resolve(true);
                return;
              }
              handleApprove(key, resolve);
            });
          },
          onCancel: () => {
            solve(false);
          },
        });
      });
    },
    [activeKey]
  );

  const handleConfirm = useCallback(() => {
    const currentListDs = dataSetList[activeKey];
    const selectedListData = currentListDs.toJSONData();
    setLoading(true);
    // 校验是否需要弹窗提示
    tenantConfirmBefore({
      data: selectedListData,
      customizeUnitCode: 'SSLM.ENTERPRISE_TENANT_APPROVAL.LIST_CONFIRM_TABLE',
    })
      .then(res => {
        if (getResponse(res)) {
          const { errorFlag, docmentNumList = [] } = res;
          const title = !errorFlag
            ? intl.get('sslm.enterpriseInform.view.confirm.tenantConfirmMsg').d('是否确认？')
            : intl
                .get('sslm.enterpriseInform.view.confirm.tenantConfirmBeforeMsg', {
                  docmentNumStr: (docmentNumList || []).join('、'),
                })
                .d(
                  `存在历史版本的单据【${(docmentNumList || []).join(
                    '、'
                  )}】仍在审批中，继续操作将会终止原单据的审批流程，请确认是否继续？`
                );
          Modal.confirm({
            title: intl.get('hzero.common.message.confirm.title').d('提示'),
            children: title,
            onOk: () => {
              return new Promise(resolve => {
                tenantConfirm({ data: selectedListData })
                  .then(resp => {
                    if (getResponse(resp)) {
                      notification.success();
                      currentListDs.query(1, {}, false);
                      resolve();
                    } else {
                      resolve(false);
                    }
                  })
                  .catch(() => resolve(false));
              });
            },
          });
        }
      })
      .finally(() => setLoading(false));
  }, [activeKey]);

  const renderLeftSearchBar = useCallback(queryDataSet => {
    return (
      <TextField
        clearButton
        name="companyName"
        dataSet={queryDataSet}
        style={{ width: 280 }}
        placeholder={intl.get('sslm.common.modal.common.companyName').d('请输入企业名称')}
        prefix={<Icon type="search" style={{ fontSize: 14, paddingLeft: 8, paddingRight: 8 }} />}
      />
    );
  }, []);

  const handleQuery = useCallback(
    (queryProps = {}) => {
      const { params } = queryProps;
      const tableDs = dataSetList[activeKey];
      if (tableDs.queryDataSet?.current) {
        const clearParams = {}; // 清理
        const dataObj = tableDs.queryDataSet.current.toData();
        if (dataObj) {
          for (const key in dataObj) {
            // 排除掉自定义的查询条件
            if (!Object.prototype.hasOwnProperty.call(params, key)) {
              clearParams[key] = undefined;
            }
          }
        }
        // 处理多单号
        tableDs.queryDataSet.current.set({
          ...params,
          ...clearParams,
        });
        if (pageChacheFlag) {
          tableDs.query(tableDs.currentPage);
        } else {
          tableDs.query();
        }
      } else {
        tableDs.query(tableDs.currentPage);
      }
    },
    [activeKey]
  );

  // 清空、重置回调
  const clearValues = useCallback(() => {
    const tableDs = dataSetList[activeKey];
    // eslint-disable-next-line no-unused-expressions
    tableDs.queryDataSet?.current.reset();
  }, [activeKey]);

  // 获取导出参数
  const getExportParams = () => {
    const { unitCode = [] } = getQueryParams(activeKey);
    let exportParams = {
      customizeUnitCode: unitCode.join(','),
    };
    const ds = dataSetList[activeKey];
    if (ds) {
      const queryData = ds.queryDataSet.current.toData();
      const queryParams = filterNullValueObject(queryData);
      const { __dirty, ...others } = queryParams;
      const ids = ds
        .toJSONData()
        .map(i => i.changeConfirmId)
        .join(',');
      exportParams = {
        ...exportParams,
        ...others,
        changeConfirmIds: ids,
      };
    }
    return exportParams;
  };

  return (
    <Fragment>
      <Header
        title={intl.get('sslm.enterpriseInform.view.title.changeConfirm').d('企业信息变更审批')}
      >
        <HeaderBtn
          remote={remote}
          dataSetList={dataSetList}
          loading={loading}
          activeKey={activeKey}
          handleOpenApprovelModal={handleOpenApprovelModal}
          handleConfirm={handleConfirm}
          handleApprove={handleApprove}
          getExportParams={getExportParams}
          customizeBtnGroup={customizeBtnGroup}
        />
      </Header>
      <Content>
        {customizeTabPane(
          {
            code: 'SSLM.ENTERPRISE_TENANT_APPROVAL.LIST_TAB',
            custDefaultActive: key => {
              const currentKey = key || activeKey;
              // 获取个性化配置的默认激活key，没配置的值为undefined
              handleTabChange(currentKey);
            },
          },
          <Tabs activeKey={activeKey} onChange={handleTabChange}>
            {documentList().map(document => (
              <TabPane tab={document.tab} key={document.key}>
                <div style={{ height: tableHeight.hasTab }}>
                  {customizeTable(
                    {
                      code: document.customizeUnitCode,
                    },
                    <SearchBarTable
                      cacheState
                      columns={columns}
                      custLoading={custLoading}
                      searchCode={document.searchCode}
                      dataSet={dataSetList[document.key]}
                      style={{ maxHeight: tableMaxHeight.hasTab }}
                      searchBarConfig={{
                        left: {
                          render: (_, queryDataSet) => renderLeftSearchBar(queryDataSet),
                        },
                        onQuery: queryProps => handleQuery(queryProps),
                        onReset: () => clearValues(),
                        onClear: () => clearValues(),
                        onFieldChange: () => {
                          setPageChacheFlag(false);
                        },
                      }}
                    />
                  )}
                </div>
              </TabPane>
            ))}
          </Tabs>
        )}
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: ['sslm.common', 'sslm.enterpriseInform'],
  }),
  withCustomize({
    unitCode: [
      'SSLM.ENTERPRISE_TENANT_APPROVAL.LIST_TAB',
      'SSLM.ENTERPRISE_TENANT_APPROVAL.LIST_APPROVAL_TABLE',
      'SSLM.ENTERPRISE_TENANT_APPROVAL.LIST_CONFIRM_TABLE',
      'SSLM.ENTERPRISE_TENANT_APPROVAL.BTNS',
      'SSLM.ENTERPRISE_TENANT_APPROVAL.PLARFORM.BTNS',
    ],
  }),
  withProps(
    () => {
      const mixObj = {
        activeKey: 'tenantApproval',
      };
      const tenantApprovalDs = new DataSet(getListDS('tenantApproval')); // 租户审批
      const platformConfirmDs = new DataSet(getListDS('platformConfirm')); // 审批中
      return { tenantApprovalDs, platformConfirmDs, mixObj };
    },
    { cacheState: true }
  ),
  remotes({ code: 'SSLM_ENTERPRISE_INFO_TENANT_APPROVAL' })
)(Index);
