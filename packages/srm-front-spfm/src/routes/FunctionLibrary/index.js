/**
 * index.js
 * 适配器列表
 * @date: 2020-12-30
 * @author: guozhiqiang <zhiqiang.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { useEffect } from 'react';
import { Table, DataSet, Modal, Button } from 'choerodon-ui/pro';
import { Header, Content } from 'components/Page';
import withProps from 'utils/withProps';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import { getListDs, getEditDS } from './store/adaptorTaskDs';

// import styles from './index.less';
import EditForm from './EditForm.js';

const companyModal = Modal.key();

function AdaptorTask(props = {}) {
  const { listDs, editDs } = props.valueDs;

  useEffect(() => {
    const values = editDs.toJSONData();
    listDs.setQueryParameter('params', values);
    listDs.query(listDs.currentPage);
  }, [listDs.currentPage]);

  const handleModalOpen = (id) => {
    // routerDetail(functionId);
    Modal.open({
      key: companyModal,
      title: intl.get('spfm.functionLibrary.model.functionLibrary.functionConfig').d('函数配置'),
      children: <EditForm ds={editDs} functionId={id} />,
      closable: true,
      maskClosable: true,
      drawer: true,
      destroyOnClose: true,
      onCancel: () => {
        setTimeout(() => editDs.records[0] && editDs.records[0].clear(), 200);
      },
      onClose: () => {
        setTimeout(() => editDs.records[0] && editDs.records[0].clear(), 200);
      },
      onOk: async () => {
        const flag = await editDs.validate();
        if (!flag) return false;
        await editDs.submit();
        listDs.query();
      },
    });
  };

  const columns = [
    {
      name: 'functionCode',
      width: 120,
    },
    {
      name: 'functionName',
      width: 200,
    },
    {
      name: 'isLabel',
      renderer: ({ value }) => {
        return yesOrNoRender(value ? 1 : 0);
      },
    },
    {
      name: 'functionTypeMeaning',
      width: 100,
    },
    {
      name: 'functionEntities',
      width: 200,
    },
    {
      name: 'functionFields',
      width: 350,
    },
    {
      name: 'labelName',
    },
    {
      name: 'expression',
      width: 150,
    },
    {
      name: 'remark',
      width: 250,
    },
    {
      name: 'levelCodeMeaning',
      width: 120,
    },
    {
      name: 'enabled',
      width: 100,
      renderer: ({ value }) =>
        value
          ? intl.get('hzero.common.status.enable').d('启用')
          : intl.get('hzero.common.status.disable').d('禁用'),
    },
    {
      name: 'action',
      width: 80,
      renderer: ({ record = {} } = {}) => {
        const { data = {} } = record;
        const { functionId } = data;
        return (
          <a onClick={() => handleModalOpen(functionId)}>
            {intl.get('hzero.common.button.edit').d('编辑')}
          </a>
        );
      },
    },
  ];

  return (
    <React.Fragment>
      <Header title={intl.get('spfm.functionLibrary.model.functionLibrary.title').d('函数库配置')}>
        <Button color="primary" onClick={() => handleModalOpen()}>
          {intl.get('hzero.common.button.create').d('新建')}
        </Button>
      </Header>
      <Content>
        <Table dataSet={listDs} columns={columns} />
      </Content>
    </React.Fragment>
  );
}

export default formatterCollections({
  code: ['spfm.functionLibrary', 'hzero.common', 'entity.tenant', 'entity.supplier'],
})(
  withProps(
    () => {
      const listDs = new DataSet(getListDs());
      const editDs = new DataSet(getEditDS());
      const valueDs = {
        listDs,
        editDs,
      };
      return { valueDs };
    },
    { cacheState: true, keepOriginDataSet: true }
  )(AdaptorTask)
);
