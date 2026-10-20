/*
 * CollaboarationMode - 协同模式定义 Modal
 * @date: 2020-9-15
 * @author: JSS <shangshang.jing@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { PureComponent, Fragment } from 'react';
import { Modal, Table, Tooltip } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isFunction } from 'lodash';
import { connect } from 'dva';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

import CollModeSupplier from './CollModeSupplier';

@connect(({ loading, configServer }) => ({
  configServer,
  tenantId: getCurrentOrganizationId(),
  fetching: loading.effects['configServer/fetchCollaboarationMode'],
}))
export default class CollaboarationMode extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      collModeSupplierVisible: false,
    };
  }

  componentDidMount() {
    this.handleFetch();
  }

  @Bind()
  handleFetch() {
    const { dispatch, tenantId } = this.props;
    dispatch({
      type: 'configServer/fetchCollaboarationMode',
      payload: { tenantId },
    }).then((res) => {
      if (res) {
        this.setState({ dataSource: res });
      }
    });
  }

  /**
   * 关闭弹窗
   */
  @Bind()
  hideModal() {
    const { onState } = this.props;
    if (isFunction(onState)) {
      onState('collaboarationModeVisible', false);
    }
  }

  /**
   * 改变state
   */
  @Bind()
  handleStateChange(field, value, otherParams) {
    this.setState({ [field]: value, ...otherParams });
  }

  @Bind()
  handleToSpplierList(record) {
    this.setState({
      collModeSupplierVisible: true,
      invoiceRuleId: record.invoiceRuleId,
    });
  }

  render() {
    const { dataSource = [], collModeSupplierVisible, invoiceRuleId } = this.state;
    const { visible = false, fetching } = this.props;
    const tipObj = {
      ONE_SIDE: intl
        .get(`spfm.configServer.model.configServer.oneSideTip`)
        .d('单边协同流程由采购方发起，采购方进行自审核、复核'),
      TWO_SIDE: intl
        .get(`spfm.configServer.model.configServer.twoSideTip`)
        .d('双边协同流程由供应商发起，采购方进行审核、复核'),
    };
    const columns = [
      {
        title: intl.get(`spfm.configServer.model.configServer.invoiceRuleType`).d('协同模式'),
        dataIndex: 'invoiceRuleTypeMeaning',
        width: 250,
        render: (val, record) => <Tooltip title={tipObj[record.invoiceRuleType]}>{val}</Tooltip>,
      },
      {
        title: intl.get(`spfm.configServer.model.configServer.supplierInfo`).d('供应商信息'),
        dataIndex: 'supplierInfo',
        width: 250,
        render: (_, record) => (
          <Tooltip title={tipObj[record.invoiceRuleType]}>
            <a onClick={() => this.handleToSpplierList(record)}>
              {intl.get(`spfm.configServer.model.configServer.supplierList`).d('供应商列表')}
            </a>
          </Tooltip>
        ),
      },
    ];
    const tableProps = {
      loading: fetching,
      columns,
      dataSource,
      pagination: false,
      bordered: true,
    };
    const collModeSupplierProps = {
      invoiceRuleId,
      onState: this.handleStateChange,
      visible: collModeSupplierVisible,
    };
    return (
      <Fragment>
        <Modal
          title={intl
            .get(`spfm.configServer.view.message.modal.collaboarationMode`)
            .d('协同模式定义')}
          visible={visible}
          onCancel={this.hideModal}
          width={600}
          footer={null}
        >
          <Table {...tableProps} />
        </Modal>
        {collModeSupplierVisible && <CollModeSupplier {...collModeSupplierProps} />}
      </Fragment>
    );
  }
}
