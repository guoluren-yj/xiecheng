/**
 * CalibrationManagementNot - 寻源服务/询价大厅-分标段定标管理
 * @date: 2018-12-26
 * @author: HZL <zili.hou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */

import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import {
  Row,
  Col,
  Button,
  Form,
  Tabs,
  Collapse,
  Spin,
  Icon,
  Tag,
  Modal,
  Switch,
  Tooltip,
  InputNumber,
} from 'hzero-ui';
import classnames from 'classnames';
import { map, isEmpty, isUndefined, isNull } from 'lodash';
import { Bind, Debounce } from 'lodash-decorators';
import { Header, Content } from 'components/Page';
import Lov from 'components/Lov';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import intl from 'utils/intl';
import { routerRedux } from 'dva/router';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, getCurrentUserId } from 'utils/utils';
import UploadModal from 'srm-front-boot/lib/components/Upload/index';
import { PRIVATE_BUCKET } from '_utils/config';
import { FILE_SIZE, ChunkUploadProps } from '@/utils/SsrcRegx';

import { phoneRender, numberSeparatorRender } from '@/utils/renderer';
import styles from './index.less';
import BidInfoForm from './BidInfoForm';
import BidOtherForm from './BidOtherForm';
import BidMemberForm from './BidMemberForm';
import ItemLineTable from './ItemLineTable';
import ItemLineBidTable from './ItemLineBidTable';
import Attachment from '../../components/Attachment';
import PricingModal from '../../components/PricingModal';
import IPCoincidenceRate from '../../../components/IPCoincidenceRate/index';

const { Panel } = Collapse;

@withCustomize({
  unitCode: [
    'SSRC.BID_HALL_CHECK_PRICE.TAB_PACK',
    'SSRC.BID_HALL_CHECK_PRICE.HEADER',
    'SSRC.BID_HALL_CHECK_PRICE.OTHER_INFO',
    'SSRC.BID_HALL_CHECK_PRICE.TAB_ITEM',
    'SSRC.BID_HALL_CHECK_PRICE.TAB_SUPPLIER',
    'SSRC.BID_HALL_CHECK_PRICE.TAB_SUPPLIER_READ',
    'SSRC.BID_HALL_CHECK_PRICE.TAB_ITEM_READ',
    'SSRC.BID_HALL_CHECK_PRICE.ITEM_LINE',
  ],
})
@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['ssrc.bidHall', 'ssrc.inquiryHall', 'ssrc.supplierBid'] })
@connect(({ bidHall, loading, user }) => ({
  user,
  bidHall,
  // releasebidHallLoading: loading.effects['bidHall/releasebidHall'],
  fetchbidHallUpdateLoading: loading.effects['bidHall/fetchBidHeaderDetail'],
  fetchBidMembersLoading: loading.effects['bidHall/fetchBidMembers'],
  fetchItemLineLoading: loading.effects['bidHall/fetchItemLine'],
  supplierRecordLoading: loading.effects['bidHall/supplierRecord'],
  queryCalibrationLoading: loading.effects['bidHall/fetchCalibrationQuotation'],
  saveLoading: loading.effects['bidHall/saveCalibrationManagYes'],
  submitLoading: loading.effects['bidHall/submitCalibrationManagYes'],
  fetchIPCoincidenceRateLoading: loading.effects['bidHall/fetchBidIPCoincidenceRate'],
  organizationId: getCurrentOrganizationId(),
  userId: getCurrentUserId(),
}))
export default class DiffTargetMange extends Component {
  constructor(props) {
    super(props);
    this.ItemLineTable = {};

    this.state = {
      item: {},
      expand: {}, // 展开数据
      loadingObj: {},
      activeKey: undefined,
      collapseKeys: [], // 折叠面板
      editBidMembersFlag: false, // 招标小组modal
      distributeModalVisible: false, // 物品明细分配供应商
      attachmentVisible: false, // 附件组件显示标识
      rejectRemarkVisible: false, // 中标比例模态框
      allottedRatio: {}, // 中标比例是否发生变化
      dicisionAttachmentUuid: '', // 初始化附件uuid
      pricingModalVisible: false, // 物料创建/补充弹窗
      createItemFlag: null, // 创建物料标识
      lineSupplierSaveDTOS: [], // 提交接口的参数体
      ipCoincidenceRateVisible: false, // ip重合率弹框
    };
  }

  /**
   * onCollapseChange - 折叠面板onChange
   * @param {Array<string>} collapseKeys - Panels key
   */
  @Bind()
  onCollapseChange(collapseKeys) {
    this.setState({
      collapseKeys,
    });
  }

  componentDidMount() {
    this.props.form.resetFields();
    this.fetchbidHallUpdate();
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'bidHall/updateState',
      payload: {
        header: {},
        itemLine: [],
        supplierData: [],
        bidMembersList: [],
        evaluateSectionList: [],
      },
    });
  }

  /**
   * 查询维护页面信息
   */
  @Bind()
  fetchbidHallUpdate() {
    const {
      match: { params, path },
      dispatch,
      organizationId,
    } = this.props;
    dispatch({
      type: 'bidHall/fetchBidHeaderDetail',
      payload: {
        organizationId,
        bidHeaderId: params.bidId,
        path,
        customizeUnitCode: 'SSRC.BID_HALL_CHECK_PRICE.HEADER,SSRC.BID_HALL_CHECK_PRICE.OTHER_INFO,',
      },
    }).then((res) => {
      if (res && res.dicisionAttachmentUuid) {
        this.setState({
          dicisionAttachmentUuid: res.dicisionAttachmentUuid,
        });
      }
    });
    this.fetchItemLine();
    this.queryCalibMangeYes();
    // 查询配置中心, ip重合率
    dispatch({
      type: `bidHall/querySetting`,
      payload: {
        '011107': '011107', // ip校验
      },
    });
  }

  /**
   * 物品明细 - 查询
   */
  @Bind()
  fetchItemLine() {
    const {
      match: { params },
      dispatch,
      organizationId,
    } = this.props;
    dispatch({
      type: 'bidHall/fetchItemLine',
      payload: {
        organizationId,
        bidHeaderId: params.bidId,
        customizeUnitCode: 'SSRC.BID_HALL_CHECK_PRICE.ITEM_LINE',
      },
    });
  }

  /**
   * 打开招标小组
   *
   */
  @Bind()
  editBidMembers() {
    this.fetchMembers();
    this.setState({
      editBidMembersFlag: true,
    });
  }

  // 关闭招标小组
  @Bind()
  handleMembersCancel() {
    this.setState({
      editBidMembersFlag: false,
    });
  }

  /**
   * 获取招标小组
   *
   * @memberof Update
   */
  fetchMembers() {
    const {
      dispatch,
      organizationId,
      match: { params = {}, path },
    } = this.props;

    dispatch({
      type: 'bidHall/fetchBidMembers',
      payload: { organizationId, bidHeaderId: params.bidId, path },
    });
  }

  /**
   * 是否中标Flag
   *
   */
  @Bind()
  setValue(e, item, sectionNum) {
    const { form, dispatch, organizationId, match } = this.props;
    const params = form.getFieldsValue();
    const suggestFlag = params[`value#${item.bidLineItemId}#${item.quotationHeaderId}`];
    if (suggestFlag === 0) {
      form.setFieldsValue({
        [`allottedRatio#${item.bidLineItemId}#${item.quotationHeaderId}`]: null,
      });
    }
    dispatch({
      type: 'bidHall/wholePackage',
      payload: {
        organizationId,
        allSelectFlag: 1 - suggestFlag,
        bidHeaderId: match.params.bidId,
        // bidLineSupplierId: item.bidLineSupplierId,
        quotationHeaderId: item.quotationHeaderId,
        objectVersionNumber: item.objectVersionNumber,
        supplierTenantId: item.supplierTenantId,
        allottedRatio: item.allottedRatio,
        sectionNum,
      },
    }).then((res) => {
      if (res) {
        const loadingObj = {
          [item.quotationHeaderId]: { queryCalibrationLoading: true },
        };
        this.setState({ loadingObj });
        // 查询供应商投标物料行
        dispatch({
          type: 'bidHall/fetchCalibrationQuotation',
          payload: {
            page: {},
            organizationId,
            quotationHeaderId: item.quotationHeaderId,
            bidHeaderId: params.bidId,
            sectionId: item.bidLineItemId,
            supplierCompanyId: item.supplierCompanyId,
            subjectMatterRule: item.subjectMatterRule,
            customizeUnitCode: 'SSRC.BID_HALL_CHECK_PRICE.TAB_PACK',
          },
        }).then((result) => {
          if (result) {
            this.setState({
              loadingObj: { [item.quotationHeaderId]: { queryCalibrationLoading: false } },
            });
          }
        });
        this.queryCalibMangeYes();
      }
    });
  }

  /**
   * 获取物品维度
   *
   * @memberof search
   */
  @Bind()
  queryCalibMangeYes() {
    const {
      dispatch,
      organizationId,
      match: { params = {} },
    } = this.props;

    dispatch({
      type: 'bidHall/queryCalibMangeYes',
      payload: { organizationId, bidHeaderId: params.bidId },
    }).then((res) => {
      const { activeKey } = this.state;
      if (res && activeKey === undefined) {
        this.setState({ activeKey: `${res[0].sectionId}` });
      }
    });
  }

  /**
   * 获取分页物品维度
   *
   * @memberof search
   */
  @Bind()
  changePage(page = {}, quotationHeaderId, item) {
    const { dispatch, organizationId } = this.props;
    // 查询供应商投标物料行
    dispatch({
      type: 'bidHall/fetchCalibrationQuotation',
      payload: {
        page,
        organizationId,
        quotationHeaderId,
        sectionId: item.bidLineItemId,
        supplierCompanyId: item.supplierCompanyId,
        subjectMatterRule: item.subjectMatterRule,
        customizeUnitCode: 'SSRC.BID_HALL_CHECK_PRICE.TAB_PACK',
      },
    }).then((res) => {
      if (res) {
        this.setState({ loadingObj: { [quotationHeaderId]: { queryCalibrationLoading: false } } });
      }
    });
  }

  /**
   * showUploadModal - 打开头附件上传弹窗
   */
  @Bind()
  showUploadModal(businessAttachmentUuid, techAttachmentUuid) {
    this.setState({
      AttachmentsProps: {
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-quotationheader',
        viewOnly: true,
        businessUuid: businessAttachmentUuid,
        techUuid: techAttachmentUuid,
      },
      attachmentVisible: true,
    });
  }

  /**
   * hideAttachmentsProps -  关闭头附件上传弹窗
   */
  @Bind()
  hideAttachmentsProps() {
    this.setState({ attachmentVisible: false });
  }

  /**
   * 物品明细-点击查看供应商按钮
   */
  @Bind()
  onDistributeSupplierForItemLine(record) {
    const { dispatch, organizationId } = this.props;

    if (!record) {
      return;
    }
    dispatch({
      type: 'bidHall/supplierRecord',
      payload: {
        organizationId,
        bidHeaderId: record.bidHeaderId,
        bidLineItemId: record.bidLineItemId,
      },
    });

    this.setState({ distributeModalVisible: true });
  }

  /**
   * 明细关闭查看供应商,
   * void
   * @memberof Update
   */
  @Bind()
  cancelDistribute() {
    this.setState({ distributeModalVisible: false });

    const { dispatch } = this.props;

    dispatch({
      type: 'bidHall/updateState',
      payload: {
        supplierData: [],
      },
    });
  }

  /**
   * 切换标段tabs,
   * void
   * @memberof Update
   */
  @Bind()
  changeTabs(key) {
    this.setState({
      activeKey: `${key}`,
    });
  }

  /**
   * 单标段保存
   * void
   * @memberof Update
   */
  @Bind()
  @Debounce(500)
  handleSave() {
    const {
      form,
      dispatch,
      organizationId,
      bidHall: { evaluateSectionList = [] },
    } = this.props;
    const { activeKey = undefined, allottedRatio } = this.state;
    form.validateFields((err) => {
      if (isEmpty(err)) {
        const evaluateSectionSaveList = evaluateSectionList.map((item) => {
          if (activeKey === `${item.sectionId}`) {
            const lineSupplierDdTOS = item.lineSupplierDTOS;
            return lineSupplierDdTOS;
          } else {
            return false;
          }
        });
        let lineSupplierSaveDTOS = [];
        evaluateSectionSaveList.forEach((item) => {
          if (item !== false) {
            lineSupplierSaveDTOS = item.map((a) => {
              return {
                ...a,
                suggestedFlag: this.props.form.getFieldValue(
                  `value#${a.bidLineItemId}#${a.quotationHeaderId}`
                ),
                allottedRatio:
                  allottedRatio[`${a.bidLineItemId}#${a.quotationHeaderId}`] || a.allottedRatio,
              };
            });
          }
        });
        // 校验是否有招标比例为空
        let requiredFlag = 0;
        lineSupplierSaveDTOS.forEach((value) => {
          if (value.suggestedFlag === 1 && value.allottedRatio === null) {
            requiredFlag = 1;
            return requiredFlag;
          }
        });
        if (requiredFlag === 1) {
          notification.warning({
            message: intl
              .get('ssrc.bidHall.view.message.fill.waring')
              .d('中标状态下的中标比例不能为空。'),
          });
        } else {
          dispatch({
            type: 'bidHall/saveCalibrationManagYes',
            payload: {
              lineSupplierSaveDTOS,
              organizationId,
              customizeUnitCode: 'SSRC.BID_HALL_CHECK_PRICE.TAB_PACK',
            },
          }).then((res) => {
            if (res) {
              notification.success();
              this.fetchbidHallUpdate();
              this.setState({
                expand: {},
              });
            }
          });
        }
      }
    });
  }

  /**
   * 改变中标比例保存
   * void
   * @memberof Update
   */
  @Bind()
  @Debounce(500)
  handleBlSave(item) {
    const {
      form,
      dispatch,
      match: { params },
      organizationId,
    } = this.props;
    const { allottedRatio } = this.state;
    form.validateFields((err) => {
      if (isEmpty(err)) {
        const lineSupplierSaveDTOS = [
          {
            ...item,
            suggestedFlag: this.props.form.getFieldValue(
              `value#${item.bidLineItemId}#${item.quotationHeaderId}`
            ),
            allottedRatio:
              allottedRatio[`${item.bidLineItemId}#${item.quotationHeaderId}`] ||
              item.allottedRatio,
          },
        ];
        dispatch({
          type: 'bidHall/saveCalibrationManagYes',
          payload: {
            lineSupplierSaveDTOS,
            organizationId,
            customizeUnitCode: 'SSRC.BID_HALL_CHECK_PRICE.TAB_PACK',
          },
        }).then((res) => {
          if (res) {
            notification.success();
            // this.fetchbidHallUpdate();
            // this.setState({
            //   expand: {},
            // });
            const loadingObj = {
              [item.quotationHeaderId]: { queryCalibrationLoading: true },
            };
            this.setState({ loadingObj });
            // 查询供应商投标物料行
            dispatch({
              type: 'bidHall/fetchCalibrationQuotation',
              payload: {
                page: {},
                organizationId,
                quotationHeaderId: item.quotationHeaderId,
                bidHeaderId: params.bidId,
                sectionId: item.bidLineItemId,
                supplierCompanyId: item.supplierCompanyId,
                subjectMatterRule: item.subjectMatterRule,
                customizeUnitCode: 'SSRC.BID_HALL_CHECK_PRICE.TAB_PACK',
              },
            }).then((val) => {
              if (val) {
                this.setState({
                  loadingObj: { [item.quotationHeaderId]: { queryCalibrationLoading: false } },
                });
              }
            });
          }
        });
      }
    });
  }

  /**
   * 提交当前页面标段tab
   * void
   * @memberof Update
   */
  @Bind()
  @Debounce(500)
  handleSubmit() {
    const {
      form,
      dispatch,
      organizationId,
      bidHall: { evaluateSectionList = [] },
    } = this.props;
    const { activeKey = undefined, allottedRatio, dicisionAttachmentUuid } = this.state;
    form.validateFields((err, values) => {
      if (isEmpty(err)) {
        const bidEvaluationRemark = form.getFieldValue('bidEvaluationRemark');
        const evaluateSectionSaveList = evaluateSectionList.map((item) => {
          if (activeKey === `${item.sectionId}`) {
            const lineSupplierDdTOS = item.lineSupplierDTOS;
            return lineSupplierDdTOS;
          } else {
            return false;
          }
        });
        let lineSupplierSaveDTOS = [];
        evaluateSectionSaveList.forEach((item) => {
          if (item !== false) {
            lineSupplierSaveDTOS = item.map((a) => {
              return {
                ...a,
                suggestedFlag: this.props.form.getFieldValue(
                  `value#${a.bidLineItemId}#${a.quotationHeaderId}`
                ),
                allottedRatio:
                  allottedRatio[`${a.bidLineItemId}#${a.quotationHeaderId}`] || a.allottedRatio,
                dicisionAttachmentUuid,
                bidEvaluationRemark,
              };
            });
          }
        });
        const submit = () => {
          dispatch({
            type: 'bidHall/submitCalibrationManagYes',
            payload: {
              lineSupplierSaveDTOS: map(lineSupplierSaveDTOS, (r) => ({
                dicisionAttachmentUuid,
                ...r,
                ...values, // 表单支
              })),
              organizationId,
              customizeUnitCode: 'SSRC.BID_HALL_CHECK_PRICE.HEADER',
            },
          }).then((res) => {
            if (res) {
              this.setState({
                lineSupplierSaveDTOS,
              });
              this.handleAfterSubmit(res); // add 校验物料规则
            }
          });
        };

        // 校验是否有招标比例为空
        let requiredFlag = 0;
        lineSupplierSaveDTOS.forEach((value) => {
          if (value.suggestedFlag === 1 && value.allottedRatio === null) {
            requiredFlag = 1;
            return requiredFlag;
          }
        });
        if (requiredFlag === 1) {
          notification.warning({
            message: intl
              .get(`ssrc.bidHall.model.message.bidRateNotBeNull`)
              .d('中标状态下的中标比例不能为空。'),
          });
        } else {
          dispatch({
            type: 'bidHall/validateDiffBeforeSubmit',
            payload: {
              dicisionAttachmentUuid,
              lineSupplierSaveDTOS,
              organizationId,
            },
          }).then((res) => {
            if (res.supplierStageAllowSource) {
              Modal.confirm({
                content: `${intl
                  .get('ssrc.inquiryHall.view.msg.lifeCycleStateInvalidateBid')
                  .d('中标供应商存在非合格供应商，请确认是否提交定标?')}`,
                onOk: () => submit(),
                onCancel: () => {},
              });
            } else {
              submit();
            }
          });
        }
      }
    });
  }

  /**
   * 定标_分标段提交通用处理程序
   * */
  handleAfterSubmit(res = {}) {
    const { dispatch } = this.props;
    const { createItemFlag = null } = res;

    switch (createItemFlag) {
      case 0: // 不可以创建/补充
        this.setState({
          createItemFlag,
          pricingModalVisible: false,
        });
        notification.success();
        dispatch(
          routerRedux.push({
            pathname: `/ssrc/bid-hall/list`,
          })
        );
        break;
      case 1: // 可创建物料编码
        this.setState({
          createItemFlag,
          pricingModalVisible: true,
        });
        break;
      case 2: // 可补充物料编码
        this.setState({
          createItemFlag,
          pricingModalVisible: true,
        });
        break;
      case 3: // 必须补充物料编码
        this.setState({
          createItemFlag,
          pricingModalVisible: true,
        });
        break;
      default:
        this.setState({
          createItemFlag,
          pricingModalVisible: false,
        });
        break;
    }
  }

  /**
   * 隐藏中心弹窗
   */
  @Bind()
  handleHideModal() {
    this.setState({ pricingModalVisible: false });
  }

  /*
   * IP重合率弹框-打开
   */
  @Bind()
  openIPCoincidenceRateModal() {
    const {
      dispatch,
      match: { params },
    } = this.props;
    this.setState({
      ipCoincidenceRateVisible: true,
    });
    dispatch({
      type: 'bidHall/fetchBidIPCoincidenceRate',
      payload: {
        bidHeaderId: params.bidId,
      },
    });
  }

  /**
   * IP重合率弹框- 关闭
   */
  @Bind()
  confirmIpCoincidenceRate() {
    this.setState({
      ipCoincidenceRateVisible: false,
    });
    this.props.dispatch({
      type: 'bidHall/updateState',
      payload: {
        ipCoincidenceRate: [],
      },
    });
  }

  /**
   * 渲染标段tabs
   */
  @Bind()
  renderTabs() {
    const {
      saveLoading,
      bidHall: { evaluateSectionList = [], settings = {} },
    } = this.props;
    const { activeKey = undefined } = this.state;
    return (
      <div>
        <Tabs
          onChange={this.changeTabs}
          animated={false}
          activeKey={activeKey}
          className={styles.tabStyle}
          tabBarExtraContent={
            +settings['011107']?.settingValue ? (
              <Fragment>
                <a onClick={this.openIPCoincidenceRateModal}>
                  {intl.get('ssrc.bidHall.view.button.IPCoincidenceRate').d('IP重合率')}
                </a>
                <Button
                  style={{ marginLeft: '16px' }}
                  type="primary"
                  onClick={this.handleSave}
                  loading={saveLoading}
                >
                  {intl.get('hzero.common.button.save').d('保存')}
                </Button>
              </Fragment>
            ) : (
              ''
            )
          }
        >
          {/* 循环标段数据,渲染tabs标段 */}
          {map(evaluateSectionList, (item) => {
            return (
              <Tabs.TabPane tab={this.renderTooTipTabs(item)} key={item.sectionId}>
                {this.renderSupplier(item)}
              </Tabs.TabPane>
            );
          })}
        </Tabs>
      </div>
    );
  }

  /**
   * 渲染供应商维度
   *
   */
  @Bind()
  renderSupplier(supplier) {
    const { expand, loadingObj = {} } = this.state;
    const {
      bidHall: { calibQuotationList = [], header = {} },
      customizeTable,
    } = this.props;
    const ItemLineBidTableProps = {
      header,
      calibQuotationList,
      loadingObj,
      customizeTable,
      onSearch: this.changePage,
      handleQuotationDetail: this.handleQuotationDetail,
    };

    return (
      <div>
        {map(supplier.lineSupplierDTOS, (item) => {
          const { quotationHeaderId, bidLineItemId } = item;
          return (
            <div>
              <div
                onClick={(e) => this.expandItemLine(e, quotationHeaderId, item)}
                className={styles.arrowStyle}
              >
                {this.renderSupplierHeaderInfo(item, supplier?.sectionNum)}
              </div>
              <div>
                {expand[`${item.bidLineItemId}#${quotationHeaderId}`] && (
                  <ItemLineBidTable
                    {...ItemLineBidTableProps}
                    item={item}
                    quotationHeaderId={quotationHeaderId}
                    supplierCompanyId={item.supplierCompanyId}
                    sectionId={bidLineItemId}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  /**
   * 点击头标签-停止折叠面板冒泡行为
   */
  @Bind()
  rfxLineTag(e) {
    // 如果提供了事件对象，则这是一个非IE浏览器
    if (e && e.stopPropagation) {
      // 因此它支持W3C的stopPropagation()方法
      e.stopPropagation();
    } else {
      // 否则，我们需要使用IE的方式来取消事件冒泡
      window.event.cancelBubble = true;
    }
  }

  /**
   *阻止供应商头部查看附件冒泡
   */
  @Bind()
  rfxSupplierTag(e) {
    // 如果提供了事件对象，则这是一个非IE浏览器
    if (e && e.stopPropagation) {
      // 因此它支持W3C的stopPropagation()方法
      e.stopPropagation();
    } else {
      // 否则，我们需要使用IE的方式来取消事件冒泡
      window.event.cancelBubble = true;
    }
  }

  /**
   * 打开中标比例模态框
   */
  @Bind()
  goRejectDetail(item) {
    this.setState({ rejectRemarkVisible: true, item });
  }

  /**
   * 中标比例模态框
   */
  @Bind()
  showAllottedModel() {
    const {
      form: { getFieldDecorator, getFieldValue },
    } = this.props;
    const { rejectRemarkVisible, item, allottedRatio } = this.state;
    let mean = '';
    mean = (
      <Modal
        visible={rejectRemarkVisible}
        width={325}
        okText={intl.get('hzero.common.button.save').d('保存')}
        onOk={() => this.saveAllottedRatio(item)}
        onCancel={this.hideRejectRemarkModal}
      >
        <Form>
          <Row gutter={48}>
            <Col span={24}>
              <Form.Item
                label={intl
                  .get(`ssrc.bidHall.model.bidHall.inputAllottedRatio`)
                  .d('请输入中标比例')}
                labelCol={{ span: 9 }}
                wrapperCol={{ span: 15 }}
                style={{ marginTop: '16px' }}
              >
                {getFieldDecorator(
                  `allottedRatio#${item.bidLineItemId}#${item.quotationHeaderId}`,
                  {
                    initialValue:
                      allottedRatio[`${item.bidLineItemId}#${item.quotationHeaderId}`] ||
                      item.allottedRatio,
                    rules: [
                      {
                        required:
                          getFieldValue(`value#${item.bidLineItemId}#${item.quotationHeaderId}`) ===
                          1,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`ssrc.bidHall.model.bidHall.inputAllottedRatio`)
                            .d('请输入中标比例'),
                        }),
                      },
                    ],
                  }
                )(<InputNumber style={{ width: '100%' }} min={0} max={100} precision={2} />)}
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
    return mean;
  }

  /**
   * 保存中标比例模态框
   */
  @Bind()
  saveAllottedRatio(item) {
    const { form } = this.props;
    const { allottedRatio } = this.state;
    form.validateFields((err) => {
      if (isEmpty(err)) {
        this.setState(
          {
            allottedRatio: {
              ...allottedRatio,
              [`${item.bidLineItemId}#${item.quotationHeaderId}`]: this.props.form.getFieldValue(
                `allottedRatio#${item.bidLineItemId}#${item.quotationHeaderId}`
              ),
            },
            rejectRemarkVisible: false,
          },
          () => this.handleBlSave(item)
        );
      }
    });
  }

  /**
   * 隐藏中标比例模态框
   */
  @Bind()
  hideRejectRemarkModal() {
    this.setState({ rejectRemarkVisible: false, item: {} });
  }

  /**
   * 中标比例显示段
   */
  @Bind()
  headerAllottedRatio(item) {
    const { allottedRatio } = this.state;
    const allottedRatioRequired = intl
      .get(`ssrc.bidHall.model.bidHall.allottedRatio`)
      .d('中标比例');
    const value = this.props.form.getFieldValue(
      `value#${item.bidLineItemId}#${item.quotationHeaderId}`
    );
    if (value === 1) {
      let mean = '';
      if (allottedRatio[`${item.bidLineItemId}#${item.quotationHeaderId}`]) {
        mean = (
          <span className={styles.showAllottedRatio}>
            <a onClick={() => this.goRejectDetail(item)}>
              {allottedRatio[`${item.bidLineItemId}#${item.quotationHeaderId}`]}
              {'%'}
            </a>
          </span>
        );
      } else if (item.allottedRatio) {
        mean = (
          <span className={styles.showAllottedRatio}>
            <a onClick={() => this.goRejectDetail(item)}>
              {item.allottedRatio}
              {'%'}
            </a>
          </span>
        );
      } else {
        mean = (
          <span className={styles.showAllottedRatio}>
            <a onClick={() => this.goRejectDetail(item)}>{allottedRatioRequired}</a>
          </span>
        );
      }
      return mean;
    } else {
      let mean = '';
      mean = <span className={styles.showAllottedRatio} />;
      return mean;
    }
  }

  /**
   * 供应商头部明细
   */
  @Bind()
  renderSupplierHeaderInfo(item, sectionNum) {
    const {
      form: { getFieldDecorator },
    } = this.props;
    const { expand } = this.state;
    const scoreName = intl.get(`ssrc.bidHall.model.bidHall.scoreName`).d('总分');
    const sumPrice = intl.get(`ssrc.bidHall.model.bidHall.sumPrice`).d('投标总价');
    const candidate = intl.get(`ssrc.bidHall.model.bidHall.candidatePeople`).d('候选人');
    return (
      <div className={styles.itemList}>
        <div className={styles.itemListHeaderInfo}>
          <div className={styles.itemListHeader} style={{ width: '102%' }}>
            <div className={styles.itemListNum}>
              <div>
                <img src={require('@/assets/supplier.svg')} alt="" />
              </div>
              <div className={styles.itemListNumLeft}>
                <Tooltip title={`${item.supplierCompanyName}`} placement="topLeft">
                  {item.supplierCompanyNum ? `${item.supplierCompanyNum}-` : null}
                  {item.supplierCompanyName}
                </Tooltip>
              </div>
              <div className={styles.itemListNumRight}>
                <Icon
                  className="arrowIcon"
                  type={!expand[`${item.bidLineItemId}#${item.quotationHeaderId}`] ? 'down' : 'up'}
                  onClick={(e) => this.expandItemLine(e, item.quotationHeaderId, item)}
                />
              </div>
            </div>
            {item.sumScore ? (
              <span style={{ width: '80px', display: 'inline-block', marginRight: '8px' }}>
                <Tag
                  style={{ background: 'rgba(241, 49, 49, 0.2)', border: '0', color: '#F13131' }}
                >
                  {scoreName}
                  {item.sumScore}
                </Tag>
              </span>
            ) : (
              <span style={{ width: '80px', display: 'inline-block', marginRight: '8px' }}>
                {''}
              </span>
            )}
            {item.sumPrice ? (
              <span style={{ width: '100px', display: 'inline-block', marginRight: '8px' }}>
                <Tag
                  style={{ background: 'rgba(255, 188, 0, 0.2)', border: '0', color: '#FFBC00' }}
                >
                  {sumPrice}
                  {numberSeparatorRender(item.sumPrice)}
                </Tag>
              </span>
            ) : (
              <span style={{ width: '100px', display: 'inline-block', marginRight: '8px' }}>
                {''}
              </span>
            )}
            <span>
              {item.candidateFlag === 1 ? (
                <span
                  style={{
                    width: '80px',
                    display: 'inline-block',
                    marginRight: '8px',
                    height: '22px',
                  }}
                >
                  <img src={require('@/assets/candidate.svg')} alt="" />
                  <span className={styles.allottedRatio}>{candidate}</span>
                </span>
              ) : (
                <span style={{ width: '80px', display: 'inline-block', marginRight: '8px' }}>
                  {''}
                </span>
              )}
            </span>
            {item.contactName ? (
              <Tooltip title={`${item.contactName}`} placement="topLeft">
                <span className={styles.contactNameStyle}>{item.contactName}</span>
              </Tooltip>
            ) : (
              <span style={{ marginRight: '5px' }} />
            )}
            {item.contactMobilephone ? (
              <Tooltip
                title={phoneRender(item.internationalTelCodeMeaning, item.contactMobilephone)}
                placement="topLeft"
              >
                <span className={styles.contactMobilephoneStyle}>
                  {phoneRender(item.internationalTelCodeMeaning, item.contactMobilephone)}
                </span>
              </Tooltip>
            ) : (
              <span style={{ marginRight: '5px' }} />
            )}
            {item.contactMail ? (
              <Tooltip title={`${item.contactMail}`} placement="topLeft">
                <span className={styles.contactMailStyle}>{item.contactMail}</span>
              </Tooltip>
            ) : (
              <span style={{ marginRight: '5px' }} />
            )}
            {item.validBusinessAttachmentUuid || item.validTechAttachmentUuid ? (
              <span onClick={(e) => this.rfxLineTag(e)}>
                <a
                  onClick={() =>
                    this.showUploadModal(
                      item.validBusinessAttachmentUuid,
                      item.validTechAttachmentUuid
                    )
                  }
                >
                  <span>{intl.get(`ssrc.bidHall.view.message.attachment`).d('附件')}</span>
                  <span style={{ marginLeft: '7px' }}>
                    <img src={require('@/assets/file.svg')} alt="" />
                  </span>
                </a>
              </span>
            ) : (
              <span style={{ width: '40px', display: 'inline-block' }} />
            )}
            <span className={styles.itemListTag} onClick={(e) => this.rfxLineTag(e)}>
              <Form.Item
                className={styles.wholePackageStyle}
                label={intl.get(`ssrc.bidHall.model.bidHall.wholeWinBid`).d('整包中标')}
              >
                {getFieldDecorator(`value#${item.bidLineItemId}#${item.quotationHeaderId}`, {
                  initialValue: item.suggestedFlag,
                })(
                  <Switch
                    checkedValue={1}
                    unCheckedValue={0}
                    onChange={(e) => this.setValue(e, item, sectionNum)}
                  />
                )}
              </Form.Item>
              {this.headerAllottedRatio(item)}
            </span>
          </div>
          <div style={{ clear: 'both' }} />
        </div>
      </div>
    );
  }

  /**
   *展开时重新调用单独查询投标物料行列表数据
   */
  expandItemLine = (e, quotationHeaderId, item) => {
    const {
      match: { params },
      dispatch,
      organizationId,
    } = this.props;
    e.stopPropagation();
    const { expand } = this.state;
    const currentStatus = expand[`${item.bidLineItemId}#${quotationHeaderId}`];
    if (!currentStatus) {
      const loadingObj = {
        [quotationHeaderId]: { queryCalibrationLoading: true },
      };
      this.setState({ loadingObj });
      // 查询供应商投标物料行
      dispatch({
        type: 'bidHall/fetchCalibrationQuotation',
        payload: {
          page: {},
          organizationId,
          quotationHeaderId,
          bidHeaderId: params.bidId,
          sectionId: item.bidLineItemId,
          supplierCompanyId: item.supplierCompanyId,
          subjectMatterRule: item.subjectMatterRule,
          customizeUnitCode: 'SSRC.BID_HALL_CHECK_PRICE.TAB_PACK',
        },
      }).then((res) => {
        if (res) {
          this.setState({
            loadingObj: { [quotationHeaderId]: { queryCalibrationLoading: false } },
          });
        }
      });
    }
    this.setState({
      expand: {
        ...expand,
        [`${item.bidLineItemId}#${item.quotationHeaderId}`]: !expand[
          `${item.bidLineItemId}#${item.quotationHeaderId}`
        ],
      },
    });
  };

  /**
   * 浮动文字tabs
   */
  @Bind()
  renderTooTipTabs = (item) => {
    return (
      <Tooltip title={`${item.sectionNum}--${item.sectionName}`} placement="topLeft">
        {item.sectionName}
      </Tooltip>
    );
  };

  // 获取uuid
  @Bind()
  handleAttachment(uuid) {
    this.setState({
      dicisionAttachmentUuid: uuid,
    });
  }

  /**
   * 定标管理转交
   */
  @Bind()
  transferCalibration(record) {
    const {
      dispatch,
      match: { params },
    } = this.props;
    Modal.confirm({
      title: intl
        .get('ssrc.bidHall.model.bidHall.transferCalibrationMsg', {
          name: `${record.realName}`,
        })
        .d(`是否将定标权限转交给${record.realName}?`),
      onOk: () => {
        dispatch({
          type: 'bidHall/transferCalibration',
          payload: {
            bidHeaderId: params.bidId,
            memberUserId: record.id,
            memberUserName: record.realName,
          },
        }).then((res) => {
          if (res) {
            notification.success();
            dispatch(
              routerRedux.push({
                pathname: `/ssrc/bid-hall/list`,
              })
            );
            this.setState({ expand: {} });
          }
        });
      },
    });
  }

  render() {
    const {
      form,
      match,
      match: { params = {} },
      dispatch,
      saveLoading,
      submitLoading,
      organizationId,
      fetchItemLineLoading,
      supplierRecordLoading,
      fetchBidMembersLoading,
      fetchbidHallUpdateLoading,
      fetchIPCoincidenceRateLoading,
      bidHall: {
        header = {},
        itemLine = [],
        supplierData = [],
        bidMembersList = [],
        code: { sourceMethods = [], quotationTypes = [], sourceStages = [] },
        ipCoincidenceRate = [],
      },
      customizeTable,
      customizeForm,
    } = this.props;

    const {
      activeKey,
      allottedRatio,
      collapseKeys,
      attachmentVisible,
      AttachmentsProps,
      editBidMembersFlag,
      rejectRemarkVisible,
      distributeModalVisible,
      dicisionAttachmentUuid,
      pricingModalVisible = false,
      createItemFlag = null,
      lineSupplierSaveDTOS = [],
      ipCoincidenceRateVisible,
    } = this.state;

    // 基本信息props
    const infoProps = {
      header,
      organizationId,
      form,
      match,
      sourceMethods,
      quotationTypes,
      sourceStages,
      changeTemplateId: this.changeTemplateId,
      changeSourceMethod: this.changeSourceMethod,
      changeSubjectMatterRule: this.changeSubjectMatterRule,
      editBidMembers: this.editBidMembers,
      customizeForm,
    };

    // other props
    const otherProps = {
      header,
      organizationId,
      form,
      changeBidSourcePlan: this.changeBidSourcePlan,
      changeProjectInfo: this.changeProjectInfo,
      changePaymentType: this.changePaymentType,
      customizeForm,
    };

    // 物品明细
    const ItemLineTableProps = {
      match,
      dispatch,
      organizationId,
      supplierRecordLoading,
      subjectMatterRule: header.subjectMatterRule,
      loading: fetchItemLineLoading,
      dataSource: itemLine,
      onDistributeSupplierForItemLine: this.onDistributeSupplierForItemLine,
      cancelDistribute: this.cancelDistribute,
      distributeModalVisible,
      supplierData,
      onChangeTableData: this.changeItemLineTableData,
      customizeTable,
    };

    // bid member props
    const bidMemberProps = {
      form,
      header,
      organizationId,
      bidMembersList,
      editBidMembersFlag,
      fetchBidMembersLoading,
      onMembersCancel: this.handleMembersCancel,
    };

    // 附件组件
    const uploadModalProps = {
      tenantId: organizationId,
      filePreview: true,
      btnProps: {
        icon: 'paper-clip',
      },

      btnText: intl.get(`ssrc.bidHall.view.message.title.attachment`).d('上传附件'),
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-bid-header',
      attachmentUUID:
        isUndefined(header.dicisionAttachmentUuid) || isNull(header.dicisionAttachmentUuid)
          ? dicisionAttachmentUuid
          : header.dicisionAttachmentUuid,
      showFilesNumber: false,
      afterOpenUploadModal: this.handleAttachment,
      ...(ChunkUploadProps || {}),
      fileSize: FILE_SIZE,
    };

    // 核价中心弹窗model props
    const PricingCenterModalProp = {
      header,
      activeKey,
      allottedRatio,
      createItemFlag,
      lineSupplierSaveDTOS,
      dicisionAttachmentUuid,
      bidHeaderId: params.bidId,
      sectionFlag: 1,
      visible: pricingModalVisible,
      onCancel: this.handleHideModal,
      title:
        createItemFlag === 1
          ? intl.get('ssrc.bidHall.view.modalTitle.createMaterial').d('创建物料')
          : intl.get('ssrc.bidHall.view.modalTitle.updateMaterial').d('补充物料'),
    };

    const ipCoincidenceRateProps = {
      visible: ipCoincidenceRateVisible,
      dataSource: ipCoincidenceRate,
      loading: fetchIPCoincidenceRateLoading,
      onConfirmIpCoincidenceRate: this.confirmIpCoincidenceRate,
    };

    return (
      <React.Fragment>
        {match.path !== '/pub/ssrc/bid-hall/calibration-managementyes/:bidId' ? (
          <Header
            backPath="/ssrc/bid-hall/list"
            title={intl.get(`ssrc.bidHall.view.message.title.CalibrationManagement`).d('定标管理')}
          >
            <Button
              icon="rocket"
              type="primary"
              loading={saveLoading || submitLoading}
              onClick={this.handleSubmit}
            >
              {intl.get('hzero.common.button.submit').d('提交')}
            </Button>
            <UploadModal {...uploadModalProps} />
            <Lov
              isButton
              type="default"
              onOk={this.transferCalibration}
              queryParams={{
                organizationId,
              }}
              code="HIAM.TENANT.USER"
            >
              {intl.get(`ssrc.bidHall.view.button.transferCalibration`).d('转交')}
            </Lov>
          </Header>
        ) : (
          ''
        )}

        <Content className={styles.contentInfo}>
          <Spin
            spinning={fetchbidHallUpdateLoading}
            wrapperClassName={classnames(styles['page-content'], 'ued-detail-wrapper')}
          >
            <Collapse className="form-collapse" onChange={this.onCollapseChange}>
              <Panel
                showArrow={false}
                header={
                  <>
                    <h3>
                      {header.bidNum}-{header.bidTitle}
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
                <Tabs defaultActiveKey="baseInfos" animated={false}>
                  <Tabs.TabPane
                    tab={intl.get(`ssrc.bidHall.view.tab.baseInfos`).d('基本信息')}
                    key="baseInfos"
                  >
                    <BidInfoForm {...infoProps} />
                  </Tabs.TabPane>
                  <Tabs.TabPane
                    tab={intl.get(`ssrc.bidHall.view.tab.otherInfos`).d('其他信息')}
                    key="otherInfos"
                    forceRender
                  >
                    <BidOtherForm {...otherProps} />
                  </Tabs.TabPane>
                  <Tabs.TabPane
                    tab={intl.get(`ssrc.bidHall.view.message.view.itemLineDetail`).d('物品明细')}
                    key="itemDetails"
                    forceRender
                  >
                    <ItemLineTable {...ItemLineTableProps} />
                  </Tabs.TabPane>
                </Tabs>
              </Panel>
            </Collapse>
            <div>{this.renderTabs()}</div>
          </Spin>
          {rejectRemarkVisible && this.showAllottedModel()}
        </Content>
        <BidMemberForm {...bidMemberProps} />
        <Modal
          destroyOnClose
          visible={attachmentVisible}
          footer={null}
          onCancel={this.hideAttachmentsProps}
          width={800}
        >
          <Attachment {...AttachmentsProps} />
        </Modal>
        {pricingModalVisible && <PricingModal {...PricingCenterModalProp} />}
        {ipCoincidenceRateVisible && <IPCoincidenceRate {...ipCoincidenceRateProps} />}
      </React.Fragment>
    );
  }
}
