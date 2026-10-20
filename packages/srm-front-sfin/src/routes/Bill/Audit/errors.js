import React, { PureComponent } from 'react';
import { connect } from 'dva';

import { withRouter } from 'dva/router';
import { Table, Modal, Button } from 'hzero-ui';
import { isFunction } from 'lodash';
import { Bind } from 'lodash-decorators';
import { dateTimeRender } from 'utils/renderer';

import intl from 'utils/intl';

@connect(({ bill, loading }) => ({
  bill,
  loading: loading.effects['bill/fetchErrorList'],
}))
@withRouter
export default class ErrorList extends PureComponent {
  /**
   * state初始化
   * @param {objet} props - 组件props
   */
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
  }

  /**
   * 操作记录查询
   * @param {object} page - 查询参数
   */
  @Bind()
  async handleSearch(page = {}) {
    this.props.dispatch({
      type: 'bill/fetchErrorList',
      payload: {
        documentType: 'EC_BILL',
        errorSourceType: 'EC_CREATE_BILL',
        page,
      },
    });
  }

  @Bind()
  closeSearch() {
    const { dispatch } = this.props;
    dispatch({
      type: 'bill/updateState',
      payload: {
        operationRecordPagination: {},
        operationRecordList: {}, // 缓存的操作记录数据要清空
      },
    });
  }

  /**
   * render查询表单
   */
  render() {
    const {
      loading,
      bill: { errorDataSource = [], errorPagination = {} },
      visible,
      hideModal,
    } = this.props;
    const columns = [
      {
        title: intl.get(`ssta.ecAutoBill.model.ecAutoBill.ecBillNum`).d('电商账单编号'),
        dataIndex: 'documentNum',
        width: 140,
      },
      {
        title: intl.get(`ssta.ecAutoBill.model.ecAutoBill.billCompany`).d('对账公司'),
        dataIndex: 'companyName',
        width: 160,
      },
      {
        title: intl.get(`ssta.ecAutoBill.model.ecAutoBill.billSupplierCompany`).d('对账供应商'),
        dataIndex: 'supplierCompanyName',
        width: 160,
      },
      {
        title: intl.get(`ssta.ecAutoBill.model.ecAutoBill.pushTime`).d('推送时间'),
        dataIndex: 'lastUpdateDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`ssta.ecAutoBill.model.ecAutoBill.pushReason`).d('推送失败原因'),
        dataIndex: 'errorMsg',
        // width: 180,
      },
    ];

    return (
      <Modal
        title={intl.get('ssta.ecAutoBill.view.message.errors').d('错误记录')}
        visible={visible}
        onCancel={hideModal}
        footer={
          <Button type="primary" onClick={hideModal}>
            {intl.get('hzero.common.button.close').d('关闭')}
          </Button>
        }
        width={1000}
        bodyStyle={{ minHeight: 300 }}
      >
        <Table
          tab={intl.get('ssta.ecAutoBill.view.message.errors').d('错误记录')}
          loading={loading}
          dataSource={errorDataSource}
          pagination={errorPagination}
          rowKey="recordId"
          onChange={this.handleSearch}
          columns={columns}
          bordered
        />
      </Modal>
    );
  }
}
