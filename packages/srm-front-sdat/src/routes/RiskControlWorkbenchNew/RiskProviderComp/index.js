import React, { useState } from 'react';
import intl from 'utils/intl';
import { Table, Tooltip } from 'choerodon-ui/pro';

const SortDownIcon =
  'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMTZweCIgaGVpZ2h0PSIxNnB4IiB2aWV3Qm94PSIwIDAgMTYgMTYiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8dGl0bGU+aWNvbi1hc2NlbmRpbmc8L3RpdGxlPgogICAgPGcgaWQ9Iue7hOS7tiIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPGcgaWQ9IlNlYXJjaC9Db21wb25lbnRzL1NvcnQiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC05Ny4wMDAwMDAsIC04LjAwMDAwMCkiPgogICAgICAgICAgICA8ZyBpZD0iaWNvbi1hc2NlbmRpbmciIHRyYW5zZm9ybT0idHJhbnNsYXRlKDk3LjAwMDAwMCwgOC4wMDAwMDApIj4KICAgICAgICAgICAgICAgIDxyZWN0IGlkPSLnn6nlvaIiIHg9IjAiIHk9IjAiIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PC9yZWN0PgogICAgICAgICAgICAgICAgPGcgaWQ9Iue8lue7hC0yMiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMS4yNTAwMDAsIDQuMDAwMDAwKSIgZmlsbC1ydWxlPSJub256ZXJvIj4KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNNyw2LjY2NjY2NjY3IEw3LDggTDAsOCBMMCw2LjY2NjY2NjY3IEw3LDYuNjY2NjY2NjcgWiBNNS42LDQgTDUuNiw1LjMzMzMzMzMzIEwwLDUuMzMzMzMzMzMgTDAsNCBMNS42LDQgWiBNNC4yLDEuMzMzMzMzMzMgTDQuMiwyLjY2NjY2NjY3IEwwLDIuNjY2NjY2NjcgTDAsMS4zMzMzMzMzMyBMNC4yLDEuMzMzMzMzMzMgWiIgaWQ9IuW9oueKtue7k+WQiCIgZmlsbC1vcGFjaXR5PSIwLjg1IiBmaWxsPSIjMDAwMDAwIj48L3BhdGg+CiAgICAgICAgICAgICAgICAgICAgPHBvbHlnb24gaWQ9IuW9oueKtue7k+WQiC1wYXRoIiBmaWxsPSIjMzZDMkNGIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMC4wMDAwMDAsIDQuMDAwMDAwKSBzY2FsZSgxLCAtMSkgdHJhbnNsYXRlKC0xMC4wMDAwMDAsIC00LjAwMDAwMCkgIiBwb2ludHM9IjEwIDAgMTMuNSA0IDEwLjcgNCAxMC43IDggOS4zIDggOS4zIDQgNi41IDQiPjwvcG9seWdvbj4KICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgPC9nPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+';
const SortUpIcon =
  'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMTZweCIgaGVpZ2h0PSIxNnB4IiB2aWV3Qm94PSIwIDAgMTYgMTYiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8dGl0bGU+aWNvbi1hc2NlbmRpbmc8L3RpdGxlPgogICAgPGcgaWQ9Iue7hOS7tiIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPGcgaWQ9IlNlYXJjaC9Db21wb25lbnRzL1NvcnQiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC05Ny4wMDAwMDAsIC04LjAwMDAwMCkiPgogICAgICAgICAgICA8ZyBpZD0iaWNvbi1hc2NlbmRpbmciIHRyYW5zZm9ybT0idHJhbnNsYXRlKDk3LjAwMDAwMCwgOC4wMDAwMDApIj4KICAgICAgICAgICAgICAgIDxyZWN0IGlkPSLnn6nlvaIiIHg9IjAiIHk9IjAiIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PC9yZWN0PgogICAgICAgICAgICAgICAgPGcgaWQ9Iue8lue7hC0yMiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMS4yNTAwMDAsIDQuMDAwMDAwKSIgZmlsbC1ydWxlPSJub256ZXJvIj4KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNNyw2LjY2NjY2NjY3IEw3LDggTDAsOCBMMCw2LjY2NjY2NjY3IEw3LDYuNjY2NjY2NjcgWiBNNS42LDQgTDUuNiw1LjMzMzMzMzMzIEwwLDUuMzMzMzMzMzMgTDAsNCBMNS42LDQgWiBNNC4yLDEuMzMzMzMzMzMgTDQuMiwyLjY2NjY2NjY3IEwwLDIuNjY2NjY2NjcgTDAsMS4zMzMzMzMzMyBMNC4yLDEuMzMzMzMzMzMgWiIgaWQ9IuW9oueKtue7k+WQiCIgZmlsbC1vcGFjaXR5PSIwLjg1IiBmaWxsPSIjMDAwMDAwIj48L3BhdGg+CiAgICAgICAgICAgICAgICAgICAgPHBvbHlnb24gaWQ9IuW9oueKtue7k+WQiC1wYXRoIiBmaWxsPSIjMzZDMkNGIiBwb2ludHM9IjEwIDAgMTMuNSA0IDEwLjcgNCAxMC43IDggOS4zIDggOS4zIDQgNi41IDQiPjwvcG9seWdvbj4KICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgPC9nPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+';

export default function RiskProviderComp(props) {
  const { dataSet } = props;

  const [sortFlag, setSortFlag] = useState('ASC');

  const handleToogleSortFlag = () => {
    const newSortFlag = sortFlag === 'ASC' ? 'DESC' : 'ASC';
    setSortFlag(newSortFlag);
  };

  const columns = () => {
    return [
      { name: 'supplierName' },
      { name: 'riskLevel' },
      { name: 'registrationTime' },
      { name: 'riskTimes' },
      { name: 'successfulTimes', width: 200 },
      { name: 'performance' },
    ];
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span
          style={{
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {intl.get('sdat.riskControl.view.title.riskLevelDistribution').d('⻛险级别分布')}
        </span>
        <span style={{ padding: '5px' }}>
          <Tooltip
            title={
              sortFlag === 'ASC'
                ? intl.get('srm.filterBar.view.tooltip.asc').d('升序')
                : intl.get('srm.filterBar.view.tooltip.desc').d('降序')
            }
          >
            <img
              alt="orderBy"
              src={sortFlag === 'DESC' ? SortDownIcon : SortUpIcon}
              onClick={handleToogleSortFlag}
              style={{ cursor: 'pointer', marginBottom: '3px' }}
            />
          </Tooltip>
        </span>
      </div>
      <div style={{ height: '198px' }}>
        <Table
          dataSet={dataSet}
          columns={columns()}
          queryBar="none"
          autoHeight={{ type: 'maxHeight', diff: 20 }}
        />
      </div>
      <div
        style={{
          height: '38px',
          lineHeight: '38px',
          textAlign: 'center',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          borderRadius: '2px',
        }}
      >
        以上数据仅展示⻛险供应商，若查询全部供应商请点击此处&nbsp;&nbsp;<a>查看全部供应商</a>
      </div>
    </>
  );
}
