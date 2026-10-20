import React, { Component } from 'react';
import { Form, Row, Col, Collapse, Icon } from 'hzero-ui';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import querystring from 'querystring';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse } from 'utils/utils';
import { DEFAULT_DATETIME_FORMAT, FORM_COL_3_LAYOUT } from 'utils/constants';

import { fetchPublicTimeAdjust } from '@/services/inquiryHallNewService';
import styles from './index.less';

const promptCode = 'ssrc.quoController';

const { Panel } = Collapse;
const formLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

@formatterCollections({ code: ['ssrc.quoController', 'ssrc.inquiryHall', 'ssrc.common'] })
@Form.create({ fieldNameProp: null })
export default class TimeControlView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      timer: {},
      collapseKeys: ['timeAdjustment', 'baseInfos'], // 打开的折叠面板key
    };
  }

  componentDidMount() {
    this.fetchPublicTimeAdjust();
  }

  // 工作流审批-时间查询
  async fetchPublicTimeAdjust() {
    const {
      organizationId,
      match: {
        params: { rfxId: rfxHeaderId = null },
        path,
      },
    } = this.props;

    const IsPublicUrl = path && path.includes('/pub'); // 工作流审批表示
    if (!IsPublicUrl) {
      return;
    }

    try {
      let data = await fetchPublicTimeAdjust({
        organizationId,
        rfxHeaderId,
      });
      data = getResponse(data);
      if (!data || isEmpty(data)) {
        return;
      }

      this.integrationTimeAdjustmentHeaderOfWorkFlow(data);
    } catch (e) {
      throw e;
    }
  }

  // 工作流时间调整查看页面数据整合
  integrationTimeAdjustmentHeaderOfWorkFlow(data = {}) {
    const {
      currentHeaderAdjustDateDTO = {},
      adjustHeaderAdjustDateDTO = {},
      sourceHeaderDTO = {},
    } = data;
    const { timeAdjustedRemark = null } = adjustHeaderAdjustDateDTO || {};

    const newTime = this.integrationTimerControl(adjustHeaderAdjustDateDTO, true);
    const oldTime = this.integrationTimerControl(currentHeaderAdjustDateDTO);
    const remark = {
      label: intl.get(`${promptCode}.model.quoController.remarks`).d('备注'),
      name: 'timeAdjustedRemark',
      value: timeAdjustedRemark,
    };

    this.setState({
      timer: {
        sourceHeaderDTO,
        newTime,
        oldTime,
        remark,
      },
    });
  }

  integrationTimerControl(data = {}, newFlag = false) {
    const newData = [];
    const { fieldsDictionary = {} } = this;
    if (isEmpty(data)) {
      return newData;
    }

    const {
      fieldPropertyDTOList = [],
      roundHeaderDateAdjustDateDTOList = [],
      nowAdjustedField: nowAdjustFiledForm = null,
    } = data;
    if (!isEmpty(fieldPropertyDTOList)) {
      fieldPropertyDTOList.forEach((item = {}) => {
        const { name = null, visible = 0 } = item;
        if (!name || !visible) {
          return;
        }

        let currentValue = data[name];
        const currentObj = fieldsDictionary[name] || {};

        if (newFlag && nowAdjustFiledForm === name) {
          // 此刻
          currentValue = intl.get(`${promptCode}.model.quoController.currentTimeDate`).d('此刻');
        }

        if (isEmpty(currentObj)) {
          return;
        }

        if (name === 'quotationRunningDuration') {
          currentValue = this.transTime(currentValue);
        }

        newData.push({
          ...currentObj,
          name,
          value: currentValue,
        });
      });
    }

    if (!isEmpty(roundHeaderDateAdjustDateDTOList)) {
      roundHeaderDateAdjustDateDTOList.forEach((item = {}) => {
        const {
          roundHeaderDateId = null,
          quotationRound = null,
          fieldPropertyDTOList: roundFieldPropertyDTOList = [],
          roundQuotationStartDate = null,
          roundQuotationEndDate = null,
        } = item;
        if (!roundHeaderDateId || !quotationRound || isEmpty(roundFieldPropertyDTOList)) {
          return;
        }

        roundFieldPropertyDTOList.forEach((roundItem = {}) => {
          const { visible = 0, name = null, nowAdjustedField = null } = roundItem;
          if (!name || !visible) {
            return;
          }

          let startTime = {};
          let endTime = {};

          if (name === 'roundQuotationStartDate') {
            let startValue = roundQuotationStartDate;
            if (newFlag && nowAdjustedField === 'roundQuotationStartDate') {
              // 此刻
              startValue = intl.get(`${promptCode}.model.quoController.currentTimeDate`).d('此刻');
            }
            const label =
              intl.get('ssrc.common.the').d('第') +
              quotationRound +
              intl.get('ssrc.common.roundStartTime').d('轮报价开始时间');
            startTime = {
              value: startValue,
              name: `roundQuotationStart${quotationRound}`,
              label,
            };
          } else {
            let endValue = roundQuotationEndDate;
            if (newFlag && nowAdjustedField === 'roundQuotationEndDate') {
              // 此刻
              endValue = intl.get(`${promptCode}.model.quoController.currentTimeDate`).d('此刻');
            }
            const label =
              intl.get('ssrc.common.the').d('第') +
              quotationRound +
              intl.get('ssrc.common.roundEndTime').d('轮报价截止时间');
            endTime = {
              value: endValue,
              name: `roundQuotationStart${quotationRound}`,
              label,
            };
          }

          newData.push(startTime);
          newData.push(endTime);
        });
      });
    }

    return newData;
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

    const timeMeaning =
      (biddingRunnintDay || 0) +
      intl.get('hzero.common.date.unit.day').d('天') +
      (biddingRunnintHour || 0) +
      intl.get('hzero.common.date.unit.hours').d('小时') +
      (biddingRunnintMinute || 0) +
      intl.get('hzero.common.date.unit.minutes').d('分钟');

    return timeMeaning;
  }

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
    },
    quotationStartDate: {
      label: intl.get(`${promptCode}.model.quoController.quotationStartTime`).d('报价开始时间'),
      type: 'dateTime',
      placeholder: intl
        .get(`${promptCode}.model.quoController.quotationStartTime`)
        .d('报价开始时间'),
      format: DEFAULT_DATETIME_FORMAT,
      customOptions: {},
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
    },
    quotationInterval: {
      label: intl.get(`${promptCode}.model.quoController.quotationInterval`).d('报价间隔时间'),
      type: 'number',
      placeholder: intl
        .get(`${promptCode}.model.quoController.quotationInterval`)
        .d('报价间隔时间'),
      format: DEFAULT_DATETIME_FORMAT,
      customOptions: {},
    },
    quotationEndDate: {
      label: intl.get(`${promptCode}.model.quoController.quotationDeadline`).d('报价截止时间'),
      type: 'dateTime',
      placeholder: intl
        .get(`${promptCode}.model.quoController.quotationDeadline`)
        .d('报价截止时间'),
      format: DEFAULT_DATETIME_FORMAT,
      customOptions: {},
    },
    bargainEndDate: {
      label: intl.get(`${promptCode}.model.quoController.bargainEndDate`).d('议价截止时间'),
      type: 'dateTime',
      placeholder: intl.get(`${promptCode}.model.quoController.bargainEndDate`).d('议价截止时间'),
      format: DEFAULT_DATETIME_FORMAT,
      customOptions: {},
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
    },
    prequalEndDate: {
      label: intl.get(`${promptCode}.model.quoController.pretrialDeadline`).d('预审截止时间'),
      type: 'dateTime',
      placeholder: intl.get(`${promptCode}.model.quoController.pretrialDeadline`).d('预审截止时间'),
      format: DEFAULT_DATETIME_FORMAT,
      customOptions: {},
    },
    timeAdjustedRemark: {
      label: intl.get(`${promptCode}.model.quoController.remarks`).d('备注'),
      type: 'textArea',
      required: 1,
      visible: 1,
      disabled: 0,
      placeholder: intl.get(`${promptCode}.model.quoController.remarks`).d('备注'),
      customOptions: {},
    },
  };

  /**
   * onCollapseChange - 折叠面板onChange
   */
  @Bind()
  onCollapseChange(collapseKeys = []) {
    this.setState({
      collapseKeys,
    });
  }

  @Bind()
  directionRFXDetail(data = {}) {
    const { history } = this.props;
    const { rfxHeaderId = null } = data;
    if (!rfxHeaderId) {
      return;
    }

    let search = {
      sourcePage: 'QuotationControllerPub',
    };
    search = querystring.stringify(search);
    history.push({
      pathname: `/pub/ssrc/inquiry-hall/rfx-detail-approval/${rfxHeaderId}`,
      search,
    });
  }

  renderBaseInfo(dataSource = {}) {
    const {
      form: { getFieldDecorator },
    } = this.props;

    return (
      <Form>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`${promptCode}.model.quoController.RFxNo.`).d('RFx单号')}
              {...formLayout}
            >
              {getFieldDecorator('rfxNum', {
                initialValue: dataSource.rfxNum,
              })(<a onClick={() => this.directionRFXDetail(dataSource)}>{dataSource.rfxNum}</a>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get(`ssrc.common.title`).d('标题')} {...formLayout}>
              {getFieldDecorator('rfxTitle', {
                initialValue: dataSource.rfxTitle,
              })(<span>{dataSource.rfxTitle}</span>)}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }

  renderForm(data = []) {
    if (isEmpty(data)) {
      return;
    }

    const renders = data.map((item = {}) => {
      const { value = null, name = null, label = null } = item;
      if (!name || !label) {
        return;
      }

      return (
        <Form.Item label={label} {...formLayout}>
          {value}
        </Form.Item>
      );
    });

    return renders;
  }

  render() {
    const { timer = {}, collapseKeys = [] } = this.state;
    const { newTime = [], oldTime = [], remark = {}, sourceHeaderDTO = {} } = timer || {};

    return (
      <div className={styles.timeView}>
        <Collapse
          className="form-collapse"
          activeKey={collapseKeys}
          onChange={this.onCollapseChange}
        >
          <Panel
            showArrow={false}
            header={
              <React.Fragment>
                <h3>
                  {intl.get(`${promptCode}.model.quoController.timeAdjustment`).d('时间调整')}
                </h3>
                <a>
                  {collapseKeys.includes('timeAdjustment')
                    ? intl.get(`hzero.common.button.up`).d('收起')
                    : intl.get(`hzero.common.button.expand`).d('展开')}
                </a>
                <Icon type={collapseKeys.includes('timeAdjustment') ? 'up' : 'down'} />
              </React.Fragment>
            }
            key="timeAdjustment"
          >
            <div>
              <Form.Item
                label={intl.get('ssrc.quoController.view.title.currentReasonFormtim').d('原因')}
                labelCol={{ span: 3 }}
                wrapperCol={{ span: 21 }}
              >
                {remark.value}
              </Form.Item>
            </div>
            <Row gutter={32}>
              <Col span={8}>
                <div className={styles.timeViewTitle}>
                  {intl.get('ssrc.quoController.view.form.title.currentTimeOfTitle').d('当前时间')}
                </div>
                <Form className={styles['p-l-m']}>{this.renderForm(oldTime)}</Form>
              </Col>
              <Col span={8}>
                <div className={styles.timeViewTitle}>
                  {intl.get('ssrc.quoController.view.form.title.updatedToTimes').d('更新为')}
                </div>
                <Form className={styles['p-l-m']}>{this.renderForm(newTime)}</Form>
              </Col>
            </Row>
          </Panel>
          <Panel
            showArrow={false}
            header={
              <>
                <h3>
                  {intl.get(`${promptCode}.view.message.panel.basicInformation`).d('基本信息')}
                </h3>
                <a>
                  {collapseKeys.includes('baseInfos')
                    ? intl.get(`hzero.common.button.up`).d('收起')
                    : intl.get(`hzero.common.button.expand`).d('展开')}
                </a>
                <Icon type={collapseKeys.includes('baseInfos') ? 'up' : 'down'} />
              </>
            }
            key="baseInfos"
          >
            {this.renderBaseInfo(sourceHeaderDTO)}
          </Panel>
        </Collapse>
      </div>
    );
  }
}
