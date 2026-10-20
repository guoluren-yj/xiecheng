import React, { Component, Fragment } from 'react';
import { Modal, Button, Form, Popover } from 'hzero-ui';
import intl from 'utils/intl';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';

import { dateRender } from 'utils/renderer';
import { createPagination, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import EditTable from 'components/EditTable';

import AddCorrelation from './AddCorrelationModal';

@connect(({ create8D, loading }) => ({
  create8D,
  relation8DLoading: loading.effects['create8D/relation8D'],
  tenantId: getCurrentOrganizationId(),
}))
@Form.create({ fieldNameProp: null })
export default class CorrelationPanel extends Component {
  addCorrelation;

  constructor(props) {
    super(props);
    this.state = {
      selectedRows: [],
      addCorrelationList: [],
      addCorrelationVisible: false,
      addCorrelationPagination: {},
    };
  }

  /**
   * 设置选中行
   */
  @Bind()
  handleChangeSelectRowKeys(selectedRowKeys, selectedRows) {
    this.setState({ selectedRows });
  }

  // 新增关联8D弹窗
  @Bind()
  addCorrelationModal(addCorrelationVisible) {
    const {
      props: { form },
    } = this.addCorrelation;
    this.setState({ addCorrelationVisible });
    if (addCorrelationVisible) {
      this.fetchAddRelation8D();
    } else {
      form.resetFields();
      this.addCorrelation.setState({
        selectedRows: [],
      });
    }
  }

  // 查询可新增的关联8D列表
  @Bind()
  fetchAddRelation8D(page = {}, params = {}) {
    const { dispatch, tenantId, detail = {} } = this.props;
    const { supplierTenantId, problemHeaderId } = detail;
    dispatch({
      type: 'create8D/fetchAddRelation8D',
      payload: {
        page,
        tenantId,
        supplierTenantId,
        problemHeaderId,
        ...params,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          addCorrelationList: res.content,
          addCorrelationPagination: createPagination(res),
        });
      }
    });
  }

  // 删除关联8D
  @Bind()
  handleDelete() {
    const { dispatch, tenantId, fetchCorrelation } = this.props;
    const { selectedRows } = this.state;
    Modal.confirm({
      title: intl.get(`sqam.common.view.message.confirm.deleteFlag`).d('是否确认删除'),
      onOk: () => {
        dispatch({
          type: 'create8D/deleteRelation8D',
          payload: {
            tenantId,
            list: selectedRows,
          },
        }).then((res) => {
          if (res) {
            fetchCorrelation();
            notification.success();
            this.setState({ selectedRows: [] });
          }
        });
      },
    });
  }

  @Bind()
  onChangePage(page = {}) {
    const { fetchCorrelation } = this.props;
    if (fetchCorrelation) fetchCorrelation(page);
  }

  render() {
    const {
      selectedRows,
      addCorrelationList,
      addCorrelationVisible,
      addCorrelationPagination,
    } = this.state;
    const {
      id,
      onDetail,
      onSearch,
      correlationList = [],
      isCreate = false,
      relation8DLoading,
      fetchCorrelation = (e) => e,
      customizeTable,
      customCode,
      pagination,
    } = this.props;
    const rowSelection = {
      selectedRowKeys: selectedRows.map((item) => item.rowKey),
      onChange: this.handleChangeSelectRowKeys,
    };
    const columns = [
      {
        title: intl.get('sqam.common.model.qualityRectification.code').d('整改报告编号'),
        dataIndex: 'problemNum',
        width: 150,
        fixed: 'left',
        render: (val, record) => (
          <Link to={`/sqam/initiated8D/detail/${record.associateProblemHeaderId}`}>{val}</Link>
        ),
      },
      {
        title: intl.get('sqam.common.model.qualityRectification.title').d('整改报告标题'),
        dataIndex: 'problemTitle',
        width: 200,
        fixed: 'left',
      },
      {
        title: intl.get('entity.item.code').d('物料编码'),
        dataIndex: 'itemCode',
        width: 120,
      },
      {
        title: intl.get('entity.item.name').d('物料名称'),
        dataIndex: 'itemName',
        width: 120,
      },
      {
        title: intl.get('hzero.common.date.creation').d('创建日期'),
        dataIndex: 'creationDate',
        render: dateRender,
        width: 120,
      },
      {
        title: intl.get('entity.roles.creator').d('创建人'),
        dataIndex: 'createdName',
        width: 120,
      },
      {
        title: intl.get('entity.company.tag').d('公司'),
        dataIndex: 'companyName',
        width: 150,
      },
      {
        title: intl.get(`entity.business.tag`).d('业务实体'),
        dataIndex: 'ouName',
        width: 120,
      },
      {
        title: intl.get('entity.organization.class.inventory').d('库存组织'),
        dataIndex: 'invOrganizationName',
        width: 120,
      },
      {
        title: intl.get(`sqam.common.model.qualityRectification.sourceNum`).d('来源单据编号'),
        dataIndex: 'sourceNum',
        width: 120,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`sqam.common.model.8d.problemDetail`).d('问题详述'),
        dataIndex: 'problemDetail',
        width: 120,
      },
    ];
    const addCorrelationProps = {
      id,
      onDetail,
      onRef: (node) => {
        this.addCorrelation = node;
      },
      onSearch,
      fetchCorrelation,
      addCorrelationList,
      addCorrelationPagination,
      fetchAddRelation8D: this.fetchAddRelation8D,
      visible: addCorrelationVisible,
      addCorrelationModal: this.addCorrelationModal,
    };
    return (
      <Fragment>
        {isCreate && (
          <Form layout="inline">
            <Button type="primary" onClick={() => this.addCorrelationModal(true)}>
              {intl.get('hzero.common.button.add').d('新增')}
            </Button>
            <Button onClick={this.handleDelete} disabled={isEmpty(selectedRows)}>
              {intl.get('hzero.common.button.delete').d('删除')}
            </Button>
          </Form>
        )}
        {customizeTable ? (
          customizeTable(
            {
              code: customCode,
            },
            <EditTable
              loading={relation8DLoading}
              columns={columns}
              bordered
              rowKey="rowKey"
              dataSource={correlationList}
              pagination={pagination || false}
              rowSelection={isCreate ? rowSelection : null}
              onChange={this.onChangePage}
            />
          )
        ) : (
          <EditTable
            loading={relation8DLoading}
            columns={columns}
            bordered
            rowKey="rowKey"
            dataSource={correlationList}
            pagination={pagination || false}
            rowSelection={isCreate ? rowSelection : null}
            onChange={this.onChangePage}
          />
        )}
        <AddCorrelation {...addCorrelationProps} />
      </Fragment>
    );
  }
}
