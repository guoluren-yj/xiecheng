import React, { PureComponent, Fragment } from 'react';
import { Form, Input, Button, Select, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import CacheComponent from 'components/CacheComponent';
import Lov from 'components/Lov';
import intl from 'utils/intl';
import { getDateFormat, getDateTimeFormat } from 'utils/utils';
import {
  SEARCH_FORM_ITEM_LAYOUT,
  SEARCH_FORM_ROW_LAYOUT,
  FORM_COL_4_LAYOUT,
} from 'utils/constants';
import MoreFieldsDrawer from './MoreFieldsDrawer';

const prefix = `sqam.common.model.qualityRectification`;

@Form.create({ fieldNameProp: null })
@CacheComponent({ cacheKey: '/sqam/audit8D' })
export default class FilterForm extends PureComponent {
  /**
   * state初始化
   */
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      moreFieldsVisible: false,
      dateFormat: getDateFormat(),
      timeFormat: getDateTimeFormat(),
    };
  }

  /**
   * 表单查询
   */
  @Bind()
  handleSearch() {
    const { onSearch, form } = this.props;
    if (onSearch) {
      form.validateFields((err) => {
        if (!err) {
          // 如果验证成功,则执行onSearch
          onSearch();
          this.handleMoreFields(); // 多条件滑窗隐藏
        }
      });
    }
  }

  /**
   * 表单重置
   */
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }

  /**
   * 更多条件查询滑窗显示
   * @param {boolean} [flag = false] - 显示标记
   */
  @Bind()
  handleMoreFields(flag = false) {
    this.setState({ moreFieldsVisible: flag });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      tenantId,
      form,
      status,
      issueType,
      significance,
      urgency,
      rectifyTypeCode,
      customizeForm,
    } = this.props;
    const { moreFieldsVisible = false, dateFormat, timeFormat } = this.state;
    const { getFieldDecorator, setFieldsValue, registerField } = form;
    const moreFieldsProps = {
      status,
      issueType,
      significance,
      urgency,
      rectifyTypeCode,
      tenantId,
      form,
      dateFormat,
      timeFormat,
      customizeForm,
      visible: moreFieldsVisible,
      onSearch: this.handleSearch,
      onReset: this.handleFormReset,
      onHideDrawer: this.handleMoreFields,
    };
    return (
      <Fragment>
        <Form layout="inline" className="more-fields-search-form">
          <Row {...SEARCH_FORM_ROW_LAYOUT}>
            <Col {...FORM_COL_4_LAYOUT}>
              <Form.Item
                label={intl.get(`${prefix}.code`).d('整改报告编号')}
                {...SEARCH_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('problemNum', {
                  rules: [
                    {
                      max: 10,
                      message: intl.get('hzero.common.validation.max', {
                        max: 10,
                      }),
                    },
                  ],
                })(<Input trim inputChinese={false} typeCase="upper" />)}
              </Form.Item>
            </Col>
            <Col {...FORM_COL_4_LAYOUT}>
              <Form.Item
                label={intl.get(`${prefix}.status`).d('整改报告状态')}
                {...SEARCH_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator(
                  'problemStatus',
                  {}
                )(
                  <Select style={{ width: '100%' }} allowClear mode="multiple">
                    {status
                      .filter((i) =>
                        [
                          'ICA_SUBMITTED',
                          'PCA_SUBMITTED',
                          'PCA_FEEDBACKING',
                          'PCA_REJECTED',
                          'PUBLISHED',
                          'ICA_REJECTED',
                        ].includes(i.value)
                      )
                      .map((item) => (
                        <Select.Option key={item.value}>{item.meaning}</Select.Option>
                      ))}
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col {...FORM_COL_4_LAYOUT}>
              <Form.Item
                label={intl.get(`entity.supplier.tag`).d('供应商')}
                {...SEARCH_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator(
                  'supplierCompanyName',
                  {}
                )(
                  <Lov
                    code="SQAM.CLAIM_SEARCH_SUPPLIER"
                    queryParams={{ tenantId }}
                    textField="erpSupplierName"
                    onChange={(val, record) => {
                      registerField('supplierId');
                      registerField('extSupplierId');
                      registerField('supplierCompanyId');
                      setFieldsValue({
                        extSupplierId: record.supplierId,
                        supplierId: record.supplierId,
                        supplierCompanyId: record.supplierCompanyId,
                        erpSupplierName: record.erpSupplierName
                          ? record.erpSupplierName
                          : record.supplierCompanyName,
                      });
                    }}
                  />
                )}
              </Form.Item>
            </Col>
            <Col {...FORM_COL_4_LAYOUT} className="search-btn-more">
              <Form.Item>
                <Button onClick={() => this.handleMoreFields(true)}>
                  {intl.get('hzero.common.button.viewMore').d('更多查询')}
                </Button>
                <Button data-code="reset" onClick={this.handleFormReset}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
                <Button
                  data-code="search"
                  type="primary"
                  htmlType="submit"
                  onClick={this.handleSearch}
                >
                  {intl.get('hzero.common.button.search').d('查询')}
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
        <MoreFieldsDrawer {...moreFieldsProps} />
      </Fragment>
    );
  }
}
