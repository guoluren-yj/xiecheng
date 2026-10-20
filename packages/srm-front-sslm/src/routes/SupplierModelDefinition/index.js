/*
 * SupplierModelDefinition - 供应商模型定义
 * @date: 2020/10/27 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import {
  DataSet,
  Button,
  Modal,
  Table,
  notification,
  Form,
  Lov,
  Select,
  CheckBox,
  NumberField,
  TextField,
} from 'choerodon-ui/pro';
import { Bind, Debounce } from 'lodash-decorators';
import { isEmpty, isArray } from 'lodash';

import intl from 'utils/intl';
import withProps from 'utils/withProps';
import formatterCollections from 'utils/intl/formatterCollections';
import { Content, Header } from 'components/Page';
import { yesOrNoRender } from 'utils/renderer';
import { getResponse } from 'utils/utils';

import { saveHeader } from '@/services/supplierModelDefinitionService';
import { queryRelTableConfig } from '@/services/dynamicTableService';
import FieldMappingModal from './FieldMappingModal';
import { ModelDefineDS } from './stores';

/**
 * 供应商模型定义
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} investigationTemDefineOrg - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({ code: ['sslm.supplierModelDefine', 'sslm.common'] })
@withProps(
  () => {
    const modelDefineDS = new DataSet({
      ...ModelDefineDS(),
    });
    return {
      modelDefineDS,
    };
  },
  { cacheState: true }
)
export default class SupplierModelDefinition extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.props.modelDefineDS.query();
  }

  @Bind()
  getColumns() {
    const columns = [
      {
        name: 'orderField',
        align: 'left',
      },
      {
        name: 'tableName',
      },
      {
        name: 'targetPage',
      },
      {
        name: 'pageRelationField',
      },
      {
        name: 'dataSource',
      },
      {
        name: 'target',
      },
      {
        name: 'fieldMapping',
        renderer: ({ record }) => {
          if (record.get('modelSettingId') && record.get('enabledFlag')) {
            return (
              <a onClick={() => this.openFieldMappingModal(record)}>
                {intl.get(`sslm.supplierModelDefine.model.define.maintain`).d('维护')}
              </a>
            );
          } else {
            return (
              <a style={{ color: 'gray' }}>
                {intl.get(`sslm.supplierModelDefine.model.define.maintain`).d('维护')}
              </a>
            );
          }
        },
      },
      {
        name: 'enabledFlag',
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'cuzTabCode',
      },
      {
        name: 'editorFlag',
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'addButtonFlag',
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'saveButtonFlag',
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'deleteButtonFlag',
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'operate',
        align: 'center',
        renderer: ({ record }) => {
          return (
            <span className="action-link">
              <a onClick={() => this.handleOpenModal(false, record)}>
                {intl.get(`hzero.common.button.edit`).d('编辑')}
              </a>
            </span>
          );
        },
      },
    ];
    return columns;
  }

  /**
   * 字段映射
   */
  @Debounce(200)
  @Bind()
  openFieldMappingModal(record) {
    const dataProps = {
      currentRecord: record,
      onRef: ref => {
        this.dataSourcesModal = ref;
      },
    };

    Modal.open({
      title: intl.get(`sslm.supplierModelDefine.model.define.fieldMapping`).d('字段映射'),
      drawer: true,
      okText: intl.get('hzero.common.button.sure').d('确定'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      closable: true,
      style: { width: 700 },
      children: <FieldMappingModal {...dataProps} />,
      onOk: () => {
        return this.dataSourcesModal.handleSave();
      },
    });
  }

  /**
   * 新建/修改数据
   */
  @Bind()
  handleOpenModal(isCreate = false, currentRow = undefined) {
    const { modelDefineDS } = this.props;
    if (isCreate) {
      modelDefineDS.create({}, 0);
    }
    const currentRecord = currentRow || modelDefineDS.current;
    Modal.open({
      key: Modal.key(),
      closable: true,
      movable: false,
      destroyOnClose: true,
      drawer: true,
      style: { width: 480 },
      title: intl
        .get('sslm.supplierModelDefine.view.title.supplierModelDefine')
        .d('供应商模型维护'),
      children: (
        <Form record={currentRecord} labelLayout="float">
          <NumberField name="orderField" />
          <Lov name="tableCodeLov" />
          ,
          <Select name="targetPage" />
          <TextField name="pageRelationField" restrict="a-z,A-Z,0-9" />
          <Select name="dataSource" />
          <Select name="target" />
          <TextField name="cuzTabCode" restrict="a-z,A-Z,0-9" />
          <CheckBox name="enabledFlag" />
          <CheckBox name="editorFlag" />
          <CheckBox name="addButtonFlag" />
          <CheckBox name="saveButtonFlag" />
          <CheckBox name="deleteButtonFlag" />
        </Form>
      ),
      onOk: async () => {
        if (modelDefineDS.dirty) {
          const validateFlag = await currentRecord.validate();
          let modalCloseFlag = false;
          if (validateFlag) {
            const data = currentRecord.toJSONData();
            // 先查询配置表配置
            const { tableCode } = data;
            const result = await queryRelTableConfig({ tableCode });
            if (getResponse(result)) {
              if (isArray(result.content) && !isEmpty(result.content)) {
                const tableObj = result.content[0] || {};
                const { mappingInfo: { definitionList = [] } = {} } = tableObj;
                // 保存
                const payload = [
                  {
                    ...data,
                    definitionList,
                  },
                ];
                const res = await saveHeader(payload);
                if (getResponse(res)) {
                  modalCloseFlag = true;
                  modelDefineDS.query();
                }
              } else {
                notification.warning({
                  placement: 'bottomRight',
                  message: intl
                    .get('sslm.supplierModelDefine.view.message.tableNonExistent')
                    .d('配置表不存在!'),
                });
              }
            }
            return modalCloseFlag;
          } else {
            notification.warning({
              placement: 'bottomRight',
              message: intl.get('sslm.common.view.message.maintainInfo').d('请维护相关信息！'),
            });
            return false;
          }
        } else {
          notification.warning({
            placement: 'bottomRight',
            message: intl.get('sslm.common.view.message.noNeedSaveData').d('暂无需要保存的数据！'),
          });
          return false;
        }
      },
      onCancel: () => {
        if (isCreate) {
          modelDefineDS.remove(currentRecord);
        } else {
          // 如果为已保存的数据，取消时则重置为以前数据
          currentRecord.reset();
        }
      },
    });
  }

  render() {
    const { modelDefineDS } = this.props;
    return (
      <React.Fragment>
        <Header
          title={intl
            .get(`sslm.supplierModelDefine.view.title.supplierModelDefine`)
            .d('供应商模型定义')}
        >
          <Button color="dark" icon="add" onClick={() => this.handleOpenModal(true)}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <Table dataSet={modelDefineDS} columns={this.getColumns()} queryFieldsLimit={3} />
        </Content>
      </React.Fragment>
    );
  }
}
