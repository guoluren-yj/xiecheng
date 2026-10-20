/**
 * Indication 标准指标定义----细项权限
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2022-09-15 14:50:59
 * @FilePath: /srm-front-sslm/src/routes/SupplierKpiIndicator/IndicationAssign/index.js
 * @Copyright (c) 2022 by ZhenYun, All Rights Reserved.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Button, Drawer } from 'hzero-ui';
import intl from 'utils/intl';
import EditTable from 'components/EditTable';
import { getResponse, getEditTableData, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import { isEmpty, sum, isArray, isNil, uniqBy } from 'lodash';
import uuidv4 from 'uuid/v4';
import LovMultiple from '@/routes/components/LovMultiple';

import { queryPermissionList, savePermissionList } from '@/services/supplierKpiIndicatorService';
import { getColumns } from './utils';

const IndicationAssign = ({
  visible,
  onCancel,
  isBatch = false,
  tableCode,
  customizeTable,
  indicatorRowDataSource: { indicatorId, indicatorCode } = {},
  indicationSelectedRows = [],
}) => {
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [isRespWeightRequired, setIsRespWeightRequired] = useState(false);

  /**
   * @description: 一行修改，控制多行必填
   * @return {*}
   */
  const handleCheckedRespWeight = useCallback(
    (newValue, record) => {
      let flag = false;
      if (!isNil(newValue) && newValue !== '') {
        // setIsRespWeightRequired(true);
        flag = true;
      } else {
        const checkedData = dataSource.filter(i => i.kpiIndRespId !== record.kpiIndRespId);
        for (const idx of checkedData) {
          const respWeight = idx.$form.getFieldValue('respWeight');
          if (!isNil(respWeight) && respWeight !== '') {
            flag = true;
            break;
          }
        }
      }
      setIsRespWeightRequired(flag);
    },
    [dataSource]
  );

  const columns = getColumns({ handleCheckedRespWeight, isRespWeightRequired, dataSource });

  /**
   * @description: 新增评分人信息
   * @return {*}
   */
  const handleAdd = useCallback(
    lovRecords => {
      const newDataSource = lovRecords.map(({ loginName, userId, userName }) => ({
        respLoginName: loginName,
        respUserId: userId,
        respUserName: userName,
        indicatorId,
        tenantId: getCurrentOrganizationId(),
        _status: 'create',
        kpiIndRespId: uuidv4(),
      }));
      setDataSource(uniqBy([...newDataSource, ...dataSource], 'respUserId'));
    },
    [dataSource]
  );

  /**
   * @description: 移除评分人
   * @return {*}
   */
  const handleDelete = useCallback(() => {
    const newDataSource = dataSource.filter(i => {
      return !selectedRowKeys.includes(i.kpiIndRespId);
    });
    // 评分人信息行为空，说明全部移除。直接调用保存api。
    if (isEmpty(newDataSource)) {
      const kpiIndicators = isBatch
        ? indicationSelectedRows.map(
            ({ indicatorId: itemIndicatorId, indicatorCode: itemIndicatorCode }) => ({
              indicatorId: itemIndicatorId,
              indicatorCode: itemIndicatorCode,
            })
          )
        : [{ indicatorId, indicatorCode }];
      // 评分信息行全部删掉。直接保存
      savePermissionList({
        kpiIndicatorResps: [],
        kpiIndicators,
        customizeUnitCode: tableCode,
      }).then(res => {
        const result = getResponse(res);
        if (result) {
          notification.success({
            placement: 'bottomRight',
            message: intl.get('hzero.common.notification.success').d('操作成功'),
          });
        }
      });
      // 评分信息行没有数据后。修改权重必填校验
      setIsRespWeightRequired(false);
    }

    setDataSource(newDataSource);
    setSelectedRows([]);
    setSelectedRowKeys([]);
  }, [dataSource, selectedRowKeys, indicationSelectedRows, indicatorId, indicatorCode]);

  /**
   * @description: 点击确定进行保存
   * @return {*}
   */
  const handleSave = useCallback(() => {
    const kpiIndicatorResps = getEditTableData(dataSource, ['kpiIndRespId']);
    const respWeightFlag = sum(kpiIndicatorResps.map(i => i.respWeight)) === 100;
    const kpiIndicators = isBatch
      ? indicationSelectedRows.map(
          ({ indicatorId: itemIndicatorId, indicatorCode: itemIndicatorCode }) => ({
            indicatorId: itemIndicatorId,
            indicatorCode: itemIndicatorCode,
          })
        )
      : [{ indicatorId, indicatorCode }];
    // 权重 != 100  权重必填 = true
    if (isRespWeightRequired && !respWeightFlag) {
      notification.warning({
        placement: 'bottomRight',
        message: intl
          .get('sslm.supplierKpiIndicator.view.message.respWeightCheckedTip')
          .d('评分人信息有误，请维护评分人且评分权重之和为100'),
      });
    } else {
      // 调用保存api
      savePermissionList({ kpiIndicatorResps, kpiIndicators, customizeUnitCode: tableCode }).then(
        res => {
          const result = getResponse(res);
          if (result) {
            notification.success({
              placement: 'bottomRight',
              message: intl.get('hzero.common.notification.success').d('操作成功'),
            });
            onCancel();
          }
        }
      );
    }
  }, [dataSource, indicationSelectedRows, indicatorId, indicatorCode, isRespWeightRequired]);

  /**
   * @description: 表格行勾选事件
   * @return {*}
   */
  const handleSelectChange = useCallback((newSelectedRowKeys, newSelectedRows) => {
    setSelectedRows(newSelectedRows);
    setSelectedRowKeys(newSelectedRowKeys);
  }, []);

  // 非批量维护细项权限时，初始化查询对应指标的评分人信息
  useEffect(() => {
    if (!isBatch) {
      // 这里是查询评分人信息的查询api
      queryPermissionList({ indicatorId, customizeUnitCode: tableCode }).then(res => {
        const result = getResponse(res);
        if (result && isArray(result)) {
          setDataSource(result.map(i => ({ ...i, _status: 'update' })));
          let required = false;
          for (const idx of result) {
            if (!isNil(idx.respWeight) && idx.respWeight !== '') {
              required = true;
              break;
            }
          }
          setIsRespWeightRequired(required);
        }
      });
    }
    return () => {
      setDataSource([]);
    };
  }, [isBatch]);

  const drawerProps = {
    title: isBatch
      ? intl
          .get('spfm.supplierKpiIndicator.view.button.maintainRatersInBatches')
          .d('批量维护评分人')
      : intl.get('sslm.supplierKpiIndicator.view.title.indicationAssign').d('细项权限'),
    visible,
    mask: true,
    maskStyle: { backgroundColor: 'rgba(0,0,0,.85)' },
    placement: 'right',
    destroyOnClose: true,
    onClose: onCancel,
    width: 700,
    zIndex: 500,
  };

  const editTableProps = {
    pagination: false,
    bordered: true,
    resizable: true,
    columns,
    rowKey: 'kpiIndRespId',
    scroll: { x: sum(columns.map(item => (item.width ? item.width : 100))) },
    dataSource,
    rowSelection: { onChange: handleSelectChange, selectedRowKeys, selectedRows },
  };

  return (
    <Drawer {...drawerProps}>
      <div style={{ paddingTop: 16, paddingBottom: 16, textAlign: 'right' }}>
        <Button
          icon="delete"
          onClick={handleDelete}
          disabled={isEmpty(selectedRows)}
          style={{ marginRight: 8 }}
        >
          {intl.get('sslm.supplierKpiIndicator.view.button.deleteEvalParticipant').d('移除评分人')}
        </Button>
        <LovMultiple
          isButton
          type="primary"
          code="SSLM.KPI_CHOOSE_USER"
          icon="plus"
          changeSelectRows={lovRecords => handleAdd(lovRecords)}
          originTenantId={getCurrentOrganizationId()}
          queryParams={{ tenantId: getCurrentOrganizationId() }}
          lovOptions={{ valueField: 'userId', displayField: 'userName' }}
          buttonText={intl
            .get('sslm.supplierKpiIndicator.view.button.addEvalParticipant')
            .d('新增评分人')}
        />
      </div>
      {customizeTable ? (
        customizeTable({ code: tableCode }, <EditTable {...editTableProps} />)
      ) : (
        <EditTable {...editTableProps} />
      )}

      <div
        style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          borderTop: '1px solid #e8e8e8',
          padding: '10px 16px',
          textAlign: 'right',
          left: 0,
          background: '#fff',
          borderRadius: '0 0 4px 4px',
          zIndex: 1,
        }}
      >
        <Button onClick={onCancel} style={{ marginRight: 12 }}>
          {intl.get('hzero.common.button.cancel').d('取消')}
        </Button>
        <Button
          type="primary"
          // loading={processing.saveIndicatorsResponsibleListLoading}
          // disabled={processing.queryIndicatorsResponsibleListLoading}
          onClick={handleSave}
        >
          {intl.get('hzero.common.button.ok').d('确定')}
        </Button>
      </div>
    </Drawer>
  );
};

export default IndicationAssign;
