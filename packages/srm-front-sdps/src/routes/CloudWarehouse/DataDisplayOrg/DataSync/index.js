/**
 * 数据同步tab页 租户级
 * @author qingxiang.luo@going-link.com
 * @date 2022-10-18
 */

import React, { useState, useEffect } from 'react';
import intl from 'utils/intl';
import moment from 'moment';
import { getCurrentUser, getResponse } from 'utils/utils';
import { notification } from 'hzero-ui';
import { Table, TextField, Icon } from 'choerodon-ui/pro';
import { queryIdpValue } from 'services/api';

import DropDownSelect from '@/components/DropDownSelect';
import SortSelector from '@/components/SortSelector';
import DropDownPicker from '@/components/DropDownPicker';
import { getTaskStatistics, getDataList } from '@/services/dataDisplayOrgService';
import { formatDuring, calculateSize } from '@/utils/utils';

import DataCard from '../DataCard';

import styles from './index.less';

let queryParam = {
  tenantNum: getCurrentUser().tenantNum || '',
  sort: 'end_sync_ts,asc',
}; // 查询条件

const DataSync = props => {
  const { listDS } = props;
  const [staticsData, setStatistics] = useState({});
  const [defaultDate, setDate] = useState([]);
  const [syncModeList, setSyncModeList] = useState([]);
  const [flagList, setFlagList] = useState([]);

  useEffect(() => {
    queryStatistics();
    queryIdpValue('SDPS.DATE_SYNC_MODE').then(res => {
      if (getResponse(res)) {
        setSyncModeList(res || []);
      }
    });

    queryIdpValue('HPFM.FLAG').then(res => {
      if (getResponse(res)) {
        setFlagList(res || []);
      }
    });

    return () => {
      queryParam = {
        tenantNum: getCurrentUser().tenantNum || '',
        sort: 'end_sync_ts,asc',
      };
    };
  }, []);

  const queryStatistics = () => {
    if (queryParam.tenantNum) {
      getTaskStatistics({
        tenantNum: queryParam.tenantNum,
      }).then(res => {
        if (res && res.failed) {
          setStatistics({});
          if (res.code !== '无返回内容') {
            if (res.code === 'amkt.tenant.not.open.any.amkt.service') {
              notification.warning({
                message: intl.get('hzero.common.notification.error').d('操作失败'),
                description: res.message,
              });
            } else {
              notification.error({
                message: intl.get('hzero.common.status.mistake').d('错误'),
                description: res.message,
              });
            }
          }
        } else {
          setStatistics(res);
          const startDate = res?.bgnSyncTs ?? '';
          const endDate = res?.endSyncTs ?? '';

          queryParam.bgnSyncTs = startDate;
          queryParam.endSyncTs = endDate;

          const defaultVal =
            startDate && endDate
              ? [
                  startDate ? moment(startDate).format('YYYY-MM-DD') : '',
                  endDate ? moment(endDate).format('YYYY-MM-DD') : '',
                ].sort()
              : [];
          setDate(defaultVal);

          getDataList({ ...queryParam }).then(result => {
            if (result && result?.failed) {
              listDS.data = [];
              if (result?.code !== '无返回内容') {
                if (result?.code === 'amkt.tenant.not.open.any.amkt.service') {
                  notification.warning({
                    message: intl.get('hzero.common.notification.error').d('操作失败'),
                    description: result?.message,
                  });
                } else {
                  notification.error({
                    message: intl.get('hzero.common.status.mistake').d('错误'),
                    description: result?.message,
                  });
                }
              }
            } else if (result && result?.content) {
              handleQuery(1);
            }
          });
        }
      });
    }
  };

  // 查询
  const handleQuery = num => {
    const queryFun = () => {
      listDS.queryParameter = {
        ...queryParam,
        bgnSyncTs: queryParam?.bgnSyncTs ? moment(queryParam.bgnSyncTs).format('YYYY-MM-DD') : '',
        endSyncTs: queryParam?.endSyncTs ? moment(queryParam.endSyncTs).format('YYYY-MM-DD') : '',
      };
      listDS.query();
    };

    if (num === 1) {
      queryFun();
    } else {
      getDataList({ ...queryParam }).then(res => {
        if (res && res.failed) {
          if (res.code !== '无返回内容') {
            if (res.code === 'amkt.tenant.not.open.any.amkt.service') {
              notification.warning({
                message: intl.get('hzero.common.notification.error').d('操作失败'),
                description: res.message,
              });
            } else {
              notification.error({
                message: intl.get('hzero.common.status.mistake').d('错误'),
                description: res.message,
              });
            }
          }
          listDS.data = [];
        } else if (res && res.content) {
          queryFun();
        }
      });
    }
  };

  // const switchTag = {
  //   s: intl.get('sdps.cloudWarehouse.status.success').d('成功'),
  //   f: intl.get('sdps.cloudWarehouse.status.failure').d('失败'),
  //   e: intl.get('sdps.cloudWarehouse.status.executing').d('执行中'),
  //   c: intl.get('sdps.cloudWarehouse.status.cancel').d('取消'),
  //   p: intl.get('sdps.cloudWarehouse.status.pending').d('等待执行'),
  // };

  const switchSchemaTag = value => {
    switch (value) {
      case 'true':
        return intl.get('sdps.common.model.yes').d('是');
      case 'false':
        return intl.get('sdps.common.model.no').d('否');

      default:
        return '-';
    }
  };

  const columns = () => {
    return [
      {
        name: 'status',
        width: 80,
        renderer: ({ value, text }) => {
          // const logTag = switchTag[text];
          const classes = ['s', 'e', 'p'].includes(value) ? 'tag-succeed' : 'tag-field';
          return <span className={classes}>{text}</span>;
        },
      },
      {
        name: 'syncMode',
        renderer: ({ record }) => {
          return !record.get('syncMode')
            ? ''
            : record.get('syncMode') === 'INCR'
            ? intl.get('sdps.dataSheet.view.option.increment').d('增量')
            : intl.get('sdps.dataSheet.view.option.all').d('全量');
        },
      },
      {
        name: 'syncDate',
        // renderer: ({ record }) => {
        //   const str = record.get('endSyncTs') || '';
        //   return <span>{str ? str.substring(0, 10) : ''}</span>;
        // },
      },
      { name: 'sourceTable', width: 200 },
      { name: 'bgnSyncTs', width: 180 },
      { name: 'endSyncTs', width: 180 },
      {
        name: 'durationMs',
        width: 150,
        renderer: ({ record }) => {
          return <span>{formatDuring(record.get('durationMs') || 0)}</span>;
        },
      },
      { name: 'readRows' },
      { name: 'writeRows' },
      {
        name: 'writeAmount',
        width: 120,
        align: 'right',
        renderer: ({ record }) => {
          return <span>{record.get('writeDataSize') || '-'}</span>;
        },
        // renderer: ({ record }) => {
        //   const size =
        //     record.get('syncMode') === 'ALL'
        //       ? Math.abs(record.get('afterDataLength'))
        //       : Math.abs(record.get('afterDataLength') - record.get('beforeDataLength'));
        //   return (
        //     <span>
        //       <span>
        //         {record.get('afterDataLength') - record.get('beforeDataLength') < 0 &&
        //         record.get('syncMode') !== 'ALL'
        //           ? '-'
        //           : ''}
        //       </span>
        //       {calculateSize(size)}
        //     </span>
        //   );
        // },
      },
      {
        name: 'updateSchema',
        renderer: ({ record }) => {
          const tagVal = switchSchemaTag(record.get('updateSchema'));
          return (
            <span
              style={{
                color:
                  record.get('updateSchema') === 'true'
                    ? 'red'
                    : record.get('updateSchema') === 'false'
                    ? '000'
                    : '',
              }}
            >
              {tagVal}
            </span>
          );
        },
      },
    ];
  };

  /**
   * 同步状态列表
   * @returns
   */
  const syncStatusList = () => {
    return [
      {
        value: 's',
        meaning: intl.get('sdps.cloudWarehouse.status.success').d('成功'),
      },
      {
        value: 'f',
        meaning: intl.get('sdps.cloudWarehouse.status.failure').d('失败'),
      },
      {
        value: 'e',
        meaning: intl.get('sdps.cloudWarehouse.status.executing').d('执行中'),
      },
      {
        value: 'c',
        meaning: intl.get('sdps.cloudWarehouse.status.cancel').d('取消'),
      },
      {
        value: 'p',
        meaning: intl.get('sdps.cloudWarehouse.status.pending').d('等待执行'),
      },
    ];
  };

  /**
   * 输入查询条件
   */
  const handleInput = e => {
    queryParam.sourceTable = e?.target?.value?.trim() ?? '';
  };

  /**
   * 清空查询条件
   */
  const handleClear = () => {
    queryParam.sourceTable = '';
    handleQuery('');
  };

  // 切换同步状态查询条件
  const handleChangeStatus = value => {
    queryParam.status = value;
    handleQuery('');
  };

  /**
   * 切换同步模式
   * @param {*} value
   */
  const handleChangeMode = value => {
    queryParam.syncMode = value;
    handleQuery('');
  };

  /**
   * 切换是否改变表结构
   * @param {*} value
   */
  const handleChangeTableStructure = value => {
    queryParam.updateSchema = value;
    handleQuery('');
  };

  const handleQuerySort = (sortFieldCode, sortType) => {
    queryParam.sort = `${sortFieldCode},${sortType?.toLowerCase() ?? ''}`;
    handleQuery('');
  };

  const handleChangeDate = dateRange => {
    queryParam.bgnSyncTs = dateRange && dateRange.length && dateRange[0] ? `${dateRange[0]}` : '';
    queryParam.endSyncTs =
      dateRange && dateRange.length === 2 && dateRange[1] ? `${dateRange[1]}` : '';
    handleQuery('');
  };

  const handleEnterDown = () => {
    handleQuery('');
  };

  const fields = [
    {
      name: 'end_sync_ts',
      label: intl.get('sdps.cloudWarehouse.model.endTime').d('结束时间'),
    },
    {
      name: 'duration_ms',
      label: intl.get(`sdps.cloudWarehouse.model.syncTakesTime`).d('同步耗时'),
    },
  ];

  const formatTime = () => {
    const start = staticsData?.bgnSyncTs || null;
    const end = staticsData?.endSyncTs || null;
    const seconds = new Date(end).getTime() - new Date(start).getTime();
    return formatDuring(seconds);
  };

  return (
    <div className="data-display-page">
      <div style={{ padding: '8px' }}>
        <div className="monitor-area">
          <DataCard
            key="card1"
            title={intl.get('sdps.cloudWarehouse.view.title.tableCount').d('数据表总数')}
            totalTitle={`${staticsData?.confEnableCount ?? 0}`}
            item1={intl.get('sdps.cloudWarehouse.view.title.succeed').d('成功')}
            item1Count={`${staticsData?.syncSuccessTables ?? 0}`}
            item2={intl.get('sdps.cloudWarehouse.view.title.successRate').d('成功率')}
            item2Count={`${
              staticsData?.confEnableCount > 0
                ? ((staticsData?.syncSuccessTables / staticsData?.confEnableCount) * 100).toFixed(2)
                : 0
            }%`}
            showIcon={false}
            endItem={intl.get('sdps.cloudWarehouse.view.title.updateTime').d('更新时间')}
            endVal={staticsData?.statDate ?? ''}
          />

          <DataCard
            key="card2"
            title={intl.get('sdps.cloudWarehouse.view.title.tableRowCount').d('数据总行数')}
            totalTitle={`${staticsData?.syncSuccessRows ?? 0}`}
            item1={intl.get('sdps.cloudWarehouse.view.title.chainRatio').d('环比')}
            item1Count={
              staticsData?.prevSyncRows > 0
                ? Number(
                    (
                      (staticsData?.syncSuccessRows - staticsData?.prevSyncRows) /
                      staticsData?.prevSyncRows
                    ).toFixed(5)
                  )
                : '-'
            }
            endItem={intl.get('sdps.cloudWarehouse.view.title.updateTime').d('更新时间')}
            endVal={staticsData?.statDate ?? ''}
          />

          <DataCard
            key="card3"
            title={intl.get('sdps.cloudWarehouse.view.title.dataSpace').d('数据总存储')}
            totalTitle={
              staticsData?.dataSumLength > 0 ? calculateSize(staticsData?.dataSumLength) : '0 GB'
            }
            item1={intl.get('sdps.cloudWarehouse.view.title.chainRatio').d('环比')}
            item1Count={
              staticsData?.dataSumLength > 0 && staticsData?.prevDataSumLength > 0
                ? Number(
                    (
                      (staticsData?.dataSumLength - staticsData?.prevDataSumLength) /
                      staticsData?.prevDataSumLength
                    ).toFixed(5)
                  )
                : '-'
            }
            endItem={intl.get('sdps.cloudWarehouse.view.title.updateTime').d('更新时间')}
            endVal={staticsData?.statDate ?? ''}
          />

          <DataCard
            key="card4"
            title={intl.get('sdps.cloudWarehouse.view.title.lastTakesTime').d('最近一次同步耗时')}
            totalTitle={formatTime()}
            startItem={intl.get('sdps.cloudWarehouse.view.title.startTime').d('开始时间')}
            startVal={staticsData?.bgnSyncTs ?? ''}
            endItem={intl.get('sdps.cloudWarehouse.view.title.endTime').d('结束时间')}
            endVal={staticsData?.endSyncTs ?? ''}
          />
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <div className="page-content-title">
          {intl.get('sdps.cloudWarehouse.view.title.syncDetail').d('数据同步明细')}
        </div>
        <div className="card-search-bar">
          <TextField
            clearButton
            placeholder={intl
              .get('sdps.cloudWarehouse.view.title.searchPlaceholder')
              .d('请输入数据表查询')}
            prefix={<Icon type="search" />}
            style={{ width: '280px' }}
            onInput={handleInput}
            onClear={handleClear}
            onEnterDown={handleEnterDown}
          />

          <DropDownPicker
            defaultValue={defaultDate}
            onlyKey="cloud-warehouse-org-data-sync"
            onChange={handleChangeDate}
            title={intl.get(`sdps.cloudWarehouse.model.syncDate`).d('同步日期')}
          />

          <DropDownSelect
            keyIndex="syncStatus"
            allowClear
            label={intl.get(`sdps.cloudWarehouse.model.syncStatus`).d('同步状态')}
            optionList={syncStatusList()}
            onSelect={handleChangeStatus}
            style={{ marginLeft: '20px' }}
          />

          <DropDownSelect
            keyIndex="syncMode"
            allowClear
            label={intl.get(`sdps.cloudWarehouse.model.syncMode`).d('同步模式')}
            optionList={syncModeList}
            onSelect={handleChangeMode}
            style={{ marginLeft: '20px' }}
          />

          <DropDownSelect
            keyIndex="updateSchema"
            allowClear
            label={intl.get(`sdps.cloudWarehouse.model.tableIsChange`).d('表结构是否变更')}
            optionList={flagList}
            onSelect={handleChangeTableStructure}
            style={{ marginLeft: '20px' }}
          />

          <div
            className={styles['wide-area-content-sort']}
            style={{ display: 'inline-block', float: 'right', marginTop: '10px' }}
          >
            <SortSelector
              sortFieldCode="end_sync_ts"
              onSortQuery={handleQuerySort}
              fields={fields}
            />
          </div>
        </div>
        <div style={{ marginTop: '8px', height: `calc(100vh - 485px)`, paddingBottom: '20px' }}>
          <Table
            size="small"
            customizable
            customizedCode="SDPS.CLOUD_WARE_HOUSE_ORG"
            dataSet={listDS}
            queryBar="none"
            columns={columns()}
            autoHeight={{ type: 'maxHeight', diff: 20 }}
          />
        </div>
      </div>
    </div>
  );
};

export default DataSync;
