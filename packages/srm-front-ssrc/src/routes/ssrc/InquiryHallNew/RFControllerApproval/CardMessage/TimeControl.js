import React, { Component } from 'react';
import { Form, DateTimePicker, Output } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { observer } from 'mobx-react';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';

import { ComponentDiffRender } from '@/routes/ssrc/InquiryHallNew/RFController/CardMessage/utils.js';

@observer
export default class TimeControl extends Component {
  constructor(props) {
    super(props);
    if (props.onRef) {
      props.onRef(this);
    }
    this.state = {
      config: [], // 配置信息
    };
  }

  componentDidMount() {
    const data = this.props.timeControlDS?.current?.toData() || {};
    this.initDSFields(data);
  }

  _modal = {};

  // 字段字典
  @Bind()
  fieldsDictionary() {
    // const { quotationName } = this.props;
    const dictionary = {
      quotationStartDate: {
        label: intl
          .get('ssrc.rfController.model.consultation.quotationStartDate')
          .d('征询开始时间'),
        placeholder: intl
          .get('ssrc.rfController.model.consultation.quotationStartDate')
          .d('征询开始时间'),
        showType: 'dateTime',
        // min: new Date(),
        customOptions: {},
        renderer: <DateTimePicker name="quotationStartDate" defaultTime={undefined} />,
      },
      quotationEndDate: {
        label: intl.get('ssrc.rfController.model.consultation.quotationEndDate').d('征询结束时间'),
        // min: new Date(),
        placeholder: intl
          .get('ssrc.rfController.model.consultation.quotationEndDate')
          .d('征询结束时间'),
        showType: 'dateTime',
        customOptions: {},
        renderer: <DateTimePicker name="quotationEndDate" defaultTime={undefined} />,
      },
      // clarifyEndDate: {
      //   label: intl.get(`ssrc.rf.model.rf.clarifyEndDate`).d('澄清截止时间'),
      //   min: new Date(),
      //   placeholder: intl.get(`ssrc.rf.model.rf.clarifyEndDate`).d('澄清截止时间'),
      //   format: DEFAULT_DATETIME_FORMAT,
      //   customOptions: {},
      //   renderer: (
      //     <DateTimePicker
      //       name="clarifyEndDate"
      //       defaultTime={undefined}
      //     />
      //   ),
      // },
    };
    return dictionary;
  }

  clearTimerField = () => {
    this.setState({ config: [] });
  };

  // 初始化ds
  @Bind()
  initDSFields(fields = {}) {
    const { timeControlDS } = this.props;
    if (isEmpty(fields)) {
      return;
    }

    const config = [];
    const configData = {};

    const {
      fieldPropertyDTOList = [],
      // rfxRoundHeaderDateAdjustDTOList = [],
      // rfConfRuleOriginalDTO, // 历史数据
      nowAdjustedField: dateNowAdjustField = null,
    } = fields;

    // const { quotationName } = this.props;

    const fieldsDictionary = this.fieldsDictionary();
    fieldPropertyDTOList
      .filter((i) => ['quotationStartDate', 'quotationEndDate'].includes(i?.name))
      .forEach((field = {}) => {
        const { name = null, visible = 0, value: defaultValue = null } = field;
        if (!name || !visible) return;
        const constantProperty = fieldsDictionary[name] || {};
        const isCurrentDateAdjust = dateNowAdjustField && dateNowAdjustField.includes(name);
        const _defaultValue = !isCurrentDateAdjust ? defaultValue : null;
        const newField = { ...field, ...constantProperty, defaultValue: _defaultValue };

        const TimeWrapper = `${name}Wrapper`;
        timeControlDS.addField(name, {
          ...newField,
          required: false,
          disabled: true,
        });
        timeControlDS.addField(TimeWrapper, { ...newField, required: false, disabled: true });
        configData[name] = _defaultValue;
        configData[TimeWrapper] = !isCurrentDateAdjust ? 'custom' : 'start';
        if (['quotationStartDate', 'quotationEndDate'].includes(name)) {
          config.push(newField);
        }
      });
    timeControlDS.loadData([{ ...fields, ...configData }]);
    this.setState({ config }, () => {
      this.forceUpdate();
    });
  }

  @Bind()
  renderFields() {
    const { config = [] } = this.state;
    if (isEmpty(config)) {
      return null;
    }

    const record = this.props.timeControlDS.current || {};
    const fields = config.map((item = {}) => {
      const { visible = 0, name } = item;
      if (!visible) {
        return null;
      }

      return (
        <ComponentDiffRender
          record={record}
          historyDTO="rfConfRuleOriginalDTO"
          name={name}
          key={name}
        >
          <Output name={name} />
        </ComponentDiffRender>
      );
    });

    return fields;
  }

  render() {
    const { customizeForm, getCustomizeUnitCode, viewType, timeControlDS } = this.props;
    const { config = [] } = this.state;

    return (
      <React.Fragment>
        {!!config.length && (
          <Form
            className="quotationFields"
            dataSet={timeControlDS}
            labelLayout="float"
            columns={3}
            // custLoading={custLoading}
            useWidthPercent
          >
            {this.renderFields()}
          </Form>
        )}

        <div style={{ marginBottom: '16px' }} />

        {customizeForm(
          {
            code: getCustomizeUnitCode('stage', viewType),
            dataSet: timeControlDS,
          },
          <Form dataSet={timeControlDS} labelLayout="float" columns={3} useWidthPercent>
            <ComponentDiffRender
              name="minQuotedSupplier"
              special
              record={timeControlDS.current}
              historyDTO="rfConfRuleOriginalDTO"
            >
              <Output name="minQuotedSupplier" />
            </ComponentDiffRender>
            <ComponentDiffRender
              name="clarifyEndDate"
              special
              record={timeControlDS.current}
              historyDTO="rfConfRuleOriginalDTO"
            >
              <Output name="clarifyEndDate" />
            </ComponentDiffRender>
          </Form>
        )}
      </React.Fragment>
    );
  }
}
