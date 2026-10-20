/**
 * approveRule -商品审核规则
 * @date: 2019-11-13
 * @author lx <xia.li@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Modal, Form, Popconfirm, Tree, Button, Spin } from 'hzero-ui';
import { isUndefined } from 'lodash';
import { Bind } from 'lodash-decorators';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import formatterCollections from 'utils/intl/formatterCollections';
import uuid from 'uuid/v4';
import notification from 'utils/notification';

import { Header, Content } from 'components/Page';
import FilterForm from './FilterForm';

const formlayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

@connect(({ productApproveRule, loading }) => ({
  productApproveRule,
  loading: loading.effects['productApproveRule/fetchApproveList'],
  saveLoading: loading.effects['productApproveRule/fetchHandleOk'],
  checkedLoading: loading.effects['productApproveRule/fetchselectedCategory'],
  deleteLoading: loading.effects['productApproveRule/fetchDelete'],
}))
@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['smpc.approveRule', 'smpc.product'] })
export default class ApproveRule extends Component {
  constructor(props) {
    super(props);
    this.state = {
      arrtVisible: false, // 编辑弹框
      treeList: [
        {
          categoryName: intl.get('smpc.product.view.allCategories').d('全部分类'),
          categoryId: uuid(),
        },
      ],
      checkedKeys: [], // 选中的所有key
      editData: {},
      type: '',
      threeCheckedKeys: [], // 选中的三级分类
    };
  }

  componentDidMount() {
    this.queryApproveList();
    this.queryTreeList();
  }

  form;

  @Bind()
  handleRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 分类查询
   */
  @Bind()
  queryTreeList() {
    this.props
      .dispatch({
        type: 'productApproveRule/fetchCategory',
      })
      .then((res) => {
        const arr = this.state.treeList;
        arr[0].children = res;
        this.setState({
          treeList: arr,
        });
      });
  }

  /**
   * 查询规则列表
   * @param {object} page  查询参数
   */
  @Bind()
  queryApproveList(page = {}) {
    const { dispatch } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'productApproveRule/fetchApproveList',
      payload: {
        page,
        ...fieldValues,
      },
    });
  }

  /**
   * 编辑模态框
   */
  @Bind()
  toggleEditModal(type, record = {}) {
    this.setState(
      {
        editData: record,
        arrtVisible: true,
        type,
      },
      () => {
        if (type === 'update') {
          this.props
            .dispatch({
              type: 'productApproveRule/fetchselectedCategory',
              payload: { id: this.state.editData.id },
            })
            .then((res) => {
              if (res) {
                if (!res.allCategory) {
                  const checked =
                    res.skuAuditCategoryList && res.skuAuditCategoryList.map((item) => item.cid);
                  this.setState({
                    checkedKeys: checked,
                  });
                } else {
                  this.setState({
                    checkedKeys: [this.state.treeList[0].categoryId],
                  });
                }
              }
            });
        }
      }
    );
  }

  /**
   * 删除
   */
  @Bind()
  handleDelete(record) {
    const {
      dispatch,
      productApproveRule: { pagination },
    } = this.props;
    dispatch({
      type: 'productApproveRule/fetchDelete',
      payload: { id: record.id },
    }).then(() => {
      notification.success();
      this.queryApproveList(pagination);
    });
  }

  @Bind()
  handleSave(companyId = {}) {
    const { dispatch } = this.props;
    const { checkedKeys, treeList, editData, threeCheckedKeys } = this.state;
    const keys = [];
    threeCheckedKeys.forEach((i) => {
      if (i.props.dataRef.level === 3) {
        keys.push(i.props.dataRef.categoryId);
      }
    });
    const isAll = checkedKeys.includes(treeList[0].categoryId); // 是否选中全部
    dispatch({
      type: 'productApproveRule/fetchHandleOk',
      payload: {
        allCategory: isAll,
        cids: isAll ? [] : keys,
        id: editData.id || undefined,
        tenantId: getCurrentOrganizationId(),
        objectVersionNumber: editData.objectVersionNumber,
        ...companyId,
      },
    }).then((res) => {
      if (res) {
        this.onClose();
        notification.success();
        this.queryApproveList();
      }
    });
  }

  /**
   * 确定保存
   */
  @Bind()
  handleOk() {
    const { form } = this.props;
    const {
      editData: { companyId },
      type,
    } = this.state;
    if (type === 'create') {
      form.validateFields((err, value) => {
        if (!err) {
          this.handleSave(value);
        }
      });
    } else {
      this.handleSave({ companyId });
    }
  }

  /**
   * 关闭模态框
   */
  @Bind()
  onClose() {
    this.setState({
      arrtVisible: false,
      checkedKeys: [],
      editData: {},
      threeCheckedKeys: [],
      type: '',
    });
  }

  /**
   * 加载子节点
   * @param {Array} data - 树节点
   */
  @Bind()
  renderTreeNodes(data) {
    return data.map((item) => {
      if (item.children) {
        return (
          <Tree.TreeNode
            selectable={false}
            title={item.categoryName}
            key={item.categoryId}
            dataRef={item}
          >
            {this.renderTreeNodes(item.children)}
          </Tree.TreeNode>
        );
      }
      return (
        <Tree.TreeNode
          title={item.categoryName}
          key={item.categoryId}
          dataRef={item}
          selectable={false}
        />
      );
    });
  }

  @Bind()
  onCheck(keys, e) {
    this.setState({
      checkedKeys: keys,
      threeCheckedKeys: e.checkedNodes,
    });
  }

  render() {
    const { arrtVisible, treeList, checkedKeys, type, editData } = this.state;
    const {
      loading,
      saveLoading,
      deleteLoading,
      checkedLoading,
      productApproveRule: { productAuditList = [], pagination },
      form: { getFieldDecorator },
    } = this.props;
    const columns = [
      {
        title: intl.get('smpc.product.model.RuleNo').d('规则号'),
        dataIndex: 'auditCode',
        width: 120,
      },
      {
        title: intl.get('smpc.product.model.supplier').d('供应商'),
        dataIndex: 'tenantName',
      },
      {
        title: intl.get('smpc.product.model.addTime').d('添加时间'),
        dataIndex: 'creationDate',
      },
      {
        title: intl.get('smpc.product.view.createByName').d('创建人'),
        dataIndex: 'realName',
      },
      {
        title: intl.get('hzero.common.action').d('操作'),
        width: 120,
        render: (record) => {
          return (
            <span className="action-link">
              <a onClick={() => this.toggleEditModal('update', record)}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
              <Popconfirm
                placement="topRight"
                title={`${intl.get('smpc.product.view.confirmDelete').d('确认删除')}?`}
                onConfirm={() => this.handleDelete(record)}
              >
                <a>{intl.get('hzero.common.button.delete').d('删除')}</a>
              </Popconfirm>
            </span>
          );
        },
      },
    ];
    const filterProps = {
      onRef: this.handleRef,
      queryApproveList: this.queryApproveList,
    };

    return (
      <React.Fragment>
        <Header title={intl.get('smpc.approveRule.view.approveRule.title').d('商品审核规则')}>
          <Button type="primary" onClick={() => this.toggleEditModal('create')}>
            {intl.get('smpc.approveRule.model.addApproveRule').d('添加规则')}
          </Button>
        </Header>
        <Content>
          <FilterForm {...filterProps} />
          <Table
            className="small-table-all-space"
            bordered
            pagination={pagination}
            rowKey="productId"
            columns={columns}
            loading={loading || deleteLoading}
            onChange={(page) => this.queryApproveList(page)}
            dataSource={productAuditList || []}
          />
        </Content>
        <Modal
          destroyOnClose
          width={400}
          title={intl.get('smpc.approveRule.view.approveRule.proCategory').d('商品分类')}
          maskClosable
          visible={arrtVisible}
          confirmLoading={saveLoading}
          onOk={this.handleOk}
          onCancel={this.onClose}
          transitionName="move-right"
          wrapClassName="ant-modal-sidebar-right"
        >
          <Form>
            <Form.Item label={intl.get('smpc.product.model.supplier').d('供应商')} {...formlayout}>
              {getFieldDecorator('companyId', {
                initialValue: editData.companyId,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('smpc.product.model.supplier').d('供应商'),
                    }),
                  },
                ],
              })(
                <Lov
                  allowClear={false}
                  code="HPFM.TENANT"
                  textValue={editData.tenantName}
                  disabled={type === 'update'}
                />
              )}
            </Form.Item>
          </Form>
          <Spin spinning={!!checkedLoading}>
            <Tree
              checkable
              showLine
              defaultExpandedKeys={[treeList[0].categoryId]}
              onCheck={this.onCheck}
              checkedKeys={checkedKeys}
            >
              {this.renderTreeNodes(treeList)}
            </Tree>
          </Spin>
        </Modal>
      </React.Fragment>
    );
  }
}
