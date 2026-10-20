import React, { Component } from 'react';
import { Form, Row, Col, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import Lov from 'components/Lov';

/**
 * 已填制考评档案详情查询表单组件
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
    };
  }

  /**
   * 发起查询请求
   */
  @Bind()
  handleSearch() {
    const { onSearch, form } = this.props;
    if (onSearch) {
      form.validateFields((err, values) => {
        if (!err) {
          onSearch(values);
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
   * render
   * @returns React.element
   * @memberof Search
   */
  render() {
    const {
      form,
      form: { getFieldDecorator, registerField, setFieldsValue },
      tenantId,
      evalHeaderId,
      evalGranularity,
      customizeFilterForm,
      custLoading,
      code = '',
    } = this.props;

    const { expandForm } = this.state;

    const formLayout = {
      labelCol: { span: 9 },
      wrapperCol: { span: 15 },
      style: { width: '100%' },
    };

    const dynamicItem = {
      SU: '',
      'SU+CA': (
        <Col span={8}>
          <Form.Item
            label={intl.get(`sslm.common.model.archiveFilled.purchaseCategory`).d('采购品类')}
            {...formLayout}
          >
            {getFieldDecorator('categoryId')(
              <Lov
                code="SSLM.KPI_DTL_CATEGORY"
                queryParams={{ tenantId, evalHeaderId }}
                lovOptions={{ displayField: 'categoryName' }}
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
            {getFieldDecorator('itemId')(
              <Lov
                code="SSLM.KPI_DTL_ITEM"
                queryParams={{ tenantId, evalHeaderId }}
                lovOptions={{ displayField: 'itemName' }}
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
                  label={intl.get(`sslm.common.view.supplier.supplierCompany`).d('供应商')}
                  {...formLayout}
                >
                  {getFieldDecorator('supplierId')(
                    <Lov
                      code="SSLM.KPI_DTL_SUPPLIER"
                      queryParams={{ tenantId, evalHeaderId }}
                      ref={(node) => {
                        this.lovRef = node;
                      }}
                      onChange={(_, record) => {
                        registerField('supplierId');
                        setFieldsValue({ supplierId: record.supplierId });
                        this.lovRef.state.text = record.erpSupplierName
                          ? record.erpSupplierName
                          : record.companyName;
                      }}
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
                  {getFieldDecorator('indicatorId')(
                    <Lov code="SSLM.KPI_DTL_INDICATOR" queryParams={{ tenantId, evalHeaderId }} />
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
