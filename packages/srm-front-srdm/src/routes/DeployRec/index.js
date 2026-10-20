import {
  TextField,
  DatePicker,
  Select,
  Form,
  Table,
  DataSet,
  DateTimePicker,
  Button,
  Modal,
  TextArea,
  Password,
} from 'choerodon-ui/pro';
import { Header, Content } from 'components/Page';
import React from 'react';
import Component from '@htd/helper/lib/components/base-component';
import ComponentEnhanceWrapperHoc from '@htd/helper/lib/decorators/props-extension-hoc';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import request from 'utils/request';
import formatterCollections from 'utils/intl/formatterCollections';
import { isAdministrator } from '@/utils/utils';
import { initComponent, componentDidMount } from './pageLogic.js';
import { configRule, deployInfoDSConfig, deployRecDSConfig } from './extensionRule.js';
import getDeployInfoDSProps from './deployInfoDS.js';
import getDeployRecDSProps from './deployRecDS.js';
import { checkPwd, migrateData } from '../../services/deployResService';

@formatterCollections({ code: ['hpdm.deploy-rec', 'hpdm.deploy-res', 'srdm.deploy-rec'] })
@observer
@ComponentEnhanceWrapperHoc(configRule)
class Page extends Component {
  @observable hasRule = false;
  constructor(props) {
    super(props);
    const { params } = props.match;
    const { deployInfoId } = params;
    this.setDs(
      'deployInfoDS',
      new DataSet(deployInfoDSConfig.bind(this)(getDeployInfoDSProps.bind(this)({ deployInfoId })))
    );
    this.setDs(
      'deployRecDS',
      new DataSet(deployRecDSConfig.bind(this)(getDeployRecDSProps.bind(this)({ deployInfoId })))
    );
    initComponent.bind(this)();
  }

  componentDidMount() {
    const { deployInfoId } = this.props.match.params;
    request(`/srdm/v1/auth/check-sync-in-deploy-recs?deployInfoId=${deployInfoId}`).then((res) => {
      if (res) {
        this.hasRule = res.success || false;
      }
    });
    componentDidMount.bind(this)();
  }

  openModal(record, isNew) {
    let isCancel = false;
    Modal.open({
      drawer: true,
      children: (
        <Form record={record} useColon>
          <Select disabled={!isNew} name="targetEnv" noCache />
          <TextField name="operator" />
          <Select name="enabledFlag" />
          <Select name="processStatus" />
          <DateTimePicker name="processDate" />
          <TextField name="processMessage" />
          <TextArea rows={2} resize="both" name="comments" />
        </Form>
      ),
      onOk: async () => {
        if (await record.validate()) {
          await this.getDs('deployRecDS').submit();
          this.getDs('deployRecDS').query(this.getDs('deployRecDS').currentPage);
        } else {
          return false;
        }
      },
      onCancel: () => {
        this.getDs('deployRecDS').reset();
        isCancel = true;
      },
      afterClose: () => isCancel && isNew && this.getDs('deployRecDS').remove(record),
    });
  }

  editHandler(record) {
    this.openModal(record);
  }

  createHandler() {
    this.openModal(
      this.getDs('deployRecDS').create({ deployInfoId: this.props.match.params.deployInfoId }, 0),
      true
    );
  }

  async asyncHandler(record) {
    const res = await checkPwd(record.toData());
    if (getResponse(res) || Number(res) === 0) {
      if (Number(res) === 0) {
        Modal.confirm({
          destroyOnClose: true,
          title: intl.get('hpdm.deploy-res.title.asyncHandler').d('是否确认同步？'),
          onOk: async () => {
            const migrateRes = await migrateData(record.toData());
            if (getResponse(migrateRes)) {
              notification.success({
                message: intl.get(`hpdm.deploy-res.process.deal`).d('请查看流程处理'),
              });
            }
          },
        });
      } else {
        Modal.confirm({
          destroyOnClose: true,
          children: (
            <Form dataSet={this.pwdDS}>
              {record.get('decryptVerifyPassword') ? (
                <Password name="decryptVerifyPassword" autoComplete="new-password" />
              ) : (
                <TextField name="decryptVerifyPassword" autoComplete="new-password" />
              )}
            </Form>
          ),
          onOk: async () => {
            if (await this.pwdDS.validate()) {
              const migrateRes = await migrateData({
                ...record.toData(),
                decryptVerifyPassword: this.pwdDS.current.get('decryptVerifyPassword'),
              });
              if (getResponse(migrateRes)) {
                notification.success({
                  message: intl.get(`hpdm.deploy-rec.process.deal`).d('请查看流程处理'),
                });
              }
            } else {
              return false;
            }
          },
          afterClose: () => {
            this.pwdDS.reset();
          },
        });
      }
    }
  }

  render() {
    return (
      <>
        <Header
          data-hcg_flag="Header_2736d"
          title={intl.get('hpdm.deploy-rec.header.title').d('发版记录')}
          backPath="/srdm/deploy-info"
        />
        <Content data-hcg_flag="Content_b511a">
          <Form
            data-hcg_flag="Form_55a1e"
            label="表单"
            columns={3}
            useColon
            labelWidth={100}
            labelLayout="horizontal"
            dataSet={this.getDs('deployInfoDS')}
          >
            <TextField
              data-hcg_flag="TextField_6d8c6"
              colSpan={1}
              newLine={false}
              name="deployNum"
              clearButton
            />
            <DatePicker
              data-hcg_flag="DatePicker_c305d"
              colSpan={1}
              newLine={false}
              name="deployDate"
              clearButton
            />
            <TextField
              data-hcg_flag="TextField_f44fd"
              colSpan={1}
              newLine={false}
              name="deployDesc"
              clearButton
            />
            <TextField
              data-hcg_flag="TextField_34e6e"
              colSpan={1}
              newLine={false}
              name="comments"
              clearButton
            />
            <Select
              data-hcg_flag="Select_afbd9"
              name="processStatus"
              clearButton
              colSpan={1}
              newLine={false}
            />
            <Select
              data-hcg_flag="Select_7ad63"
              name="enabledFlag"
              clearButton
              colSpan={1}
              newLine={false}
            />
          </Form>
          <Table
            data-hcg_flag="Table_9edfa"
            rowNumber={false}
            queryFieldsLimit={3}
            queryBar="professionalBar"
            columnResizable
            columnHideable
            columnTitleEditable
            columnDraggable
            editMode="cell"
            customizable={false}
            customizedCode="Table_9edfa"
            border
            columns={[
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'targetEnvRead',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'operator',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'comments',
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
                name: 'processStatus',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'processDate',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'processMessage',
              },
              this.hasRule
                ? {
                    header: intl.get('hpdm.deploy-rec.title.operation').d('操作'),
                    width: 200,
                    lock: 'right',
                    command: ({ record }) => {
                      return [
                        isAdministrator ? (
                          <a onClick={() => this.editHandler(record)}>
                            {intl.get('hpdm.deploy-rec.operation.edit').d('编辑')}
                          </a>
                        ) : null,
                        <a onClick={() => this.asyncHandler(record)} style={{ margin: '0 0.1rem' }}>
                          {intl.get('hpdm.deploy-rec.operation.async').d('同步')}
                        </a>,
                      ];
                    },
                  }
                : null,
            ]}
            buttons={[
              isAdministrator ? (
                <Button funcType="raised" color="primary" onClick={() => this.createHandler()}>
                  {intl.get('hzero.common.button.create').d('新建')}
                </Button>
              ) : null,
              <Button
                funcType="raised"
                color="default"
                onClick={() => this.getDs('deployRecDS').query()}
              >
                {intl.get('hzero.common.button.refresh').d('刷新')}
              </Button>,
            ]}
            dataSet={this.getDs('deployRecDS')}
          />
        </Content>
      </>
    );
  }
}

export default Page;
