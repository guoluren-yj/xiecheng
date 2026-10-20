/**
 * 业务规则定义元数据
 * index.js
 * @date: 2020-07-15
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React from 'react';
import { Table, DataSet, Button, Modal, CodeArea } from 'choerodon-ui/pro';
import withProps from 'utils/withProps';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
import JSONFormatter from 'choerodon-ui/pro/lib/code-area/formatters/JSONFormatter';
// 引入 json lint
// 处理 codemirror 的SSR问题， 如无需SSR，请用import代替require;
import 'codemirror/mode/javascript/javascript';
import 'choerodon-ui/pro/lib/code-area/lint/json';
import {
  savaMetaData,
  updateMetaData,
  deleteMetaData,
} from '@/services/rulesDefinitionMetaService';
import { Header, Content } from 'components/Page';
import getMetaTableDs from './store/metaTableDs';
import getMetaEditFormDs from './store/metaEditFormDs';
import MetaEditModal from './MetaEditModal';

const editModalKey = Modal.key();
const detailModalKey = Modal.key();
const options = { mode: { name: 'javascript', json: true } };

function RulesDefinitionMeta(props = {}) {
  const { metaTableDs, metaEditFormDs } = props.valueDs;

  /**
   * 操作成功后调用表格数据查询和 form 重置
   */
  const successAction = () => {
    notification.success();
    metaTableDs.query();
    metaEditFormDs.reset();
  };

  /**
   * 保存和更新
   * @param {Function} resolve
   * @param {Function} reject
   */
  const saveMetaData = (resolve, reject) => {
    const metaData = metaEditFormDs.toData()[0] || {};
    if (metaData.metaDefinitionId) {
      updateMetaData(metaData)
        .then((res) => {
          if (getResponse(res)) {
            successAction();
            resolve();
          } else {
            resolve(false);
          }
        })
        .catch((err) => reject(err));
    } else {
      savaMetaData(metaData)
        .then((res) => {
          if (getResponse(res)) {
            successAction();
            resolve();
          } else {
            resolve(false);
          }
        })
        .catch((err) => reject(err));
    }
  };

  /**
   * 删除 元数据 行数据
   * @param {Object} record
   */
  const onDeleteMetaData = (record) => {
    Modal.confirm({
      title: intl.get('spfm.configServer.view.message.ifClean').d('确认删除？'),
      onOk: () => {
        const deleteData = record.data;
        deleteMetaData(deleteData).then((res) => {
          if (getResponse(res)) {
            successAction();
          }
        });
      },
    });
  };

  /**
   * 打开 Form 编辑 modal
   * @param {String} title 弹框标题
   * @param {Boolean} isEditFlag 是否是编辑标志
   * @param {Object} record 行数据
   */
  const showEditModal = (title = '', isEditFlag = false, record) => {
    if (record) {
      metaEditFormDs.create(record.data);
    }
    Modal.open({
      key: editModalKey,
      title,
      children: <MetaEditModal dataSet={metaEditFormDs} isEditFlag={isEditFlag} />,
      onOk: () => new Promise((resolve, reject) => saveMetaData(resolve, reject)),
      onCancel: () => {
        metaEditFormDs.reset();
      },
      drawer: true,
      destroyOnClose: true,
      style: { width: 800 },
    });
  };

  /**
   * 展示 json 数据
   * @param {String} title 弹框标题
   * @param {String} value 弹框数据
   */
  const showJsonDetail = (title = '', value = '') => {
    Modal.open({
      key: detailModalKey,
      title,
      children: (
        <CodeArea
          disabled
          defaultValue={value}
          options={options}
          formatter={JSONFormatter}
          style={{ height: 500 }}
        />
      ),
      footer: null,
      closable: true,
      movable: false,
      destroyOnClose: true,
      style: { width: 800 },
    });
  };

  const columns = [
    {
      name: 'fullPathCode',
      width: 250,
    },
    {
      name: 'tenantName',
      width: 200,
    },
    {
      name: 'name',
      width: 120,
    },
    {
      name: 'description',
      width: 300,
    },
    {
      name: 'defaultRet',
      width: 120,
    },
    {
      name: 'defaultRetMeaning',
      width: 200,
    },
    {
      name: 'parameters',
      width: 200,
      renderer: ({ value }) => (
        <a
          onClick={() =>
            showJsonDetail(
              intl.get('spfm.rulesDefinitionMeta.model.rulesDefinitionMeta.parameters').d('参数'),
              value
            )
          }
        >
          {value}
        </a>
      ),
    },
    {
      name: 'ret',
      width: 200,
      renderer: ({ value }) => (
        <a
          onClick={() =>
            showJsonDetail(
              intl.get('spfm.rulesDefinitionMeta.model.rulesDefinitionMeta.ret').d('返回值'),
              value
            )
          }
        >
          {value}
        </a>
      ),
    },
    {
      name: 'action',
      width: 120,
      lock: 'right',
      renderer: ({ record }) => (
        <span className="action-link">
          <a
            onClick={() => {
              showEditModal(
                intl.get('spfm.rulesDefinitionMeta.view.modal.title.edit').d('编辑业务规则元数据'),
                true,
                record
              );
            }}
          >
            {intl.get('hzero.common.button.edit').d('编辑')}
          </a>
          <a onClick={() => onDeleteMetaData(record)}>
            {intl.get('hzero.common.button.delete').d('删除')}
          </a>
        </span>
      ),
    },
  ];

  return (
    <React.Fragment>
      <Header
        title={intl.get('spfm.rulesDefinitionMeta.view.header.title').d('业务规则定义元数据')}
      >
        <Button
          color="primary"
          onClick={() => {
            showEditModal(
              intl.get('spfm.rulesDefinitionMeta.view.modal.title.create').d('新建业务规则元数据'),
              false
            );
          }}
        >
          {intl.get('hzero.common.button.create').d('新建')}
        </Button>
      </Header>
      <Content>
        <Table dataSet={metaTableDs} columns={columns} />
      </Content>
    </React.Fragment>
  );
}

export default formatterCollections({
  code: [
    'spfm.rulesDefinitionMeta',
    'spfm.rulesCategory',
    'hzero.common',
    'spfm.configServer',
    'entity.tenant',
  ],
})(
  withProps(
    () => {
      const metaTableDs = new DataSet(getMetaTableDs()); // 元数据 ds
      const metaEditFormDs = new DataSet(getMetaEditFormDs()); // 元数据 form ds
      const valueDs = {
        metaTableDs,
        metaEditFormDs,
      };
      return { valueDs };
    },
    { cacheState: true }
  )(RulesDefinitionMeta)
);
