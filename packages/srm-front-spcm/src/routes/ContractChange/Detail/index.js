/*
 * ContractMaintainDetail - 协议维护详情
 * @date: 2019-05-14
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
import { Button, Spin, Modal, Row, Col, Anchor, Affix, Card, Tabs, Popover } from 'hzero-ui';
import { connect } from 'dva';
import { isNumber, isEmpty, omit, merge, isArray, get, isString, map } from 'lodash';
import classnames from 'classnames';
import { Bind } from 'lodash-decorators';
import uuid from 'uuid/v4';
import { routerRedux } from 'dva/router';
import querystring from 'querystring';
// import withCustomize from 'srm-front-cuz';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import Upload from 'srm-front-boot/lib/components/Upload';
import remote from 'utils/remote';
import moment from 'moment';
import ComUpload from '@/routes/components/ComUpload';
import PreferentialRule from '@/routes/components/PreferentialRule';

import { Header, Content } from 'components/Page';
import { Button as PermissionButton } from 'components/Permission';
import {
  getEditTableData,
  getCurrentOrganizationId,
  addItemToPagination,
  createPagination,
  delItemsToPagination,
  addItemsToPagination,
  getAccessToken,
  getResponse,
} from 'utils/utils';
import { HZERO_FILE } from 'utils/config';
import intl from 'utils/intl';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  DEFAULT_DATETIME_FORMAT,
  DEFAULT_DATE_FORMAT,
  DETAIL_DEFAULT_CLASSNAME,
  DETAIL_CARD_CLASSNAME,
} from 'utils/constants';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';
import { fetchContractOnlineHTMLType, fetchWpsV5TextPreView } from '@/services/editorOnlineService';

import { allSignList } from '@/utils/util';
import styles from './index.less';
import ContractHeader from '../../components/ContractHeader';
// eslint-disable-next-line import/no-named-as-default
import ContractSubject from '../../components/ContractSubject';
import ContractStage from '../../components/ContractStage';
import ContractPartner from '../../components/ContractPartner';
import ContractBusinessTerms from '../../components/ContractBusinessTerms';
import ContractRebate from '../../components/ContractRebate';
import OperationRecordDrawer from '../../components/OperationRecordDrawer';
import EditorOnline from '../../components/EditorOnline';
import Attachment from '../../components/Upload';
import Icons from '../../components/Icons';
import TerminateReasonModal from '../TerminateReasonModal';
import ApproveRecord from '../../components/ApproveRecord';
import TextComparisonModal from '../../components/TextComparisonModal';
import ContractReplenish from '../../components/ContractReplenish';

const { Link } = Anchor;
const { TabPane } = Tabs;

/**
 * ContractMaintainDetail - 协议维护详情
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {!Object} [contractMaintain={}] - 数据源
 * @reactProps {boolean} [getHeaderAttachmentUuidLoading=false] - 获取附件uuid处理中
 * @reactProps {boolean} [deleteDetailLinesLoading=false] - 删除明细行处理中
 * @reactProps {boolean} [submitDeliveryLoading=false] - 提交送货单处理中
 * @reactProps {boolean} [deleteDeliveryLoading=false] - 删除送货单处理中
 * @reactProps {boolean} [queryCreateListLoading=false] - 查询可创建行处理中
 * @reactProps {boolean} [queryMaintenanceListLoading=false] - 查询可维护行处理中
 * @reactProps {boolean} [fetchingDetailHeader=false] - 查询明细头处理中
 * @reactProps {boolean} [queryDetailListLoading=false] - 查询明细行处理中
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
@connect(({ loading, contractChange, contractCommon }) => ({
  queryingHeader: loading.effects['contractCommon/fetchHeader'],
  queryingPartner: loading.effects['contractCommon/fetchPartner'],
  queryingApproveRecord: loading.effects['contractCommon/fetchApproveRecord'],
  queryingSubject: loading.effects['contractCommon/fetchSubject'],
  queryingTerm: loading.effects['contractCommon/fetchTerm'],
  saving: loading.effects['contractChange/update'] || loading.effects['contractChange/add'],
  deleteHeaderLoading: loading.effects['contractChange/delete'],
  submitContractLoading: loading.effects['contractChange/submit'],
  deletePcSubjectLoading: loading.effects['contractChange/pcSubjectLinesDelete'],
  deletePartnerLoading: loading.effects['contractChange/partnerLinesDelete'],
  deletePcStageLoading: loading.effects['contractChange/pcStageLinesDelete'],
  queryingStage: loading.effects['contractCommon/fetchStage'],
  queryingChange: loading.effects['contractChange/changeContract'],
  terminateLoading: loading.effects['contractChange/changeContractStatus'],
  invalidApprovalLoading: loading.effects['contractChange/invalidApproval'],
  saveSubjectLoading: loading.effects['contractChange/saveSubject'],
  fetchTextPreViewLoading: loading.effects['editorOnline/fetchTextPreView'],
  contractChange,
  contractCommon,
}))
@formatterCollections({
  code: [
    'spcm.contractChange',
    'spcm.contractMaintain',
    'spcm.common',
    'spcm.purchaseRequisitionCreation',
    'entity.company',
    'entity.supplier',
    'entity.business',
    'entity.organization',
    'entity.attachment',
    'hzero.common',
    'hzero.c7nProUI',
    'component.docFlow',
    'spfp.ruleMaintenance',
    'spfp.common',
    'spcm.purchaseContractView',
  ],
})
@withCustomize({
  unitCode: [
    'SPCM.PURCHASE_CONTRACT_MAINTAIN.DETAIL',
    'SPCM.PURCHASE_CONTRACT_MAINTAIN.DETAIL.READONLY',
    'SPCM.PURCHASE_CONTRACT_MAINTAIN.SUBJECT',
    'SPCM.PURCHASE_CONTRACT_MAINTAIN.SUBJECT.READONLY',
    'SPCM.PURCHASE_CONTRACT_MAINTAIN.PARTNER',
    'SPCM.PURCHASE_CONTRACT_MAINTAIN.PARTNER.READONLY',
    'SPCM.PURCHASE_CONTRACT_MAINTAIN.STAGE',
    'SPCM.PURCHASE_CONTRACT_MAINTAIN.STAGE.READONLY',
    'SPCM.PURCHASE_CONTRACT_MAINTAIN.REBATE',
    'SPCM.PURCHASE_CONTRACT_MAINTAIN.REBATE.READONLY',
    'SPCM.PURCHASE_CONTRACT_MAINTAIN.CONTRACTREPLENISH',
    'SPCM.CONTRACT.CONTROL.TERMINATION',
    'SPCM.PURCHASE_CONTRACT_MAINTAIN.SUBJECT.BTN_GROUP',
  ],
})
@remote(
  {
    code: 'SPCM_CONTRACT_CHANGE_DETAIL',
    name: 'remote',
  },
  {
    events: {
      // 查询补充协议
      fetchCuxReplenish() {},
    },
  }
)
export default class Detail extends Component {
  editorOnlineRef;

  constructor(props) {
    super(props);
    const {
      match: {
        params: { id },
      },
    } = this.props;
    const isPub = props.location.pathname.includes('/pub'); // 判断是否为pub页面
    this.state = {
      pcHeaderId: id,
      headerInfo: {}, // 头form数据源
      collapseKeys: [
        'contractHeaderInformation',
        'contractPartnerInformation',
        'contractSubjectInformation',
        'contractBusinessTermsInformation',
        'contractOnlineEdit',
      ], // 打开的折叠面板key
      listDataSource: [], // 表格数据源
      operationRecordVisible: false,
      headerEdited: false, // 头是否编辑过
      pcSubjectEdited: false,
      partnerEdited: false,
      termEdited: false,
      pcStageEdited: false,
      pcRebateEdited: false,
      fullScreenFlag: false,
      tenantId: getCurrentOrganizationId(),
      partnerDataSource: [], // 合作伙伴数据
      partnerSelectedRows: [],
      pcSubjectDataSource: [],
      pcStageDataSource: [],
      templateList: [],
      pcSubjectPagination: {},
      pcSubjectSelectedRows: [],
      pcStageSelectedRows: [],
      termDataSource: [],
      termSelectedRows: [],
      pcStagePagination: {},
      templateListFlag: false,
      editable: false,
      checkArtificial: false,
      maintainEditable: false,
      activeKey: 'contractSubjectInfo',
      terminateReasonVisible: false,
      isPub,
      cuxBtnLoading: false,
    };
  }

  componentDidMount() {
    const { pcHeaderId } = this.state;
    this.fetchEnum();
    if (pcHeaderId && isNumber(+pcHeaderId)) {
      this.fetchHeader();
      this.fetchList();
    }
    this.fetchConfigSetting();
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractCommon/updateState',
      payload: { formChanged: false },
    });
  }

  /**
   * fetchHeader - 查询头明细数据
   */
  @Bind()
  fetchHeader() {
    const { dispatch } = this.props;
    const { pcHeaderId } = this.state;
    return dispatch({
      type: 'contractCommon/fetchHeader',
      pcHeaderId,
      customizeUnitCode: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.DETAIL',
    }).then((res) => {
      if (res) {
        this.setState({
          headerInfo: res,
        });
        if (res.pcStatusCode === 'PENDING') {
          this.setState({
            editable: false,
            checkArtificial: true,
            maintainEditable: true,
          });
        }
        dispatch({
          type: 'contractChange/fetchPcPartnerTypes',
          payload: {
            pcTypeId: res.pcTypeId,
          },
        });
        this.handleFetchConfigAttachment();
        this.resetEditFlag();
        if (this.headerRef) {
          this.headerRef.setState({ signFlag: res.signEffectFlag });
        }
        if (res.rebateFlag) {
          this.fetchContractRebate();
        }
      }
    });
  }

  /**
   * 查询列表
   */
  @Bind()
  fetchList() {
    this.fetchPartner();
    this.fetchSubject();
    this.fetchStage();
    this.fetchTerm();
  }

  /**
   * 查询详情值集
   */
  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractChange/fetchDetailEnum',
    });
  }

  /**
   * 查询配置中心配置
   */
  @Bind()
  fetchConfigSetting() {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractCommon/fetchConfigSetting',
    });
  }

  /**
   * 重置修改标志
   */
  @Bind()
  resetEditFlag() {
    this.setState({
      headerEdited: false,
      pcSubjectEdited: false,
      partnerEdited: false,
      termEdited: false,
      pcStageEdited: false,
      pcRebateEdited: false,
    });
  }

  /**
   * fetchPartner - 查询合作伙伴数据
   * @param {object} page - 合作伙伴分页条件
   */
  @Bind()
  fetchPartner(page = {}) {
    const { dispatch } = this.props;
    const { pcHeaderId } = this.state;
    if (pcHeaderId) {
      dispatch({
        type: 'contractCommon/fetchPartner',
        payload: {
          page,
          pcHeaderId,
          customizeUnitCode: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.PARTNER',
        },
      }).then((res) => {
        if (res) {
          this.setState({
            partnerDataSource: res.map((n) => ({ ...n, _status: 'update' })),
          });
          this.resetEditFlag();
        }
      });
    }
  }

  /**
   * fetchSubject - 查询标的信息数据
   * @param {object} page - 标的信息分页条件
   */
  @Bind()
  fetchSubject(page = {}) {
    const { dispatch } = this.props;
    const { pcHeaderId } = this.state;
    if (pcHeaderId) {
      dispatch({
        type: 'contractCommon/fetchSubject',
        payload: {
          page,
          pcHeaderId,
          customizeUnitCode: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.SUBJECT',
        },
      }).then((res) => {
        if (res) {
          this.setState({
            pcSubjectDataSource: res.content.map((n) => ({ ...n, _status: 'update' })),
            pcSubjectPagination: createPagination(res),
          });
          this.resetEditFlag();
        }
      });
    }
  }

  /**
   * fetchStage - 查询标的协议阶段
   * @param {object} page - 协议阶段分页条件
   */
  @Bind()
  fetchStage(page = {}) {
    const { dispatch } = this.props;
    const { pcHeaderId } = this.state;
    if (pcHeaderId) {
      dispatch({
        type: 'contractCommon/fetchStage',
        payload: {
          page,
          pcHeaderId,
          customizeUnitCode: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.STAGE',
        },
      }).then((res) => {
        if (res) {
          this.setState({
            pcStageDataSource: res.content.map((n) => ({ ...n, _status: 'update' })),
            pcStagePagination: createPagination(res),
          });
          this.resetEditFlag();
        }
      });
    }
  }

  /**
   * fetchSubject - 查询业务条款数据
   * @param {object} page - 业务条款分页数据
   */
  @Bind()
  fetchTerm(page = {}) {
    const { dispatch } = this.props;
    const { pcHeaderId } = this.state;
    if (pcHeaderId) {
      dispatch({
        type: 'contractCommon/fetchTerm',
        payload: {
          page,
          pcHeaderId,
        },
      }).then((res) => {
        if (res) {
          this.setState({
            termDataSource: res.map((n) => ({ ...n, _status: 'update' })),
          });
          this.resetEditFlag();
        }
      });
    }
  }

  /**
   * 查询返利信息
   * @param {*} page
   */
  @Bind()
  fetchContractRebate(page = {}) {
    const { dispatch } = this.props;
    const { pcHeaderId } = this.state;
    dispatch({
      type: 'contractCommon/fetchContractRebate',
      payload: {
        page,
        pcHeaderId,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          pcRebateDataSource: res.content && res.content.map((r) => ({ ...r, _status: 'update' })),
          pcRebatePagination: createPagination(res),
        });
      }
    });
  }

  /**
   * 刷新头信息和附件列表
   */
  @Bind()
  handleRefresh() {
    this.fetchHeader();
    this.handleFetchConfigAttachment();
  }

  /**
   * 查询配置的附件列表
   */
  @Bind()
  handleFetchConfigAttachment() {
    const { pcHeaderId } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'contractCommon/fetchPcAttachmentList',
      payload: pcHeaderId,
    }).then((templateList) => {
      if (templateList) {
        this.setState({
          templateList,
          templateListFlag: true,
        });
      }
    });
  }

  /**
   * 格式化时间
   * @param {*} [dataSource=[]] 数据数组
   * @param {*} [fields=[]] 字段数组
   */
  @Bind()
  formatTime(dataSource = [], fields = []) {
    if (isArray(dataSource)) {
      return dataSource.map((item) => {
        const newItem = {};
        fields.forEach((field) => {
          if (isString(item[field])) {
            newItem[field] = item[field];
          } else {
            newItem[field] = item[field]
              ? item.termType === 'DATE'
                ? item[field].format(DEFAULT_DATE_FORMAT)
                : item[field].format(DEFAULT_DATETIME_FORMAT)
              : undefined;
          }
        });
        return {
          ...item,
          ...newItem,
        };
      });
    }
  }

  @Bind()
  formatSubjectTime(dataSource = [], fields = []) {
    if (isArray(dataSource)) {
      return dataSource.map((item) => {
        const newItem = {};
        fields.forEach((field) => {
          newItem[field] = item[field]
            ? moment(item[field]).format(DEFAULT_DATE_FORMAT)
            : undefined;
        });
        return {
          ...item,
          ...newItem,
        };
      });
    }
  }

  /**
   * save - 保存明细数据
   * 保存明细头数据和行明细相关字段
   * @param {Object} params 保存信息
   */
  @Bind()
  save(params = {}) {
    const { dispatch } = this.props;
    const {
      tenantId,
      headerInfo = {},
      pcHeaderId = headerInfo.pcHeaderId,
      pcStageDataSource = [],
      pcSubjectDataSource = [],
    } = this.state;
    // const { editStep } = headerInfo;
    const formRef = get(this, 'headerRef.props.form');
    if (
      formRef.getFieldValue('acceptType') === 'stage' &&
      isEmpty(pcStageDataSource) &&
      pcHeaderId
    ) {
      Modal.confirm({
        title: intl
          .get(`spcm.common.view.message.title.stageCannotSave`)
          .d('验收类型为按阶段验收时，协议阶段行不可为空'),
      });
      return;
    }

    if (
      formRef.getFieldValue('acceptType') === 'target' &&
      isEmpty(pcSubjectDataSource) &&
      pcHeaderId
    ) {
      Modal.confirm({
        title: intl
          .get(`spcm.common.view.message.title.targetCannotSave`)
          .d('验收类型为按标的验收时，协议标的行不可为空'),
      });
      return;
    }

    if (!formRef) {
      return;
    }
    if (this.headerRef && this.headerRef.props.form) {
      if (!pcHeaderId) {
        this.headerRef.props.form.validateFieldsAndScroll((errs, values) => {
          if (!errs) {
            const { startDateActive, endDateActive, overseasProcurement, signEffectFlag } = values;
            const headerData = {
              tenantId,
              ...headerInfo,
              ...values,
              ...params,
              startDateActive: startDateActive
                ? moment(startDateActive).format(DEFAULT_DATETIME_FORMAT)
                : undefined,
              endDateActive: endDateActive
                ? moment(endDateActive).format(DEFAULT_DATETIME_FORMAT)
                : undefined,
              overseasProcurement: overseasProcurement ? 1 : 0,
              signEffectFlag: signEffectFlag ? 1 : 0,
            };
            dispatch({
              type: 'contractChange/add',
              payload: {
                ...headerData,
                customizeUnitCode:
                  'SPCM.PURCHASE_CONTRACT_MAINTAIN.DETAIL,SPCM.PURCHASE_CONTRACT_MAINTAIN.SUBJECT,SPCM.PURCHASE_CONTRACT_MAINTAIN.STAGE,SPCM.PURCHASE_CONTRACT_MAINTAIN.PARTNER',
              },
            }).then((newHeaderInfo) => {
              if (newHeaderInfo) {
                this.setState({ headerInfo: newHeaderInfo, pcHeaderId: newHeaderInfo.pcHeaderId });
                this.props.history.push({
                  pathname: `/spcm/contract-change/detail/${newHeaderInfo.pcHeaderId}`,
                });
                this.fetchHeader();
                this.fetchList();
                notification.success();
              }
            });
          }
        });
      } else {
        this.handleUpdateContract({}, 0);
      }
    }
  }

  /**
   * 更新协议
   * @param {Object} [params={}] 更细内容
   * @param {Number} [oldEditStep] 协议所处阶段
   */
  @Bind()
  handleUpdateContract(params = {}, oldEditStep) {
    const {
      tenantId,
      pcHeaderId,
      headerInfo = {},
      pcSubjectDataSource = [],
      pcStageDataSource = [],
      partnerDataSource = [],
      termDataSource = [],
      pcRebateDataSource = [],
    } = this.state;
    const { editStep, pcKindCode } = headerInfo;
    const { dispatch } = this.props;
    if (!this.headerRef?.props?.form) return;
    this.headerRef.props.form.validateFieldsAndScroll((errs, values) => {
      if (!errs) {
        Promise.all([
          this.validateEditTableDataSource(
            pcSubjectDataSource,
            ['pcSubjectId'],
            {
              force: true,
            },
            ['disableChangeRate']
          ),
          this.validateEditTableDataSource(pcStageDataSource, ['pcStageId'], {
            force: true,
          }),
          this.validateEditTableDataSource(partnerDataSource, ['partnerId'], {
            force: true,
          }),
          !['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(headerInfo.pcKindCode)
            ? this.validateEditTableDataSource(termDataSource, ['termId'], { force: true })
            : Promise.resolve([]),
          headerInfo.rebateFlag
            ? this.validateEditTableDataSource(pcRebateDataSource, ['rebateInformationId'], {
                force: true,
              })
            : Promise.resolve([]),
        ]).then(
          ([
            pcSubjectDetailDTOList,
            pcStageDetailDTOList,
            pcPartnerDetailDTOList,
            pcTermDetailDTOList = [],
            pcRebateInformationlist = [],
          ]) => {
            const { startDateActive, endDateActive, overseasProcurement, signEffectFlag } = values;
            const headerData = {
              tenantId,
              ...values,
              ...params,
              startDateActive: startDateActive
                ? moment(startDateActive).format(DEFAULT_DATETIME_FORMAT)
                : undefined,
              endDateActive: endDateActive
                ? moment(endDateActive).format(DEFAULT_DATETIME_FORMAT)
                : undefined,
              overseasProcurement: overseasProcurement ? 1 : 0,
              signEffectFlag: signEffectFlag ? 1 : 0,
            };
            /**
             * 由于阶段行上的付款比例和原币费用跟协议总额相关联，而协议总额的更新受制于协议标的行上相关字段
             * 后者在更新较为滞后（需要保存单据或者删除标的行时才会在服务端进行相关计算）
             * 因此，需要校验一下协议标的行上相关字段是否为0（直接校验相关字段是否为0比copy服务端相关计算逻辑更便捷，后者计算逻辑比较庞大）；
             * 若不为0，则需要将协议阶段行上的付款比例和原币费用置为0（srm-17314的需求）
             */
            // const notZero = pcSubjectDetailDTOList.some((item) => {
            //   const { quantity, exchangeRate, taxIncludedUnitPrice, unitPrice } = item;
            //   return (
            //     (Number(taxIncludedUnitPrice) !== 0 || // 原币含税单价
            //       Number(unitPrice) !== 0) && // 原币不含税单价
            //     ![
            //       Number(quantity), // 数量
            //       Number(exchangeRate), // 汇率
            //     ].includes(0)
            //   );
            // });
            // // !notZero意味着协议标的行上要么没数据，要么数据汇总得到的协议总额为0
            // let pcStageDTOList = pcStageDetailDTOList;
            // if (!notZero) {
            //   pcStageDTOList = pcStageDetailDTOList.map((item) => {
            //     return {
            //       ...item,
            //       // payRatio: 0,
            //       costQuantity: 0,
            //     };
            //   });
            // }
            dispatch({
              type: 'contractChange/update',
              payload: {
                ...headerInfo,
                ...headerData,
                mainContractId: headerInfo.mainContractId,
                pcPartnerDetailDTOList,
                pcSubjectDetailDTOList: this.formatSubjectTime(pcSubjectDetailDTOList, [
                  'deliverDate',
                  'priceEndDate',
                  'priceStartDate',
                ]),
                pcStageDetailDTOList: this.formatTime(pcStageDetailDTOList, ['milestoneTime']), // 这里待修改
                pcTermDetailDTOList: [
                  ...pcTermDetailDTOList.filter(
                    (item) => !['DATE', 'DATETIME'].includes(item.termType)
                  ),
                  ...this.formatTime(
                    pcTermDetailDTOList.filter((item) =>
                      ['DATE', 'DATETIME'].includes(item.termType)
                    ),
                    ['termContent']
                  ),
                ],
                pcRebateInformationlist: this.formatTime(pcRebateInformationlist, [
                  'validityDateFrom',
                  'validityDateTo',
                ]),
                customizeUnitCode:
                  'SPCM.PURCHASE_CONTRACT_MAINTAIN.DETAIL,SPCM.PURCHASE_CONTRACT_MAINTAIN.SUBJECT,SPCM.PURCHASE_CONTRACT_MAINTAIN.STAGE,SPCM.PURCHASE_CONTRACT_MAINTAIN.PARTNER',
              },
            }).then((res) => {
              if (res) {
                notification.success();
                this.fetchHeader().then(() => {
                  if (oldEditStep === 1) {
                    const n = document.querySelector(
                      `a[href="#spcm-contract-maintain-detail-contract-online-edit"]`
                    );
                    if (
                      pcHeaderId &&
                      editStep === 1 &&
                      !['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(pcKindCode)
                    ) {
                      this.editorOnlineRef.fetchEditorOnlineHTML();
                    }
                    if (n) n.click();
                  }
                });
                this.fetchList();
                partnerDataSource.forEach((i) => i.$form.resetFields());
                pcStageDataSource.forEach((i) => i.$form && i.$form.resetFields()); // 此处需要判断一下，由于页面初始化时协议阶段行默认不渲染，以至于没有$form属性

                dispatch({
                  type: 'contractCommon/updateState',
                  payload: {
                    formChanged: false,
                  },
                });
              }
            });
          },
          () => {}
        );
      }
    });
  }

  @Bind()
  changeContract(_, oldEditStep) {
    const {
      headerInfo = {},
      pcSubjectDataSource = [],
      partnerDataSource = [],
      pcStageDataSource = [],
      termDataSource = [],
      pcRebateDataSource = [],
      // pcHeaderId,
    } = this.state;
    // const { pcKindCode } = headerInfo;
    const { dispatch } = this.props;
    const payload = {
      ...merge(headerInfo),
      pcStageDetailDTOList: [
        ...pcStageDataSource.map((e) => {
          e.pcHeaderId = null;
          e.pcStageId = null;
          return e;
        }),
      ],
      pcPartnerDetailDTOList: [
        ...partnerDataSource.map((e) => {
          e.pcHeaderId = null;
          e.partnerId = null;
          return e;
        }),
      ],
      pcSubjectDetailDTOList: [
        ...pcSubjectDataSource.map((e) => {
          e.pcHeaderId = null;
          e.pcSubjectId = null;
          return e;
        }),
      ],
      pcTermDetailDTOList: [
        ...termDataSource.map((e) => {
          e.pcHeaderId = null;
          e.termId = null;
          return e;
        }),
      ],
      pcRebateInformationlist: [
        ...pcRebateDataSource.map((e) => {
          e.pcHeaderId = null;
          e.rebateInformationId = null;
          return e;
        }),
      ],
      mainContractId: headerInfo.pcHeaderId,
      pcHeaderId: null,
      amount: null,
      creationDate: null,
      // pcNum: null,
      createdBy: null,
      electricSignFlag: null,
      alterationFlag: 1,
      // attachmentUuid: uuid(),
    };
    Modal.confirm({
      title: intl.get(`spcm.contractChange.title.sureChange`).d('确认变更'),
      onOk: () => {
        dispatch({
          type: 'contractChange/changeContract',
          payload,
        }).then((res) => {
          if (res) {
            const { pcHeaderId: headerId, pcStatusCode } = res;
            if (pcStatusCode === 'CHANGE_TO_APPROVAL') {
              dispatch(
                routerRedux.push({
                  pathname: `/spcm/contract-change/list`,
                })
              );
            } else {
              dispatch(
                routerRedux.push({
                  pathname: `/spcm/contract-change/detail/${headerId}`,
                  search: querystring.stringify({ hasChanged: 'true' }),
                })
              );

              this.setState({
                editable: false,
                checkArtificial: true,
                maintainEditable: true,
                pcHeaderId: res.pcHeaderId,
                templateList: [],
                pcSubjectDataSource: [],
                partnerDataSource: [],
                pcStageDataSource: [],
                termDataSource: [],
              });
              notification.success();
              this.fetchHeader().then(() => {
                if (oldEditStep === 0) {
                  const n = document.querySelector(
                    `a[href="#spcm-contract-maintain-detail-contract-online-edit"]`
                  );
                  if (n) {
                    n.click();
                  }
                }
                // else if (pcHeaderId && editStep === 1 && !['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(pcKindCode)) {
                //   this.editorOnlineRef.fetchEditorOnlineHTML();
                // }
              });
              this.fetchList();
              partnerDataSource.forEach((i) => i.$form.resetFields());
            }
          }
        });
      },
    });
  }

  /**
   * 更新头上的协议文本类型附件url
   * @param {Object} headerInfo 头信息
   */
  @Bind()
  handleUpdateContractTextUrl(headerInfo) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'contractChange/updateContractTextUrl',
      payload: headerInfo,
    });
  }

  /**
   * 行内校验
   * @param {Array} [dataSource=[]] 数据源
   * @param {Array} [excludeKeys=[]] 排除新建行的字段
   * @param {Object} [property={}] 校验API的options
   * @param {Object} [deleteKeys={}] 删除不需要的字段
   */
  @Bind()
  validateEditTableDataSource(dataSource = [], excludeKeys = [], property = {}, deleteKeys = []) {
    if (dataSource.length === 0) {
      return Promise.resolve(dataSource);
    }
    // return new Promise((resolve, reject) => {
    //   const validateDataSource = getEditTableData(dataSource, excludeKeys, property);
    //   if (validateDataSource.length === 0) {
    //     reject();
    //   } else {
    //     resolve(validateDataSource);
    //   }
    // });
    return new Promise((resolve, reject) => {
      // 若用户未曾切换到协议阶段标签页，EditTable不会为其装配$form，此时无需校验
      const enableEdit = (dataSource || []).reduce((pre, next) => pre && !!next.$form, true);
      let validateDataSource;
      if (enableEdit) {
        validateDataSource = getEditTableData(dataSource, excludeKeys, property);
        validateDataSource = map(validateDataSource, (o) => omit(o, deleteKeys));
      } else {
        validateDataSource = dataSource;
      }
      if (validateDataSource.length === 0) {
        // eslint-disable-next-line prefer-promise-reject-errors
        reject();
      } else {
        resolve(validateDataSource);
      }
    });
  }

  /**
   * 提交的时候校验头上附件必输
   */
  @Bind()
  attachmentRequiredCheck() {
    const { headerInfo = {}, templateList = [] } = this.state;
    const msg = [];
    templateList.forEach((item) => {
      if (item.nullableFlag === 0 && !item.supAttachmentFlag && !item.attachmentUrl) {
        msg.push(item.attachmentTypeName);
      }
    });
    if (
      ['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(headerInfo.pcKindCode) &&
      !headerInfo.contractAttachmentUrl
    ) {
      msg.push(intl.get(`spcm.common.view.message.title.contractAttachment`).d('协议文本'));
    }
    if (msg.length > 0) {
      notification.warning({
        message: intl.get('hzero.common.validation.notNull', {
          name: msg.join(','),
        }),
      });
      return null;
    } else {
      return 1;
    }
  }

  /**
   * preSubmit - 提交采购协议前置modal弹窗
   */
  @Bind()
  preSubmit() {
    const { partnerDataSource } = this.state;
    if (partnerDataSource.length > 0) {
      Modal.confirm({
        title: intl.get(`spcm.common.view.message.title.submitAgrement`).d('是否提交采购协议'),
        onOk: this.submit,
      });
    } else {
      notification.warning({
        message: intl
          .get(`spcm.common.view.message.title.mustMaintainPartnerLine`)
          .d('该采购协议未维护合伙伙伴行信息，无法提交'),
      });
    }
  }

  /**
   * submit - 采购申请提交
   */
  @Bind()
  submit() {
    const { dispatch } = this.props;
    const {
      headerInfo = {},
      pcSubjectDataSource = [],
      partnerDataSource = [],
      termDataSource = [],
      pcRebateDataSource = [],
    } = this.state;
    if (this.headerRef && this.headerRef.props.form) {
      this.headerRef.props.form.validateFieldsAndScroll((errs, values) => {
        if (!errs) {
          Promise.all([
            this.validateEditTableDataSource(
              pcSubjectDataSource,
              ['pcSubjectId'],
              {
                force: true,
              },
              ['disableChangeRate']
            ),
            this.validateEditTableDataSource(partnerDataSource, ['partnerId'], {
              force: true,
            }),
            !['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(headerInfo.pcKindCode)
              ? this.validateEditTableDataSource(termDataSource, ['termId'], { force: true })
              : Promise.resolve([]),
            headerInfo.rebateFlag
              ? this.validateEditTableDataSource(pcRebateDataSource, ['rebateInformationId'], {
                  force: true,
                })
              : Promise.resolve([]),
          ]).then(() => {
            if (this.attachmentRequiredCheck()) {
              const { signEffectFlag, overseasProcurement, ...mergeHeaderInfo } = merge(
                headerInfo,
                values
              );
              const { pcHeaderIdSet, ...pcHeader } = {
                ...mergeHeaderInfo,
                overseasProcurement: overseasProcurement ? 1 : 0,
                signEffectFlag: signEffectFlag ? 1 : 0,
              };
              dispatch({
                type: 'contractChange/submit',
                payload: {
                  pcHeaderList: [pcHeader],
                  customizeUnitCode:
                    'SPCM.PURCHASE_CONTRACT_MAINTAIN.DETAIL,SPCM.PURCHASE_CONTRACT_MAINTAIN.SUBJECT,SPCM.PURCHASE_CONTRACT_MAINTAIN.STAGE,SPCM.PURCHASE_CONTRACT_MAINTAIN.PARTNER',
                },
              }).then((res) => {
                if (res) {
                  notification.success();
                  this.props.history.push('/spcm/contract-change/list');
                } else {
                  this.fetchHeader();
                  this.fetchList();
                }
              });
            }
          });
        }
      });
    }
  }

  /**
   * delete 删除采购申请
   */
  @Bind()
  delete() {
    const { dispatch } = this.props;
    const { headerInfo } = this.state;
    Modal.confirm({
      title: intl.get(`spcm.common.view.message.title.confirmDelete`).d('是否删除'),
      onOk: () => {
        dispatch({
          type: 'contractChange/delete',
          payload: [headerInfo],
        }).then((res) => {
          if (res) {
            notification.success();
            dispatch(
              routerRedux.push({
                pathname: `/spcm/contract-change/list`,
              })
            );
          }
        });
      },
    });
  }

  /**
   * 跳转到明细页
   * @param {String} pcHeaderId
   */
  @Bind()
  redirectDetail(pcHeaderId) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/spcm/contract-change/detail/${pcHeaderId}`,
        // search: pcHeaderId ? querystring.stringify({ pcHeaderId }) : null,
      })
    );
    const headerNode = document.querySelector(
      '#spcm-contract-maintain-detail-contract-header-information'
    );
    if (headerNode) {
      headerNode.scrollIntoView();
    }
    this.setState(
      {
        pcHeaderId,
      },
      () => {
        this.componentDidMount();
      }
    );
  }

  /**
   * handleAddLines - 新增行
   * @param {String} key - 新增对应的行数据
   */
  @Bind()
  handleAddLines(key) {
    const sourceField = `${key}DataSource`;
    const paginationField = `${key}Pagination`;
    const rowKey = `${key}Id`;
    const {
      [sourceField]: dataSource = [],
      [paginationField]: pagination = {},
      headerInfo: {
        supplierCurrencyCode = 'CNY',
        purchaseCurrencyCode = 'CNY',
        startDateActive = undefined,
        endDateActive = undefined,
        signEffectFlag,
      },
    } = this.state;
    const currencyProps = {
      currencyCode: supplierCurrencyCode,
      supplierCurrencyCode,
      purchaseCurrencyCode,
    };
    if (signEffectFlag === 0) {
      currencyProps.priceStartDate =
        startDateActive && moment(startDateActive).format(DEFAULT_DATE_FORMAT);
      currencyProps.priceEndDate =
        endDateActive && moment(endDateActive).format(DEFAULT_DATE_FORMAT);
    }
    const newItem = { _status: 'create', [rowKey]: uuid(), edited: true, ...currencyProps };
    const params = {
      [sourceField]: [newItem, ...dataSource],
      [paginationField]: addItemToPagination(dataSource.length, pagination),
    };
    this.setState({ ...params });
  }

  /**
   * handleDeleteLines - 删除采购申请行
   */
  @Bind()
  handleDeleteLines(key, primaryKey, model = 'contractChange') {
    const sourceField = `${key}DataSource`;
    const paginationField = `${key}Pagination`;
    const selectedField = `${key}SelectedRows`;
    const actionField = `${key}LinesDelete`;
    const rowKey = primaryKey || `${key}Id`;
    const { dispatch } = this.props;
    const {
      pcHeaderId,
      [sourceField]: dataSource = [],
      [paginationField]: pagination = {},
      [selectedField]: selectedRows = [],
    } = this.state;
    const newDataSource = [];
    const deleteList = [];
    Modal.confirm({
      title: intl.get(`spcm.common.view.message.title.confirmDelete`).d('是否删除'),
      onOk: () => {
        const selectedRowKeys = selectedRows.map((n) => n[rowKey]);
        dataSource.forEach((item) => {
          if (!selectedRowKeys.includes(item[rowKey])) {
            newDataSource.push(item);
          } else if (item._status !== 'create') {
            deleteList.push(omit(item, ['$form']));
          }
        });
        if (!isEmpty(deleteList)) {
          const editedData = dataSource.filter((item) => item.edited);
          if (!this.checkModified(key, selectedRows, dataSource) || editedData.length > 0) {
            Modal.confirm({
              title: intl
                .get(`spcm.common.view.message.title.lostData`)
                .d('存在未保存数据，继续将导致数据丢失，是否继续'),
              onOk: () => {
                dispatch({
                  type: `${model}/${actionField}`,
                  payload: {
                    pcHeaderId,
                    body: deleteList,
                  },
                }).then((res) => {
                  if (res) {
                    if (res) {
                      this.setState({ [selectedField]: [] });
                      notification.success();
                      this.fetchHeader();
                      this.fetchList();
                    }
                  }
                });
              },
            });
          } else {
            dispatch({
              type: `${model}/${actionField}`,
              payload: {
                pcHeaderId,
                body: deleteList,
              },
            }).then((res) => {
              if (res) {
                if (res) {
                  this.setState({ [selectedField]: [] });
                  notification.success();
                  this.fetchHeader();
                  this.fetchList();
                }
              }
            });
          }
        } else {
          this.setState({
            [sourceField]: newDataSource,
            [paginationField]: delItemsToPagination(
              selectedRows.length,
              dataSource.length,
              pagination
            ),
          });
          this.setState({ [selectedField]: [] });
        }
      },
    });
  }

  /**
   * 检查是否有非本条外的项修改过
   * @param {*} key
   * @param {*} selectedRows
   * @param {*} dataSource
   */
  @Bind()
  checkModified(key) {
    // 如果是删除当前列表，则判断删除条数是否等于总条数，不是则提示
    // 如果删除的不是当前已修改列表，则提示
    /**
     * key: ['pcSubject', 'partner']
     * headerEdited: false, // 头是否编辑过
      pcSubjectEdited: false,
      partnerEdited: false,
     */
    const { headerEdited, pcSubjectEdited, partnerEdited, pcStageEdited } = this.state;
    if (
      key === 'pcSubject' &&
      !headerEdited &&
      !partnerEdited &&
      !pcStageEdited
      // selectedRows.length >= dataSource.length
    ) {
      return 1;
    } else if (
      key === 'partner' &&
      !headerEdited &&
      !pcSubjectEdited &&
      !pcStageEdited
      // selectedRows.length >=
      //   dataSource.filter(i => i._status === 'update' && i.predefinedFlag !== 1).length
    ) {
      return 1;
    } else if (key === 'ladderQuote') {
      return 1;
    } else {
      return null;
    }
  }

  /**
   * 修改行数据
   * @param {Array} listDataSource
   */
  @Bind()
  handleChangeList(listDataSource) {
    this.setState(listDataSource);
  }

  /**
   * 修改头数据
   * @param {*} headerInfo
   */
  @Bind()
  handleChangeHeader(headerInfo) {
    this.setState({ headerInfo });
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

  /**
   * 改变模态框显示状态
   * @param {String} modalVisible 字段
   * @param {Boolean} flag 值
   * @param {Object} [otherParams={}] 其他参数
   */
  @Bind()
  handleModalVisible(modalVisible, flag, otherParams = {}) {
    this.setState({ [modalVisible]: !!flag, ...otherParams });
  }

  /**
   * getParent-获取 dom 的parent
   * @param {HTMLElement} dom
   */
  @Bind()
  getParent(dom) {
    const parent = dom && dom.parentNode.parentNode;
    return parent && parent.nodeType !== 11 ? parent : null;
  }

  /**
   * getAffixContainer-获取给 Affix 组件使用的元素
   * @return {HTMLElement}
   */
  @Bind()
  getAffixContainer() {
    const parent = this.getParent(
      document.getElementById('spcm-contract-maintain-detail-content-inner-wrapper')
    );
    return parent || document.body;
  }

  /**
   * 设置选中行
   * @param {Array} selectedRowKeys 选中的主键
   * @param {Array} selectedRows 选中的行
   * @param {String} field 字段前缀
   */
  @Bind()
  handleChangeSelection(selectedRowKeys, selectedRows, field) {
    this.setState({
      [`${field}SelectedRows`]: selectedRows,
    });
  }

  /**
   * 改变标的信息分页前的回调
   */
  @Bind()
  handlePreSearchPcSubject(page) {
    const {
      headerEdited,
      pcSubjectEdited,
      partnerEdited,
      termEdited,
      pcStageEdited,
      pcRebateEdited,
    } = this.state;
    const edited =
      headerEdited ||
      pcSubjectEdited ||
      partnerEdited ||
      termEdited ||
      pcStageEdited ||
      pcRebateEdited;
    if (edited) {
      Modal.confirm({
        title: intl
          .get(`spcm.common.view.message.title.lostData`)
          .d('存在未保存数据，继续将导致数据丢失，是否继续'),
        onOk: () => this.fetchSubject(page),
        onCancel: () => this.forceUpdate(),
      });
    } else {
      this.fetchSubject(page);
    }
  }

  /**
   * 选定物料后查询对应的品类定义
   * @param {Number} itemId 物料id
   */
  @Bind()
  handleFetchCategory(itemId) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'contractChange/fetchCategory',
      payload: {
        itemId,
        enabledFlag: 1,
      },
    });
  }

  /**
   * 防抖，减少渲染频率
   * @param {Function} fun 回调函数
   * @param {number} delay 延时
   */
  @Bind()
  debounce(fun, delay) {
    let timeout = null;
    // eslint-disable-next-line
    return function () {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        fun.call(this, arguments); // eslint-disable-line
      }, delay);
    };
  }

  /**
   * 改变state时
   * @param {Object} params state内容
   */
  @Bind()
  handleChangeState(params) {
    this.debounce(() => this.setState(params), 300)();
  }

  /**
   * 查询扩展信息
   * @param {Number} companyId 公司Id
   * @returns Promise(result)
   */
  @Bind()
  handleFetchExtended(companyId) {
    const { dispatch } = this.props;
    const {
      headerInfo: { pcHeaderId },
    } = this.state;
    return dispatch({
      type: 'contractChange/fetchExtended',
      payload: {
        companyId,
        pcHeaderId,
      },
    });
  }

  /**
   * handleVisible - 通过协议-打开模态框
   * @param {String} field 设置的字段
   * @param {Boolean} flag 设置的值
   */
  @Bind()
  fullScreen(field, flag) {
    this.setState({ [field]: !!flag });
  }

  /**
   * handleRecordChange - 监听行内修改
   * @param {Object} 行数据
   */
  @Bind()
  handleRecordChange(record) {
    const dataSource = this.state.pcSubjectDataSource;
    const newDataSource = dataSource.map((item) => {
      if (item.pcSubjectId === record.pcSubjectId) {
        return {
          ...item,
          edited: true,
        };
      }
      return item;
    });
    this.setState({
      pcSubjectDataSource: newDataSource,
    });
  }

  /**
   * 改变 阶段信息 分页前的回调
   */
  @Bind()
  handlePreSearchPcStage(page) {
    const {
      headerEdited,
      pcSubjectEdited,
      partnerEdited,
      termEdited,
      pcStageEdited,
      pcRebateEdited,
    } = this.state;
    const edited =
      headerEdited ||
      pcSubjectEdited ||
      partnerEdited ||
      termEdited ||
      pcStageEdited ||
      pcRebateEdited;
    if (edited) {
      Modal.confirm({
        title: intl
          .get(`spcm.common.view.message.title.lostData`)
          .d('存在未保存数据，继续将导致数据丢失，是否继续'),
        onOk: () => this.fetchStage(page),
        onCancel: () => this.forceUpdate(),
      });
    } else {
      this.fetchStage(page);
    }
  }

  /**
   * 保存激活的tab的key
   * @param {String} activeKey
   */
  @Bind()
  handleSaveKey(activeKey) {
    this.setState({ activeKey });
  }

  @Bind()
  handleClick(action) {
    const { dispatch } = this.props;
    const { headerInfo } = this.state;
    let pcHeaderStatus = '';
    switch (action) {
      case 'delete':
        pcHeaderStatus = 'DELETED';
        break;
      case 'cancell':
        pcHeaderStatus = 'CANCELLATION';
        break;
      case 'terminate':
        pcHeaderStatus = 'TERMINATION_CONFIRM';
        break;
      default:
        pcHeaderStatus = null;
    }
    Modal.confirm({
      title:
        pcHeaderStatus === 'TERMINATION_CONFIRM'
          ? intl.get(`spcm.contractChange.title.sureTermination`).d('确认终止')
          : intl.get(`spcm.contractChange.title.sureCancel`).d('确认作废'),
      onOk: () => {
        dispatch({
          type: 'contractChange/invalidApproval',
          payload: {
            pcHeaderStatus,
            pcHeaderDetailDtos: [headerInfo],
          },
        }).then((res) => {
          if (res) {
            notification.success();
            dispatch(
              routerRedux.push({
                pathname: `/spcm/contract-change/list`,
              })
            );
          }
        });
      },
    });
  }

  /**
   * 终止理由
   * @param {*} action
   * @param {*} terminationReason
   */
  @Bind()
  handleTerminate(action, { terminationReason, terminationAttachmentUuid }) {
    const { dispatch } = this.props;
    const { headerInfo } = this.state;
    dispatch({
      type: 'contractChange/changeContractStatus',
      payload: {
        terminationReason,
        pcHeaderStatus: action,
        pcHeaderDetailDtos: [{ ...headerInfo, terminationAttachmentUuid }],
      },
    }).then((res) => {
      if (res) {
        notification.success();
        dispatch(
          routerRedux.push({
            pathname: `/spcm/contract-change/list`,
          })
        );
      }
    });
  }

  /**
   * 控制终止理由modal显隐
   */
  @Bind()
  handleControlModal() {
    const { terminateReasonVisible } = this.state;
    this.setState({ terminateReasonVisible: !terminateReasonVisible });
  }

  @Bind()
  handleAddPurchaseOrder(selectedList = []) {
    const {
      pcSubjectDataSource,
      pcSubjectPagination,
      headerInfo: { supplierCurrencyCode = 'CNY', purchaseCurrencyCode = 'CNY' },
    } = this.state;
    this.setState({
      pcSubjectDataSource: [
        ...pcSubjectDataSource,
        ...selectedList.map((n, index) => ({
          ...n,
          _status: 'create',
          edited: true,
          sourceCode: n.displayPoNum,
          sourceLineNum: n.displayLineNum,
          deliverDate: n.deliverDate && moment(n.deliverDate).format(DEFAULT_DATE_FORMAT),
          lineNum: pcSubjectDataSource.length + index + 1,
          pcSubjectId: uuid(),
          currencyCode: n.currencyCode || supplierCurrencyCode,
          purchaseCurrencyCode: n.purchaseCurrencyCode || purchaseCurrencyCode,
          prLineNum: pcSubjectDataSource.length + index + 1,
          taxIncludedUnitPrice: n.unitPrice,
          purchaseTaxLineAmount: n.taxIncludedLineAmount,
          taxAmount: n.taxPrice,
          resultId: n.poLineLocationId,
          exchangeRate: 1,
        })),
      ],
      pcSubjectPagination: addItemsToPagination(
        selectedList.length,
        pcSubjectDataSource.length,
        pcSubjectPagination
      ),
      pcSubjectEdited: true,
    });
  }

  /**
   * 保存purchaserAttachmentUuid
   * @param {*} purchaserAttachmentUuid
   */
  @Bind()
  handleSaveUuid(purchaserAttachmentUuid) {
    const { dispatch } = this.props;
    const { headerInfo } = this.state;
    if (!headerInfo.purchaserAttachmentUuid) {
      dispatch({
        type: 'contractChange/add',
        payload: {
          ...headerInfo,
          purchaserAttachmentUuid,
        },
      }).then((res) => {
        if (res) {
          this.setState({
            headerInfo: {
              ...headerInfo,
              ...res,
            },
          });
        }
      });
    }
  }

  /**
   * 保存purchaserAttachmentUuid
   * @param {*} purchaserAttachmentUuid
   */
  @Bind()
  handleSaveElectricSignUuid(pcHeaderElectronicSignatureAttachment) {
    const { dispatch } = this.props;
    const { headerInfo } = this.state;
    if (!headerInfo.pcHeaderElectronicSignatureAttachment) {
      dispatch({
        type: 'contractChange/add',
        payload: {
          ...headerInfo,
          pcHeaderElectronicSignatureAttachment,
        },
      }).then((res) => {
        if (res) {
          this.setState({
            headerInfo: {
              ...headerInfo,
              ...res,
            },
          });
        }
      });
    }
  }

  @Bind()
  async saveSubject() {
    const { dispatch } = this.props;
    const { pcHeaderId, pcSubjectDataSource } = this.state;
    const pcSubjectDetailDTOList = await this.validateEditTableDataSource(
      pcSubjectDataSource,
      ['pcSubjectId'],
      { force: true },
      ['disableChangeRate']
    );
    if (!isEmpty(pcSubjectDetailDTOList)) {
      dispatch({
        type: 'contractChange/saveSubject',
        payload: {
          pcHeaderId,
          ...this.formatSubjectTime(pcSubjectDetailDTOList, [
            'deliverDate',
            'priceEndDate',
            'priceStartDate',
          ]),
          customizeUnitCode: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.SUBJECT',
        },
      }).then((res) => {
        if (res) {
          notification.success();
          // 查询头信息
          dispatch({
            type: 'contractCommon/fetchHeader',
            pcHeaderId,
            customizeUnitCode: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.DETAIL',
          }).then((headerInfo) => {
            if (headerInfo) {
              this.setState({ headerInfo });
              dispatch({
                type: 'contractCommon/updateState',
                payload: {
                  formChanged: false,
                },
              });
            }
          });
          this.fetchSubject();
        }
      });
    }
  }

  @Bind()
  handleControlComparison() {
    const { textComparisonVisible } = this.state;
    this.setState({ textComparisonVisible: !textComparisonVisible });
  }

  @Bind()
  async getTextPreViewUrl() {
    const { dispatch } = this.props;
    const {
      headerInfo,
      pcSubjectDataSource,
      pcStageDataSource,
      partnerDataSource,
      termDataSource,
      pcRebateDataSource,
      pcHeaderId,
    } = this.state;
    const formRef = get(this, 'headerRef.props.form');
    if (!formRef) {
      return;
    }
    this.setState({ fetchTextPreViewLoading: true });
    formRef.validateFieldsAndScroll({ force: true }, (errs, values) => {
      if (!errs) {
        Promise.all([
          this.validateEditTableDataSource(pcSubjectDataSource, ['pcSubjectId'], {
            force: true,
          }),
          this.validateEditTableDataSource(pcStageDataSource, ['pcStageId'], {
            force: true,
          }),
          this.validateEditTableDataSource(partnerDataSource, ['partnerId'], {
            force: true,
          }),
          !['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(headerInfo.pcKindCode)
            ? this.validateEditTableDataSource(termDataSource, ['termId'], { force: true })
            : Promise.resolve([]),
          headerInfo.rebateFlag
            ? this.validateEditTableDataSource(pcRebateDataSource, ['rebateInformationId'], {
                force: true,
              })
            : Promise.resolve([]),
          fetchContractOnlineHTMLType(),
        ])
          .then(
            ([
              pcSubjectDetailDTOList,
              pcStageDetailDTOList,
              pcPartnerDetailDTOList,
              pcTermDetailDTOList = [],
              pcRebateInformationlist = [],
              type,
            ]) => {
              setTimeout(() => {
                const { startDateActive, endDateActive } = values;
                const formatStartDate =
                  startDateActive && moment(startDateActive).format(DEFAULT_DATETIME_FORMAT);
                const formatEndDate =
                  endDateActive && moment(endDateActive).format(DEFAULT_DATETIME_FORMAT);
                const payload = {
                  ...headerInfo, // 采购协议头信息
                  ...values,
                  supplierCompanyId: headerInfo.supplierCompanyId,
                  startDateActive: formatStartDate,
                  endDateActive: formatEndDate,
                  pcSubjectDetailDTOList: this.formatSubjectTime(pcSubjectDetailDTOList, [
                    'deliverDate',
                    'priceEndDate',
                    'priceStartDate',
                  ]),
                  pcStageDetailDTOList,
                  pcPartnerDetailDTOList,
                  pcTermDetailDTOList,
                  pcRebateInformationlist,
                };
                if (type?.includes('new_wps')) {
                  // type为new_wps/new_wps_V7时，使用新版WPS预览
                  fetchWpsV5TextPreView(payload)
                    .then((url) => {
                      if (getResponse(url)) {
                        if (type === 'new_wps_V7' && window?.open) {
                          window.open(
                            `${window.$$env.BASE_PATH}pub/spcm/contract-workspace/wps-v7-preview/${pcHeaderId}?previewUrl=${url}`
                          );
                        } else {
                          window.open(url);
                        }
                      }
                    })
                    .finally(() => {
                      this.setState({ fetchTextPreViewLoading: false });
                    });
                  return false;
                }
                dispatch({
                  type: 'editorOnline/fetchTextPreView',
                  payload,
                }).then((url) => {
                  this.setState({ fetchTextPreViewLoading: false });
                  const hasFailed = url && url.includes('failed'); // 是否接口报错
                  if (typeof url === 'string' && url !== '' && !hasFailed) {
                    const tenantId = getCurrentOrganizationId();
                    const bucketName = PRIVATE_BUCKET;
                    const editor = type?.includes('new_wps') ? 'WPS' : 'ONLYOFFICE';
                    window.open(
                      `${HZERO_FILE}/v1/${tenantId}/file/preview?url=${encodeURIComponent(
                        url
                      )}&editor=${editor}&bucketName=${bucketName}&access_token=${getAccessToken()}#toolbar=0`
                    );
                  } else if (hasFailed) {
                    const errorObj = JSON.parse(url);
                    notification.error({
                      message: errorObj.message,
                    });
                  } else {
                    notification.warning({
                      message: intl
                        .get('spcm.common.view.button.getPreViewUrlError')
                        .d('Url获取失败！'),
                    });
                  }
                });
              }, 2000);
            }
          )
          .catch(() => {
            this.setState({ fetchTextPreViewLoading: false });
            notification.warning({
              message: intl.get('spcm.common.view.validateLine.error').d('采购协议行信息校验失败'),
            });
          });
      } else {
        this.setState({ fetchTextPreViewLoading: false });
        notification.warning({
          message: intl.get('spcm.common.view.validateHeader.error').d('采购协议头信息校验失败'),
        });
      }
    });
  }

  // src-4038 为了58的补充协议列表二开
  @Bind()
  renderContractReplenish(contractReplenishProps) {
    return <ContractReplenish {...contractReplenishProps} />;
  }

  /**
   * 优惠规则——折扣
   * @param {object} discountRuleProps 折扣属性
   * @returns
   */
  renderDiscountRule(discountRuleProps) {
    return <PreferentialRule {...discountRuleProps} />;
  }

  /**
   * 优惠规则——返利
   * @param {object} rebateRuleProps 返利属性
   * @returns
   */
  renderRebateRule(rebateRuleProps) {
    return <PreferentialRule {...rebateRuleProps} />;
  }

  @Bind()
  handleCuxBtnLoading(flag = false) {
    this.setState({
      cuxBtnLoading: flag,
    });
  }

  render() {
    const {
      location,
      // dispatch,
      // deletingLines,
      queryingHeader = false,
      queryingPartner = false,
      queryingApproveRecord = false,
      queryingSubject = false,
      queryingTerm = false,
      saving = false,
      contractChange,
      deleteHeaderLoading = false,
      submitContractLoading = false,
      deletePcSubjectLoading = false,
      deletePartnerLoading = false,
      deletePcStageLoading = false,
      // fetchTextPreViewLoading = false,
      queryingStage = false,
      queryingChange = false,
      terminateLoading,
      customizeForm,
      customizeTable,
      customizeBtnGroup,
      dispatch,
      saveSubjectLoading,
      contractCommon: { configSetting = {}, formChanged },
      remote,
    } = this.props;
    const {
      templateListFlag,
      operationRecordVisible,
      // headerEdited,
      // termEdited,
      // pcStageEdited,
      // partnerEdited,
      // pcSubjectEdited,
      templateList,
      fullScreenFlag,
      pcSubjectDataSource = [],
      pcSubjectPagination = {},
      pcSubjectSelectedRows = [],
      partnerDataSource = [],
      partnerSelectedRows = [],
      pcStageDataSource = [],
      pcStagePagination = {},
      headerInfo = {},
      // collapseKeys = [],
      termDataSource = [],
      termSelectedRows = [],
      pcStageSelectedRows = [],
      editable,
      checkArtificial,
      maintainEditable,
      activeKey,
      pcRebateDataSource = [],
      pcRebatePagination = {},
      pcRebateSelectedRows = [],
      // pcRebateEdited,
      terminateReasonVisible,
      isPub,
      textComparisonVisible,
      fetchTextPreViewLoading,
      cuxBtnLoading = false,
    } = this.state;
    // const edited = true;
    // headerEdited ||
    // pcSubjectEdited ||
    // partnerEdited ||
    // termEdited ||
    // pcStageEdited ||
    // pcRebateEdited;
    const {
      attachmentUuid,
      supplierAttachmentUuid,
      editStep,
      rebateFlag,
      pcKindCode,
      supplementFlag,
      authType,
      signatureType,
      electricSignFlag,
      supplierCurrencyCode,
      enableRule,
      pcNum,
      version,
    } = headerInfo;
    const queryingList =
      queryingPartner ||
      queryingSubject ||
      queryingTerm ||
      queryingStage ||
      queryingApproveRecord ||
      cuxBtnLoading;
    const { search = {} } = location;
    const { detailEnumMap } = contractChange;
    const { pcHeaderId = headerInfo.pcHeaderId } = querystring.parse(search.substr(1));
    const checkTypeFlag = !editable && headerInfo.pcStatusCode === 'PENDING';
    const taxIncludedUpRequired = !(
      (checkTypeFlag
        ? ['ATTACHMENT_FRAMEWORK', 'FRAMEWORK_AGREEMENT'].includes(
            this.headerRef?.props?.form.getFieldValue('pcKindCode')
          )
        : ['ATTACHMENT_FRAMEWORK', 'FRAMEWORK_AGREEMENT'].includes(pcKindCode)) &&
      this.headerRef?.props?.form.getFieldValue('contractPurpose') === 'OMMERCE_PURCHASE'
    );
    const headerInfoFormProps = {
      detailEnumMap,
      purchaseFlag: true, // 是否来自采购方
      customizeForm,
      editable,
      maintainEditable: !editable && headerInfo.pcStatusCode === 'PENDING',
      onRef: (node) => {
        this.headerRef = node;
      },
      dataSource: headerInfo,
      hiddenDataSourceKey: true,
      onChangeHeader: this.handleChangeHeader,
      onChangeState: this.handleChangeState,
    };
    const contractSubjectListProps = {
      editable,
      checkArtificial,
      maintainEditable,
      headerInfo,
      taxIncludedUpRequired,
      detailEnumMap,
      customizeTable,
      customizeBtnGroup,
      saveSubjectLoading,
      pcHeaderId,
      dispatch,
      formChanged,
      doubleUomFlag: configSetting['000112'] === '1',
      basePrice: configSetting['010616'],
      showOperationLadderQuote: true, // 是否加载阶梯价格弹窗模块
      deleting: deletePcSubjectLoading,
      loading: queryingSubject,
      pagination: pcSubjectPagination,
      dataSource: pcSubjectDataSource,
      onSelectionChange: this.handleChangeSelection,
      selectedRows: pcSubjectSelectedRows,
      onAdd: () => this.handleAddLines('pcSubject'),
      onDelete: () => this.handleDeleteLines('pcSubject'),
      onRef: (node) => {
        this.partnerRef = node;
      },
      onHandleRecord: this.handleRecordChange, // 监听修改
      onChangeState: this.handleChangeState,
      onChangeListData: this.handleChangeList,
      onPrePaginationChange: this.handlePreSearchPcSubject,
      onAddPurchaseOrder: this.handleAddPurchaseOrder,
      onSave: this.saveSubject,
      handleLadderQuote: this.handleLadderQuote,
    };
    const contractStageListProps = {
      editable,
      checkArtificial,
      maintainEditable,
      detailEnumMap,
      customizeTable,
      dispatch,
      formChanged,
      deleting: deletePcStageLoading,
      loading: queryingStage,
      pagination: pcStagePagination,
      dataSource: pcStageDataSource,
      onSelectionChange: this.handleChangeSelection,
      selectedRows: pcStageSelectedRows,
      onAdd: () => this.handleAddLines('pcStage'),
      onDelete: () => this.handleDeleteLines('pcStage'),
      onRef: (node) => {
        this.partnerRef = node;
      },
      onHandleRecord: this.handleRecordChange, // 监听修改
      onChangeState: this.handleChangeState,
      onChangeListData: this.handleChangeList,
      onPrePaginationChange: this.handlePreSearchPcStage,
    };
    const contractRebateProps = {
      editable,
      maintainEditable,
      checkArtificial,
      customizeTable,
      dispatch,
      formChanged,
      supplierCurrencyCode,
      dataSource: pcRebateDataSource,
      pagination: pcRebatePagination,
      selectedRows: pcRebateSelectedRows,
      onFetchContractRebate: this.fetchContractRebate,
      onAdd: () => this.handleAddLines('pcRebate', 'rebateInformationId'),
      onDelete: () => this.handleDeleteLines('pcRebate', 'rebateInformationId'),
      onChangeState: this.handleChangeState,
      onSelectionChange: this.handleChangeSelection,
      onPrePaginationChange: this.fetchContractRebate,
    };
    const partnerListProps = {
      editable,
      checkArtificial,
      maintainEditable,
      detailEnumMap,
      customizeTable,
      dispatch,
      formChanged,
      deleting: deletePartnerLoading,
      loading: queryingPartner,
      dataSource: partnerDataSource,
      onSearch: this.fetchPartner,
      onSelectionChange: this.handleChangeSelection,
      selectedRows: partnerSelectedRows,
      onAdd: () => this.handleAddLines('partner'),
      onDelete: () => this.handleDeleteLines('partner'),
      onRef: (node) => {
        this.pcSubjectRef = node;
      },
      onChangeState: this.handleChangeState,
      onChangeListData: this.handleChangeList,
      onFetchExtended: this.handleFetchExtended,
    };
    const contractBusinessTermsListProps = {
      editable,
      checkArtificial,
      maintainEditable,
      loading: queryingTerm,
      pagination: false,
      dispatch,
      formChanged,
      dataSource: termDataSource,
      onSelectionChange: this.handleChangeSelection,
      selectedRows: termSelectedRows,
      onRef: (node) => {
        this.termRef = node;
      },
      onChangeState: this.handleChangeState,
    };

    const discountRuleProps = {
      editable: editable || maintainEditable,
      majorPcNum: `${pcNum}|${version}`,
      type: 'discount',
      isH0Type: true,
      headerInfo,
    };

    const rebateRuleProps = {
      editable: editable || maintainEditable,
      majorPcNum: `${pcNum}|${version}`,
      type: 'rebate',
      isH0Type: true,
      headerInfo,
    };

    const attachmentProps = {
      // accept: '.docx',
      // fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      templateListFlag,
      headerInfo,
      templateList,
      supplierAttachmentUuid,
      width: 610,
      isShowTips: true,
      onChangeState: (state) => {
        this.setState(state);
      },
      attachmentUUID: attachmentUuid,
      onUpdateHeader: this.handleUpdateContractTextUrl,
      onFetchHeader: this.fetchHeader,
      onRefresh: this.handleFetchConfigAttachment,
      purchaserParams: { purchaserUploadFlag: true },
      btnProps: {
        disabled: formChanged,
        btnText: intl.get(`entity.attachment.upload.spcm`).d('附件上传'),
      },
    };

    const attachmentViewProps = {
      headerInfo,
      isShowTips: true,
      templateList,
      supplierAttachmentUuid,
      onUpdateHeader: this.save,
      attachmentUUID: attachmentUuid,
      onFetchHeader: this.fetchHeader,
      onRefresh: this.handleFetchConfigAttachment,
      isTemplateContract: true,
      supplierParams: { supplierViewFlag: true },
      showRemoveIcon: false,
    };

    const operationRecordProps = {
      pcHeaderId,
      visible: operationRecordVisible,
      onHandleCancel: () => this.handleModalVisible('operationRecordVisible', false),
    };

    const ModalProps = {
      width: '100%',
      height: document?.body?.clientHeight || '100vh',
      visible: fullScreenFlag,
      onCancel: () => this.fullScreen('fullScreenFlag', false),
      footer: null,
      closable: false,
    };

    const terminateReasonProps = {
      terminateLoading,
      visible: terminateReasonVisible,
      customizeForm,
      onOk: (values) => this.handleTerminate('TERMINATION_CONFIRM', values),
      onCancel: this.handleControlModal,
    };

    const uploadProps = {
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'purchaser-attachment',
      btnText: intl.get('spcm.common.view.spcm.btn.purchaserAttachment').d('采购方附件'),
      title: intl.get('spcm.common.view.spcm.btn.purchaserAttachment').d('采购方附件'),
      attachmentUUID: headerInfo.purchaserAttachmentUuid,
    };

    const textComparisonProps = {
      pcHeaderId,
      visible: textComparisonVisible,
      onCancel: this.handleControlComparison,
    };

    const contractReplenishProps = {
      pcHeaderId,
      redirectDetail: this.redirectDetail,
      customizeTable,
      remote,
    };

    const electricSignAttachmentProps = {
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'purchase-contract',
      btnText: intl.get(`spcm.common.view.btn.electronicSignatureAttachment`).d('电子签章附件'),
      title: intl.get(`spcm.common.view.btn.electronicSignatureAttachment`).d('电子签章附件'),
      attachmentUUID: headerInfo.pcHeaderElectronicSignatureAttachment,
      rightAttachmentUUID: headerInfo.pcHeaderElectronicSignatureAttachmentIsSigned,
      afterOpenUploadModal: (electricSignUuid) => this.handleSaveElectricSignUuid(electricSignUuid),
      fileSize: 25 * 1024 * 1024,
      fileMaxNum: 4,
      fileType:
        'application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };

    const isAttachmentSignUpload =
      signatureType === 'ANNEX_SIGNATURE' &&
      allSignList.includes(authType) &&
      (electricSignFlag === 1 || headerInfo.pcStatusCode === 'PENDING'); // 是否附件签章

    const isAttachmentSignAndText =
      signatureType === 'TEXT_AND_ANNEX_SIGNATURE' &&
      (electricSignFlag === 1 || headerInfo.pcStatusCode === 'PENDING') &&
      allSignList.includes(authType);

    // 埋点按钮属性
    const remoteBtnProps = {
      headerRef: this.headerRef,
      headerInfo,
      fetchHeader: this.fetchHeader,
      cuxBtnLoading,
      handleCuxBtnLoading: this.handleCuxBtnLoading,
    };
    return (
      <Fragment>
        <Header
          title={intl.get(`spcm.contractChange.view.message.title.purchaseCreation`).d('协议变更')}
          backPath="/spcm/contract-change/list"
        >
          {headerInfo.pcStatusCode !== 'PENDING' ? (
            <Fragment>
              {!isPub && (
                <Fragment>
                  <Button
                    type="primary"
                    onClick={() => this.changeContract()}
                    loading={queryingChange}
                  >
                    <Icons type="main-handover" style={{ marginRight: '8px', fontSize: '16px' }} />
                    {intl.get(`spcm.contractChange.button.changeContract`).d('变更')}
                  </Button>
                  <PermissionButton
                    permissionList={[
                      {
                        code: 'srm.pc-admin.pc-purchaser.change.ps.cancel',
                        type: 'button',
                        meaning: '作废',
                      },
                    ]}
                    onClick={() => this.handleClick('cancell')}
                    disabled={
                      headerInfo.pcStatusCode === 'CONFIRMED' ||
                      headerInfo.pcStatusCode === 'EFFECTED'
                    }
                  >
                    <Icons type="main-tovoid" style={{ marginRight: '8px', fontSize: '16px' }} />
                    {intl.get(`spcm.contractChange.view.button.cancell`).d('作废')}
                  </PermissionButton>
                  <PermissionButton
                    permissionList={[
                      {
                        code: 'srm.pc-admin.pc-purchaser.change.ps.termination',
                        type: 'button',
                        meaning: '终止',
                      },
                    ]}
                    onClick={this.handleControlModal}
                    disabled={headerInfo.pcStatusCode === 'PUBLISHED'}
                    icon="termination"
                  >
                    <Icons type="jieshu" style={{ marginRight: '8px', fontSize: '16px' }} />
                    {intl.get(`spcm.contractChange.view.button.terminate`).d('终止')}
                  </PermissionButton>
                </Fragment>
              )}
              {!isEmpty(headerInfo) && templateListFlag && <Attachment {...attachmentViewProps} />}
              {pcHeaderId && (
                <Popover
                  content={intl.get('spcm.common.view.button.purchaserViewOnly').d('仅采购方可见')}
                  placement="bottomLeft"
                  trigger="hover"
                >
                  <PermissionButton
                    permissionList={[
                      {
                        code: 'srm.pc-admin.pc-purchaser.change.ps.attachment',
                        type: 'button',
                        meaning: '采购方附件',
                      },
                    ]}
                    className={styles.purchaseHeaderNumber}
                  >
                    <Upload viewOnly {...uploadProps} />
                  </PermissionButton>
                </Popover>
              )}
              {!isEmpty(headerInfo) && (isAttachmentSignUpload || isAttachmentSignAndText) && (
                <Popover
                  content={intl.get('spcm.common.view.button.uploadNum').d('文件最多上传4个')}
                  placement="bottomLeft"
                  trigger="hover"
                >
                  <Button className={styles.purchaseHeaderNumber} loading={submitContractLoading}>
                    <ComUpload viewOnly {...electricSignAttachmentProps} />
                  </Button>
                </Popover>
              )}
              <Button
                // loading={submitDeliveryLoading}
                icon="clock-circle-o"
                disabled={!pcHeaderId}
                onClick={() =>
                  this.handleModalVisible('operationRecordVisible', true, { pcHeaderId })
                }
              >
                {intl.get(`hzero.common.button.operating`).d('操作记录')}
              </Button>
              {!isPub && !isAttachmentSignUpload && (
                <PermissionButton
                  permissionList={[
                    {
                      code: 'srm.pc-admin.pc-purchaser.change.ps.text.comparison',
                      type: 'button',
                      meaning: '文本对比',
                    },
                  ]}
                  onClick={this.handleControlComparison}
                >
                  {intl.get('spcm.common.view.title.textComparison').d('文本对比')}
                </PermissionButton>
              )}
            </Fragment>
          ) : (
            <Fragment>
              {!isPub && (
                <Fragment>
                  <Button
                    loading={saving}
                    onClick={() => this.save()}
                    icon="save"
                    type="primary"
                    disabled={queryingHeader || saving}
                  >
                    {intl.get(`hzero.common.button.save`).d('保存')}
                  </Button>
                  <Button
                    loading={submitContractLoading}
                    icon="check"
                    onClick={this.preSubmit}
                    disabled={editStep === 0 || !pcHeaderId || formChanged}
                  >
                    {intl.get(`hzero.common.button.submit`).d('提交')}
                  </Button>
                </Fragment>
              )}
              {!isEmpty(headerInfo) && templateListFlag && <Attachment {...attachmentProps} />}
              {pcHeaderId && (
                <Popover
                  content={intl.get('spcm.common.view.button.purchaserViewOnly').d('仅采购方可见')}
                  placement="bottomLeft"
                  trigger="hover"
                >
                  <PermissionButton
                    permissionList={[
                      {
                        code: 'srm.pc-admin.pc-purchaser.change.ps.attachment',
                        type: 'button',
                        meaning: '采购方附件',
                      },
                    ]}
                    className={styles.purchaseHeaderNumber}
                  >
                    <Upload
                      {...uploadProps}
                      afterOpenUploadModal={(purchaserUuid) => this.handleSaveUuid(purchaserUuid)}
                    />
                  </PermissionButton>
                </Popover>
              )}
              {!isEmpty(headerInfo) && (isAttachmentSignUpload || isAttachmentSignAndText) && (
                <Popover
                  content={intl.get('spcm.common.view.button.uploadNum').d('文件最多上传4个')}
                  placement="bottomLeft"
                  trigger="hover"
                >
                  <Button className={styles.purchaseHeaderNumber} loading={submitContractLoading}>
                    <ComUpload {...electricSignAttachmentProps} />
                  </Button>
                </Popover>
              )}
              {!isPub && (
                <Button
                  loading={deleteHeaderLoading}
                  icon="delete"
                  disabled={!pcHeaderId}
                  onClick={this.delete}
                >
                  {intl.get(`hzero.common.button.delete`).d('删除')}
                </Button>
              )}
              <Button
                // loading={submitDeliveryLoading}
                icon="clock-circle-o"
                disabled={!pcHeaderId}
                onClick={() =>
                  this.handleModalVisible('operationRecordVisible', true, { pcHeaderId })
                }
              >
                {intl.get(`hzero.common.button.operating`).d('操作记录')}
              </Button>
              {!isAttachmentSignUpload && (
                <Button
                  loading={fetchTextPreViewLoading}
                  disabled={
                    !pcHeaderId &&
                    ['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(headerInfo.pcKindCode)
                  }
                  onClick={this.getTextPreViewUrl}
                >
                  {intl.get('spcm.common.view.title.textPreview').d('文本预览')}
                </Button>
              )}
              {remote
                ? remote.render('SPCM_CONTRACT_CHANGE_DETAIL_HEADER_BTN', null, remoteBtnProps)
                : null}
            </Fragment>
          )}
        </Header>
        <Content>
          <div id="spcm-contract-maintain-detail-content-inner-wrapper">
            <Spin
              spinning={queryingHeader || queryingPartner || queryingList}
              wrapperClassName={classnames(
                styles['contract-maintain-spin-wrapper'],
                DETAIL_DEFAULT_CLASSNAME
              )}
            >
              <Row gutter={24}>
                <Col span={21}>
                  <Card
                    key="contractHeaderInformation"
                    id="spcm-contract-maintain-detail-contract-header-information"
                    bordered={false}
                    className={DETAIL_CARD_CLASSNAME}
                    title={
                      <h3>
                        {intl
                          .get(`spcm.common.view.message.title.contractHeaderInformation`)
                          .d('采购协议头信息')}
                      </h3>
                    }
                  >
                    <ContractHeader {...headerInfoFormProps} />
                  </Card>
                  {pcHeaderId && (
                    <div
                      key="subjectInformation"
                      id="spcm-contract-maintain-detail-contract-subject"
                    >
                      <Tabs activeKey={activeKey} animated={false} onChange={this.handleSaveKey}>
                        <TabPane
                          tab={intl
                            .get(`spcm.common.view.message.title.title.contractSubject`)
                            .d('协议标的')}
                          key="contractSubjectInfo"
                        >
                          <ContractSubject {...contractSubjectListProps} />
                        </TabPane>
                        <TabPane
                          tab={intl
                            .get(`spcm.common.view.message.title.title.contractStage`)
                            .d('协议阶段')}
                          key="contractStage"
                        >
                          <ContractStage {...contractStageListProps} />
                        </TabPane>
                        {rebateFlag && (
                          <TabPane
                            tab={intl
                              .get('spcm.common.view.message.title.ContractRebate')
                              .d('返利信息')}
                            key="contractRebate"
                          >
                            <ContractRebate {...contractRebateProps} />
                          </TabPane>
                        )}
                      </Tabs>
                    </div>
                  )}

                  {pcHeaderId && (
                    <Card
                      key="contractPartnerInformation"
                      id="spcm-contract-maintain-detail-contract-partner"
                      bordered={false}
                      className={DETAIL_CARD_CLASSNAME}
                      title={
                        <h3>
                          {intl
                            .get(`spcm.common.view.message.title.contractPartnerInformation`)
                            .d('采购协议伙伴信息')}
                        </h3>
                      }
                    >
                      <ContractPartner {...partnerListProps} />
                    </Card>
                  )}
                  {pcHeaderId &&
                    !['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(headerInfo.pcKindCode) && (
                      <Card
                        key="contractBusinessTermsInformation"
                        id="spcm-contract-maintain-detail-contract-business-terms"
                        bordered={false}
                        className={DETAIL_CARD_CLASSNAME}
                        title={
                          <h3>
                            {intl
                              .get(`spcm.common.view.message.title.purcAgreementBusinessTerms`)
                              .d('采购协议业务条款')}
                          </h3>
                        }
                      >
                        <ContractBusinessTerms {...contractBusinessTermsListProps} />
                      </Card>
                    )}
                  {pcHeaderId && !!enableRule && (
                    <Card
                      key="discountRule"
                      id="spcm-contract-maintain-detail-discount-rule"
                      bordered={false}
                      className={DETAIL_CARD_CLASSNAME}
                      title={
                        <h3>
                          {intl
                            .get('spcm.common.view.message.title.dicountRule')
                            .d('优惠规则-折扣')}
                        </h3>
                      }
                    >
                      {this.renderDiscountRule(discountRuleProps)}
                    </Card>
                  )}
                  {pcHeaderId && !!enableRule && (
                    <Card
                      key="rebateRule"
                      id="spcm-contract-maintain-detail-rebate-rule"
                      bordered={false}
                      className={DETAIL_CARD_CLASSNAME}
                      title={
                        <h3>
                          {intl.get('spcm.common.view.message.title.rebateRule').d('优惠规则-返利')}
                        </h3>
                      }
                    >
                      {this.renderRebateRule(rebateRuleProps)}
                    </Card>
                  )}
                  {pcHeaderId && configSetting['010601'] === '1' && (
                    <Card
                      key="approveRecordInformation"
                      id="spcm-contract-change-detail-approve-record"
                      bordered={false}
                      className={DETAIL_CARD_CLASSNAME}
                      title={
                        <h3>
                          {intl
                            .get(`spcm.common.view.message.title.approveRecordInformation`)
                            .d('审批记录')}
                        </h3>
                      }
                    >
                      <ApproveRecord pcHeaderId={pcHeaderId} />
                    </Card>
                  )}
                  {pcHeaderId && !supplementFlag && (
                    <Card
                      key="contractReplenishList"
                      id="spcm-contract-approval-detail-contract-replenish"
                      bordered={false}
                      className={DETAIL_CARD_CLASSNAME}
                      title={
                        <h3>
                          {intl
                            .get(`spcm.common.view.message.title.contractReplenishList`)
                            .d('补充协议列表')}
                        </h3>
                      }
                    >
                      {this.renderContractReplenish(contractReplenishProps)}
                    </Card>
                  )}
                  {pcHeaderId &&
                    editStep === 1 &&
                    !['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(headerInfo.pcKindCode) &&
                    !isAttachmentSignUpload && (
                      <Card
                        key="contractOnlineEdit"
                        id="spcm-contract-maintain-detail-contract-online-edit"
                        bordered={false}
                        className={DETAIL_CARD_CLASSNAME}
                        title={
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <h3 style={{ fontSize: '14px' }}>
                              {intl
                                .get(`spcm.common.title.contractOnlineEdit`)
                                .d('采购协议文本编辑')}
                            </h3>
                            <Button
                              type="primary"
                              onClick={() => this.fullScreen('fullScreenFlag', true)}
                            >
                              {intl.get(`spcm.common.title.onlineEdit`).d('文本编辑')}
                            </Button>
                          </div>
                        }
                      >
                        {/* <div className={styles['button-wrapper']}> */}
                        {/*  <Button */}
                        {/*    type="primary" */}
                        {/*    onClick={() => this.fullScreen('fullScreenFlag', true)} */}
                        {/*  > */}
                        {/*    {intl.get(`hzero.common.button.fullScreen`).d('全屏模式')} */}
                        {/*  </Button> */}
                        {/* </div> */}
                        {/* <EditorOnline */}
                        {/*  iframeStyle={{ */}
                        {/*    width: '100%', */}
                        {/*    height: `${(document.body.clientHeight - 96) * 0.9}px`, */}
                        {/*  }} */}
                        {/*  pcHeaderId={pcHeaderId} */}
                        {/*  permissionCode={headerInfo.pcStatusCode !== 'PENDING' ? 'VIEW' : undefined} */}
                        {/*  onRef={(node) => { */}
                        {/*    this.editorOnlineRef = node; */}
                        {/*  }} */}
                        {/* /> */}
                      </Card>
                    )}
                </Col>
                <Col span={3} className={styles['anchor-wrapper']}>
                  <Affix
                    style={{
                      top: '200px',
                      width: 'calc( 100% - 11px )',
                      position: 'absolute',
                    }}
                    offsetTop={224}
                    target={this.getAffixContainer}
                  >
                    <Anchor offsetTop={24} getContainer={this.getAffixContainer}>
                      {pcHeaderId && (
                        <Link
                          href="#spcm-contract-maintain-detail-contract-header-information"
                          title={intl
                            .get(`spcm.common.view.message.title.basicInformation`)
                            .d('基本信息')}
                        />
                      )}
                      {pcHeaderId && (
                        <Link
                          href="#spcm-contract-maintain-detail-contract-subject"
                          title={intl
                            .get(`spcm.common.view.message.title.subjectInformation`)
                            .d('标的信息')}
                        />
                      )}
                      {pcHeaderId && (
                        <Link
                          href="#spcm-contract-maintain-detail-contract-partner"
                          title={intl
                            .get(`spcm.common.view.message.title.partnerInformation`)
                            .d('伙伴信息')}
                        />
                      )}
                      {pcHeaderId &&
                        !['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(headerInfo.pcKindCode) && (
                          <Link
                            href="#spcm-contract-maintain-detail-contract-business-terms"
                            title={intl
                              .get(`spcm.common.view.message.title.businessTermsInformation`)
                              .d('业务条款')}
                          />
                        )}
                      {pcHeaderId && !!enableRule && (
                        <Link
                          href="#spcm-contract-maintain-detail-discount-rule"
                          title={intl
                            .get('spcm.common.view.message.title.dicountRule')
                            .d('优惠规则-折扣')}
                        />
                      )}
                      {pcHeaderId && !!enableRule && (
                        <Link
                          href="#spcm-contract-maintain-detail-rebate-rule"
                          title={intl
                            .get('spcm.common.view.message.title.rebateRule')
                            .d('优惠规则-返利')}
                        />
                      )}
                      {pcHeaderId && configSetting['010601'] === '1' && (
                        <Link
                          href="#spcm-contract-change-detail-approve-record"
                          title={intl
                            .get(`spcm.common.view.message.title.approveRecordInformation`)
                            .d('审批记录')}
                        />
                      )}
                      {pcHeaderId && !supplementFlag && (
                        <Link
                          href="#spcm-contract-approval-detail-contract-replenish"
                          title={intl.get(`spcm.common.title.contractReplenish`).d('补充协议')}
                        />
                      )}
                      {pcHeaderId &&
                        editStep === 1 &&
                        !['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(headerInfo.pcKindCode) &&
                        !isAttachmentSignUpload && (
                          <Link
                            href="#spcm-contract-maintain-detail-contract-online-edit"
                            title={intl.get(`spcm.common.title.onlineEdit`).d('文本编辑')}
                          />
                        )}
                    </Anchor>
                  </Affix>
                </Col>
              </Row>
            </Spin>
          </div>
          <Modal
            wrapClassName={styles['full-modal-wrapper']}
            bodyStyle={{ height: `${document?.body?.clientHeight - 39}px` }}
            {...ModalProps}
            title={
              <Button
                icon="shrink"
                style={{ float: 'right' }}
                onClick={() => this.fullScreen('fullScreenFlag', false)}
              >
                {intl.get(`hzero.common.button.exitFullScreen`).d('退出全屏')}
              </Button>
            }
          >
            <EditorOnline
              sourcePage="contractMaintain"
              iframeStyle={{
                width: '100%',
                // height: `${document.body.clientHeight}px`,
                height: 'calc(100vh - 50px)',
              }}
              pcHeaderId={pcHeaderId}
              headerInfo={headerInfo}
              fullScreenFlag={fullScreenFlag}
            />
          </Modal>
        </Content>
        <OperationRecordDrawer {...operationRecordProps} />
        {terminateReasonVisible && <TerminateReasonModal {...terminateReasonProps} />}
        {textComparisonVisible && <TextComparisonModal {...textComparisonProps} />}
      </Fragment>
    );
  }
}
