/**
 * @description 关联Marmot脚本
 * @export MarmotScript
 * @class MarmotScript
 * @extends {Component}
 */

import React, { Fragment, useMemo, useEffect } from 'react';
import { DataSet, Button, Table, Modal } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { isEmpty } from 'lodash';
import querystring from 'querystring';

import { Header, Content } from 'components/Page';
import notification from 'utils/notification';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse } from 'utils/utils';

import { multiReceiverData, conditionLineVOListData } from './initialDataDs';

const prefix = 'sitf.interfaceDef';

const MultiReceiver = (props) => {
  const {
    location: { search = '' },
  } = props;
  const { interfaceId = ''} = querystring.parse(
    search.substr(1)
  );

  const multiReceiverDataDs = useMemo(() => new DataSet(multiReceiverData()), []);

  useEffect(() => {
    if (!isEmpty(interfaceId)) {
      multiReceiverDataDs.setQueryParameter('interfaceId', interfaceId);
      multiReceiverDataDs.query();
    }
  }, [interfaceId]);

  const handleOptions = (record) => {
    const conditionLineVOList = record.get('conditionLineVOList');
    const conditionLineVOListDataDs = new DataSet(conditionLineVOListData());
    conditionLineVOListDataDs.loadData(conditionLineVOList);
    const columns = [
      {
        name: 'leftValue',
        editor: true,
      },
      {
        name: 'operator',
        editor: true,
      },
      {
        name: 'rightValue',
        editor: true,
      },
    ];

    Modal.open({
      title: intl.get(`${prefix}.view.title.expression.condition`).d('表达式条件配置'),
      style: {width: 600},
      children: <Table dataSet={conditionLineVOListDataDs} columns={columns} buttons={['add', 'delete']} />,
      onOk: async () => {
        const validateFlag = await conditionLineVOListDataDs.validate();
        if(validateFlag) {
          const currentData = conditionLineVOListDataDs.toData();
          record.set('conditionLineVOList', currentData);
        } else {
          notification.warning({
            message: intl.get(`${prefix}.view.message.requredWarning`).d('请填写必填项!'),
          });
        }
      },
    });
  };

  const columns = [
    {
      width: 60,
      name: 'lineNum',
      renderer: ({ record, dataSet }) => {
        const { index } = record;
        const { pageSize, currentPage } = dataSet;
        return pageSize * (currentPage - 1) + index + 1;
      },
    },
    {
      name: 'receiverTypeCodeLov',
      editor: true,
    },
    {
      header: intl.get(`${prefix}.model.interfaceDef.operation`).d('操作'),
      align: 'center',
      renderer: ({record}) => <a onClick={() => handleOptions(record)}>{intl.get(`${prefix}.view.title.conditionLineVOList`).d('条件表达式')}</a>,
    },
    {
      name: 'conditionExpression',
    },
  ];

  const handleCreate = () => {
    multiReceiverDataDs.create({interfaceId}, 0);
  };

  const handleSave = async () => {
    const validflag = await multiReceiverDataDs.validate();
    if (validflag) {
      const res = await multiReceiverDataDs.submit();
      if (getResponse(res)) {
        multiReceiverDataDs.query();
      }
    } else {
      notification.warning({
        message: intl.get(`${prefix}.view.message.requredWarning`).d('请填写必填项!'),
      });
    }
  };

  const handleDelete = async () => {
    const { selected } = multiReceiverDataDs;
    if(!isEmpty(selected)) {
      const res = await multiReceiverDataDs.delete(selected);
      if (getResponse(res)) {
        multiReceiverDataDs.query();
      }
    } else {
      notification.warning({
        message: intl.get(`${prefix}.view.message.notNull`).d('请勾选数据'),
      });
    }
  };

  return (
    <Fragment>
      <Header
        title={intl.get(`${prefix}.view.title.multiReceiverTypeFlag`).d('【多告警接收组配置】')}
        backPath='/sitf/interface-def-org/list'
      >
        <Button color="primary" icon='add' onClick={handleCreate}>
          {intl.get('scux.common.button.update').d('新建')}
        </Button>
        <Button wait={500} icon='save' onClick={handleSave}>
          {intl.get('scux.common.button.save').d('保存')}
        </Button>
        <Button wait={500} icon='delete' onClick={handleDelete}>
          {intl.get('scux.common.button.delete').d('删除')}
        </Button>
      </Header>
      <Content>
        <Table dataSet={multiReceiverDataDs} columns={columns} />
      </Content>
    </Fragment>
  );
};

export default formatterCollections({ code: ['sitf.interfaceDef', 'scux.common'] })(observer(MultiReceiver));
