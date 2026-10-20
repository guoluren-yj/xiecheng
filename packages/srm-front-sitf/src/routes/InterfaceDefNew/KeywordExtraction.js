/**
 * @description 关键字段提取
 * @export KeywordExtraction
 * @class KeywordExtraction
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
import { getCurrentOrganizationId, getResponse, isTenantRoleLevel } from 'utils/utils';

import { optionsKeywordConfig, fetchReload } from '@/services/interfaceDefNewService';
import { keywordExtractionData, formData } from './initialDataDs';

const prefix = 'sitf.interfaceDef';
const tenantId = getCurrentOrganizationId();
const organizationRole = isTenantRoleLevel();

const KeywordExtraction = (props) => {
  const {
    location: { search = '' },
  } = props;
  const { interfaceId = '', interfaceCode = '', interfaceName = '' } = querystring.parse(
    search.substr(1)
  );

  const keywordExtractionDataDs = useMemo(() => new DataSet(keywordExtractionData()), []);

  const formDataDs = useMemo(() => new DataSet(formData()), []);

  useEffect(() => {
    if (!isEmpty(interfaceId)) {
      fetchKeywordData();
    }
  }, [interfaceId]);

  const fetchKeywordData = () => {
    keywordExtractionDataDs.setQueryParameter('tenantId', tenantId);
    keywordExtractionDataDs.setQueryParameter('interfaceId', interfaceId);
    keywordExtractionDataDs.setQueryParameter('tableType', interfaceId === 0 ? '' : 'SITF');
    formDataDs.loadData([{ interfaceCode, interfaceName }]);
    keywordExtractionDataDs.query();
  };

  // 新建 【0】 编辑【1】
  const handleCreate = (type, record = {}) => {
    if (type === 1) {
      record.setState('editing', true);
    } else {
      const currentRecord = keywordExtractionDataDs.create({}, 0);
      currentRecord.setState('editing', true);
    }
  };

  // 清除 【0】 删除【1】
  const handleDelete = (type, record = {}) => {
    if (type === 1) {
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录'),
        onOk: async () => {
          const currentData = record.toData() || {};
          const data = {
            method: 'DELETE',
            param: [{ ...currentData, interfaceId }],
          };
          const response = await optionsKeywordConfig(data);
          try {
            if (getResponse(response)) {
              notification.success();
              fetchKeywordData();
            }
          } catch (error) {
            throw error;
          }
        },
      });
    } else {
      keywordExtractionDataDs.remove(record);
    }
  };

  // 保存
  const handleSave = async () => {
    const validflag = await keywordExtractionDataDs.validate();
    if (validflag) {
      const currentData = keywordExtractionDataDs.toData() || [];
      const data = {
        method: 'POST',
        param: currentData.map((item) => ({ ...item, interfaceId })),
      };
      const response = await optionsKeywordConfig(data);
      try {
        if (getResponse(response)) {
          notification.success();
          fetchKeywordData();
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

  // 重新加载
  const handleReload = async () => {
    const resposne = await fetchReload({ tenantId, interfaceId });
    try {
      if (getResponse(resposne)) {
        notification.success();
        fetchKeywordData();
      }
    } catch (error) {
      throw error;
    }
  };

  const columns = [
    {
      name: 'reservedField',
      editor: (record) => record.getState('editing'),
    },
    {
      name: 'fieldDesc',
      editor: (record) => record.getState('editing'),
    },
    {
      name: 'mappingField',
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
          isNil(record.get('cnfLineId')) ? (
            <a onClick={() => handleDelete(0, record)}>
              {intl.get(`${prefix}.view.button.delete`).d('清除')}
            </a>
          ) : (
            <a onClick={() => handleDelete(1, record)}>
              {intl.get(`${prefix}.view.button.delete`).d('删除')}
            </a>
          )
        ) : (
          <Fragment>
            <a onClick={() => handleCreate(1, record)} style={{ marginRight: '8px' }}>
              {intl.get(`${prefix}.view.button.editor`).d('编辑')}
            </a>
            <a onClick={() => handleDelete(1, record)}>
              {intl.get(`${prefix}.view.button.delete`).d('删除')}
            </a>
          </Fragment>
        ),
    },
  ];

  return (
    <Fragment>
      <Header
        title={intl.get(`${prefix}.view.title.keywordExtraction`).d('关键字段提取')}
        backPath={organizationRole ? '/sitf/interface-def-org/list' : '/sitf/interface-def/list'}
      >
        <Button color="primary" onClick={() => handleCreate(0)}>
          {intl.get('scux.common.button.update').d('新建')}
        </Button>
        <Button wait={500} waitType="debounce" onClick={handleSave}>
          {intl.get('scux.common.button.submit').d('保存')}
        </Button>
        <Button wait={500} waitType="debounce" onClick={handleReload}>
          {intl.get('scux.common.button.delete').d('重新加载')}
        </Button>
      </Header>
      <Content>
        <Form dataSet={formDataDs} columns={3} labelWidth={130}>
          <TextField name="interfaceCode" disabled />
          <TextField name="interfaceName" disabled />
        </Form>
        <Table dataSet={keywordExtractionDataDs} columns={columns} />
      </Content>
    </Fragment>
  );
};

export default formatterCollections({ code: ['sitf.interfaceDef', 'scux.common'] })(
  observer(KeywordExtraction)
);
