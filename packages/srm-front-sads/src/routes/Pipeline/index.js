import React, { Component } from 'react';
import classNames from 'classnames';
import { Bind } from 'lodash-decorators';
import { Tag, Tabs, Modal as _Modal } from 'choerodon-ui';
import { Table, DataSet, Modal, Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import { Button as ButtonPermission } from 'components/Permission';

import styles from './index.less';

import {
  ConfigurationListDS,
  ConfigurationFormDS,
  RelaInputSourceListDS,
  RelaOutputSourceListDS,
} from './stores/PipelineConfigurationListDS';
import { InputSourceDS } from './stores/InputSourceDS';
import { OutputSourceListDS } from './stores/OutputSourceDS';
import EditPipelConfigForm from './components/EditPipelConfigForm';
import InputSourceForm from './components/InputSourceForm';
import OutputSourceForm from './components/OutputSourceForm';
import { enabledConfigTag, enabledInputTag, enabledOutputTag } from '../../services/pipel';

const { TabPane } = Tabs;

const modalKey1 = Modal.key();
const modalKey2 = Modal.key();
const modalKey3 = Modal.key();

@formatterCollections({ code: ['sads.indexcongig', 'sads.pipel', 'sads.dataSchedule'] })
export default class PipelineConfiguration extends Component {
  configurationListDS = new DataSet({ ...ConfigurationListDS(), autoQuery: true });

  configurationFormDS = null;

  inputSourceListDS = new DataSet({ ...InputSourceDS(), autoQuery: true });

  outputSourceListDS = new DataSet({ ...OutputSourceListDS(), autoQuery: true });

  constructor() {
    super();
    this.state = {
      currentTab: '1',
    };
  }

  changeTab = (key) => {
    this.setState({
      currentTab: key,
    });
  };

  openModal(record) {
    const { currentTab } = this.state;
    switch (currentTab) {
      case '1':
        this.openPipelineModal(record);
        break;
      case '2':
        this.openInputSourceModal(record);
        break;
      case '3':
        this.OpenOutputSourceModal(record);
        break;
      default:
        this.openPipelineModal(record);
    }
  }

  @Bind()
  getConfiguratioColumns() {
    return [
      {
        name: 'pipelineCode',
        width: 150,
        lock: 'left',
      },
      {
        name: 'pipelineName',
        width: 150,
      },
      {
        name: 'remark',
        width: 200,
      },
      {
        name: 'inputSourceList',
        minWidth: 250,
        renderer: ({ record }) => {
          const inputSourceList = record.get('inputSourceList');
          const node = inputSourceList.map((item) => (
            <Tag className={styles['list-c7n-tag']} key={item.inputSourceId}>
              {item.inputSourceName}
            </Tag>
          ));
          return <span onClick={() => this.openRelationInputSourceListModal(record)}>{node}</span>;
        },
      },
      {
        name: 'outputSourceList',
        minWidth: 250,
        renderer: ({ record }) => {
          const outputSourceList = record.get('outputSourceList');
          const node = outputSourceList.map((item) => (
            <Tag className={styles['list-c7n-tag']} key={item.outputSourceId}>
              {item.outputSourceName}
            </Tag>
          ));
          return <span onClick={() => this.openRelationOutputSourceListModal(record)}>{node}</span>;
        },
      },
      {
        name: 'enabledFlag',
        width: 100,
        align: 'center',
        renderer: ({ value, text }) => (
          <Tag
            className={classNames(
              styles['list-normal-tag'],
              value ? styles['success-tag'] : styles['warning-tag']
            )}
          >
            {text}
          </Tag>
        ),
      },
      {
        name: 'operation',
        header: intl.get(`hzero.common.action`).d('操作'),
        width: 120,
        align: 'center',
        lock: 'right',
        renderer: ({ record }) => {
          const enabledFlag = record.get('enabledFlag');
          return (
            <span className="action-link">
              <ButtonPermission type="text" onClick={() => this.openModal(record)}>
                {intl.get('hzero.common.edit').d('编辑')}
              </ButtonPermission>
              <ButtonPermission type="text" onClick={() => this.updateConfigStatus(record)}>
                {enabledFlag
                  ? intl.get(`hzero.common.button.unEnabled`).d('禁用')
                  : intl.get(`hzero.common.button.enabled`).d('启用')}
              </ButtonPermission>
            </span>
          );
        },
      },
    ];
  }

  @Bind()
  getInputSourceColumns() {
    return [
      {
        name: 'inputSourceCode',
        width: 150,
        lock: 'left',
      },
      {
        name: 'inputSourceName',
        minWidth: 150,
      },
      {
        name: 'remark',
        minWidth: 200,
      },
      {
        name: 'pipelineConfig',
        minWidth: 200,
      },
      {
        name: 'tenantName',
        minWidth: 150,
      },
      {
        name: 'enabledFlag',
        width: 100,
        align: 'center',
        renderer: ({ value, text }) => (
          <Tag
            className={classNames(
              styles['list-normal-tag'],
              value ? styles['success-tag'] : styles['warning-tag']
            )}
          >
            {text}
          </Tag>
        ),
      },
      {
        name: 'operation',
        header: intl.get(`hzero.common.action`).d('操作'),
        width: 150,
        align: 'center',
        lock: 'right',
        renderer: ({ record }) => {
          const enabledFlag = record.get('enabledFlag');
          return (
            <span className="action-link">
              <ButtonPermission type="text" onClick={() => this.viewInputSource(record)}>
                {intl.get(`hzero.common.button.view`).d('查看')}
              </ButtonPermission>
              <ButtonPermission type="text" onClick={() => this.edit(record)}>
                {intl.get('hzero.common.edit').d('编辑')}
              </ButtonPermission>
              <ButtonPermission type="text" onClick={() => this.updateInputStatus(record)}>
                {enabledFlag
                  ? intl.get(`hzero.common.button.unEnabled`).d('禁用')
                  : intl.get(`hzero.common.button.enabled`).d('启用')}
              </ButtonPermission>
            </span>
          );
        },
      },
    ];
  }

  @Bind()
  getOutputSourceColumns() {
    return [
      {
        name: 'outputSourceCode',
        width: 150,
        lock: 'left',
      },
      {
        name: 'outputSourceName',
        minWidth: 150,
      },
      {
        name: 'remark',
        minWidth: 200,
      },
      {
        name: 'pipelineConfig',
        minWidth: 200,
      },
      {
        name: 'indexName',
        width: 150,
      },
      {
        name: 'indexIdWildcard',
        width: 150,
      },
      {
        name: 'enabledFlag',
        width: 90,
        align: 'center',
        renderer: ({ value, text }) => (
          <Tag
            className={classNames(
              styles['list-normal-tag'],
              value ? styles['success-tag'] : styles['warning-tag']
            )}
          >
            {text}
          </Tag>
        ),
      },
      {
        name: 'operation',
        header: intl.get(`hzero.common.action`).d('操作'),
        width: 150,
        align: 'center',
        lock: 'right',
        renderer: ({ record }) => {
          const enabledFlag = record.get('enabledFlag');
          return (
            <span className="action-link">
              <ButtonPermission type="text" onClick={() => this.OpenOutputSourceModal(record)}>
                {intl.get('hzero.common.edit').d('编辑')}
              </ButtonPermission>
              <ButtonPermission type="text" onClick={() => this.updateOutputStatus(record)}>
                {enabledFlag
                  ? intl.get(`hzero.common.button.unEnabled`).d('禁用')
                  : intl.get(`hzero.common.button.enabled`).d('启用')}
              </ButtonPermission>
            </span>
          );
        },
      },
    ];
  }

  @Bind()
  getRelaInputSourceColumns() {
    return [
      {
        name: 'inputSourceCode',
        width: 100,
        lock: 'left',
      },
      {
        name: 'inputSourceName',
        width: 150,
      },
      {
        name: 'remark',
        width: 200,
      },
    ];
  }

  @Bind()
  getRelaOutputSourceColumns() {
    return [
      {
        name: 'outputSourceCode',
        width: 100,
        lock: 'left',
      },
      {
        name: 'outputSourceName',
        width: 150,
      },
      {
        name: 'remark',
        width: 200,
      },
    ];
  }

  @Bind()
  viewInputSource(record) {
    if (record) {
      record.setState('operation', 'view');
    }
    this.openModal(record);
  }

  @Bind()
  edit(record) {
    _Modal.confirm({
      title: intl.get('sads.pipel.view.title.isUpdate').d('确认修改'),
      content: intl
        .get('sads.pipel.view.modal.edit.title')
        .d('修改输入源，将会禁用所有该输入源的定时任务哦'),
      onOk: () => {
        if (record) {
          record.setState('operation', 'edit');
        }
        this.openModal(record);
      },
    });
  }

  @Bind()
  handCancelInputModal(formRecord) {
    const inputSourceId = formRecord.get('inputSourceId');
    if (!inputSourceId) {
      this.inputSourceListDS.remove(formRecord);
    }
    if (this.inputSourceListDS.current) {
      this.inputSourceListDS.current.reset();
    }
    return true;
  }

  @Bind()
  handCancelOutputModal(formRecord) {
    const outputSourceId = formRecord.get('outputSourceId');
    if (!outputSourceId) {
      this.outputSourceListDS.remove(formRecord);
    } else if (this.outputSourceListDS.current) {
      this.outputSourceListDS.current.reset();
    }

    return true;
  }

  @Bind()
  async updateConfigStatus(record) {
    const preEnabledFlag = record.get('enabledFlag');
    const newEnabledFlag = Number(!preEnabledFlag);
    const res = await enabledConfigTag([{ ...record.toData(), enabledFlag: newEnabledFlag }]);
    if (getResponse(res)) {
      this.configurationListDS.query(this.configurationListDS.currentPage);
    }
  }

  @Bind()
  async updateInputStatus(record) {
    const preEnabledFlag = record.get('enabledFlag');
    const newEnabledFlag = Number(!preEnabledFlag);
    const res = await enabledInputTag({ ...record.toData(), enabledFlag: newEnabledFlag });
    if (getResponse(res)) {
      this.inputSourceListDS.query(this.inputSourceListDS.currentPage);
    }
  }

  @Bind()
  async updateOutputStatus(record) {
    const preEnabledFlag = record.get('enabledFlag');
    const newEnabledFlag = Number(!preEnabledFlag);
    const res = await enabledOutputTag({ ...record.toData(), enabledFlag: newEnabledFlag });
    if (getResponse(res)) {
      this.outputSourceListDS.query(this.outputSourceListDS.currentPage);
    }
  }

  @Bind()
  async handleSavePipelCongig() {
    const valid = await this.configurationFormDS.current.validate();
    if (!valid) {
      return false;
    }
    const res = await this.configurationFormDS.submit();
    if (getResponse(res)) {
      this.configurationFormDS.removeAll();
      this.configurationListDS.query(this.configurationListDS.currentPage);
    } else {
      return false;
    }
    return true;
  }

  @Bind()
  async handleSaveInputSource() {
    const valid = await this.inputSourceListDS.current.validate();
    if (!valid) {
      return false;
    }
    const res = await this.inputSourceListDS.submit();
    if (getResponse(res)) {
      this.inputSourceListDS.removeAll();
      this.inputSourceListDS.query(this.inputSourceListDS.currentPage);
    }
    return true;
  }

  @Bind()
  async handleSaveOutputSource() {
    const valid = await this.outputSourceListDS.current.validate();
    if (!valid) {
      return false;
    }
    const res = await this.outputSourceListDS.submit();
    if (getResponse(res)) {
      this.outputSourceListDS.removeAll();
      this.outputSourceListDS.query(this.outputSourceListDS.currentPage);
    } else {
      return false;
    }
    return true;
  }

  /**
   * 管道配置列表
   * @param {*} record
   */
  @Bind
  openPipelineModal(record) {
    this.configurationFormDS = new DataSet({ ...ConfigurationFormDS(), autoQuery: false });
    const formRecord = record
      ? this.configurationFormDS.create({ ...record.toData() })
      : this.configurationFormDS.create();
    const modalTitle = record
      ? intl.get('sads.pipel.view.modal.edit').d('编辑管道配置')
      : intl.get('sads.pipel.view.modal.create').d('新建管道配置');
    const modalProperties = {
      title: modalTitle,
      drawer: true,
      closable: true,
      style: {
        width: 380,
      },
      key: modalKey1,
      children: <EditPipelConfigForm record={formRecord} />,
      onCancel: () => {
        this.configurationFormDS.remove(formRecord);
        return true;
      },
      onClose: () => {
        this.configurationFormDS.remove(formRecord);
        return true;
      },
      onOk: () => this.handleSavePipelCongig(),
    };
    Modal.open(modalProperties);
  }

  /**
   * 输入源列表
   * @param {*} record
   */
  @Bind
  openInputSourceModal(record) {
    const operation = record && record.getState('operation');
    const formRecord = record || this.inputSourceListDS.create();
    let modalTitle = record
      ? intl.get('sads.pipel.view.modal.input.edit').d('编辑输入源配置')
      : intl.get('sads.pipel.view.modal.input.create').d('新建输入源配置');
    if (operation === 'view') {
      modalTitle = intl.get('sads.pipel.view.modal.input.view').d('查看输入源配置');
    }
    const modalProperties = {
      title: modalTitle,
      drawer: true,
      closable: true,
      style: {
        width: 380,
      },
      key: modalKey1,
      children: <InputSourceForm record={formRecord} operation={operation} />,
      onCancel: () => {
        this.handCancelInputModal(formRecord);
      },
      onClose: () => {
        this.handCancelInputModal(formRecord);
      },
      onOk: () => this.handleSaveInputSource(),
    };
    Modal.open(modalProperties);
  }

  /**
   * 输出源列表
   * @param {*} record
   */
  @Bind
  OpenOutputSourceModal(record) {
    const codeEnabled = !!record;
    const formRecord = record || this.outputSourceListDS.create();
    const modalTitle = record
      ? intl.get('sads.pipel.view.modal.output.edit').d('编辑输出源配置')
      : intl.get('sads.pipel.view.modal.output.create').d('新建输出源配置');
    const modalProperties = {
      title: modalTitle,
      drawer: true,
      closable: true,
      style: {
        width: 380,
      },
      key: modalKey3,
      children: <OutputSourceForm record={formRecord} codeEnabled={codeEnabled} />,
      onCancel: () => {
        this.handCancelOutputModal(formRecord);
      },
      onClose: () => {
        this.handCancelOutputModal(formRecord);
      },
      onOk: () => this.handleSaveOutputSource(),
    };
    Modal.open(modalProperties);
  }

  /**
   * 关联输入源列表
   */
  @Bind
  openRelationInputSourceListModal(record) {
    const relaInputSourceListDS = new DataSet({ ...RelaInputSourceListDS(), autoQuery: true });
    const pipelineId = record.get('pipelineId');
    relaInputSourceListDS.setQueryParameter('pipelineId', pipelineId);
    const modalProperties = {
      title: intl.get('sads.pipel.view.modal.input.list').d('关联输入源列表'),
      drawer: true,
      closable: true,
      style: {
        width: 600,
      },
      key: modalKey2,
      children: (
        <Table
          columns={this.getRelaInputSourceColumns()}
          dataSet={relaInputSourceListDS}
          queryFieldsLimit={2}
        />
      ),
      footer: null,
    };
    Modal.open(modalProperties);
  }

  /**
   * 关联输出源列表
   */
  @Bind
  openRelationOutputSourceListModal(record) {
    const relaOutputSourceListDS = new DataSet({ ...RelaOutputSourceListDS(), autoQuery: true });
    const pipelineId = record.get('pipelineId');
    relaOutputSourceListDS.setQueryParameter('pipelineId', pipelineId);
    const modalProperties = {
      title: intl.get('sads.pipel.view.modal.output.list').d('关联输出源列表'),
      drawer: true,
      closable: true,
      style: {
        width: 600,
      },
      key: modalKey2,
      children: (
        <Table
          columns={this.getRelaOutputSourceColumns()}
          dataSet={relaOutputSourceListDS}
          queryFieldsLimit={2}
        />
      ),
      footer: null,
    };
    Modal.open(modalProperties);
  }

  render() {
    return (
      <>
        <Header title={intl.get('sads.pipel.view.header.title').d('管道数据配置')}>
          <Button color="primary" icon="add" onClick={() => this.openModal()}>
            {intl.get('hzero.common.button.new').d('新建')}
          </Button>
        </Header>
        <Content>
          <Tabs animated={false} defaultActiveKey={this.state.currentTab} onChange={this.changeTab}>
            <TabPane tab={intl.get('sads.pipel.view.tab.pipel.name').d('管道配置列表')} key="1">
              <Table
                columns={this.getConfiguratioColumns()}
                dataSet={this.configurationListDS}
                queryFieldsLimit={3}
              />
            </TabPane>
            <TabPane tab={intl.get('sads.pipel.view.tab.input.name').d('输入源配置列表')} key="2">
              <Table
                columns={this.getInputSourceColumns()}
                dataSet={this.inputSourceListDS}
                queryFieldsLimit={3}
              />
            </TabPane>
            <TabPane tab={intl.get('sads.pipel.view.tab.output.name').d('输出源配置列表')} key="3">
              <Table
                columns={this.getOutputSourceColumns()}
                dataSet={this.outputSourceListDS}
                queryFieldsLimit={3}
              />
            </TabPane>
          </Tabs>
        </Content>
      </>
    );
  }
}
