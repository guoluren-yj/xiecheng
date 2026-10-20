/**
 * Calendar - 平台级日历维护
 * @date: 2018-9-27
 * @author: WH <heng.wei@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Fragment } from 'react';
import { Col, Form, Row, Spin, Tabs, Card, Tooltip } from 'hzero-ui';
import { connect } from 'dva';
import { includes, isEmpty, isUndefined, differenceWith } from 'lodash';
import { Bind } from 'lodash-decorators';
import classNames from 'classnames';
import uuid from 'uuid/v4';
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
  isTenantRoleLevel,
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

import { getStatutory } from '@/services/calendarService';
import Holidays from './Holidays';
import Weekdays from './Weekdays';
import Drawer from './Drawer';
import styles from './index.less';

@connect(({ calendar, loading }) => ({
  calendar,
  tenantId: getCurrentOrganizationId(),
  searchCalendarDetailLoading: loading.effects['calendar/searchCalendarDetail'],
  holidayLoading: loading.effects['calendar/searchHolidays'],
  saveAddHolidayLoading: loading.effects['calendar/addHoliday'],
  saveUpdateHolidayLoading: loading.effects['calendar/updateHoliday'],
  weekdayLoading: loading.effects['calendar/searchWeekdays'],
  saveWeekdayLoading: loading.effects['calendar/updateWeekday'], // updateState
  deleteLoading: loading.effects['calendar/deleteHolidays'],
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

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'calendar/updateState',
      payload: {
        holidayList: [],
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
      calendar: { holidayList },
    } = this.props;
    dispatch({
      type: 'calendar/searchHolidays',
      payload: {
        tenantId,
        calendarId: params.calendarId,
        page,
        holidayList,
        excludeHolidayIds: holidayList
          .filter((e) => e.calendarHolidayOperationFlag !== 1)
          .map((i) => i.holidayId),
      },
    });
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
   * 新增公休假期行
   */
  @Bind()
  handleAddOption() {
    this.setState({ drawerVisible: true, targetItem: {} });
  }

  /**
   * 保存工作日信息
   */
  @Bind()
  handleSaveOption() {
    const {
      dispatch,
      match,
      calendar: { weekdays },
      tenantId,
    } = this.props;
    dispatch({
      type: 'calendar/updateWeekday',
      payload: {
        tenantId,
        calendarId: match.params.calendarId,
        data: [...weekdays],
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.handleSearchWeekday();
      }
    });
  }

  /**
   * 批量删除公休假期
   */
  @Bind()
  handleDeleteOption() {
    const {
      dispatch,
      match,
      calendar: { holidays, holidayList = [] },
      tenantId,
    } = this.props;
    const { selectedRowKeys } = this.state;
    const selectedRows = holidays.content.filter((item) =>
      includes(selectedRowKeys, item.holidayId)
    );
    if (isTenantRoleLevel()) {
      // 本次还保留的新建数据
      const addListDeleList = holidayList.filter(
        (e) => e.calendarHolidayOperationFlag === 1 && !selectedRowKeys.includes(e.holidayId)
      );
      if (addListDeleList.length === 0) {
        new Promise((resolve) => {
          dispatch({
            type: 'calendar/updateState',
            payload: {
              holidayList: [
                ...selectedRows
                  .filter((ele) => ele.calendarHolidayOperationFlag !== 1)
                  .map((e) => ({ ...e, calendarHolidayOperationFlag: 0 })),
              ],
            },
          });
          resolve();
        }).then(() => {
          this.handleSearchHoliday();
          this.setState({
            selectedRowKeys: [],
          });
        });
      } else {
        dispatch({
          type: 'calendar/updateState',
          payload: {
            holidayList: [
              ...addListDeleList,
              ...selectedRows
                .filter((ele) => ele.calendarHolidayOperationFlag !== 1)
                .map((e) => ({ ...e, calendarHolidayOperationFlag: 0 })),
            ],
            holidays: {
              content: [
                ...(holidays.content.filter((item) => !includes(selectedRowKeys, item.holidayId)) ||
                  []),
              ],
              pagination: holidays?.pagination,
            },
          },
        });
        this.setState({
          selectedRowKeys: [],
        });
      }
    } else {
      dispatch({
        type: 'calendar/deleteHolidays',
        payload: {
          tenantId,
          calendarId: match.params.calendarId,
          data: selectedRows,
        },
      }).then((res) => {
        if (res) {
          notification.success();
          this.handleSearchHoliday();
          // 重置选中数据
          this.setState({
            selectedRowKeys: [],
          });
        }
      });
    }
  }

  /**
   * 公共假期获取逻辑
   */
  @Bind()
  async handleGetStatutory() {
    const {
      calendar: { calendarDetail = {} },
      dispatch,
      match: { params },
      tenantId,
    } = this.props;
    const res = getResponse(await getStatutory(calendarDetail));
    if (res) {
      dispatch({
        type: 'calendar/searchCalendarDetail',
        payload: {
          tenantId,
          calendarId: params.calendarId,
        },
      });
      this.handleSearchHoliday();
      this.handleSearchWeekday();
    }
  }

  /**
   * 切换TabPane
   * @param {string} key - 激活pane key
   */
  @Bind()
  handleChangePane(key) {
    this.setState({ display: key === '1' && true });
  }

  /**
   * 工作日选中状态变更
   * @param {number} value - 变更值
   * @param {number} weekdayId - 工作日Id
   */
  @Bind()
  handleChangeWeekday(value, weekdayId) {
    const {
      dispatch,
      calendar: { weekdays },
    } = this.props;
    dispatch({
      type: 'calendar/updateState',
      payload: {
        weekdays: weekdays.map((item) =>
          item.weekdayId === weekdayId ? { ...item, weekdayFlag: value } : { ...item }
        ),
      },
    });
  }

  /**
   * Drawer Close
   */
  @Bind()
  handleModalCancel() {
    this.setState({ drawerVisible: false, targetItem: {} });
  }

  /**
   * 保存/更新公休假期信息
   * @param {object} values - 公休假期(行)对象
   */
  @Bind()
  handleModalOk(values) {
    const {
      dispatch,
      match,
      tenantId,
      calendar: { holidayList, holidays, holidayType },
    } = this.props;
    if (isTenantRoleLevel()) {
      const { meaning: holidayTypeMeaning } = holidayType.find(
        (e) => e.value === values.holidayType
      );
      const { content = [], pagination } = holidays;
      const createdId = uuid();
      dispatch({
        type: 'calendar/updateState',
        payload: {
          holidayList: holidayList.concat([
            {
              ...values,
              holidayId: createdId,
              holidayTypeMeaning,
              calendarId: match.params.calendarId,
              calendarHolidayOperationFlag: 1,
            },
          ]),
          holidays: {
            content: content.concat([
              {
                ...values,
                holidayId: createdId,
                holidayTypeMeaning,
                calendarId: match.params.calendarId,
                calendarHolidayOperationFlag: 1,
              },
            ]),
            pagination,
          },
        },
      });
      this.setState({ targetItem: {}, drawerVisible: false });
    } else {
      dispatch({
        type: isUndefined(values.holidayId) ? 'calendar/addHoliday' : 'calendar/updateHoliday',
        payload: {
          tenantId,
          calendarId: match.params.calendarId,
          data: { ...values, calendarId: match.params.calendarId },
        },
      }).then((res) => {
        if (res) {
          notification.success();
          this.handleSearchHoliday();
          this.setState({ targetItem: {}, drawerVisible: false });
        }
      });
    }
  }

  /**
   * 公休假期(行)选中状态变更
   */
  @Bind()
  handleSelectRow(selectedRowKeys) {
    this.setState({ selectedRowKeys });
  }

  /** *
   * 提交
   */
  @Bind()
  handleSubmit() {
    const {
      dispatch,
      match,
      calendar: { weekdays, holidayList, calendarDetail },
      tenantId,
    } = this.props;
    dispatch({
      type: 'calendar/submitHolidays',
      payload: {
        tenantId,
        ...calendarDetail,
        calendarId: match.params.calendarId,
        calendarWeekdayList: [...weekdays],
        calendarHolidayList: holidayList.map((e) => ({
          ...e,
          tenantId: getCurrentOrganizationId(),
          holidayId: e.calendarHolidayOperationFlag === 1 ? null : e.holidayId,
        })),
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
  render() {
    const {
      dateFormat,
      display = true,
      targetItem = {},
      selectedRowKeys = [],
      drawerVisible = false,
    } = this.state;
    const {
      searchCalendarDetailLoading = false,
      holidayLoading,
      weekdayLoading,
      saveWeekdayLoading,
      saveAddHolidayLoading,
      saveUpdateHolidayLoading,
      deleteLoading,
      match: { path },
      calendar: { calendarDetail = {}, holidays = {}, weekdays = [], holidayType = [] },
    } = this.props;
    const holidaysProps = {
      dateFormat,
      selectedRowKeys,
      loading: holidayLoading,
      dataSource: holidays.content,
      pagination: createPagination(holidays),
      onSelect: this.handleSelectRow,
      onSearch: this.handleSearchHoliday,
    };
    const weekdaysProps = {
      dataSource: weekdays,
      loading: weekdayLoading,
      onChange: this.handleChangeWeekday,
    };
    const drawerProps = {
      targetItem,
      dateFormat,
      holidayType,
      saveAddHolidayLoading,
      saveUpdateHolidayLoading,
      title: intl.get('hpfm.calendar.view.message.maintain').d('公共假期维护'),
      visible: drawerVisible,
      anchor: 'right',
      onCancel: this.handleModalCancel,
      onOk: this.handleModalOk,
    };
    return (
      <Fragment>
        <Header
          title={
            !isTenantRoleLevel() || ['NEW', 'REJECTED'].includes(calendarDetail?.calendarStatusCode)
              ? intl.get('hpfm.calendar.model.calendar.maintain').d('日历维护')
              : intl.get('hpfm.calendar.model.calendar.control').d('日历控制')
          }
          backPath="/hpfm/mdm/calendar"
        >
          {isTenantRoleLevel() && (
            <ButtonPermission
              type="primary"
              onClick={this.handleSubmit}
              permissionList={[
                {
                  code: `hzero.mdm.calendar.button.submit`,
                  type: 'button',
                },
              ]}
            >
              {intl.get('hzero.common.button.submit').d('提交')}
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
                    <Col {...FORM_COL_3_LAYOUT}>
                      <Form.Item
                        {...EDIT_FORM_ITEM_LAYOUT}
                        label={intl.get('hpfm.calendar.model.calendar.referenceFlag').d('是否平台获取')}
                      >
                        <span>
                          {calendarDetail.referenceFlag || calendarDetail.referenceFlag === 0
                            ? yesOrNoRender(calendarDetail.referenceFlag)
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
                <div className="table-list-operator" style={{ textAlign: 'right' }}>
                  <ButtonPermission
                    type="primary"
                    onClick={this.handleAddOption}
                    style={{ display: display ? 'block' : 'none' }}
                    permissionList={[
                      {
                        code: `${path}.button.create`,
                        type: 'button',
                        meaning: '日历定义-新建',
                      },
                    ]}
                  >
                    {intl.get('hzero.common.button.create').d('新建')}
                  </ButtonPermission>
                  <ButtonPermission
                    onClick={this.handleDeleteOption}
                    style={{ display: display ? 'block' : 'none' }}
                    disabled={isEmpty(selectedRowKeys)}
                    loading={deleteLoading}
                    permissionList={[
                      {
                        code: `${path}.button.delete`,
                        type: 'button',
                        meaning: '日历定义-删除',
                      },
                    ]}
                  >
                    {intl.get('hzero.common.button.delete').d('删除')}
                  </ButtonPermission>
                  <Tooltip arrowPointAtCenter title={intl.get('hpfm.calendar.view.message.getStatutory.tooltip').d('仅获取当年法定节假日信息')}>
                    <ButtonPermission
                      onClick={this.handleGetStatutory}
                      style={{ display: display ? 'block' : 'none' }}
                    >

                      {intl.get('hpfm.calendar.view.message.getStatutory').d('法定节假日获取')}
                    </ButtonPermission>
                  </Tooltip>
                </div>
                <Holidays {...holidaysProps} />
              </Tabs.TabPane>
              <Tabs.TabPane
                key="2"
                tab={intl.get('hpfm.calendar.view.message.weekday').d('工作日分配')}
              >
                <div className="table-list-operator" style={{ textAlign: 'right' }}>
                  {!isTenantRoleLevel() && (
                    <ButtonPermission
                      type="primary"
                      onClick={this.handleSaveOption}
                      style={{ display: display ? 'none' : 'block' }}
                      loading={saveWeekdayLoading}
                      permissionList={[
                        {
                          code: `${path}.button.save`,
                          type: 'button',
                          meaning: '日历定义-保存',
                        },
                      ]}
                    >
                      {intl.get('hzero.common.button.save').d('保存')}
                    </ButtonPermission>
                  )}
                </div>
                <Weekdays {...weekdaysProps} />
              </Tabs.TabPane>
            </Tabs>
          </Card>
          <Drawer {...drawerProps} />
        </Content>
      </Fragment >
    );
  }
}
