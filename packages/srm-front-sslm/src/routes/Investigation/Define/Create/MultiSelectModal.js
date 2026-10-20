/**
 * MultiSelectModal 用于供应商多选框
 * @date: 2018-11-20
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent, Fragment } from 'react';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import { Form, Input, Drawer, Row, Button, Col, Tag, Tooltip, Spin } from 'hzero-ui';

import Table from 'srm-front-boot/lib/components/Table';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import '@/routes/index.less';
import AssignCategoryModal from './AssignCategoryModal';

const FormItem = Form.Item;

const formItemLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};
@formatterCollections({
  code: ['sslm.investMaintain'],
})
@Form.create({ fieldNameProp: null })
export default class MultiSelectModal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      tags: [], // 标签集合
      selectedChildRows: [],
      classifyVisible: false,
      checkedKeys: [],
    };
  }

  supplierClassify = {};

  componentDidMount() {
    this.props.onRef(this);
  }

  /**
   * 重置
   */
  @Bind()
  handlerFormReset() {
    const { form } = this.props;
    form.resetFields();
    this.setState({ checkedKeys: [], tags: [] });
  }

  /**
   * 多选框
   */
  @Bind()
  handleRowSelect(selectedRowKeys, selectedChildRows) {
    this.setState({
      selectedChildRows,
    });
  }

  @Bind()
  cancelModal() {
    const { onChange } = this.props;
    this.setState({
      selectedChildRows: [],
      tags: [],
      checkedKeys: [],
    });
    onChange();
  }

  @Bind()
  handleSaveRecord() {
    const { onSaveRecord } = this.props;
    const { selectedChildRows } = this.state;
    if (selectedChildRows.length < 1) {
      this.cancelModal();
    } else {
      onSaveRecord(selectedChildRows);
    }
  }

  /**
   * 选择供应商分类弹框
   */
  @Bind()
  handleClassifyModal() {
    const { classifyVisible } = this.state;
    this.setState({ classifyVisible: !classifyVisible });
    if (!classifyVisible) {
      const { fetchSupplierClassify } = this.props;
      fetchSupplierClassify();
    }
    this.supplierClassify.props.form.resetFields();
  }

  /**
   * 选择供应商分类 确认回调
   */
  @Bind()
  handleClassifyOk(data = []) {
    const { fetchSupplierData } = this.props;
    const tagsList = data;
    const ids = data.map(({ categoryId }) => categoryId);
    this.setState({ tags: tagsList, checkedKeys: ids });
    this.handleClassifyModal();
    fetchSupplierData({ ids });
  }

  /**
   * 标签关闭时的回调
   */
  @Bind()
  handleTagClose(tag) {
    const { tags } = this.state;
    const { fetchSupplierData } = this.props;
    const newList = tags.filter(n => n.categoryId !== tag.categoryId);
    const ids = newList.map(n => n.categoryId);
    this.setState({ tags: newList, checkedKeys: ids });
    if (this.supplierClassify) this.supplierClassify.setState({ selectedRows: newList });
    fetchSupplierData({ ids });
  }

  render() {
    const {
      queryFields = [],
      supplierVisible,
      fieldsColumn = [],
      supplierPagination = {},
      supplierList = {},
      form: { getFieldDecorator },
      fetchSupplierData,
      querySupplierLoading,
      supplierClassifyList,
      fetchSupplierClassify,
      queryClassifyLoading,
      custLoading,
      customizeTable,
      code = '',
    } = this.props;

    const { classifyVisible, selectedChildRows, tags } = this.state;
    // 品类
    const assignCategoryProps = {
      classifyVisible,
      supplierClassifyList,
      queryClassifyLoading,
      onCancel: this.handleClassifyModal,
      onOk: this.handleClassifyOk,
      onSearch: fetchSupplierClassify,
      onRef: node => {
        this.supplierClassify = node;
      },
    };

    // 查询条件
    const span = queryFields.length <= 1 ? 24 : 12;
    const queryCondition = queryFields.map(queryItem => {
      return (
        <Col span={span} key={queryItem.field}>
          <FormItem {...formItemLayout} label={queryItem.label}>
            {getFieldDecorator(queryItem.field)(
              <Input onPressEnter={() => fetchSupplierData({ ids: this.state.checkedKeys })} />
            )}
          </FormItem>
        </Col>
      );
    });
    return (
      <Fragment>
        <Drawer
          destroyOnClose
          title={intl.get('sslm.investMaintain.create.investMaintain.title').d('选择供应商')}
          width={750}
          visible={supplierVisible}
          onClose={this.cancelModal}
        >
          <AssignCategoryModal {...assignCategoryProps} />

          <Spin spinning={querySupplierLoading}>
            <Row style={{ marginBottom: 16 }}>
              <Col span={3}>{intl.get('sslm.common.view.supplier.class').d('供应商分类')}：</Col>
              <Col span={7}>
                <a onClick={this.handleClassifyModal}>
                  + {intl.get('hzero.common.button.add').d('新增')}
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
                      onClose={() => this.handleTagClose(tag)}
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
            <div className="table-list-search">
              <Row gutter={24}>
                <Col span={18}>{queryCondition}</Col>
                <Col span={6} className="search-btn-more">
                  <Form.Item>
                    <Button data-code="reset" onClick={this.handlerFormReset}>
                      {intl.get('hzero.common.button.reset').d('重置')}
                    </Button>
                    <Button
                      type="primary"
                      onClick={() => fetchSupplierData({ ids: this.state.checkedKeys })}
                    >
                      {intl.get('hzero.common.button.search').d('查询')}
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </div>
            {customizeTable(
              {
                code, // 单元编码，必传
              },
              <Table
                dataSource={supplierList.content}
                pagination={supplierPagination}
                columns={fieldsColumn}
                onChange={page => fetchSupplierData({ page, ids: this.state.checkedKeys })}
                rowKey="partnerCompanyId"
                rowSelection={{
                  selectedRows: selectedChildRows,
                  selectedRowKeys: selectedChildRows.map(n => n.partnerCompanyId),
                  onChange: this.handleRowSelect,
                }}
                bordered
                custLoading={custLoading}
                style={{ marginBottom: 30 }}
              />
            )}
          </Spin>
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
            <Button style={{ marginRight: 8 }} onClick={this.cancelModal}>
              {intl.get('hzero.common.button.cancel').d('取消')}
            </Button>
            <Button onClick={this.handleSaveRecord} type="primary">
              {intl.get(`hzero.common.button.ok`).d('确定')}
            </Button>
          </div>
        </Drawer>
      </Fragment>
    );
  }
}
