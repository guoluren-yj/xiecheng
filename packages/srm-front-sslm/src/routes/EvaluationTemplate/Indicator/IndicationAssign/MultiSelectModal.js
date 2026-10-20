/**
 *
 * @date: 2020/7/15
 * @author: zhanghao <hao.zhang07@hand-china.com>
 * @version: 0.0.1,
 * @copyright: Copyright 2019, Hand
 */
import { Bind } from 'lodash-decorators';
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { isUndefined, isEmpty, isFunction } from 'lodash';
import { Form, Button, Row, Col, Input, Spin, Drawer, Icon, Tooltip, Tag } from 'hzero-ui';

import intl from 'utils/intl';
import { filterNullValueObject } from 'utils/utils';
import notification from 'utils/notification';
import Table from 'srm-front-boot/lib/components/EditTable';

import AssignCategoryModal from '@/routes/Investigation/Define/Create/AssignCategoryModal';

@Form.create({ fieldNameProp: null })
@connect()
export default class MultiSelectModal extends PureComponent {
  constructor(props) {
    super(props);
    const { onRef = () => {} } = props;
    onRef(this);
    this.state = {
      selectedRowKeys: [],
      selectedRows: [],
      classifyVisible: false,
      tags: [],
    };
  }

  /**
   * 保存品类
   */
  @Bind()
  handleSave() {
    const { selectedRows = [] } = this.state;
    const { onOk } = this.props;
    onOk(selectedRows);
  }

  /**
   * 选择/取消选择某列的回调
   * @param {object} record - 选中的行
   * @param {boolean} selected - 是否选中
   */
  @Bind()
  onSelectChange = (selectedRowKeys, selectedRows) => {
    const { filterData = [] } = this.props;
    let flag = false;
    for (let i = 0; i < selectedRows.length; i += 1) {
      if (filterData.some(item => item.supplierCompanyId === selectedRows[i].supplierCompanyId)) {
        flag = true;
        break;
      }
    }
    if (flag) {
      notification.warning({
        message: intl
          .get('sslm.supplierKpiIndicator.view.message.noRepeatData')
          .d('不可重复勾选已经存在的供应商！'),
      });
      return false;
    }
    this.setState({ selectedRows, selectedRowKeys });
  };

  @Bind()
  handleSelectChange(selectedRowKeys, selectedRows) {
    const { onSelectChange } = this.props;
    if (isFunction(onSelectChange)) {
      onSelectChange(selectedRowKeys, selectedRows);
    } else {
      this.onSelectChange(selectedRowKeys, selectedRows);
    }
  }

  /**
   * 重置
   */
  @Bind()
  handleReset() {
    const {
      form: { resetFields },
    } = this.props;
    resetFields();
  }

  /**
   * 查询
   */
  @Bind()
  handleSupplierClassify(page = {}) {
    const {
      onSearch = e => e,
      form: { getFieldsValue },
    } = this.props;
    const { tags } = this.state;
    onSearch({
      ...getFieldsValue(),
      page,
      categoryIds: tags.map(item => item.categoryId),
    });
  }

  /**
   * 打开供应商分类弹窗
   */
  @Bind()
  handleOpenAssignCategory() {
    this.getAssignCategoryModalData();
    this.setState({
      classifyVisible: true,
    });
  }

  /**
   * 取消供应商分类弹窗显示
   */
  @Bind()
  handleCancelAssignCategoryModal() {
    this.setState({
      classifyVisible: false,
    });
  }

  @Bind()
  getAssignCategoryModalData() {
    const { dispatch } = this.props;
    const fieldValues = isUndefined(this.assignCategory)
      ? {}
      : filterNullValueObject(
          this.assignCategory && this.assignCategory.props.form.getFieldsValue()
        );
    dispatch({
      type: 'evaluationTemplate/fetchSupplierClassify',
      payload: fieldValues,
    });
  }

  @Bind()
  handleOk(selectedRows) {
    const { onSearch } = this.props;
    onSearch({
      categoryIds: selectedRows.map(item => item.categoryId),
    });
    this.setState({ tags: selectedRows, classifyVisible: false });
  }

  @Bind()
  handleTagClose(categoryId) {
    const { onSearch } = this.props;
    const { tags: oldTags } = this.state;
    const tags = oldTags.filter(item => item.categoryId !== categoryId);
    onSearch({
      categoryIds: tags.map(item => item.categoryId),
    });
    if (this.assignCategory) {
      const { selectedRows } = this.assignCategory.state;
      this.assignCategory.setState({
        selectedRows: [...selectedRows.filter(item => item.categoryId !== categoryId)],
      });
    }
    this.setState({ tags, classifyVisible: false });
  }

  render() {
    const {
      onCancel,
      classifyVisible: mulitySelectVisible,
      form: { getFieldDecorator },
      supplierClassifyList,
      supplierList,
      queryClassifyLoading = false,
      querySupplierLoading = false,
      supplierPagination,
    } = this.props;
    const { selectedRows, classifyVisible, tags, selectedRowKeys } = this.state;
    const rowSelection = {
      selectedRows,
      selectedRowKeys,
      onChange: this.handleSelectChange,
    };
    const columns = [
      {
        title: intl.get('sslm.common.view.supplier.code').d('供应商编码'),
        dataIndex: 'supplierCompanyNum',
        width: 300,
      },
      {
        title: intl.get('sslm.common.view.supplier.name').d('供应商名称'),
        dataIndex: 'supplierCompanyName',
      },
    ];
    const assignCategoryModalProps = {
      classifyVisible,
      supplierClassifyList,
      queryClassifyLoading,
      onRef: node => {
        this.assignCategory = node;
      },
      onOk: this.handleOk,
      onCancel: this.handleCancelAssignCategoryModal,
      onSearch: this.getAssignCategoryModalData,
    };
    return (
      <Drawer
        maskClosable
        width={720}
        onClose={onCancel}
        visible={mulitySelectVisible}
        title={intl.get('sslm.supplierKpiIndicator.view.title.choiceClassify').d('选择供应商')}
      >
        <Spin spinning={querySupplierLoading}>
          <Form>
            <Row style={{ marginBottom: 16 }}>
              <Col span={4}>
                {intl
                  .get('sslm.supplierKpiIndicator.view.supplier.supplierClassify')
                  .d('供应商分类')}
                :
              </Col>
              <Col span={20}>
                <a onClick={this.handleOpenAssignCategory}>
                  <Icon type="plus" />
                  {intl.get('hzero.common.button.add').d('新增')}
                </a>
              </Col>
            </Row>
            <Row style={{ marginBottom: isEmpty(tags) ? 0 : 8 }}>
              {tags &&
                tags.map(tag => {
                  const { categoryDescription } = tag;
                  const isLongTag = categoryDescription.length > 10;
                  const tagElem = (
                    <Tag
                      closable
                      color="blue"
                      key={tag.categoryId}
                      onClose={() => this.handleTagClose(tag.categoryId)}
                      style={{ marginBottom: 8 }}
                    >
                      {isLongTag ? `${categoryDescription.slice(0, 10)}...` : categoryDescription}
                    </Tag>
                  );
                  return isLongTag ? (
                    <Tooltip title={categoryDescription} key={tag.categoryId}>
                      {tagElem}
                    </Tooltip>
                  ) : (
                    tagElem
                  );
                })}
            </Row>
            <Row gutter={24} style={{ marginBottom: 16 }}>
              <Col span={8}>
                <Row style={{ display: 'flex', alignItems: 'center' }}>
                  <Col span={8}>{intl.get('sslm.common.view.supplier.code').d('供应商编码')}:</Col>
                  <Col span={16}>{getFieldDecorator('supplierCompanyNum')(<Input trim />)}</Col>
                </Row>
              </Col>
              <Col span={8}>
                <Row style={{ display: 'flex', alignItems: 'center' }}>
                  <Col span={8}>{intl.get('sslm.common.view.supplier.name').d('供应商名称')}:</Col>
                  <Col span={16}>{getFieldDecorator('supplierCompanyName')(<Input />)}</Col>
                </Row>
              </Col>
              <Col span={6}>
                <Button data-code="reset" onClick={this.handleReset} style={{ marginRight: 8 }}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
                <Button
                  data-code="search"
                  type="primary"
                  htmlType="submit"
                  onClick={this.handleSupplierClassify}
                >
                  {intl.get('hzero.common.button.search').d('查询')}
                </Button>
              </Col>
            </Row>
          </Form>
          <Table
            bordered
            style={{ marginBottom: 35 }}
            rowKey="supplierCompanyId"
            columns={columns}
            scroll={{ y: 400 }}
            rowSelection={rowSelection}
            dataSource={supplierList}
            pagination={supplierPagination}
            onChange={this.handleSupplierClassify}
          />
        </Spin>
        <AssignCategoryModal {...assignCategoryModalProps} />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            borderTop: '1px solid #e8e8e8',
            padding: '10px 16px',
            textAlign: 'right',
            left: 0,
            background: '#fff',
            borderRadius: '0 0 4px 4px',
          }}
        >
          <Button style={{ marginRight: 8 }} onClick={onCancel}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
          <Button onClick={this.handleSave} type="primary">
            {intl.get(`hzero.common.button.ok`).d('确定')}
          </Button>
        </div>
      </Drawer>
    );
  }
}
