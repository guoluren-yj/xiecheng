/**
 * Drawer -商城资源
 * @date: 2019-11-20
 * @author lzj <zhijian.li@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { Component, Fragment } from 'react';
import { Bind } from 'lodash-decorators';
import { isUndefined, isEmpty } from 'lodash';
import { connect } from 'dva';
import { Table, Button, Icon } from 'hzero-ui';

import formatterCollections from 'utils/intl/formatterCollections';
import { enableRender } from 'utils/renderer';
import intl from 'utils/intl';
import { filterNullValueObject } from 'utils/utils';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';

import FilterForm from './FilterForm';
import Drawer from './Drawer';

const commonKey = 'scec.common';
const prompKey = 'scec.mallResource';
@connect(({ mallResource, loading }) => ({
  mallResource,
  initloading: loading.effects['mallResource/fetchComanyInfo'],
  createLoading: loading.effects['mallResource/addCompanyList'],
  saveLoading: loading.effects['mallResource/updateCompanyList'],
}))
@formatterCollections({ code: ['scec.MallResoyrce', 'scec.common'] })
export default class MallResource extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      tableRecord: {},
      pagination: {},
      // content: {},
    };
  }

  componentDidMount() {
    this.fetchCompanyList();
  }

  /**
   *查询公司集团列表信息
   */
  @Bind()
  fetchCompanyList(params) {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    const { pagination } = this.state;
    dispatch({
      type: 'mallResource/fetchComanyInfo',
      payload: {
        page: isEmpty(params) ? pagination : params,
        ...filterValues,
      },
    });
  }

  // 绑定表单ref
  @Bind()
  handleRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 编辑
   */
  @Bind()
  handleEditData(record = {}) {
    this.setState({
      visible: true,
      tableRecord: record,
    });
  }

  /**
   * 取消
   */
  @Bind()
  handleCancel() {
    this.setState({
      visible: false,
      tableRecord: {},
    });
  }

  /**
   * 新建
   */
  @Bind()
  handleCreateData() {
    this.setState({
      visible: true,
      tableRecord: {},
    });
  }

  /**
   * 保存数据
   */
  @Bind()
  handleSaveData(data) {
    const { dispatch } = this.props;
    const { objectVersionNumber } = data;

    if (objectVersionNumber) {
      dispatch({
        type: 'mallResource/updateCompanyList',
        payload: data,
      }).then(res => {
        if (res) {
          notification.success();
          this.fetchCompanyList();
          this.handleCancel();
        }
      });
    } else {
      dispatch({
        type: 'mallResource/addCompanyList',
        payload: data,
      }).then(res => {
        if (res) {
          notification.success();
          this.fetchCompanyList();
          this.handleCancel();
        }
      });
    }
  }

  // 进入模板定义
  @Bind()
  handleDetail(record) {
    this.props.history.push(`/scec/mall-resource/template/edit/${record.pageConfigId}`);
  }

  render() {
    const { initloading, saveLoading, createLoading } = this.props;
    const { visible, tableRecord } = this.state;
    const columns = [
      {
        title: intl.get(`${commonKey}.view.groupNum`).d('集团编码'),
        dataIndex: 'groupNum',
        width: 100,
      },
      {
        title: intl.get(`${commonKey}.view.groupName`).d('集团名称'),
        dataIndex: 'groupName',
        width: 200,
      },
      {
        title: intl.get(`${commonKey}.view.companyNum`).d('公司编码'),
        dataIndex: 'companyNum',
        width: 100,
      },
      {
        title: intl.get(`${commonKey}.view.companyName`).d('公司名称'),
        dataIndex: 'companyName',
        width: 200,
      },
      {
        title: intl.get(`${commonKey}.view.webUrl`).d('二级页面域名'),
        dataIndex: 'webUrl',
        width: 250,
      },
      {
        title: intl.get(`${commonKey}.view.SRMUrl`).d('SRM域名'),
        dataIndex: 'srmUrl',
        width: 250,
      },
      {
        title: intl.get(`${commonKey}.view.enabledFlag`).d('启用'),
        dataIndex: 'enabledFlag',
        width: 80,
        render: enableRender,
      },
      {
        title: intl.get(`${commonKey}.view.companyName`).d('操作'),
        dataIndex: 'edit',
        width: 150,
        render: (_, record) => (
          <span className="action-link">
            <a
              onClick={() => {
                this.handleDetail(record);
              }}
            >
              {intl.get(`${prompKey}.view.mallHomeConfig`).d('商城首页配置')}
            </a>
            <a
              onClick={() => {
                this.handleEditData(record);
              }}
            >
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
          </span>
        ),
      },
    ];

    const filterList = {
      onRef: this.handleRef,
      fetchCompanyList: this.fetchCompanyList,
    };

    const detailprops = {
      visible,
      tableRecord,
      anchor: 'right',
      onCancel: this.handleCancel,
      onHandleSave: this.handleSaveData,
      confirmLoading: saveLoading || createLoading,
    };

    const { companyList, pagination } = this.props.mallResource;

    return (
      <Fragment>
        <Header title={intl.get(`${prompKey}.view.configList`).d('首页配置列表')}>
          <Button type="primary" onClick={this.handleCreateData}>
            <Icon type="plus" />
            {intl.get(`${commonKey}.model.new`).d('新建')}
          </Button>
        </Header>
        <Content>
          <FilterForm {...filterList} />
          <Table
            bordered
            pagination={pagination}
            rowKey="assignId"
            columns={columns}
            loading={initloading}
            onChange={page => {
              this.fetchCompanyList(page);
            }}
            scroll={{ x: 1380 }}
            dataSource={companyList}
          />
        </Content>
        <Drawer {...detailprops} />
      </Fragment>
    );
  }
}
