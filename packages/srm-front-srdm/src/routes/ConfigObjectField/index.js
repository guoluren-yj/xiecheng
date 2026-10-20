import { Header, Content } from 'components/Page';
import {
  Button,
  TextField,
  NumberField,
  Select,
  Form,
  Table,
  DataSet,
  Modal,
} from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import React from 'react';
import Component from '@htd/helper/lib/components/base-component';
import formatterCollections from 'utils/intl/formatterCollections';
import ComponentEnhanceWrapperHoc from '@htd/helper/lib/decorators/props-extension-hoc';
import intl from 'utils/intl';
import { observer } from 'mobx-react';
import { initComponent, componentDidMount } from './pageLogic.js';
import { configRule, tableStructerDSConfig, configObjectFieldDSConfig } from './extensionRule.js';
import getTableStructerDSProps from './tableStructerDS.js';
import getConfigObjectFieldDSProps from './configObjectFieldDS.js';
import EditModal from './EditModal';

@formatterCollections({
  code: ['hpdm.config-object-field', 'hpdm.config-object-tbl', 'srdm.config-object'],
})
@observer
@ComponentEnhanceWrapperHoc(configRule)
class Page extends Component {
  constructor(props) {
    super(props);
    const { params } = props.match;
    const { objectTblId } = params;
    this.setDs(
      'tableStructerDS',
      new DataSet(
        tableStructerDSConfig.bind(this)(getTableStructerDSProps.bind(this)({ objectTblId }))
      )
    );
    this.setDs(
      'configObjectFieldDS',
      new DataSet(
        configObjectFieldDSConfig.bind(this)(
          getConfigObjectFieldDSProps.bind(this)({ objectTblId })
        )
      )
    );
    initComponent.bind(this)();
  }

  componentDidMount() {
    componentDidMount.bind(this)();
  }

  openModal(record, isNew) {
    let isCancel = false;
    Modal.open({
      title: isNew
        ? intl.get('hzero.common.button.create').d('新建')
        : intl.get('hpdm.config-object-tbl.operation.edit').d('编辑'),
      drawer: true,
      children: <EditModal record={record} isNew={isNew} />,
      onOk: async () => {
        if (await record.validate()) {
          await this.getDs('configObjectFieldDS').submit();
          this.getDs('configObjectFieldDS').query(this.getDs('configObjectFieldDS').currentPage);
        } else {
          return false;
        }
      },
      onCancel: () => {
        this.getDs('configObjectFieldDS').reset();
        isCancel = true;
      },
      afterClose: () => isCancel && isNew && this.getDs('configObjectFieldDS').remove(record),
    });
  }

  editConfigObjectField(record) {
    this.openModal(record);
  }

  @Bind()
  createConfigObjectField() {
    this.openModal(
      this.getDs('configObjectFieldDS').create(
        { objectTblId: this.props.match.params.objectTblId },
        0
      ),
      true
    );
  }

  @Bind()
  async deleteOperation(record) {
    await this.getDs('configObjectFieldDS').delete(record);
    this.getDs('configObjectFieldDS').query();
  }

  render() {
    return (
      <>
        <Header
          data-hcg_flag="Header_5e821"
          title={intl.get('hpdm.config-object-field.header.title').d('配置字段')}
          backPath={`/srdm/config-object-tbl/${this.props.match.params.objectId}`}
        />
        <Content data-hcg_flag="Content_d9c76">
          <Form
            data-hcg_flag="Form_a68df"
            label="表单"
            columns={3}
            useColon
            labelWidth={100}
            labelLayout="horizontal"
            dataSet={this.getDs('tableStructerDS')}
          >
            <TextField
              data-hcg_flag="TextField_aeb0b"
              colSpan={1}
              name="tableName"
              disabled
              clearButton
            />
            <TextField
              data-hcg_flag="TextField_95a43"
              colSpan={1}
              name="objectTblName"
              disabled
              clearButton
            />
            <TextField
              data-hcg_flag="TextField_bfa8d"
              colSpan={1}
              name="objectTblDesc"
              disabled
              clearButton
            />
            <NumberField
              data-hcg_flag="NumberField_acd4c"
              colSpan={1}
              name="tblPriority"
              step={1}
              clearButton
              disabled
              numberGrouping={false}
            />
            <TextField
              data-hcg_flag="TextField_ceebe"
              colSpan={1}
              name="displayFieldDesc"
              disabled
              clearButton
            />
            <TextField
              data-hcg_flag="TextField_ceebe"
              disabled
              colSpan={1}
              name="relateType"
              clearButton
            />
            <Select
              data-hcg_flag="Select_b4098"
              disabled
              name="enabledFlag"
              clearButton
              colSpan={1}
            />
          </Form>
          <Table
            data-hcg_flag="Table_106c7"
            rowNumber={false}
            queryFieldsLimit={3}
            queryBar="professionalBar"
            columnResizable
            columnHideable
            columnTitleEditable
            columnDraggable
            editMode="cell"
            customizable={false}
            customizedCode="Table_106c7"
            border
            columns={[
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'fieldName',
                width: 200,
                type: 'string',
                lock: 'left',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'objectFldName',
                width: 200,
                type: 'string',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                width: 200,
                name: 'objectFldDesc',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'fieldSeq',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'fieldType',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'defaultValue',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                width: 150,
                name: 'uniqueFlag',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                width: 100,
                name: 'differCompareFlag',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                width: 100,
                name: 'codeCompareFlag',
              },
              {
                width: 100,
                name: 'encodeMode',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'updateFlag',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'multiCloudUpdateFlag',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'primaryFlag',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'idFlag',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'parentFlag',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'idTranferSql',
                width: 150,
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'enabledFlag',
              },
              {
                header: intl.get('hpdm.config-object-field.title.operation').d('操作'),
                width: 200,
                lock: 'right',
                command: ({ record }) => {
                  const btns = [];
                  btns.push(
                    <a
                      onClick={() => this.editConfigObjectField(record)}
                      style={{ marginRight: '0.1rem' }}
                    >
                      {intl.get('hpdm.config-object-field.operation.edit').d('编辑')}
                    </a>,
                    <a
                      onClick={() => this.deleteOperation(record)}
                      style={{ marginRight: '0.1rem' }}
                    >
                      {intl.get('hpdm.config-object-field.operation.delete').d('删除')}
                    </a>
                  );
                  return btns;
                },
              },
            ]}
            buttons={[
              <Button
                funcType="raised"
                color="primary"
                onClick={() => this.createConfigObjectField()}
              >
                {intl.get('hzero.common.button.create').d('新建')}
              </Button>,
              <Button
                funcType="raised"
                color="default"
                onClick={() => this.getDs('configObjectFieldDS').query()}
              >
                {intl.get('hzero.common.button.refresh').d('刷新')}
              </Button>,
            ]}
            dataSet={this.getDs('configObjectFieldDS')}
          />
        </Content>
      </>
    );
  }
}

export default Page;
