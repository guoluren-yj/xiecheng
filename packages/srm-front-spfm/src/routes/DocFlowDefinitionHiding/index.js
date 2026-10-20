import React from 'react';
import { Table, DataSet, Button } from 'choerodon-ui/pro';
import withProps from 'utils/withProps';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import { putNodeHideDefinitions } from '@/services/docFlowDefinitionHidingService';
import { getNodeHidden } from './store/docFlowDefinitionHidingDs';

function docFlowDefinitionHiding(props = {}) {
  const { nodeHiddenDs } = props;

  const addRecord = () => {
    const newRecord = nodeHiddenDs.create({}, 0);
    newRecord.setState('editing', true);
  };

  const editRecord = (record) => {
    record.setState('editing', true);
  };

  const cancelRecord = (record) => {
    if (record.status === 'add') {
      nodeHiddenDs.remove(record);
    } else {
      record.reset();
      record.setState('editing', false);
    }
  };

  const submitSave = () => {
    nodeHiddenDs.validate().then((res) => {
      if (res) {
        const data = [
          ...nodeHiddenDs.created.map((record) => record.toData()),
          ...nodeHiddenDs.updated.map((record) => record.toData()),
        ];
        if (!data.length) {
          return false;
        }
        putNodeHideDefinitions(data).then((resp) => {
          if (getResponse(resp)) {
            notification.success();
            nodeHiddenDs.query();
          }
        });
      }
    });
  };

  const columns = [
    {
      name: 'currNodeDefinitionCode',
      width: 400,
      editor: (record) => record.getState('editing'),
    },
    {
      name: 'hideNodeCode',
      minWidth: 400,
      editor: (record) => record.getState('editing'),
    },
    {
      name: 'operation',
      width: 200,
      renderer: ({ record }) => (
        <>
          {record.getState('editing') ? (
            <span className="action-link">
              <a onClick={() => cancelRecord(record)}>
                {intl.get('hzero.common.btn.cancel').d('取消')}
              </a>
            </span>
          ) : (
            <span className="action-link">
              <a onClick={() => editRecord(record)}>
                {intl.get('hzero.common.status.editor').d('编辑')}
              </a>
            </span>
          )}
        </>
      ),
    },
  ];

  const buttons = [
    <Button icon="playlist_add" onClick={() => addRecord()} key="add">
      {intl.get('hzero.common.button.create').d('新建')}
    </Button>,
    'delete',
  ];

  return (
    <>
      <Header
        title={intl.get('sdps.docFlowDefinitionHiding.modal.view.title').d('单据流节点隐藏定义')}
      >
        <Button onClick={() => submitSave()} color="primary">
          {intl.get('hzero.common.model.save').d('保存')}
        </Button>
      </Header>
      <Content>
        <Table dataSet={nodeHiddenDs} columns={columns} buttons={buttons} />
      </Content>
    </>
  );
}
export default formatterCollections({
  code: ['sdps.docFlowDefinitionHiding', 'hzero.common'],
})(
  withProps(
    () => {
      const nodeHiddenDs = new DataSet(getNodeHidden());
      return { nodeHiddenDs };
    },
    { cacheState: true }
  )(docFlowDefinitionHiding)
);
