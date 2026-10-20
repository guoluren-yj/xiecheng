import React, { useMemo } from 'react';
import { DataSet, Button, Lov, Form, Select } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import { flowRight } from 'lodash';

import { Header, Content } from 'components/Page';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import intl from 'utils/intl';
import c7nModal from '@/utils/c7nModal';
import { createTask, initTask, continueTask } from '@/services/skuTask';
import { getResponse } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

import { tableds } from './ds';
import { useRenderTag } from '@/hooks/useRenderTag';
import Detail from './detail';

function SkuInitTask() {
  const tableDs = useMemo(() => new DataSet(tableds()), []);

  const listColor = [
    { colorType: 'success', matchList: ['FINISH'] },
    { colorType: 'warning', matchList: ['EXECUTING', 'ERROR'] },
    { colorType: 'invalid', matchList: ['NEW'] },
  ];

  async function handleInitTask(record) {
    const res = getResponse(await initTask(record.toData()));
    if (res) {
      tableDs.query();
    }
  }

  async function handleContinue(record) {
    const res = getResponse(await continueTask(record.toData()));
    if (res) {
      tableDs.query();
    }
  }

  async function handleCheck(record) {
    const modal = c7nModal({
      title: intl.get('smep.skuTask.model.finish').d('查看任务进度'),
      style: { width: '380px' },
      children: <Detail record={record} />,
      footer: (
        <Button color="primary" onClick={() => modal?.close()}>
          {intl.get('smep.skuTask.model.close').d('关闭')}
        </Button>
      ),
    });
  }

  const columns = useMemo(() => {
    return [
      {
        name: 'statusMeaning',
        renderer: ({ record, text }) => {
          const styles = useRenderTag(listColor, record.get('status'));
          return (
            <Tag color={styles.backgroundColor} style={{ color: styles.color }}>
              {text}
            </Tag>
          );
        },
      },
      { name: 'tenantName' },
      { name: 'ecTypeMeaning' },
      {
        name: 'operation',
        renderer: ({ record }) => {
          if (record.get('status') === 'NEW') {
            return (
              <Button color="primary" funcType="link" onClick={() => handleInitTask(record)}>
                {intl.get('smep.skuTask.model.init').d('启动初始化')}
              </Button>
            );
          } else if (record.get('status') === 'FINISH') {
            return (
              <Button color="primary" funcType="link" onClick={() => handleCheck(record)}>
                {intl.get('smep.skuTask.model.finish').d('查看任务进度')}
              </Button>
            );
          } else if (record.get('status') === 'ERROR') {
            return (
              <Button color="primary" funcType="link" onClick={() => handleContinue(record)}>
                {intl.get('smep.skuTask.model.continue').d('继续初始化')}
              </Button>
            );
          } else if (record.get('status') === 'EXECUTING') {
            return (
              <Button color="primary" funcType="link" onClick={() => handleCheck(record)}>
                {intl.get('smep.skuTask.model.finish').d('查看任务进度')}
              </Button>
            );
          }
        },
      },
    ];
  }, []);

  async function handleAdd(ds) {
    const flag = await ds.validate();
    if (flag) {
      const res = getResponse(
        await createTask({
          tenantId: ds.current.get('tenantId'),
          ecType: ds.current.get('ecLov'),
          status: 'NEW',
        })
      );
      if (res) {
        tableDs.query();
      }
    } else {
      return false;
    }
  }

  const addTask = () => {
    const formDs = new DataSet({
      autoCreate: true,
      fields: [
        {
          name: 'tenantLov',
          type: 'object',
          label: intl.get('smep.skuTask.model.tenantName').d('租户'),
          lovCode: 'HPFM.TENANT',
          required: true,
        },
        {
          name: 'ecLov',
          type: 'string',
          label: intl.get('smep.skuTask.model.ec').d('电商'),
          lookupCode: 'SMEP.EC_TYPE',
          required: true,
        },
        {
          name: 'tenantId',
          bind: 'tenantLov.tenantId',
        },
      ],
    });
    c7nModal({
      title: intl.get('smep.skuTask.view.addTask').d('新建商品初始化任务'),
      style: { width: 380 },
      children: (
        <>
          <Form labelLayout="float" dataSet={formDs}>
            <Lov name="tenantLov" />
            <Select name="ecLov" />
          </Form>
        </>
      ),
      onOk: () => handleAdd(formDs),
    });
  };

  return (
    <React.Fragment>
      <Header title={intl.get('smep.skuTask.view.title').d('商品初始化任务')}>
        <Button icon="add" color="primary" onClick={addTask}>
          {intl.get('smep.skuTask.button.add').d('新建')}
        </Button>
      </Header>
      <Content>
        <div style={{ height: 'calc(100vh - 200px)' }}>
          <SearchBarTable
            style={{ maxHeight: `calc(100% - 22px)` }}
            dataSet={tableDs}
            columns={columns}
            searchCode="SMEP.SKUINITTASK.TASK.SEARCH_BAR"
            customizedCode="SMEP.SKUINITTASK.TASK.SELECT"
            searchBarConfig={{
              fieldProps: {
                tenantId: { lovPara: { tenantId: undefined } },
              },
            }}
          />
        </div>
      </Content>
    </React.Fragment>
  );
}

export default flowRight(formatterCollections({ code: ['smep.skuTask'] }))(SkuInitTask);
