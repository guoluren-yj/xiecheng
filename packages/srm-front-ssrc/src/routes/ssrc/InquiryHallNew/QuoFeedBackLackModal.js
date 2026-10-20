/**
 * QuoFeedBackLackModal - 报价响应不足modal
 * @date: 2020-12-29
 * @author: lzj<zhijian.li@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import querystring from 'querystring';
import { Bind } from 'lodash-decorators';
import { map, isFunction, isArray } from 'lodash';
import { Table, DataSet, Modal, message, Tooltip } from 'choerodon-ui/pro';
import { Spin } from 'choerodon-ui';
import { Radio, Form, Row, Col } from 'hzero-ui';
// import withCustomize from 'srm-front-cuz/lib/h0Customize';
import mixCustomize from 'srm-front-cuz/lib/mixCustomize';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import notification from 'utils/notification';
import { queryMapIdpValue } from 'services/api';
import { getResponse, getCurrentTenant } from 'utils/utils';
import { abandonRemarkRender } from '@/utils/renderer';

import {
  sendExpertScore,
  startNextRfxStatus,
  fetchOldControllerConfig,
} from '@/services/inquiryHallService';
import {
  createBeforeDirectController,
  validateBeforeDirectController,
  checkPermission,
} from '@/services/inquiryHallNewService';
import { INQUIRY, getQuotationName } from '@/utils/globalVariable';
import style from './OpeningBid.less';
import { feedBackDS } from './QuoFeedBackLackDS';
import closeRFX from './CloseRfxDrawer';

const RadioGroup = Radio.Group;
const radioStyle = {
  display: 'block',
  height: '30px',
  lineHeight: '30px',
};

const promptCode = 'ssrc.common';

const renderSubTitle = (title) => {
  return (
    <div className={style['sub-title']}>
      <h3>
        <div className={style['vertical-line']} />
        <span>{title}</span>
      </h3>
    </div>
  );
};

class QuoFeedBackLackModal extends Component {
  constructor(props) {
    super(props);
    // eslint-disable-next-line no-unused-expressions
    isFunction(props.onRef) && props.onRef(this);
    this.state = {
      currentSelStatus: '',
      permissionBtnMap: {}, // 按钮权限集合
      querySourcingResultLoading: false,
      sourcingResultMap: {}, // 寻源结果值集转map, 加快访问速度
      sourceResultList: [],
    };
  }

  async componentDidMount() {
    await this.tableDs.query();
    this.fetchCheckPermission();
  }

  tableDs = new DataSet(
    feedBackDS({
      rfxHeaderId: this.props.record.rfxHeaderId,
      customizeUnitCode: `SSRC.${
        this.props.bidFlag ? 'BID' : 'INQUIRY'
      }_HALL.LACK_QUOTED.SUPPLIER_QUOTATION`,
    })
  );

  /**
   * cux
   */
  getColunms = () => {
    const columns = [
      {
        name: 'supplierCompanyNum',
        width: 120,
      },
      {
        name: 'supplierCompanyName',
        width: 200,
      },
      {
        name: 'feedbackStatusMeaning',
        width: 100,
        renderer: ({ value, record }) => abandonRemarkRender({ val: value, record }),
      },
      {
        name: 'quotationNumber',
        width: 100,
        renderer: ({ value }) => (
          <React.Fragment>
            {value ? (
              <span>{value}</span>
            ) : (
              intl.get(`ssrc.inquiryHall.model.inquiryHall.noQuotation`).d('未报价')
            )}
          </React.Fragment>
        ),
      },
      {
        name: 'prequalStatusMeaning',
        width: 150,
      },
      {
        name: 'attachmentFlag',
        align: 'left',
        width: 150,
        renderer: ({ value }) => yesOrNoRender(value),
      },
    ];
    return columns;
  };

  // 查询按钮权限
  @Bind()
  async fetchCheckPermission() {
    const params = [
      'ssrc.new-inquiry-hall.list.button.timeadjustment', // 时间调整
      'ssrc.new-inquiry-hall.list.button.closed', // 关闭询价单
    ];
    const result = getResponse(await checkPermission(params));
    if (isArray(result)) {
      const permissions = [];
      result.forEach((r, index) => {
        if (r.controllerType === 'hidden' && !r.approve) {
          // 隐藏
          permissions[index] = 'hidden';
        } else if (!r.approve) {
          // 禁用
          permissions[index] = 'disabled';
        } else {
          permissions[index] = 'default';
        }
      });
      this.setState(
        {
          permissionBtnMap: {
            ADJUST_TIME: permissions[0],
            CLOSED: permissions[1],
          },
        },
        () => {
          this.querySourcingResultList(); // 查询值集, 需要先等权限接口返回
        }
      );
    }
  }

  // 获取执行结果
  setSourcingResultList() {
    let list = [];
    list = this.filterSourcingResultByQuoLack();
    this.setState({
      sourceResultList: list,
    });
  }

  // 查询寻源执行结果列表
  @Bind()
  async querySourcingResultList() {
    const { bidFlag } = this.props;
    this.setState({
      querySourcingResultLoading: true,
    });
    const { sourcingResults = [] } =
      getResponse(
        await queryMapIdpValue({
          sourcingResults: bidFlag
            ? 'SSRC.NEW_BID_SECTION_PROCESS_RESULT'
            : 'SSRC.RFX_SECTION_PROCESS_RESULT',
          sourcingResultShorts: bidFlag
            ? 'SSRC.NEW_BID_SECTION_PROCESS_RESULT_SHORT'
            : 'SSRC.RFX_SECTION_PROCESS_RESULT_SHORT',
        })
      ) || {};
    const sourcingResultMap = {};
    // eslint-disable-next-line no-unused-expressions
    sourcingResults?.forEach((r) => {
      sourcingResultMap[r.value] = r.meaning;
    });
    this.setState(
      {
        sourcingResultMap,
        querySourcingResultLoading: false,
      },
      () => this.setSourcingResultList()
    );
  }

  /**
   * 过滤执行结果
   * 当没有供应商报价时, 只有关闭询价单和时间调整, 中间那项就没有
   * 下一个操作专家评分显示执行操作：关闭询价单、下发专家评分、时间调整，
   * 下一个操作开标显示执行操作：关闭询价单、开始开标、时间调整
   * 下一个操作初审显示执行操作：关闭询价单、开始初审、时间调整
   * 下一个操作核价显示执行操作：关闭询价单、开始核价、时间调整
   * 在开始开标、开始初审、开始核价、专家评分、点击“应用至全部”，只标记有对应操作的标段
   */
  @Bind()
  filterSourcingResultByQuoLack() {
    const { sourcingResultMap = {}, permissionBtnMap = {} } = this.state;
    const {
      record,
      record: {
        nextRfxStatus,
        sourceCategory = 'RFQ',
        biddingTarget,
        quotationOrderType,
        biddingAllowAdjustTimeFlag,
        biddingAllowAdjustTimeType,
      } = {},
      remote,
      newBiddingFlag = 0,
    } = this.props;

    const defaultStatus = ['CLOSED', 'ADJUST_TIME']; // 默认都有的状态

    if (newBiddingFlag) {
      /**
       * 1.竞价单：竞价对象=单价+报价次序=并行 / 竞价对象=总价
       * 2.寻源模板：是否允许调整时间=是+调整时间节点包含【响应不足】
       *
       */
      const biddingPreviewRuleVisible =
        (biddingTarget === 'UNIT_PRICE' && quotationOrderType === 'PARALLEL') ||
        biddingTarget === 'TOTAL_PRICE';
      const allowAdjustRule =
        biddingAllowAdjustTimeFlag === 1 &&
        biddingAllowAdjustTimeType &&
        biddingAllowAdjustTimeType.includes('LACK_QUOTED');

      // 竞价大厅展示时间调整
      const biddingHallAdjustTime = biddingPreviewRuleVisible && allowAdjustRule;

      if (!biddingHallAdjustTime) {
        const adjustTimeIndex = defaultStatus.findIndex((item) => item === 'ADJUST_TIME');
        if (adjustTimeIndex !== -1) {
          defaultStatus.splice(adjustTimeIndex, 1); // 竞价大厅多标段，不需要时间调整
        }
      }
    }

    // 需要额外处理权限按钮状态
    let newStatus = [];
    defaultStatus.forEach((r) => {
      // eslint-disable-next-line no-unused-expressions
      permissionBtnMap[r] !== 'hidden' && newStatus.push(r); // 判断每一项权限按钮
    });

    const data = this.tableDs.toData();
    const isQuotationPending = data?.every(
      (item) =>
        item.quotationStatus === null ||
        item.quotationStatus === 'NEW' ||
        item.quotedCount === 0 ||
        item.quotedCount === null
    ); // 所有供应商都未报价

    newStatus = remote
      ? remote.process(
          'SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_QUOTATION_LACK_SINGLE_PREVIEW',
          newStatus,
          {
            record,
          }
        )
      : newStatus;

    if (isQuotationPending) {
      return map(newStatus, (value) => ({
        value,
        meaning: sourcingResultMap[value],
      }));
    }
    switch (nextRfxStatus) {
      case 'SCORING': // 下发专家评分
        newStatus.splice(1, 0, 'SCORING_PENDING');
        break;
      case 'OPEN_BID_PENDING': // 开标
        newStatus.splice(1, 0, 'OPEN_BID_PENDING');
        break;
      case 'PRETRIAL_PENDING': // 初审
        newStatus.splice(1, 0, 'PRETRIAL_PENDING');
        break;
      case 'CHECK_PENDING': // 核价
        newStatus.splice(1, 0, 'CHECK_PENDING');
        break;
      default:
        break;
    }
    return map(
      remote
        ? remote.process('SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_QUOTATION_LACK_SINGLE', newStatus, {
            sourceCategory,
            record,
          })
        : newStatus,
      (value) => ({
        value,
        meaning: sourcingResultMap[value],
      })
    );
  }

  /**
   * 切换单选框
   * @param {*} e - 事件源
   */
  @Bind()
  handleChange(e) {
    const { onChange } = this.props;
    this.setState({
      currentSelStatus: e.target.value,
    });
    // eslint-disable-next-line no-unused-expressions
    isFunction(onChange) && onChange(); // 触发回调, 渲染item上的Tag
  }

  /**
   * Action 主要分为以下:
   * - 关闭询价单: 弹窗
   * - 关闭询价单 + 其他: 弹窗
   * - 关闭询价单 + 时间调整: 弹窗 + 跳转页面
   * - 时间调整: 跳转页面
   * - 其他: 关闭弹窗
   */
  @Bind()
  async handleSubmit() {
    const {
      record: { rfxHeaderId },
      documentTypeName,
      bidFlag,
      serviceChargeFlag,
      remote,
    } = this.props;
    const { currentSelStatus } = this.state;
    switch (currentSelStatus) {
      case 'ADJUST_TIME':
        this.onAdjustTime();
        break;
      case 'CLOSED':
        closeRFX(
          rfxHeaderId,
          this.closeAfterAction,
          documentTypeName,
          bidFlag ? 'BID' : 'INQUIRY',
          serviceChargeFlag,
          remote
        );
        break;
      case 'SCORING':
        this.onSendExpertScore();
        break;
      case 'SCORING_PENDING':
        this.onSendExpertScore();
        break;
      case 'PRETRIAL_PENDING':
      case 'CHECK_PENDING':
      case 'OPEN_BID_PENDING':
        this.onStartNextRfxStatus();
        break;
      default:
        break;
    }
  }

  /**
   * 关闭询价单
   */
  @Bind()
  async onCloseRfx() {
    const {
      record: { rfxHeaderId },
      documentTypeName,
      bidFlag,
      serviceChargeFlag,
      remote,
    } = this.props;

    closeRFX(
      rfxHeaderId,
      this.afterAction,
      documentTypeName,
      bidFlag ? 'BID' : 'INQUIRY',
      serviceChargeFlag,
      remote
    );
  }

  /**
   * 调整时间
   */
  @Bind()
  async onAdjustTime() {
    const {
      history,
      bidFlag = false,
      organizationId,
      sourceName,
      documentTypeName,
      projectLineSectionId,
      record: { rfxHeaderId },
    } = this.props;
    const newSearch = querystring.stringify({
      projectLineSectionId,
    });
    const search = querystring.stringify({
      openTimeControlFlag: true,
    });
    try {
      const res = getResponse(
        await fetchOldControllerConfig({
          organizationId,
          tenant: getCurrentTenant().tenantNum,
        })
      );
      if (!res) {
        notification.warning();
        return;
      }
      Modal.destroyAll();
      if (!res.length) {
        const result = getResponse(
          await validateBeforeDirectController({
            organizationId,
            sourceHeaderId: rfxHeaderId,
            sourceFrom: 'RFX',
          })
        );
        if (result) {
          const onOk = async () => {
            const createRes = await createBeforeDirectController({
              organizationId,
              sourceHeaderId: rfxHeaderId,
              sourceFrom: 'RFX',
            });
            if (createRes && !createRes.failed) {
              const url = `/ssrc/new-${
                bidFlag ? 'bid' : 'inquiry'
              }-hall/new-rfx-detail-controller/${createRes.adjustRecordId}`;
              history.push({
                pathname: url,
                search: newSearch,
              });
            } else if (createRes && createRes.message) {
              message.warning(createRes?.message);
            }
          };
          if (result.validateResult === 'createAdjustAgain') {
            Modal.confirm({
              key: Modal.key(),
              title: intl
                .get(`ssrc.inquiryHall.view.message.title.commonAdjustagain`, {
                  documentTypeName,
                  sourceName,
                })
                .d(`{documentTypeName}中的部分信息已变更，是否重新发起{sourceName}过程控制？`),
              onOk: () => onOk(),
            });
          } else if (result.validateResult === 'createAdjust') {
            onOk();
          } else if (result.validateResult === 'openAdjust') {
            const url = `/ssrc/new-${bidFlag ? 'bid' : 'inquiry'}-hall/new-rfx-detail-controller/${
              result.adjustRecordId
            }`;
            history.push({
              pathname: url,
              search: newSearch,
            });
          }
        }
      } else {
        history.push({
          pathname: `/ssrc/new-${
            bidFlag ? 'bid' : 'inquiry'
          }-hall/rfx-detail-controller/${rfxHeaderId}`,
          search,
        });
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * 下发专家评分
   */
  @Bind()
  async onSendExpertScore() {
    const {
      organizationId,
      record: { rfxHeaderId },
    } = this.props;
    const result = getResponse(await sendExpertScore({ organizationId, rfxHeaderId }));
    if (result && !result.failed) {
      this.afterAction();
    }
  }

  /**
   * 开始进入下一个状态
   */
  @Bind()
  async onStartNextRfxStatus() {
    const {
      organizationId,
      record: { rfxHeaderId, nextRfxStatus },
    } = this.props;
    const result = getResponse(
      await startNextRfxStatus({
        organizationId,
        rfxHeaderId,
        rfxStatus: nextRfxStatus,
      })
    );
    if (result && !result.failed) {
      this.afterAction();
    }
  }

  /**
   * 调用接口后统一处理
   */
  @Bind()
  afterAction() {
    const { allQuery = () => {} } = this.props;
    notification.success();
    Modal.destroyAll();
    allQuery();
  }

  // 报价响应不足关闭弹框不应该弹出操作成功单独拎出一个函数
  @Bind()
  closeAfterAction() {
    const { allQuery = () => {} } = this.props;
    Modal.destroyAll();
    allQuery();
  }

  /**
   * 处理结果集中的value，使其与个性化中的字段相对应 例如将ADJUST_TIME转换成adjustTime
   * @param {*} value - 原始value
   */
  @Bind()
  transferUppercase(value) {
    const splitString = value?.split('_');
    const dealResult = splitString.reduce((prev, cur, index) => {
      if (index === 0) {
        return prev + cur.toLowerCase();
      } else {
        return prev + this.firstToUpper(cur);
      }
    }, '');
    return dealResult;
  }

  /**
   * 正则 转换首字母大写
   * @param {*} str
   */
  @Bind()
  firstToUpper(str) {
    return str.replace(/\b(\w)(\w*)/g, ($0, $1, $2) => {
      return $1.toUpperCase() + $2.toLowerCase();
    });
  }

  render() {
    const {
      querySourcingResultLoading = false,
      sourceResultList = [],
      permissionBtnMap = {},
    } = this.state;
    const {
      bidFlag = false,
      documentTypeName,
      record: { closeRecordFlag },
      h0: { customizeForm },
      form,
      // customizeTableAlias: customizeTable,
      c7n: { custTable: customizeTable },
      // customizeTable
    } = this.props;
    const { getFieldDecorator } = form;

    return (
      <React.Fragment>
        {/* 右侧上方供应商报价列表 */}
        <div style={{ marginBottom: '32px' }}>
          {renderSubTitle(
            intl
              .get(`${promptCode}.view.title.commonSupplierQuotationInfo`, {
                quotationName: getQuotationName(bidFlag),
              })
              .d('供应商{quotationName}情况')
          )}
          {customizeTable(
            { code: `SSRC.${bidFlag ? 'BID' : 'INQUIRY'}_HALL.LACK_QUOTED.SUPPLIER_QUOTATION` },
            <Table columns={this.getColunms()} rowKey="rfxLineSupplierId" dataSet={this.tableDs} />
          )}
        </div>
        {/* 右侧下方执行结果列表 */}
        <Spin spinning={querySourcingResultLoading}>
          {renderSubTitle(intl.get(`${promptCode}.view.title.sourcingResult`).d('执行结果'))}
          <RadioGroup onChange={this.handleChange}>
            {customizeForm(
              {
                code: `SSRC.${bidFlag ? 'BID' : 'INQUIRY'}_HALL.LACK_QUOTED.SOURCING_RESULT`,
                form,
                dataSource: {},
                readOnly: true,
              },
              <Form layout="vertical">
                {map(sourceResultList, (item) => (
                  <Row gutter={24}>
                    <Col span={24}>
                      <Form.Item labelCol={{ span: 0, offset: 0 }} style={{ marginBottom: 0 }}>
                        {getFieldDecorator(this.transferUppercase(item.value))(
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            {item.value === 'CLOSED' && closeRecordFlag === 1 ? (
                              <Tooltip
                                placement="right"
                                title={intl
                                  .get(
                                    'ssrc.inquiryHall.view.message.button.closeInquiryList.commonPlaceholder',
                                    { documentTypeName }
                                  )
                                  .d(`{documentTypeName}正在进行关闭审批，请勿重复操作`)}
                              >
                                <Radio
                                  disabled={
                                    permissionBtnMap[item.value] === 'disabled' ||
                                    closeRecordFlag === 1
                                  }
                                  style={radioStyle}
                                  value={item.value}
                                >
                                  {item.meaning}
                                </Radio>
                              </Tooltip>
                            ) : (
                              <Radio
                                disabled={permissionBtnMap[item.value] === 'disabled'}
                                style={radioStyle}
                                value={item.value}
                              >
                                {item.meaning}
                              </Radio>
                            )}
                          </div>
                        )}
                      </Form.Item>
                    </Col>
                  </Row>
                ))}
              </Form>
            )}
          </RadioGroup>
        </Spin>
      </React.Fragment>
    );
  }
}

const HOCComponent = (Comp, type = INQUIRY) => {
  return Form.create({ fieldNameProp: null })(
    mixCustomize({
      unitCode: [
        `SSRC.${type}_HALL.LACK_QUOTED.SOURCING_RESULT`,
        `SSRC.${type}_HALL.LACK_QUOTED.SUPPLIER_QUOTATION`,
      ],
      c7nUnit: [`SSRC.${type}_HALL.LACK_QUOTED.SUPPLIER_QUOTATION`],
    })(Comp)
  );
};

export default HOCComponent(QuoFeedBackLackModal, INQUIRY);
// TODO
export {
  HOCComponent,
  QuoFeedBackLackModal,
  QuoFeedBackLackModal as QuoFeedBackLackModalComponent,
  HOCComponent as hocQuoFeedBackLackModal,
};
