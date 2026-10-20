import React, { useMemo, createContext } from 'react';
import { DataSet, Button } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';

import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';
import intl from 'utils/intl';
import { useLineModal } from '../utils';
import { ConfigDataSet } from '../Add/store/configDs';
import '../index.less';

export const Store = createContext({});

export default function List(props) {
  const { ListDs, history, handleEnableFlagChange } = props;
  const ConfigDs = useMemo(() => new DataSet(ConfigDataSet('detail')), []);

  const onDetailClick = (record, edit) => {
    const { strategyHeaderId, processFactory } = record.get(['strategyHeaderId', 'processFactory']);
    history.push({
      pathname: '/sinv/inventoryManageConfig/detail',
      search: `strategyHeaderId=${strategyHeaderId}&processFactory=${processFactory}&edit=${edit}`,
    });
  };

  /**
   * 状态颜色控制
   */
  const colorRender = (_value) => {
    const value = String(_value);
    if (['1'].includes(value)) {
      // 绿色: 启用
      return (
        <Tag style={{ border: 'none' }} color="green">
          <span>{intl.get('hzero.common.bomViewStatus.enable').d('启用')}</span>
        </Tag>
      );
    } else if (['0'].includes(value)) {
      //  灰色: 禁用
      return (
        <Tag style={{ border: 'none' }} color="red">
          <span>{intl.get('hzero.common.status.disabled').d('禁用')}</span>
        </Tag>
      );
    } else {
      return '-';
    }
  };

  const columns = [
    {
      name: 'enableFlag',
      width: 100,
      align: 'left',
      renderer: ({ value }) => colorRender(value),
    },
    {
      name: 'action',
      with: 100,
      renderer: useLineModal(ConfigDs, history, handleEnableFlagChange),
    },
    {
      name: 'strategyCode',
      width: 150,
      renderer: ({ value, record }) => {
        return (
          <Button color="primary" funcType="link" onClick={() => onDetailClick(record, '0')}>
            <span>{value}</span>
          </Button>
        );
      },
    },
    {
      name: 'strategyName',
      // width: 150,
      // lock: 'left',
    },
    {
      name: 'cuszDocTmplCodeObj',
      width: 150,
      // lock: 'left',
    },
    {
      name: 'processFactory',
      width: 170,
      align: 'left',
    },

    {
      name: 'codeRuleLov',
      width: 170,
    },
    {
      name: 'creationName',
      width: 120,
    },
  ];
  return (
    <div style={{ height: 'calc(100vh - 185px)' }}>
      <FilterBarTable
        dataSet={ListDs}
        cacheState
        columns={columns}
        style={{ maxHeight: `calc(100% - 20px)` }}
        border={false}
        customizable
        customizedCode="new-node-receiptManageConfig-workbench"
        filterBarConfig={{
          // autoQuery: false,
          expandable: true,
          checkDataSetStatus: false,
          fields: [
            {
              name: 'strategyCode',
              type: 'string',
              label: intl.get('sinv.inventoryBench.model.view.strategyCode').d('类型编码'),
              display: true,
              merge: true,
            },
            {
              name: 'processFactory',
              type: 'string',
              lookupCode: 'SPUC.SINV_STOCK_OUT_TYPE',
              label: intl.get(`sinv.inventoryBench.model.view.processFactory`).d('类型属性'),
              display: true,
            },
            {
              name: 'enableFlag',
              label: intl.get(`hzero.common.templateStatus`).d('状态'),
              lookupCode: 'SLOD.TACTICS_ENABLE_FLAG',
              display: true,
            },
          ],
        }}
      />
    </div>
  );
}
