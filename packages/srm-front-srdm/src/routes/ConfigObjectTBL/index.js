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
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { closeAndPush } from '@/utils/utils';
import { initComponent, componentDidMount } from './pageLogic.js';
import {
  configRule,
  configObjectDSConfig,
  tableStructureDSConfig,
  schemaDSConfig,
} from './extensionRule.js';
import getConfigObjectDSProps from './configObjectDS.js';
import getTableStructureDSProps from './tableStructureDS.js';
import AutoGeneratePage from './autoGeneratePage.js';
import SchemaPage from './schemaPage.js';
import getSchemaDS from './schemaDS';
import { autoGenerate } from '../../services/configObjectTBLService';
import EditModal from './EditModal';

@formatterCollections({ code: ['hpdm.config-object-tbl', 'srdm.config-object'] })
@observer
@ComponentEnhanceWrapperHoc(configRule)
class Page extends Component {
  constructor(props) {
    super(props);
    const { params } = props.match;
    const { objectId } = params;
    this.setDs(
      'configObjectDS',
      new DataSet(configObjectDSConfig.bind(this)(getConfigObjectDSProps.bind(this)({ objectId })))
    );
    this.setDs(
      'tableStructureDS',
      new DataSet(
        tableStructureDSConfig.bind(this)(getTableStructureDSProps.bind(this)({ objectId }))
      )
    );
    this.setDs('schemaDS', new DataSet(schemaDSConfig.bind(this)(getSchemaDS.bind(this)())));
    initComponent.bind(this)();
  }

  componentDidMount() {
    componentDidMount.bind(this)();
  }

  @observable autoGenerateRef;

  @Bind
  handleSchema(record) {
    const schemaDS = this.getDs('schemaDS');
    Modal.open({
      destroyOnClose: true,
      closable: true,
      style: {
        width: 800,
      },
      children: <SchemaPage schemaDS={schemaDS} />,
      onOk: () => {
        if (schemaDS.selected.length > 0) {
          record.set('schemaName', schemaDS.selected[0].get('schemaName'));
        } else {
          notification.info({
            message: intl.get(`hpdm.config-object-tbl.select.one`).d('请选择一条记录'),
          });
          return false;
        }
      },
    });
  }

  openModal(record, isNew) {
    let isCancel = false;
    Modal.open({
      title: isNew
        ? intl.get('hzero.common.button.create').d('新建')
        : intl.get('hpdm.config-object-tbl.operation.edit').d('编辑'),
      drawer: true,
      children: <EditModal record={record} handleSchema={this.handleSchema} isNew={isNew} />,
      onOk: async () => {
        if (await record.validate()) {
          await this.getDs('tableStructureDS').submit();
          this.getDs('tableStructureDS').query(this.getDs('tableStructureDS').currentPage);
        } else {
          return false;
        }
      },
      onCancel: () => {
        this.getDs('tableStructureDS').reset();
        isCancel = true;
      },
      afterClose: () => {
        record.setState('hidden', true);
        if (isCancel && isNew) {
          this.getDs('tableStructureDS').remove(record);
        }
      },
    });
  }

  editConfigObjectTBL(record) {
    this.openModal(record);
  }

  @Bind()
  createConfigObjectTBL() {
    this.openModal(
      this.getDs('tableStructureDS').create({ objectId: this.props.match.params.objectId }, 0),
      true
    );
  }

  handleConfigField(record) {
    const key = `/srdm/config-object-field/${record.get('objectId')}/${record.get('objectTblId')}`;
    closeAndPush('/srdm/config-object-field/', {
      title: `${intl.get(`hpdm.config-object-tbl.header.title`).d('配置字段')} ${record.get(
        'tableName'
      )}`,
      key,
      path: key,
      icon: 'edit',
      closable: true,
    });
  }

  handleConfigContact(record) {
    const key = `/srdm/config-object-contact/${record.get('objectId')}/${record.get(
      'objectTblId'
    )}`;
    closeAndPush('/srdm/config-object-contact/', {
      title: `${intl
        .get('hpdm.config-object-tbl.operation.contact')
        .d('配置关联关系')} ${record.get('objectTblName')}`,
      key,
      path: key,
      icon: 'edit',
      closable: true,
    });
  }

  @Bind()
  async handleDelete(record) {
    await this.getDs('tableStructureDS').delete(record);
    this.getDs('tableStructureDS').query();
  }

  async autoGenerateHandle() {
    Modal.open({
      title: intl.get(`hpdm.config-object-tbl.title.autoGenerate`).d('自动生成'),
      destroyOnClose: true,
      closable: true,
      style: {
        width: 800,
      },
      children: (
        <AutoGeneratePage
          onRef={(ref) => {
            this.autoGenerateRef = ref;
          }}
          schemaDS={this.getDs('schemaDS')}
        />
      ),
      okText: intl.get(`hpdm.config-object-tbl.button.confirmGenerate`).d('确认生成'),
      onOk: async () => {
        if (this.autoGenerateRef.tableDS.selected.length > 0) {
          // 调用接口
          const res = getResponse(
            await autoGenerate({
              configObjectTblList: this.autoGenerateRef.tableDS.selected.map((item) => {
                return {
                  ...item.toData(),
                  objectId: this.props.match.params.objectId,
                };
              }),
            })
          );
          if (res && !res.failed) {
            this.getDs('tableStructureDS').query();
            notification.success();
          } else {
            return false;
          }
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
        <Header
          title={intl.get('srdm.config-object.header.configTbl').d('表配置')}
          backPath="/srdm/config-object"
        >
          <Button color="primary" onClick={() => this.autoGenerateHandle()}>
            {intl.get('hpdm.config-object.button.auto-generate').d('自动生成')}
          </Button>
        </Header>
        <Content data-hcg_flag="Content_37b11">
          <Form
            data-hcg_flag="Form_7c060"
            label="表单"
            columns={3}
            useColon
            labelWidth={100}
            labelLayout="horizontal"
            dataSet={this.getDs('configObjectDS')}
          >
            <TextField
              data-hcg_flag="TextField_8e71f"
              colSpan={1}
              newLine={false}
              name="objectCode"
              disabled
              clearButton
            />
            <TextField
              data-hcg_flag="TextField_43c7e"
              colSpan={1}
              newLine={false}
              name="objectName"
              disabled
              clearButton
            />
            <TextField
              data-hcg_flag="TextField_03114"
              colSpan={1}
              newLine={false}
              name="objectDesc"
              disabled
              clearButton
            />
            <NumberField
              data-hcg_flag="NumberField_4b644"
              colSpan={1}
              newLine={false}
              name="objectPriority"
              step={1}
              disabled
              clearButton
              numberGrouping={false}
            />
            <Select
              data-hcg_flag="Switch_994bf"
              colSpan={1}
              newLine={false}
              disabled
              name="enabledFlag"
            />
          </Form>
          <Table
            data-hcg_flag="Table_165c7"
            rowNumber={false}
            queryFieldsLimit={3}
            queryBar="professionalBar"
            columnResizable
            columnHideable
            columnTitleEditable
            columnDraggable
            editMode="cell"
            customizable={false}
            border
            columns={[
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'tableName',
                width: 170,
                type: 'string',
                lock: 'left',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                width: 170,
                name: 'objectTblName',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                width: 200,
                name: 'objectTblDesc',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'schemaName',
                width: 150,
                type: 'string',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                width: 150,
                name: 'tblPriority',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                width: 200,
                name: 'callbackService',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                width: 200,
                name: 'callbackServiceParam',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                width: 150,
                name: 'multiCloudFlag',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                width: 200,
                name: 'multiCloudBehavior',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                width: 200,
                name: 'multiCloudConditionField',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'tenantField',
                width: 200,
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'conditionField',
                width: 150,
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
                name: 'sortFlag',
                width: 150,
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'enabledFlag',
              },
              {
                header: intl.get('hpdm.config-object-tbl.title.operation').d('操作'),
                width: 260,
                lock: 'right',
                command: ({ record }) => {
                  const btns = [];
                  btns.push(
                    <a
                      onClick={() => this.editConfigObjectTBL(record)}
                      style={{ marginRight: '0.1rem' }}
                    >
                      {intl.get('hpdm.config-object-tbl.operation.edit').d('编辑')}
                    </a>,
                    <a onClick={() => this.handleConfigField(record)}>
                      {intl.get('hpdm.config-object-tbl.operation.configField').d('配置字段')}
                    </a>,
                    // <a onClick={() => this.handleConfigContact(record)}>
                    //   {intl.get('hpdm.config-object-tbl.operation.contact').d('配置关联关系')}
                    // </a>,
                    <a onClick={() => this.handleDelete(record)}>
                      {intl.get('hzero.common.model.delete').d('删除')}
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
                onClick={() => this.createConfigObjectTBL()}
              >
                {intl.get('hzero.common.button.create').d('新建')}
              </Button>,
              <Button
                funcType="raised"
                color="default"
                onClick={() => this.getDs('tableStructureDS').query()}
              >
                {intl.get('hzero.common.button.refresh').d('刷新')}
              </Button>,
            ]}
            dataSet={this.getDs('tableStructureDS')}
          />
        </Content>
      </>
    );
  }
}

export default Page;
