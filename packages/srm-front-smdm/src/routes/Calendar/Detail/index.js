/**
 * Calendar - 平台级日历维护
 * @date: 2018-9-27
 * @author: WH <heng.wei@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Fragment, PureComponent } from 'react';
import { Calendar } from 'hzero-ui';
import { connect } from 'dva';
import classNames from 'classnames';
import moment from 'moment';
import { isEmpty, isUndefined } from 'lodash';
import { Bind } from 'lodash-decorators';
import { Header, Content } from 'components/Page';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getDateFormat } from 'utils/utils';
import { DATETIME_MIN, DEFAULT_DATE_FORMAT } from 'utils/constants';
import Drawer from './Drawer';
import styles from './index.less';

/**
 * 日历定义明细
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} calendarOrg - 数据源
 * @reactProps {!String} tenantId - 租户ID
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
@connect(({ calendarOrg, loading }) => ({
  calendarOrg,
  tenantId: getCurrentOrganizationId(),
  loading:
    loading.effects['calendarOrg/addHoliday'] || loading.effects['calendarOrg/updateHoliday'],
}))
@formatterCollections({ code: ['smdm.calendar'] })
export default class Detail extends PureComponent {
  constructor(props) {
    super(props);
    const currentDate = moment();
    const temp = currentDate;
    const startDate = temp.startOf('month').subtract(7, 'd').format(DATETIME_MIN);
    const endDate = temp.add(1, 'M').endOf('month').add(14, 'd').format(DATETIME_MIN);
    this.state = {
      dateFormat: getDateFormat(),
      calendar: currentDate,
      startDate, // 日历查询起始时间
      endDate, // 日历查询结束时间
    };
  }

  componentDidMount() {
    const {
      dispatch,
      tenantId,
      match: { params },
    } = this.props;
    this.handleSearchHolidayDetail();
    dispatch({
      type: 'calendarOrg/searchHolidayType',
    });
    dispatch({
      type: 'calendarOrg/searchCalendarDetail',
      payload: {
        tenantId,
        calendarId: params.calendarId,
      },
    });
  }

  /**
   *
   * @param {obejct} fields - 起始截止日期组成的参数对象
   */
  @Bind()
  handleSearchHolidayDetail(fields = {}) {
    const {
      dispatch,
      tenantId,
      match: { params },
    } = this.props;
    const { startDate, endDate } = this.state;
    dispatch({
      type: 'calendarOrg/searchHolidayDetail',
      payload: {
        tenantId,
        calendarId: params.calendarId,
        startDate,
        endDate,
        ...fields,
      },
    });
  }

  /**
   * 渲染日期单位显示效果
   * @param {object} value - 日期对象
   */
  @Bind()
  handleDateCellRender(value) {
    const { holidayDetail = {} } = this.props.calendarOrg;
    if (!isEmpty(holidayDetail)) {
      const date = value.format('MM-DD');
      const target = holidayDetail[date];
      if (!isUndefined(target)) {
        return (
          <div>
            <span
              className={classNames({
                [styles['calendar-item-work']]: [
                  'OFFICIAL_WORKING_DAY',
                  'COMPANY_WORKING_DAY',
                ].includes(target.holidayType),
                [styles['calendar-item-rest']]: ['OFFICIAL_HOLIDAY', 'COMPANY_HOLIDAY'].includes(
                  target.holidayType
                ),
                [styles['calendar-item-common']]: true,
              })}
            >
              {['OFFICIAL_WORKING_DAY', 'COMPANY_WORKING_DAY'].includes(target.holidayType)
                ? intl.get('smdm.calendar.view.message.work').d('班')
                : intl.get('smdm.calendar.view.message.rest').d('休')}
            </span>
            <span className={classNames(styles['calendar-item-name'])}>
              {(target.holidayType === 'OFFICIAL_HOLIDAY' &&
                moment(target.keyDate).format('MM-DD') === date) ||
              ['COMPANY_HOLIDAY', 'COMPANY_WORKING_DAY', 'OFFICIAL_WORKING_DAY'].includes(
                target.holidayType
              )
                ? target.holidayName
                : null}
            </span>
          </div>
        );
      }
    }
  }
  // @Bind()
  // dateFullCellRender(value) {
  //   const { holidayDetail = {} } = this.props.calendarOrg;
  //   if (!isEmpty(holidayDetail)) {
  //     const date = value.format('MM-DD');
  //     const target = holidayDetail[date];
  //     // debugger;
  //     if (!isUndefined(target)) {
  //       return (
  //         <div className="ant-fullcalendar-date">
  //           <span className={classNames(styles['calendar-item-num'])}>{value.format('D')}</span>
  //           <span
  //             className={classNames({
  //               [styles['calendar-item-office']]:
  //                 ['OFFICIAL_HOLIDAY', 'OFFICIAL_WORKING_DAY'].includes(target.holidayType),
  //               [styles['calendar-item-company']]:
  //                 ['COMPANY_HOLIDAY', 'COMPANY_WORKING_DAY'].includes(target.holidayType),
  //               [styles['calendar-item-common']]: true,
  //             })}
  //           >
  //             {target.holidayType === 'COMPANY_WORKING_DAY' ||
  //             target.holidayType === 'OFFICIAL_WORKING_DAY'
  //               ? '班'
  //               : '休'}
  //           </span>
  //           <span className={classNames(styles['calendar-item-name'])}>
  //             {(target.holidayType === 'OFFICIAL_HOLIDAY' &&
  //               moment(target.keyDate).format('MM-DD') === date) ||
  //               ['COMPANY_HOLIDAY', 'COMPANY_WORKING_DAY', 'OFFICIAL_WORKING_DAY'].includes(target.holidayType)
  //               ? target.holidayName
  //               : null}
  //           </span>
  //         </div>
  //       );
  //     } else {
  //       return (
  //         <div className="ant-fullcalendar-date">
  //           <span className={classNames(styles['calendar-item-num'])}>{value.format('D')}</span>
  //         </div>
  //       );
  //     }
  //   } else {
  //     return (
  //       <div className="ant-fullcalendar-date">
  //         <span className={classNames(styles['calendar-item-num'])}>{value.format('D')}</span>
  //       </div>
  //     );
  //   }
  // }

  /**
   * 日历面板切换回调
   * @param {object} date - moment
   */
  @Bind()
  handlePanelChange(date) {
    const temp = moment(date.format(DATETIME_MIN));
    const startDate = temp.startOf('month').subtract(7, 'd').format(DATETIME_MIN);
    const endDate = temp.add(1, 'M').endOf('month').add(14, 'd').format(DATETIME_MIN);
    this.handleSearchHolidayDetail({ startDate, endDate });
    this.setState({ startDate, endDate });
  }

  /**
   * 点击选择日期回调
   * @param {object} date - 日期对象
   */
  @Bind()
  handleDateCellSelect(date) {
    const { dispatch, tenantId, match } = this.props;
    const { calendar } = this.state;
    dispatch({
      type: 'calendarOrg/searchDayDetail',
      payload: {
        tenantId,
        calendarId: match.params.calendarId,
        startDate: date.format(DATETIME_MIN),
        endDate: date.format(DATETIME_MIN),
        calendar: date,
      },
    });
    this.setState({ drawerVisible: true, calendar: date }, () => {
      if (!calendar.isSame(date.format(DEFAULT_DATE_FORMAT), 'month')) {
        this.handlePanelChange(date);
      }
    });
  }

  /**
   * Drawer Ok
   * @param {object} values
   */
  @Bind()
  handleDrawerOk(values) {
    const { dispatch } = this.props;
    dispatch({
      type: isUndefined(values.holidayId) ? 'calendarOrg/addHoliday' : 'calendarOrg/updateHoliday',
      payload: { ...values },
    }).then((res) => {
      if (res) {
        notification.success();
        this.handleSearchHolidayDetail();
        this.setState({ drawerVisible: false });
      }
    });
  }

  /**
   * Drawer Close
   */
  @Bind()
  handleDrawerCancel() {
    this.setState({ drawerVisible: false });
  }

  /**
   *
   * @param {number} holidayId - 假期Id
   */
  @Bind()
  handleDrawerReset(holidayId) {
    const { dispatch, tenantId, match } = this.props;
    dispatch({
      type: 'calendarOrg/resetHoliday',
      payload: {
        holidayId,
        tenantId,
        calendarId: match.params.calendarId,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.setState({ drawerVisible: false }, () => this.handleSearchHolidayDetail());
      }
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { drawerVisible = false, dateFormat } = this.state;
    const { loading, calendarOrg } = this.props;
    const { holidayType = [], dateDetail = {}, calendarDetail = {} } = calendarOrg;
    const drawerProps = {
      dateFormat,
      holidayType,
      loading,
      onOk: this.handleDrawerOk,
      onCancel: this.handleDrawerCancel,
      onReset: this.handleDrawerReset,
      title: intl.get('smdm.calendar.view.message.drawer').d('日历维护'),
      archor: 'right',
      visible: drawerVisible,
      targetItem: {
        ...dateDetail,
        calendarName: calendarDetail.calendarName,
        countryName: calendarDetail.countryName,
        tenantId: calendarDetail.tenantId,
        calendarId: calendarDetail.calendarId,
      },
    };
    return (
      <Fragment>
        <Header
          title={intl.get('smdm.calendar.view.message.detail.title').d('日历查询')}
          backPath="/smdm/calendar"
        />
        <Content className={classNames(styles['page-content'])}>
          <div className={classNames(styles['calendar-detail'])}>
            <Calendar
              onPanelChange={this.handlePanelChange}
              onSelect={this.handleDateCellSelect}
              dateCellRender={this.handleDateCellRender}
              // dateFullCellRender={this.dateFullCellRender}
            />
          </div>
          <Drawer {...drawerProps} />
        </Content>
      </Fragment>
    );
  }
}
