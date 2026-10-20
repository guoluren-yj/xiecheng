import React, { Component } from 'react';
import { Button, DataSet, Table } from 'choerodon-ui/pro';
import { Radio, Tag } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';

import c7nModal from '@/utils/c7nModal';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';

// import styles from './index.less';
import { updateServiceTitle } from '@/services/serviceManageServices';
import { tableDs, formDs } from './tableDs';
import ServiceForm from './form';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

export default class ServiceManage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      serType: [],
    };
  }

  tableDS = new DataSet(tableDs());

  formDS = new DataSet(formDs());

  componentDidMount() {
    this.fetchServiceTitle();
  }

  @Bind()
  async handleUpdate(record, flag) {
    const data = record.toData();
    const param = { ...data, status: flag };
    const res = getResponse(await updateServiceTitle(param));
    if (res) {
      this.tableDS.query();
    }
  }

  @Bind()
  fetchServiceTitle() {
    this.tableDS.query();
  }

  @Bind()
  handleType(e) {
    const { serType } = this.state;
    const currentValue = e.target.value;
    const current = serType.filter((i) => i.menuDeployId === currentValue);
    this.setState({ currentList: current?.[0] });
    this.tableDS.setQueryParameter('queryParams', {
      menuDeployId: current?.[0]?.menuDeployList?.[0]?.menuDeployId,
    });
    this.tableDS.query();
  }

  @Bind()
  handleFetch(e) {
    this.tableDS.setQueryParameter('queryParams', {
      menuDeployId: e.target.value,
    });
    this.tableDS.query();
  }

  @Bind()
  async handleSave(record = {}) {
    const flag = await this.formDS.current.validate();
    const data = this.formDS.toData();
    const recordData = record.toData();
    if (flag) {
      const res = getResponse(await updateServiceTitle({ ...recordData, ...data?.[0] }));
      if (res) {
        notification.success();
        this.tableDS.query();
      }
    } else {
      return false;
    }
  }

  @Bind()
  addService(record) {
    c7nModal({
      title: intl.get('smop.common.view.addService').d('新增服务'),
      style: { width: 380 },
      children: <ServiceForm formDS={this.formDS} record={record} />,
      onOk: () => this.handleSave(record),
    });
  }

  @Bind()
  renderFilter() {
    const { serType, currentList } = this.state;
    if (serType?.length > 0) {
      return (
        <>
          <div style={{ marginBottom: 19 }}>
            <span style={{ marginRight: 8 }}>
              {intl.get('smop.common.view.jointType').d('对接类型')}：
            </span>
            <RadioGroup
              size="small"
              defaultValue={serType?.[0]?.menuDeployId}
              onChange={(e) => this.handleType(e)}
            >
              {serType.map((item) => (
                <RadioButton value={item?.menuDeployId} style={{ marginRight: 24 }}>
                  {item?.name}
                </RadioButton>
              ))}
            </RadioGroup>
          </div>
          <div style={{ marginBottom: 19 }}>
            <span style={{ marginRight: 8 }}>
              {intl.get('smop.common.view.serviceSort').d('服务分类')}：
            </span>
            <RadioGroup
              size="small"
              defaultValue={currentList?.menuDeployId}
              onChange={(e) => this.handleFetch(e)}
            >
              {currentList?.menuDeployList.map((item) => (
                <RadioButton value={item?.menuDeployId} style={{ marginRight: 24 }}>
                  {item?.title}
                </RadioButton>
              ))}
            </RadioGroup>
          </div>
        </>
      );
    }
  }

  render() {
    const columns = [
      { name: 'name' },
      { name: 'introduction' },
      { name: 'necessity' },
      { name: 'menuDeployName' },
      { name: 'interactionMode' },
      { name: 'dailRequestAmount' },
      {
        name: 'status',
        renderer: ({ value }) => {
          return (
            <Tag style={{ ...colorStyle(value) }}>
              {value
                ? intl.get('smop.common.view.startUse').d('启用')
                : intl.get('smop.common.view.disabled').d('禁用')}
            </Tag>
          );
        },
      },
      {
        name: 'operation',
        width: 150,
        renderer: ({ record }) => (
          <span className="action-link">
            <a onClick={() => this.addService(record)}>
              {intl.get('smop.common.view.detail').d('详情')}
            </a>
            {record.get('status') ? (
              <a onClick={() => this.handleUpdate(record, 0)}>
                {intl.get('smop.common.view.disabled').d('禁用')}
              </a>
            ) : (
              <a onClick={() => this.handleUpdate(record, 1)}>
                {intl.get('smop.common.view.startUse').d('启用')}
              </a>
            )}
          </span>
        ),
      },
    ];
    const colorStyle = (value) => {
      if (value) {
        return {
          backgroundColor: 'rgba(71,184,129,0.1)',
          color: '#47B881',
          border: 'none',
        };
      } else {
        return {
          backgroundColor: 'rgba(245,99,73,0.1)',
          color: '#F56349',
          border: 'none',
        };
      }
    };
    return (
      <div>
        <Header title={intl.get('smop.common.view.serviceCenter').d('服务中心')}>
          <Button color="primary" onClick={() => this.addService(undefined)} icon="add">
            {intl.get('smop.common.view.addService').d('新增服务')}
          </Button>
        </Header>
        <Content>
          {this.renderFilter()}
          <Table dataSet={this.tableDS} columns={columns} />
        </Content>
      </div>
    );
  }
}
