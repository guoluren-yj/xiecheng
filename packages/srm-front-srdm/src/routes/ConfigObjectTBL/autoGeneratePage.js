import React, { Component } from 'react';
import { Table, DataSet, Form, TextField, Modal } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import { observer } from 'mobx-react';
import { Bind } from 'lodash-decorators';
import notification from 'utils/notification';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import intl from 'utils/intl';
import { HZERO_SRDM } from '@/common/config';
import SchemaPage from './schemaPage.js';

const organizationId = getCurrentOrganizationId();

@observer
class AutoGeneratePage extends Component {
  constructor(props) {
    super(props);
    this.props.onRef(this);
    this.formDS = new DataSet({
      autoCreate: true,
      fields: [
        {
          name: 'schemaName',
          type: 'string',
          label: intl.get('hpdm.config-object-tbl.model.schemaName').d('数据库'),
          required: true,
        },
      ],
    });
    this.tableDS = new DataSet({
      autoCreate: false,
      autoQuery: false,
      primaryKey: 'tableName',
      cacheSelection: true,
      cacheModified: true,
      fields: [
        {
          name: 'tableName',
          type: 'string',
          label: intl.get('hpdm.config-object-tbl.model.tableName').d('表名'),
        },
        {
          name: 'schemaName',
          type: 'string',
          label: intl.get('hpdm.config-object-tbl.model.schemaName').d('数据库'),
        },
        {
          name: 'objectTblName',
          type: 'string',
          label: intl.get('hpdm.config-object-tbl.model.objectTblName').d('表名称'),
        },
        {
          name: 'objectTblDesc',
          type: 'string',
          label: intl.get('hpdm.config-object-tbl.model.objectTblDesc').d('表说明'),
        },
        {
          name: 'tblPriority',
          type: 'string',
          label: intl.get('hpdm.config-object-tbl.model.tblPriority').d('迁移优先级'),
        },
        {
          name: 'displayField',
          type: 'string',
          label: intl.get('hpdm.config-object-tbl.model.displayField').d('表的显示逻辑(字段/SQl)'),
        },
      ],
      queryFields: [
        {
          name: 'tableName',
          type: 'string',
          label: intl.get('hpdm.config-object-tbl.model.tableName').d('表名'),
        },
        {
          name: 'objectTblName',
          type: 'string',
          label: intl.get('hpdm.config-object-tbl.model.objectTblName').d('表名称'),
        },
      ],
      transport: {
        read: (config) => {
          const { data, params } = config;
          const url = isTenantRoleLevel()
            ? `${HZERO_SRDM}/v1/${organizationId}/hpdm-config-object-tbls/table-select`
            : `${HZERO_SRDM}/v1/hpdm-config-object-tbls/table-select`;
          return {
            data,
            params,
            url,
            method: 'GET',
          };
        },
      },
    });
    this.schemaDS = this.props.schemaDS;
  }

  @Bind()
  handleSchema() {
    Modal.open({
      destroyOnClose: true,
      closable: true,
      style: {
        width: 800,
      },
      children: <SchemaPage schemaDS={this.schemaDS} />,
      onOk: () => {
        if (this.schemaDS.selected.length > 0) {
          this.formDS.current.set('schemaName', this.schemaDS.selected[0].get('schemaName'));
          this.tableDS.setQueryParameter('schema', this.schemaDS.selected[0].get('schemaName'));
          this.tableDS.query();
        } else {
          notification.info({
            message: intl.get(`hpdm.config-object-tbl.select.one`).d('请选择一条记录'),
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
          <TextField
            name="schemaName"
            readOnly
            suffix={
              <Icon
                type="close"
                onClick={() => {
                  this.formDS.current.set('schemaName', null);
                  this.tableDS.setQueryParameter('schema', null);
                }}
              />
            }
            addonAfter={<Icon type="search" onClick={this.handleSchema} />}
            addonAfterStyle={{ backgroundColor: 'white', cursor: 'pointer' }}
          />
        </Form>
        <Table
          rowNumber={false}
          queryBar="professionalBar"
          columnResizable
          columnTitleEditable
          columnDraggable
          editMode="cell"
          customizable={false}
          style={{ height: 200 }}
          queryFieldsLimit={2}
          border
          columns={[
            {
              hideable: true,
              titleEditable: true,
              tooltip: 'always',
              name: 'tableName',
              width: 170,
              type: 'string',
            },
            {
              hideable: true,
              titleEditable: true,
              tooltip: 'always',
              width: 170,
              name: 'objectTblName',
              type: 'string',
            },
            {
              hideable: true,
              titleEditable: true,
              tooltip: 'always',
              name: 'objectTblDesc',
              type: 'string',
            },
            {
              hideable: true,
              titleEditable: true,
              tooltip: 'always',
              name: 'schemaName',
              type: 'string',
            },
            {
              hideable: true,
              titleEditable: true,
              tooltip: 'always',
              name: 'tblPriority',
              type: 'string',
            },
            {
              hideable: true,
              titleEditable: true,
              tooltip: 'always',
              name: 'displayField',
              type: 'string',
            },
          ]}
          buttons={[]}
          dataSet={this.tableDS}
        />
      </>
    );
  }
}

export default AutoGeneratePage;
