/**
 * plantNum - 新建分配
 * @date: 2019 1/1
 * @author: LC <chao.li03@hand-china>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
import { Form, Button, Modal } from 'hzero-ui';
import { isNumber, sum } from 'lodash';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { dateRender } from 'utils/renderer';
import { createPagination } from 'utils/utils';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';

import intl from 'utils/intl';
// import {
//   // getEditTableData,
//   // addItemToPagination,
//   // delItemsToPagination,
//  // getCurrentOrganizationId,
// } from 'utils/utils';
import EditTable from 'components/EditTable';
// import notification from 'utils/notification';

// import SourceFilterForm from './SourceFilterForm';
import styles from '../index.less';
import OrederFilterForm from './OrderFilterForm';
@connect(({ supplierCommon, loading }) => ({
  supplierCommon,
  loading: loading.effects['supplierCommon/fetchSourceList'],
}))
@Form.create({ fieldNameProp: null })
export default class OrderList extends Component {
  constructor(props) {
    super(props);
    this.props.onRef(this);
    this.state = {
      // tenantId: getCurrentOrganizationId(),
      selectedRowKeys: [],
      selectedRows: [],
      tagShow: false,
    };
  }

  componentDidMount() {
    this.handleSearch();
  }

  /**
   * 查询供应商来源单据
   * @param {Object} fields 查询字段
   */
  @Bind()
  handleSearch(page = {}) {
    const fields = this.orderForm ? this.orderForm.props.form.getFieldsValue() : {};
    const handleFormValues = this.handleFormQuery(fields);
    const { dispatch, data = {} } = this.props;
    const { companyId, ouId, supplierCompanyId } = data;
    dispatch({
      type: 'supplierCommon/fetchOrder',
      payload: {
        page,
        // supplierDeductionsId: data.supplierDeductionsId,
        ...handleFormValues,
        companyId,
        ouId,
        supplierCompanyId,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          dataSource: res.content,
          pagination: createPagination(res),
        });
      }
    });
  }

  /**
   * 处理表单中的查询条件
   * @param {Object} filterValues
   * @param {String} radioTab
   */
  handleFormQuery(filterValues) {
    const dealTime = {};
    let timeArray = [];
    timeArray = ['releasedDateFrom', 'releasedDateTo'];
    timeArray.forEach((item) => {
      if (item === 'releasedDateTo') {
        dealTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MAX) : undefined;
      } else {
        dealTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MIN) : undefined;
      }
    });
    return {
      ...filterValues,
      ...dealTime,
    };
  }

  // 保存
  @Bind()
  handleSave() {
    const { selectedRows } = this.state;
    const { handleCreateOrder } = this.props;
    handleCreateOrder(selectedRows);
    // const { dataSource } = this.state;
    // const { dispatch } = this.props;
    // const lines = getEditTableData(dataSource, ['upstreamId', '_status']);
    // if (dataSource.length === 0 || (Array.isArray(lines) && lines.length !== 0)) {
    //   dispatch({
    //     type: 'supplierCommon/saveSource',
    //     payload: { lines },
    //   }).then(res => {
    //     if (res) {
    //       notification.success();
    //       this.handleSearch();
    //     } else {
    //       this.handleSearch();
    //     }
    //   });
    // }
  }

  /**
   * 设置选中行
   * @param {Array} selectedRowKeys
   * @param {Array} selectedRows
   */
  @Bind()
  handleSelectChange(selectedRowKeys, rows) {
    this.setState({
      selectedRowKeys,
      selectedRows: rows,
    });
  }

  @Bind()
  hoverTagShow() {
    const { tagShow } = this.state;
    this.setState({
      tagShow: !tagShow,
    });
  }

  @Bind()
  hoverTagHide() {
    this.setState({
      tagShow: false,
    });
  }

  render() {
    const {
      visible,
      handleChangeVisible,
      loading,
      // dataSource,
      // data,
    } = this.props;
    const {
      dataSource = [],
      // tenantId,
      pagination,
      selectedRowKeys,
    } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleSelectChange,
      type: 'radio',
    };
    const columns = [
      {
        title: intl.get(`sodr.common.model.common.displayPoNum`).d('订单编号'),
        dataIndex: 'displayPoNum',
        width: 150,
        fixed: 'left',
      },
      {
        title: intl.get(`sodr.common.model.common.statusCode`).d('订单状态'),
        dataIndex: 'statusCodeMeaning',
        width: 100,
      },
      {
        title: intl.get(`sodr.common.model.common.orderTypeName`).d('订单类型'),
        dataIndex: 'orderTypeName',
        width: 100,
      },
      {
        title: intl.get(`sodr.common.model.common.purchaseAgentName`).d('采购员'),
        dataIndex: 'purchaseAgentName',
        width: 100,
      },
      {
        title: intl.get(`sodr.common.model.common.organizationName`).d('采购组织'),
        dataIndex: 'organizationName',
        width: 100,
      },
      {
        title: intl.get(`sodr.common.model.common.poNum`).d('SRM订单号'),
        dataIndex: 'poNum',
        width: 100,
      },
      {
        title: intl.get(`sodr.common.model.common.claimHeaderNum`).d('协议编号'),
        dataIndex: 'claimHeaderId',
        width: 100,
      },
      {
        title: intl.get(`sodr.common.model.common.poSourcePlatform`).d('来源系统'),
        dataIndex: 'poSourcePlatform',
        width: 100,
      },
      {
        title: intl.get(`sodr.common.model.common.releasedDate`).d('发布日期'),
        dataIndex: 'releasedDate',
        width: 100,
        render: dateRender,
      },
    ];
    const orderFilterProps = {
      pagination,
      onSearch: this.handleSearch,
      onRef: (node) => {
        this.orderForm = node;
      },
    };
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    const modalProps = {
      visible,
      width: '1000px',
      mask: true,
      onCancel: () => handleChangeVisible(false),
      bodyStyle: { overflow: 'auto' },
      title: intl.get(`sfin.source.view.message.title.num`).d(`关联订单`),
      footer: (
        <div>
          <Button type="primary" onClick={() => this.handleSave()}>
            {intl.get('hzero.common.button.ok').d('确定')}
          </Button>
          <Button onClick={() => handleChangeVisible(false)}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
        </div>
      ),
    };
    const tableProps = {
      rowKey: 'upstreamId',
      columns,
      dataSource,
      pagination,
      rowSelection,
      loading,
      onChange: (page) => this.handleSearch(page),
    };
    return (
      <Fragment>
        <Modal {...modalProps}>
          <div className="table-list-search">
            <OrederFilterForm {...orderFilterProps} />
            <div className={styles['item-list-search']}>
              <EditTable {...tableProps} scroll={{ x: scrollX }} bordered />
            </div>
          </div>
        </Modal>
      </Fragment>
    );
  }
}
