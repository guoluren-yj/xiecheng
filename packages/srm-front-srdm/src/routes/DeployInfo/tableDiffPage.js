import React, { Component } from 'react';
import { DataSet, Form, TextField, Modal, Select } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { Icon } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import notification from 'utils/notification';
import intl from 'utils/intl';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { HZERO_SRDM } from '@/common/config';
import SchemaPage from './schemaPage.js';

const organizationId = getCurrentOrganizationId();

@observer
class TableDiffPage extends Component {
  constructor(props) {
    super(props);
    this.props.onRef(this);
    this.formDS = new DataSet({
      autoCreate: true,
      autoQuery: true,
      selection: 'single',
      paging: false,
      fields: [
        {
          type: 'string',
          name: 'sourceEnv',
          label: intl.get('hpdm.deploy-info.model.sourceEnv').d('来源环境'),
          valueField: `environmentCode`,
          textField: `environmentName`,
          required: true,
          lookupAxiosConfig: () => ({
            method: 'GET',
            url: isTenantRoleLevel()
              ? `${HZERO_SRDM}/v1/${organizationId}/application-envs?page=0&size=2000`
              : `${HZERO_SRDM}/v1/application-envs?page=0&size=2000`,
          }),
        },
        {
          type: 'string',
          name: 'sourceSchema',
          label: intl.get('hpdm.deploy-info.model.sourceSchema').d('来源数据库'),
        },
        {
          type: 'string',
          name: 'targetEnv',
          label: intl.get('hpdm.deploy-info.model.targetEnv').d('目标环境'),
          valueField: `environmentCode`,
          textField: `environmentName`,
          required: true,
          lookupAxiosConfig: () => ({
            method: 'GET',
            url: isTenantRoleLevel()
              ? `${HZERO_SRDM}/v1/${organizationId}/application-envs?page=0&size=2000`
              : `${HZERO_SRDM}/v1/application-envs?page=0&size=2000`,
          }),
        },
        {
          type: 'string',
          name: 'targetSchema',
          label: intl.get('hpdm.deploy-info.model.targetSchema').d('目标数据库'),
        },
      ],
      transport: {
        submit: ({ data }) => {
          return {
            url: isTenantRoleLevel()
              ? `${HZERO_SRDM}/v1/${organizationId}/hpdm-config-object-tbls/compare?sourceEnv=${data[0].sourceEnv}&sourceSchema=${data[0].sourceSchema}&targetEnv=${data[0].targetEnv}&targetSchema=${data[0].targetSchema}`
              : `${HZERO_SRDM}/v1/hpdm-config-object-tbls/compare?sourceEnv=${data[0].sourceEnv}&sourceSchema=${data[0].sourceSchema}&targetEnv=${data[0].targetEnv}&targetSchema=${data[0].targetSchema}`,
            method: 'POST',
          };
        },
      },
      events: {
        update: ({ name, record }) => {
          if (name === 'sourceEnv') {
            record.set('sourceSchema', null);
          }
          if (name === 'targetEnv') {
            record.set('targetSchema', null);
          }
        },
      },
      feedback: {
        submitSuccess: () => {
          notification.success({
            message: intl.get(`hpdm.deploy-info.process.deal`).d('请查看流程处理'),
          });
        },
      },
    });
  }

  @Bind()
  handleSchema(name) {
    let paramEnv = null;
    if (name === 'sourceSchema') {
      paramEnv = this.formDS.current.get('sourceEnv');
    } else {
      paramEnv = this.formDS.current.get('targetEnv');
    }
    Modal.open({
      key: 'modal_table_diff_2',
      destroyOnClose: true,
      closable: true,
      style: {
        width: 800,
      },
      children: (
        <SchemaPage
          paramEnv={paramEnv}
          onRef={(ref) => {
            this.schemaPageRef = ref;
          }}
        />
      ),
      onOk: () => {
        if (this.schemaPageRef.schemaDS.selected.length > 0) {
          this.formDS.current.set(name, this.schemaPageRef.schemaDS.selected[0].get('schemaName'));
        } else {
          notification.info({
            message: intl.get(`hpdm.deploy-info.select.one`).d('请选择一条记录'),
          });
          return false;
        }
      },
    });
  }

  render() {
    return (
      <>
        <Form dataSet={this.formDS}>
          <Select name="sourceEnv" />
          <TextField
            name="sourceSchema"
            readOnly
            suffix={
              <Icon
                type="close"
                onClick={() => {
                  this.formDS.current.set('sourceSchema', null);
                }}
              />
            }
            addonAfter={
              <Icon
                type="search"
                onClick={() => {
                  if (this.formDS.current && this.formDS.current.get('sourceEnv')) {
                    this.handleSchema('sourceSchema');
                  } else {
                    notification.info({
                      message: intl.get(`hpdm.deploy-info.select.sourceEnv`).d('请选择来源环境'),
                    });
                  }
                }}
              />
            }
            addonAfterStyle={{ backgroundColor: 'white', cursor: 'pointer' }}
          />
          <Select name="targetEnv" />
          <TextField
            name="targetSchema"
            readOnly
            suffix={
              <Icon
                type="close"
                onClick={() => {
                  this.formDS.current.set('targetSchema', null);
                }}
              />
            }
            addonAfter={
              <Icon
                type="search"
                onClick={() => {
                  if (this.formDS.current && this.formDS.current.get('targetEnv')) {
                    this.handleSchema('targetSchema');
                  } else {
                    notification.info({
                      message: intl.get(`hpdm.deploy-info.select.targetEnv`).d('请选择目标环境'),
                    });
                  }
                }}
              />
            }
            addonAfterStyle={{ backgroundColor: 'white', cursor: 'pointer' }}
          />
        </Form>
      </>
    );
  }
}

export default TableDiffPage;
