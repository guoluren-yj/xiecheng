/* eslint-disable no-param-reassign */
/**
 * 扫描项管理
 */
import React, { useEffect } from 'react';
import intl from 'utils/intl';
import pull from 'lodash/pull';
import { Table } from 'choerodon-ui/pro'; // Button, Modal
import { Badge } from 'choerodon-ui';
import FilterBar from 'srm-front-boot/lib/components/FilterBarTable/FilterBar';

import styles from './index.less';

let expandKeys = [];

export default function ScanItemManage(props) {
  const { scanItemListDS } = props; // scanMenuDetailDS, scanDetailDS

  useEffect(() => {
    scanItemListDS.addEventListener('load', initData);

    return () => {
      scanItemListDS.removeEventListener('load', initData);
      expandKeys = [];
    };
  }, []);

  const initData = ({ dataSet }) => {
    if (expandKeys.length) {
      dataSet.forEach(record => {
        if (expandKeys.includes(record.get('riskItemId'))) {
          record.set('expand', true);
          record.status = 'sync';
        }
      });
    }
  };

  const classMap = {
    0: styles['status-disabled'],
    1: styles['status-enabled'],
  };

  const columns = () => {
    return [
      {
        name: 'enabledFlag',
        align: 'left',
        width: 120,
        renderer: ({ value }) => {
          const classes = classMap[value];
          return (
            <span className={classes}>
              {value === 0
                ? intl.get('sdat.riskItemConfig.status.hasEnabled').d('已禁用')
                : intl.get('sdat.riskItemConfig.status.hasAbled').d('已启用')}
            </span>
          );
        },
      },
      {
        name: 'itemCode',
        width: 200,
      },
      {
        name: 'itemName',
      },
      {
        name: 'sortNum',
        width: 100,
      },
      {
        name: 'type',
      },
      {
        name: 'endFlag',
        width: 100,
        renderer: ({ value, record }) => {
          const type = record?.get('type');
          return type === 'CATEGORY' ? (
            <span>
              <Badge dot style={{ background: value === 0 ? '#E64322' : '#179454' }} />
              &nbsp;
              {value === 0
                ? intl.get('hzero.common.model.no').d('否')
                : intl.get('hzero.common.model.yes').d('是')}
            </span>
          ) : (
            '-'
          );
        },
      },
    ];
  };

  const onExpand = (expanded, record) => {
    const riskItemId = record.get('riskItemId');

    if (expanded) {
      const list = [...expandKeys];
      expandKeys = [...list, riskItemId];
    } else {
      expandKeys = pull(expandKeys, riskItemId);
    }
  };

  return (
    <>
      <div
        style={{
          height: 'calc(100vh - 148px)',
          overflow: 'hidden',
          background: '#fff',
        }}
      >
        <FilterBar
          dataSet={[scanItemListDS]}
          cacheState
          cacheKey="SDAT.SCAN_RISK_SCAN_ITEM_SEARCH_BAR"
          checkDataSetStatus={false}
          fields={[
            {
              name: 'itemName',
              type: 'string',
              label: intl.get(`sdat.riskItemConfig.model.nameOrCode`).d('名称、编码'),
              merge: true,
              display: false,
            },
            {
              label: intl.get(`sdat.riskItemConfig.model.status`).d('状态'),
              name: 'enabledFlag',
              type: 'string',
              lock: true,
            },
          ]}
        />
        <div style={{ height: 'calc(100vh - 300px)' }}>
          <Table
            dataSet={scanItemListDS}
            columns={columns()}
            queryBar="none"
            mode="tree"
            onExpand={onExpand}
            customizable
            customizedCode="SDAT.RISK_SCAN_ITEM_LIST"
            autoHeight={{ type: 'maxHeight', diff: 40 }}
          />
        </div>
      </div>
    </>
  );
}
