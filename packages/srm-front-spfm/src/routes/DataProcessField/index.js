/*
 * @Description:
 * @Version: 2.0
 * @Autor: lyx
 * @Date: 2021-08-26 16:34:43
 * @LastEditors: yanglin
 * @LastEditTime: 2023-09-08 11:24:34
 */
import React from 'react';
import {
  DataSet,
  Table,
  Modal,
  Form,
  TextField,
  Button,
  Select,
  IntlField,
  Tooltip,
  Icon,
  Switch,
  TextArea,
} from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { observer } from 'mobx-react-lite'; // #region   无法识别
import { Header, Content } from 'components/Page';
import { isTenantRoleLevel, getResponse } from 'utils/utils';
import { enableRender } from 'utils/renderer'; // yesOrNoRender
import intl from 'utils/intl'; // #hzero-front/lib
import formatterCollections from 'utils/intl/formatterCollections';
import { getTableDocFlowFieldDs, getTenantFieldDs } from './store/docFlowFieldDS';

const { Option } = Select;
const tenantFlag = isTenantRoleLevel();

@formatterCollections({
  code: ['spfm.dataProcessField'],
})
export default class DocFlow extends React.Component {
  constructor(props) {
    super(props);
    this.tableDocFlowFieldDs = new DataSet(getTableDocFlowFieldDs());
    this.tenantFieldDs = new DataSet(getTenantFieldDs());
  }

  helpText = () => (
    <span>
      {intl
        .get('spfm.dataProcessField.title.help.tenant')
        .d(
          '字段值集编码、字段别名、是否启用支持租户配置，配置后单据流节点概览中读取租户配置的数据，不再读取平台预定数据。'
        )}
    </span>
  );

  @Bind()
  openModalFieldConfig = async (record) => {
    if (tenantFlag) {
      const { id } = record.toData();
      this.tenantFieldDs.setQueryParameter('id', id);
      await this.tenantFieldDs.query();
    }
    Modal.open({
      drawer: true,
      key: Modal.key(),
      title: (
        <span>
          {intl.get('spfm.dataProcessField.view.title.model.fieldConfig').d('表字段编辑')}
          {tenantFlag ? (
            <Tooltip placement="bottom" title={this.helpText()} trigger="click">
              <Icon type="help" style={{ marginLeft: 4 }} />
            </Tooltip>
          ) : (
            ''
          )}
        </span>
      ),
      style: {
        width: 600,
      },
      children: this.childrenCom(record),
      onOk: async () => {
        if (tenantFlag) {
          this.tenantFieldDs.current.set('id', record.get('id'));
          const res = await this.tenantFieldDs.submit();
          if (getResponse(res)) {
            this.tableDocFlowFieldDs.query();
          } else {
            return false;
          }
        } else {
          const res = await this.tableDocFlowFieldDs.submit();
          if (getResponse(res)) {
            return true;
          } else {
            return false;
          }
        }
      },
      onCancel: () => {
        if (record.dirty) {
          this.tableDocFlowFieldDs.reset(record);
        }
      },
    });
  };

  // 创建表字段
  @Bind()
  createField = () => {
    const record = this.tableDocFlowFieldDs.create({}, 0);
    record.set('tenantId', 0);
    record.set('pkFlag', 0);
    record.set('standardFlag', 1);
    Modal.open({
      drawer: true,
      key: Modal.key(),
      title: intl.get('spfm.dataProcessField.view.title.model.createField').d('表字段创建'),
      style: {
        width: 600,
      },
      children: this.childrenCom(record),
      onOk: () => this.tableDocFlowFieldDs.submit(),
      onCancel: () => {
        this.tableDocFlowFieldDs.remove(record);
      },
    });
  };

  childrenCom = (record) => {
    return (
      <>
        <Form record={record}>
          <TextField name="fieldCode" disabled={tenantFlag} />
          <IntlField
            name="fieldName"
            renderer={() =>
              tenantFlag ? this.tenantFieldDs.current?.get('fieldName') : record?.get('fieldName')
            }
            onChange={(value) => record.set('fieldName', value)}
            disabled={tenantFlag}
          />
          <TextField name="tableCode" disabled={tenantFlag} />
          {tenantFlag ? (
            ''
          ) : (
            <>
              <Select
                onChange={(value) => {
                  record.set('fieldType', value);
                }}
                name="fieldType"
              />
              <TextField name="displayFormat" />
              <TextField name="fieldLov" />
              <Select
                name="enabledFlag"
                onChange={(value) => {
                  record.set('enabledFlag', value);
                }}
                renderer={({ value }) =>
                  value ? (
                    <span>{intl.get('hzero.common.button.enabled').d('启用')}</span>
                  ) : (
                    <span>{intl.get('hzero.common.button.disable').d('禁用')}</span>
                  )
                }
              >
                <Option value="1">{intl.get('hzero.common.button.enabled').d('启用')}</Option>
                <Option value="0">{intl.get('hzero.common.button.disable').d('禁用')}</Option>
              </Select>
              <Switch name="attachmentFlag" />
              <Select name="bucketCode" />
              <Switch name="standardFlag" />
              <TextArea name="translationSql" resize="vertical" />
              <Switch name="amountFlag" showHelp="label" />
              <Switch name="uomFlag" />
            </>
          )}
        </Form>
        {tenantFlag ? (
          <Form record={this.tenantFieldDs.current}>
            <TextField name="fieldLov" />
            <IntlField name="fieldAliasName" />
            <Select
              name="enabledFlag"
              onChange={(value) => {
                record.set('enabledFlag', value);
              }}
              renderer={({ value }) =>
                value ? (
                  <span>{intl.get('hzero.common.button.enabled').d('启用')}</span>
                ) : (
                  <span>{intl.get('hzero.common.button.disable').d('禁用')}</span>
                )
              }
            >
              <Option value="1">{intl.get('hzero.common.button.enabled').d('启用')}</Option>
              <Option value="0">{intl.get('hzero.common.button.disable').d('禁用')}</Option>
            </Select>
            <Switch name="attachmentFlag" />
            <Select name="bucketCode" />
            <TextArea name="translationSql" resize="vertical" />
            <Switch name="amountFlag" showHelp="label" />
            <Switch name="uomFlag" />
          </Form>
        ) : (
          ''
        )}
      </>
    );
  };

  render() {
    const Headers = observer(() => {
      return (
        <React.Fragment>
          <Header title={intl.get('spfm.dataProcessField.view.title').d('表元数据定义')}>
            {tenantFlag ? (
              ''
            ) : (
              <Button icon="add" color="primary" onClick={this.createField} align="center">
                {intl.get('hzero.common.button.create').d('新建')}
              </Button>
            )}
          </Header>
        </React.Fragment>
      );
    });
    const columns = [
      {
        name: 'fieldCode',
        width: 180,
      },
      {
        name: 'fieldName',
      },
      {
        name: 'tableCode',
        width: 150,
      },
      {
        name: 'fieldType',
        width: 100,
      },
      {
        name: 'displayFormat',
        width: 80,
      },
      {
        name: 'fieldLov',
        width: 140,
      },
      {
        name: 'fieldType',
        width: 100,
      },
      {
        name: 'enabledFlag',
        width: 100,
        align: 'left',
        renderer: ({ record }) => enableRender(record.get('enabledFlag')),
      },
      // {
      //   name: 'attachmentFlag',
      //   width: 100,
      //   align: 'left',
      //   renderer: ({ value }) => yesOrNoRender(Number(value)),
      // },
      // {
      //   name: 'bucketCode',
      //   width: 100,
      // },
      {
        name: 'action',
        width: 100,
        renderer: ({ record }) => (
          <span className="action-link">
            <a onClick={() => this.openModalFieldConfig(record)}>
              {intl.get('hzero.common.button.editor').d('编辑')}
            </a>
          </span>
        ),
      },
    ];
    return (
      <React.Fragment>
        <Headers dataSet={this.tableDocFlowFieldDs} />
        <Content>
          <Table dataSet={this.tableDocFlowFieldDs} key="Table" columns={columns} />
        </Content>
      </React.Fragment>
    );
  }
}
