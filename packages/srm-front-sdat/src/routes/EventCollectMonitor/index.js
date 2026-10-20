/* eslint-disable eqeqeq */
/**
 * 事件采集监控
 */
import React, { useMemo, useRef } from 'react';
import intl from 'utils/intl';
import withProps from 'utils/withProps';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import { DataSet, Table, Modal, Button, CodeArea } from 'choerodon-ui/pro';
import { getResponse } from 'utils/utils';
import moment from 'moment';
import { Button as PermissionButton } from 'components/Permission';

// 引入格式化器
import JSONFormatter from 'choerodon-ui/pro/lib/code-area/formatters/JSONFormatter';
// 引入 json lint
import 'choerodon-ui/pro/lib/code-area/lint/json';
// 处理 codemirror 的SSR问题， 如无需SSR，请用import代替require;
import 'codemirror/mode/javascript/javascript';

import StaticSearchBar from '@/components/StaticSearchBar';

import { ListDS, ExecuDetailDS, fetchReRun, fetchParamDetail } from './stores/eventCollectDS';
import { getQueryConfig } from './queryConfig';

import styles from './index.less';

const options = { mode: { name: 'javascript', json: true } };

const EventCollectMonitor = (props) => {
  const { listDS } = props;

  const execuDetailDS = useMemo(() => new DataSet({ ...ExecuDetailDS() }), []);
  const codeDS = useMemo(
    () =>
      new DataSet({
        autoCreate: true,
        fields: [
          {
            name: 'content',
            type: 'string',
            readOnly: true,
          },
        ],
      })
  );

  let allSearchBarRef = useRef(null);

  /**
   * 查看返回参数
   */
  const handleViewReturnMsg = async (record) => {
    if (!record) return false;

    const obj = record?.toData() ?? {};

    const res = await fetchParamDetail({ ...obj });

    if (getResponse(res)) {
      let showText = '';
      try {
        showText = JSON.stringify(res);
      } catch {
        showText = '';
      }

      codeDS.data = [
        {
          content: showText,
        },
      ];

      Modal.open({
        title: intl.get('sdat.eventCollectMonitor.view.title.returnMsg').d('返回参数'),
        closable: true,
        drawer: true,
        style: { width: '742px' },
        children: (
          <CodeArea
            dataSet={codeDS}
            name="content"
            disabled
            style={{ height: 500 }}
            formatter={JSONFormatter}
            options={options}
          />
        ),
        footer: (okBtn) => okBtn,
        okText: intl.get(`hzero.common.btn.close`).d('关闭'),
      });
    }
  };

  /**
   * 查看失败原因
   */
  const handleViewFieldCommon = (record) => {
    const msg = record && record.get ? record.get('detailInfo') : '';
    Modal.open({
      title: intl.get('sdat.eventCollectMonitor.view.title.fieldCommon').d('失败原因'),
      closable: true,
      drawer: true,
      children: (
        <div>
          <p>{msg}</p>
        </div>
      ),
      footer: (okBtn) => okBtn,
      okText: intl.get(`hzero.common.btn.close`).d('关闭'),
    });
  };

  /**
   * 查看执行明细
   */
  const handleViewDetail = (rcd) => {
    let modal = null;

    const monitorId = rcd?.get('monitorId') ?? '';
    const executeType = rcd?.get('executeType') ?? '';

    execuDetailDS.setQueryParameter('monitorId', monitorId);
    execuDetailDS.setQueryParameter('executeType', executeType);
    execuDetailDS.query();

    const handleClose = () => {
      if (modal) {
        modal.close();
        execuDetailDS.data = [];
        execuDetailDS.reset();
      }
    };

    const modalColumns = () => {
      return [
        {
          name: 'executeStatus',
          width: 100,
          renderer: ({ value }) => {
            return value && value == '0' ? (
              <span
                style={{
                  background: 'rgba(242, 85, 53, 0.15)',
                  color: '#E64322',
                  padding: '2px 5px',
                  borderRadius: '2px',
                }}
              >
                {intl.get('hzero.common.button.fail').d('失败')}
              </span>
            ) : (
              <span
                style={{
                  background: 'rgba(71, 184, 131, 0.15)',
                  color: '#179454',
                  padding: '2px 5px',
                  borderRadius: '2px',
                }}
              >
                {intl.get('hzero.common.status.success').d('成功')}
              </span>
            );
          },
        },
        { name: 'eventDimension' },
        // { name: 'method' },
        { name: 'executeDate', width: 180 },
        {
          name: 'execuDetail',
          width: 120,
          header: intl.get('sdat.eventCollectMonitor.view.title.operation').d('操作'),
          renderer: ({ record }) => {
            const executeStatus = record?.get('executeStatus') ?? '0';
            return executeStatus === '0' ? (
              <a onClick={() => handleViewFieldCommon(record)}>
                {intl.get('sdat.eventCollectMonitor.view.title.viewFailedMsg').d('查看失败原因')}
              </a>
            ) : (
              <a onClick={() => handleViewReturnMsg(record)}>
                {intl.get('sdat.eventCollectMonitor.view.title.viewReturnMsg').d('查看返回参数')}
              </a>
            );
          },
        },
      ];
    };

    modal = Modal.open({
      title: intl.get(`sdat.eventCollectMonitor.view.title.execuDetail`).d('执行明细'),
      children: (
        <>
          <Table
            dataSet={execuDetailDS}
            columns={modalColumns()}
            queryFieldsLimit={2}
            queryBar="none"
            pagination={{ pageSizeOptions: ['10'] }}
          />
        </>
      ),
      drawer: true,
      closable: true,
      destroyOnClose: true,
      style: { width: '742px' },
      footer: (
        <Button color="primary" onClick={handleClose}>
          {intl.get(`hzero.common.btn.close`).d('关闭')}
        </Button>
      ),
    });
  };

  /**
   * 重新执行
   * @param {*} record
   */
  const handleReExecution = (record) => {
    const obj = record?.toData() ?? {};
    fetchReRun({ ...obj }).then((res) => {
      if (getResponse(res)) {
        listDS.query();
      }
    });
  };

  const getFilters = () => {
    return { ...getQueryConfig() };
  };

  const handleClear = () => {
    if (allSearchBarRef && allSearchBarRef.setField) {
      allSearchBarRef.setField('companyName', '');
      allSearchBarRef.setField('scope', '');
    }
  };

  const handleFilterQueryAll = ({ params }) => {
    listDS.queryDataSet.data = [
      {
        ...params,
        // sort: params.customizeOrderField,
      },
    ];
    listDS.query();
  };

  const columns = () => {
    return [
      {
        name: 'executeStatus',
        renderer: ({ value }) => {
          return value && value == '0' ? (
            <span
              style={{
                background: 'rgba(242, 85, 53, 0.15)',
                color: '#E64322',
                padding: '2px 5px',
                borderRadius: '2px',
              }}
            >
              {intl.get('hzero.common.button.fail').d('失败')}
            </span>
          ) : (
            <span
              style={{
                background: 'rgba(71, 184, 131, 0.15)',
                color: '#179454',
                padding: '2px 5px',
                borderRadius: '2px',
              }}
            >
              {intl.get('hzero.common.status.success').d('成功')}
            </span>
          );
        },
      },
      {
        name: 'operation',
        header: intl.get('sdat.eventCollectMonitor.view.title.operation').d('操作'),
        renderer: ({ record }) => {
          const { executeType, executeStatus, operateStatus, endDate } =
            record?.get([
              'executeType',
              'executeStatus',
              'strikeType',
              'operateStatus',
              'endDate',
            ]) ?? {};

          // 事务类型为初始化、事件采集、舆情采集，且执行状态为失败的任务: 显示【重新执行按钮】
          const showReExecBtn = executeType === 'GENERATE' && executeStatus == '0';

          // 重新执行按钮只针对日期是今天、且事务类型为初始化、事件采集的行
          const dateObj = moment(endDate);
          const dateYear = dateObj.year();
          const dateMonth = dateObj.month();
          const dateDay = dateObj.date();
          const todayObj = moment();
          const todayYear = todayObj.year();
          const todayMonth = todayObj.month();
          const todayDay = todayObj.date();
          const disableReExec =
            executeType === 'GENERATE' &&
            !(dateYear === todayYear && dateMonth === todayMonth && dateDay === todayDay);

          return showReExecBtn ? (
            <PermissionButton
              type="text"
              disabled={operateStatus || disableReExec}
              onClick={() => handleReExecution(record)}
            >
              {intl.get('sdat.eventCollectMonitor.view.title.reExecution').d('重新执行')}
            </PermissionButton>
          ) : null;
        },
      },
      {
        name: 'executeNumber',
        width: 260,
        renderer: ({ text, record }) => {
          return <a onClick={() => handleViewDetail(record)}>{text}</a>;
        },
      },
      { name: 'riskType' },
      { name: 'executeType' },
      { name: 'tenantName', width: 180 },
      { name: 'enterpriseName', width: 180 },
      { name: 'monitorDate' },
      { name: 'startDate', width: 150 },
      { name: 'endDate', width: 150 },
      { name: 'strikeType' },
      { name: 'parentNumber' },
    ];
  };

  return (
    <>
      <Header
        title={intl.get('sdat.eventCollectMonitor.view.title.eventCollMonitor').d('事件采集监控')}
      />
      <Content>
        <div className={styles['event-collect-basic-panel']}>
          <StaticSearchBar
            cacheState
            clearButton
            onRef={(ref) => {
              allSearchBarRef = ref;
            }}
            searchCode="SDAT.EVENT_COLLECT_MONITOR_SEARCH_BAR"
            filters={getFilters()}
            dataSet={[listDS]}
            onQuery={handleFilterQueryAll}
            onClear={handleClear}
            onReset={handleClear}
            showLoading={false}
            fieldProps={{}}
          />
        </div>
        <Table
          dataSet={listDS}
          columns={columns()}
          queryBar="none"
          customizable
          customizedCode="SDAT.EVENT_COLLECTION_MONITOR_LIST"
        />
      </Content>
    </>
  );
};

export default formatterCollections({
  code: ['sdat.eventCollectMonitor'],
})(
  withProps(
    () => {
      const listDS = new DataSet({ ...ListDS() });

      return { listDS };
    },
    { cacheState: true, keepOriginDataSet: true }
  )(EventCollectMonitor)
);
