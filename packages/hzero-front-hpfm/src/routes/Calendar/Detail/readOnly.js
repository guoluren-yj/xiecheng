/**
 * Calendar - 平台级日历维护
 * @date: 2018-9-27
 * @author: WH <heng.wei@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Fragment } from 'react';
import { Col, Form, Row, Spin, Tabs, Card } from 'hzero-ui';
import { Modal } from 'choerodon-ui/pro';
import { connect } from 'dva';
import { Bind, Throttle } from 'lodash-decorators';
import { isString } from 'lodash';
import { queryBatchApprovaFlag } from 'srm-front-boot/lib/utils/utils';
import { openApproveModal } from 'srm-front-boot/lib/components/ApproveModal';
import classNames from 'classnames';
import { routerRedux } from 'dva/router';
import { Content, Header } from 'components/Page';
import { Button as ButtonPermission } from 'components/Permission';

import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import {
  createPagination,
  getCurrentOrganizationId,
  getDateFormat,
  getResponse,
} from 'utils/utils';
import {
  DETAIL_CARD_CLASSNAME,
  DETAIL_CARD_TABLE_CLASSNAME,
  EDIT_FORM_ITEM_LAYOUT,
  EDIT_FORM_ROW_LAYOUT,
  FORM_COL_3_LAYOUT,
} from 'utils/constants';
import { yesOrNoRender } from 'utils/renderer';

import { revokeWorkFlowByKey } from '@/services/commonService';
import Holidays from './Holidays';
import Weekdays from './Weekdays';
import styles from './index.less';

@connect(({ calendar, loading }) => ({
  calendar,
  tenantId: getCurrentOrganizationId(),
  searchCalendarDetailLoading: loading.effects['calendar/searchCalendarDetail'],
  holidayLoading: loading.effects['calendar/searchHolidays'],
  approveHolidayLoading: loading.effects['calendar/approvedList'],
  weekdayLoading: loading.effects['calendar/searchWeekdays'],
}))
@formatterCollections({ code: ['hpfm.calendar', 'smdm.common', 'smdm.taxRateOrg'] })
export default class Detail extends React.Component {
  /**
   * state初始化
   * @param {object} props - 组件props
   */
  constructor(props) {
    super(props);
    this.state = {
      dateFormat: getDateFormat(),
      loading: false,
    };
  }

  /**
   * render()调用后获取展示数据
   */
  componentDidMount() {
    const {
      dispatch,
      match: { params },
      tenantId,
    } = this.props;
    dispatch({
      type: 'calendar/searchCalendarDetail',
      payload: {
        tenantId,
        calendarId: params.calendarId,
      },
    });
    dispatch({
      type: 'calendar/searchHolidayType',
    });
    this.handleSearchHoliday();
    this.handleSearchWeekday();
  }

  /**
   * 工作日查询
   */
  @Bind()
  handleSearchWeekday() {
    const {
      dispatch,
      match: { params },
      tenantId,
    } = this.props;
    dispatch({
      type: 'calendar/searchWeekdays',
      payload: {
        tenantId,
        calendarId: params.calendarId,
      },
    });
  }

  /**
   * 公休假期查询
   */
  @Bind()
  handleSearchHoliday(page = {}) {
    const {
      dispatch,
      match: { params },
      tenantId,
    } = this.props;
    dispatch({
      type: 'calendar/searchHolidays',
      payload: {
        tenantId,
        calendarId: params.calendarId,
        page,
      },
    });
  }

  @Bind()
  handleApprove(type) {
    const {
      dispatch,
      match: { params },
      tenantId,
      calendar: { calendarDetail },
    } = this.props;
    dispatch({
      type: 'calendar/approvedList',
      payload: {
        result: type,
        approvedList: [
          {
            tenantId,
            calendarId: params.calendarId,
            ...calendarDetail,
          },
        ],
      },
    }).then((res) => {
      if (res) {
        notification.success();
        dispatch(
          routerRedux.push({
            pathname: `/hpfm/mdm/calendar/list`,
          })
        );
      }
    });
  }

  /**
  * render
  * @returns React.element
  */
  @Bind()
  @Throttle(1000)
  handleRevoke(record) {
    const { dispatch } = this.props;
    return new Promise(async (resolve) => {
      Modal.confirm({
        title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
        children: intl
          .get('hzero.common.view.revokeApproval.tip`')
          .d('是否确认撤销审批？撤销后您仍可再次提交发起审批（仅工作流审批发起人可撤销审批）'),
        onOk: async () => {
          const res = await revokeWorkFlowByKey({ businessKey: record.workflowBusinessKey });
          if (isString(res)) {
            notification.error({
              message: intl.get('hzero.common.status.mistake').d('错误'),
              description: res,
            });
          } else if (res && !res?.failed) {
            resolve(true);
            notification.success();
            dispatch(
              routerRedux.push({
                pathname: `/hpfm/mdm/calendar/list`,
              })
            );
          }
          resolve(false);
        },
        afterClose: () => {
          resolve(false);
        },
      });
    });
  }

  @Bind()
  @Throttle(1000)
  handleWorkflowApprove(record) {
    this.setState({ loading: true });
    return new Promise(async (resolve) => {
      const { dispatch } = this.props;
      const res = await queryBatchApprovaFlag([record.workflowBusinessKey]);
      this.setState({ loading: false });
      if (getResponse(res)) {
        openApproveModal({
          modalProps: {
            title: intl.get('hzero.common.button.approval').d('审批'),
            closable: true,
          },
          taskId: res[record.workflowBusinessKey]?.taskId,
          processInstanceId: res[record.workflowBusinessKey]?.processInstanceId,
          onSuccess: () => {
            dispatch(
              routerRedux.push({
                pathname: `/hpfm/mdm/calendar/list`,
              })
            );
          },
        });
      }
      resolve(true);
    });

  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { dateFormat, selectedRowKeys = [], loading } = this.state;
    const {
      approveHolidayLoading = false,
      holidayLoading = false,
      weekdayLoading = false,
      searchCalendarDetailLoading = false,
      calendar: { calendarDetail = {}, holidays = [], weekdays = [] },
      match: { path = '' },
    } = this.props;
    const holidaysProps = {
      dateFormat,
      selectedRowKeys,
      loading: holidayLoading,
      dataSource: holidays.content,
      pagination: createPagination(holidays),
      onSearch: this.handleSearchHoliday,
      readOnly: true,
    };
    const weekdaysProps = {
      dataSource: weekdays,
      loading: weekdayLoading,
      readOnly: true,
    };
    return (
      <Fragment>
        <Header
          title={intl.get('hpfm.calendar.model.calendar.review').d('日历查看')}
          backPath={!path.includes('/pub') ? '/hpfm/mdm/calendar' : null}
        >
          {!path.includes('/pub') && calendarDetail.calendarStatusCode === 'SUBMITTED' && (
            <>
              <ButtonPermission
                type="primary"
                loading={approveHolidayLoading}
                onClick={() => this.handleApprove('APPROVED')}
                permissionList={[
                  {
                    code: `hzero.mdm.calendar.button.approve`,
                    type: 'button',
                    meaning: '日历定义-审批通过',
                  },
                ]}
              >
                {intl.get('hzero.common.button.approved').d('审批通过')}
              </ButtonPermission>
              <ButtonPermission
                loading={approveHolidayLoading}
                onClick={() => this.handleApprove('REJECTED')}
                permissionList={[
                  {
                    code: `hzero.mdm.calendar.button.reject`,
                    type: 'button',
                    meaning: '日历定义-审批拒绝',
                  },
                ]}
              >
                {intl.get('hzero.common.button.approvalRefuse').d('审批拒绝')}
              </ButtonPermission>
            </>
          )}
          {!path.includes('/pub') && String(calendarDetail.workflowApprovalFlag) === '1' && (
            <ButtonPermission
              wait={500}
              loading={loading}
              // loading={approveHolidayLoading}
              onClick={() => this.handleWorkflowApprove(calendarDetail)}
            // permissionList={[
            //   {
            //     code: `hzero.mdm.calendar.button.approve`,
            //     type: 'button',
            //     meaning: '日历定义-审批通过',
            //   },
            // ]}
            >
              {intl.get('hzero.common.button.approval').d('审批')}
            </ButtonPermission>
          )}
          {!path.includes('/pub') && String(calendarDetail.workflowRevokeFlag) === '1' && (
            <ButtonPermission
              wait={500}
              loading={loading}
              // loading={approveHolidayLoading}
              onClick={() => this.handleRevoke(calendarDetail)}
            // permissionList={[
            //   {
            //     code: `hzero.mdm.calendar.button.approve`,
            //     type: 'button',
            //     meaning: '日历定义-审批通过',
            //   },
            // ]}
            >
              {intl.get('hzero.common.button.revokeApproval').d('撤销审批')}
            </ButtonPermission>
          )}
        </Header>
        <Content>
          <Card key="id" bordered={false} className={DETAIL_CARD_CLASSNAME}>
            <div className={classNames(styles['mdm-detail'])}>
              <Spin spinning={searchCalendarDetailLoading}>
                <Form>
                  <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
                    <Col {...FORM_COL_3_LAYOUT}>
                      <Form.Item
                        {...EDIT_FORM_ITEM_LAYOUT}
                        label={intl.get('hpfm.calendar.model.calendar.calendarName').d('描述')}
                      >
                        {calendarDetail.calendarName}
                      </Form.Item>
                    </Col>
                    <Col {...FORM_COL_3_LAYOUT}>
                      <Form.Item
                        {...EDIT_FORM_ITEM_LAYOUT}
                        label={intl.get('hpfm.calendar.model.calendar.country').d('国家/地区')}
                      >
                        {calendarDetail.countryName}
                      </Form.Item>
                    </Col>
                    <Col {...FORM_COL_3_LAYOUT}>
                      <Form.Item
                        {...EDIT_FORM_ITEM_LAYOUT}
                        label={intl.get('smdm.common.model.costCenter.company').d('公司')}
                      >
                        {calendarDetail.companyName}
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
                    <Col {...FORM_COL_3_LAYOUT}>
                      <Form.Item
                        {...EDIT_FORM_ITEM_LAYOUT}
                        label={intl.get('smdm.taxRateOrg.model.taxRate.isDefault').d('是否默认')}
                      >
                        <span>
                          {calendarDetail.defaultFlag || calendarDetail.defaultFlag === 0
                            ? yesOrNoRender(calendarDetail.defaultFlag)
                            : undefined}
                        </span>
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              </Spin>
            </div>
          </Card>
          <Card key="maintain-detail" bordered={false} className={DETAIL_CARD_TABLE_CLASSNAME}>
            <Tabs animated={false} onChange={this.handleChangePane}>
              <Tabs.TabPane
                key="1"
                tab={intl.get('hpfm.calendar.view.message.maintain').d('公共假期维护')}
              >
                <Holidays {...holidaysProps} />
              </Tabs.TabPane>
              <Tabs.TabPane
                key="2"
                tab={intl.get('hpfm.calendar.view.message.weekday').d('工作日分配')}
              >
                <Weekdays {...weekdaysProps} />
              </Tabs.TabPane>
            </Tabs>
          </Card>
        </Content>
      </Fragment>
    );
  }
}
