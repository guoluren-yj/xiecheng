/**
 * @description 关联Marmot脚本
 * @export MarmotScript
 * @class MarmotScript
 * @extends {Component}
 */

import React, { Fragment, useMemo, useEffect } from 'react';
import { DataSet, Button, Table, Modal, Form, TextField } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { isEmpty, isNil } from 'lodash';
import querystring from 'querystring';

import { Header, Content } from 'components/Page';
import notification from 'utils/notification';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse, isTenantRoleLevel } from 'utils/utils';

import { marmotData, formData } from './initialDataDs';
import { optionsMarmot } from '@/services/interfaceDefNewService';

const prefix = 'sitf.interfaceDef';
const organizationRole = isTenantRoleLevel();

const KeywordExtraction = (props) => {
  const {
    location: { search = '' },
  } = props;
  const { interfaceId = '', interfaceCode = '', interfaceName = '' } = querystring.parse(
    search.substr(1)
  );

  const marmotDataDs = useMemo(() => new DataSet(marmotData()), []);

  const formDataDs = useMemo(() => new DataSet(formData()), []);

  useEffect(() => {
    if (!isEmpty(interfaceId)) {
      fetchMarmotData();
    }
  }, [interfaceId]);

  const fetchMarmotData = () => {
    marmotDataDs.setQueryParameter('interfaceId', interfaceId);
    formDataDs.loadData([{ interfaceCode, interfaceName }]);
    marmotDataDs.query();
  };

  // 新建 【0】 编辑【1】
  const handleCreate = (type, record = {}) => {
    if (type === 1) {
      record.setState('editing', true);
    } else {
      const currentRecord = marmotDataDs.create({}, 0);
      currentRecord.setState('editing', true);
    }
  };

  // 清除 【0】 删除【1】
  const handleDelete = (type, record = {}) => {
    if (type === 1) {
      const selectedData = marmotDataDs?.selected.map((item) => item.data) || [];
      if (isEmpty(selectedData)) {
        notification.warning({
          message: intl.get(`${prefix}.view.message.selectedWarning`).d('请勾选数据!'),
        });
        return;
      }
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录'),
        onOk: async () => {
          const data = {
            method: 'DELETE',
            param: selectedData,
          };
          const response = await optionsMarmot(data);
          try {
            if (getResponse(response)) {
              notification.success();
              fetchMarmotData();
            }
          } catch (error) {
            throw error;
          }
        },
      });
    } else {
      marmotDataDs.remove(record);
    }
  };

  // 保存
  const handleSave = async () => {
    const validflag = await marmotDataDs.validate();
    if (validflag) {
      const currentData = marmotDataDs.toData() || [];
      const data = {
        method: 'POST',
        param: currentData.map((item) => ({ ...item, interfaceId })),
      };
      const response = await optionsMarmot(data);
      try {
        if (getResponse(response)) {
          notification.success();
          fetchMarmotData();
        }
      } catch (error) {
        throw error;
      }
    } else {
      notification.warning({
        message: intl.get(`${prefix}.view.message.requredWarning`).d('请填写必填项!'),
      });
    }
  };

  const columns = [
    {
      name: 'marmotCode',
      editor: (record) => record.getState('editing'),
    },
    {
      name: 'description',
      editor: (record) => record.getState('editing'),
    },
    {
      name: 'enabledFlag',
      editor: (record) => record.getState('editing'),
    },
    {
      name: 'orderSeq',
      editor: (record) => record.getState('editing'),
    },
    {
      header: intl.get(`${prefix}.model.interfaceDef.operation`).d('操作'),
      align: 'center',
      lock: 'right',
      renderer: ({ record }) =>
        record.getState('editing') ? (
          isNil(record.get('cnfLineId')) && (
            <a onClick={() => handleDelete(0, record)}>
              {intl.get(`${prefix}.view.button.delete`).d('清除')}
            </a>
          )
        ) : (
          <a onClick={() => handleCreate(1, record)} style={{ marginRight: '8px' }}>
            {intl.get(`${prefix}.view.button.editor`).d('编辑')}
          </a>
        ),
    },
  ];

  return (
    <Fragment>
      <Header
        title={intl.get(`${prefix}.view.title.marmot`).d('关联埋点脚本')}
        backPath={organizationRole ? '/sitf/interface-def-org/list' : '/sitf/interface-def/list'}
      >
        <Button color="primary" onClick={() => handleCreate(0)}>
          {intl.get('scux.common.button.update').d('新建')}
        </Button>
        <Button wait={500} waitType="debounce" onClick={handleSave}>
          {intl.get('scux.common.button.submit').d('保存')}
        </Button>
        <Button wait={500} waitType="debounce" onClick={() => handleDelete(1)}>
          {intl.get('scux.common.button.delete').d('删除')}
        </Button>
      </Header>
      <Content>
        <Form dataSet={formDataDs} columns={3} labelWidth={130}>
          <TextField name="interfaceCode" disabled />
          <TextField name="interfaceName" disabled />
        </Form>
        <Table dataSet={marmotDataDs} columns={columns} />
      </Content>
    </Fragment>
  );
};

export default formatterCollections({ code: ['sitf.interfaceDef'] })(observer(KeywordExtraction));
