/**
 * index.js - 业务规则定义标签
 * @date: 2020-09-09
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Table, DataSet, Button } from 'choerodon-ui/pro';
import { Header, Content } from 'components/Page';
import withProps from 'utils/withProps';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import getCnfLabelDs from './store/cnfLabelDs';
import { saveCnfLabel } from '@/services/cnfLabelService';

function CnfLabel(props = {}) {
  const { cnfLabelDs } = props.valueDs;

  // 数据操作成功后处理
  const successAction = () => {
    notification.success();
    cnfLabelDs.query();
  };

  // const handleDelete = (record) => {
  //   Modal.confirm({
  //     title: intl.get('spfm.configServer.view.message.ifClean').d('确认删除？'),
  //     onOk: () => {
  //       const deleteData = record.data;
  //       deleteCnfLabel(deleteData).then((res) => {
  //         if (getResponse(res)) {
  //           successAction();
  //         }
  //       });
  //     },
  //   });
  // }

  /**
   * 保存
   */
  const handelSave = () => {
    cnfLabelDs.validate().then((result) => {
      if (result) {
        const saveData = cnfLabelDs.toJSONData();
        saveCnfLabel(saveData).then((res) => {
          if (getResponse(res)) {
            successAction();
          }
        });
      }
    });
  };

  const columns = [
    {
      name: 'labelCode',
      width: 200,
      editor: (record) => record.status === 'add',
    },
    {
      name: 'labelName',
      editor: true,
    },
    {
      name: 'serviceList',
      width: 800,
      editor: true,
    },
  ];

  const buttons = ['add', 'delete'];

  return (
    <React.Fragment>
      <Header title={intl.get('spfm.cnfLabel.view.title.header').d('业务规则定义标签')}>
        <Button color="primary" onClick={() => handelSave()}>
          {intl.get('hzero.common.button.save').d('保存')}
        </Button>
      </Header>
      <Content>
        <Table buttons={buttons} dataSet={cnfLabelDs} columns={columns} />
      </Content>
    </React.Fragment>
  );
}

export default formatterCollections({
  code: ['spfm.cnfLabel', 'hzero.common', 'spfm.configServer'],
})(
  withProps(
    () => {
      const cnfLabelDs = new DataSet(getCnfLabelDs());
      const valueDs = {
        cnfLabelDs,
      };
      return { valueDs };
    },
    { cacheState: true }
  )(CnfLabel)
);
