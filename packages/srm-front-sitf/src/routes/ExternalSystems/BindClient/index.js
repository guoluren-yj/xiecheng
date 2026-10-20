/**
 * @description 绑定客户端
 * @export BindClient
 * @class BindClient
 * @extends {Component}
 */

import React, { Fragment, useMemo, useEffect } from 'react';
import { DataSet, Button, Table, Form, Output } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { isNil, isEmpty } from 'lodash';
import querystring from 'querystring';

import { Header, Content } from 'components/Page';
import notification from 'utils/notification';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse } from 'utils/utils';

import { tableLine, formData } from './initialDataDs';
import { fetchClientSave, fetchClientDelete } from '@/services/externalSystemsService';

const prefix = 'sitf.bindClient';
const BindClient = (props) => {
  const {
    match: {
      params: { externalSystemId },
    },
  } = props;
  const { externalSystemCode, externalSystemName } = querystring.parse(location.search.substr(1));
  const tableLineDs = useMemo(() => new DataSet(tableLine(externalSystemId)), []);

  const formDataDs = useMemo(() => new DataSet(formData()), []);

  useEffect(() => {
    if (!isNil(externalSystemId)) {
      fetchData();
    }
  }, [externalSystemId]);

  const handleUpdate = (type, record) => {
    record.setState('editing', type === 1);
  };

  const lineColumns = [
    {
      name: 'oauthClientIdLov',
      editor: (record) => record.getState('editing'),
    },
    {
      name: 'enabledFlag',
      editor: (record) => record.getState('editing'),
      width: 80,
    },
    {
      name: 'description',
      editor: (record) => record.getState('editing'),
    },
    {
      header: intl.get(`${prefix}.model.bindClient.options`).d('操作'),
      width: 80,
      align: 'center',
      renderer: ({ record }) =>
        !isNil(record.get('assignClientId')) &&
        (!record.getState('editing') ? (
          <a onClick={() => handleUpdate(1, record)}>
            {intl.get(`${prefix}.view.button.editor`).d('编辑')}
          </a>
        ) : (
          <a onClick={() => handleUpdate(2, record)}>
            {intl.get(`${prefix}.view.button.cancel`).d('取消')}
          </a>
        )),
    },
  ];

  const fetchData = () => {
    tableLineDs.setQueryParameter('externalSystemId', externalSystemId);
    tableLineDs.query();
    formDataDs.loadData([{ externalSystemCode, externalSystemName }]);
  };

  const handleCreate = () => {
    const record = tableLineDs.create({}, 0);
    record.setState('editing', true);
  };

  const handleSave = async () => {
    const validFlag = await tableLineDs.validate();
    if (validFlag) {
      const tableData = tableLineDs
        ?.toData()
        .map((item) => ({ ...item, externalSystemId, oauthClientIdLov: undefined }));
      const response = await fetchClientSave(tableData);
      try {
        if (getResponse(response)) {
          notification.success();
          fetchData();
        }
      } catch (error) {
        throw error;
      }
    } else {
      notification.warning({
        message: intl.get('scux.common.message.request').d('请填写必填项!'),
      });
    }
  };

  const handleDelete = async () => {
    const selectedData = tableLineDs?.selected.map((item) => item.data) || [];
    if (isEmpty(selectedData)) {
      notification.warning({
        message: intl.get(`${prefix}.view.message.selected.data`).d('请勾选数据!'),
      });
      return;
    }

    const filterData = selectedData.filter((item) => !isNil(item.assignClientId));

    if (!isEmpty(filterData)) {
      const response = await fetchClientDelete(filterData);
      try {
        if (getResponse(response)) {
          notification.success();
          fetchData();
        }
      } catch (error) {
        throw error;
      }
    } else {
      tableLineDs.remove(tableLineDs.selected);
    }
  };

  return (
    <Fragment>
      <Header
        title={intl.get(`${prefix}.view.title.bindClient`).d('绑定客户端')}
        backPath="/sitf/external-systems/list"
      >
        <Button color="primary" icon="add" onClick={handleCreate}>
          {intl.get('scux.common.button.update').d('新建')}
        </Button>
        <Button icon="save" onClick={handleSave} wait={500} waitType="debounce">
          {intl.get('scux.common.button.save').d('保存')}
        </Button>
        <Button icon="delete" onClick={handleDelete} wait={500} waitType="debounce">
          {intl.get('scux.common.button.delete').d('删除')}
        </Button>
      </Header>
      <Content>
        <Form dataSet={formDataDs} labelWidth={130} columns={2}>
          <Output name="externalSystemCode" />
          <Output name="externalSystemName" />
        </Form>
        <Table dataSet={tableLineDs} columns={lineColumns} />
      </Content>
    </Fragment>
  );
};

export default formatterCollections({ code: ['sitf.bindClient', 'scux.common'] })(
  observer(BindClient)
);
