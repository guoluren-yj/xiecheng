/**
 * OperationBid - 开标弹框modal
 * @date: 2020-12-29
 * @author: lzj<zhijian.li@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 * */

import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { map, isFunction, isArray, isObject } from 'lodash';
import remote from 'hzero-front/lib/utils/remote';

import { DataSet, Modal, Tooltip } from 'choerodon-ui/pro';
import { Radio, Form, Row, Col } from 'hzero-ui';
import { Spin } from 'choerodon-ui';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import notification from 'utils/notification';
import { getResponse, getCurrentUser } from 'utils/utils';
import { queryMapIdpValue } from 'services/api';

import { sendExpertScore, startNextRfxStatus } from 'srm-front-ssrc/lib/services/inquiryHallService';
import { abandonRemarkRender } from 'srm-front-ssrc/lib/utils/renderer';
import { INQUIRY, BID, getQuotationName } from 'srm-front-ssrc/lib/utils/globalVariable';
import CombineComponent from 'srm-front-ssrc/lib/routes/components/CombineComponent';
import { checkPermission } from 'srm-front-ssrc/lib/services/inquiryHallNewService';
import closeRFX from 'srm-front-ssrc/lib/routes/ssrc/InquiryHallNew/CloseRfxDrawer';
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
    // TODO 二开调试：打印下发专家评分接口入参/返回，调试完可删除
    // eslint-disable-next-line no-console
    console.log('[cux-开标] 调用 sendExpertScore', newParams);
    const response = await sendExpertScore(newParams);
    const result = getResponse(response);
    // eslint-disable-next-line no-console
    console.log('[cux-开标] sendExpertScore 返回', { response, result });
    if (result && !result.failed) {
      this.afterAction();
    } else {
      throw new Error('sendExpertScore failed');
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
    // TODO 二开调试：打印成功回调链路，调试完可删除
    // eslint-disable-next-line no-console
    console.log('[cux-开标] afterAction 成功，关闭弹框', { currentSelStatus });
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
    const { sourceKey, record } = this.props;
    const bidFlag = sourceKey === 'BID';
    // 二开：商务/技术附件仅寻源行创建人可见，取寻源行的 createdBy 与当前用户 id 比较
    const createdBy =
      record && (isFunction(record.get) ? record.get('createdBy') : record.createdBy);
    // 二开：行数据里的 createdBy 可能是加密后的用户 id，这里同时兼容加密 id（encryptId）和明文 id
    const currentUser = getCurrentUser() || {};
    const currentUserIds = [currentUser.id, currentUser.encryptId]
      .filter((id) => id !== undefined && id !== null && id !== '')
      .map((id) => String(id));
    const isCreator =
      createdBy !== undefined &&
      createdBy !== null &&
      currentUserIds.includes(String(createdBy));

    const tableProps = {
      bidFlag,
      tableDs: this.tableDs,
      isCreator,
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
   * 二开：切换“下发专家评分”时，同步技术附件（下发评分人）的必填标识
   * @param {boolean} required - 是否必填
   */
  @Bind()
  setScoreAttachmentRequired(required) {
    const field = this.tableDs.getField('attributeVarchar11');
    if (!field) return;
    field.set('required', required);
    if (!required) {
      this.tableDs.forEach((record) => {
        // eslint-disable-next-line no-unused-expressions
        isFunction(record.clearValidationError) &&
          record.clearValidationError('attributeVarchar11');
      });
    }
    // 记录必填状态，供表格列渲染“必填”标识
    this.setState({ scoreAttachmentRequired: required });
    // eslint-disable-next-line no-console
    console.log('[cux-开标] 技术附件（下发评分人）必填状态', {
      required,
      fieldRequired: field.get('required'),
    });
  }

  /**
   * 二开：判断附件字段值是否为空
   * 附件字段的 value 是 uuid 字符串，兼容后端返回空数组/空对象的情况
   * @param {*} value - 附件字段值
   */
  isEmptyAttachment = (value) =>
    value === undefined ||
    value === null ||
    value === '' ||
    (isArray(value) && value.length === 0) ||
    (isObject(value) && Object.keys(value).length === 0);

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
    // TODO 二开调试：打印执行结果表单字段值，调试完可删除
    /* eslint-disable no-console */
    const tableData = this.tableDs.toData();
    console.log('[cux-开标] 执行结果变更', {
      currentSelStatus: e.target.value,
      formFields:
        this.props.form && isFunction(this.props.form.getFieldsValue)
          ? this.props.form.getFieldsValue()
          : undefined,
      tableData,
      scoreAttachments: tableData.map((item) => item.attributeVarchar11),
    });
    /* eslint-enable no-console */
    // 二开：选中“下发专家评分”时，技术附件（下发评分人）必填
    this.setScoreAttachmentRequired(e.target.value === 'SCORING_PENDING');
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
    // TODO 二开调试：打印确定按钮执行链路，调试完可删除
    /* eslint-disable no-console */
    const submitTableData = this.tableDs.toData();
    console.log('[cux-开标] handleSubmit 入口', {
      currentSelStatus,
      rfxHeaderId,
      tableData: submitTableData,
      scoreAttachments: submitTableData.map((item) => item.attributeVarchar11),
    });
    /* eslint-enable no-console */
    // 缓存弹框关闭前数据
    this.cacheExpendNodeRef = { ...(this.cacheExpendNodeRef || {}), expandNodeRef };
    switch (currentSelStatus) {
      case 'CLOSED':
        // eslint-disable-next-line no-console
        console.log('[cux-开标] 命中分支：关闭询价单');
        closeRFX(
          rfxHeaderId,
          this.afterAction,
          documentTypeName,
          sourceKey,
          serviceChargeFlag,
          sourcingResultRemote
        );
        break;
      case 'SCORING_PENDING': {
        // 二开：下发专家评分前校验技术附件（下发评分人）必填
        this.setScoreAttachmentRequired(true);
        // 注意：DataSet.validate 默认只校验处于非 sync 状态（新增/修改）的行，
        // 查询出来的行状态是 sync，直接 validate() 不会校验必填，所以逐行判断
        const invalidRecords = [];
        this.tableDs.forEach((record) => {
          const value = isFunction(record.get) ? record.get('attributeVarchar11') : null;
          if (this.isEmptyAttachment(value)) {
            invalidRecords.push(record);
          }
        });
        // eslint-disable-next-line no-console
        console.log('[cux-开标] 下发专家评分校验', {
          invalidRows: invalidRecords.length,
          totalRows: this.tableDs.length,
        });
        if (invalidRecords.length) {
          // 强制校验未上传附件的行，单元格标红
          await Promise.all(invalidRecords.map((record) => record.validate(true)));
          notification.warning({
            message: intl
              .get('ssrc.inquiryHall.view.message.scoreAttachmentRequired')
              .d('请先上传技术附件（下发评分人）'),
          });
          // 抛错由调用方（index.js 的 onOk）捕获后 return false，阻止弹框关闭
          throw new Error('scoreAttachmentRequired');
        }
        // 二开：接口失败要抛出去，阻止弹框静默关闭
        await this.onSendExpertScore();
        break;
      }
      case 'PRETRIAL_PENDING':
      case 'CHECK_PENDING':
      case 'OPEN_BID_PENDING':
        // eslint-disable-next-line no-console
        console.log('[cux-开标] 命中分支：开始下一状态', currentSelStatus);
        // 二开：接口失败要抛出去，阻止弹框静默关闭
        await this.onStartNextRfxStatus(currentSelStatus);
        break;
      default:
        // 二开：未选择执行结果时不再静默关闭弹框，避免“点确定什么都没发生就关了”
        // eslint-disable-next-line no-console
        console.warn('[cux-开标] 未选择执行结果，未调用任何接口', {
          currentSelStatus,
          sourceResultList: this.state.sourceResultList,
        });
        notification.warning({
          message: intl.get('ssrc.inquiryHall.view.message.selectSourcingResult').d('请选择执行结果'),
        });
        throw new Error('currentSelStatusRequired');
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
    // TODO 二开调试：打印 next 接口入参/返回，调试完可删除
    // eslint-disable-next-line no-console
    console.log('[cux-开标] 调用 startNextRfxStatus', {
      organizationId,
      rfxHeaderId,
      rfxStatus: currentSelStatus,
    });
    const response = await startNextRfxStatus({
      organizationId,
      rfxHeaderId,
      rfxStatus: currentSelStatus,
    });
    const result = getResponse(response);
    // eslint-disable-next-line no-console
    console.log('[cux-开标] startNextRfxStatus 返回', { response, result });
    if (result && !result.failed) {
      this.afterAction();
    } else {
      // 二开：接口失败时抛错，由调用方阻止弹框关闭，避免“没调通也直接关掉”
      throw new Error('startNextRfxStatus failed');
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
