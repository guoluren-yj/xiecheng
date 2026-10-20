import React, { Component } from 'react';
import { Form, Row, Col, Button, InputNumber } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
// import Lov from 'components/Lov';
import ValueList from 'components/ValueList';
import LovMultiple from '@/routes/components/LovMultiple';
import { getCurrentUserId } from 'utils/utils';

const useId = getCurrentUserId();

/**
 * 考评档案填制详情查询表单组件
 *
 * @export
 * @class Search
 * @extends {Component} - React.Component
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} onSearch - 提交查询表单的方法
 * @returns React.element
 */
@Form.create({ fieldNameProp: null })
export default class Search extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      expandForm: false,
      supplierSelectRows: [],
      itemSelectRows: [],
      indicatorSelectRows: [],
      categorySelectRows: [],
    };
  }

  /**
   * 发起查询请求
   */
  @Bind()
  handleSearch() {
    const { onSearch, form } = this.props;
    if (onSearch) {
      form.validateFields(err => {
        if (!err) {
          onSearch();
        }
      });
    }
  }

  /**
   * 重置查询表单
   */
  @Bind()
  handleReset() {
    const { form } = this.props;
    form.resetFields();
  }

  /**
   * 折叠或展开查询表单
   */
  @Bind()
  handleToggle() {
    this.setState(state => ({
      collapse: !state.collapse,
    }));
  }

  /**
   * 表单展开收起
   */
  @Bind()
  toggleForm() {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
  }

  /**
   * 筛选回调
   */
  @Bind()
  changeSelectRowsHandle(selectRows, type) {
    switch (type) {
      case 'supplier':
        this.setState({ supplierSelectRows: selectRows });
        break;
      case 'item':
        this.setState({ itemSelectRows: selectRows });
        break;
      case 'indicator':
        this.setState({ indicatorSelectRows: selectRows });
        break;
      case 'category':
        this.setState({ categorySelectRows: selectRows });
        break;
      default:
        break;
    }
  }

  /**
   * 多选条件主键转字符拼接
   */
  @Bind()
  parseField(arr, str) {
    const arrList = [];
    arr.forEach(n => {
      arrList.push(n[str]);
    });
    const arrStr = (arrList && arrList.join(',')) || '';
    return arrStr;
  }

  /**
   * render
   * @returns React.element
   * @memberof Search
   */
  render() {
    const {
      form,
      form: { getFieldDecorator, setFieldsValue },
      tenantId,
      evalHeaderId,
      evalGranularity,
      customizeFilterForm,
      custLoading,
      code = '',
    } = this.props;

    const {
      expandForm,
      supplierSelectRows,
      itemSelectRows,
      indicatorSelectRows,
      categorySelectRows,
    } = this.state;

    const formLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
      style: { width: '100%' },
    };

    const dynamicItem = {
      SU: null,
      'SU+CA': (
        <Col span={8}>
          <Form.Item
            label={intl.get(`sslm.common.model.archiveFilled.purchaseCategory`).d('采购品类')}
            {...formLayout}
          >
            {getFieldDecorator('categoryIds')(
              <LovMultiple
                code="SSLM.KPI_DTL_CATEGORY"
                queryParams={{ tenantId, evalHeaderId }}
                changeSelectRows={newSelectedRows => {
                  const idStr = this.parseField(newSelectedRows, 'categoryId');
                  setFieldsValue({ categoryIds: idStr });
                  this.changeSelectRowsHandle(newSelectedRows, 'category');
                }}
                selectedRows={categorySelectRows}
              />
            )}
          </Form.Item>
        </Col>
      ),
      'SU+IT': (
        <Col span={8}>
          <Form.Item
            label={intl.get(`sslm.common.model.archiveFilled.item`).d('物料')}
            {...formLayout}
          >
            {getFieldDecorator('itemIds')(
              <LovMultiple
                code="SSLM.KPI_DTL_ITEM"
                queryParams={{ tenantId, evalHeaderId }}
                changeSelectRows={newSelectedRows => {
                  const idStr = this.parseField(newSelectedRows, 'itemId');
                  setFieldsValue({ itemIds: idStr });
                  this.changeSelectRowsHandle(newSelectedRows, 'item');
                }}
                selectedRows={itemSelectRows}
              />
            )}
          </Form.Item>
        </Col>
      ),
    };
    return customizeFilterForm(
      {
        code, // 单元编码，必传
        form,
        expand: expandForm, // 控制查询表单收起展开状态的参数
      },
      <Form
        layout="inline"
        className="more-fields-form"
        style={{ marginBottom: 16 }}
        custLoading={custLoading}
      >
        <Row gutter={24}>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`sslm.common.model.archiveFilling.supplier`).d('供应商')}
                  {...formLayout}
                >
                  {getFieldDecorator('supplierIds')(
                    <LovMultiple
                      code="SSLM.KPI_DTL_SUPPLIER"
                      queryParams={{ tenantId, evalHeaderId, respUserId: useId }}
                      changeSelectRows={newSelectedRows => {
                        const idStr = this.parseField(newSelectedRows, 'supplierId');
                        setFieldsValue({ supplierIds: idStr });
                        this.changeSelectRowsHandle(newSelectedRows, 'supplier');
                      }}
                      selectedRows={supplierSelectRows}
                    />
                  )}
                </Form.Item>
              </Col>
              {dynamicItem[evalGranularity]}
              <Col span={8}>
                <Form.Item
                  label={intl.get(`sslm.common.model.archiveFilled.evaluationIndex`).d('考评指标')}
                  {...formLayout}
                >
                  {getFieldDecorator('queryIndicatorIds')(
                    <LovMultiple
                      code="SSLM.KPI_DTL_INDICATOR"
                      queryParams={{ tenantId, evalHeaderId }}
                      changeSelectRows={newSelectedRows => {
                        const idStr = this.parseField(newSelectedRows, 'indicatorId');
                        setFieldsValue({ queryIndicatorIds: idStr });
                        this.changeSelectRowsHandle(newSelectedRows, 'indicator');
                      }}
                      selectedRows={indicatorSelectRows}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`sslm.common.model.archiveFilled.completeFlag`).d('评分状态')}
                  {...formLayout}
                >
                  {getFieldDecorator('completeFlag')(
                    <ValueList allowClear lovCode="SSLM.EVAL_COMPLETE_STATUS" />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`sslm.supplierDocManage.model.docManage.scoreWeight`).d('权重')}
                  {...formLayout}
                >
                  {getFieldDecorator('respWeight')(<InputNumber min={0} step={0.01} />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('sslm.common.view.supplier.class').d('供应商分类')}
                  {...formLayout}
                >
                  {getFieldDecorator('supplierCategoryIds')(
                    <LovMultiple
                      isCascade // 是否级联勾选
                      textField="categoryDescription"
                      code="SSLM.SUPPLIER_CATEGORY_TREE"
                      queryParams={{ tenantId }}
                      parentRowKey="parentCategoryId"
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
              <Button onClick={this.toggleForm}>
                {expandForm
                  ? intl.get('hzero.common.button.collected').d('收起查询')
                  : intl.get(`hzero.common.button.viewMore`).d('更多查询')}
              </Button>
              <Button data-code="reset" onClick={this.handleReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                data-code="search"
                type="primary"
                htmlType="submit"
                onClick={this.handleSearch}
              >
                {intl.get('hzero.common.status.search').d('查询')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
