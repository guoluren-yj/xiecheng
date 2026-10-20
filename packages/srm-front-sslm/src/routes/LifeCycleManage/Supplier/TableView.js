/*
 * @Date: 2022-12-14 11:08:04
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useMemo, useCallback, useContext } from 'react';
import { Table, Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';

// 复用工作台的适用策略
import ApplyStrategy from '@/routes/Workbench/PlatformSupplier/ApplyStrategy';
import { handleSupplierDetail } from '@/routes/components/utils/utils';
import { Context } from '../Context';

// 生命周期阶段升降级icon
const upgradeIcon = require('@/assets/upgrade.svg');
const degradeIcon = require('@/assets/degrade.svg');

const TableView = () => {
  const { stageList, customizeTable, renderOperateLink, supplierTableDs: dataSet } = useContext(
    Context
  );

  // 查看适用策略
  const handleApplyStrategy = useCallback(record => {
    const { strategyName, versionNumber } = record.get(['strategyName', 'versionNumber']);
    const curVersion = intl
      .get('sslm.common.view.version', {
        name: versionNumber,
      })
      .d(`版本${versionNumber}`);
    Modal.open({
      drawer: true,
      okCancel: false,
      style: { width: 1200 },
      key: 'lifeCycleHistory',
      bodyStyle: { background: '#F7F8FA', padding: 0 },
      okText: intl.get('hzero.common.button.close').d('关闭'),
      title: strategyName
        ? intl
            .get('sslm.common.model.title.applyStrategy', {
              strategyName,
              versionNumber: curVersion,
            })
            .d(`适用策略-${strategyName}-${curVersion}`)
        : intl.get('sslm.workbench.model.platformSupplier.applyStrategy').d('适用策略'),
      children: <ApplyStrategy record={record} />,
    });
  }, []);

  const columns = useMemo(
    () => [
      {
        name: 'supplierCompanyName',
        renderer: ({ value, record }) => (
          <a onClick={() => handleSupplierDetail(record.data)}>{value}</a>
        ),
      },
      {
        name: 'operation',
        width: 250,
        renderer: ({ record }) => renderOperateLink(record.data),
      },
      {
        name: 'dimensionCode',
        width: 120,
      },
      {
        name: 'companyName',
        renderer: ({ value, record }) => (record.get('dimensionCode') === 'GROUP' ? '-' : value),
      },
      {
        name: 'stageDescription',
        width: 130,
        renderer: ({ record, value }) => {
          const { gradeType, stageDescription, toStageDescription } = record.get([
            'gradeType',
            'stageDescription',
            'toStageDescription',
          ]);
          return gradeType && gradeType !== 'NO' ? (
            <span>
              {stageDescription}
              <img
                alt=""
                style={{ margin: '0 2px' }}
                src={gradeType === 'UPGRADE' ? upgradeIcon : degradeIcon}
              />
              {toStageDescription}
            </span>
          ) : (
            value
          );
        },
      },
      {
        name: 'applyStrategy',
        width: 120,
        renderer: ({ record }) => {
          const strategyId = record.get('strategyId');
          return strategyId ? (
            <a onClick={() => handleApplyStrategy(record)}>
              {intl.get('hzero.common.button.view').d('查看')}
            </a>
          ) : (
            '-'
          );
        },
      },
    ],
    [stageList]
  );
  return (
    <div style={{ height: 'calc(100vh - 330px)' }}>
      {customizeTable(
        {
          code: 'SSLM.LIFE_CYCLE.SUPPLIER_LIST.TABLE_LIST',
        },
        <Table
          queryBar="none"
          dataSet={dataSet}
          columns={columns}
          style={{
            maxHeight: 'calc(100% - 50px)',
          }}
        />
      )}
    </div>
  );
};

export default TableView;
