import React from 'react';
import qs from 'querystring';
import uuidv4 from 'uuid/v4';
import { observer } from 'mobx-react-lite';
import { Bind } from 'lodash-decorators';
import { Form } from 'hzero-ui';
import { Tag, Row, Col } from 'choerodon-ui';
import { DataSet, Table, Lov, Button, Select } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';

import { fetchInfo, updateCompanyStatus } from './api';
import { tableDs, createDs, batchDs } from './assignDs';
import './overwrite.less';

@formatterCollections({ code: ['small.ecClient, small.common'] })
export default class Assign extends React.Component {
  constructor(props) {
    super(props);
    const { ecClientId = '' } = qs.parse(props.history.location.search.substr(1));
    this.state = {
      ecClientId,
      info: {},
      selVal: 'currencyLov', // uom
      currencyLov: null,
      uomLov: null,
    };
  }

  tableDs = new DataSet(tableDs);

  createDs = new DataSet(createDs);

  batchDs = new DataSet(batchDs);

  statusRender = ({ record }) => {
    return record.status === 'add' ? (
      '-'
    ) : record.get('enabledFlag') === 0 ? (
      <Tag color="#FEE7E5" style={{ color: '#F44336' }}>
        {intl.get('hzero.common.button.disable').d('禁用')}
      </Tag>
    ) : (
      <Tag color="#D9F6F2" style={{ color: '#00BFA5' }}>
        {intl.get('hzero.common.button.enable').d('启用')}
      </Tag>
    );
  };

  optionRender = ({ record }) => {
    return record.status === 'add' ? (
      '-'
    ) : (
      <a onClick={() => this.handleUpdateStatus(record)}>
        {record.get('enabledFlag') === 0
          ? intl.get('hzero.common.button.enable').d('启用')
          : intl.get('hzero.common.button.disable').d('禁用')}
      </a>
    );
  };

  columns = [
    {
      name: 'companyLov',
      width: 150,
      editor: true,
    },
    {
      name: 'companyName',
      minWidth: 150,
    },
    {
      name: 'currencyLov',
      width: 150,
      editor: true,
    },
    {
      name: 'uomLov',
      width: 150,
      editor: true,
    },
    {
      name: 'enabledFlag',
      width: 90,
      align: 'center',
      renderer: this.statusRender,
    },
    {
      name: 'option',
      width: 80,
      renderer: this.optionRender,
    },
  ];

  componentDidMount() {
    this.fetchInfo();
    this.tableDs.setQueryParameter('ecClientId', this.state.ecClientId);
    this.tableDs.query();
  }

  @Bind()
  async fetchInfo() {
    const { ecClientId } = this.state;
    const res = await fetchInfo({ ecClientId });
    const result = getResponse(res);
    if (result) {
      this.setState({ info: result });
    }
  }

  /**
   * 保存
   */
  @Bind()
  async handleSave() {
    const flag = await this.tableDs.validate();
    if (flag) {
      const res = await this.tableDs.submit();
      const result = getResponse(res);
      if (result) {
        this.tableDs.query();
      }
    }
  }

  @Bind()
  async handleUpdateStatus(record) {
    const data = record.toData();
    const res = await updateCompanyStatus([
      { ...data, enabledFlag: data.enabledFlag === 1 ? 0 : 1 },
    ]);
    const result = getResponse(res);
    if (result) {
      notification.success();
      this.tableDs.query(this.tableDs.currentPage);
    }
  }

  @Bind()
  handleCreate(records) {
    const { ecClientId } = this.state;
    this.createDs.reset();
    const createKeys = (records || []).map((f) => {
      const staticKey = uuidv4();
      const newData = {
        ecClientId,
        staticKey,
        enabledFlag: 1,
        companyId: f.companyId,
        companyName: f.companyName,
        companyNum: f.companyNum,
      };
      this.tableDs.create(newData, 0);
      return staticKey;
    });
    this.tableDs.forEach((record) => {
      if (createKeys.includes(record.get('staticKey'))) {
        this.tableDs.select(record);
      }
    });
  }

  @Bind()
  handleDelete() {
    const selectData = this.tableDs.selected;
    this.tableDs.remove(selectData.filter((f) => f.status === 'add'));
  }

  @Bind()
  handleCancel() {
    this.tableDs.forEach((record) => {
      record.reset();
    });
  }

  @Bind()
  handleChange(selVal) {
    this.setState({ selVal });
  }

  @Bind()
  handleBatchUpdate() {
    const { selVal, currencyLov, uomLov } = this.state;
    const selectData = this.tableDs.selected;
    const data = { currencyLov, uomLov };
    selectData.forEach((record) => {
      record.set(selVal, data[selVal]);
    });
  }

  render() {
    const { info, selVal } = this.state;
    const createBtn = (
      <Lov
        dataSet={this.createDs}
        name="companyLov"
        mode="button"
        color="primary"
        funcType="flat"
        icon="playlist_add"
        onChange={this.handleCreate}
      >
        {intl.get('hzero.common.button.new').d('新建')}
      </Lov>
    );
    const DelButton = observer(({ dataSet }) => {
      const hasCreateData = dataSet.selected.some((s) => s.status === 'add');
      return (
        <Button
          disabled={!hasCreateData}
          funcType="flat"
          color="primary"
          icon="delete"
          onClick={this.handleDelete}
        >
          {intl.get('hzero.common.button.delete').d('删除')}
        </Button>
      );
    });
    const BatButton = observer(({ dataSet }) => {
      return (
        <Button
          onClick={this.handleBatchUpdate}
          funcType="flat"
          color="primary"
          icon="application_allocation"
          disabled={dataSet.selected.length < 1}
        >
          {intl.get('small.common.button.batchUpdate').d('批量维护')}
        </Button>
      );
    });

    const lovBtn = (
      <Lov
        dataSet={this.batchDs}
        name={selVal || ''}
        placeholder={intl.get('small.common.view.pleaseChoose', {value: ''}).d(`请选择${''}`)}
        onChange={(item) => {
          this.setState({ [selVal]: item });
        }}
      />
    );
    const buttons = [
      createBtn,
      <Button icon="save" onClick={this.handleSave}>
        {intl.get('hzero.common.save').d('保存')}
      </Button>,
      <DelButton dataSet={this.tableDs} />,
      <Button funcType="flat" color="primary" icon="undo" onClick={this.handleCancel}>
        {intl.get('hzero.common.button.cancel').d('取消')}
      </Button>,
      <Select
        value={selVal}
        onChange={this.handleChange}
        style={{ width: 110, marginRight: 8 }}
        clearButton={false}
      >
        <Select.Option value="currencyLov">
          {intl.get('small.ecClient.view.defaultCurrency').d('默认币种')}
        </Select.Option>
        <Select.Option value="uomLov">
          {intl.get('small.ecClient.view.defaultUom').d('默认计量单位')}
        </Select.Option>
      </Select>,
      lovBtn,
      <BatButton dataSet={this.tableDs} />,
    ];

    const formLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    return (
      <React.Fragment>
        <Header
          title={intl.get('small.ecClient.view.ecClient.assignmentSet').d('分配设置')}
          backPath="/small/ec-client/list"
        />
        <Content className="small-custom-page-style">
          <Row gutter={24}>
            <Col span={6} style={{ marginRight: 40 }}>
              <Form.Item
                label={intl.get('small.common.model.ecPlatformName').d('电商名称')}
                {...formLayout}
              >
                {info.ecPlatformName}
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label={intl.get('small.common.model.ecCompanyName').d('电商公司名称')}
                {...formLayout}
              >
                {info.ecCompanyName}
              </Form.Item>
            </Col>
          </Row>
          <Table
            className="small-table-all-space"
            dataSet={this.tableDs}
            columns={this.columns}
            buttons={buttons}
          />
        </Content>
      </React.Fragment>
    );
  }
}
