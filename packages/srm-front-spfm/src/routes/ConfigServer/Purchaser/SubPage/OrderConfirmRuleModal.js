/*
 * @Description: 订单确认、反馈审核及回传ERP规则
 * @Date: 2020-03-11 15:28:38
 * @Author: HJ <jinhuang02@hand-china.com>
 * @Version: version 0.0.1
 * @Copyright: Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Modal, Button, Form, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import { getEditTableData } from 'utils/utils';
import notification from 'utils/notification';
import Checkbox from 'components/Checkbox';
import EditTable from 'components/EditTable';
import uuidv4 from 'uuid/v4';
import intl from 'utils/intl';

import styles from './index.less';

const FormItem = Form.Item;

@connect(({ loading, configServer }) => ({
  saving: loading.effects['configServer/saveOrderConfirmRule'],
  loading: loading.effects['configServer/fetchoOrderConfirmRuleList'],
  configServer,
}))
export default class OrderConfirmRuleModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      // tenantId: getCurrentOrganizationId(),
    };
  }

  componentDidMount() {
    this.handleSearch();
  }

  /**
   * 查询并单规则列表
   * @param {Object} [page={}]
   */
  @Bind()
  handleSearch() {
    const { dispatch } = this.props;
    dispatch({
      type: 'configServer/fetchoOrderConfirmRuleList',
    }).then((res) => {
      if (res) {
        this.setState({
          dataSource: res.map((item) => ({ ...item, _status: 'update', lineId: uuidv4() })),
        });
      }
    });
  }

  @Bind()
  resetDataSource() {
    this.setState({
      dataSource: [],
    });
  }

  /**
   * 关闭并单规则弹窗
   */
  @Bind()
  hideModal() {
    const { onCloseModal } = this.props;
    if (onCloseModal) {
      this.resetDataSource();
      onCloseModal('orderConfirmVisible', false);
    }
  }

  /**
   * 保存并单规则
   * @returns
   */
  @Bind()
  saveList() {
    const { dispatch } = this.props;
    const { dataSource } = this.state;
    const addList = getEditTableData(dataSource, ['lineId']);
    const addListAddHide = addList.map((item, index) => {
      return { ...item, feedbackApproveFlag: dataSource[index].feedbackApproveFlag };
    });
    dispatch({
      type: 'configServer/saveOrderConfirmRule',
      payload: {
        poMergeRules: addListAddHide,
      },
    }).then((data) => {
      if (data) {
        this.handleSearch();
        notification.success();
      }
    });
  }

  // 是否可编辑 事件回调
  @Bind()
  handleCheckboxEdit(e, record) {
    const {
      $form: { setFieldsValue },
    } = record;
    const { checked } = e.target;
    const { dataSource = [] } = this.state;
    const data = dataSource.map((item) => {
      if (item.lineId === record.lineId) {
        // 如果没勾选，其后面的勾选都置灰
        if (+checked === 0) {
          setFieldsValue({
            requiredFlag: 0,
            // feedbackApproveFlag: 0,
            // returnToErpFlag: 0,
          });
          return {
            ...item,
            requiredFlag: 0,
            // feedbackApproveFlag: 0,
            // returnToErpFlag: 0,
          };
        } else {
          // 如果勾选，其他可以编辑
          return {
            ...item,
            editFlag: 1,
          };
        }
      }
      return item;
    });
    this.setState({
      dataSource: data,
    });
  }

  // 勾选 回传ERP 回调
  @Bind()
  handleCheckboxReturn(e, record) {
    const {
      $form: { setFieldsValue },
    } = record;
    const { checked } = e.target;
    const { dataSource = [] } = this.state;

    const data = dataSource.map((item) => {
      if (item.lineId === record.lineId) {
        if (+checked === 1) {
          setFieldsValue({
            editFlag: 1,
            requiredFlag: 1,
            // feedbackApproveFlag: 1,
          });
          return {
            ...item,
            editFlag: 1,
            requiredFlag: 1,
            // feedbackApproveFlag: 1,
          };
        } else {
          return {
            ...item,
            returnToErpFlag: 0,
          };
        }
      }
      return item;
    });
    this.setState({
      dataSource: data,
    });
  }

  // 勾选 反馈后审核 回调
  handleCheckboxFeedbackFlag = (e, record) => {
    const {
      $form: { setFieldsValue },
    } = record;
    const { checked } = e.target;
    const { dataSource = [] } = this.state;
    const data = dataSource.map((item) => {
      if (item.lineId === record.lineId) {
        if (+checked === 1) {
          setFieldsValue({
            editFlag: 1,
            requiredFlag: 1,
          });
          return {
            ...item,
            editFlag: 1,
            requiredFlag: 1,
          };
        } else {
          return {
            ...item,
            // feedbackApproveFlag: 0,
          };
        }
      }
      return item;
    });
    this.setState({
      dataSource: data,
    });
  };

  // 必输 勾选 回调
  handleCheckboxRequiredFlag = (e, record) => {
    const { checked } = e.target;
    const { dataSource = [] } = this.state;
    const data = dataSource.map((item) => {
      if (item.lineId === record.lineId) {
        if (+checked === 1) {
          record.$form.setFieldsValue({
            requiredFlag: 1,
          });
          return {
            ...item,
            requiredFlag: 1,
          };
        } else {
          return {
            ...item,
            requiredFlag: 0,
          };
        }
      }
      return item;
    });
    this.setState({
      dataSource: data,
    });
  };

  render() {
    const { visible, saving, loading } = this.props;
    const { dataSource } = this.state;
    const columns = [
      {
        title: intl.get('spfm.configServer.model.order.fieldName').d('字段名'),
        dataIndex: 'fieldNameMeaning',
        align: 'left',
      },
      {
        title: intl.get('spfm.configServer.model.order.editFlag').d('可编辑'),
        dataIndex: 'editFlag',
        align: 'left',
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`editFlag`, {
              initialValue: val === 0 ? 0 : 1,
            })(
              <Checkbox
                disabled={
                  // record.returnToErpFlag ||
                  // record.feedbackApproveFlag ||
                  record.requiredFlag ||
                  // record.$form.getFieldValue('returnToErpFlag') ||
                  // record.$form.getFieldValue('feedbackApproveFlag') ||
                  record.$form.getFieldValue('requiredFlag')
                }
                onChange={(e) => this.handleCheckboxEdit(e, record)}
              />
            )}
          </FormItem>
        ),
      },
      {
        title: intl.get('spfm.configServer.model.order.requiredFlag').d('必输'),
        dataIndex: 'requiredFlag',
        align: 'left',
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`requiredFlag`, {
              initialValue: val === 0 ? 0 : 1,
            })(
              <Checkbox
                disabled={
                  !record.editFlag ||
                  // record.returnToErpFlag ||
                  // record.feedbackApproveFlag ||
                  !record.$form.getFieldValue('editFlag')
                  // record.$form.getFieldValue('returnToErpFlag')
                  // record.$form.getFieldValue('feedbackApproveFlag')
                }
                onChange={(e) => this.handleCheckboxRequiredFlag(e, record)}
              />
            )}
          </FormItem>
        ),
      },
      // {
      //   title: intl.get('spfm.configServer.model.order.approveAfterFeedback').d('反馈后审核'),
      //   dataIndex: 'feedbackApproveFlag',
      //   align: 'left',
      //   render: (val, record) => (
      //     <FormItem>
      //       {record.$form.getFieldDecorator(`feedbackApproveFlag`, {
      //         initialValue: val === 0 ? 0 : 1,
      //       })(
      //         <Checkbox
      //           disabled={
      //             !record.editFlag ||
      //             record.returnToErpFlag ||
      //             !record.$form.getFieldValue('editFlag') ||
      //             record.$form.getFieldValue('returnToErpFlag')
      //           }
      //           onChange={e => this.handleCheckboxFeedbackFlag(e, record)}
      //         />
      //       )}
      //     </FormItem>
      //   ),
      // },
      // {
      //   title: intl.get('spfm.configServer.model.order.getBackERP').d('回传ERP'),
      //   dataIndex: 'returnToErpFlag',
      //   align: 'left',
      //   render: (val, record) => (
      //     <FormItem>
      //       {record.$form.getFieldDecorator(`returnToErpFlag`, {
      //         initialValue: val === 0 ? 0 : 1,
      //       })(
      //         <Checkbox
      //           onChange={(e) => this.handleCheckboxReturn(e, record)}
      //           disabled={!record.editFlag || !record.$form.getFieldValue('editFlag')}
      //         />
      //       )}
      //     </FormItem>
      //   ),
      // },
    ];
    return (
      <Modal
        title={intl
          .get('spfm.configServer.view.order.modal.confirmRule.title')
          .d('订单确认、反馈审核及回传ERP规则')}
        visible={visible}
        footer={null}
        width={600}
        onCancel={this.hideModal}
      >
        <Row>
          <Col>
            <Button
              icon="save"
              type="primary"
              onClick={this.saveList}
              style={{ float: 'right' }}
              loading={saving || loading}
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
          </Col>
        </Row>

        <EditTable
          bordered
          className={styles['order-config-table']}
          loading={loading}
          rowKey="lineId"
          dataSource={dataSource}
          pagination={false}
          onChange={this.handleSearch}
          columns={columns}
        />
      </Modal>
    );
  }
}
