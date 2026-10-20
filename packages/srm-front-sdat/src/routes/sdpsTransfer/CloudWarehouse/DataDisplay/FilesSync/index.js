/**
 * 文件同步 tab 页
 */
import React, { useRef, useState, useEffect } from 'react';
import { Table, TextField, Icon } from 'choerodon-ui/pro';
import { notification } from 'hzero-ui';
import { getCurrentUser, getResponse } from 'utils/utils';
import intl from 'utils/intl';
import { queryIdpValue } from 'services/api';

import DropDownSelect from '@/components/DropDownSelect';
import SortSelector from '@/components/SortSelector';
import DropDownPicker from '@/components/DropDownPicker';
import { formatDuring, calculateSize } from '@/utils/utils';
import { getStatisticsData, getFileDataList } from '@/services/sdpsTransfer/dataDisplayService';

import DataCard from '../DataCard';

import './index.less';

const queryParam = {
  tenantNum: getCurrentUser().tenantNum || '',
  sort: 'sync_end_ts,asc',
}; // 查询条件

export default function FilesSync(props) {
  const { listDS, tenantRecord } = props;

  const [staticsData, setStatistics] = useState({});
  const [defaultDate, setDate] = useState([]);
  const [inputVal, setInput] = useState('');
  const [syncModeList, setSyncModeList] = useState([]);
  const [flagList, setFlagList] = useState([]);

  const selectRef = useRef(null);
  const selectModeRef = useRef(null);
  const selectTableRef = useRef(null);
  const pickerRef = useRef(null);

  useEffect(() => {
    handleClearParam();
    queryIdpValue('SDAT.DATE_SYNC_MODE').then((res) => {
      if (getResponse(res)) {
        setSyncModeList(res || []);
      }
    });
    queryIdpValue('HPFM.FLAG').then((res) => {
      if (getResponse(res)) {
        setFlagList(res || []);
      }
    });

    if (tenantRecord.tenantId) {
      fetchDetail(tenantRecord);
    }
  }, [tenantRecord]);

  // 查询
  const handleQuery = (num = '') => {
    const queryFun = () => {
      listDS.queryParameter = {
        ...queryParam,
        ruleCode: 'GET_FILE_DETAIL',
      };
      listDS.query();
    };

    if (num === 1) {
      queryFun();
    } else {
      getFileDataList({ ...queryParam, ruleCode: 'GET_FILE_DETAIL' }).then((res) => {
        if (res && res.failed) {
          if (res.code !== '无返回内容') {
            if (res.code === 'amkt.tenant.not.open.any.amkt.service') {
              notification.warning({
                message: intl.get('hzero.common.notification.error').d('操作失败'),
                description: res.message,
              });
            } else {
              notification.error({
                message: intl.get('hzero.common.notification.error').d('操作失败'),
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

  const queryStatistics = () => {
    if (queryParam.tenantNum) {
      getStatisticsData({
        ...queryParam,
        ruleCode: 'GET_LAST_FILE_DETAIL',
        sort: '',
      }).then((res) => {
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
                message: intl.get('hzero.common.notification.error').d('操作失败'),
                description: res.message,
              });
            }
          }
        } else {
          const statisticData = res?.content[0] ?? {};
          setStatistics(statisticData);

          const startDate =
            new Date(statisticData?.bgn_sync_ts ?? '')
              ?.toLocaleString()
              ?.replace(/:\d{1,2}$/, ' ')
              ?.replaceAll('/', '-')
              ?.substring(0, 10) ?? '';
          const endDate =
            new Date(statisticData?.end_sync_ts ?? '')
              ?.toLocaleString()
              ?.replace(/:\d{1,2}$/, ' ')
              ?.replaceAll('/', '-')
              ?.substring(0, 10) ?? '';

          queryParam.syncBgnTs = startDate;
          queryParam.syncEndTs = endDate;

          const defaultVal = startDate || endDate ? [startDate || null, endDate || null] : [];

          setDate(defaultVal);

          getFileDataList({ ...queryParam, ruleCode: 'GET_FILE_DETAIL' }).then((result) => {
            if (result && result.failed) {
              listDS.data = [];
              if (result?.code !== '无返回内容') {
                if (res?.code === 'amkt.tenant.not.open.any.amkt.service') {
                  notification.warning({
                    message: intl.get('hzero.common.notification.error').d('操作失败'),
                    description: res?.message,
                  });
                } else {
                  notification.error({
                    message: intl.get('hzero.common.notification.error').d('操作失败'),
                    description: res?.message,
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

  const handleClearParam = () => {
    queryParam.syncBgnTs = '';
    queryParam.syncEndTs = '';
    queryParam.status = '';
    queryParam.fileName = '';
    queryParam.syncMode = '';
    queryParam.tableIsChange = '';
    if (selectRef && selectRef.current) {
      if (selectRef.current.resetValue) {
        selectRef.current.resetValue();
      }
    }

    if (selectModeRef && selectModeRef.current) {
      if (selectModeRef.current.resetValue) {
        selectModeRef.current.resetValue();
      }
    }

    if (selectTableRef && selectTableRef.current) {
      if (selectTableRef.current.resetValue) {
        selectTableRef.current.resetValue();
      }
    }

    if (pickerRef && pickerRef.current) {
      if (pickerRef.current.resetValue) {
        pickerRef.current.resetValue();
      }
    }

    setDate([]);
    setInput('');
  };

  const fetchDetail = (record) => {
    queryParam.tenantNum = record?.tenantNum ?? '';
    if (queryParam.tenantNum) {
      queryStatistics();
    } else {
      setStatistics({});
      listDS.data = [];
    }
  };

  const handleEnterDown = () => {
    handleQuery('');
  };

  /**
   * 同步状态列表
   * @returns
   */
  const syncStatusList = () => {
    return [
      {
        value: 's',
        meaning: intl.get('hzero.common.status.success').d('成功'),
      },
      {
        value: 'f',
        meaning: intl.get('hzero.common.status.failure').d('失败'),
      },
    ];
  };

  /**
   * 输入查询条件
   */
  const handleInput = (e) => {
    queryParam.fileName = e?.target?.value?.trim() ?? '';
    setInput(e?.target?.value?.trim() ?? '');
  };

  /**
   * 清空查询条件
   */
  const handleClear = () => {
    queryParam.fileName = '';
    setInput('');
    handleQuery('');
  };

  // 切换同步状态查询条件
  const handleChangeStatus = (value) => {
    queryParam.status = value;
    handleQuery('');
  };

  /**
   * 切换同步模式
   * @param {*} value
   */
  const handleChangeMode = (value) => {
    queryParam.syncMode = value;
    handleQuery('');
  };

  /**
   * 切换是否改变表结构
   * @param {*} value
   */
  const handleChangeTableStructure = (value) => {
    queryParam.tableIsChange = value;
    handleQuery('');
  };

  const handleQuerySort = (sortFieldCode, sortType) => {
    queryParam.sort = `${sortFieldCode},${sortType?.toLowerCase() ?? ''}`;
    handleQuery('');
  };

  const handleChangeDate = (dateRange) => {
    queryParam.syncBgnTs = dateRange.length && dateRange[0] ? `${dateRange[0]}` : '';
    queryParam.syncEndTs = dateRange.length && dateRange[1] ? `${dateRange[1]}` : '';
    handleQuery('');
  };

  const fields = [
    {
      name: 'sync_end_ts',
      label: intl.get('sdps.cloudWarehouse.model.endTime').d('结束时间'),
    },
  ];

  const formatTime = () => {
    const start = staticsData.bgn_sync_ts || '';
    const end = staticsData.end_sync_ts || '';

    const seconds = new Date(end).getTime() - new Date(start).getTime();
    return end && start ? formatDuring(seconds) : 0;
  };

  const switchTag = {
    s: intl.get('hzero.common.status.success').d('成功'),
    f: intl.get('hzero.common.status.failure').d('失败'),
    e: intl.get('sdps.cloudWarehouse.status.executing').d('执行中'),
    c: intl.get('hzero.common.button.cance').d('取消'),
    p: intl.get('sdps.cloudWarehouse.status.pending').d('等待执行'),
  };

  const switchSyncType = {
    new: intl.get('sdps.cloudWarehouse.status.new').d('新增'),
    overwrite: intl.get('sdps.cloudWarehouse.status.overwrite').d('覆盖'),
    delete: intl.get('sdps.cloudWarehouse.status.delete').d('删除'),
  };

  const columns = () => {
    return [
      {
        name: 'status',
        width: 120,
        renderer: ({ text }) => {
          const logTag = switchTag[text];
          const classes =
            text === 's' || text === 'e' || text === 'p' ? 'tag-succeed' : 'tag-field';
          return logTag ? <span className={classes}>{logTag}</span> : null;
        },
      },
      {
        name: 'sync_date',
        width: 150,
        renderer: ({ record }) => {
          const syncBgnTs = record.get('sync_bgn_ts') || '';
          return syncBgnTs ? syncBgnTs.substring(0, 10) : '';
        },
      },
      { name: 'file_name', width: 200 },
      {
        name: 'file_size',
        width: 180,
        renderer: ({ record }) => {
          const sizeNum = record?.get('file_size') ?? 0;
          return calculateSize(sizeNum);
        },
      },
      { name: 'storage_path', width: 200 },
      {
        name: 'sync_type',
        width: 200,
        renderer: ({ text }) => {
          const logTag = switchSyncType[text];
          const classes = text === 'new' || text === 'overwrite' ? 'tag-succeed' : 'tag-field';
          return logTag ? <span className={classes}>{logTag}</span> : null;
        },
      },
      {
        name: 'sync_bgn_ts',
        width: 180,
      },
      {
        name: 'sync_end_ts',
        width: 180,
      },
      {
        name: 'duration_ms',
        renderer: ({ record }) => {
          return <span>{formatDuring(record.get('duration_ms') || 0)}</span>;
        },
      },
    ];
  };

  return (
    <>
      <div className="monitor-area">
        <DataCard
          key="card1"
          title={intl.get('sdps.cloudWarehouse.view.title.fileSyncCount').d('当前文件总数')}
          totalTitle={`${staticsData?.sync_need_count ?? 0} ${intl
            .get('sdps.cloudWarehouse.view.title.copies')
            .d('份')}`}
          item1={intl.get('sdps.cloudWarehouse.view.title.fileSum').d('文件总存储')}
          item1Count={
            staticsData.sync_sum_length > 0 ? calculateSize(staticsData.sync_sum_length) : '0 GB'
          }
          showIcon={false}
          endItem={intl.get('sdps.cloudWarehouse.view.title.updateTime').d('更新时间')}
          endVal={
            staticsData && staticsData.bgn_sync_ts ? staticsData.bgn_sync_ts.substring(0, 10) : ''
          }
        />

        <DataCard
          key="card2"
          title={intl.get('sdps.cloudWarehouse.view.title.').d('最近一次变化文件数')}
          totalTitle={`${staticsData?.total_file_count ?? 0} ${intl
            .get('sdps.cloudWarehouse.view.title.copies')
            .d('份')}`}
          showIcon={false}
          titleStyle="normal"
          item1={intl.get('hzero.common.button.increase').d('新增')}
          item1Count={`${staticsData?.sync_new_success_count ?? 0} ${intl
            .get('sdps.cloudWarehouse.view.title.copies')
            .d('份')}`}
          item2={intl.get('hzero.common.button.enter').d('删除')}
          item2Count={`${staticsData?.sync_delete_success_count ?? 0} ${intl
            .get('sdps.cloudWarehouse.view.title.copies')
            .d('份')}`}
          item3={intl.get('sdps.cloudWarehouse.view.title.cover').d('覆盖')}
          item3Count={`${staticsData?.sync_overwrite_success_count ?? 0} ${intl
            .get('sdps.cloudWarehouse.view.title.copies')
            .d('份')}`}
          endItem={intl.get('sdps.cloudWarehouse.view.title.updateTime').d('更新时间')}
          endVal={
            staticsData && staticsData.bgn_sync_ts ? staticsData.bgn_sync_ts.substring(0, 10) : ''
          }
        />

        <DataCard
          key="card3"
          title={intl.get('sdps.cloudWarehouse.view.title.lastSuccessRate').d('最近一次同步成功率')}
          totalTitle={`${
            staticsData.total_file_count > 0 && staticsData.sync_need_count > 0
              ? Number(
                  (staticsData.total_file_count / staticsData.sync_need_count).toFixed(2) * 100
                )
              : 0
          } %`}
          titleStyle="normal"
          showIcon={false}
          item1={intl.get('sdps.cloudWarehouse.view.title.successFiles').d('成功份数')}
          item1Count={`${staticsData?.total_file_count ?? 0} ${intl
            .get('sdps.cloudWarehouse.view.title.copies')
            .d('份')}`}
          item2={intl.get('sdps.cloudWarehouse.view.title.failedFiles').d('失败份数')}
          item2Count={`${staticsData.sync_fail_count || 0} ${intl
            .get('sdps.cloudWarehouse.view.title.copies')
            .d('份')}`}
          endItem={intl.get('sdps.cloudWarehouse.view.title.updateTime').d('更新时间')}
          endVal={
            staticsData && staticsData.bgn_sync_ts ? staticsData.bgn_sync_ts.substring(0, 10) : ''
          }
        />

        <DataCard
          key="card4"
          title={intl.get('sdps.cloudWarehouse.view.title.lastTakesTime').d('最近一次同步耗时')}
          totalTitle={formatTime()}
          startItem={intl.get('sdps.cloudWarehouse.view.title.startTime').d('开始时间')}
          startVal={staticsData?.bgn_sync_ts ?? ''}
          endItem={intl.get('sdps.cloudWarehouse.view.title.endTime').d('结束时间')}
          endVal={staticsData?.end_sync_ts ?? ''}
        />
      </div>

      <div style={{ padding: '8px' }}>
        <div className="page-content-title">
          {intl.get('sdps.cloudWarehouse.view.title.fileSyncDetail').d('文件同步明细')}
        </div>
        <div className="card-search-bar">
          <TextField
            placeholder={intl
              .get('sdps.cloudWarehouse.view.title.searchFileNamePlaceholder')
              .d('请输入文件名查询')}
            prefix={<Icon type="search" />}
            style={{ width: '280px' }}
            clearButton
            value={inputVal}
            onInput={handleInput}
            onClear={handleClear}
            onEnterDown={handleEnterDown}
          />

          <DropDownPicker
            ref={pickerRef}
            onlyKey="cloud-warehouse-file-sync"
            defaultValue={defaultDate}
            onChange={handleChangeDate}
            title={intl.get(`sdps.cloudWarehouse.model.syncDate`).d('同步日期')}
          />

          <DropDownSelect
            ref={selectRef}
            keyIndex="fileSyncStatus"
            allowClear
            label={intl.get(`sdps.cloudWarehouse.model.syncStatus`).d('同步状态')}
            optionList={syncStatusList()}
            onSelect={handleChangeStatus}
            style={{ marginLeft: '20px' }}
          />

          <DropDownSelect
            ref={selectModeRef}
            keyIndex="syncMode"
            allowClear
            label={intl.get(`sdps.cloudWarehouse.model.syncMode`).d('同步模式')}
            optionList={syncModeList}
            onSelect={handleChangeMode}
            style={{ marginLeft: '20px' }}
          />

          <DropDownSelect
            ref={selectTableRef}
            keyIndex="tableIsChange"
            allowClear
            label={intl.get(`sdps.cloudWarehouse.model.tableIsChange`).d('表结构是否变更')}
            optionList={flagList}
            onSelect={handleChangeTableStructure}
            style={{ marginLeft: '20px' }}
          />

          <div className="wide-area-content-sort">
            <SortSelector
              sortFieldCode="sync_end_ts"
              onSortQuery={handleQuerySort}
              fields={fields}
            />
          </div>
        </div>
        <div style={{ marginTop: '8px', height: `calc(100vh - 465px)`, paddingBottom: '10px' }}>
          <Table
            size="small"
            customizable
            customizedCode="SDAT.CLOUD_WAREHOUSE_PLATFORM_FILESYNC"
            dataSet={listDS}
            queryBar="none"
            columns={columns()}
            autoHeight={{ type: 'maxHeight', diff: 20 }}
          />
        </div>
      </div>
    </>
  );
}
