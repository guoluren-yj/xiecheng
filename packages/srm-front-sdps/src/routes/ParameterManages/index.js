/**
 * 参数配置
 * @date: 2021-06-21
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React from 'react';
import { DataSet, Table, Button, Modal } from 'choerodon-ui/pro';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import intl from 'utils/intl';
import queryString from 'querystring';
import { SRM_DATA_PROCESS } from '_utils/config';
import { openTab } from 'utils/menuTab';
import { enableRender } from 'utils/renderer';
import { ReactExportButton } from './components/ReactExportButton';
import getParameterManagesDs from './store/parameterManagesDs';
import ParamManageForm from './components/ParamManageForm';

// 弹框key
const modalKey = Modal.key();
const exportRequestUrl = `${SRM_DATA_PROCESS}/v1/parameter-manages/parameter-export`;

function ParameterManages(props = {}) {
  const { parameterManagesDs } = props.valueDs;

  /**
   * 打开编辑框
   * @param {Object} record ds行数据
   * @param {String} title 弹框标题
   */
  const openModal = (record, title) => {
    let isCreate = true;
    Modal.open({
      key: modalKey,
      title,
      drawer: true,
      style: {
        width: 500,
      },
      children: <ParamManageForm record={record} />,
      onOk: () => {
        isCreate = true;
        return parameterManagesDs.submit();
      },
      onCancel: () => {
        isCreate = false;
        parameterManagesDs.reset();
      },
      afterClose: () => {
        if (isCreate) {
          parameterManagesDs.query();
        }
      },
    });
  };

  /**
   * 创建参数配置
   */
  const createParameter = () => {
    parameterManagesDs.create();
    openModal(
      parameterManagesDs.current,
      intl.get('sdps.parameterManages.view.title.modal.create').d('创建参数配置')
    );
  };

  /**
   * 编辑参数配置
   * @param {Object} record ds行数据
   */
  const editParameter = record => {
    openModal(record, intl.get('sdps.parameterManages.view.title.modal.edit').d('编辑参数配置'));
  };

  /**
   * 禁用参数配置
   * @param {Object} record ds行数据
   */
  const disableParameter = record => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl.get('sdps.parameterManages.action.disable.sure').d('确定禁用参数配置?'),
      onOk: () => {
        record.set('enableFlag', 0);
        parameterManagesDs.submit().then(() => {
          parameterManagesDs.query();
        });
      },
    });
  };

  /**
   * 启用参数配置
   * @param {Object} record ds行数据
   */
  const enableParameter = record => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl.get('sdps.parameterManages.action.enable.sure').d('确定启用参数配置?'),
      onOk: () => {
        record.set('enableFlag', 1);
        parameterManagesDs.submit().then(() => {
          parameterManagesDs.query();
        });
      },
    });
  };

  /**
   * 表格列
   */
  const columns = [
    {
      name: 'parameterKey',
      width: 120,
    },
    {
      name: 'parameterName',
      width: 200,
    },
    {
      name: 'paramType',
      width: 150,
    },
    {
      name: 'dataType',
      width: 150,
    },
    {
      name: 'enableFlag',
      width: 100,
      renderer: ({ value }) => enableRender(value),
    },
    // 产品说去掉描述但是创建可以创建，表格不展示很奇怪，先暂时注释预留
    // {
    //   name: 'description',
    // },
    {
      name: 'createdBy',
      width: 150,
    },
    {
      name: 'creationDate',
      width: 150,
    },
    {
      name: 'lastUpdatedBy',
      width: 150,
    },
    {
      name: 'lastUpdateDate',
      width: 150,
    },
    {
      name: 'action',
      width: 120,
      renderer: ({ record }) => {
        return (
          <span className="action-link">
            {record.get('enableFlag') === 1 ? (
              <a onClick={() => disableParameter(record)}>
                {intl.get('hzero.common.status.disable').d('禁用')}
              </a>
            ) : (
              <>
                <a onClick={() => enableParameter(record)}>
                  {intl.get('hzero.common.status.enable').d('启用')}
                </a>
                <a onClick={() => editParameter(record)}>
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </a>
              </>
            )}
          </span>
        );
      },
    },
  ];

  /**
   * 批量导入
   */
  const handleUpload = () => {
    openTab({
      key: '/sdps/commentImport/SDPS.PARAMETER_MANAGE_IMPORT',
      search: queryString.stringify({
        key: '/sdps/commentImport/SDPS.PARAMETER_MANAGE_IMPORT',
        title: 'hzero.common.title.batchImport',
        action: intl.get('hzero.common.title.batchImport').d('批量导入'),
        auto: true,
      }),
    });
  };

  return (
    <React.Fragment>
      <Header title={intl.get('sdps.parameterManages.view.header.title').d('参数配置')}>
        <Button color="primary" onClick={() => createParameter('create')}>
          {intl.get('hzero.common.button.create').d('新建')}
        </Button>
        <Button onClick={handleUpload}>
          {intl.get('hzero.common.button.batchImport').d('批量导入')}
        </Button>
        <ReactExportButton
          btnText={intl.get(`sdps.parameterManages.view.button.export`).d('导出')}
          exportRequestUrl={exportRequestUrl}
          ds={parameterManagesDs}
        />
      </Header>
      <Content>
        <Table dataSet={parameterManagesDs} columns={columns} />
      </Content>
    </React.Fragment>
  );
}

export default formatterCollections({
  code: ['sdps.parameterManages'],
})(
  withProps(
    () => {
      const parameterManagesDs = new DataSet(getParameterManagesDs());
      const valueDs = {
        parameterManagesDs,
      };
      return { valueDs };
    },
    { cacheState: true, keepOriginDataSet: true }
  )(ParameterManages)
);
