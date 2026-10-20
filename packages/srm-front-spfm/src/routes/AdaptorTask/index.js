/**
 * index.js
 * 适配器列表
 * @date: 2020-08-13
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { useEffect } from 'react';
import { Table, DataSet, Button, Modal, CheckBox } from 'choerodon-ui/pro';
import { Header, Content } from 'components/Page';
import withProps from 'utils/withProps';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { deleteAdaptorTask, setAdaptorEnabled } from '@/services/adaptorTaskService';
import getAdaptorTaskDs from './store/adaptorTaskDs';

function AdaptorTask(props = {}) {
  const { adaptorTaskDs } = props.valueDs;

  const routerDetail = (tagParam) => {
    props.history.push(
      `/spfm/adaptor-task/detail${tagParam === 'create' ? '' : `?headerId=${tagParam}`}`
    );
  };

  useEffect(() => {
    adaptorTaskDs.query(adaptorTaskDs.currentPage);
  }, [adaptorTaskDs.currentPage]);

  // 数据操作成功后处理
  const successAction = () => {
    notification.success();
    adaptorTaskDs.query();
  };

  const onDeleteAdaptorTask = (record) => {
    Modal.confirm({
      title: intl.get('spfm.configServer.view.message.ifClean').d('确认删除？'),
      onOk: () => {
        const deleteData = record.data;
        deleteAdaptorTask(deleteData).then((res) => {
          if (getResponse(res)) {
            successAction();
          }
        });
      },
    });
  };

  const changeEnabledFlag = (value, record = {}) => {
    const recordData = record.toJSONData();
    Modal.confirm({
      title: intl.get('spfm.adaptorTask.view.message.ifChange').d('是否要修改适配器状态？'),
      onOk: () => {
        setAdaptorEnabled({
          taskCode: recordData.taskCode,
          applyTenantNum: recordData.applyTenantNum,
          enabled: value,
        }).then((res) => {
          if (getResponse(res)) {
            notification.success();
            adaptorTaskDs.query();
          }
        });
      },
      onCancel: () => {
        record.reset();
      },
    });
  };

  const columns = [
    {
      name: 'applyTenant',
      width: 200,
    },
    {
      name: 'taskCode',
      width: 250,
    },
    {
      name: 'description',
    },
    {
      name: 'inputEntityCode',
      width: 250,
    },
    // {
    //   name: 'version',
    //   width: 80,
    // },
    {
      name: 'runningService',
      width: 120,
    },
    {
      name: 'enabled',
      width: 100,
      editor: (record) => (
        <CheckBox name="enabled" onChange={(value) => changeEnabledFlag(value, record)} />
      ),
    },
    {
      name: 'action',
      width: 120,
      renderer: ({ record }) => (
        <span className="action-link">
          <a onClick={() => routerDetail(record.data.id)}>
            {record.data.enabled
              ? intl.get('hzero.common.button.look').d('查看')
              : intl.get('hzero.common.button.edit').d('编辑')}
          </a>
          <a onClick={() => onDeleteAdaptorTask(record)}>
            {intl.get('hzero.common.button.delete').d('删除')}
          </a>
        </span>
      ),
    },
  ];

  return (
    <React.Fragment>
      <Header title={intl.get('spfm.adaptorTask.view.header.title').d('适配器定义')}>
        <Button color="primary" onClick={() => routerDetail('create')}>
          {intl.get('hzero.common.button.create').d('新建')}
        </Button>
      </Header>
      <Content>
        <Table dataSet={adaptorTaskDs} columns={columns} />
      </Content>
    </React.Fragment>
  );
}

export default formatterCollections({
  code: ['spfm.adaptorTask', 'hzero.common', 'spfm.configServer', 'entity.tenant'],
})(
  withProps(
    () => {
      const adaptorTaskDs = new DataSet(getAdaptorTaskDs());
      const valueDs = {
        adaptorTaskDs,
      };
      return { valueDs };
    },
    { cacheState: true, keepOriginDataSet: true }
  )(AdaptorTask)
);
