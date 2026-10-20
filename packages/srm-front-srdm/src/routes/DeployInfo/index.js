import { Header, Content } from 'components/Page';
import { Bind } from 'lodash-decorators';
import { Popconfirm } from 'choerodon-ui';
import {
  Button,
  Table,
  DataSet,
  Modal,
  Form,
  TextArea,
  Select,
  TextField,
  CheckBox,
  DateTimePicker,
} from 'choerodon-ui/pro';
import React from 'react';
import moment from 'moment';
import Component from '@htd/helper/lib/components/base-component';
import ComponentEnhanceWrapperHoc from '@htd/helper/lib/decorators/props-extension-hoc';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import request from 'utils/request';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import { isAdministrator, isLeader, closeAndPush, isUpgrader } from '@/utils/utils';
import { initComponent, componentDidMount } from './pageLogic.js';
import { configRule, deployInfoDSConfig } from './extensionRule.js';
import getDeployInfoDSProps, {
  getExportAndImportDs,
  getExportByIssueNum,
  getExportAndImportDsNew,
} from './deployInfoDS.js';
import {
  deployInfoExport,
  deployInfoExportByIssueNum,
  deployInfoExportTest,
  deployInfoImport,
  deployInfoImportNew,
} from '../../services/deployInfoService';

@formatterCollections({
  code: ['hpdm.deploy-info', 'hpdm.data-distribute', 'srdm.deploy', 'srdm.deploy-rec'],
})
@observer
@ComponentEnhanceWrapperHoc(configRule)
class Page extends Component {
  @observable deployMode;

  constructor(props) {
    super(props);
    this.setDs(
      'deployInfoDS',
      new DataSet(deployInfoDSConfig.bind(this)(getDeployInfoDSProps.bind(this)({})))
    );
    initComponent.bind(this)();
  }

  componentDidMount() {
    componentDidMount.bind(this)();
    request('/srdm/v1/hpdm-config-deploy-infos/current-deploy-env').then((res) => {
      if (res && res.deployMode) {
        this.deployMode = res.deployMode;
      }
    });
  }

  openModal(record, isNew) {
    let isCancel = false;
    Modal.open({
      drawer: true,
      children: (
        <Form record={record} useColon labelLayout="float">
          <TextField disabled={!isNew} name="deployNum" />
          <TextField disabled={!isNew} name="issueNum" />
          <Select disabled={!isNew} name="cloudType" />
          <TextField disabled={!isNew} name="iterationNum" />
          <Select name="enabledFlag" />
          <Select name="approveStatus" />
          <TextField name="deployDesc" />
          <TextArea resize="both" name="comments" />
          <CheckBox name="blacklistFlag" />
        </Form>
      ),
      onOk: async () => {
        if (await record.validate()) {
          await this.getDs('deployInfoDS').submit();
          this.getDs('deployInfoDS').query(this.getDs('deployInfoDS').currentPage);
        } else {
          return false;
        }
      },
      onCancel: () => {
        this.getDs('deployInfoDS').reset();
        isCancel = true;
      },
      afterClose: () => isCancel && isNew && this.getDs('deployInfoDS').remove(record),
    });
  }

  editHandler(record) {
    this.openModal(record);
  }

  handleDeployRec(record) {
    closeAndPush('/srdm/deploy-rec/', {
      title: `${intl.get(`hpdm.deploy-info.header.deployRec`).d('发版记录')} ${record.get(
        'deployNum'
      )}`,
      key: `/srdm/deploy-rec/${record.get('deployInfoId')}`,
      path: `/srdm/deploy-rec/${record.get('deployInfoId')}`,
      icon: 'edit',
      closable: true,
    });
  }

  @Bind()
  saveUpload(node) {
    this.upload = node;
  }

  @Bind()
  async uploadSave(modal, environmentDS) {
    if (await environmentDS.validate()) {
      const res = await this.upload.startUpload();
      if (res && !res.failed) {
        notification.success({
          message: intl.get(`hpdm.deploy-info.process.deal`).d('请查看流程处理'),
        });
      }
      modal.close();
    }
  }

  @Bind()
  async deployInfoImport(isExport = true) {
    const environmentDS = new DataSet(getExportAndImportDs(isExport));
    const record = environmentDS.create(
      isExport ? { deployNum: moment().format('YYYY.MMDD.HHmss') } : {}
    );
    Modal.open({
      title: isExport
        ? intl.get('srdm.deploy.button.export').d('多云导出')
        : intl.get('srdm.deploy.button.import').d('多云导入'),
      destroyOnClose: true,
      closable: true,
      children: (
        <Form record={record} labelLayout="float">
          <TextField name="deployNum" />
          {isExport && <Select name="checkoutFlag" />}
          {isExport && <Select name="iterationNumObject" />}
          {isExport && <Select name="tenantNum" noCache />}
          <TextArea name="comments" />
          {!isExport && <TextField name="skipStages" />}
        </Form>
      ),
      onOk: async () => {
        if (await environmentDS.current.validate()) {
          const data = environmentDS.current.toData();
          const res = isExport
            ? (await deployInfoExport(data)) || {}
            : (await deployInfoImport(data)) || {};
          if (res) {
            notification[res.failed ? 'error' : 'success']({ message: res.message });
          }
        } else {
          return false;
        }
      },
    });
  }

  @Bind()
  async deployInfoImportOther() {
    const environmentDS = new DataSet({
      fields: [
        {
          type: 'string',
          name: 'deployNum',
          label: intl.get('srdm.deploy.model.deployNum').d('多云发版批次号'),
          required: true,
        },
      ],
    });
    const record = environmentDS.create();
    Modal.open({
      title: intl.get('srdm.deploy.button.import1').d('多云紧急导入'),
      destroyOnClose: true,
      closable: true,
      children: (
        <Form record={record} labelLayout="float">
          <TextField name="deployNum" />
        </Form>
      ),
      onOk: async () => {
        if (await environmentDS.current.validate()) {
          const deployNum = environmentDS.current.get('deployNum');
          const res = await deployInfoImportNew({
            deployNum,
            checkoutFlag: '0',
            skipStages:
              'DB,DML_SQL,SQL_INIT,REL_TABLE_RECORD,SHELL_SQL,FINAL_SQL_INIT,RESOURCE_UPLOAD_INIT,JOB_CLEAN,JOB_ACTIVE,ASSIGN_TENANT_MENU_AUTH,FIX_BUTTON_PERMISSION,INTERFACE_API,MALL_CHECKOUT',
            lightWeightFlag: true,
          });
          if (getResponse(res)) {
            notification.success();
          }
        } else {
          return false;
        }
      },
    });
  }

  @Bind()
  async deployInfoImportNew() {
    const environmentDS = new DataSet(getExportAndImportDsNew());
    const record = environmentDS.create({
      deployNum: moment().format('YYYY.MMDD.HHmss'),
    });
    Modal.open({
      title: intl.get('srdm.deploy.button.export.new').d('海外公有云导出'),
      destroyOnClose: true,
      closable: true,
      children: (
        <Form record={record} labelLayout="float">
          <TextField name="deployNum" />
          <Select name="iterationNumObject" />
          <Select name="tenantNum" noCache />
          <DateTimePicker name="scanStartDate" noCache />
          <TextArea name="comments" />
        </Form>
      ),
      onOk: async () => {
        if (await environmentDS.current.validate()) {
          const data = {
            ...environmentDS.current.toData(),
            jpAwsFlag: 1,
            checkoutFlag: 0,
            exportSupFlag: 0,
          };
          const res = await deployInfoExport(data);
          if (res) {
            notification[res.failed ? 'error' : 'success']({ message: res.message });
          }
        } else {
          return false;
        }
      },
    });
  }

  @Bind()
  async deployInfoImportByIssueNum(isExport = true) {
    const environmentDS = new DataSet(getExportByIssueNum());
    const record = environmentDS.create(
      isExport ? { deployNum: moment().format('YYYY.MMDD.HHmss') } : {}
    );
    Modal.open({
      title: '多云导出(按照需求号)',
      destroyOnClose: true,
      closable: true,
      children: (
        <Form record={record} labelLayout="float">
          <TextField name="deployNum" />
          <Select name="tenantNum" noCache />
          <TextField name="issueNum" />
          <TextArea name="comments" />
        </Form>
      ),
      onOk: async () => {
        if (await environmentDS.current.validate()) {
          const data = environmentDS.current.toData();
          const res = await deployInfoExportByIssueNum(data);
          notification[res.failed ? 'error' : 'success']({ message: res.message });
        } else {
          return false;
        }
      },
    });
  }

  configDataHandler(record) {
    closeAndPush('/srdm/deploy-dist/', {
      title: `${intl.get('hpdm.deploy-info.operation.data-config').d('配置数据')} ${record.get(
        'deployNum'
      )}`,
      key: `/srdm/deploy-dist/${record.get('deployInfoId')}`,
      path: `/srdm/deploy-dist/${record.get('deployInfoId')}`,
      icon: 'edit',
      closable: true,
    });
  }

  cancelAsyncHandler(deployNum) {
    request(`/srdm/v1/hpdm-config-deploy-infos/revoke/${deployNum}`).then((res = {}) => {
      if (res) {
        notification[res.failed ? 'error' : 'success']({ message: res.message });
      }
    });
  }

  renderOpr = ({ record }) => {
    const approverLoginName = this.getCurrentUser().loginName;
    const isAsyncProd =
      record.get('approveStatus') === 'APPROVED' &&
      (isAdministrator || (isLeader && record.get('approver').includes(approverLoginName)));

    const isBlack = record.get('blacklistFlag');
    return [
      isAdministrator ? (
        <a
          disabled={!isAdministrator}
          onClick={() => this.editHandler(record)}
          style={{ marginRight: '0.1rem' }}
        >
          {intl.get('hpdm.deploy-info.operation.edit').d('编辑')}
        </a>
      ) : null,
      <a onClick={() => this.configDataHandler(record)} style={{ marginRight: '0.1rem' }}>
        {intl.get('hpdm.deploy-info.operation.data-config').d('查看数据')}
      </a>,
      <a onClick={() => this.handleDeployRec(record)} style={{ marginRight: '0.1rem' }}>
        {intl.get('hpdm.deploy-info.header.deployRec').d('发版记录')}
      </a>,
      isAsyncProd && !isBlack ? (
        <Popconfirm
          title={intl
            .get('srdm.deploy-rec.operation.cancel.async.confirm')
            .d('确定加入迭代黑名单？')}
          onConfirm={() => this.cancelAsyncHandler(record.get('deployNum'))}
        >
          <a>{intl.get('srdm.deploy-rec.operation.cancel.async').d('加入迭代黑名单')}</a>
        </Popconfirm>
      ) : null,
    ];
  };

  renderFlag({ value }) {
    return value
      ? intl.get('hzero.common.button.yes').d('是')
      : intl.get('hzero.common.button.no').d('否');
  }

  render() {
    return (
      <>
        <Header
          data-hcg_flag="Header_ae0e0"
          title={intl.get('srdm.deploy.header.title.info').d('配置迁移发版')}
        >
          {this.deployMode === 'public' && (isAdministrator || isUpgrader) ? (
            <Button
              data-hcg_flag="Button_f0bb0"
              newLine={false}
              color="primary"
              disabled={false}
              onClick={() => this.deployInfoImportTest(true)}
            >
              多云导出(测试配置项)
            </Button>
          ) : null}
          {this.deployMode === 'public' && (isAdministrator || isUpgrader) ? (
            <>
              <Button
                data-hcg_flag="Button_f0bb0"
                newLine={false}
                color="primary"
                disabled={false}
                onClick={() => this.deployInfoImport(true)}
              >
                {intl.get('srdm.deploy.button.export').d('多云导出')}
              </Button>
              <Button
                data-hcg_flag="Button_f0bb0"
                newLine={false}
                color="primary"
                disabled={false}
                onClick={() => this.deployInfoImportNew()}
              >
                {intl.get('srdm.deploy.button.export.new').d('海外公有云导出')}
              </Button>
            </>
          ) : null}
          {/* {this.deployMode === 'public' && (isAdministrator || isUpgrader) ? ( */}
          {/*  <Button */}
          {/*    data-hcg_flag="Button_f0bb0" */}
          {/*    newLine={false} */}
          {/*    color="primary" */}
          {/*    disabled={false} */}
          {/*    onClick={() => this.deployInfoImportByIssueNum(true)} */}
          {/*  > */}
          {/*    多云导出(按照需求号) */}
          {/*  </Button> */}
          {/* ) : null} */}
          {this.deployMode === 'multi' && isAdministrator ? (
            <>
              <Button
                newLine={false}
                color="primary"
                disabled={false}
                onClick={() => this.deployInfoImport(false)}
              >
                {intl.get('srdm.deploy.button.import').d('多云导入')}
              </Button>
              <Button newLine={false} disabled={false} onClick={() => this.deployInfoImportOther()}>
                {intl.get('srdm.deploy.button.import1').d('多云紧急导入')}
              </Button>
            </>
          ) : null}
        </Header>
        <Content data-hcg_flag="Content_87105">
          <Table
            data-hcg_flag="Table_85954"
            rowNumber={false}
            queryFieldsLimit={3}
            queryBar="professionalBar"
            columnResizable
            columnTitleEditable
            columnDraggable
            editMode="cell"
            customizable={false}
            customizedCode="Table_85954"
            border
            columns={[
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'overflow',
                name: 'deployNum',
                type: 'string',
                width: 200,
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'overflow',
                name: 'issueNum',
                width: 200,
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'overflow',
                name: 'creationDate',
                width: 200,
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'overflow',
                name: 'deployDesc',
                width: 200,
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'overflow',
                name: 'comments',
                width: 200,
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'overflow',
                name: 'cloudType',
                width: 200,
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'overflow',
                name: 'enabledFlag',
              },
              {
                name: 'blacklistFlag',
                width: 150,
                renderer: this.renderFlag,
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'overflow',
                name: 'iterationNum',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'overflow',
                name: 'applicant',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'overflow',
                name: 'approveStatus',
              },
              {
                hideable: true,
                name: 'approverName',
              },
              this.deployMode === 'public'
                ? {
                    header: intl.get('hpdm.deploy-info.title.operation').d('操作'),
                    width: isAdministrator ? 280 : 180,
                    lock: 'right',
                    renderer: this.renderOpr,
                  }
                : null,
            ]}
            dataSet={this.getDs('deployInfoDS')}
          />
        </Content>
      </>
    );
  }

  @Bind()
  async deployInfoImportTest(isExport = true) {
    const environmentDS = new DataSet(getExportAndImportDs(isExport));
    const record = environmentDS.create(
      isExport ? { deployNum: moment().format('YYYY.MMDD.HHmss') } : {}
    );
    Modal.open({
      title: isExport
        ? intl.get('srdm.deploy.button.export').d('多云导出')
        : intl.get('srdm.deploy.button.import').d('多云导入'),
      destroyOnClose: true,
      closable: true,
      children: (
        <Form record={record} labelLayout="float">
          <TextField name="deployNum" />
          {isExport && <Select name="checkoutFlag" />}
          {isExport && <Select name="iterationNumObject" />}
          {isExport && <Select name="tenantNum" noCache />}
          <TextArea name="comments" />
          {!isExport && <TextField name="skipStages" />}
        </Form>
      ),
      onOk: async () => {
        if (await environmentDS.current.validate()) {
          const data = environmentDS.current.toData();
          const res = isExport
            ? (await deployInfoExportTest(data)) || {}
            : (await deployInfoImport(data)) || {};
          notification[res.failed ? 'error' : 'success']({ message: res.message });
        } else {
          return false;
        }
      },
    });
  }
}

export default Page;
