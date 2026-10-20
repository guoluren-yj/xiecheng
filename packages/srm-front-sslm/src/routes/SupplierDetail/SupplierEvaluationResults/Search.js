import React, { Component } from 'react';
import { Form, Row, Col, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import styles from './index.less';

/**
 * 考评结果查询（采购方）
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
   * render
   * @returns React.element
   * @memberof Search
   */
  render() {
    const {
      form: { getFieldDecorator },
      tenantId,
      evalHeaderId,
      evalGranularity,
    } = this.props;
    const formLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
      style: { width: '100%' },
    };

    const dynamicItem = {
      SU: '',
      'SU+CA': (
        <Col span={8}>
          <Form.Item
            label={intl.get(`sslm.supplierDetail.model.purchase.category`).d('采购品类')}
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
            label={intl.get(`sslm.supplierDetail.model.material.item`).d('物料')}
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

    return (
      <div className={styles['quick-choice']}>
        <Form layout="inline" style={{ margin: '16px 0' }}>
          <Row type="flex" justify="end" gutter={24}>
            <Col span={18}>
              <Row type="flex" justify="end">
                {/* <Col span={8}>
                  <Form.Item
                    label={intl.get(`sslm.supplierDetail.model.item.supplier`).d('供应商')}
                    {...formLayout}
                  >
                    {getFieldDecorator('supplierId')(
                      <Lov
                        code="SSLM.KPI_DTL_SUPPLIER"
                        queryParams={{ tenantId, evalHeaderId }}
                        onChange={(_, record) => {
                          registerField('supplierId');
                          setFieldsValue({ supplierId: record.supplierId });
                        }}
                      />
                    )}
                  </Form.Item>
                </Col> */}
                {dynamicItem[evalGranularity]}
              </Row>
            </Col>
            <Col span={4} className="search-btn-more">
              <Form.Item>
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
      </div>
    );
  }
}
