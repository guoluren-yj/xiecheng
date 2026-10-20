/**
 * OperationBid - 开标弹框modal
 * @date: 2020-12-29
 * @author: lzj<zhijian.li@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 * */

import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { map, isFunction, isArray } from 'lodash';
import remote from 'hzero-front/lib/utils/remote';

import { DataSet, Modal, Tooltip } from 'choerodon-ui/pro';
import { Radio, Form, Row, Col } from 'hzero-ui';
import { Spin } from 'choerodon-ui';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';
import { queryMapIdpValue } from 'services/api';

import { sendExpertScore, startNextRfxStatus } from '@/services/inquiryHallService';
import { abandonRemarkRender } from '@/utils/renderer';
import { INQUIRY, BID, getQuotationName } from '@/utils/globalVariable';
import CombineComponent from '@/routes/components/CombineComponent';
import { checkPermission } from '@/services/inquiryHallNewService';
import closeRFX from './CloseRfxDrawer';
import { openBidDS } from './OperationBidDS';
import style from './OpeningBid.less';
import SupplierQuotationTable, { BidSupplierQuotationTable } from './SupplierQuotationTable';

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
class SupplierRecord extends Component {
  constructor(props) {
    super(props);
    // eslint-disable-next-line no-unused-expressions
    isFunction(props.onRef) && props.onRef(this);
    /** ********* 【三宁化工】二开拓展节点-勿动!!! *********** */
    this.expandNodeRef = null;
    this.cacheExpendNodeRef = {}; // 当弹框关闭后，expandNodeRef就为空了，用这个暂存数据
    this.state = {
      currentSelStatus: '',
      permissionBtnMap: {}, // 按钮权限集合
      querySourcingResultLoading: false,
      sourcingResultMap: {}, // 寻源结果值集转map, 加快访问速度
      sourceResultList: [],
    };
    this.tableDs = new DataSet(openBidDS(this.props.record));
  }

  /**
   * 获取列表columns 此方法被 [永祥] 二开, 禁止修改方法名, 谨慎修改逻辑
   * @returns {Array}
   * @protected
   */
  getColums = () => {
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
        name: 'readFlag',
        width: 100,
        align: 'left',
        renderer: ({ value }) => yesOrNoRender(value),
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
        width: 120,
      },
      {
        name: 'postqualStatusMeaning',
        width: 120,
      },
      {
        name: 'attachmentFlagMeaning',
        width: 130,
      },
    ];
    return columns;
  };

  /**
   * 关闭询价单
   */
  @Bind()
  async onCloseRfx() {
    const {
      record: { rfxHeaderId },
      documentTypeName,
      sourceKey,
      serviceChargeFlag,
      sourcingResultRemote,
    } = this.props;

    closeRFX(
      rfxHeaderId,
      this.afterAction,
      documentTypeName,
      sourceKey,
      serviceChargeFlag,
      sourcingResultRemote
    );
  }

  /**
   * 下发专家评分
   */
  @Bind()
  async onSendExpertScore() {
    const {
      organizationId,
      record,
      record: { rfxHeaderId },
      sourcingResultRemote,
    } = this.props;
    const { sourceKey } = this.props;
    const params = { organizationId, rfxHeaderId };
    const newParams = sourcingResultRemote
      ? sourcingResultRemote?.process(
          'SSRC_OPERATE_SOURCING_RESULT_DRAWER_PROCESS_EXPERT_SCORE_PARAMS',
          params,
          {
            bidFlag: sourceKey === 'BID',
            expandNodeRef: this.expandNodeRef,
            record,
          }
        )
      : params;
    const result = getResponse(await sendExpertScore(newParams));
    if (result && !result.failed) {
      this.afterAction();
    }
  }

  /**
   * 调用接口后统一处理
   */
  @Bind()
  async afterAction() {
    const { allQuery, record, inquiryCheckPrice, sourcingResultRemote, sourceKey } = this.props;
    const { currentSelStatus } = this.state;
    const { checkUserFlag } = record;
    const { expandNodeRef } = this.cacheExpendNodeRef || {};
    if (sourcingResultRemote && sourcingResultRemote.event) {
      await sourcingResultRemote.event.fireEvent('remoteAfterConfirmAction', {
        currentSelStatus,
        bidFlag: sourceKey === 'BID',
        expandNodeRef,
      });
    }

    notification.success();
    Modal.destroyAll();
    allQuery();

    // 跳转核价
    if (
      currentSelStatus === 'CHECK_PENDING' &&
      Number(checkUserFlag) === 1 &&
      isFunction(inquiryCheckPrice)
    ) {
      inquiryCheckPrice(record);
    }
  }

  // 郑州地铁二开
  renderCuxContent = () => {
    return null;
  };

  /**
   * render Table
   * @returns ReactDom
   * @protected 永祥二开 禁止修改此方法
   */
  renderTable = () => {
    const { sourceKey } = this.props;
    const bidFlag = sourceKey === 'BID';

    const tableProps = {
      bidFlag,
      tableDs: this.tableDs,
    };

    return bidFlag ? (
      <BidSupplierQuotationTable {...tableProps} />
    ) : (
      <SupplierQuotationTable {...tableProps} />
    );
  };

  async componentDidMount() {
    const { sourceKey } = this.props;
    const bidFlag = sourceKey === 'BID';
    this.tableDs.setQueryParameter('params', {
      customizeUnitCode: `SSRC.${
        bidFlag ? 'BID' : 'INQUIRY'
      }_HALL.OPERATION_OPEN_BID.SUPPLIER_QUOTATION`,
    });
    await this.tableDs.query();
    this.fetchCheckPermission();
  }

  // 查询按钮权限
  @Bind()
  async fetchCheckPermission() {
    const { sourceKey } = this.props;
    const prefix =
      sourceKey !== 'BID' ? 'ssrc.new-inquiry-hall.list.button.' : 'ssrc.new-bid-hall.button.';
    const params = [
      // 'ssrc.new-inquiry-hall.list.button.timeadjustment', // 时间调整
      `${prefix}closed`, // 关闭询价单
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
            CLOSED: permissions[0],
          },
        },
        () => {
          this.querySourcingResultList(); // 查询值集, 需要先等权限接口返回
        }
      );
    }
  }

  // 查询寻源执行结果列表
  @Bind()
  async querySourcingResultList() {
    const { sourceKey } = this.props;
    const bidFlag = sourceKey === 'BID';
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

  // 获取执行结果
  setSourcingResultList() {
    let list = [];
    list = this.filterSourcingResultByOpenedBid();
    this.setState({
      sourceResultList: list,
    });
  }

  /**
   * 已开标
   * 有专家评分的显示执行操作：关闭询价单、专家评分
   * 无专家评分核价的显示执行操作：关闭询价单、开始核价
   * 开始初审的显示执行操作：关闭询价单、开始初审
   * 在开始初审、开始核价、专家评分、点击“应用至全部”，只标记有对应操作的标段
   * @protected 此方法被 [永祥] 二开, 禁止修改方法名, 谨慎修改逻辑
   */
  filterSourcingResultByOpenedBid() {
    const {
      record: { pretrialFlag, expertScoreType },
    } = this.props;
    const { sourcingResultMap = {}, permissionBtnMap = {} } = this.state;
    const defaultStatus = ['CLOSED']; // 默认都有的状态
    // 需要额外处理权限按钮状态
    const newStatus = [];
    defaultStatus.forEach((r) => {
      // eslint-disable-next-line no-unused-expressions
      permissionBtnMap[r] !== 'hidden' && newStatus.push(r); // 判断每一项权限按钮
    });

    const data = this.tableDs.toData();
    let quotationLineNumber = 0;
    if (data && data.length) {
      [quotationLineNumber] = data;
    }

    // 控制按钮显隐
    if (expertScoreType === 'ONLINE' && Number(quotationLineNumber) !== 0) {
      // 下发专家评分
      newStatus.push('SCORING_PENDING');
    } else if (expertScoreType !== 'ONLINE' && pretrialFlag === 1) {
      // 初审
      newStatus.push('PRETRIAL_PENDING');
    } else if (
      expertScoreType !== 'ONLINE' &&
      pretrialFlag !== 1 &&
      Number(quotationLineNumber) !== 0
    ) {
      // 核价
      newStatus.push('CHECK_PENDING');
    }
    return map(newStatus, (value) => ({
      value,
      meaning: sourcingResultMap[value],
    }));
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
      sourceKey,
      serviceChargeFlag,
      sourcingResultRemote,
    } = this.props;
    const { currentSelStatus } = this.state;
    const { expandNodeRef } = this;
    // 缓存弹框关闭前数据
    this.cacheExpendNodeRef = { ...(this.cacheExpendNodeRef || {}), expandNodeRef };
    switch (currentSelStatus) {
      case 'CLOSED':
        closeRFX(
          rfxHeaderId,
          this.afterAction,
          documentTypeName,
          sourceKey,
          serviceChargeFlag,
          sourcingResultRemote
        );
        break;
      case 'SCORING_PENDING':
        this.onSendExpertScore();
        break;
      case 'PRETRIAL_PENDING':
      case 'CHECK_PENDING':
      case 'OPEN_BID_PENDING':
        this.onStartNextRfxStatus(currentSelStatus);
        break;
      default:
        break;
    }
  }

  /**
   * 开始进入下一个状态
   */
  @Bind()
  async onStartNextRfxStatus(currentSelStatus) {
    const {
      organizationId,
      record: { rfxHeaderId },
    } = this.props;
    const result = getResponse(
      await startNextRfxStatus({
        organizationId,
        rfxHeaderId,
        rfxStatus: currentSelStatus,
      })
    );
    if (result && !result.failed) {
      this.afterAction();
    }
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
    return str.replace(/\b(\w)(\w*)/g, (_$0, $1, $2) => {
      return $1.toUpperCase() + $2.toLowerCase();
    });
  }

  /**
   * ui规范要求一些只做查看功能不关闭弹框的一些按钮放到表格上面
   * 目前标准还没有，如有 就放到这里
   * @protected 此方法被 [郑州地铁/永祥/Lotus] 二开, 禁止修改方法名, 谨慎修改逻辑
   */
  // eslint-disable-next-line no-unused-vars
  renderTableViewButton(headerTableButtonProps = {}) {
    return [];
  }

  @Bind()
  handleBindOnRef(ref = {}) {
    /** ********* 【三宁化工】二开节点-勿动!!! *********** */
    this.expandNodeRef = ref;
  }

  render() {
    const {
      record,
      documentTypeName,
      checkPriceName,
      sourceKey,
      record: { closeRecordFlag, rfxHeaderId },
      customizeForm,
      form,
      rfxStatus,
      sourcingResultRemote,
    } = this.props;
    const {
      querySourcingResultLoading,
      permissionBtnMap,
      sourceResultList,
      currentSelStatus = '',
    } = this.state;
    const headerTableButtonProps = {
      record,
      checkPriceName,
      tableDs: this.tableDs,
      sourceKey,
    };

    const bidFlag = sourceKey === 'BID';
    const { getFieldDecorator } = form;

    const filterSourceResultList = sourcingResultRemote
      ? sourcingResultRemote.process(
          'SSRC_OPERATE_SOURCING_RESULT_DRAWER_PROCESS_SOURCE_RESULT_LIST',
          sourceResultList,
          { rfxStatus }
        )
      : sourceResultList;

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
          {this.renderTableViewButton(headerTableButtonProps)}
          {this.renderTable()}
          {this.renderCuxContent()}
        </div>

        {/* 右侧下方执行结果列表 */}
        <Spin spinning={querySourcingResultLoading}>
          {renderSubTitle(intl.get(`${promptCode}.view.title.sourcingResult`).d('执行结果'))}
          <RadioGroup onChange={this.handleChange}>
            {customizeForm(
              {
                code: `SSRC.${bidFlag ? 'BID' : 'INQUIRY'}_HALL.OPERATION_OPEN_BID.SOURCING_RESULT`,
                form,
                dataSource: {},
                readOnly: true,
              },
              <Form layout="vertical">
                {map(filterSourceResultList, (item) => (
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
          {sourcingResultRemote
            ? sourcingResultRemote.render(
                'SSRC_OPERATE_SOURCING_RESULT_DRAWER_RENDER_EXPAND_EXTRA_NODES',
                null,
                {
                  bidFlag,
                  rfxHeaderId,
                  currentSelStatus,
                  record,
                  onRef: this.handleBindOnRef,
                  renderSubTitle,
                }
              )
            : null}
        </Spin>
      </React.Fragment>
    );
  }
}

const withStandardCompEnhancer = (Comp, type = INQUIRY) => {
  return Form.create({ fieldNameProp: null })(
    withCustomize({
      unitCode: [`SSRC.${type}_HALL.OPERATION_OPEN_BID.SOURCING_RESULT`],
    })(
      remote(
        {
          code: 'SSRC_OPERATE_SOURCING_RESULT_DRAWER',
          name: 'sourcingResultRemote',
        },
        {
          events: {
            handleClickRadio() {},
            remoteAfterConfirmAction() {},
          },
        }
      )(Comp)
    )
  );
};
const BidOperationBidModal = CombineComponent({
  sourceKey: BID,
})(withStandardCompEnhancer(SupplierRecord, BID));

export default withStandardCompEnhancer(SupplierRecord, INQUIRY);
// TODO
export { withStandardCompEnhancer, SupplierRecord, BidOperationBidModal };
