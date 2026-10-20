import React, { Component } from 'react';
import { Form, DataSet, Output, Row, Col } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { isEmpty, noop, isNil, isFunction } from 'lodash';
import classnames from 'classnames';
import intl from 'utils/intl';

import formatterCollections from 'utils/intl/formatterCollections';
import { dateTimeRender } from 'utils/renderer';

import { TimeControlDS } from './TimeControlDS';

import style from './index.less';

const promptCode = 'ssrc.quoController';

@formatterCollections({
  code: ['ssrc.quoController', 'ssrc.inquiryHall', 'ssrc.common', 'ssrc.biddingHall'],
})
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

  _modal = {};

  renderDurationTime(record = {}, field = null) {
    if (!field) {
      return null;
    }
    const { judgeNewBiddingFlag = noop } = this.props;
    // 竞价大厅-竞价单
    const newBiddingFlag = judgeNewBiddingFlag();

    let quoteDay = 0;
    let quoteHour = 0;
    let quoteMinute = 0;
    const Times = record.get(field) || null;

    const setFields = () => {
      const DayMeaning =
        quoteDay +
        intl.get('hzero.common.date.unit.day').d('天') +
        quoteHour +
        intl.get('hzero.common.date.unit.hours').d('小时') +
        quoteMinute +
        intl.get('hzero.common.date.unit.minutes').d('分钟');

      return DayMeaning;
    };

    if (!Times && Times !== 0) {
      setFields();
      return;
    }

    quoteDay = Math.floor(Times / 1440);
    quoteHour =
      quoteDay > 0
        ? Math.floor((Times - quoteDay * 1440) / 60)
        : Times
        ? Math.floor(Times / 60)
        : Times;
    quoteMinute = quoteHour > 0 || quoteDay > 0 ? Times - quoteDay * 1440 - quoteHour * 60 : Times;

    if (newBiddingFlag) {
      // 新竞价分钟保留1位
      quoteMinute = quoteMinute.toFixed(1);
    } else {
      quoteMinute = quoteMinute.toFixed(2);
    }
    return setFields();
  }

  @Bind
  getClassName(field) {
    const { header = {}, currentMode } = this.props;
    const { adjustFields = [] } = header?.rfxRequireQuotationAdjustDTO || {};
    let className = '';
    if (adjustFields?.includes(field)) {
      if (currentMode === 'current') {
        className = 'changeAfter';
      } else if (currentMode === 'history') {
        className = 'changeBefore';
      }
    }
    return className;
  }

  @Bind
  getRoundQuotationClassName(adjustFields = [], field) {
    const { currentMode } = this.props;
    let className = '';
    if (adjustFields?.includes(field)) {
      if (currentMode === 'current') {
        className = 'changeAfter';
      } else if (currentMode === 'history') {
        className = 'changeBefore';
      }
    }
    return className;
  }

  // 字段字典
  fieldsDictionary() {
    const { quotationName, judgeNewBiddingFlag = noop } = this.props;
    // 竞价大厅-竞价单
    const newBiddingFlag = judgeNewBiddingFlag();

    // 运行时间 label
    const quotationRunningDurationLabel = !newBiddingFlag
      ? intl
          .get(`${promptCode}.model.quoController.commonQuotRunningDuration`, { quotationName })
          .d('{quotationName}运行时间')
      : intl.get(`ssrc.inquiryHall.model.inquiryHall.biddingRunningTime`).d('竞价运行时间');

    return {
      estimatedStartTime: {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.estimatedStartTime`).d('预计开始时间'),
        renderer: (
          <Output name="estimatedStartTime" className={this.getClassName('estimatedStartTime')} />
        ),
        renderType: dateTimeRender,
      },
      quotationStartDate: {
        label: !newBiddingFlag
          ? intl
              .get(`${promptCode}.model.quoController.commonQuotationStartTime`, { quotationName })
              .d('{quotationName}开始时间')
          : intl.get(`ssrc.inquiryHall.model.biddingTime.biddingStartTime`).d('竞价开始时间'),
        renderer: (
          <Output name="quotationStartDate" className={this.getClassName('quotationStartDate')} />
        ),
        renderType: dateTimeRender,
      },
      quotationRunningDuration: {
        label: quotationRunningDurationLabel,
        renderer: (
          <Output
            className={
              newBiddingFlag
                ? this.getClassName('quotationEndDate') ||
                  this.getClassName('quotationRunningDuration')
                : this.getClassName('quotationRunningDuration')
            }
            label={quotationRunningDurationLabel}
            name="biddingRunnintDay"
            renderer={({ record: currentRecord }) =>
              this.renderDurationTime(currentRecord, 'quotationRunningDuration')
            }
          />
        ),
      },
      quotationInterval: {
        label: intl
          .get(`${promptCode}.model.quoController.commonQuotationInterval`, { quotationName })
          .d('{quotationName}间隔时间'),
        renderer: (
          <Output name="quotationInterval" className={this.getClassName('quotationInterval')} />
        ),
      },
      quotationEndDate: {
        label: !newBiddingFlag
          ? intl
              .get(`${promptCode}.model.quoController.commonQuotationDeadline`, { quotationName })
              .d('{quotationName}截止时间')
          : intl.get(`ssrc.inquiryHall.model.biddingTime.biddingEndDate`).d('竞价截止时间'),
        renderer: (
          <Output name="quotationEndDate" className={this.getClassName('quotationEndDate')} />
        ),
        renderType: dateTimeRender,
      },
      bargainEndDate: {
        label: intl.get(`${promptCode}.model.quoController.bargainEndDate`).d('议价截止时间'),
        renderer: <Output name="bargainEndDate" className={this.getClassName('bargainEndDate')} />,
        renderType: dateTimeRender,
      },
      roundQuotationEndDate: {
        label: intl
          .get(`${promptCode}.model.quoController.roundQuotationEndDate`)
          .d('当前轮次截止时间'),
        renderer: (
          <Output
            name="roundQuotationEndDate"
            className={this.getClassName('roundQuotationEndDate')}
          />
        ),
        renderType: dateTimeRender,
      },
      // 签到时间
      signInStartDate: {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.signStartTimeRFX`).d(`签到开始时间`),
        renderer: (
          <Output name="signInStartDate" className={this.getClassName('signInStartDate')} />
        ),
        renderType: dateTimeRender,
      },
      signInEndDate: {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.signInEndDate`).d(`签到截止时间`),
        renderer: (
          <Output
            name="signInEndDate"
            className={
              this.getClassName('signInEndDate') || this.getClassName('signInRunningDuration')
            }
          />
        ),
        renderType: dateTimeRender,
      },
      signInRunningDuration: {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.signInRunningDuration`)
          .d('签到运行时间'),
        renderer: (
          <Output
            className={
              this.getClassName('signInEndDate') || this.getClassName('signInRunningDuration')
            }
            label={intl
              .get(`ssrc.inquiryHall.model.inquiryHall.signInRunningDuration`)
              .d('签到运行时间')}
            name="signInRunningDuration"
            renderer={({ record: currentRecord }) =>
              this.renderDurationTime(currentRecord, 'signInRunningDuration')
            }
          />
        ),
      },
      // 试竞价时间
      startingTrialBiddingStartDate: {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.startingTrialBiddingStartDate`)
          .d(`试竞价开始时间`),
        renderer: (
          <Output
            name="startingTrialBiddingStartDate"
            className={this.getClassName('startingTrialBiddingStartDate')}
          />
        ),
        renderType: dateTimeRender,
      },
      startingTrialBiddingEndDate: {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.startingTrialBiddingEndDate`)
          .d(`试竞价截止时间`),
        renderer: (
          <Output
            name="startingTrialBiddingEndDate"
            className={
              this.getClassName('startingTrialBiddingEndDate') ||
              this.getClassName('startingTrialBiddingRunningDuration')
            }
          />
        ),
        renderType: dateTimeRender,
      },
      startingTrialBiddingRunningDuration: {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.startingTrialBiddingRunningDuration`)
          .d('试竞价运行时间'),
        renderer: (
          <Output
            className={
              this.getClassName('startingTrialBiddingEndDate') ||
              this.getClassName('startingTrialBiddingRunningDuration')
            }
            label={intl
              .get(`ssrc.inquiryHall.model.inquiryHall.startingTrialBiddingRunningDuration`)
              .d('试竞价运行时间')}
            name="startingBiddingRunningDay"
            renderer={({ record: currentRecord }) =>
              this.renderDurationTime(currentRecord, 'startingTrialBiddingRunningDuration')
            }
          />
        ),
      },
      // 补充单价
      biddingSupplementPriceStartDate: {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.biddingSupplementPriceStartDate`)
          .d(`补充单价开始时间`),
        renderer: (
          <Output
            name="biddingSupplementPriceStartDate"
            className={this.getClassName('biddingSupplementPriceStartDate')}
          />
        ),
        renderType: dateTimeRender,
      },
      biddingSupplementPriceEndDate: {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.biddingSupplementPriceEndDate`)
          .d(`补充单价截止时间`),
        renderer: (
          <Output
            name="biddingSupplementPriceEndDate"
            className={
              this.getClassName('biddingSupplementPriceEndDate') ||
              this.getClassName('biddingSupplementPriceRunningDuration')
            }
          />
        ),
        renderType: dateTimeRender,
      },
      biddingSupplementPriceRunningDuration: {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.biddingSupplementPriceRunningDuration`)
          .d(`补充单价运行时间`),
        renderer: (
          <Output
            className={
              this.getClassName('biddingSupplementPriceEndDate') ||
              this.getClassName('biddingSupplementPriceRunningDuration')
            }
            label={intl
              .get(`ssrc.inquiryHall.model.inquiryHall.biddingSupplementPriceRunningDuration`)
              .d('补充单价运行时间')}
            name="biddingSupplementPriceRunningDuration"
            renderer={({ record: currentRecord }) =>
              this.renderDurationTime(currentRecord, 'biddingSupplementPriceRunningDuration')
            }
          />
        ),
      },
      autoDeferDuration: {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.autoDeferDuration`).d('延时时长'),
        renderer: (
          <Output
            name="autoDeferDuration"
            renderer={({ value }) => {
              if (!isNil(value)) {
                return `${value}${intl
                  .get('ssrc.inquiryHall.model.biddingDate.autoDeferPeriod.lastMinute')
                  .d('分钟')}`;
              }
              return '';
            }}
            className={this.getClassName('autoDeferDuration')}
          />
        ),
      },
    };
  }

  renderStartText = (name = null) => {
    const StartReg = /Start/;
    const StartFlag = name && StartReg.test(name);
    return StartFlag
      ? intl.get('ssrc.quoController.view.selectStartByPublish').d('发布即开始')
      : intl.get('ssrc.quoController.view.selectEndByPublish').d('发布即截至');
  };

  // 初始化ds
  @Bind()
  initDSFields(fields = {}) {
    const config = [];
    let configData = {};

    if (isEmpty(fields)) {
      return;
    }

    const {
      rfxRoundHeaderDateAdjustDTOList = [],
      fieldPropertyDTOList = [],
      nowAdjustedField: dateNowAdjustField = '',
    } = fields || {};
    const fieldsDictionary = this.fieldsDictionary();
    const { quotationName } = this.props;

    if (fieldPropertyDTOList?.length) {
      const dateNowAdjustFieldList = (dateNowAdjustField || '').split(',').filter(Boolean);

      fieldPropertyDTOList.forEach((field = {}) => {
        const { name = null, visible = 0, value: defaultValue = null } = field;
        if (!name || !visible) {
          return;
        }

        const constantProperty = fieldsDictionary[name] || {};
        const newField = { name, ...constantProperty, defaultValue, visible };

        // 报价运行时间 (需要处理字段)
        if (name === 'quotationRunningDuration') {
          const transTime = this.transTime(defaultValue);
          configData = { ...configData, ...transTime };
        }

        let currentTextValue =
          defaultValue &&
          constantProperty &&
          constantProperty.renderType &&
          isFunction(constantProperty.renderType)
            ? constantProperty.renderType(defaultValue)
            : defaultValue;
        if (dateNowAdjustFieldList.indexOf(name) !== -1) {
          currentTextValue = this.renderStartText(name);
        }

        this.timeControlDS.addField(name, newField);
        configData[name] = currentTextValue;
        config.push(newField);
      });
    }

    if (rfxRoundHeaderDateAdjustDTOList && !isEmpty(rfxRoundHeaderDateAdjustDTOList)) {
      rfxRoundHeaderDateAdjustDTOList.forEach((field = {}) => {
        const {
          quotationRound = null,
          roundQuotationStartDate = null,
          roundQuotationEndDate = null,
          fieldPropertyDTOList: roundFieldPropertyDTOList = [],
          adjustFields = [],
          nowAdjustedField = null,
        } = field;
        if (!quotationRound) {
          return;
        }

        const nowAdjustedFieldList = (nowAdjustedField || '').split(',').filter(Boolean);
        const start = `roundQuotationStart${quotationRound}`;
        const end = `roundQuotationEnd${quotationRound}`;
        let startDefaultProps = {};
        let endDefaultProps = {};
        let roundQuotationStartDateText = roundQuotationStartDate
          ? dateTimeRender(roundQuotationStartDate)
          : roundQuotationStartDate;
        let roundQuotationEndDateText = roundQuotationEndDate
          ? dateTimeRender(roundQuotationEndDate)
          : roundQuotationEndDate;
        if (nowAdjustedFieldList.indexOf('roundQuotationStartDate') !== -1) {
          roundQuotationStartDateText = this.renderStartText(start);
        }

        if (nowAdjustedFieldList.indexOf('roundQuotationEndDate') !== -1) {
          roundQuotationEndDateText = this.renderStartText(end);
        }

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
          visible: 1,
          value: roundQuotationStartDateText,
          label: intl
            .get('ssrc.common.model.common.commonStartRound', { quotationRound, quotationName })
            .d('第{quotationRound}轮{quotationName}开始时间'),
          renderer: (
            <Output
              name={start}
              className={this.getRoundQuotationClassName(adjustFields, 'roundQuotationStartDate')}
            />
          ),
        };
        const endProps = {
          ...field,
          name: end,
          visible: 1,
          ...endDefaultProps,
          value: roundQuotationEndDateText,
          label: intl
            .get('ssrc.common.model.common.commonEndRound', { quotationRound, quotationName })
            .d('第{quotationRound}轮{quotationName}截止时间'),
          renderer: (
            <Output
              name={end}
              className={this.getRoundQuotationClassName(adjustFields, 'roundQuotationEndDate')}
            />
          ),
        };

        this.timeControlDS.addField(start, startProps);
        this.timeControlDS.addField(end, endProps);
        configData[start] = roundQuotationStartDateText;
        configData[end] = roundQuotationEndDateText;
        config.push(startProps);
        config.push(endProps);
      });
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

  // ----------------------------------------------------------------------------------------------------------------------------------------

  componentDidMount() {
    const { header = {} } = this.props;
    this.initDSFields(header.rfxRequireQuotationAdjustDTO);
  }

  @Bind()
  renderFields() {
    const { config = [] } = this.state;
    if (isEmpty(config)) {
      return null;
    }

    const fields = config.map((item = {}) => {
      const { visible = 0, renderer = null } = item;
      if (!visible) {
        return null;
      }

      return renderer;
    });

    return fields;
  }

  render() {
    const { customizeForm, custLoading, custKey, currentMode, judgeNewBiddingFlag } = this.props;
    // 竞价大厅-竞价单
    const newBiddingFlag = judgeNewBiddingFlag();
    return (
      <>
        <Row className="quotationFields">
          <Col span={16}>
            <Form
              dataSet={this.timeControlDS}
              labelLayout="vertical"
              columns={2}
              className="c7n-pro-vertical-form-display"
            >
              {this.renderFields()}
            </Form>
          </Col>
        </Row>
        {customizeForm(
          {
            code:
              currentMode === 'history'
                ? `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.TIMEADJUST_HIS`
                : `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.TIMEADJUST_READ`,
          },
          <Form
            className={classnames(style.quotationFormContainer, 'c7n-pro-vertical-form-display')}
            dataSet={this.timeControlDS}
            labelLayout="vertical"
            columns={3}
            custLoading={custLoading}
          >
            {!newBiddingFlag ? (
              <Output name="minQuotedSupplier" className={this.getClassName('minQuotedSupplier')} />
            ) : null}
            <Output name="clarifyEndDate" className={this.getClassName('clarifyEndDate')} />
          </Form>
        )}
      </>
    );
  }
}
