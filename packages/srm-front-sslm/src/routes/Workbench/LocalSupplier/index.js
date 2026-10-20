/**
 * LocalSupplier - 本地供应商
 * @date: 2021-04-28
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */
import { head } from 'lodash';
import queryString from 'querystring';
import { withRouter } from 'dva/router';
import React, { Fragment, useCallback } from 'react';
import { Modal, DataSet, Tooltip, Icon, Table } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { getCurrentUserId, getResponse } from 'utils/utils';
import { Button as PermissionButton } from 'components/Permission';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';

import {
  verifySupplierUpdate,
  relevantEnterprise,
  cancelRelevant,
  singleUpdateSupplierData,
} from '@/services/workbenchService';
import styles from '@/routes/index.less';
import { tableMaxHeight, tableHeight } from '@/routes/components/utils';
import Detail from './Detail';
import RelevantTable from './RelevantTable';
import { getRelevantTableDS, getRelevantTableColumns } from '../stores/relevantTableDS';
import { getRelevantRecordsDs, getRelevantRecordsColumns } from '../stores/relevantRecordsDS';

const currentUserId = getCurrentUserId();

const LocalSupplier = ({
  localSupplierListDs,
  permissionFlag,
  history,
  custLoading,
  customizeTable,
  customizeForm,
  getHocInstance,
  remote,
}) => {
  // 查看供应商详情
  // 解决children做个性化时，即使key固定仍会打开多个modal问题
  let _modal;
  const viewSupplierDetail = async record => {
    const eventProps = {
      record,
    };
    // 默认返回true,当返回false时走二开逻辑不走标准逻辑
    const res = await remote.event.fireEvent('cuxHandleViewLocalSupplierInfo', eventProps);
    if (!res) {
      return;
    }
    if (_modal) {
      _modal.update({
        children: (
          <Detail
            record={record}
            customizeTable={customizeTable}
            custLoading={custLoading}
            customizeForm={customizeForm}
            getHocInstance={getHocInstance}
          />
        ),
      });
    } else {
      _modal = Modal.open({
        mask: false,
        drawer: true,
        okCancel: false,
        key: 'supplierInfo',
        destroyOnClose: true,
        style: { width: 1000 },
        okText: intl.get('hzero.common.button.close').d('关闭'),
        title: intl.get('sslm.workbench.view.title.localSupplierInfo').d('本地供应商信息'),
        children: (
          <Detail
            record={record}
            customizeTable={customizeTable}
            customizeForm={customizeForm}
            custLoading={custLoading}
            getHocInstance={getHocInstance}
          />
        ),
        onOk: () => {
          _modal = undefined;
        },
        onCancel: () => {
          _modal = undefined;
        },
      });
    }
  };

  // 变更信息
  const handleChangeInfo = async record => {
    const { data: { linkId } = {} } = record;
    if (!linkId) {
      verifySupplierUpdate(record.toData()).then(response => {
        const res = getResponse(response);
        if (res) {
          const { data: { supplierId, supplierNum } = {} } = record;
          history.push({
            pathname: `/sslm/supplier-warehouse/create/${currentUserId}`,
            search: queryString.stringify({ supplierId, supplierNum }),
          });
        }
      });
    } else {
      const eventProps = {
        record,
      };
      // 默认返回true,当返回false时走二开逻辑不走标准逻辑
      const res = await remote.event.fireEvent('cuxHandleUpdateSupplierWarehouse', eventProps);
      if (!res) {
        return;
      }
      notification.warning({
        message: intl
          .get('sslm.common.view.message.changeInfoWarning')
          .d('该供应商已在平台注册，如需修改信息请联系供应商发起信息变更'),
      });
    }
  };

  // 取消关联
  const handleCancelRelevant = useCallback(record => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl.get('sslm.workbench.model.workbench.isCancelRelevant').d('是否取消关联'),
      onOk: () => {
        const data = record.toData();
        return cancelRelevant([data]).then(response => {
          const res = getResponse(response);
          if (res) {
            notification.success();
            localSupplierListDs.query();
          }
        });
      },
    });
  }, []);

  // 关联企业弹框回调
  const relevantCallBack = async params => {
    await relevantEnterprise(params).then(response => {
      const res = getResponse(response);
      if (res) {
        if (res.failedCounts === 0) {
          Modal.destroyAll();
          notification.success();
          localSupplierListDs.query(localSupplierListDs.currentPage);
        } else {
          notification.warning({
            message: res.failedErpList[0]?.errorMessage,
          });
        }
      }
    });
  };

  // 关联企业
  const handleRelevant = useCallback(record => {
    const { data: { supplierName } = {} } = record;
    const data = record.toData() || {};
    const ouCode = record.get('ouCode'); // ouCode 大金空调值集查询时需要传参ouCode业务实体，其他租户时后端查询不将ouCode作为查询条件
    const relevantTableDs = new DataSet(getRelevantTableDS(ouCode));
    relevantTableDs.setQueryParameter('ouCode', ouCode);
    Modal.open({
      title: `${intl
        .get('sslm.workbench.model.title.matchRelevant')
        .d('匹配关联')}-${supplierName}`,
      drawer: true,
      bodyStyle: { paddingTop: 16 },
      style: { width: 742 },
      children: <RelevantTable dataSet={relevantTableDs} columns={getRelevantTableColumns} />,
      onOk: async () => {
        const selectedRow = head(relevantTableDs.toJSONData());
        if (selectedRow) {
          const { supplierCompanyId, supplierCompanyName } = selectedRow;
          const params = [{ ...data, supplierCompanyId }];
          if (supplierCompanyName !== supplierName) {
            Modal.confirm({
              title: intl.get('hzero.common.message.confirm.title').d('提示'),
              children: intl
                .get('sslm.workbench.model.confirm.relevantMsg')
                .d('待匹配供应商名称不一致，请确认是否匹配'),
              onOk: () => relevantCallBack(params),
            });
          } else {
            relevantCallBack(params);
          }
        } else {
          notification.warning({
            message: intl
              .get('sslm.workbench.model.warnMsg.selectOneSupplier')
              .d('请选择平台供应商！'),
          });
        }
        return false;
      },
    });
  }, []);

  // 关联记录
  const handleRelevantRecords = record => {
    const supplierId = record.get('supplierId');
    const relevantRecordsDs = new DataSet(getRelevantRecordsDs({ supplierId }));
    Modal.open({
      drawer: true,
      key: Modal.key(),
      cancelButton: false,
      style: { width: 1090 },
      okText: intl.get('hzero.common.button.close').d('关闭'),
      title: intl.get('sslm.workbench.model.workbench.relevantRecords').d('关联记录'),
      children: (
        <Table
          dataSet={relevantRecordsDs}
          columns={getRelevantRecordsColumns}
          style={{ maxHeight: 'calc(100vh - 200px)' }}
        />
      ),
    });
  };

  // 更新单据供应商数据
  const updateSupplierData = useCallback(record => {
    const data = record.toData();
    const {
      linkId,
      associatePushFlag,
      associateOtherErpPushFlag,
      erpPushSupplierNum,
      erpPushSupplierName,
      companyNum,
      companyName,
    } = data;
    const erpSupplier = `${erpPushSupplierNum}${erpPushSupplierName}`;
    const platformSupplier = `${companyNum}${companyName}`;
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: associateOtherErpPushFlag
        ? intl
            .get('sslm.workbench.model.confirm.alreadyUpdateSupplierDataMsg', {
              platformSupplier,
              erpSupplier,
            })
            .d(
              `当前供应商已选择需要刷新【${platformSupplier}和${erpSupplier}】，是否需要替换为当前数据？`
            )
        : associatePushFlag
        ? intl
            .get('sslm.workbench.model.confirm.cancelUpdateSupplierDataMsg')
            .d(
              '取消后，当晚将不再执行单据中平台/本地供应商字段为空的数据更新任务，请确认是否取消？'
            )
        : intl
            .get('sslm.workbench.model.confirm.updateSupplierDataMsg')
            .d(
              '请确认是否将该供应商历史单据中平台/本地供应商为空的数据统一更新为当前平台供应商和本地供应商。若不刷新，则无法查询以本地供应商身份产生的单据。'
            ),
      onOk: () => {
        return singleUpdateSupplierData({
          ...data,
          supplierCompanyId: linkId,
          refreshFlag: associatePushFlag === 1 ? 0 : 1,
        }).then(response => {
          const res = getResponse(response);
          if (res) {
            localSupplierListDs.query();
          }
        });
      },
    });
  }, []);

  const columns = [
    {
      name: 'supplierNum',
      width: 120,
      renderer: ({ value, record }) =>
        value ? <a onClick={() => viewSupplierDetail(record)}>{value}</a> : '-',
    },
    {
      name: 'option',
      width: 310,
      renderer: ({ record }) => {
        const { linkId, associatePushFlag } = record.get(['linkId', 'associatePushFlag']);
        return (
          <Fragment>
            {permissionFlag && (
              <PermissionButton
                type="c7n-pro"
                funcType="link"
                onClick={() => handleChangeInfo(record)}
                style={{ marginRight: 8 }}
                permissionList={[
                  {
                    code: `srm.partner.my-partner.supplier-workbench.ps.supplier.button.change-info`,
                    type: 'button',
                    meaning: '本地供应商-变更信息',
                  },
                ]}
              >
                {intl.get('sslm.workbench.model.workbench.changeInfo').d('变更信息')}
              </PermissionButton>
            )}
            {linkId ? (
              <PermissionButton
                type="c7n-pro"
                funcType="link"
                style={{ marginRight: 8 }}
                onClick={() => handleCancelRelevant(record)}
                permissionList={[
                  {
                    code: `srm.partner.my-partner.supplier-workbench.ps.supplier.button.unlink-erp`,
                    type: 'button',
                    meaning: '本地供应商-取消关联',
                  },
                ]}
              >
                {intl.get('sslm.workbench.model.workbench.cancelRelevant').d('取消关联')}
              </PermissionButton>
            ) : (
              <PermissionButton
                type="c7n-pro"
                funcType="link"
                style={{ marginRight: 8 }}
                onClick={() => handleRelevant(record)}
                permissionList={[
                  {
                    code: `srm.partner.my-partner.supplier-workbench.ps.supplier.button.link-erp`,
                    type: 'button',
                    meaning: '本地供应商-匹配关联',
                  },
                ]}
              >
                {intl.get('sslm.workbench.model.workbench.matchRelevant').d('匹配关联')}
              </PermissionButton>
            )}
            {linkId && (
              <PermissionButton
                type="c7n-pro"
                funcType="link"
                onClick={() => updateSupplierData(record)}
              >
                {associatePushFlag
                  ? intl
                      .get('sslm.workbench.model.workbench.cancelUpdateSupplierData')
                      .d('取消更新单据供应商数据')
                  : intl
                      .get('sslm.workbench.model.workbench.updateSupplierData')
                      .d('更新单据供应商数据')}
                <Tooltip
                  title={
                    associatePushFlag
                      ? intl
                          .get('sslm.workbench.model.workbench.cancelUpdateSupplierDataMsg')
                          .d(
                            '可将历史单据中平台/本地供应商为空的数据统一更新为当前平台供应商和本地供应商。取消后，当晚不再执行刷新单据。'
                          )
                      : intl
                          .get('sslm.workbench.model.workbench.updateSupplierDataMsg')
                          .d(
                            '可将历史单据中平台/本地供应商为空的数据统一更新为当前平台供应商和本地供应商。标记后，业务单据每晚执行刷新。'
                          )
                  }
                >
                  <Icon type="help" className={styles['btn-help']} />
                </Tooltip>
              </PermissionButton>
            )}
          </Fragment>
        );
      },
    },
    {
      name: 'supplierName',
    },
    {
      name: 'companyNum',
      width: 120,
    },
    {
      name: 'companyName',
    },
    {
      name: 'sourceDate',
      width: 140,
    },
    {
      name: 'externalSystemCode',
      width: 140,
    },
    {
      name: 'passport',
      width: 150,
    },
    {
      name: 'supplierDunsCode',
      width: 150,
    },
    {
      name: 'businessRegistrationNumber',
      width: 150,
    },
    {
      name: 'supplierUnifiedSocialCode',
      width: 150,
    },
    {
      name: 'idNum',
      width: 150,
    },
    {
      name: 'supplierOrganizingInstitutionCode',
      width: 150,
    },
    {
      name: 'relevantRecords',
      width: 100,
      renderer: ({ record }) => (
        <a onClick={() => handleRelevantRecords(record)}>
          {intl.get('sslm.workbench.model.workbench.relevantRecords').d('关联记录')}
        </a>
      ),
    },
  ];

  return (
    <div style={{ height: tableHeight.hasTab }}>
      {customizeTable(
        {
          code: 'SSLM.SUPPLIER_WORKBENCH_LOCAL.LIST',
          readOnly: true,
        },
        <SearchBarTable
          cacheState
          columns={columns}
          custLoading={custLoading}
          dataSet={localSupplierListDs}
          style={{ maxHeight: tableMaxHeight.hasTab }}
          searchCode="SSLM.SUPPLIER_WORKBENCH_LOCAL.SEARCH_BAR"
        />
      )}
    </div>
  );
};

export default withRouter(LocalSupplier);
