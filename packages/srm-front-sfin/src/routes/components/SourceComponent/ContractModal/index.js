/**
 * plantNum - 新建分配
 * @date: 2019 1/1
 * @author: LC <chao.li03@hand-china>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
import { Form, Button, Modal } from 'hzero-ui';
import { isNumber, sum, isEmpty } from 'lodash';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { createPagination } from 'utils/utils';
import { dateTimeRender } from 'utils/renderer';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import intl from 'utils/intl';
import EditTable from 'components/EditTable';

import styles from '../index.less';
import ContractFilterForm from './ContractFilterForm';

@connect(({ supplierCommon, loading }) => ({
  supplierCommon,
  loading: loading.effects['supplierCommon/fetchSourceList'],
}))
@Form.create({ fieldNameProp: null })
export default class ContractList extends Component {
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
    this.init();
    this.handleSearch();
  }

  @Bind()
  init() {
    const { dispatch } = this.props;
    dispatch({
      type: 'supplierCommon/init',
    });
  }

  /**
   * 查询供应商来源单据
   * @param {Object} fields 查询字段
   */
  @Bind()
  handleSearch(page = {}) {
    const fields = this.contractForm ? this.contractForm.props.form.getFieldsValue() : {};
    const handleFormValues = this.handleFormQuery(fields);
    const { dispatch, data = {} } = this.props;
    const { companyId, ouId, supplierCompanyId } = data;
    dispatch({
      type: 'supplierCommon/fetchContract',
      payload: {
        page,
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
    timeArray = ['creationDateFrom', 'creationDateTo'];
    timeArray.forEach((item) => {
      if (item === 'creationDateTo') {
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
    const { handleCreateContract } = this.props;
    handleCreateContract(selectedRows);
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
      supplierCommon: { pcContractStatus = {} },
      // dataSource,
    } = this.props;
    const {
      dataSource = [],
      pagination,
      // tenantId,
      selectedRowKeys,
    } = this.state;
    const rowSelection = {
      selectedRowKeys,
      type: 'radio',
      onChange: this.handleSelectChange,
    };
    const columns = [
      {
        title: intl.get(`sodr.common.model.common.pcNum`).d('协议编号'),
        dataIndex: 'pcNum',
        width: 100,
      },
      {
        title: intl.get(`sodr.common.model.common.pcStatusCodeMeaning`).d('状态'),
        dataIndex: 'pcStatusCodeMeaning',
        width: 100,
      },
      {
        title: intl.get(`sodr.common.model.common.pcName`).d('协议名称'),
        dataIndex: 'pcName',
        width: 100,
      },
      {
        title: intl.get(`sodr.common.model.common.pcKindCode`).d('协议性质'),
        dataIndex: 'pcKindCodeMeaning',
        width: 100,
      },
      {
        title: intl.get(`sodr.common.model.common.pcSourceCode`).d('协议来源'),
        dataIndex: 'pcSourceCodeMeaning',
        width: 100,
      },
      {
        title: intl.get(`sodr.common.model.common.creationDate`).d('创建时间'),
        dataIndex: 'creationDate',
        width: 100,
        render: dateTimeRender,
      },
    ];
    const contractFilterProps = {
      pcContractStatus,
      onSearch: this.handleSearch,
      onRef: (node) => {
        this.contractForm = node;
      },
    };
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    const modalProps = {
      visible,
      width: '1000px',
      mask: true,
      onCancel: () => handleChangeVisible(false),
      bodyStyle: { overflow: 'auto' },
      title: intl.get(`sfin.source.view.message.title.num`).d(`关联协议`),
      footer: (
        <div>
          <Button
            type="primary"
            onClick={() => this.handleSave()}
            disabled={isEmpty(selectedRowKeys)}
          >
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
            <ContractFilterForm {...contractFilterProps} />
            <div className={styles['item-list-search']}>
              <EditTable {...tableProps} scroll={{ x: scrollX }} bordered />
            </div>
          </div>
        </Modal>
      </Fragment>
    );
  }
}
