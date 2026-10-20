import React, { PureComponent } from 'react';
import { Form, Button, DatePicker, Row, Col, Input, TreeSelect } from 'hzero-ui';
import moment from 'moment';
import { Bind, Throttle } from 'lodash-decorators';
import { isNil, isEmpty } from 'lodash';

import cacheComponent from 'components/CacheComponent';
import Lov from 'components/Lov';

import intl from 'utils/intl';
import { getDateFormat, getCurrentOrganizationId } from 'utils/utils';
import { DEBOUNCE_TIME, SEARCH_FORM_ITEM_LAYOUT, FORM_COL_3_LAYOUT } from 'utils/constants';

const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
const dateFormat = getDateFormat();
const tenantId = getCurrentOrganizationId();

/**
 * 流程监控查询表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} search - 查询
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/hwfp/monitor-srm/list' })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      display: true,
    };
    props.onRef(this);
  }

  /**
   * 查询
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
   * 多查询条件展示
   */
  @Throttle(DEBOUNCE_TIME)
  @Bind()
  toggleForm() {
    const { display } = this.state;
    this.setState({
      display: !display,
    });
    const { onExpandForm } = this.props;
    if (onExpandForm) {
      onExpandForm();
    }
  }

  /**
   * 重置
   */
  @Bind()
  handleFormReset() {
    const { form } = this.props;
    form.resetFields();
  }

  @Bind()
  handleChangeTanant() {
    this.props.form.setFieldsValue({ startedUserId: null, assignee: null });
  }

  @Bind()
  handleChangeAssignee(value) {
    if (value) {
      const {
        form: { getFieldValue, setFieldsValue },
      } = this.props;
      const processStatusList = getFieldValue('processStatusList');
      if (!isEmpty(processStatusList)) {
        const newProcessStatusList = processStatusList.filter(item =>
          ['APPROVAL', 'SUSPENDED'].includes(item)
        );
        setFieldsValue({ processStatusList: newProcessStatusList });
      }
    }
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      isSiteFlag,
      form: { getFieldDecorator, getFieldValue, setFieldsValue },
      processStatus = [],
    } = this.props;
    const { display = true } = this.state;
    const processStatusList = processStatus.map(item => ({
      title: item.meaning,
      value: item.value,
      key: item.value,
    }));
    return (
      <Form layout="inline" className="more-fields-form">
        <Row>
          <Col span={18}>
            {isSiteFlag ? (
              <React.Fragment>
                <Row>
                  <Col span={8}>
                    <Form.Item label={intl.get('entity.tenant.tag').d('租户')} {...formLayout}>
                      {getFieldDecorator('tenantId', {
                        rules: [
                          {
                            required: true,
                            message: intl
                              .get('hzero.common.validation.notNull', {
                                name: intl.get('entity.tenant.tag').d('租户'),
                              })
                              .d(`${intl.get('entity.tenant.tag').d('租户')}不能为空`),
                          },
                        ],
                      })(<Lov code="HPFM.TENANT" onChange={this.handleChangeTanant} />)}
                    </Form.Item>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <Form.Item
                      label={intl.get('hwfp.common.model.process.description').d('流程描述')}
                      {...SEARCH_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('processDescriptionLike')(<Input dbc2sbc={false} />)}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl
                        .get('hwfp.monitor.view.message.processDefinitionNameLike')
                        .d('流程名称')}
                      {...formLayout}
                    >
                      {getFieldDecorator('processDefinitionNameLike')(<Input dbc2sbc={false} />)}
                    </Form.Item>
                  </Col>
                </Row>
                <Row style={{ display: display ? 'none' : 'block' }}>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <Form.Item
                      label={intl.get('hwfp.common.model.process.ID').d('流程标识')}
                      {...SEARCH_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('processInstanceId')(<Input />)}
                    </Form.Item>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <Form.Item
                      label={intl.get('hwfp.common.model.documents.class').d('流程单据')}
                      {...SEARCH_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('documentId')(
                        <Lov
                          code="HWFP.PROCESS_DOCUMENT"
                          queryParams={{ tenantId }}
                          onChange={(_, record) =>
                            setFieldsValue({ documentCode: record ? record.documentCode : '' })
                          }
                        />
                      )}
                      {getFieldDecorator('documentCode')}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get('hwfp.common.model.apply.owner').d('申请人')}
                      {...formLayout}
                    >
                      {getFieldDecorator('startedUserId')(
                        <Lov
                          code="HPFM.EMPLOYEE"
                          disabled={isNil(getFieldValue('tenantId'))}
                          queryParams={
                            !isNil(getFieldValue('tenantId')) && {
                              tenantId: getFieldValue('tenantId'),
                            }
                          }
                          lovOptions={{
                            displayField: 'name',
                          }}
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get('hwfp.common.view.message.handler').d('当前处理人')}
                      {...formLayout}
                    >
                      {getFieldDecorator('assignee')(
                        <Lov
                          code="HPFM.EMPLOYEE"
                          disabled={isNil(getFieldValue('tenantId'))}
                          queryParams={
                            !isNil(getFieldValue('tenantId')) && {
                              tenantId: getFieldValue('tenantId'),
                            }
                          }
                          lovOptions={{
                            displayField: 'name',
                          }}
                          onChange={this.handleChangeAssignee}
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get('hzero.common.date.creation.from').d('创建日期从')}
                      {...formLayout}
                    >
                      {getFieldDecorator('startedAfter')(
                        <DatePicker
                          format={dateFormat}
                          placeholder=""
                          disabledDate={currentDate =>
                            getFieldValue('startedBefore') &&
                            moment(getFieldValue('startedBefore')).isBefore(currentDate, 'day')
                          }
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get('hzero.common.date.creation.to').d('创建日期至')}
                      {...formLayout}
                    >
                      {getFieldDecorator('startedBefore')(
                        <DatePicker
                          format={dateFormat}
                          placeholder=""
                          disabledDate={currentDate =>
                            getFieldValue('startedAfter') &&
                            moment(getFieldValue('startedAfter')).isAfter(currentDate, 'day')
                          }
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get('hwfp.monitor.view.message.finishedAfter').d('结束时间从')}
                      {...formLayout}
                    >
                      {getFieldDecorator('finishedAfter')(
                        <DatePicker
                          format={dateFormat}
                          placeholder=""
                          disabledDate={currentDate =>
                            getFieldValue('finishedBefore') &&
                            moment(getFieldValue('finishedBefore')).isBefore(currentDate, 'day')
                          }
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get('hwfp.monitor.view.message.finishedBefore').d('结束时间至')}
                      {...formLayout}
                    >
                      {getFieldDecorator('finishedBefore')(
                        <DatePicker
                          format={dateFormat}
                          placeholder=""
                          disabledDate={currentDate =>
                            getFieldValue('finishedAfter') &&
                            moment(getFieldValue('finishedAfter')).isAfter(currentDate, 'day')
                          }
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get('hwfp.common.model.apply.approver').d('审批人')}
                      {...formLayout}
                    >
                      {getFieldDecorator('approver')(
                        <Lov
                          code="HPFM.EMPLOYEE"
                          queryParams={{ tenantId }}
                          lovOptions={{
                            displayField: 'name',
                          }}
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={16}>
                    <Form.Item
                      label={intl.get('hwfp.common.model.process.status').d('流程状态')}
                      labelCol={{
                        span: 5,
                      }}
                      wrapperCol={{
                        span: 19,
                      }}
                    >
                      {getFieldDecorator('processStatusList')(
                        <TreeSelect
                          treeCheckable
                          allowClear
                          treeData={
                            !getFieldValue('assignee')
                              ? processStatusList
                              : processStatusList.filter(item =>
                                  ['APPROVAL', 'SUSPENDED'].includes(item.value)
                                )
                          }
                        />
                      )}
                    </Form.Item>
                  </Col>
                </Row>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <Row>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <Form.Item
                      label={intl.get('spfm.monitor.model.process.ID').d('流程标识')}
                      {...SEARCH_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('processInstanceId')(<Input />)}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl
                        .get('hwfp.monitor.view.message.processDefinitionNameLike')
                        .d('流程名称')}
                      {...formLayout}
                    >
                      {getFieldDecorator('processDefinitionNameLike')(<Input dbc2sbc={false} />)}
                    </Form.Item>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <Form.Item
                      label={intl.get('spfm.monitor.model.process.description').d('流程描述')}
                      {...SEARCH_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('processDescriptionLike')(<Input dbc2sbc={false} />)}
                    </Form.Item>
                  </Col>
                </Row>
                <Row style={{ display: display ? 'none' : 'block' }}>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get('hwfp.common.model.apply.owner').d('申请人')}
                      {...formLayout}
                    >
                      {getFieldDecorator('startedUserId')(
                        <Lov
                          code="HWFP.EMPLOYEE_IN_COMPANY"
                          queryParams={{ tenantId, empStatus: 'ALL' }}
                          lovOptions={{
                            displayField: 'name',
                          }}
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get('hwfp.common.view.message.handler').d('当前处理人')}
                      {...formLayout}
                    >
                      {getFieldDecorator('assignee')(
                        <Lov
                          code="HWFP.EMPLOYEE_IN_COMPANY"
                          queryParams={{ tenantId, empStatus: 'ALL' }}
                          lovOptions={{
                            displayField: 'name',
                          }}
                          onChange={this.handleChangeAssignee}
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get('hwfp.common.model.apply.approver').d('审批人')}
                      {...formLayout}
                    >
                      {getFieldDecorator('approver')(
                        <Lov
                          code="HWFP.EMPLOYEE_IN_COMPANY"
                          queryParams={{ tenantId, empStatus: 'ALL' }}
                          lovOptions={{
                            displayField: 'name',
                          }}
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get('hzero.common.date.creation.from').d('创建日期从')}
                      {...formLayout}
                    >
                      {getFieldDecorator('startedAfter')(
                        <DatePicker
                          format={dateFormat}
                          placeholder=""
                          disabledDate={currentDate =>
                            getFieldValue('startedBefore') &&
                            moment(getFieldValue('startedBefore')).isBefore(currentDate, 'day')
                          }
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get('hzero.common.date.creation.to').d('创建日期至')}
                      {...formLayout}
                    >
                      {getFieldDecorator('startedBefore')(
                        <DatePicker
                          format={dateFormat}
                          placeholder=""
                          disabledDate={currentDate =>
                            getFieldValue('startedAfter') &&
                            moment(getFieldValue('startedAfter')).isAfter(currentDate, 'day')
                          }
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get('hwfp.monitor.view.message.finishedAfter').d('结束时间从')}
                      {...formLayout}
                    >
                      {getFieldDecorator('finishedAfter')(
                        <DatePicker
                          format={dateFormat}
                          placeholder=""
                          disabledDate={currentDate =>
                            getFieldValue('finishedBefore') &&
                            moment(getFieldValue('finishedBefore')).isBefore(currentDate, 'day')
                          }
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get('hwfp.monitor.view.message.finishedBefore').d('结束时间至')}
                      {...formLayout}
                    >
                      {getFieldDecorator('finishedBefore')(
                        <DatePicker
                          format={dateFormat}
                          placeholder=""
                          disabledDate={currentDate =>
                            getFieldValue('finishedAfter') &&
                            moment(getFieldValue('finishedAfter')).isAfter(currentDate, 'day')
                          }
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <Form.Item
                      label={intl.get('hwfp.common.model.documents.class').d('流程单据')}
                      {...SEARCH_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('documentId')(
                        <Lov
                          code="HWFP.PROCESS_DOCUMENT"
                          queryParams={{ tenantId }}
                          onChange={(_, record) =>
                            setFieldsValue({ documentCode: record ? record.documentCode : '' })
                          }
                        />
                      )}
                      {getFieldDecorator('documentCode')}
                    </Form.Item>
                  </Col>
                  <Col span={16}>
                    <Form.Item
                      label={intl.get('hwfp.common.model.process.status').d('流程状态')}
                      labelCol={{
                        span: 5,
                      }}
                      wrapperCol={{
                        span: 19,
                      }}
                    >
                      {getFieldDecorator('processStatusList')(
                        <TreeSelect
                          treeCheckable
                          allowClear
                          treeData={
                            !getFieldValue('assignee')
                              ? processStatusList
                              : processStatusList.filter(item =>
                                  ['APPROVAL', 'SUSPENDED'].includes(item.value)
                                )
                          }
                        />
                      )}
                    </Form.Item>
                  </Col>
                </Row>
              </React.Fragment>
            )}
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
              <Button onClick={this.toggleForm}>
                {display
                  ? intl.get('hzero.common.button.viewMore').d('更多查询')
                  : intl.get('hzero.common.button.collected').d('收起查询')}
              </Button>
              <Button data-code="reset" style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
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
    );
  }
}
