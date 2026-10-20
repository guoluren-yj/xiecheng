/**
 * 调查表创建页面 - 查询表单
 * @date: 2018-7-25
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Fragment } from 'react';
import { Form, Button, Input, Row, Col, DatePicker } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import cacheComponent from 'components/CacheComponent';
import Lov from 'components/Lov';
import formatterCollections from 'utils/intl/formatterCollections';
import { getUserOrganizationId } from 'utils/utils';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import intl from 'utils/intl';

const formlayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
  style: { width: '100%' },
};
@formatterCollections({ code: ['sslm.investCreate', 'sslm.common'] })
@cacheComponent({ cacheKey: '/sslm/investigation/list' })
export default class FilterForm extends React.PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      userOrganizationId: getUserOrganizationId(),
    };
  }

  componentDidMount() {
    this.handlerSearch();
  }

  /**
   * 查询
   */
  @Bind()
  handlerSearch() {
    const { onFetchInvestigationList, form } = this.props;
    if (onFetchInvestigationList) {
      form.validateFields((err) => {
        if (!err) {
          onFetchInvestigationList();
        }
      });
    }
  }

  /**
   * 重置
   */
  @Bind()
  handlerFormReset() {
    const { form } = this.props;
    form.resetFields();
  }

  /**
   * 多查询条件展示
   */
  @Bind()
  toggleForm() {
    const { onHandleToggle } = this.props;
    onHandleToggle();
  }

  render() {
    const {
      form,
      form: { getFieldDecorator, getFieldValue },
      organizationId,
      display,
      currentUser,
      custLoading,
      customizeFilterForm,
      code = '',
    } = this.props;
    const { userOrganizationId } = this.state;
    return (
      <div className="table-list-search">
        <Fragment>
          {customizeFilterForm(
            {
              code, // 单元编码，必传
              form,
              expand: !display, // 控制查询表单收起展开状态的参数
            },
            <Form layout="inline" className="more-fields-form" custLoading={custLoading}>
              <Row gutter={24}>
                <Col span={18}>
                  <Row>
                    <Col span={8}>
                      <Form.Item
                        label={intl.get(`sslm.common.model.investiagte.code`).d('调查表编号')}
                        {...formlayout}
                      >
                        {getFieldDecorator('investgNumber')(
                          <Input trim typeCase="upper" inputChinese={false} />
                        )}
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        label={intl.get('sslm.common.view.supplier.supplierCompany').d('供应商')}
                        {...formlayout}
                      >
                        {getFieldDecorator('partnerCompanyId')(
                          <Lov
                            textField="partnerCompanyName"
                            code="SSLM.INVESTIGATE_PARTNER"
                            queryParams={{ tenantId: organizationId, enabledFlag: 1 }}
                          />
                        )}
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        label={intl.get(`sslm.common.view.company.name`).d('公司')}
                        {...formlayout}
                      >
                        {getFieldDecorator('companyId')(
                          <Lov
                            textField="companyName"
                            code="SPFM.USER_AUTHORITY_COMPANY"
                            queryParams={{ organizationId: userOrganizationId }}
                          />
                        )}
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row style={{ display: display ? 'none' : 'block' }}>
                    <Col span={8}>
                      <Form.Item
                        label={intl.get(`hzero.common.date.creation.from`).d('创建日期从')}
                        {...formlayout}
                      >
                        {getFieldDecorator('startDate')(
                          <DatePicker
                            showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}
                            disabledDate={(currentDate) =>
                              getFieldValue('endDate') &&
                              moment(getFieldValue('endDate')).isBefore(currentDate, 'day')
                            }
                            format={DEFAULT_DATETIME_FORMAT}
                            placeholder=""
                          />
                        )}
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        label={intl.get(`hzero.common.date.creation.to`).d('创建日期至')}
                        {...formlayout}
                      >
                        {getFieldDecorator('endDate')(
                          <DatePicker
                            showTime={{ defaultValue: moment('23:59:59', 'HH:mm:ss') }}
                            disabledDate={(currentDate) =>
                              getFieldValue('startDate') &&
                              moment(getFieldValue('startDate')).isAfter(currentDate, 'day')
                            }
                            format={DEFAULT_DATETIME_FORMAT}
                            placeholder=""
                          />
                        )}
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        label={intl.get('sslm.common.view.creator.name').d('创建人')}
                        {...formlayout}
                      >
                        {getFieldDecorator('createUserName', {
                          initialValue: currentUser.realName,
                        })(<Input disabled />)}
                      </Form.Item>
                    </Col>
                  </Row>
                </Col>
                <Col span={6} className="search-btn-more">
                  <Form.Item>
                    <Button onClick={this.toggleForm}>
                      {display
                        ? intl.get('hzero.common.button.viewMore').d('更多查询')
                        : intl.get('hzero.common.button.collected').d('收起查询')}
                    </Button>
                    <Button data-code="reset" onClick={this.handlerFormReset}>
                      {intl.get('hzero.common.button.reset').d('重置')}
                    </Button>
                    <Button
                      data-code="search"
                      type="primary"
                      htmlType="submit"
                      onClick={this.handlerSearch}
                    >
                      {intl.get('hzero.common.button.search').d('查询')}
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          )}
        </Fragment>
      </div>
    );
  }
}
