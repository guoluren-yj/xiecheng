/*
 * @Description:
 * @Version: 2.0
 * @Autor: lyx
 * @Date: 2021-08-23
 */

import React from 'react';
import { DataSet, Table, Form, Select, Output, Modal, TextField, Switch } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl'; // #hzero-front/lib
import { getResponse } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections'; // #region   无法识别
import { getDocFlowDefinitionCoding } from '../../services/docFlowServices';
import getTableDocFlowDs from './store/docFlowDS';

const { Option } = Select;
const { Column } = Table;

@formatterCollections({
  code: ['spfm.dataProcessTable'],
})
export default class DocFlow extends React.Component {
  constructor(props) {
    super(props);
    this.tableDocFlowDs = new DataSet(getTableDocFlowDs());
    this.state = {
      currentCode: '',
      currentName: '',
    };
  }

  componentDidMount() {
    const data = this.props.match.params;
    getDocFlowDefinitionCoding(data).then((res) => {
      if (getResponse(res)) {
        const { code, name } = res;
        this.setState({ currentCode: code, currentName: name });
        this.tableDocFlowDs.setQueryParameter('nodeDefinitionCode', code);
        this.tableDocFlowDs.query();
      }
    });
  }

  @Bind()
  createFieldLink = (record) => {
    const currentRecord = record.toData();
    this.props.history.push({
      pathname: `/spfm/setting/field_config`,
      state: currentRecord,
    });
  };

  // 表字段配置
  @Bind()
  renderTableField = (record) => {
    return (
      <>
        <a onClick={() => this.createFieldLink(record)} funcType="flat">
          {intl.get('hzero.common.button.config').d('配置')}
        </a>
      </>
    );
  };

  @Bind()
  openModalTable = async (record) => {
    Modal.open({
      drawer: true,
      key: Modal.key(),
      title: intl.get('spfm.dataProcessTable.view.title.model.tableConfig').d('节点表编辑'),
      style: {
        width: 600,
      },

      children: (
        <div>
          <Form record={record}>
            <TextField name="tableCode" disabled />
            <TextField name="tableName" />
            <Select name="mainTableFlag">
              <Option value="1">{intl.get('hzero.common.button.yes').d('是')}</Option>
              <Option value="0">{intl.get('hzero.common.button.no').d('否')}</Option>
            </Select>
            <TextField name="tenantObject" disabled />
          </Form>
        </div>
      ),
      onOk: () => this.handleSubmit(record),
      onCancel: () => {},
      afterClose: () => {
        this.tableDocFlowDs.query();
      },
    });
  };

  // 提交方法
  handleSubmit = async (record) => {
    record.setState('editing', false);
    this.tableDocFlowDs.submit();
  };

  // 点击编辑后设定editing 为true
  handleEdit = (record) => {
    record.setState('editing', true);
  };

  handleCancel = (record) => {
    if (record.status === 'add') {
      this.tableDocFlowDs.remove(record);
    } else {
      record.reset();
      record.setState('editing', false);
    }
  };

  // 是否展示节点表函数
  @Bind()
  renderSwitch = (record) => {
    return (
      <>
        {record.get('mainTableFlag') === 1 ? (
          <Switch disabled defaultChecked />
        ) : (
          <Switch disabled unCheckedChildren={intl.get('hzero.common.button.no').d('否')} />
        )}
      </>
    );
  };

  render() {
    return (
      <React.Fragment>
        <Header
          title={intl.get('spfm.dataProcessTable.view.title').d('配置单据实体表')}
          backPath="/spfm/setting/node-definition/list"
        />
        <Content>
          <Form>
            <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
              <span style={{ margin: '0 20px 0 32px' }}>
                {intl.get('spfm.dataProcessTable.view.title.nodeDefinitionCode').d('节点code')}:
              </span>
              <Output value={this.state.currentCode} />
              <span style={{ margin: '0 20px 0 400px' }}>
                {intl.get('spfm.dataProcessTable.view.title.nodeDescription').d('节点描述')}:
              </span>
              <Output value={this.state.currentName} />
            </div>
          </Form>
          <Table dataSet={this.tableDocFlowDs} key="Table">
            <Column name="tableCode" width={230} />
            <Column name="tableName" editor={(record) => record.getState('editing')} />
            <Column
              name="mainTableFlag"
              align="center"
              width={200}
              renderer={({ record }) => this.renderSwitch(record)}
            />
          </Table>
        </Content>
      </React.Fragment>
    );
  }
}
