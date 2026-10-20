import React, { useMemo, useEffect } from 'react';
import { Header, Content } from 'components/Page';
import { Button, Table, DataSet } from 'choerodon-ui/pro';
import { Popconfirm } from 'choerodon-ui';
import intl from 'utils/intl';
import { compose } from 'lodash';
import { getResponse } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { handleCreate, CustomModal } from './func';
import { monitorServiceDataSet } from './store//monitorServiceDs';
import notification from 'utils/notification';
import { delServiceDefine } from '@/services/monitorService';

const Index = () => {
  const monitorServiceDs = useMemo(() => new DataSet(monitorServiceDataSet()), []);

  useEffect(() => {
    monitorServiceDs.query();
  }, []);

  const handleDel = async (record) => {
    const settingId = record.get('settingId');
    monitorServiceDs.status = 'submitting';
    delServiceDefine({ settingId }).then((res) => {
      if (getResponse(res)) {
        notification.success();
        monitorServiceDs.query();
      }
      monitorServiceDs.status = 'ready';
    });
  };

  const columns = [
    {
      name: 'tenantId',
      width: 130,
    },
    {
      name: 'settingCode',
      width: 200,
    },
    {
      name: 'routingKey',
      width: 130,
    },
    {
      name: 'interfaceName',
      width: 160,
    },
    {
      name: 'requestModule',
      width: 100,
      // editor: true,
      // renderer: ({ value, record }) => value && record.get('requestModule'),
    },
    {
      name: 'requestService',
      width: 100,
    },
    {
      name: 'responseModuleCode',
      width: 120,
      // editor: true,
      renderer: ({ record }) => record.get('responseModule') || '-',
    },
    {
      name: 'tableName',
      width: 130,
    },
    {
      name: 'retentionTime',
      width: 140,
    },
    {
      name: 'blacklistObj',
      width: 130,
    },
    {
      name: 'requestMapping',
      width: 150,
      renderer: ({ value, record }) => {
        const { settingId } = record.toData();
        return (
          <CustomModal
            dataSource={value || []}
            ds={monitorServiceDs}
            settingId={settingId}
            type="requestMapping"
          />
        );
      },
    },
    {
      name: 'responseMapping',
      width: 150,
      renderer: ({ value, record }) => {
        const { settingId } = record.toData();
        return (
          <CustomModal
            dataSource={value || []}
            ds={monitorServiceDs}
            settingId={settingId}
            type="responseMapping"
          />
        );
      },
    },
    {
      name: 'type',
      width: 120,
    },
    {
      name: 'exceptionDefinition',
      width: 120,
      // renderer: ({ value }) => {
      //   return <ExceptionModal dataSource={value || []} ds={monitorServiceDs} />;
      // },
    },
    {
      name: 'action',
      renderer: ({ record }) => {
        return (
          <>
            <a onClick={() => handleCreate(monitorServiceDs, 'edit', record)}>
              {intl.get(`smnd.monitorDashboard.view.button.edit`).d('编辑')}
            </a>
            <Popconfirm
              title={intl.get('hzero.common.message.confirm.delete').d('确定删除当前数据?')}
              onConfirm={() => handleDel(record)}
              okText={intl.get('hzero.common.status.yes').d('是')}
              cancelText={intl.get('hzero.common.status.no').d('否')}
            >
              <a style={{ marginLeft: '5px' }}>
                {intl.get(`smnd.monitorDashboard.view.button.delete`).d('删除')}
              </a>
            </Popconfirm>
          </>
        );
      },
    },
  ];

  return (
    <>
      <Header
        title={intl
          .get(`smnd.monitorDashboard.view.message.executionMonitor`)
          .d('异常监控-接口服务定义')}
      >
        <Button
          color="primary"
          icon="add"
          onClick={() => handleCreate(monitorServiceDs, 'add', {})}
        >
          {intl.get('hzero.common.button.create').d('新建')}
        </Button>
      </Header>
      <Content>
        <div style={{ height: 'calc(100vh - 260px)' }}>
          <Table
            dataSet={monitorServiceDs}
            columns={columns}
            style={{ maxHeight: `calc(100% - 22px)` }}
          />
        </div>
      </Content>
    </>
  );
};

export default compose(
  formatterCollections({
    code: ['smnd.monitorDashboard', 'hzero.common', 'smnd.common'],
  })
)(Index);
