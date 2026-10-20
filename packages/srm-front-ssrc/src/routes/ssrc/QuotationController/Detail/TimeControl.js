import React, { Component } from 'react';
import {
  Modal,
  Form,
  DateTimePicker,
  NumberField,
  TextArea,
  DataSet,
  Switch,
  Table,
  CheckBox as C7NCheckbox,
} from 'choerodon-ui/pro';
import { Checkbox, Row } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';
import intl from 'utils/intl';
import { observer } from 'mobx-react';
import moment from 'moment';

import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { Button as PermissionButton } from 'components/Permission';

import { BiddingPriceRunningFields } from '@/routes/ssrc/InquiryHallNew/Update/Components';

import { handleAdjustTime } from '@/services/inquiryHallService';
import { fetchTimeControl } from '@/services/inquiryHallNewService';
import { TimeControlDS, promptInfoDS } from './TimeControlDS';

import style from './index.less';

const promptCode = 'ssrc.quoController';
const CheckboxGroup = Checkbox.Group;
const { Column } = Table;

@formatterCollections({ code: ['ssrc.quoController', 'ssrc.inquiryHall', 'ssrc.common'] })
@observer
export default class TimeControl extends Component {
  // timeControlDS = new DataSet(TimeControlDS());
  promptInfoDs = new DataSet(promptInfoDS());

  constructor(props) {
    super(props);
    this.state = {
      config: [], // 配置信息
      configSource: {}, // 多轮报价数据源
      fieldCurrent: null, // 勾选此刻的字段
      switchValue: false,
      indeterminate: true,
      checkAll: false,
      checkedList: [],
    };
  }

  _modal = {};

  // 字段字典
  fieldsDictionary = {
    estimatedStartTime: {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.estimatedStartTime`).d('预计开始时间'),
      type: 'dateTime',
      placeholder: intl
        .get(`ssrc.inquiryHall.model.inquiryHall.estimatedStartTime`)
        .d('预计开始时间'),
      format: DEFAULT_DATETIME_FORMAT,
      customOptions: {},
      renderer: [
        <DateTimePicker name="estimatedStartTime" />,
        <C7NCheckbox
          name="estimatedStartTime_currentDateTime"
          onChange={(value) => this.handleCurrent(value, 'estimatedStartTime')}
        >
          {intl.get(`${promptCode}.model.quoController.currentTimeDate`).d('此刻')}
        </C7NCheckbox>,
      ],
    },
    quotationStartDate: {
      label: intl.get(`${promptCode}.model.quoController.quotationStartTime`).d('报价开始时间'),
      type: 'dateTime',
      placeholder: intl
        .get(`${promptCode}.model.quoController.quotationStartTime`)
        .d('报价开始时间'),
      format: DEFAULT_DATETIME_FORMAT,
      customOptions: {},
      renderer: [
        <DateTimePicker name="quotationStartDate" />,
        <C7NCheckbox
          name="quotationStartDate_currentDateTime"
          onChange={(value) => this.handleCurrent(value, 'quotationStartDate')}
        >
          {intl.get(`${promptCode}.model.quoController.currentTimeDate`).d('此刻')}
        </C7NCheckbox>,
      ],
    },
    quotationRunningDuration: {
      label: intl.get(`${promptCode}.model.quoController.quotRunningDuration`).d('报价运行时间'),
      type: 'number',
      placeholder: intl
        .get(`${promptCode}.model.quoController.quotRunningDuration`)
        .d('报价运行时间'),
      customOptions: {
        min: 0,
        max: 1000,
      },
      renderer: (
        <BiddingPriceRunningFields
          label={intl
            .get(`ssrc.inquiryHall.model.inquiryHall.quotRunningDuration`)
            .d('报价运行时间')}
          newLine
          colSpan={2}
          changeBiddingRunningTime={this.changeBiddingRunningTime}
          name="biddingRunnintDay"
        />
      ),
    },
    quotationInterval: {
      label: intl.get(`${promptCode}.model.quoController.quotationInterval`).d('报价间隔时间'),
      type: 'number',
      placeholder: intl
        .get(`${promptCode}.model.quoController.quotationInterval`)
        .d('报价间隔时间'),
      format: DEFAULT_DATETIME_FORMAT,
      customOptions: {},
      renderer: <NumberField name="quotationInterval" min={0} max={99999999} newLine />,
    },
    quotationEndDate: {
      label: intl.get(`${promptCode}.model.quoController.quotationDeadline`).d('报价截止时间'),
      type: 'dateTime',
      placeholder: intl
        .get(`${promptCode}.model.quoController.quotationDeadline`)
        .d('报价截止时间'),
      format: DEFAULT_DATETIME_FORMAT,
      customOptions: {},
      renderer: [
        <DateTimePicker name="quotationEndDate" />,
        <C7NCheckbox
          name="quotationEndDate_currentDateTime"
          onChange={(value) => this.handleCurrent(value, 'quotationEndDate')}
        >
          {intl.get(`${promptCode}.model.quoController.currentTimeDate`).d('此刻')}
        </C7NCheckbox>,
      ],
    },
    bargainEndDate: {
      label: intl.get(`${promptCode}.model.quoController.bargainEndDate`).d('议价截止时间'),
      type: 'dateTime',
      placeholder: intl.get(`${promptCode}.model.quoController.bargainEndDate`).d('议价截止时间'),
      format: DEFAULT_DATETIME_FORMAT,
      customOptions: {},
      renderer: [
        <DateTimePicker name="bargainEndDate" />,
        <C7NCheckbox
          name="bargainEndDate_currentDateTime"
          onChange={(value) => this.handleCurrent(value, 'bargainEndDate')}
        >
          {intl.get(`${promptCode}.model.quoController.currentTimeDate`).d('此刻')}
        </C7NCheckbox>,
      ],
    },
    roundQuotationEndDate: {
      label: intl
        .get(`${promptCode}.model.quoController.roundQuotationEndDate`)
        .d('当前轮次截止时间'),
      type: 'dateTime',
      placeholder: intl
        .get(`${promptCode}.model.quoController.roundQuotationEndDate`)
        .d('当前轮次截止时间'),
      format: DEFAULT_DATETIME_FORMAT,
      customOptions: {},
      renderer: [
        <DateTimePicker name="roundQuotationEndDate" />,
        <C7NCheckbox
          name="roundQuotationEndDate_currentDateTime"
          onChange={(value) => this.handleCurrent(value, 'roundQuotationEndDate')}
        >
          {intl.get(`${promptCode}.model.quoController.currentTimeDate`).d('此刻')}
        </C7NCheckbox>,
      ],
    },
    prequalEndDate: {
      label: intl.get(`${promptCode}.model.quoController.pretrialDeadline`).d('预审截止时间'),
      type: 'dateTime',
      placeholder: intl.get(`${promptCode}.model.quoController.pretrialDeadline`).d('预审截止时间'),
      format: DEFAULT_DATETIME_FORMAT,
      customOptions: {},
      renderer: [
        <DateTimePicker name="prequalEndDate" />,
        <C7NCheckbox
          name="prequalEndDate_currentDateTime"
          onChange={(value) => this.handleCurrent(value, 'prequalEndDate')}
        >
          {intl.get(`${promptCode}.model.quoController.currentTimeDate`).d('此刻')}
        </C7NCheckbox>,
      ],
    },
    timeAdjustedRemark: {
      label: intl.get(`${promptCode}.model.quoController.remarks`).d('备注'),
      type: 'textArea',
      required: 1,
      visible: 1,
      disabled: 0,
      placeholder: intl.get(`${promptCode}.model.quoController.remarks`).d('备注'),
      customOptions: {},
      renderer: (
        <TextArea
          name="timeAdjustedRemark"
          newLine
          colSpan={2}
          autosize={{ minRows: 3, maxRows: 6 }}
          resize
        />
      ),
    },
  };

  // 勾选此刻的字段
  setFieldCurrent = (field = null) => {
    this.setState({ fieldCurrent: field });
  };

  // 所有字段的此刻都恢复一致
  handleSetCurrent = (checked = false) => {
    const { fields } = this.timeControlDS;
    if (isEmpty(fields) || isEmpty(this.timeControlDS)) {
      return;
    }
    let currentFields = fields.toJSON();
    currentFields = Object.keys(currentFields);

    currentFields.forEach((item) => {
      const isCurrentField = /_currentDateTime$/.test(item);
      if (!isCurrentField) {
        return;
      }

      this.timeControlDS.getField(item).set('disabled', checked);
      this.timeControlDS.getField(item).set(item, 0);
    });
  };

  // 点击此刻勾选
  handleCurrent = (value = {}, name = null) => {
    const { config = [] } = this.state;
    if (!name || isEmpty(config)) {
      return;
    }

    let currentData = {};
    currentData = config.filter((item) => item.name === name)[0] || {};
    const { required = null, disabled = false } = currentData;

    const ds = this.timeControlDS;
    const currentRelativeField = ds.getField(name);

    if (isEmpty(currentRelativeField)) {
      return;
    }

    let checkedNow = () => {
      currentRelativeField.set('disabled', true);
      currentRelativeField.set('required', false);
      ds.current.set(name, null);

      this.handleSetCurrent(true);
      ds.getField(`${name}_currentDateTime`).set('disabled', false);
      this.setFieldCurrent(name);
    };

    let unCheckedNow = () => {
      this.handleSetCurrent();
      currentRelativeField.set('disabled', !!disabled);
      currentRelativeField.set('required', !!required);
      const currentFieldPrinstineValue = ds.current.getPristineValue(name);
      ds.current.set(name, currentFieldPrinstineValue);
      this.setFieldCurrent();
    };

    if (value) {
      checkedNow();
    } else {
      unCheckedNow();
    }

    this.forceUpdate();
    checkedNow = null;
    unCheckedNow = null;
  };

  @Bind()
  changeSectionSelect(value) {
    const {
      configSource: { rfxHeaders = [] },
    } = this.state;
    this.setState(
      {
        switchValue: value,
        indeterminate: false,
        checkedList: value ? rfxHeaders : [],
        checkAll: !!value,
      },
      () => this._modal.update({ children: this.formFields() })
    );
  }

  @Bind()
  checkboxChange(checkedList) {
    const {
      configSource: { rfxHeaders = [] },
    } = this.state;
    this.setState(
      {
        checkedList,
        indeterminate: !!checkedList.length && checkedList.length < rfxHeaders.length,
        checkAll: checkedList.length === rfxHeaders.length,
      },
      () => this._modal.update({ children: this.formFields() })
    );
  }

  @Bind()
  onCheckAllChange(e) {
    const {
      configSource: { rfxHeaders = [] },
    } = this.state;
    this.setState(
      {
        checkedList: e.target.checked ? rfxHeaders : [],
        indeterminate: false,
        checkAll: e.target.checked,
      },
      () => this._modal.update({ children: this.formFields() })
    );
  }

  formFields() {
    const {
      config = [],
      configSource = {},
      switchValue = false,
      checkAll = false,
      indeterminate = false,
      checkedList = [],
    } = this.state;
    return (
      <React.Fragment>
        <Form labelLayout="float" columns={2} dataSet={this.timeControlDS} labelWidth={[130, 100]}>
          {this.renderFormField(config)}
        </Form>
        {configSource?.chooseOtherFlag ? (
          <div className={style['other-sections']}>
            <div className="select-section-switch">
              <div>
                <Switch onChange={this.changeSectionSelect} checked={switchValue} />
              </div>
              <div className="select-section-header">
                <div>
                  {intl
                    .get('ssrc.inquiryHall.model.inquiryHall.selectOthersSection')
                    .d('选择其他标段')}{' '}
                </div>
                <div className="select-section-explain">
                  {intl
                    .get('ssrc.inquiryHall.model.inquiryHall.canSelectOthersSection')
                    .d('可以选择同一项目下的其他标段一起开标')}
                </div>
              </div>
            </div>
            {switchValue && (
              <div className="select-section-lists">
                <Row className="checkbox-line">
                  <Checkbox
                    checked={checkAll}
                    indeterminate={indeterminate}
                    onChange={this.onCheckAllChange}
                  >
                    {intl.get('ssrc.common.view.message.chooseAll').d('全选')}
                  </Checkbox>
                </Row>
                <CheckboxGroup
                  onChange={this.checkboxChange}
                  className="checkbox-grops"
                  value={checkedList}
                >
                  {configSource?.rfxHeaders?.map((item = {}) => (
                    <Row className="checkbox-line">
                      <Checkbox value={item}>{item?.sectionName}</Checkbox>
                    </Row>
                  ))}
                </CheckboxGroup>
              </div>
            )}
          </div>
        ) : null}
      </React.Fragment>
    );
  }

  renderFormField(config = []) {
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

  getSnapshotBeforeUpdate(prevProps = {}) {
    return this.props.openTimeControlFlag !== prevProps.openTimeControlFlag;
  }

  componentDidUpdate(preProps, preState, snap) {
    if (snap) {
      this.showAdjustTimeModal();
    }
  }

  @Bind()
  async fetchTimeControlConfig() {
    const {
      organizationId,
      header: { rfxHeaderId },
    } = this.props;
    let data = null;

    try {
      data = await fetchTimeControl({
        organizationId,
        rfxHeaderId,
      });
      data = getResponse(data);
      this.initDSFields(data);
      this._modal.update({ children: this.formFields() });
    } catch (e) {
      throw e;
    }
  }

  // 初始化ds
  initDSFields(fields = {}) {
    // if (isEmpty(fields)) {
    //   return;
    // }

    const config = [];
    let configData = {};

    const {
      // timeAdjustedRemark = null,
      fieldPropertyDTOList = [],
      roundHeaderDateAdjustDateDTOList = [],
    } = fields || {};
    const { fieldsDictionary = {} } = this;
    const currentDateTimeProps = {
      type: 'boolean',
      defaultValue: 0,
      trueValue: 1,
      falseValue: 0,
    };

    fieldPropertyDTOList.forEach((field = {}) => {
      const { name = null, visible = 0, value: defaultValue = null, disabled = 0 } = field || {};
      if (!name || !visible) {
        return;
      }

      const constantProperty = fieldsDictionary[name] || {};
      const newField = { ...field, ...constantProperty, defaultValue };

      // 报价运行时间 (需要处理字段)
      if (name === 'quotationRunningDuration') {
        const transTime = this.transTime(defaultValue);
        this.initRunningDuration({ ...newField, ...transTime });
        configData = { ...configData, ...transTime };
      }

      if (name !== 'quotationRunningDuration' || name !== 'quotationInterval') {
        this.timeControlDS.addField(`${name}_currentDateTime`, {
          ...currentDateTimeProps,
          disabled,
        });
      }

      this.timeControlDS.addField(name, newField);
      configData[name] = defaultValue;
      config.push(newField);
    });

    if (!isEmpty(roundHeaderDateAdjustDateDTOList)) {
      roundHeaderDateAdjustDateDTOList.forEach((field = {}) => {
        const {
          quotationRound = null,
          roundQuotationStartDate = null,
          roundQuotationEndDate = null,
          fieldPropertyDTOList: roundFieldPropertyDTOList = [],
        } = field;
        if (!quotationRound) {
          return;
        }

        const start = `roundQuotationStart${quotationRound}`;
        const end = `roundQuotationEnd${quotationRound}`;
        const startCurrentDateTime = `${start}_currentDateTime`;
        const endCurrentDateTime = `${end}_currentDateTime`;
        let startDefaultProps = {};
        let endDefaultProps = {};
        if (!isEmpty(roundFieldPropertyDTOList)) {
          roundFieldPropertyDTOList.forEach((item = {}) => {
            const { name = null, ...others } = item || {};
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
          label:
            intl.get('ssrc.common.the').d('第') +
            quotationRound +
            intl.get('ssrc.common.roundStartTime').d('轮报价开始时间'),
          renderer: [
            <DateTimePicker name={start} max={end} newLine />,
            <C7NCheckbox
              name={startCurrentDateTime}
              onChange={(value) => this.handleCurrent(value, start)}
              disabled={startDefaultProps?.disabled}
            >
              {intl.get(`${promptCode}.model.quoController.currentTimeDate`).d('此刻')}
            </C7NCheckbox>,
          ],
        };
        const endProps = {
          ...field,
          name: end,
          ...endDefaultProps,
          value: roundQuotationEndDate,
          label:
            intl.get('ssrc.common.the').d('第') +
            quotationRound +
            intl.get('ssrc.common.roundEndTime').d('轮报价截止时间'),
          renderer: [
            <DateTimePicker name={end} min={start} />,
            <C7NCheckbox
              name={endCurrentDateTime}
              onChange={(value) => this.handleCurrent(value, end)}
              disabled={endDefaultProps?.disabled}
            >
              {intl.get(`${promptCode}.model.quoController.currentTimeDate`).d('此刻')}
            </C7NCheckbox>,
          ],
        };

        this.timeControlDS.addField(start, startProps);
        this.timeControlDS.addField(end, endProps);
        this.timeControlDS.addField(`${startCurrentDateTime}`, currentDateTimeProps);
        this.timeControlDS.addField(`${endCurrentDateTime}`, currentDateTimeProps);

        configData[start] = roundQuotationStartDate;
        configData[end] = roundQuotationEndDate;
        config.push(startProps);
        config.push(endProps);
      });
    }
    // 备注
    this.timeControlDS.addField('timeAdjustedRemark', {
      ...fieldsDictionary.timeAdjustedRemark,
      label: intl.get(`${promptCode}.model.quoController.remarks`).d('备注'),
    });
    config.push({
      ...fieldsDictionary.timeAdjustedRemark,
      name: 'timeAdjustedRemark',
    });
    configData.timeAdjustedRemark = null;

    this.setState({
      config,
      configSource: fields,
    });
    this.timeControlDS.loadData([configData]);
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

  timeControlDSEditSet = new Set();

  // 监听ds数据变更 - status
  watchDSDynamicEvent = (data = {}) => {
    const { name = '' } = data;
    if (name === 'status') {
      return;
    }
    this.timeControlDSEditSet.add(name);
  };

  @Bind()
  showAdjustTimeModal() {
    this.timeControlDSEditSet.clear();
    this.timeControlDS = new DataSet(
      TimeControlDS({
        watchDSDynamicEvent: (data) => this.watchDSDynamicEvent(data),
      })
    );

    this._modal = Modal.open({
      destroyOnClose: true,
      closable: true,
      drawer: true,
      key: Modal.key(),
      title: intl.get(`${promptCode}.view.message.button.timeAdjustment`).d('时间调整'),
      children: this.formFields(),
      style: { width: '380px' },
      onOk: this.handleOk,
      onCancel: this.handleCancel,
      afterClose: () => {
        this.setState({
          checkedList: [],
          checkAll: false,
          switchValue: false,
          indeterminate: true,
        });
      },
    });

    if (this._modal) {
      this.fetchTimeControlConfig();
    }
  }

  // 判定是否变更了除备注外的重要数据
  judgeChange = () => {
    let result = false;
    result =
      this.timeControlDSEditSet.size === 1 && this.timeControlDSEditSet.has('timeAdjustedRemark');
    return !result;
  };

  handleOk = async () => {
    const { header = {}, organizationId, handleSearch = () => {} } = this.props;
    const { roundHeaderDates: headerRoundHeaderDates = null } = header || {};
    const { configSource = {}, checkedList = [], fieldCurrent = null } = this.state;
    const currentRecord = this.timeControlDS?.current;
    if (!currentRecord || isEmpty(currentRecord)) {
      return;
    }

    let nowAdjustFiled = fieldCurrent;

    const judgeResult = await this.judgeChange();

    const formStatus = currentRecord.status;
    if (formStatus === 'sync' || !judgeResult) {
      notification.warning({
        message: intl
          .get(`${promptCode}.view.warning.pleaseAdjustNeedTimer`)
          .d('请变更需要调整的时间'),
      });
      return false;
    }

    await currentRecord.set('status', 'update');

    const validateFlag = await currentRecord.validate(true);
    if (validateFlag === false) {
      return false;
    }

    const data = currentRecord.toData() || {};
    const {
      biddingRunnintDay = null,
      biddingRunnintHour = null,
      biddingRunnintMinute = null,
    } = data;

    const { roundHeaderDateAdjustDateDTOList = [] } = configSource || {};

    // 多轮报价
    const roundHeaderDates = !isEmpty(roundHeaderDateAdjustDateDTOList)
      ? roundHeaderDateAdjustDateDTOList.map((item = {}) => {
          const { quotationRound = null } = item;
          if (!quotationRound) {
            return;
          }

          let roundHeaderDataOfHeader = [];
          if (!isEmpty(headerRoundHeaderDates)) {
            roundHeaderDataOfHeader = headerRoundHeaderDates.filter(
              (headerRoundItem = {}) => headerRoundItem.quotationRound === quotationRound
            );
          }
          roundHeaderDataOfHeader = roundHeaderDataOfHeader[0] || {};
          const start = `roundQuotationStart${quotationRound}`;
          const end = `roundQuotationEnd${quotationRound}`;

          let nowRoundQuotationCurrent = null;
          if (nowAdjustFiled && (start === nowAdjustFiled || end === nowAdjustFiled)) {
            nowRoundQuotationCurrent =
              start === nowAdjustFiled ? 'roundQuotationStartDate' : 'roundQuotationEndDate';
            nowAdjustFiled = null;
          }

          return {
            ...item,
            ...roundHeaderDataOfHeader,
            roundQuotationStartDate: data[start],
            roundQuotationEndDate: data[end],
            nowAdjustFiled: nowRoundQuotationCurrent,
          };
        })
      : null;

    // 多轮报价,引用其他标段
    const rfxHeaders =
      !isEmpty(roundHeaderDateAdjustDateDTOList) && !isEmpty(checkedList)
        ? checkedList.map((item = {}) => {
            const { roundHeaderDates: rfxRoundHeaderDates } = item;

            const roundQuotationEndDate = rfxRoundHeaderDates?.map((n) => {
              const start = `roundQuotationStart${n.quotationRound}`;
              const end = `roundQuotationEnd${n.quotationRound}`;

              let nowRoundQuotationCurrent = null;
              if (nowAdjustFiled && (start === nowAdjustFiled || end === nowAdjustFiled)) {
                nowRoundQuotationCurrent =
                  start === nowAdjustFiled ? 'roundQuotationStartDate' : 'roundQuotationEndDate';
                nowAdjustFiled = null;
              }

              return {
                ...n,
                roundQuotationStartDate: data[start],
                roundQuotationEndDate: data[end],
                nowAdjustFiled: nowRoundQuotationCurrent,
              };
            });

            return {
              ...item,
              ...data,
              roundHeaderDates: roundQuotationEndDate,
            };
          })
        : checkedList?.map((i) => {
            return { ...i, ...data };
          });

    const quotationRunningDuration =
      biddingRunnintDay * 1440 + biddingRunnintHour * 60 + biddingRunnintMinute;
    // data = filterNullValueObject(data);

    try {
      let result = await handleAdjustTime({
        organizationId,
        ...header,
        ...configSource,
        ...data,
        quotationRunningDuration,
        roundHeaderDates,
        rfxHeaders,
        nowAdjustFiled,
      });
      result = getResponse(result);
      if (Array.isArray(result) && result.length > 0) {
        this.promptInfoDs.loadData(result);
        Modal.open({
          key: Modal.key(),
          title: intl.get(`${promptCode}.view.title.promptInfo`).d('提示信息'),
          children: (
            <Table dataSet={this.promptInfoDs}>
              <Column name="messageDesc" />
              <Column name="validateValue" width={120} />
            </Table>
          ),
          okText: intl.get(`${promptCode}.view.message.iKnow`).d('我知道了'),
          okCancel: false,
          afterClose: () => this.promptInfoDs.loadData([]),
        });
        return false;
      }

      if (result) {
        this.timeControlDSEditSet.clear();
        notification.success();
        this.handleCancel();
        handleSearch();
        return true;
      }
      return false;
    } catch (e) {
      throw e;
    }
  };

  @Bind()
  handleCancel() {
    Modal.destroyAll();
    this.timeControlDS.loadData();
    this.timeControlDS.reset();
  }

  // 判断按钮显示隐藏
  // 改造前端先放一部分控制逻辑
  judgeButtonVisible(header = {}) {
    const {
      sourceCategory = null,
      rfxStatus = null,
      quotationStartDate = null,
      roundQuotationRule = null,
      quotationEndDate = null,
      quotationEndDateChangeFlag = 0,
    } = header || {};
    let result = true;
    if (!rfxStatus || isEmpty(header)) {
      return result;
    }

    if (rfxStatus === 'OPEN_BID_PENDING' && quotationEndDateChangeFlag === 1) {
      return true;
    }

    // 不允许修改时间状态
    const NotTimeChangeStatus = [
      'NEW', // 新建
      'RELEASE_APPROVING', // 发布审批中
      'RELEASE_REJECTED', // 发布审批拒绝
      'CANCELED', // 已取消
      'ROUNDED', // 再次询价
      'CLOSED', // 关闭
      'PAUSED', // 暂停
      'CHECK_APPROVING', // 核价审批中
      'FINISHED', // 完成
      'OPEN_BID_PENDING', // 待开标
      'PRE_EVALUATION_PENDING', // 待定候选人
      'OPENED', // 已开标
      'PREQUAL_CUTOFF	', // 资格预审截止
      'PRETRIAL_PENDING', // 待初审
      'CHECK_PENDING', // 带核价
      'SCORING', // 评分中
    ];
    // 状态判定
    if (
      NotTimeChangeStatus.includes(rfxStatus) ||
      rfxStatus === 'CHECK_PENDING' ||
      rfxStatus === 'SCORING'
    ) {
      return false;
    }

    // 评审发起的多轮报价
    const scoreRoundVisible =
      rfxStatus === 'ROUND_QUOTATION' &&
      (roundQuotationRule === 'SCORE' || roundQuotationRule === 'AUTO_SCORE') &&
      quotationEndDate &&
      moment().isAfter(quotationEndDate);
    if (scoreRoundVisible) {
      return !scoreRoundVisible;
    }

    // 集中快速竞价
    if (sourceCategory === 'RFA') {
      result = !quotationStartDate || moment().isBefore(quotationStartDate);
      return result;
    }

    return result;
  }

  render() {
    const {
      header = {},
      match: { path = null },
    } = this.props;
    const { rfxStatus = null } = header || {};
    const ButtionVisible = this.judgeButtonVisible(header);
    if (!ButtionVisible) {
      return null;
    }

    return (
      <PermissionButton
        icon="timer"
        // waitType="debounce"
        // wait={200}
        onClick={this.showAdjustTimeModal}
        type="c7n-pro"
        disabled={
          rfxStatus === 'PAUSED' || rfxStatus === 'CHECK_PENDING' || rfxStatus === 'SCORING'
        }
        permissionList={[
          {
            code: `${path}.button.timeadjustment`.toLowerCase(),
            type: 'button',
            meaning:
              intl.get(`${promptCode}.view.message.panel.RFxControl`).d('询报价控制') -
              intl.get(`${promptCode}.view.message.button.timeAdjustment`).d('时间调整'),
          },
        ]}
      >
        {intl.get(`${promptCode}.view.message.button.timeAdjustment`).d('时间调整')}
      </PermissionButton>
    );
  }
}
