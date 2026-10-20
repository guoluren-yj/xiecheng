import React, { useCallback } from 'react';
import { Table, Modal, Button } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import notification from 'utils/notification';
import intl from 'utils/intl';
import ReactJson from 'react-json-view';
import '../index.less';

export default function BusinessList(props) {
  const { BusinessDs, activeKey } = props;

  const handleCopy = (text) => {
    const input = document.createElement('input');
    input.style.cssText = 'opacity: 0;';
    input.type = 'text';
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    notification.success({
      message: intl.get(`smnd.monitorDashboard.view.message.copySuccess`).d('复制成功!'),
    });
  };

  const openModalDetails = (value, type) => {
    Modal.open({
      title:
        type === 'json' ? (
          <span>
            {' '}
            {intl.get(`smnd.monitorDashboard.model.monitorDashboard.JsonText`).d('JSON报文')}
          </span>
        ) : null,
      drawer: type === 'json',
      children:
        type === 'json' ? (
          <ReactJson src={JSON.parse(value)} theme="monokai" />
        ) : (
          <>
            <div style={{ textAlign: 'right', marginBottom: '6px' }}>
              <Button onClick={() => handleCopy(value)} size="small">
                {intl.get(`smnd.monitorDashboard.view.title.copyText`).d('复制文本')}
              </Button>
            </div>
            <p style={{ overflow: 'scroll', width: '650px' }}>{value}</p>
          </>
        ),
      closable: true,
      footer: null,
      style: { width: '720px' },
    });
  };

  const useTag = (value) => {
    return useCallback(({ record }) => {
      return (
        <Tag
          color={
            record.get(value) === 'success'
              ? '#ebf7f1'
              : record.get(value) === 'processed'
              ? '#fef4e2'
              : '#ffeeeb'
          }
          style={{
            color:
              record.get(value) === 'success'
                ? '#47b883'
                : record.get(value) === 'processed'
                ? '#fca400'
                : '#f56649',
          }}
        >
          {record.get(value) === 'success'
            ? intl.get(`smnd.monitorDashboard.model.monitorDashboard.success`).d('成功')
            : record.get(value) === 'processed'
            ? intl.get(`smnd.monitorDashboard.model.monitorDashboard.processed`).d('已处理')
            : intl.get(`smnd.monitorDashboard.model.monitorDashboard.fail`).d('失败')}
        </Tag>
      );
    }, []);
  };

  const columns = [
    {
      name: 'documentNum',
      width: 170,
      lock: 'left',
    },
    activeKey === 'list' && {
      name: 'interfaceName',
      width: 220,
      lock: 'left',
    },
    {
      name: 'type',
      width: 90,
      lock: 'left',
    },

    activeKey === 'list' && {
      name: 'tenantName',
      width: 120,
    },
    {
      name: 'responseDate',
      width: 140,
    },
    {
      name: 'requestStatus',
      width: 80,
      renderer: useTag('requestStatus'),
    },

    {
      name: 'errorMessage',
      width: 120,
    },
    {
      name: 'responseStatus',
      width: 80,
      renderer: useTag('responseStatus'),
    },
    {
      name: 'requestParam',
      width: 130,
      renderer: ({ value }) =>
        value && (
          <>
            <a onClick={() => openModalDetails(value)}>
              {intl.get(`smnd.monitorDashboard.model.monitorDashboard.originText`).d('原报文')}
            </a>
            <a onClick={() => openModalDetails(value, 'json')} style={{ marginLeft: '5px' }}>
              {intl.get(`smnd.monitorDashboard.model.monitorDashboard.JsonText`).d('JSON报文')}
            </a>
          </>
        ),
    },
    {
      name: 'responseParam',
      width: 130,
      renderer: ({ value }) =>
        value && (
          <>
            <a onClick={() => openModalDetails(value)}>
              {intl.get(`smnd.monitorDashboard.model.monitorDashboard.originText`).d('原报文')}
            </a>
            <a onClick={() => openModalDetails(value, 'json')} style={{ marginLeft: '5px' }}>
              {intl.get(`smnd.monitorDashboard.model.monitorDashboard.JsonText`).d('JSON报文')}
            </a>
          </>
        ),
    },
    {
      name: 'userName',
      width: 120,
    },
    {
      name: 'buKey',
      width: 150,
    },
    {
      name: 'traceId',
      width: 100,
    },
    {
      name: 'requestModule',
      width: 100,
    },
    {
      name: 'responseModule',
      width: 100,
    },
    {
      name: 'requestDate',
      width: 140,
    },
  ];
  return (
    <div
      style={{
        height: 'calc(100vh - 238px)',
        marginTop: '16px',
        marginLeft: !activeKey ? '16px' : '0px',
      }}
    >
      <Table
        dataSet={BusinessDs}
        queryBar="filterBar"
        queryBarProps={{
          dynamicFilterBar: { searchText: 'attributeField' },
          fuzzyQueryPlaceholder: intl
            .get(`smnd.monitorDashboard.model.monitorDashboard.attributeField`)
            .d('请输入扩展字段查询'),
        }}
        border={false}
        columns={columns.filter(Boolean)}
        queryFieldsLimit={10}
        boxSizing="wrapper"
        style={{ maxHeight: `calc(100% - 22px)` }}
      />
    </div>
  );
}
