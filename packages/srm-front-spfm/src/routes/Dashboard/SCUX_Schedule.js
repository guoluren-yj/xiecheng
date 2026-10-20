/**
 * @description 日历卡片 - 艾为
 * @export ScheduleCode
 * @class ScheduleCode
 * @extends {Component}
 */

import React, { useEffect, useState, Fragment } from 'react';
import {
  Table,
  DataSet,
  Button,
  Select,
  Form,
  DateTimePicker,
  TextField,
  Output,
  Lov,
  Modal,
  TextArea,
} from 'choerodon-ui/pro';
import { Row, Icon, Col, Calendar, Badge, Tooltip } from 'choerodon-ui';
import { observer } from 'mobx-react';
import moment from 'moment';
import { isEmpty } from 'lodash';

import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse, getCurrentOrganizationId, getUserOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

import {
  dateTimeData,
  aiweiSchedulePersons,
  calendarData,
  posonInfoData,
} from './store/scheduleCodeDs';
import styles from './Cards.less';
import { fetchSave, fetchPosonInfo } from '@/services/scux/scheduleCodeServices';

const prefix = `spfm.dashboard`;
const tenantId = getCurrentOrganizationId();
const organizationId = getUserOrganizationId();
const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth() + 1;
const isPurchaser = tenantId === organizationId;

const ScheduleCode = () => {
  const dateTimeDs = new DataSet(dateTimeData(isPurchaser));

  const aiweiSchedulePersonsDs = new DataSet(aiweiSchedulePersons());

  const calendarDataDs = new DataSet(calendarData());

  const posonInfoDataDs = new DataSet(posonInfoData());

  const [calendarDataList, setListData] = useState({});

  useEffect(() => {
    fetchCalendar();
  }, []);

  const fetchCalendar = () => {
    calendarDataDs.setQueryParameter(
      'month',
      `${currentYear}-${currentMonth < 10 ? `0${currentMonth}` : currentMonth}`
    );
    calendarDataDs.query().then((res) => {
      if (res) {
        setListData(res);
      }
    });
  };

  const aiweiSchedulePersonsColuns = [
    {
      name: 'receptionistName',
      editor: true,
    },
    {
      name: 'positionName',
      editor: true,
    },
    {
      name: 'mailbox',
      editor: true,
    },
  ];

  const handleAddAiweiSchedulePersons = () => {
    aiweiSchedulePersonsDs.create({}, 0);
  };

  const posonInfoAgree = async () => {
    const modalData = posonInfoDataDs.current.toJSONData();
    const response = await fetchPosonInfo({ ...modalData, state: 'NOTFINISHED' });
    let flag = false;
    try {
      if (getResponse(response)) {
        notification.success();
        fetchCalendar();
        flag = true;
      }
    } catch (error) {
      throw error;
    }
    return flag;
  };

  const posonInfoRefuse = () => {
    Modal.open({
      title: intl.get(`${prefix}.view.title.refuseReson`).d('拒绝理由'),
      children: (
        <Form dataSet={posonInfoDataDs}>
          <TextArea name="reason" />
        </Form>
      ),
      onOk: async () => {
        const validFlag = await posonInfoDataDs.current.validate();
        let flag = false;
        if (validFlag) {
          const modalData = posonInfoDataDs.current.toJSONData();
          const currentData = {
            ...modalData,
            reason: posonInfoDataDs.current.get('reason'),
            state: 'REJECT',
          };
          const response = await fetchPosonInfo(currentData);
          try {
            if (getResponse(response)) {
              notification.success();
              fetchCalendar();
              flag = true;
            }
          } catch (error) {
            throw error;
          }
        } else {
          notification.warning({
            message: intl.get(`${prefix}.view.message.refuseReson`).d('请填写拒绝理由!'),
          });
        }
        return flag;
      },
    });
  };

  const handleOpenInfo = async (item) => {
    posonInfoDataDs.setQueryParameter('scheduleHeardId', item.scheduleHeardId);
    await posonInfoDataDs.query();
    const week = posonInfoDataDs.current.get('week');
    const scheduleName = posonInfoDataDs.current.get('scheduleName');
    Modal.open({
      key: item.scheduleHeardId,
      title: (
        <div>
          {scheduleName && (
            <p>
              {`${scheduleName}${intl
                .get(`${prefix}.view.title.appointmentMeeting`)
                .d('预约拜访会议')}`}
            </p>
          )}
          {week && (
            <p style={{ fontSize: '13px', fontWeight: 500 }}>
              {`${week} ${posonInfoDataDs.current.get('startTime')}-${posonInfoDataDs.current.get(
                'endTime'
              )}`}
            </p>
          )}
        </div>
      ),
      children: (
        <Form dataSet={posonInfoDataDs}>
          {isPurchaser && <Output name="reception" />}
          <Output name="companyName" />
          <Output name="visit" />
          <Output name="supplierName" />
          <Output name="conferenceRoom" />
        </Form>
      ),
      closable: true,
      okText: intl.get(`${prefix}.view.button.aggree`).d('同意'),
      footer: (okBtn) =>
        item.state === 'SUBMIT' && (
          <Fragment>
            <Button onClick={posonInfoRefuse}>
              {intl.get(`${prefix}.view.button.refuse`).d('拒绝')}
            </Button>
            {okBtn}
          </Fragment>
        ),
      onOk: posonInfoAgree,
    });
  };

  const getListData = (value) => {
    if (!isEmpty(calendarDataList)) {
      const currentDateN = value.date();
      const currentMonthN = value.month() + 1;
      const handleDate = Number(currentDateN < 10 ? `0${currentDateN}` : currentDateN);
      const handleMonth = Number(currentMonthN < 10 ? `0${currentMonthN}` : currentMonthN);
      // eslint-disable-next-line
      for (const item in calendarDataList) {
        const sliceDate = Number(item.slice(-2));
        const sliceMonth = Number(item.substring(5, 7));
        if (handleDate === sliceDate && sliceMonth === handleMonth) {
          return calendarDataList[item];
        }
      }
    }
  };

  const renderSchedule = (data = []) => {
    return (
      <ul
        className="events"
        style={{ listStyle: 'none', display: 'contents', whiteSpace: 'nowrap' }}
      >
        {data.map((item) => (
          <li
            key={item.scheduleHeardId}
            style={{ marginBottom: '5px' }}
            onClick={() => handleOpenInfo(item)}
          >
            <Badge
              status="success"
              text={`${item.startTime.substring(11, 16)}: ${item.scheduleName}`}
            />
          </li>
        ))}
      </ul>
    );
  };

  const dateCellRender = (value) => {
    const listData = getListData(value);
    if (!isEmpty(listData)) {
      const { count } = listData[0];
      const surplusCount = count - 3;
      return (
        <div>
          {renderSchedule(listData.slice(0, 3))}
          {surplusCount > 0 && (
            <Tooltip
              theme="light"
              placement="right"
              title={() => renderSchedule(listData.slice(3))}
            >
              {intl.get(`${prefix}.view.message.also`).d('还有')}
              {surplusCount}
              {intl.get(`${prefix}.view.message.schedule`).d('个日程')}
            </Tooltip>
          )}
        </div>
      );
    }
  };

  const handleSave = async () => {
    const validFlag = await dateTimeDs.validate();
    let flag = false;
    if (validFlag) {
      const currentData = dateTimeDs.current.toJSONData();
      const lineData = aiweiSchedulePersonsDs.toData();
      const response = await fetchSave([{ ...currentData, aiweiScheduleVisit: lineData }]);
      try {
        const res = getResponse(response);
        if (res) {
          notification.success();
          fetchCalendar();
          flag = true;
        }
      } catch (error) {
        throw error;
      }
    } else {
      notification.warning({
        message: intl.get(`${prefix}.view.message.requiredFillItems`).d('请填写必填项!'),
      });
    }
    return flag;
  };

  const handleOpenDateTimeCard = () => {
    Modal.open({
      title: intl.get(`${prefix}.view.title.scheduleAdd`).d('新建日历'),
      children: (
        <Form style={{ height: '400px' }} dataSet={dateTimeDs}>
          <TextField name="scheduleName" />
          {isPurchaser && <Lov name="aiweiScheduleReception" />}
          {isPurchaser && <Lov name="companyIdLov" />}
          <Output
            name="aiweiScheduleVisit"
            renderer={() => (
              <Row>
                <Col span={20}>
                  <Table dataSet={aiweiSchedulePersonsDs} columns={aiweiSchedulePersonsColuns} />
                </Col>
                <Col span={3} style={{ marginLeft: '8px' }}>
                  <Button onClick={handleAddAiweiSchedulePersons} color="primary">
                    {intl.get(`${prefix}.view.button.add`).d('添加')}
                  </Button>
                </Col>
              </Row>
            )}
          />
          {isPurchaser && <Lov name="supplierTenantIdLov" />}
          {isPurchaser && <TextField name="suitableSupplier" />}
          {isPurchaser && <TextField name="conferenceRoom" />}
          <DateTimePicker name="startTime" />
          <DateTimePicker name="endTime" />
          <Select name="remind" />
        </Form>
      ),
      style: { width: 660 },
      onOk: handleSave,
      afterClose: () => {
        dateTimeDs.loadData([]);
        aiweiSchedulePersonsDs.loadData([]);
      },
    });
  };

  const onPanelChange = (date) => {
    const selectMonth = date ? moment(date).month() + 1 : currentMonth;
    const selectYear = date ? moment(date).year() : currentYear;
    calendarDataDs.setQueryParameter(
      'month',
      `${selectYear}-${selectMonth < 10 ? `0${selectMonth}` : selectMonth}`
    );
    calendarDataDs.query();
  };

  return (
    <div className={styles.schedule}>
      <Row>
        <Icon type="test" style={{ padding: '12px 8px 10px 12px', color: '#6d7a80' }} />
        <span
          className={styles['card-title']}
          style={{ paddingLeft: '0px', position: 'relative', top: '3px' }}
        >
          {intl.get(`${prefix}.view.title.schedule`).d('日历')}
        </span>
        <Button
          onClick={handleOpenDateTimeCard}
          style={{ float: 'right', margin: '8px 16px 0 0' }}
          size="small"
          icon="add"
          color="primary"
        >
          {intl.get(`${prefix}.view.button.update`).d('新建')}
        </Button>
        <Row className="cardContent">
          <Calendar
            dateCellRender={dateCellRender}
            onPanelChange={onPanelChange}
            className={styles.calenderAiwei}
          />
        </Row>
      </Row>
    </div>
  );
};

export default formatterCollections({ code: ['spfm.dashboard', 'hwfm.common'] })(
  observer(ScheduleCode)
);
