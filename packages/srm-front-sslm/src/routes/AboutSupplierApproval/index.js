/**
 * 供应商相关审批
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2022-07-10 16:09:54
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-10-31 17:02:20
 * @FilePath: /srm-front-sslm/src/routes/AboutSupplierApproval/index.js
 * @Copyright (c) 2022 by ZhenYun, All Rights Reserved.
 */
import React, { Fragment, useState, useEffect } from 'react';
import { DataSet, Button, Modal, Tabs, notification, Form, TextArea } from 'choerodon-ui/pro';
import { Header, Content } from 'components/Page';
import SearchBarTable from '_components/SearchBarTable';

import { compose, isEmpty } from 'lodash';
import { observer } from 'mobx-react';
import intl from 'utils/intl';
import withProps from 'utils/withProps';
import formatterCollections from 'utils/intl/formatterCollections';
import { renderStatus, tableMaxHeight, tableHeight } from '@/routes/components/utils';
import { getResponse } from 'utils/utils';
import {
  tenantAdminApproval,
  realNameAuthenticationApproval,
  associatedEnterprisesDsApproval,
  tenantAdminApprovalRefused,
  realNameAuthenticationApprovalRefused,
  associatedEnterprisesDsApprovalRefused,
  queryCount,
} from '@/services/abooutSupplierApprovalService';
import {
  getTenantAdminDs,
  getRealNameAuthenticationDs,
  getAssociatedEnterprisesDs,
  getRefusedDs,
} from './stores';

const { TabPane } = Tabs;

const AboutSupplierApproval = observer(
  ({ tenantAdminDs, realNameAuthenticationDs, associatedEnterprisesDs, refusedDs }) => {
    const [currentTabKey, setCurrentTabKey] = useState('tenantAdmin');
    const [approvalLoading, setApprovalLoading] = useState(false);
    const [tabCount, setTabCount] = useState({});

    // 租户管理员审批
    const tenantAdminColumns = [
      {
        name: 'statusMeaning',
        width: 150,
        // lock: true,
        renderer: renderStatus,
      },
      {
        name: 'companyName',
        width: 150,
        // lock: true,
      },
      {
        name: 'tenantNum',
        width: 150,
        // lock: true,
      },
      {
        name: 'tenantName',
        width: 150,
        // lock: true,
      },
      {
        name: 'applicantName',
        width: 150,
        // lock: true,
      },
      {
        name: 'realName',
        width: 150,
        // lock: true,
      },
      {
        name: 'loginName',
        width: 150,
        // lock: true,
      },
      {
        name: 'lastUpdateDate',
        width: 200,
        // lock: true,
      },
      {
        name: 'reason',
        width: 150,
        // lock: true,
      },
      {
        name: 'attachmentUuid',
        width: 150,
      },
    ];
    // 实名认证审批
    const realNameAuthenticationColumns = [
      {
        name: 'attestationStatusMeaning',
        width: 150,
        // lock: true,
        renderer: renderStatus,
      },
      {
        name: 'name',
        width: 150,
        // lock: true,
      },
      {
        name: 'lastUpdateDate',
        width: 200,
        // lock: true,
      },
      {
        name: 'idCard',
        width: 150,
        // lock: true,
      },
      {
        name: 'idFrontUuid',
        width: 150,
      },
      {
        name: 'idBackUuid',
        width: 150,
      },
    ];
    // 关联企业审批
    const associatedEnterprisesColumns = [
      {
        name: 'attestationStatusMeaning',
        width: 150,
        // lock: true,
        renderer: renderStatus,
      },
      {
        name: 'companyName',
        width: 150,
        // lock: true,
      },
      {
        name: 'realName',
        width: 150,
        // lock: true,
      },
      {
        name: 'proposerName',
        width: 150,
        // lock: true,
      },
      {
        name: 'creationDate',
        width: 200,
        // lock: true,
      },
      {
        name: 'reason',
        width: 150,
        // lock: true,
      },
      {
        name: 'attachmentUuid',
        width: 150,
      },
    ];

    const tabs = [
      {
        key: 'tenantAdmin',
        tab: intl.get('sslm.AboutSupplierApproval.view.tabPane.tenantAdmin').d('供应商管理员审批'),
        searchBarCode: 'SSLM.ABOUTSUPPLIERAPPROVAL.TENANT_ADMIN_SEARCH_BAR',
        dataSet: tenantAdminDs,
        columns: tenantAdminColumns,
        countCode: 'roleApplyCount',
      },
      {
        key: 'realNameAuthentication',
        tab: intl
          .get('sslm.AboutSupplierApproval.view.tabPane.realNameAuthentication')
          .d('实名认证审批'),
        searchBarCode: 'SSLM.ABOUTSUPPLIERAPPROVAL.REAL_NAME_SEARCH_BAR',
        dataSet: realNameAuthenticationDs,
        columns: realNameAuthenticationColumns,
        countCode: 'userAttestationCount',
      },
      {
        key: 'associatedEnterprises',
        tab: intl
          .get('sslm.AboutSupplierApproval.view.tabPane.associatedEnterprises')
          .d('关联企业审批'),
        searchBarCode: 'SSLM.ABOUTSUPPLIERAPPROVAL.ASSOCIATED_SEARCH_BAR',
        dataSet: associatedEnterprisesDs,
        columns: associatedEnterprisesColumns,
        countCode: 'companyAttestationCount',
      },
    ];

    const handleQueryList = currentActiveKey => {
      const activeKey = currentActiveKey || currentTabKey;
      switch (activeKey) {
        case 'tenantAdmin':
          tenantAdminDs.setQueryParameter('status', 'APPROVING');
          tenantAdminDs.query(tenantAdminDs.currentPage);
          break;

        case 'realNameAuthentication':
          realNameAuthenticationDs.setQueryParameter('attestationStatus', 'APPROVING');
          realNameAuthenticationDs.query(realNameAuthenticationDs.currentPage);
          break;

        case 'associatedEnterprises':
          // associatedEnterprisesDs.setQueryParameter('attestationStatus', 'APPROVING');
          associatedEnterprisesDs.query(associatedEnterprisesDs.currentPage);
          break;

        default:
          break;
      }
    };

    const handleApproval = currentActiveKey => {
      setApprovalLoading(true);
      const activeKey = currentActiveKey || currentTabKey;
      const tenantAdminSelectedRecords = tenantAdminDs.selected.map(record => record.toData());
      const realNameAuthenticationSelectedRecords = realNameAuthenticationDs.selected.map(record =>
        record.toData()
      );
      const associatedEnterprisesDsSelectedRecords = associatedEnterprisesDs.selected.map(record =>
        record.toData()
      );
      switch (activeKey) {
        case 'tenantAdmin':
          tenantAdminApproval(tenantAdminSelectedRecords)
            .then(res => {
              const result = getResponse(res);
              if (result) {
                notification.success({
                  placement: 'bottomRight',
                  message: intl.get('hzero.common.notification.success').d('操作成功'),
                });
                tenantAdminDs.unSelectAll();
                tenantAdminDs.clearCachedSelected();
                handleQueryList(currentActiveKey);
                handleQueryCount();
              }
            })
            .finally(() => {
              setApprovalLoading(false);
            });
          break;

        case 'realNameAuthentication':
          realNameAuthenticationApproval(realNameAuthenticationSelectedRecords)
            .then(res => {
              const result = getResponse(res);
              if (result) {
                notification.success({
                  placement: 'bottomRight',
                  message: intl.get('hzero.common.notification.success').d('操作成功'),
                });
                realNameAuthenticationDs.unSelectAll();
                realNameAuthenticationDs.clearCachedSelected();
                handleQueryList(currentActiveKey);
                handleQueryCount();
              }
            })
            .finally(() => {
              setApprovalLoading(false);
            });
          break;

        case 'associatedEnterprises':
          associatedEnterprisesDsApproval(associatedEnterprisesDsSelectedRecords)
            .then(res => {
              const result = getResponse(res);
              if (result) {
                notification.success({
                  placement: 'bottomRight',
                  message: intl.get('hzero.common.notification.success').d('操作成功'),
                });
                associatedEnterprisesDs.unSelectAll();
                associatedEnterprisesDs.clearCachedSelected();
                handleQueryList(currentActiveKey);
                handleQueryCount();
              }
            })
            .finally(() => {
              setApprovalLoading(false);
            });
          break;

        default:
          break;
      }
    };

    const handleApprovalRefused = async currentActiveKey => {
      setApprovalLoading(true);

      const formValues = refusedDs.current.toData();
      const flag = await refusedDs.validate();
      if (flag) {
        const activeKey = currentActiveKey || currentTabKey;
        const tenantAdminSelectedRecords = tenantAdminDs.selected.map(record => ({
          ...record.toData(),
          ...formValues,
        }));
        const realNameAuthenticationSelectedRecords = realNameAuthenticationDs.selected.map(
          record => ({
            ...record.toData(),
            ...formValues,
          })
        );

        const associatedEnterprisesDsSelectedRecords = associatedEnterprisesDs.selected.map(
          record => ({
            ...record.toData(),
            ...formValues,
          })
        );
        switch (activeKey) {
          case 'tenantAdmin':
            return tenantAdminApprovalRefused(tenantAdminSelectedRecords)
              .then(res => {
                const result = getResponse(res);
                if (result) {
                  notification.success({
                    placement: 'bottomRight',
                    message: intl.get('hzero.common.notification.success').d('操作成功'),
                  });
                  tenantAdminDs.unSelectAll();
                  tenantAdminDs.clearCachedSelected();
                  handleQueryList(currentActiveKey);
                  handleQueryCount();
                }
              })
              .finally(() => {
                setApprovalLoading(false);
              });

          case 'realNameAuthentication':
            return realNameAuthenticationApprovalRefused(realNameAuthenticationSelectedRecords)
              .then(res => {
                const result = getResponse(res);
                if (result) {
                  notification.success({
                    placement: 'bottomRight',
                    message: intl.get('hzero.common.notification.success').d('操作成功'),
                  });
                  realNameAuthenticationDs.unSelectAll();
                  realNameAuthenticationDs.clearCachedSelected();
                  handleQueryList(currentActiveKey);
                  handleQueryCount();
                }
              })
              .finally(() => {
                setApprovalLoading(false);
              });

          case 'associatedEnterprises':
            return associatedEnterprisesDsApprovalRefused(associatedEnterprisesDsSelectedRecords)
              .then(res => {
                const result = getResponse(res);
                if (result) {
                  notification.success({
                    placement: 'bottomRight',
                    message: intl.get('hzero.common.notification.success').d('操作成功'),
                  });
                  associatedEnterprisesDs.unSelectAll();
                  associatedEnterprisesDs.clearCachedSelected();
                  handleQueryList(currentActiveKey);
                  handleQueryCount();
                }
              })
              .finally(() => {
                setApprovalLoading(false);
              });

          default:
            return false;
        }
      } else {
        return false;
      }
    };

    const handleRefusedModal = () => {
      Modal.open({
        title: intl.get('sslm.AboutSupplierApproval.view.ModalTitle.RefusedTitle').d('拒绝理由'),
        drawer: true,
        style: { width: '380px' },
        okText: intl.get('hzero.common.button.sure').d('确定'),
        cancelText: intl.get('hzero.common.button.cancel').d('取消'),
        onOk: () => handleApprovalRefused(currentTabKey),
        children: (
          <Form dataSet={refusedDs} labelLayout="float">
            <TextArea name="remark" />
          </Form>
        ),
        afterClose: () => {
          refusedDs.reset();
        },
      });
    };

    const handleQueryCount = () => {
      queryCount().then(res => {
        if (getResponse(res)) {
          setTabCount(res);
        }
      });
    };

    useEffect(() => {
      handleQueryList();
      handleQueryCount();
    }, []);

    const getEditorProps = () => ({
      // 状态不允许清空，因为状态有默认值【审批中】，清空查询会走默认值逻辑但是界面显示的空
      attestationStatus: {
        clearButton: false,
      },
    });

    const isDisabled =
      (isEmpty(tenantAdminDs.selected) && currentTabKey === 'tenantAdmin') ||
      (isEmpty(realNameAuthenticationDs.selected) && currentTabKey === 'realNameAuthentication') ||
      (isEmpty(associatedEnterprisesDs.selected) && currentTabKey === 'associatedEnterprises');

    return (
      <Fragment>
        <Header
          title={intl
            .get('sslm.AboutSupplierApproval.view.title.AboutSupplier')
            .d('供应商相关审批')}
        >
          <Button
            color="green"
            icon="check_circle"
            loading={approvalLoading}
            onClick={() => handleApproval(currentTabKey)}
            disabled={isDisabled}
          >
            {intl.get('sslm.AboutSupplierApproval.view.button.approval').d('审批通过')}
          </Button>
          <Button
            color="red"
            icon="cancel"
            onClick={handleRefusedModal}
            disabled={isDisabled}
            loading={approvalLoading}
          >
            {intl.get('sslm.AboutSupplierApproval.view.button.approvalRefused').d('审批拒绝')}
          </Button>
        </Header>
        <Content>
          <Tabs
            activeKey={currentTabKey}
            animated={false}
            onChange={newActiveKey => {
              setCurrentTabKey(newActiveKey);
              handleQueryList(newActiveKey);
            }}
          >
            {tabs.map(({ key, tab, dataSet, searchBarCode, columns, countCode }) => {
              // countCode
              return (
                <TabPane tab={`${tab} ${tabCount[countCode] || ''}`} key={key}>
                  <div style={{ height: tableHeight.hasTab }}>
                    <SearchBarTable
                      cacheState
                      dataSet={dataSet}
                      columns={columns}
                      // custLoading={custLoading}
                      searchCode={searchBarCode}
                      searchBarConfig={{
                        autoQuery: false,
                        editorProps: getEditorProps(),
                      }}
                      style={{
                        maxHeight: tableMaxHeight.hasTab,
                      }}
                    />
                  </div>
                </TabPane>
              );
            })}
          </Tabs>
        </Content>
      </Fragment>
    );
  }
);
export default compose(
  formatterCollections({
    code: ['sslm.AboutSupplierApproval', 'sslm.common'],
  }),
  withProps(
    () => {
      const tenantAdminDs = new DataSet(getTenantAdminDs());
      const realNameAuthenticationDs = new DataSet(getRealNameAuthenticationDs());
      const associatedEnterprisesDs = new DataSet(getAssociatedEnterprisesDs());
      const refusedDs = new DataSet(getRefusedDs());
      return {
        tenantAdminDs,
        realNameAuthenticationDs,
        associatedEnterprisesDs,
        refusedDs,
      };
    },
    { cacheState: true }
  )
)(AboutSupplierApproval);
