import React, { Component } from 'react';
import { Form, DateTimePicker, NumberField, DataSet } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';

// import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';

import { TimeControlDS } from './TimeControlDS';
// import { BiddingPriceRunningFields } from '@/routes/ssrc/InquiryHallNew/Update/Components';
import { ComponentDiffRender, ComponentDiffRoundTime, TimeSelectionWrapper } from './utils';

const promptCode = 'ssrc.quoController';

// @formatterCollections({ code: ['ssrc.quoController', 'ssrc.inquiryHall', 'ssrc.common'] })
export default class TimeControl extends Component {
  constructor(props) {
    super(props);

    if (props.getTimeController) {
      props.getTimeController(this);
    }

    this.state = {
      config: [], // 配置信息
    };
    this.timeControlDS = new DataSet(TimeControlDS(props.quotationName));
  }

  getSnapshotBeforeUpdate(prevProps = {}) {
    const { header: prevheader = null } = prevProps;
    const { header = null } = this.props;
    const { adjustRecordId: preAdjustRecordId = null } =
      prevheader?.rfxRequireQuotationAdjustDTO || {};
    const { adjustRecordId } = header?.rfxRequireQuotationAdjustDTO || {};
    return adjustRecordId && adjustRecordId !== preAdjustRecordId;
  }

  componentDidUpdate(...params) {
    if (params[2]) {
      const { header } = this.props;
      this.initDSFields(header.rfxRequireQuotationAdjustDTO);
    }
  }

  _modal = {};

  // 字段字典
  @Bind()
  fieldsDictionary() {
    const { quotationName, remote } = this.props;
    const dictionary = {
      estimatedStartTime: {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.estimatedStartTime`).d('预计开始时间'),
        placeholder: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.estimatedStartTime`)
          .d('预计开始时间'),
        min: new Date(),
        customOptions: {},
        renderer: <DateTimePicker name="estimatedStartTime" />,
      },
      quotationStartDate: {
        label: intl
          .get(`${promptCode}.model.quoController.commonQuotationStartTime`, { quotationName })
          .d('{quotationName}开始时间'),
        placeholder: intl
          .get(`${promptCode}.model.quoController.commonQuotationStartTime`, { quotationName })
          .d('{quotationName}开始时间'),
        format: DEFAULT_DATETIME_FORMAT,
        min: new Date(),
        customOptions: {},
        renderer: (
          <DateTimePicker
            name="quotationStartDate"
            defaultTime={
              remote
                ? remote.process(
                    'SSRC_QUOTATION_CONTROLLER_UPDATE_PROCESS_QUOTATION_START_DEF_TIME',
                    undefined
                  )
                : undefined
            }
          />
        ),
      },
      quotationRunningDuration: {
        label: intl
          .get(`${promptCode}.model.quoController.commonQuotRunningDuration`, { quotationName })
          .d('{quotationName}运行时间'),
        type: 'number',
        placeholder: intl
          .get(`${promptCode}.model.quoController.commonQuotRunningDuration`, { quotationName })
          .d('{quotationName}运行时间'),
        customOptions: {
          min: 0,
          max: 1000,
        },
      },
      quotationInterval: {
        label: intl
          .get(`${promptCode}.model.quoController.commonQuotationInterval`, { quotationName })
          .d('{quotationName}间隔时间'),
        type: 'number',
        placeholder: intl
          .get(`${promptCode}.model.quoController.commonQuotationInterval`, { quotationName })
          .d('{quotationName}间隔时间'),
        format: DEFAULT_DATETIME_FORMAT,
        customOptions: {},
        renderer: <NumberField name="quotationInterval" min={0} max={99999999} />,
      },
      quotationEndDate: {
        label: intl
          .get(`${promptCode}.model.quoController.commonQuotationDeadline`, { quotationName })
          .d('{quotationName}截止时间'),
        min: new Date(),
        placeholder: intl
          .get(`${promptCode}.model.quoController.commonQuotationDeadline`, { quotationName })
          .d('{quotationName}截止时间'),
        format: DEFAULT_DATETIME_FORMAT,
        customOptions: {},
        renderer: (
          <DateTimePicker
            name="quotationEndDate"
            defaultTime={
              remote
                ? remote.process(
                    'SSRC_QUOTATION_CONTROLLER_UPDATE_PROCESS_QUOTATION_END_DEF_TIME',
                    undefined
                  )
                : undefined
            }
          />
        ),
      },
      bargainEndDate: {
        label: intl.get(`${promptCode}.model.quoController.bargainEndDate`).d('议价截止时间'),
        placeholder: intl.get(`${promptCode}.model.quoController.bargainEndDate`).d('议价截止时间'),
        format: DEFAULT_DATETIME_FORMAT,
        min: new Date(),
        customOptions: {},
        renderer: <DateTimePicker name="bargainEndDate" />,
      },
      roundQuotationEndDate: {
        label: intl
          .get(`${promptCode}.model.quoController.roundQuotationEndDate`)
          .d('当前轮次截止时间'),
        min: new Date(),
        placeholder: intl
          .get(`${promptCode}.model.quoController.roundQuotationEndDate`)
          .d('当前轮次截止时间'),
        format: DEFAULT_DATETIME_FORMAT,
        customOptions: {},
        renderer: <DateTimePicker name="roundQuotationEndDate" />,
      },
    };
    return dictionary;
  }

  // 改变竞价运行时间
  @Bind
  changeBiddingRunningTime(value = null, type = 'minute') {
    let data = null;
    const days = this.timeControlDS.current.get('biddingRunnintDay') || null;
    const hours = this.timeControlDS.current.get('biddingRunnintHour') || null;
    const minutes = this.timeControlDS.current.get('biddingRunnintMinute') || null;

    if (!days && !hours && !minutes) {
      this.timeControlDS.current.set('biddingRunnintDay', null);
      this.timeControlDS.current.set('biddingRunnintHour', null);
      this.timeControlDS.current.set('biddingRunnintMinute', null);
      return;
    }

    if (type === 'day') {
      data = value * 1440 + hours * 60 + minutes;
    } else if (type === 'hour') {
      data = days * 1440 + value * 60 + minutes;
    } else {
      data = days * 1440 + hours * 60 + value;
    }

    this.timeControlDS.current.set('quotationRunningDuration', data);
  }

  clearTimerField = () => {
    this.setState({ config: [] });
  };

  // 初始化ds
  @Bind()
  initDSFields(fields = {}) {
    if (isEmpty(fields)) {
      return;
    }

    const config = [];
    let configData = {};

    const {
      fieldPropertyDTOList = [],
      rfxRoundHeaderDateAdjustDTOList = [],
      rfxRequireQuotationDTO, // 历史数据
      nowAdjustedField: dateNowAdjustField = null,
    } = fields;
    const { quotationName } = this.props;

    const fieldsDictionary = this.fieldsDictionary();

    fieldPropertyDTOList.forEach((field = {}) => {
      const { name = null, visible = 0, value: defaultValue = null, required = 0 } = field;
      if (!name || !visible || name === 'clarifyEndDate') {
        return;
      }

      const constantProperty = fieldsDictionary[name] || {};
      const newField = { ...field, ...constantProperty, defaultValue };

      // 运行时间 (需要处理字段)
      if (name === 'quotationRunningDuration') {
        const transTime = this.transTime(defaultValue);
        this.initRunningDuration({ ...newField, ...transTime, label: null });
        configData = { ...configData, ...transTime };
      }

      const isCurrentDateAdjust = dateNowAdjustField && dateNowAdjustField.indexOf(name);

      const TimeWrapper = `${name}Wrapper`;
      this.timeControlDS.addField(name, {
        ...newField,
        dynamicProps: {
          required: ({ record }) => {
            return record?.get(TimeWrapper) === 'custom' && !!required;
          },
        },
      });
      this.timeControlDS.addField(TimeWrapper, { ...newField, required: false });
      configData[name] = defaultValue;
      configData[TimeWrapper] =
        isCurrentDateAdjust !== 0 || isCurrentDateAdjust === null ? 'custom' : 'start';

      config.push(newField);
    });

    if (rfxRoundHeaderDateAdjustDTOList && !isEmpty(rfxRoundHeaderDateAdjustDTOList)) {
      rfxRoundHeaderDateAdjustDTOList.forEach((field = {}) => {
        const {
          quotationRound = null,
          roundQuotationStartDate = null,
          roundQuotationEndDate = null,
          nowAdjustedField = '',
          fieldPropertyDTOList: roundFieldPropertyDTOList = [],
        } = field;
        if (!quotationRound) {
          return;
        }

        const start = `roundQuotationStart${quotationRound}`;
        const end = `roundQuotationEnd${quotationRound}`;
        let startDefaultProps = {};
        let endDefaultProps = {};
        if (!isEmpty(roundFieldPropertyDTOList)) {
          roundFieldPropertyDTOList.forEach((item = {}) => {
            const { name = null, ...others } = item;
            if (name === 'roundQuotationStartDate') {
              startDefaultProps = others;
            } else {
              endDefaultProps = others;
            }
          });
        }

        const startProps = {
          ...field,
          name: start,
          ...startDefaultProps,
          value: roundQuotationStartDate,
          min: quotationRound === 1 ? new Date() : `roundQuotationEnd${quotationRound - 1}`,
          required: false,
          format: DEFAULT_DATETIME_FORMAT,
          label: intl
            .get('ssrc.common.model.common.commonStartRound', { quotationRound, quotationName })
            .d('第{quotationRound}轮{quotationName}开始时间'),
          renderer: <DateTimePicker name={start} max={end} />,
        };
        const endProps = {
          ...field,
          name: end,
          ...endDefaultProps,
          value: roundQuotationEndDate,
          format: DEFAULT_DATETIME_FORMAT,
          min: start,
          required: false,
          label: intl
            .get('ssrc.common.model.common.commonEndRound', { quotationRound, quotationName })
            .d('第{quotationRound}轮{quotationName}截止时间'),
          renderer: <DateTimePicker name={end} min={start} />,
        };

        this.timeControlDS.addField(start, startProps);
        this.timeControlDS.addField(end, endProps);
        configData[start] = roundQuotationStartDate;
        configData[end] = roundQuotationEndDate;

        const StartTimeWrapper = `${start}Wrapper`;
        const EndTimeWrapper = `${end}Wrapper`;

        this.timeControlDS.addField(StartTimeWrapper, startProps);
        this.timeControlDS.addField(EndTimeWrapper, endProps);

        const RoundQuotationNowAdjustedField = `nowAdjustedField${quotationRound}`;
        this.timeControlDS.addField(RoundQuotationNowAdjustedField);
        configData[RoundQuotationNowAdjustedField] = nowAdjustedField;

        const isStartNowAdjust =
          nowAdjustedField && nowAdjustedField.indexOf('roundQuotationStart');
        const isEndNowAdjust = nowAdjustedField && nowAdjustedField.indexOf('roundQuotationEnd');

        configData[StartTimeWrapper] = isStartNowAdjust !== 0 ? 'custom' : 'start';
        configData[EndTimeWrapper] = isEndNowAdjust !== 0 ? 'custom' : 'start';

        config.push(startProps);
        config.push(endProps);
      });
      const historyRoundQuotatonData = {};
      rfxRequireQuotationDTO.rfxRoundHeaderDateDTOList.forEach((item) => {
        const { quotationRound, roundQuotationStartDate, roundQuotationEndDate } = item;
        historyRoundQuotatonData[`roundQuotationStart${quotationRound}`] = roundQuotationStartDate;
        historyRoundQuotatonData[`roundQuotationEnd${quotationRound}`] = roundQuotationEndDate;
      });

      configData.rfxRequireQuotationDTO = {
        ...rfxRequireQuotationDTO,
        ...historyRoundQuotatonData,
      };
    }

    this.setState({
      config,
    });
    this.timeControlDS.loadData([{ ...fields, ...configData }]);
    this.forceUpdate();
  }

  // 转换报价运行时间
  transTime(value = null) {
    let biddingRunnintDay = null;
    let biddingRunnintHour = null;
    let biddingRunnintMinute = null;

    if (value) {
      biddingRunnintDay = Math.floor(value / 1440);
      biddingRunnintHour =
        biddingRunnintDay > 0
          ? Math.floor((value - biddingRunnintDay * 1440) / 60)
          : value
          ? Math.floor(value / 60)
          : value;
      biddingRunnintMinute =
        biddingRunnintHour > 0 || biddingRunnintDay > 0
          ? value - biddingRunnintDay * 1440 - biddingRunnintHour * 60
          : value;
    }

    return {
      biddingRunnintDay,
      biddingRunnintHour,
      biddingRunnintMinute,
    };
  }

  // 解析竞价运行时间
  initRunningDuration(newField = {}) {
    const { required = 0 } = newField;

    this.timeControlDS.addField('biddingRunnintDay', {
      ...newField,
      defaultValue: null,
      defaultValidationMessages: { valueMissingNoLabel: '' },
      placeholder: intl
        .get('ssrc.inquiryHall.view.inquiryHall.durationRunningTimeDay')
        .d('运行时间(天)'),
      dynamicProps: {
        required({ record }) {
          return (
            required &&
            !record.get('biddingRunnintDay') &&
            !record.get('biddingRunnintHour') &&
            !record.get('biddingRunnintMinute')
          );
        },
      },
    });
    this.timeControlDS.addField('biddingRunnintHour', {
      ...newField,
      defaultValue: null,
      defaultValidationMessages: { valueMissingNoLabel: '' },
      placeholder: intl.get('hzero.common.date.unit.hours').d('小时'),
      dynamicProps: {
        required({ record }) {
          return (
            required &&
            !record.get('biddingRunnintDay') &&
            !record.get('biddingRunnintHour') &&
            !record.get('biddingRunnintMinute')
          );
        },
      },
    });
    this.timeControlDS.addField('biddingRunnintMinute', {
      ...newField,
      defaultValue: null,
      placeholder: intl.get('hzero.common.date.unit.minutes').d('分钟'),
      defaultValidationMessages: { valueMissingNoLabel: '' },
      dynamicProps: {
        required({ record }) {
          return (
            required &&
            !record.get('biddingRunnintDay') &&
            !record.get('biddingRunnintHour') &&
            !record.get('biddingRunnintMinute')
          );
        },
      },
    });
  }

  // ----------------------------------------------------------------------------------------------------------------------------------------

  // componentDidMount() {
  //   const { header = {} } = this.props;
  //   this.initDSFields(header.rfxRequireQuotationAdjustDTO);
  // }

  @Bind()
  renderFields() {
    const { config = [] } = this.state;
    const { quotationName, preQualificationRef, remote } = this.props;

    if (isEmpty(config)) {
      return null;
    }

    const record = this.timeControlDS.current || {};
    const fields = config.map((item = {}) => {
      const { visible = 0, name, quotationRound = null, renderer = null } = item;

      if (!visible) {
        return null;
      }

      if (name === 'quotationRunningDuration') {
        return (
          <ComponentDiffRoundTime
            record={record}
            historyDTO="rfxRequireQuotationDTO"
            name={name}
            key={name}
            label={intl
              .get(`${promptCode}.model.quoController.commonQuotRunningDuration`, { quotationName })
              .d('{quotationName}运行时间')}
            changeBiddingRunningTime={this.changeBiddingRunningTime}
          />
        );
      }
      if (name === 'quotationInterval') {
        return (
          <ComponentDiffRender
            key={name}
            record={record}
            historyDTO="rfxRequireQuotationDTO"
            name={name}
          >
            {renderer}
          </ComponentDiffRender>
        );
      }

      if (name === 'quotationStartDate' && preQualificationRef?.prequalificationDS?.current) {
        const quotationStartDate = this.timeControlDS.getField('quotationStartDate');
        quotationStartDate.set('dynamicProps', {
          min() {
            const prequalEndDate = preQualificationRef?.prequalificationDS?.current?.get(
              'prequalEndDate'
            );
            return new Date(prequalEndDate) > new Date() ? prequalEndDate : new Date();
          },
        });
      }

      if (name === 'quotationEndDate' && this.timeControlDS?.current) {
        const quotationEndDate = this.timeControlDS.getField('quotationEndDate');
        quotationEndDate.set('dynamicProps', {
          min({ dataSet }) {
            const quotationStartDate = dataSet.current.get('quotationStartDate');
            return new Date(quotationStartDate) > new Date() ? quotationStartDate : new Date();
          },
        });
      }

      return (
        <ComponentDiffRender
          record={record}
          historyDTO="rfxRequireQuotationDTO"
          name={name}
          key={name}
        >
          <TimeSelectionWrapper
            data={item}
            name={name}
            dataSet={this.timeControlDS}
            quotationRound={quotationRound}
            remote={remote}
          />
        </ComponentDiffRender>
      );
    });

    return fields;
  }

  render() {
    const { customizeForm, custLoading, custKey } = this.props;
    const { config = [] } = this.state;
    return (
      <React.Fragment>
        {!!config.length && (
          <Form
            className="quotationFields"
            dataSet={this.timeControlDS}
            labelLayout="float"
            columns={3}
            custLoading={custLoading}
            useWidthPercent
          >
            {this.renderFields()}
          </Form>
        )}

        {customizeForm(
          {
            code: `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.TIMEADJUST`,
            dataSet: this.timeControlDS,
          },
          <Form
            dataSet={this.timeControlDS}
            labelLayout="float"
            columns={3}
            custLoading={custLoading}
            useWidthPercent
          >
            <ComponentDiffRender
              record={this.timeControlDS.current}
              historyDTO="rfxRequireQuotationDTO"
              name="minQuotedSupplier"
              labelLayout="float"
            >
              <NumberField name="minQuotedSupplier" />
            </ComponentDiffRender>
            <ComponentDiffRender
              name="clarifyEndDate"
              record={this.timeControlDS.current}
              historyDTO="rfxRequireQuotationDTO"
            >
              <DateTimePicker name="clarifyEndDate" />
            </ComponentDiffRender>
          </Form>
        )}
      </React.Fragment>
    );
  }
}
