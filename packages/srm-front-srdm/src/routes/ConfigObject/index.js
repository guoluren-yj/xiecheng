import { Header, Content } from 'components/Page';
import {
  Button,
  Table,
  DataSet,
  Form,
  TextField,
  NumberField,
  Modal,
  Select,
  Tooltip,
  Lov,
  Icon,
  Spin,
  TextArea,
} from 'choerodon-ui/pro';
import { Link } from 'dva/router';
import React from 'react';
import Component from '@htd/helper/lib/components/base-component';
import ComponentEnhanceWrapperHoc from '@htd/helper/lib/decorators/props-extension-hoc';
import request from 'utils/request';
import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import { Bind } from 'lodash-decorators';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { closeAndPush } from '@/utils/utils';
import { download } from '@/common/utils.js';
import { HZERO_SRDM } from '@/common/config';
import { configObjectExport } from '../../services/configObjectService';
import { initComponent, componentDidMount } from './pageLogic.js';
import { configRule, configObjectDSConfig, syncProductionDSConfig } from './extensionRule.js';
import getConfigObjectDSProps, { getSyncProductionDs } from './configObjectDS.js';
import styles from './index.less';

const jsonDiffPatch = require('../../utils/jsonDiffPatch.umd.min');

@formatterCollections({ code: ['hpdm.config-object', 'srdm.config-object'] })
@observer
@ComponentEnhanceWrapperHoc(configRule)
class Page extends Component {
  constructor(props) {
    super(props);
    this.setDs(
      'configObjectDS',
      new DataSet(configObjectDSConfig.bind(this)(getConfigObjectDSProps.bind(this)({})))
    );

    this.setDs(
      'syncProductionDS',
      new DataSet(syncProductionDSConfig.bind(this)(getSyncProductionDs.bind(this)({})))
    );
    initComponent.bind(this)();
  }

  @observable loading;

  componentDidMount() {
    this.loading = false;
    componentDidMount.bind(this)();
  }

  openModal(record, isNew) {
    let isCancel = false;
    Modal.open({
      drawer: true,
      header: null,
      children: (
        <Form
          record={record}
          useColon
          style={{ overflow: 'hidden' }}
          labelLayout="float"
          className={styles['config-object-form']}
        >
          <div className="modal-form-title">
            {intl.get('srdm.config-object.modal.title.basicInfo').d('基础信息')}
          </div>
          <TextField disabled={!isNew} name="objectCode" />
          <TextField name="objectName" />
          <TextField name="objectDesc" />
          <NumberField step={1} name="objectPriority" />
          <Select name="enabledFlag" />
          <Select name="multiCloudFlag" />
          <Select name="publicCloudFlag" />
          <Select name="pcMigrateMode" />
          <div className="modal-form-title">公有云[配置对象同步]展示行为</div>
          {!isNew && <Lov name="mainTable" />}
          {!isNew && <Select name="debugMode" />}
          {!isNew && <TextArea name="associateMainTableSql" resize="both" showHelp="newLine" />}
          <Select name="showObjectFldNameFlag" />
          <Select name="showGroup" searchable style={{ width: 'calc(100% - 50px)' }} noCache />
          <a
            onClick={() => {
              const originalValue = record.get('showGroup');
              Modal.open({
                title: '提示',
                children: (
                  <p>
                    <Link to={'/spfm/rel-table-access'}>点击跳转</Link>
                    至配置表"配置对象展示组"中维护。
                  </p>
                ),
                onOk: () => {
                  const { history } = this.props;
                  if (history) {
                    history.push('/spfm/rel-table-access');
                  }
                },
                onCancel: () => record.set('showGroup', originalValue),
              });
            }}
            style={{ transform: 'translate(440px, -44px)' }}
          >
            {intl.get('hzero.common.button.add').d('新增')}
          </a>
        </Form>
      ),
      onOk: async () => {
        if (await record.validate()) {
          await this.getDs('configObjectDS').submit();
          this.getDs('configObjectDS').query(this.getDs('configObjectDS').currentPage);
        } else {
          return false;
        }
      },
      onCancel: () => {
        this.getDs('configObjectDS').reset();
        isCancel = true;
      },
      afterClose: () => isCancel && isNew && this.getDs('configObjectDS').remove(record),
    });
  }

  openCheckModal(ds) {
    this.loading = true;
    request('/srdm/v1/hpdm-config-objects/validObject', {
      method: 'POST',
      body: ds.selected.map((item) => item.get('objectCode')),
    })
      .then((res) => {
        this.loading = true;
        if (getResponse(res)) {
          notification.success();
          ds.batchUnSelect(ds.selected);
        }
      })
      .then(() => {
        this.loading = false;
      });
  }

  diffStructure(ds) {
    this.loading = true;
    request(`/srdm/v1/hpdm-config-objects/table-structure-compare`, {
      method: 'POST',
      body: ds.selected.map((item) => item.get('objectCode')),
    })
      .then((res) => {
        notification[res.failed ? 'error' : 'success']({ message: res.message });
        this.loading = false;
        if (!res.failed) {
          ds.batchUnSelect(ds.selected);
        }
      })
      .then(() => {
        this.loading = false;
      });
  }

  syncProduction(ds) {
    const syncProductionDS = this.getDs('syncProductionDS');
    syncProductionDS.current.set({
      objectCodes: ds.selected.map((item) => item.get('objectCode')),
    });
    Modal.open({
      title: intl.get('srdm.config-object.button.sync.prd').d('同步配置到[配置平台生产环境'),
      children: (
        <Form record={syncProductionDS.current}>
          <TextField name="approverLoginName" readOnly />
          <TextField name="description" />
        </Form>
      ),
      onOk: async () => {
        const res = await syncProductionDS.submit();
        return res !== false;
      },
      afterClose: () => {
        ds.reset();
      },
    });
  }

  copyObject(ds) {
    const record = ds.selected[0];
    ds.getField('newObjectCode').set('required', true);
    Modal.open({
      title: intl.get('hzero.common.button.copy').d('复制'),
      children: (
        <Form record={record} labelLayout="float">
          <TextField name="objectCode" disabled />
          <TextField name="newObjectCode" />
        </Form>
      ),
      onOk: async () => {
        const newObjectCode = record.get('newObjectCode');
        const validate = await record.validate();
        if (validate && newObjectCode) {
          const res =
            (await request(
              `/srdm/v1/hpdm-config-objects/copy?objectCode=${record.get(
                'objectCode'
              )}&newObjectCode=${newObjectCode}`
            )) || {};
          notification[res.failed ? 'error' : 'success']({ message: res.message });
          return true;
        }
        return false;
      },
      afterClose: () => {
        ds.reset();
      },
    });
  }

  createConfigObject() {
    this.openModal(this.getDs('configObjectDS').create({}, 0), true);
  }

  editConfigObject(record) {
    this.openModal(record);
  }

  handleConfigTbl(record) {
    closeAndPush('/srdm/config-object-tbl/', {
      title: `${intl.get(`srdm.config-object.header.configTbl`).d('表配置')} ${record.get(
        'objectCode'
      )}`,
      key: `/srdm/config-object-tbl/${record.get('objectId')}`,
      path: `/srdm/config-object-tbl/${record.get('objectId')}`,
      icon: 'edit',
      closable: true,
    });
  }

  objectCompare(record) {
    const objectCode = record.get('objectCode');
    request(`${HZERO_SRDM}/v1/hpdm-config-objects/config-compare?objectCode=${objectCode}`).then(
      (res) => {
        const { target, origin, failed } = res;
        if (failed) {
          notification.error({ message: res.message });
          return;
        }
        if (jsonDiffPatch && origin && target) {
          const result = jsonDiffPatch.diff(origin, target);
          if (result === undefined) {
            notification.warning({
              message: '当前数据对比无差异',
            });
          } else {
            closeAndPush('/srdm/config-object-compare/', {
              title: `配置对象对比 ${objectCode}`,
              key: `/srdm/config-object-compare/${objectCode}`,
              path: `/srdm/config-object-compare/${objectCode}`,
              icon: 'edit',
              closable: true,
            });
          }
          return result;
        }
      }
    );
  }

  @Bind()
  saveUpload(node) {
    this.upload = node;
  }

  @Bind()
  async uploadSave(modal) {
    const res = await this.upload.startUpload();
    if (res && !res.failed) {
      notification.success();
    }
    modal.close();
  }

  render() {
    return (
      <Spin spinning={this.loading}>
        <Header
          data-hcg_flag="Header_a8fb4"
          title={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {intl.get('hpdm.config-object.header.message').d('配置对象定义')}
              <Tooltip placement="right" title="帮助手册">
                <Icon
                  style={{ marginLeft: 4, cursor: 'pointer' }}
                  type="help"
                  onClick={() => {
                    window.open(`${process.env.BASE_PATH || '/'}pub/config-object/help`);
                  }}
                />
              </Tooltip>
            </div>
          }
        >
          <Button
            data-hcg_flag="Button_a0b22"
            color="primary"
            disabled={false}
            onClick={() => {
              this.createConfigObject();
            }}
          >
            {intl.get('hpdm.config-object.button.create').d('新建')}
          </Button>
          <Button
            data-hcg_flag="Button_30fd7"
            color="primary"
            onClick={async () => {
              if (this.getDs('configObjectDS').selected.length > 0) {
                // 调用接口
                const res = getResponse(
                  await configObjectExport({
                    moduleName: 'config-object',
                    configObjectList: this.getDs('configObjectDS').selected.map((item) =>
                      item.toData()
                    ),
                  })
                );
                if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                  // for IE
                  window.navigator.msSaveOrOpenBlob(res, 'config-object');
                } else {
                  // for Non-IE (chrome, firefox etc.)
                  const url = window.URL.createObjectURL(res);
                  download(url, 'config-object');
                }
              } else {
                notification.info({
                  message: intl.get(`hpdm.config-object.select.one`).d('请选择一条记录'),
                });
                return false;
              }
            }}
          >
            {intl.get('hpdm.config-object.button.export').d('导出')}
          </Button>
          <Button
            disabled={this.getDs('configObjectDS').selected.length === 0}
            onClick={() => this.openCheckModal(this.getDs('configObjectDS'))}
          >
            {intl.get('srdm.config-object.button.config.check').d('配置校验')}
          </Button>
          <Button
            disabled={this.getDs('configObjectDS').selected.length === 0}
            onClick={() => this.diffStructure(this.getDs('configObjectDS'))}
          >
            {intl.get('srdm.config-object.button.table.diff').d('表结构对比')}
          </Button>
          <Button
            disabled={this.getDs('configObjectDS').selected.length === 0}
            onClick={() => this.syncProduction(this.getDs('configObjectDS'))}
          >
            {intl.get('srdm.config-object.button.sync.prd').d('同步配置到[配置平台生产环境')}
          </Button>
          <Button
            disabled={this.getDs('configObjectDS').selected.length !== 1}
            onClick={() => this.copyObject(this.getDs('configObjectDS'))}
          >
            {intl.get('hzero.common.button.copy').d('复制')}
          </Button>
        </Header>
        <Content data-hcg_flag="Content_536a0">
          <Table
            data-hcg_flag="Table_f8695"
            rowNumber={false}
            queryFieldsLimit={3}
            queryBar="professionalBar"
            columnResizable
            columnTitleEditable
            columnDraggable
            editMode="cell"
            customizable={false}
            customizedCode="Table_f8695"
            border
            columns={[
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'objectCode',
                width: 150,
                type: 'string',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'objectName',
                width: 150,
                type: 'string',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                width: 200,
                name: 'objectDesc',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                width: 150,
                name: 'objectPriority',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'enabledFlag',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'userName',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'publicCloudFlag',
              },
              {
                hideable: true,
                titleEditable: true,
                name: 'showObjectFldNameFlag',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'multiCloudFlag',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'checkoutFlag',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'mainTableName',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'showGroup',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                width: 150,
                name: 'creationDate',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'lastUpdateByName',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                width: 150,
                name: 'lastUpdateDate',
              },
              {
                header: intl.get('hpdm.config-object.title.operation').d('操作'),
                width: 200,
                lock: 'right',
                command: ({ record }) => {
                  return [
                    <a onClick={() => this.editConfigObject(record)}>
                      {intl.get('hpdm.config-object.operation.edit').d('编辑')}
                    </a>,
                    <a onClick={() => this.handleConfigTbl(record)}>
                      {intl.get('srdm.config-object.header.configTbl').d('表配置')}
                    </a>,
                    <a onClick={() => this.objectCompare(record)}>配置对象对比</a>,
                  ];
                },
              },
            ]}
            buttons={[]}
            dataSet={this.getDs('configObjectDS')}
          />
        </Content>
      </Spin>
    );
  }
}

export default Page;
