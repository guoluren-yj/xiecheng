/*
 * @Date: 2023-08-25 16:49:07
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */

import React, { useState, useEffect } from 'react';
import { Table, useDataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import { operationRecordsModal } from '@/routes/components/OperationRecords';
import { handleMenuPermissions, handleToDetail } from '@/routes/components/utils/utils';
import { getUpdateHistoryDS } from './stores/getUpdateHistoryDS';

const UpdateHistory = ({ remote, dispatch, purchaserId, supplierId }) => {
  const [menuPermission, setMenuPermission] = useState({});
  const dataSet = useDataSet(() => getUpdateHistoryDS({ purchaserId, supplierId }), [
    purchaserId,
    supplierId,
  ]);

  useEffect(() => {
    queryMenuPermissions();
  }, []);

  // 查询菜单权限集
  const queryMenuPermissions = async () => {
    const permissions = await handleMenuPermissions();
    setMenuPermission(permissions);
  };

  // 操作记录
  const handleOperated = record => {
    const { type, investgHeaderId, changeReqId } = record.toData();
    let documentType;
    let documentId;
    let params = {};
    switch (type) {
      // 调查表
      case 'INVESTIGATE':
        documentType = 'INVESTIGATE';
        documentId = investgHeaderId;
        params = { investgHeaderId };
        break;
      // 供应商信息变更
      case 'SUP_CHANGE':
        documentType = 'SUPPLIER_INFO_CHANGE';
        documentId = changeReqId;
        params = { changeReqId };
        break;
      // 企业信息变更
      case 'FIRM_CHANGE':
      case 'PLATFORM_FIRM_CHANGE':
        documentType = 'ENTERPRISE_TENANT_CONFIRM';
        documentId = changeReqId;
        params = { changeReqId };
        break;
      default:
        break;
    }
    if (documentId) {
      operationRecordsModal({
        remote,
        documentType,
        documentId,
        ...params,
      });
    }
  };

  const columns = [
    {
      name: 'versionNumber',
      width: 150,
    },
    {
      name: 'createUserName',
    },
    {
      name: 'updateDate',
    },
    {
      name: 'typeMeaning',
    },
    {
      name: 'documentCode',
      renderer: ({ value, record }) => {
        const { type, tenantFlag } = record.get(['type', 'tenantFlag']);
        return type === 'INTERFACE' ? (
          '-'
        ) : !tenantFlag ? (
          value
        ) : (
          <a
            onClick={() =>
              handleToDetail({
                data: record?.toData(),
                dispatch,
                menuPermission,
                openTabFlag: true,
              })
            }
          >
            {value}
          </a>
        );
      },
    },
    {
      name: 'operated',
      width: 150,
      renderer: ({ record }) => {
        const { type, tenantFlag } = record.get(['type', 'tenantFlag']);
        return type === 'INTERFACE' ? (
          '-'
        ) : (
          // tenantFlag 判断是否为当前租户数据
          <a disabled={!tenantFlag} onClick={() => handleOperated(record)}>
            {intl.get('hzero.common.button.operated').d('操作记录')}
          </a>
        );
      },
    },
  ];
  return (
    <Table
      customizable
      dataSet={dataSet}
      columns={columns}
      customizedCode="customized"
      style={{ maxHeight: 'calc(100vh - 220px)' }}
    />
  );
};

export default UpdateHistory;
