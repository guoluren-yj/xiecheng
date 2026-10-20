import React from "react";
import moment from 'moment';
import { pick } from "lodash";
import { observable } from "mobx";
import { observer } from "mobx-react";
import { Alert } from "choerodon-ui";
import { DataSet, Button, Table, DateTimePicker } from "choerodon-ui/pro";
import intl from 'hzero-front/lib/utils/intl';
import request from "hzero-front/lib/utils/request";
import { getCurrentOrganizationId, getResponse, isTenantRoleLevel } from "hzero-front/lib/utils/utils";
import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';

@formatterCollections({ code: ['hmsg.messageQuery'] })
@observer
export default class EmailSendStatus extends React.Component {

  @observable
  nextStart = '';

  queryDataSet = new DataSet({

    fields: [
      {
        name: 'toAddress',
        type: 'string',
        label: intl.get("hmsg.messageQuery.model.messageQuery.receiverAddress").d('收件人地址'),
        display: true,
        pattern: /[0-9a-zA-Z\-_\.]+@[0-9a-zA-Z\-_\.]+/,
      },
      {
        name: 'startTime',
        type: 'dateTime',
        label: intl.get("hmsg.messageQuery.model.messageQuery.startDate").d('发送时间从'),
        defaultValue: moment().subtract(1, "month").subtract(-1, "day").format("YYYY-MM-DD 00:00:00"),
        validator: (value, name, record) => {
          if (value && record.get('endTime') && moment(value).isAfter(moment(record.get('endTime')))) {
            return intl.get('hmsg.messageQuery.validate.startDateShouldEarly').d('发送时间从应早于发送时间至');
          }
          if (value && record.get('endTime') && moment(value).isBefore(moment(record.get('endTime')).subtract(1, "month"))) {
            return intl.get('hmsg.messageQuery.validate.dateDiffShouldInMonth').d('发送时间从与发送时间至相差不能超过一个月');
          }
          if (value && (moment(value).isBefore(moment().subtract(1, "month")) || moment(value).isAfter(moment().subtract(-1, "month")))) {
            return intl.get('hmsg.messageQuery.validate.shouldInMonth').d('只能选择近一个月内时间');
          }
        },
        filter: (currentDate, selected, mode) => {
          return false;
        },
        required: true,
        display: true,
        transformRequest(value) {
          if (value) {
            return moment(value).format("YYYY-MM-DD HH:mm");
          }
          return value;
        }
      },
      {
        name: 'endTime',
        type: 'dateTime',
        label: intl.get("hmsg.messageQuery.model.messageQuery.endDate").d('发送时间至'),
        defaultValue: moment().format("YYYY-MM-DD 23:59:59"),
        validator: (value, name, record) => {
          if (value && record.get('startTime') && moment(value).isBefore(moment(record.get('startTime')))) {
            return intl.get('hmsg.messageQuery.validate.endDateShouldLater').d('发送时间至应晚于发送时间从');
          }
          if (value && record.get('startTime') && moment(value).isAfter(moment(record.get('startTime')).subtract(-1, "month"))) {
            return intl.get('hmsg.messageQuery.validate.dateDiffShouldInMonth').d('发送时间从与发送时间至相差不能超过一个月');
          }
          if (value && (moment(value).isBefore(moment().subtract(1, "month")) || moment(value).isAfter(moment().subtract(-1, "month")))) {
            return intl.get('hmsg.messageQuery.validate.shouldInMonth').d('只能选择近一个月内时间');
          }
        },
        required: true,
        display: true,
        transformRequest(value) {
          if (value) {
            return moment(value).format("YYYY-MM-DD HH:mm");
          }
          return value;
        }
      },
      {
        name: 'status',
        type: 'string',
        label: intl.get("hmsg.messageQuery.common.emailSendStatus2").d('投递结果'),
        lookupCode: 'HMSG.MESSAGEQUERY.DELIEVER_STATUS',
        display: true,
      },
    ],
    events: {
      update: () => {
        this.nextStart = '';
      }
    }
  })
  tableDs = new DataSet({
    paging: false,
    fields: [
      {
        name: 'subject',
        type: 'string',
        label: intl.get("hmsg.messageQuery.common.emailSubject").d('消息标题'),
      },
      {
        name: 'toAddress',
        type: 'string',
        label: intl.get("hmsg.messageQuery.model.messageQuery.receiverAddress").d('收件人地址'),
      },
      {
        name: 'lastUpdateTime',
        type: 'dateTime',
        label: intl.get("hmsg.messageQuery.model.messageQuery.sendDate").d('发送时间'),
        required: true,
      },
      {
        name: 'status',
        type: 'string',
        label: intl.get("hmsg.messageQuery.common.emailSendStatus").d('投递结果'),
        lookupCode: 'HMSG.MESSAGEQUERY.DELIEVER_STATUS',
      },
      {
        name: 'message',
        type: 'string',
        label: intl.get("hmsg.messageQuery.common.emailDetail").d('发送详情'),
      },
    ],
    queryDataSet: this.queryDataSet,
    transport: {
      read: ({ data }) => {
        return {
          url: isTenantRoleLevel()
            ? `/hmsg/v1/${getCurrentOrganizationId()}/3rd/aliyun/email/list`
            : `/hmsg/v1/3rd/aliyun/email/list?tenantId=${this.props.tenantId}`,
          method: 'POST',
          responseType: 'json',
          data: { ...data, length: 10, nextStart: '' },
          transformResponse: res => {
            this.nextStart = '';
            if (getResponse(res)) {
              const { nextStart } = res;
              const data = res.data || {};
              this.nextStart = nextStart;
              return data.mailDetail || [];
            }
            return [];
          },
        };
      }
    },
  })

  columns = [
    { name: 'subject' },
    { name: 'toAddress' },
    { name: 'lastUpdateTime' },
    { name: 'status' },
    { name: 'message' },
  ]

  componentDidMount() {
    this.tableDs.query();
  }

  queryNextPage = async () => {
    if (!this.tableDs.queryDataSet || !(await this.tableDs.queryDataSet.validate())) return false;
    this.tableDs.status = "loading";
    const filterParams = this.tableDs.queryDataSet.current && this.tableDs.queryDataSet.current.toJSONData() || {};
    return request(isTenantRoleLevel()
      ? `/hmsg/v1/${getCurrentOrganizationId()}/3rd/aliyun/email/list`
      : `/hmsg/v1/3rd/aliyun/email/list?tenantId=${this.props.tenantId}`, {
      method: 'POST',
      body: Object.assign({ nextStart: this.nextStart, length: 10 }, pick(filterParams, ['toAddress', 'startTime', 'endTime', 'status'])
      ),
    }).then(res => {
      if (getResponse(res)) {
        const { nextStart } = res;
        const data = res.data || {};
        this.nextStart = nextStart;
        this.tableDs.appendData(data.mailDetail || []);
      }
    }).finally(() => {
      this.tableDs.status = "ready";
    })
  }

  tableQueryFields = {
    startTime: <DateTimePicker filter={(currentDate) => moment(currentDate).isAfter(moment().subtract(1, "month")) && moment(currentDate).isBefore(moment().subtract(-1, "month"))} />,
    endTime: <DateTimePicker filter={(currentDate) => moment(currentDate).isAfter(moment().subtract(1, "month")) && moment(currentDate).isBefore(moment().subtract(-1, "month"))} />
  }

  render() {
    return (
      <div style={{ height: "100%" }}>
        <Alert
          style={{ marginBottom: '16px', color: "#276EF1" }}
          message={intl
            .get('hmsg.messageQuery.common.emailSendStatus.alert')
            .d('查询时间范围最多支持30天；当前页面查询数据为第三方邮件服务器具体的发送记录数据，请通过接收人地址有时间进行查询，查询出的数据不支持多语言。')}
          type="info"
        />
        <Table
          style={{ maxHeight: "calc(100% - 170px)" }}
          dataSet={this.tableDs}
          columns={this.columns}
          queryFields={this.tableQueryFields}
          footer={() => this.nextStart ? (
            <Button style={{ width: "calc(100% + 16px)", maxWidth: "unset", margin: "0 -8px" }} onClick={this.queryNextPage}>
              {intl.get("hzero.c7nUI.Pagination.next_page")}
            </Button>
          ) : null}
        />
      </div>
    );
  }
}