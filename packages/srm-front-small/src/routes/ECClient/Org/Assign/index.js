/**
 * ecClientAssign - 电商账号管理 - 分配设置
 * @date: 2019-2-25
 * @author: Wu <qizheng.wu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { Button, Row, Col } from 'hzero-ui';
import qs from 'querystring';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';

import AssignTable from './AssignTable';
import EditModal from './EditModal';

/**
 * 电商账号管理 - 分配设置
 * @extends {Component} - React.Component
 * @reactProps {Object} ecClientAssign - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

@connect(({ ecClientAssign, loading }) => ({
  ecClientAssign,
  saveLoading: loading.effects['ecClientAssign/saveData'],
  fetchLoading: loading.effects['ecClientAssign/fetchData'],
}))
@formatterCollections({ code: ['small.assign, small.common'] })
export default class Assign extends React.Component {
  constructor(props) {
    super(props);
    const { ecClientId = '' } = qs.parse(props.history.location.search.substr(1));
    this.state = {
      ecClientId,
      editData: {},
      editModalVisible: false,
    };
  }

  componentDidMount() {
    this.fetchClientData();
    this.fetchAssignData();
  }

  /**
   * 获取电商账号数据
   */
  @Bind()
  fetchClientData() {
    const { dispatch } = this.props;
    const { ecClientId } = this.state;
    dispatch({
      type: 'ecClientAssign/fetchClientData',
      payload: {
        ecClientId,
      },
    });
  }

  /**
   * 获取表格数据
   */
  @Bind()
  fetchAssignData() {
    const { ecClientId } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'ecClientAssign/fetchData',
      payload: { ecClientId },
    });
  }

  /**
   * 保存数据
   * @param {Object} fieldsValue 行数据
   */
  @Bind()
  saveData(fieldsValue = {}) {
    const { dispatch } = this.props;
    const { editData, ecClientId } = this.state;
    dispatch({
      type: 'ecClientAssign/saveData',
      payload: { ecClientId, ...editData, ...fieldsValue },
    }).then(res => {
      if (res) {
        notification.success();
        this.hiddenModal();
        this.fetchAssignData();
      }
    });
  }

  /**
   * 显示modal
   */
  @Bind()
  showModal() {
    this.setState({
      editData: {},
      editModalVisible: true,
    });
  }

  /**
   * 隐藏modal
   */
  @Bind()
  hiddenModal() {
    this.setState({
      editModalVisible: false,
    });
  }

  /**
   * 编辑数据
   */
  @Bind()
  handleUpdateAssign(record = {}) {
    this.setState({
      editData: record,
      editModalVisible: true,
    });
  }

  /**
   * 立即验证
   * @param {Object} record 行数据
   */
  @Bind()
  handleVerify(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'ecClientAssign/addEcQualification',
      payload: record.companyId,
    }).then(res => {
      if (res) {
        notification.success();
        this.fetchAssignData();
      }
    });
  }

  render() {
    const {
      fetchLoading,
      ecClientAssign: { assignData = [], ecClientData = {}, mapStatusList = [] },
    } = this.props;
    const editTableOption = {
      dataSource: assignData,
      loading: fetchLoading,
      onEdit: this.handleUpdateAssign,
      onVerify: this.handleVerify,
    };
    const { editData, editModalVisible } = this.state;
    return (
      <React.Fragment>
        <Header
          title={intl.get('small.assign.view.ecClient.assignmentSet').d('分配设置')}
          backPath="/small/ec-client/list"
        >
          <Button icon="plus" type="primary" onClick={this.showModal}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            <Row gutter={24}>
              <Col span={6}>
                {intl.get('small.common.model.ecPlatformName').d('电商名称')}：
                {ecClientData.ecPlatformName}
              </Col>
              <Col span={6}>
                {intl.get('small.common.model.ecCompanyName').d('电商公司名称')}：
                {ecClientData.ecCompanyName}
              </Col>
            </Row>
          </div>
          <AssignTable {...editTableOption} />
          <EditModal
            mapStatusList={mapStatusList}
            title={
              editData.ecClientId === undefined
                ? intl.get('small.assign.view.message.title.modal.create').d('新建公司分配设置')
                : intl.get('small.assign.view.message.title.modal.edit').d('维护公司分配设置')
            }
            editModalVisible={editModalVisible}
            initData={editData}
            onCancel={this.hiddenModal}
            onOk={this.saveData}
          />
        </Content>
      </React.Fragment>
    );
  }
}
