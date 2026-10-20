import React, { Component } from 'react';
import { Form, DateTimePicker, NumberField } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { observer } from 'mobx-react';
import { isEmpty } from 'lodash';

// import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';

// import { TimeControlDS } from './TimeControlDS';
// import { BiddingPriceRunningFields } from '@/routes/ssrc/InquiryHallNew/Update/Components';
import { ComponentDiffRender, TimeSelectionWrapper } from './utils';
// const promptCode = 'ssrc.quoController';

// @formatterCollections({ code: ['ssrc.quoController', 'ssrc.inquiryHall', 'ssrc.common'] })
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

  // getSnapshotBeforeUpdate(prevProps = {}) {
  //   const { header: prevheader = null } = prevProps;
  //   const { header = null } = this.props;
  //   const { adjustRecordId: preAdjustRecordId = null } =
  //     prevheader?.rfConfRuleAdjustDTO || {};
  //   const { adjustRecordId } = header?.rfConfRuleAdjustDTO || {};
  //   return adjustRecordId && adjustRecordId !== preAdjustRecordId;
  // }

  // componentDidUpdate(...params) {
  //   if (params[2]) {
  //     console.log('componentDidUpdate');
  //     const { header } = this.props;
  //     this.initDSFields(header.rfConfRuleAdjustDTO);
  //   }
  // }

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
        format: DEFAULT_DATETIME_FORMAT,
        min: new Date(),
        customOptions: {},
        renderer: <DateTimePicker name="quotationStartDate" defaultTime={undefined} />,
      },
      quotationEndDate: {
        label: intl.get('ssrc.rfController.model.consultation.quotationEndDate').d('征询结束时间'),
        min: new Date(),
        placeholder: intl
          .get('ssrc.rfController.model.consultation.quotationEndDate')
          .d('征询结束时间'),
        format: DEFAULT_DATETIME_FORMAT,
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
        const { name = null, visible = 0, required = 0, value: defaultValue = null } = field;
        // if (!name || !visible || name === 'clarifyEndDate') return;
        if (!name || !visible) return;
        const constantProperty = fieldsDictionary[name] || {};
        const isCurrentDateAdjust = dateNowAdjustField && dateNowAdjustField.includes(name);
        const _defaultValue = !isCurrentDateAdjust ? defaultValue : null;
        const newField = { ...field, ...constantProperty, defaultValue: _defaultValue };

        const TimeWrapper = `${name}Wrapper`;
        this.props.timeControlDS.addField(name, {
          ...newField,
          dynamicProps: {
            required: ({ record }) => {
              // const flag = record?.get(TimeWrapper) === 'custom' && !!required;
              const flag = record?.get(TimeWrapper) === 'custom' && !!required;
              return flag;
            },
          },
        });
        this.props.timeControlDS.addField(TimeWrapper, { ...newField, required: false });
        configData[name] = _defaultValue;
        configData[TimeWrapper] = !isCurrentDateAdjust ? 'custom' : 'start';
        if (['quotationStartDate', 'quotationEndDate'].includes(name)) {
          config.push(newField);
        }
      });
    this.props.timeControlDS.loadData([{ ...fields, ...configData }]);
    this.setState({ config }, () => {
      this.forceUpdate();
      // console.log('forceUpdate', 'current', this.props.timeControlDS.current);
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

      // if (name === 'quotationEndDate' && this.props.timeControlDS?.current) {
      //   const quotationEndDate = this.props.timeControlDS.getField('quotationEndDate');
      //   quotationEndDate.set('dynamicProps', {
      //     min({ dataSet }) {
      //       const quotationStartDate = dataSet.current.get('quotationStartDate');
      //       return new Date(quotationStartDate) > new Date() ? quotationStartDate : new Date();
      //     },
      //   });
      // }
      return (
        <ComponentDiffRender
          record={record}
          historyDTO="rfConfRuleOriginalDTO"
          name={name}
          key={name}
        >
          <TimeSelectionWrapper data={item} name={name} dataSet={this.props.timeControlDS} />
        </ComponentDiffRender>
      );
    });

    return fields;
  }

  render() {
    const { customizeForm } = this.props;
    const { config = [] } = this.state;
    return (
      <React.Fragment>
        {!!config.length && (
          <Form
            className="quotationFields"
            dataSet={this.props.timeControlDS}
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
            code: `SSRC.INQUIRY_HALL.RF_CONTROL.QUOTATION_STAGE`,
            dataSet: this.props.timeControlDS,
          },
          <Form
            dataSet={this.props.timeControlDS}
            labelLayout="float"
            columns={3}
            // custLoading={custLoading}
            useWidthPercent
          >
            <ComponentDiffRender
              name="minQuotedSupplier"
              special
              record={this.props.timeControlDS.current}
              historyDTO="rfConfRuleOriginalDTO"
            >
              <NumberField name="minQuotedSupplier" />
            </ComponentDiffRender>
            <ComponentDiffRender
              name="clarifyEndDate"
              special
              record={this.props.timeControlDS.current}
              historyDTO="rfConfRuleOriginalDTO"
            >
              <DateTimePicker name="clarifyEndDate" />
            </ComponentDiffRender>
          </Form>
        )}
      </React.Fragment>
    );
  }
}
