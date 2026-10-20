import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { DataSet, Button, Spin, Modal as ModalPro } from 'choerodon-ui/pro';
import { Row, Col, Affix, Anchor, Card, Tabs, Popover, Icon } from 'choerodon-ui';
import { Modal } from 'hzero-ui'; // 暂时未用c7n的，因为该组件没有hzero处理得好
import Upload from 'srm-front-boot/lib/components/Upload';
import { Bind, Debounce } from 'lodash-decorators';
// import withCustomize from 'srm-front-cuz/lib/components/c7n/withCustomize';
import querystring from 'querystring';
import {
  merge,
  cloneDeep,
  throttle,
  isEmpty,
  isPlainObject,
  isArray,
  isString,
  compose,
} from 'lodash';
import { routerRedux } from 'dva/router';
import moment from 'moment';
import ComUpload from '@/routes/components/ComUpload';
import PreferentialRule from '@/routes/components/PreferentialRule';
// import _objectSpread from '@babel/runtime/helpers/esm/objectSpread2';
// import uuid from 'uuid/v4';
import {
  queryNewOrOldLink,
  createPaymentPlan,
  preSubmitValid,
} from '@/services/newContractService';
import { fetchContractOnlineHTMLType, fetchWpsV5TextPreView } from '@/services/editorOnlineService';
import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import { Button as PermissionButton } from 'components/Permission';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  DEFAULT_DATE_FORMAT,
  DETAIL_CARD_CLASSNAME,
  DEFAULT_DATETIME_FORMAT,
} from 'utils/constants';
import { getResponse, getAccessToken, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import { HZERO_FILE } from 'utils/config';
import {
  queryCommonDoubleUomConfig,
  isBlackTenant,
  openTermsModal,
  allSignList,
} from '@/utils/util';
import { oldUnitCodeList, newUnitCodeList, readOnlyCodeList } from '@/utils/enum';
// import Debounce from 'lodash/debounce';
import hocRemote from 'utils/remote';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import {
  invalidContract,
  terminateContract,
  terminateContractValid,
  changeContract,
  updateContract,
  updateHeaderInfo,
} from '@/services/contractControlService';
import { getRecommendSupplierFlag } from '@/services/contractCommonService';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';

import { checkOrderSignContract } from '@/utils/commonCheck';

import ContractHeader from '../components/ContractHeader';
// eslint-disable-next-line import/no-named-as-default
import ContractSubject from '../components/ContractSubject';
import ContractStage from '../components/ContractStage';
import ContractRebate from '../components/ContractRebate';
import ContractPartner from '../components/ContractPartner';
import ContractBusinessTerms from '../components/ContractBusinessTerms';
import ApproveRecord from '../components/ApproveRecord';
import TextComparisonModal from '../components/TextComparisonModal';
import OperationRecordDrawer from '../../components/OperationRecordDrawer';
import styles from '../components/index.less';
import '../index.less';

import {
  headerFormDS,
  subjectDS,
  stageDS,
  rebateDS,
  partnerDS,
  businessTermsDS,
  approveRecordDS,
} from '../components/DataSet';
import showTerminateModal from '../ShowTerminateModal';

import EditorOnline from '../../components/EditorOnline';
import Attachment from '../../components/Upload';

const { Link } = Anchor;
const { TabPane } = Tabs;
const CONTRACT_CONTROL = 'srm.pc-admin.pc-purchaser.control';

class ContractControlDetail extends Component {
  editorOnlineRef;

  // 默认黑租户，调用旧租户单元
  isBlackTenantFlag = true;

  constructor(props) {
    super(props);
    const {
      match: {
        params: { pcHeaderId },
      },
      location: { search, pathname },
    } = props;
    const isPub = pathname.includes('/pub'); // 判断是否为pub页面
    const routerParams = querystring.parse(search.substr(1));
    const editable = routerParams.hasChanged === 'true'; // 可编辑
    const { isQuoteSource } = routerParams;
    // dataset 初始化
    const headerFormDs = new DataSet(headerFormDS({ pcHeaderId, editable }));
    const rebateDs = new DataSet(rebateDS({ pcHeaderId, editable }));
    const partnerDs = new DataSet(partnerDS({ pcHeaderId, editable }));
    const businessTermsDs = new DataSet(businessTermsDS({ pcHeaderId, editable }));
    const approveRecordDs = new DataSet(approveRecordDS({ pcHeaderId, editable }));
    this.state = {
      editable,
      pcHeaderId,
      headerFormDs,
      pcSubjectDs: null,
      pcStageDs: null,
      rebateDs,
      partnerDs,
      businessTermsDs,
      approveRecordDs,
      headerInfo: {},
      termDataSource: [],
      pcStageDataSource: [],
      pcSubjectDataSource: [],
      partnerDataSource: [],
      pcRebateDataSource: [],
      templateList: [],
      fullScreenFlag: false, // 在线编辑全屏
      textComparisonVisible: false, // 文本对比
      templateListFlag: false,
      isPub,
      conChangeLoading: false, // 变更协议loading
      conSaveLoading: false, // 保存协议loading
      isQuoteSource,
      headerInfoKey: 'control-headerInfo',
      contractSubjectInfoKey: 'control-contractSubjectInfo',
      contractStageKey: 'control-contractStage',
      contractRebateKey: 'control-contractRebate',
      contractPartnerKey: 'control-contractPartner',
      discountRuleKey: 'control-discountRule',
      rebateRuleKey: 'control-rebateRule',
      operationRecordVisible: false,
      unitCodeList: {},
    };
  }

  async componentDidMount() {
    const _this = this;
    const isBlackTenantFlag = await isBlackTenant([
      'srm.pc-admin.pc-purchaser.new-control.ps.default',
    ]);
    // 不是黑名单中的租户，采用新的自定义
    this.setState({
      unitCodeList: {
        ...(isBlackTenantFlag ? oldUnitCodeList : newUnitCodeList),
      },
    });

    this.setState({
      conChangeLoading: true,
    });
    const { pcHeaderId, editable } = this.state;
    // 判断是新链路还是老链路
    queryNewOrOldLink().then((linkRes) => {
      this._linkFlag = !!linkRes;
      const headerFormDsNew = new DataSet(
        headerFormDS({ pcHeaderId, editable, _linkFlag: !!linkRes })
      );
      this.setState(
        {
          headerFormDs: headerFormDsNew,
        },
        () => {
          _this.fetchHeader().then((res) => {
            const headerInfoRes = { ...res };
            this.getRecommendSupplierFlag(headerInfoRes);
            const isReplenishCreate = localStorage.getItem('isReplenishCreate');
            if (isReplenishCreate) {
              const { headerFormDs } = _this.state;
              const headerData = headerFormDs.toJSONData();
              console.log('headerData', headerData, headerInfoRes);
              _this.fetchList(headerInfoRes);
            } else {
              _this.fetchList(headerInfoRes);
            }
          });
        }
      );
    });
  }

  /**
   * 引用采购申请创建查询业务规则是否开启推荐供应商
   */
  @Bind()
  async getRecommendSupplierFlag(headerInfo = {}) {
    const { pcSourceCode } = headerInfo;
    if (pcSourceCode === 'PURCHASE_NEED') {
      const res = getResponse(await getRecommendSupplierFlag());
      this.setState({ prLineImport: res === 1 });
    }
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
        message: `${intl.get('hzero.common.validation.notNull', {
          name: msg.join(','),
        })},${intl
          .get('spcm.common.model.common.upContractWithUpload')
          .d('请通过【附件上传】上传协议文本。')}`,
      });
      return null;
    } else {
      return 1;
    }
  }

  /**
   * 检查是否有非本条外的项修改过
   * @param {*} key
   * @param {*} selectedRows
   * @param {*} dataSource
   */
  @Bind()
  checkModified(key) {
    const {
      headerFormDs,
      pcSubjectDs,
      pcStageDs,
      // rebateDs,
      partnerDs,
      // businessTermsDs,
    } = this.state;

    let otherModeEdited = false; // 除当前操作列表，是否还有其他模块进行过修改
    let updateData = []; // 修改的列表项集合
    let selectedData = []; // 选择的列表项集合
    let primaryKey; // 用于匹配同一列表项在updateData和selectedData两个列表中的唯一标识
    let modifiedFlag = false; // 当前是否存在已修改却未保存的数据
    switch (key) {
      case 'pcSubject':
        otherModeEdited =
          headerFormDs.isModified() || partnerDs.isModified() || pcStageDs.isModified();

        updateData = pcSubjectDs.toJSONData();
        selectedData = pcSubjectDs.selected;
        primaryKey = 'pcSubjectId';
        break;
      case 'partner':
        otherModeEdited =
          headerFormDs.isModified() || pcSubjectDs.isModified() || pcStageDs.isModified();

        updateData = partnerDs.toJSONData();
        selectedData = partnerDs.selected;
        primaryKey = 'partnerId';
        break;
      case 'ladderQuote':
      default:
        return true;
    }

    const updateKeys = updateData.map((it) => it[primaryKey]);
    const selectKeys = selectedData.map((it) => it.data[primaryKey]);

    const uCreateKeys = updateKeys.filter((i) => i == null);
    const sCreateKeys = selectKeys.filter((i) => i == null);
    const sExistKeys = selectKeys.filter((i) => !!i);
    if (uCreateKeys.length === sCreateKeys.length) {
      if (isEmpty(sExistKeys)) {
        modifiedFlag = true;
      } else {
        modifiedFlag = updateKeys.filter((i) => !!i).every((id) => selectKeys.includes(id));
        modifiedFlag = modifiedFlag && !otherModeEdited;
      }
    }

    return modifiedFlag;
  }

  /**
   * 查询详情数据并初始化
   * @param headerInfo 协议头信息
   * @param hasChanged 是否变更
   */
  @Bind()
  async fetchList(headerInfo, hasChanged = false) {
    const {
      editable,
      pcHeaderId,
      headerFormDs,
      rebateDs,
      partnerDs,
      businessTermsDs,
      approveRecordDs,
      unitCodeList,
    } = this.state;
    const { remote } = this.props;
    await this.fetchConfigSetting().then(async (configSetting = {}) => {
      const doubleUomFlag = configSetting['000112'] === '1';

      // 初始化Ds，需要使用头信息
      const pcSubjectDs = new DataSet(
        subjectDS({ pcHeaderId, editable, doubleUomFlag, headerFormDs, headerInfo })
      );
      // 双单位
      const res = await queryCommonDoubleUomConfig();
      pcSubjectDs.setState({ doubleUnitEnabled: res });

      const pcStageDs = new DataSet(stageDS({ pcHeaderId, editable, headerInfo, remote }));

      this.fetchStageAndPartnerList(headerInfo.pcTypeId);

      const { content: pcSubjectDataSource } = await this.fetchTableList(
        pcSubjectDs,
        editable ? unitCodeList.SUBJECT : readOnlyCodeList.SUBJECT
      );
      const { content: pcStageDataSource } = await this.fetchTableList(
        pcStageDs,
        editable ? unitCodeList.STAGE : readOnlyCodeList.STAGE
      );

      const contractSubjectInfoAndStageKeyObj = hasChanged
        ? {
            contractSubjectInfoKey: 'control-contractSubjectInfo-Changed',
            contractStageKey: 'control-contractStage-Changed',
          }
        : {};

      this.setState({
        headerInfo,
        pcSubjectDs,
        pcStageDs,
        pcSubjectDataSource,
        pcStageDataSource,
        ...contractSubjectInfoAndStageKeyObj,
      });
    });
    const { content: pcRebateDataSource } = await this.fetchTableList(
      rebateDs,
      editable ? unitCodeList.REBATE : readOnlyCodeList.REBATE
    );
    const partnerDataSource = await this.fetchTableList(
      partnerDs,
      editable ? unitCodeList.PARTNER : readOnlyCodeList.PARTNER
    );
    businessTermsDs.setState({
      headerInfo,
    });
    const termDataSource = await this.fetchTableList(businessTermsDs);
    const contractRebateAndPartnerKeyObj = hasChanged
      ? {
          contractRebateKey: 'control-contractRebate-Changed',
          contractPartnerKey: 'control-contractPartner-Changed',
        }
      : {};
    this.fetchTableList(approveRecordDs);
    this.handleFetchConfigAttachment();
    this.setState({
      conSaveLoading: false,
      pcRebateDataSource,
      partnerDataSource,
      termDataSource,
      ...contractRebateAndPartnerKeyObj,
      conChangeLoading: false,
      discountRuleKey: hasChanged ? 'control-discountRule-changed' : 'control-discountRule',
      rebateRuleKey: hasChanged ? 'control-rebateRule-changed' : 'control-rebateRule',
    });
  }

  /**
   * 查询协议阶段值集、合作伙伴值集
   */
  @Bind()
  fetchStageAndPartnerList(pcTypeId) {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractCommon/fetchStageAndPartnerList',
      payload: {
        pcTypeId,
      },
    });
  }

  /**
   * 查询头信息
   */
  @Bind()
  fetchHeader(params) {
    const { headerFormDs, editable, unitCodeList } = this.state;
    headerFormDs.setQueryParameter('queryParams', {
      customizeUnitCode:
        params?.editable || editable ? unitCodeList.DETAIL : readOnlyCodeList.DETAIL,
    });

    return headerFormDs.query();
  }

  /**
   * 查询表格数据
   * @param {*} ds dataset
   * @param {*} customizeUnitCode 个性化单元code
   * @override 海亮
   */
  @Bind()
  fetchTableList(ds, customizeUnitCode) {
    const { remote } = this.props;
    ds.setQueryParameter('queryParams', {
      customizeUnitCode,
    });
    if (remote?.event) {
      remote.event.fireEvent('handleCuxFetchTableList', {
        ds,
        customizeUnitCode,
        current: this,
      });
    }
    return ds.query();
  }

  @Bind()
  formatTime(dataSource = [], fields = [], commonFormatStr = DEFAULT_DATE_FORMAT) {
    if (isArray(dataSource)) {
      let formatString = commonFormatStr; // 默认的格式化配置
      return dataSource.map((item) => {
        const newItem = {};
        fields.forEach((field) => {
          let key = field; // 需要格式化的字段名，默认为传入的field
          if (isPlainObject(field)) {
            // 当其为对象时
            key = field.keyName;
            formatString = field.formatStr;
          }

          if (!isString(field)) {
            throw Error(
              `The type of target which need to format is Error! (1, string time format 2, moment time format 3, object that contains target key and target format`
            );
          }

          newItem[key] = item[key] ? moment(item[key]).format(formatString) : undefined;
        });
        return {
          ...item,
          ...newItem,
        };
      });
    }
  }

  /**
   * 格式化时间
   * @param {*} [dataSource=[]] 数据数组
   * @param {*} [fields=[]] 字段数组
   */
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
   * 查询配置中心配置
   */
  @Bind()
  fetchConfigSetting() {
    const { dispatch } = this.props;
    return dispatch({
      type: 'contractCommon/fetchConfigSetting',
    });
  }

  /**
   * @param {String} field 设置的字段
   * @param {Boolean} flag 设置的值
   */
  @Bind()
  fullScreen(field, flag) {
    this.setState({ [field]: !!flag });
  }

  /**
   * getParent-获取 dom 的parent
   * @param {HTMLElement} dom
   * @return {HTMLElement}
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
   * 文本对比modal
   */
  @Bind()
  handleControlComparison() {
    const { textComparisonVisible } = this.state;
    this.setState({ textComparisonVisible: !textComparisonVisible });
  }

  /**
   * 变更操作
   */
  @Bind()
  @Debounce(200)
  async handleContractChange() {
    const { dispatch } = this.props;
    const {
      headerInfo,
      termDataSource,
      pcStageDataSource,
      pcSubjectDataSource,
      partnerDataSource,
      pcRebateDataSource,
    } = this.state;
    const { pcKindCode } = headerInfo;

    let payload = {
      ...merge(headerInfo),
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

    if (['CONFIRMED', 'EFFECTED'].includes(headerInfo.pcStatusCode)) {
      payload = {
        ...payload,
        pcSubjectDetailDTOList: cloneDeep(
          this.formatSubjectTime(pcSubjectDataSource, [
            'deliverDate',
            'priceEndDate',
            'priceStartDate',
          ])
        ),
        pcPartnerDetailDTOList: cloneDeep(partnerDataSource),
        pcStageDetailDTOList: cloneDeep(pcStageDataSource),
        pcTermDetailDTOList: cloneDeep(termDataSource),
        pcRebateInformationlist: cloneDeep(pcRebateDataSource),
      };
    }

    const response = getResponse(await changeContract(payload));
    this.setState({ conChangeLoading: false });
    if (response) {
      notification.success();
      const { pcHeaderId: headerId, pcStatusCode, editStep, ...otherData } = response;
      if (pcStatusCode === 'CHANGE_TO_APPROVAL') {
        dispatch(
          routerRedux.push({
            pathname: `/spcm/contract-control/list`,
          })
        );
      } else {
        this.toChangeContract({ headerId, editStep, pcKindCode, otherData });
      }
    }
  }

  /**
   * 校验数据（保存或提交前）
   * validModified 校验字段是否进行过修改
   */
  @Bind()
  async handleContractValidate(validModified) {
    const {
      headerInfo,
      headerFormDs,
      pcSubjectDs,
      pcStageDs,
      rebateDs,
      partnerDs,
      businessTermsDs,
      pcStageDataSource,
      pcSubjectDataSource,
    } = this.state;

    // 根据验收类型验证标的或阶段行
    let headerData = headerFormDs.toJSONData();
    headerData = this.handleObjectSpread(headerInfo, headerData[0]);
    let pcSubjectDetailDTOList = pcSubjectDs.toJSONData();
    pcSubjectDetailDTOList = this.handleMergeArray(
      pcSubjectDataSource.slice(),
      this.formatSubjectTime(pcSubjectDetailDTOList, [
        'deliverDate',
        'priceEndDate',
        'priceStartDate',
      ]),
      'pcSubjectId'
    );
    const pcStageDetailDTOList = this.handleMergeArray(
      pcStageDataSource.slice(),
      pcStageDs.toJSONData(),
      'pcStageId'
    );
    if (
      headerData.acceptType === 'stage' &&
      isEmpty(pcStageDetailDTOList) &&
      headerData.pcHeaderId
    ) {
      Modal.confirm({
        title: intl
          .get(`spcm.common.view.message.title.stageCannotSave`)
          .d('验收类型为按阶段验收时，协议阶段行不可为空'),
      });
      return;
    }
    if (
      headerData.acceptType === 'target' &&
      isEmpty(pcSubjectDetailDTOList) &&
      headerData.pcHeaderId
    ) {
      Modal.confirm({
        title: intl
          .get(`spcm.common.view.message.title.targetCannotSave`)
          .d('验收类型为按标的验收时，协议标的行不可为空'),
      });
      return;
    }

    const isNotATTACHMENT = !['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(headerInfo.pcKindCode); // 非附件类协议

    const headerFlag = await headerFormDs.validate();
    const subjectFlag = await pcSubjectDs.validate();
    const stageFlag = await pcStageDs.validate();
    const partnerFlag = await partnerDs.validate();
    const pcRebateFlag = headerInfo.rebateFlag ? await rebateDs.validate() : true;
    const pcTermFlag = isNotATTACHMENT ? await businessTermsDs.validate() : true;
    if (!headerFlag || !subjectFlag || !stageFlag || !partnerFlag || !pcRebateFlag || !pcTermFlag) {
      return;
    }

    if (validModified) {
      return (
        headerFormDs.isModified() ||
        pcSubjectDs.isModified() ||
        pcStageDs.isModified() ||
        partnerDs.isModified() ||
        rebateDs.isModified() ||
        businessTermsDs.isModified()
      );
    } else {
      return true;
    }
  }

  /**
   * 整合数据（保存或提交前）
   */
  @Bind()
  async handleContractDataMerge() {
    const {
      headerInfo,
      termDataSource,
      pcStageDataSource,
      pcSubjectDataSource,
      partnerDataSource,
      pcRebateDataSource,
      headerFormDs,
      pcSubjectDs,
      pcStageDs,
      rebateDs,
      partnerDs,
      businessTermsDs,
    } = this.state;
    const isNotATTACHMENT = !['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(headerInfo.pcKindCode); // 非附件类协议

    let headerData = headerFormDs?.current?.toJSONData();
    headerData = this.handleObjectSpread(headerInfo, headerData);

    let pcSubjectDetailDTOList = pcSubjectDs.toData();
    pcSubjectDetailDTOList = this.handleMergeArray(
      pcSubjectDataSource.slice(),
      this.formatSubjectTime(pcSubjectDetailDTOList, [
        'deliverDate',
        'priceEndDate',
        'priceStartDate',
      ]),
      'pcSubjectId'
    );

    const pcStageDetailDTOList = this.handleMergeArray(
      pcStageDataSource.slice(),
      pcStageDs.toJSONData(),
      'pcStageId'
    );

    const pcPartnerDetailDTOList = this.handleMergeArray(
      partnerDataSource.slice(),
      partnerDs.toJSONData(),
      'partnerId'
    );

    const pcRebateInformationlist = headerInfo.rebateFlag
      ? this.handleMergeArray(
          pcRebateDataSource.slice(),
          rebateDs.toJSONData(),
          'rebateInformationId'
        )
      : [];

    let pcTermDetailDTOList = [];
    if (isNotATTACHMENT) {
      pcTermDetailDTOList = businessTermsDs.toJSONData();
      pcTermDetailDTOList = [
        ...pcTermDetailDTOList.filter((i) => !['DATE', 'DATETIME'].includes(i.termType)),
        ...this.formatTime(
          pcTermDetailDTOList.filter((it) => it.termType === 'DATE'),
          ['termContent'],
          DEFAULT_DATE_FORMAT
        ),
        ...this.formatTime(
          pcTermDetailDTOList.filter((item) => item.termType === 'DATETIME'),
          ['termContent'],
          DEFAULT_DATETIME_FORMAT
        ),
      ];
      pcTermDetailDTOList = this.handleMergeArray(
        termDataSource.slice(),
        pcTermDetailDTOList,
        'termId'
      );
    }
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

    return {
      ...headerData,
      pcSubjectDetailDTOList,
      pcStageDetailDTOList,
      pcRebateInformationlist,
      pcPartnerDetailDTOList,
      pcTermDetailDTOList,
    };
  }

  /**
   * delete 删除采购申请
   */
  @Bind()
  handleDeleteContract() {
    const { dispatch } = this.props;
    const { headerInfo } = this.state;
    Modal.confirm({
      title: intl.get(`spcm.common.view.message.title.confirmDelete`).d('是否删除'),
      onOk: () => {
        dispatch({
          type: 'contractMaintain/delete',
          payload: [headerInfo],
        }).then((res) => {
          if (res) {
            notification.success();
            dispatch(
              routerRedux.push({
                pathname: `/spcm/contract-control/list`,
              })
            );
          }
        });
      },
    });
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
   * 作废
   */
  @Bind()
  handleInvalid() {
    const _this = this;
    const { headerInfo } = this.state;
    Modal.confirm({
      title: intl.get(`spcm.contractChange.title.sureCancel`).d('确认作废'),
      async onOk() {
        const response = getResponse(await invalidContract([headerInfo]));
        if (response) {
          notification.success();
          _this.props.history.push('/spcm/contract-control/list');
        }
      },
    });
  }

  /**
   * 覆盖性合并对象
   * @param {*} oldObj
   * @param {*} newObj
   */
  @Bind()
  handleObjectSpread(oldObj, newObj) {
    if (typeof newObj !== 'object' || newObj == null || Object.keys(newObj).length === 0) {
      return oldObj;
    }
    if (typeof oldObj !== 'object' || oldObj == null) return newObj;

    return Array.from(new Set(Object.keys(oldObj).concat(Object.keys(newObj)))).reduce(
      (spreadObject, key) => {
        // eslint-disable-next-line
        spreadObject[key] = Object.prototype.hasOwnProperty.call(newObj, key) ? newObj[key] : null;

        return spreadObject;
      },
      {}
    );
  }

  /**
   * 合并对象数组
   * @param originSource      原数据集合
   * @param updatedSource     需要更新的数据集合
   * @param itemKey           查找合并目标对象的唯一标识
   * 这个判断有问题如果isOriginLarge 为FALSE，会有问题，所以加了一个ONLY
   * 加上影响太大只能加了这一个
   */
  @Bind()
  handleMergeArray(originSource, updatedSource, itemKey) {
    if (isArray(originSource) && isArray(updatedSource)) {
      // const isOriginLarge = originSource.length >= updatedSource.length;
      // let outerList;
      // let innerList;
      const outerList = originSource;
      const reTtruneOuterList = originSource.map((item) => {
        return {
          ...item,
        };
      });
      const innerList = updatedSource;
      // if (isOriginLarge) {
      //   outerList = originSource;
      //   innerList = updatedSource;
      // } else {
      //   outerList = updatedSource;
      //   innerList = originSource;
      // }
      innerList.forEach((upItem) => {
        const tarIndex = outerList.findIndex((item) => item[itemKey] === upItem[itemKey]);
        if (tarIndex > -1) {
          reTtruneOuterList[tarIndex] = this.handleObjectSpread(outerList[tarIndex], upItem);
          // outerList[tarIndex] = _objectSpread({}, outerList[tarIndex], {}, upItem);
        } else {
          reTtruneOuterList.push(upItem);
        }
      });

      return reTtruneOuterList;
    } else {
      throw Error('The origin Source or updated Source is not an Array!');
    }
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
   * 保存purchaserAttachmentUuid
   * @param {*} purchaserAttachmentUuid
   */
  @Bind()
  async handleSaveUuid(purchaserAttachmentUuid) {
    const { headerInfo, headerFormDs } = this.state;
    if (!headerInfo.purchaserAttachmentUuid) {
      const response = getResponse(
        await updateHeaderInfo({
          ...headerInfo,
          purchaserAttachmentUuid,
        })
      );
      if (response) {
        headerFormDs.current.set({
          purchaserAttachmentUuid: response.purchaserAttachmentUuid,
          objectVersionNumber: response.objectVersionNumber,
        });
        this.setState({
          headerInfo: {
            ...headerInfo,
            ...response,
          },
        });
      }
    }
  }

  /**
   * 终止协议前置处理
   * @returns
   */
  @Bind()
  @Debounce(500)
  async terminateContractFunc() {
    const { headerInfo } = this.state;
    const { customizeForm } = this.props;
    const notAllowedFlag = checkOrderSignContract(headerInfo);
    if (notAllowedFlag) {
      return;
    }
    const validRes = getResponse(await terminateContractValid([headerInfo.pcHeaderId]));
    if (validRes) {
      // strategy：2，existsDwonStream： Y，显示弱提示：合同存在有效下游订单/物流/预付款，合同不可终止
      if (validRes?.strategy === '2' && validRes?.existsDwonStream === 'Y') {
        const feedback = await ModalPro.confirm({
          title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
          children: intl
            .get('spcm.common.view.message.cannotTerminate')
            .d('合同存在有效下游订单/物流/预付款，合同不可终止'),
        });
        if (feedback === 'ok') {
          showTerminateModal(this.handleTerminate, customizeForm);
        }
        return false;
      }
      // strategy：0或1，直接终止
      showTerminateModal(this.handleTerminate, customizeForm);
    }
  }

  /**
   * 终止
   */
  @Bind()
  async handleTerminate(terminateDs) {
    const { headerInfo } = this.state;

    const flag = await terminateDs.validate();
    const data = (await terminateDs.toData()[0]) || {};
    const params = {
      pcHeaderStatus: 'TERMINATION_CONFIRM',
      pcHeaderDetailDtos: [
        {
          ...headerInfo,
          ...data,
          terminationReason: data.terminationReason,
          terminationAttachmentUuid: data.terminationAttachmentUuid,
        },
      ],
    };
    if (flag) {
      const response = getResponse(await terminateContract(params));
      if (response) {
        notification.success();
        this.props.history.push('/spcm/contract-control/list');
      }
      return true;
    }
    return false;
  }

  /**
   * 更新头上的协议文本类型附件url
   * @param {Object} headerInfo 头信息
   */
  @Bind()
  handleUpdateContractTextUrl(headerInfo) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'contractMaintain/updateContractTextUrl',
      payload: headerInfo,
    });
  }

  // 刷新单据数据
  @Bind()
  refreshData({ loading, oldEditStep }) {
    const {
      pcHeaderId,
      headerInfo: { editStep, pcKindCode },
    } = this.state;
    this.fetchHeader()
      .then((res) => {
        if (oldEditStep === 1) {
          const n = document.querySelector(
            `a[href="#spcm-contract-maintain-detail-contract-online-edit"]`
          );
          if (
            pcHeaderId &&
            editStep === 1 &&
            !['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(pcKindCode) &&
            this.editorOnlineRef &&
            res.pcTemplateId
          ) {
            this.editorOnlineRef.fetchEditorOnlineHTML();
          }
          if (n) n.click();
        }
        this.fetchList(res);
      })
      .catch(() => {
        if (loading) {
          this.setState({ [loading]: false });
        }
      });
  }

  /**
   * 更新协议
   * @param {Object} [params={}] 更细内容
   * @param {Number} [oldEditStep] 协议所处阶段
   */
  @Bind()
  @Debounce(200)
  handleUpdateContract(params = {}, oldEditStep, isSubmit) {
    const _this = this;
    const { remote } = this.props;
    _this.setState({ conSaveLoading: true }, async () => {
      const { tenantId, unitCodeList } = _this.state;
      const isValid = await _this.handleContractValidate();
      if (!isValid) {
        _this.setState({ conSaveLoading: false });
        return;
      }
      const payload = await _this.handleContractDataMerge();

      const response = getResponse(
        await updateContract({
          tenantId,
          ...payload,
          ...params,
          customizeUnitCode: unitCodeList
            ? `${unitCodeList.DETAIL},${unitCodeList.SUBJECT},${unitCodeList.STAGE},${unitCodeList.PARTNER}`
            : 'SPCM.PURCHASE_CONTRACT_MAINTAIN.DETAIL,SPCM.PURCHASE_CONTRACT_MAINTAIN.PARTNER,SPCM.PURCHASE_CONTRACT_MAINTAIN.SUBJECT,SPCM.PURCHASE_CONTRACT_MAINTAIN.STAGE',
        })
      );

      if (response) {
        notification.success();
        localStorage.removeItem('isReplenishCreate');

        if (isSubmit === 'isSubmit') {
          return this.onSubmit();
        }
        if (remote?.event) {
          remote.event.fireEvent('handleCuxUpdateAll', {
            headerInfo: response,
            current: this,
          });
        }
        this.refreshData({ loading: 'conSaveLoading', oldEditStep });
      } else {
        _this.setState({ conSaveLoading: false });
      }
    });
  }

  /**
   * 更新协议
   * @param {Object} [params={}] 更细内容
   * @param {Number} [oldEditStep] 协议所处阶段
   */
  @Bind()
  @Debounce(500)
  async getTextPreViewUrl() {
    const _this = this;
    const { dispatch } = this.props;
    const { pcHeaderId } = this.state;
    _this.setState({ conSaveLoading: true }, async () => {
      const isValid = await _this.handleContractValidate();
      if (!isValid) {
        _this.setState({ conSaveLoading: false });
        return;
      }
      const payload = await _this.handleContractDataMerge();

      const type = await fetchContractOnlineHTMLType();

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
            this.setState({ conSaveLoading: false });
          });
        return false;
      }

      dispatch({
        type: 'editorOnline/fetchTextPreView',
        payload,
      })
        .then((url) => {
          this.setState({
            conSaveLoading: false,
          });
          const hasFailed = url && url.includes('failed'); // 是否接口报错
          if (typeof url === 'string' && url !== '' && !hasFailed) {
            const bucketName = PRIVATE_BUCKET;
            const tenantId = getCurrentOrganizationId();
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
              message: intl.get('spcm.common.view.button.getPreViewUrlError').d('Url获取失败！'),
            });
          }
        })
        .catch(() => {
          this.setState({
            conSaveLoading: false,
          });
        });
      // partnerDataSource.forEach((i) => i.$form.resetFields());
      // pcStageDataSource.forEach((i) => i.$form && i.$form.resetFields()); // 此处需要判断一下，由于页面初始化时协议阶段行默认不渲染，以至于没有$form属性

      // dispatch({
      //   type: 'contractCommon/updateState',
      //   payload: {
      //     formChanged: false,
      //   },
      // });
    });
  }

  /**
   * 变更
   */
  @Bind()
  onContractChange() {
    const _this = this;
    const { headerInfo } = this.state;
    const notAllowedFlag = checkOrderSignContract(headerInfo);
    if (notAllowedFlag) {
      return;
    }
    Modal.confirm({
      title: intl.get(`spcm.contractChange.title.sureChange`).d('确认变更'),
      onOk: throttle(
        () => {
          _this.setState({ conChangeLoading: true });
          _this.handleContractChange();
        },
        1500,
        {
          leading: true,
          trailing: false,
        }
      ),
    });
  }

  /**
   * preSubmit - 提交采购协议前置modal弹窗
   */
  @Bind()
  async onPreSubmit() {
    this.handleUpdateContract({}, 0, 'isSubmit');
  }

  /**
   * 保存
   */
  @Bind()
  onSave() {
    this.handleUpdateContract({}, 0);
  }

  /**
   * submit - 协议提交
   */
  @Bind()
  async onSubmit() {
    const { headerFormDs, pcHeaderId, pcStageDs } = this.state;
    const headerInfoCurrent = headerFormDs?.toJSONData()[0] || {};
    const {
      pcStatusCode,
      supplementFlag,
      mainContractId,
      version,
      pcNum,
      mainPcNum,
      payPlanNum,
      pcKindCode,
    } = headerInfoCurrent;
    let pcStatusFlag;
    if (supplementFlag) {
      pcStatusFlag = 3;
    } else if (!supplementFlag && mainContractId && version > 1) {
      pcStatusFlag = 1;
    } else if (['PENDING', 'REJECTED', 'SUPPLIER_REJECTED'].includes(pcStatusCode)) {
      pcStatusFlag = 0;
    } else {
      pcStatusFlag = 2;
    }
    const data = {
      pcHeaderId,
      pcNum,
      mainPcNum: supplementFlag ? mainPcNum : null,
      pcStatusFlag, // 协议状态标识(0新建&审批拒绝&拒绝生效/1变更协议/2生效和其他状态/3补充协议)
    };
    // 查询业务规则定义-【协议生成付款计划】
    const paymentPlanFlag =
      !supplementFlag &&
      (getResponse(
        await createPaymentPlan({
          pcHeaderId,
        })
      ) ||
        0);
    // 有付款计划：调用
    // 无付款计划：业务规则=是&原协议&有阶段&协议性质不等于非系统供应商 -调用
    if (payPlanNum || paymentPlanFlag) {
      if (pcStageDs?.length > 0 && pcKindCode !== 'NOT_SYS_SUPPLIER') {
        // 补充协议的时候要预校验提交内容,预提交校验通过之后才允许走弹框打开规则
        const preValid =
          supplementFlag &&
          !getResponse(
            await preSubmitValid({
              pcHeaderId,
            })
          );
        if (preValid) {
          this.refreshData({ loading: 'conSaveLoading' });
          return false;
        }
        return openTermsModal(
          {
            type: 'submit',
            record: headerInfoCurrent,
            afterOk: () => this.toContractHistoryCompare(),
            changeLoading: () => {
              this.setState({
                conSaveLoading: false,
              });
            },
            onCancel: () => {
              this.refreshData({ loading: 'conSaveLoading' });
            },
          },
          data
        );
      } else {
        ModalPro.confirm({
          key: ModalPro.key(),
          title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
          children: intl
            .get(`spcm.common.view.message.msg.paymentPlan.confirm`)
            .d('协议性质为非系统供应商合同或协议阶段为空时，无法生成付款计划，是否确认提交？'),
          onOk: () => this.toContractHistoryCompare(),
          onCancel: () => {
            this.refreshData({ loading: 'conSaveLoading' });
          },
        });
      }
    } else {
      this.toContractHistoryCompare();
    }
  }

  // 跳转协议历史版本对比
  @Bind()
  toContractHistoryCompare() {
    const {
      headerInfo: { mainContractId, pcHeaderId },
      isBlackTenantFlag,
    } = this.state;
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/spcm/contract-control/contract-history-compare`,
        search: querystring.stringify({
          mainContractId,
          pcHeaderId,
          isBlackTenantFlag,
        }),
      })
    );
  }

  /**
   * 变更后跳转编辑状态
   * @param headerId 协议头id
   */
  toChangeContract({ headerId, editStep, pcKindCode, pcTypeId }, oldEditStep) {
    const _this = this;
    const { headerInfo } = this.state;
    const { dispatch } = _this.props;
    localStorage.setItem('isReplenishCreate', 'true');
    dispatch(
      routerRedux.push({
        pathname: `/spcm/contract-control/detail/${headerId}`,
        search: querystring.stringify({ hasChanged: 'true' }),
      })
    );

    const editable = true;
    const pcHeaderId = headerId;
    const changeHeaderFormDs = new DataSet(
      headerFormDS({ pcHeaderId, editable, _linkFlag: this._linkFlag })
    );
    const changeRebateDs = new DataSet(rebateDS({ pcHeaderId, editable }));
    const changePartnerDs = new DataSet(partnerDS({ pcHeaderId, editable }));
    const changebusiTermsDs = new DataSet(businessTermsDS({ pcHeaderId, editable }));
    changebusiTermsDs.setState({
      headerInfo: { pcTypeId },
    });
    const changeApproveRecordDs = new DataSet(approveRecordDS({ pcHeaderId, editable }));
    _this.setState({
      // maintainEditable: true,
      pcHeaderId,
      templateList: [],
      templateListFlag: false,
      pcSubjectDataSource: [],
      partnerDataSource: [],
      pcStageDataSource: [],
      termDataSource: [],
      headerFormDs: changeHeaderFormDs,
      rebateDs: changeRebateDs,
      partnerDs: changePartnerDs,
      businessTermsDs: changebusiTermsDs,
      approveRecordDs: changeApproveRecordDs,
      headerInfo: { ...headerInfo, pcTemplateId: null },
    });
    _this.fetchHeader({ editable }).then((res) => {
      if (oldEditStep === 0) {
        const n = document.querySelector(
          `a[href="#spcm-contract-maintain-detail-contract-online-edit"]`
        );
        n.click();
      } else if (
        headerId &&
        editStep === 1 &&
        !['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(pcKindCode) &&
        res.pcTemplateId
      ) {
        if (_this.editorOnlineRef) {
          setTimeout(() => {
            _this.editorOnlineRef.fetchEditorOnlineHTML();
          }, 2000);
        }
      }
      const { headerFormDs } = _this.state;
      const headerData = headerFormDs.current.toJSONData();
      _this.setState({
        editable,
        // conChangeLoading: false,
        headerInfo: headerData,
        headerInfoKey: 'control-headerInfo-Changed',
        // contractSubjectInfoKey: 'control-contractSubjectInfo-Changed',
        // contractStageKey: 'control-contractStage-Changed',
        // contractRebateKey: 'control-contractRebate-Changed',
        // contractPartnerKey: 'control-contractPartner-Changed',
      });
      _this.fetchList(res, true);
      _this.handleFetchConfigAttachment();
    });
  }

  isQuoteSourceFlag = () => {
    const {
      isQuoteSource,
      headerInfo: { pcSourceCode },
    } = this.state;
    // 引用寻源单据跳转到 协议拟制详情页
    if (Number(isQuoteSource) === 1) {
      return true;
    }
    // 直接进入 协议拟制详情页 或 引用寻源单据保存后，isQuoteSource 丢失时
    if (pcSourceCode === 'SEARCH_SOURCE_RESULT' || pcSourceCode === '寻源结果') {
      return true;
    }
    return false;
  };

  /**
   * fetchSubjectQuoteList - 查询可创建寻源单据
   * @param {object} params - 查询条件
   * @param {function} [success=(e => e)] - 查询成功回调函数
   */
  @Bind()
  fetchSubjectQuoteList(params, success = (e) => e) {
    const { dispatch } = this.props;
    const { pcHeaderId } = this.state;
    dispatch({
      type: 'contractMaintain/querySubjectQuoteList',
      pcHeaderId,
      params,
    }).then((res) => {
      if (res) {
        success(res);
      }
    });
  }

  /**
   * fetchSubjectCreateList - 查询可创建行数据
   * @param {object} params - 查询条件
   * @param {function} [success=(e => e)] - 查询成功回调函数
   */
  @Bind()
  fetchSubjectCreateList(params, success = (e) => e) {
    const { dispatch } = this.props;
    const { pcHeaderId } = this.state;
    dispatch({
      type: 'contractMaintain/querySubjectCreateList',
      pcHeaderId,
      params,
    }).then((res) => {
      if (res) {
        success(res);
      }
    });
  }

  /**
   * pcHeaderElectronicSignatureAttachment
   * @param {*} pcHeaderElectronicSignatureAttachment
   */
  @Bind()
  handleSaveElectricSignUuid(pcHeaderElectronicSignatureAttachment) {
    const { dispatch } = this.props;
    const { headerInfo, headerFormDs } = this.state;
    if (!headerInfo.pcHeaderElectronicSignatureAttachment) {
      dispatch({
        type: 'contractMaintain/add',
        payload: {
          ...headerInfo,
          pcHeaderElectronicSignatureAttachment,
        },
      }).then((res) => {
        if (getResponse(res)) {
          headerFormDs.current.set({
            pcHeaderElectronicSignatureAttachment: res.pcHeaderElectronicSignatureAttachment,
            objectVersionNumber: res.objectVersionNumber,
          });
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
   * fetchHeaderAfterOperation
   */
  @Bind()
  async fetchHeaderAfterOperation() {
    const headerData = await this.fetchHeader();
    const {
      headerInfo: { version, objectVersionNumber },
    } = this.state;
    // 没必要频繁更新协议头
    if (headerData.version !== version || headerData.objectVersionNumber !== objectVersionNumber) {
      this.setState({ headerInfo: headerData });
    }
  }

  /**
   * 引用协议模板刷新在线编辑中的模板文件内容
   */
  @Bind()
  refreshTemplate() {
    const { pcHeaderId } = this.state;
    const { dispatch } = this.props;
    return dispatch({
      type: 'contractMaintain/fetchTemplateRefresh',
      payload: {
        pcHeaderId,
      },
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

  renderContractHeader(headerInfoKey, headerInfoFormProps) {
    return <ContractHeader key={headerInfoKey} {...headerInfoFormProps} />;
  }

  renderContractSubject(contractSubjectInfoKey, contractSubjectListProps) {
    return <ContractSubject key={contractSubjectInfoKey} {...contractSubjectListProps} />;
  }

  renderContractStage(contractStageKey, contractStageListProps) {
    return <ContractStage key={contractStageKey} {...contractStageListProps} />;
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

  // @overide网易
  renderHeaderButton() {
    const { customizeBtnGroup, remote } = this.props;
    const {
      pcHeaderId,
      headerInfo,
      templateList,
      templateListFlag,
      conChangeLoading,
      conSaveLoading,
      isPub,
      headerFormDs,
    } = this.state;
    const {
      attachmentUuid,
      supplierAttachmentUuid,
      supplementFlag,
      signatureType,
      electricSignFlag,
      authType,
      electronicSignatureAttachmentDisplayFlag,
      pcStatusCode,
      invalidAllowChangeFlag,
    } = headerInfo;
    const uploadProps = {
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'purchaser-attachment',
      btnText: intl.get('spcm.common.view.spcm.btn.purchaserAttachment').d('采购方附件'),
      title: intl.get('spcm.common.view.spcm.btn.purchaserAttachment').d('采购方附件'),
      attachmentUUID: headerInfo.purchaserAttachmentUuid,
    };
    const attachmentProps = {
      onRef: (node) => {
        this.attachmentRef = node;
      },
      templateListFlag,
      headerInfo,
      templateList,
      supplierAttachmentUuid,
      width: 610,
      isShowTips: true,
      onChangeState: (state) => {
        headerFormDs.current.set({
          supplierAttachmentUuid: state.headerInfo?.supplierAttachmentUuid,
          contractAttachmentUrl: state.headerInfo?.contractAttachmentUrl,
          templateFileUrl: state.headerInfo?.templateFileUrl,
          attachmentUuid: state.headerInfo?.attachmentUuid,
          objectVersionNumber: state.headerInfo?.objectVersionNumber,
        });
        this.setState(state);
      },
      attachmentUUID: attachmentUuid,
      onUpdateHeader: this.handleUpdateContractTextUrl,
      onFetchHeader: this.fetchHeaderAfterOperation,
      onRefresh: this.handleFetchConfigAttachment,
      purchaserParams: { purchaserUploadFlag: true },
      btnProps: {
        // disabled: formChanged,
        icon: 'upload',
        disabled: conSaveLoading,
        btnText: intl.get(`entity.attachment.upload.spcm`).d('附件上传'),
      },
    };
    const attachmentViewProps = {
      remote,
      headerInfo,
      isShowTips: true,
      templateList,
      supplierAttachmentUuid,
      onUpdateHeader: this.onSave,
      attachmentUUID: attachmentUuid,
      onFetchHeader: this.fetchHeaderAfterOperation,
      isTemplateContract: true,
      supplierParams: { supplierViewFlag: true },
      showRemoveIcon: false,
      'data-name': 'attachment',
      btnProps: {
        disabled: conChangeLoading,
        permissionList: [
          {
            code: 'srm.pc-admin.pc-purchaser.control.ps.attachment.upload',
            type: 'button',
            meaning: '附件上传',
          },
        ],
      },
    };
    const isAttachmentSignUpload =
      signatureType === 'ANNEX_SIGNATURE' &&
      electricSignFlag === 1 &&
      allSignList.includes(authType); // 是否附件签章
    const isAttachmentSignAndText =
      (signatureType === 'TEXT_AND_ANNEX_SIGNATURE' &&
        electricSignFlag === 1 &&
        allSignList.includes(authType)) ||
      electronicSignatureAttachmentDisplayFlag === 'Y'; // 是否附件签章
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
    // 已失效且invalidAllowChangeFlag=1允许变更,其他状态都可变更
    const isExpiredChange =
      (pcStatusCode === 'EXPIRED' && !!invalidAllowChangeFlag) || pcStatusCode != 'EXPIRED';

    const buttons =
      headerInfo.pcStatusCode !== 'PENDING'
        ? [
            !isPub && (
              <PermissionButton
                data-name="change"
                key="change"
                color="primary"
                // icon="event_note"
                disabled={!isExpiredChange}
                loading={conChangeLoading}
                onClick={this.onContractChange}
                permissionList={[
                  {
                    code: 'srm.pc-admin.pc-purchaser.control.ps.change',
                    type: 'button',
                    meaning: '变更',
                  },
                ]}
              >
                <Icon type="mode_edit" style={{ marginRight: '8px', fontSize: '16px' }} />
                {intl.get(`spcm.contractChange.view.button.change`).d('变更')}
              </PermissionButton>
            ),
            !isPub && (
              <PermissionButton
                data-name="invalid"
                key="invalid"
                // icon="event_busy"
                onClick={this.handleInvalid}
                disabled={
                  isEmpty(headerInfo) || headerInfo.pcStatusCode !== 'PUBLISHED' || conChangeLoading
                }
                permissionList={[
                  {
                    code: 'srm.pc-admin.pc-purchaser.control.ps.invalid.button',
                    type: 'button',
                    meaning: '作废',
                  },
                ]}
              >
                <Icon type="cancel" style={{ marginRight: '8px', fontSize: '16px' }} />
                {intl.get(`spcm.contractChange.view.button.invalid`).d('作废')}
              </PermissionButton>
            ),
            !isPub && (
              <PermissionButton
                data-name="terminate"
                key="terminate"
                // icon="cancel"
                onClick={this.terminateContractFunc}
                disabled={
                  isEmpty(headerInfo) ||
                  ['PUBLISHED', 'EXPIRED'].includes(pcStatusCode) ||
                  conChangeLoading
                }
                permissionList={[
                  {
                    code: 'srm.pc-admin.pc-purchaser.control.ps.stop.button',
                    type: 'button',
                    meaning: '终止',
                  },
                ]}
              >
                <Icon type="state_over" style={{ marginRight: '8px', fontSize: '16px' }} />
                {intl.get(`spcm.contractChange.view.button.terminate`).d('终止')}
              </PermissionButton>
            ),
            headerInfo && (isAttachmentSignUpload || isAttachmentSignAndText) && (
              <Popover
                content={intl.get('spcm.common.view.button.uploadNum').d('文件最多上传4个')}
                placement="bottomLeft"
                trigger="hover"
                data-name="uploadESignAttachment"
              >
                <Button
                  data-name="uploadESignAttachment"
                  className={styles['purchase-header-number']}
                  disabled={conChangeLoading}
                >
                  <ComUpload viewOnly {...electricSignAttachmentProps} />
                </Button>
              </Popover>
            ),
            !isEmpty(headerInfo) && templateListFlag && (
              <Attachment {...attachmentViewProps} data-name="attachment" />
            ),
            pcHeaderId && (
              <Popover
                data-name="purchaserAttachment"
                content={intl.get(`spcm.common.view.button.purchaserViewOnly`).d('仅采购方可见')}
                placement="bottomLeft"
                trigger="hover"
              >
                <Button disabled={conChangeLoading} className={styles['purchase-header-number']}>
                  <Upload viewOnly {...uploadProps} />
                </Button>
              </Popover>
            ),
            <Button
              data-name="operating"
              icon="clock-circle-o"
              onClick={() =>
                this.handleModalVisible('operationRecordVisible', true, { pcHeaderId })
              }
            >
              {intl.get(`hzero.common.button.operating`).d('操作记录')}
            </Button>,
            !isPub &&
              !isAttachmentSignUpload &&
              !['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(headerInfo.pcKindCode) && (
                <Button
                  data-name="comparison"
                  disabled={conChangeLoading}
                  onClick={this.handleControlComparison}
                >
                  {intl.get('spcm.common.view.title.textComparison').d('文本对比')}
                </Button>
              ),
          ]
        : [
            !isPub && (
              <Button
                data-name="save"
                loading={conSaveLoading}
                onClick={() => this.onSave()}
                icon="save"
                type="primary"
              >
                {intl.get(`hzero.common.button.save`).d('保存')}
              </Button>
            ),
            !isPub && (
              <Button
                data-name="submit"
                loading={conSaveLoading}
                icon="check"
                onClick={this.onPreSubmit}
              >
                {intl.get(`hzero.common.button.submit`).d('提交')}
              </Button>
            ),
            headerInfo && (isAttachmentSignUpload || isAttachmentSignAndText) && (
              <Popover
                content={intl.get('spcm.common.view.button.uploadNum').d('文件最多上传4个')}
                placement="bottomLeft"
                trigger="hover"
                data-name="uploadESignAttachment"
              >
                <Button disabled={conSaveLoading} className={styles['purchase-header-number']}>
                  <ComUpload {...electricSignAttachmentProps} />
                </Button>
              </Popover>
            ),
            !isEmpty(headerInfo) && templateListFlag && (
              <Attachment {...attachmentProps} data-name="attachment" />
            ),
            pcHeaderId && (
              <Popover
                data-name="purchaserAttachment"
                content={intl.get(`spcm.common.view.button.purchaserViewOnly`).d('仅采购方可见')}
                placement="bottomLeft"
                trigger="hover"
              >
                <Button disabled={conSaveLoading} className={styles['purchase-header-number']}>
                  <Upload
                    {...uploadProps}
                    afterOpenUploadModal={(purchaserUuid) => this.handleSaveUuid(purchaserUuid)}
                  />
                </Button>
              </Popover>
            ),
            !isPub && (
              <Button
                // loading={deleteHeaderLoading}
                data-name="delete"
                icon="delete"
                disabled={!pcHeaderId || conSaveLoading}
                onClick={this.handleDeleteContract}
              >
                {intl.get(`hzero.common.button.delete`).d('删除')}
              </Button>
            ),
            <Button
              icon="clock-circle-o"
              data-name="operating"
              onClick={() =>
                this.handleModalVisible('operationRecordVisible', true, { pcHeaderId })
              }
            >
              {intl.get(`hzero.common.button.operating`).d('操作记录')}
            </Button>,
            !supplementFlag && (
              <Button
                data-name="quoteAgreementTemplate"
                disabled={conSaveLoading}
                onClick={this.refreshTemplate}
              >
                {intl.get(`spcm.common.view.title.quoteAgreementTemplate`).d('引用协议模板')}
              </Button>
            ),
            !isAttachmentSignUpload && (
              <PermissionButton
                data-name="textPreview"
                key="textPreview"
                permissionList={[
                  {
                    code: 'srm.pc-admin.pc-purchaser.control.ps.preview.button',
                    type: 'button',
                    meaning: '文本预览',
                  },
                ]}
                loading={conSaveLoading}
                disabled={
                  !pcHeaderId ||
                  ['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(headerInfo.pcKindCode)
                }
                onClick={this.getTextPreViewUrl}
              >
                {intl.get('spcm.common.view.title.textPreview').d('文本预览')}
              </PermissionButton>
            ),
          ];
    const buttonList = remote
      ? remote.process('SPCM_CONTRACT_CONTROL_DETAIL_PROCESS_HEADER_BUTTONS', buttons, {
          current: this,
        })
      : buttons;
    return (
      <Header
        title={intl.get('spcm.contractControl.view.title.ContractControl').d('协议控制')}
        backPath="/spcm/contract-control/list"
      >
        {customizeBtnGroup(
          {
            code: 'SPCM.CONTRACT.CONTROL.DETAIL.BTN_GROUP',
          },
          buttonList
        )}
      </Header>
    );
  }

  render() {
    const {
      dispatch,
      contractCommon: { configSetting = {}, stageList = [], partnerList = [] },
      customizeForm,
      customizeTable,
      customizeBtnGroup,
      custConfig,
      remote,
    } = this.props;
    const {
      pcHeaderId,
      editable,
      headerFormDs,
      pcSubjectDs,
      pcStageDs,
      rebateDs,
      partnerDs,
      businessTermsDs,
      approveRecordDs,
      headerInfo,
      fullScreenFlag,
      textComparisonVisible,
      isPub,
      pcSubjectDataSource,
      pcStageDataSource,
      operationRecordVisible,
      prLineImport,
      unitCodeList,
    } = this.state;
    const {
      rebateFlag,
      pcKindCode,
      editStep,
      pcStatusCode,
      signatureType,
      electricSignFlag,
      authType,
      enableRule,
      pcNum,
      version,
    } = headerInfo;

    const isPendingStatus = pcStatusCode === 'PENDING';

    const headerInfoFormProps = {
      remote,
      editable,
      isMaintain: !isPendingStatus,
      pcHeaderId,
      headerInfo,
      headerFormDs,
      pcSubjectDs,
      customizeForm,
      unitCodeList,
      partnerDs,
      partnerList,
      dispatch,
      _linkFlag: this._linkFlag,
    };

    const contractSubjectListProps = {
      remote,
      prLineImport,
      customizeTable,
      customizeBtnGroup,
      custConfig,
      editable,
      dispatch,
      pcHeaderId,
      headerInfo,
      pcSubjectDs,
      headerFormDs,
      unitCodeList,
      attachmentRef: this.attachmentRef,
      dataSource: pcSubjectDataSource,
      doubleUomFlag: configSetting['000112'] === '1',
      onFetchHeader: this.fetchHeaderAfterOperation,
      onFetchTableList: async (ds, customizeUnitCode) => {
        const { content: pcSubjectData } = await this.fetchTableList(ds, customizeUnitCode);
        this.setState({ pcSubjectDataSource: pcSubjectData });
      },
      checkModified: () => this.checkModified('pcSubject'),
      fetchSubjectCreateList: this.isQuoteSourceFlag()
        ? this.fetchSubjectQuoteList
        : this.fetchSubjectCreateList,
      quoteSourceFlag: this.isQuoteSourceFlag(),
      onAddPurchaseOrder: this.handleAddPurchaseOrder,
    };
    const contractStageListProps = {
      customizeTable,
      custConfig,
      editable,
      pcStageDs,
      stageList,
      pcStageDataSource,
      unitCodeList,
      headerInfo,
      remote,
      pcSubjectDs, // 勿删，大金（src-18753）埋点需要的
      headerFormDs, // 勿删，一道埋点需要
      onFetchTableList: this.fetchTableList,
      onChangeState: (state) => {
        this.setState(state);
      },
    };
    const contractRebateProps = {
      editable,
      rebateDs,
      headerFormDs,
      customizeTable,
      unitCodeList,
      // supplierCurrencyCode,
      onFetchTableList: this.fetchTableList,
    };
    const partnerListProps = {
      editable,
      pcHeaderId,
      partnerDs,
      partnerList,
      customizeTable,
      customizeBtnGroup,
      unitCodeList,
      onFetchTableList: async (ds, customizeUnitCode) => {
        const partnerListData = await this.fetchTableList(ds, customizeUnitCode);
        this.setState({ partnerDataSource: partnerListData });
      },
      checkModified: () => this.checkModified('partner'),
      remote,
      detailState: { ...this.state },
    };
    const contractBusinessTermsListProps = {
      editable,
      headerInfo,
      businessTermsDs,
      customizeBtnGroup,
    };
    const approveRecordProps = {
      pcHeaderId,
      approveRecordDs,
    };

    const discountRuleProps = {
      editable: false,
      majorPcNum: `${pcNum}|${version}`,
      type: 'discount',
      headerInfo: () => ({ ...headerInfo, ...headerFormDs?.current?.toJSONData() }),
      key: this.state.discountRuleKey,
      changeFlag: editable,
    };

    const rebateRuleProps = {
      editable: false,
      majorPcNum: `${pcNum}|${version}`,
      type: 'rebate',
      headerInfo: () => ({ ...headerInfo, ...headerFormDs?.current?.toJSONData() }),
      key: this.state.rebateRuleKey,
      changeFlag: editable,
    };

    const modalProps = {
      width: '100%',
      height: document?.body?.clientHeight || '100vh',
      visible: fullScreenFlag,
      onCancel: () => this.fullScreen('fullScreenFlag', false),
      footer: null,
      closable: false,
    };
    const textComparisonProps = {
      pcHeaderId,
      visible: textComparisonVisible,
      onCancel: this.handleControlComparison,
    };

    const operationRecordProps = {
      pcHeaderId,
      visible: operationRecordVisible,
      onHandleCancel: () => this.handleModalVisible('operationRecordVisible', false),
    };
    const isAttachmentSignUpload =
      signatureType === 'ANNEX_SIGNATURE' && electricSignFlag === 1 && authType === 'ESIGN'; // 是否附件签章

    return (
      <Fragment>
        {this.renderHeaderButton()}

        <Content>
          <Spin dataSet={pcSubjectDs} id="spcm-contract-maintain-detail-content-inner-wrapper">
            <Row gutter={24}>
              <Col span={21}>
                <Card
                  key="contractHeaderInformation"
                  id="spcm-maintain-detail-contract-header-information"
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
                  {headerFormDs?.current &&
                    this.renderContractHeader(`${this.state.headerInfoKey}`, headerInfoFormProps)}
                </Card>
                {pcHeaderId && (
                  <div key="subjectInformation" id="spcm-maintain-detail-contract-subject">
                    <Tabs animated={false}>
                      <TabPane
                        tab={intl
                          .get(`spcm.common.view.message.title.contractSubject`)
                          .d('协议标的')}
                        key="contractSubjectInfo"
                      >
                        {pcSubjectDs &&
                          this.renderContractSubject(
                            `${this.state.contractSubjectInfoKey}`,
                            contractSubjectListProps
                          )}
                      </TabPane>
                      <TabPane
                        tab={intl.get(`spcm.common.view.message.title.contractStage`).d('协议阶段')}
                        key="contractStage"
                      >
                        {this.renderContractStage(
                          this.state.contractStageKey,
                          contractStageListProps
                        )}
                      </TabPane>
                      {rebateFlag && (
                        <TabPane
                          tab={intl
                            .get('spcm.common.view.message.title.ContractRebate')
                            .d('返利信息')}
                          key="contractRebate"
                        >
                          <ContractRebate
                            key={this.state.contractRebateKey}
                            {...contractRebateProps}
                          />
                        </TabPane>
                      )}
                    </Tabs>
                  </div>
                )}
                {pcHeaderId && (
                  <Card
                    key="contractPartnerInformation"
                    id="spcm-maintain-detail-contract-partner"
                    bordered={false}
                    className={DETAIL_CARD_CLASSNAME}
                    title={
                      <h3>
                        {intl
                          .get('spcm.common.view.message.title.contractPartnerInformation')
                          .d('采购协议伙伴信息')}
                      </h3>
                    }
                  >
                    <ContractPartner key={this.state.contractPartnerKey} {...partnerListProps} />
                  </Card>
                )}
                {pcHeaderId && !['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(pcKindCode) && (
                  <Card
                    key="contractBusinessTermsInformation"
                    id="spcm-maintain-detail-contract-business-terms"
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
                        {intl.get('spcm.common.view.message.title.dicountRule').d('优惠规则-折扣')}
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
                {/* 只有在开启“启用SRM采购协议审”时才显示审批记录 */}
                {pcHeaderId && configSetting['010601'] === '1' && (
                  <Card
                    key="approveRecordInformation"
                    id="spcm-contract-maintain-detail-approve-record"
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
                    <ApproveRecord {...approveRecordProps} />
                  </Card>
                )}
                {pcHeaderId &&
                  editStep === 1 &&
                  !['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(headerInfo.pcKindCode) &&
                  headerInfo.pcTemplateId &&
                  !isAttachmentSignUpload && (
                    <Card
                      key="contractOnlineEdit"
                      id="spcm-contract-maintain-detail-contract-online-edit"
                      bordered={false}
                      className={DETAIL_CARD_CLASSNAME}
                      title={
                        <h3>
                          {intl.get(`spcm.common.title.contractOnlineEdit`).d('采购协议文本编辑')}
                        </h3>
                      }
                    >
                      <div className={styles['btn-wrapper']}>
                        <Button
                          color="primary"
                          onClick={() => this.fullScreen('fullScreenFlag', true)}
                        >
                          {intl.get(`hzero.common.button.fullScreen`).d('全屏模式')}
                        </Button>
                      </div>
                      {!fullScreenFlag && (
                        <EditorOnline
                          menuCode={CONTRACT_CONTROL}
                          iframeStyle={{
                            width: '100%',
                            height: `${(document?.body?.clientHeight - 96) * 0.9}px`,
                          }}
                          pcHeaderId={pcHeaderId}
                          headerInfo={headerInfo}
                          permissionCode={pcStatusCode !== 'PENDING' ? 'VIEW' : undefined}
                          onRef={(node) => {
                            this.editorOnlineRef = node;
                          }}
                          isOtherPageEdit={['REJECTED', 'SUPPLIER_REJECTED', 'PENDING'].includes(
                            headerInfo.pcStatusCode
                          )}
                        />
                      )}
                    </Card>
                  )}
              </Col>
              <Col span={3} className={styles['anchor-wrapper']}>
                <Affix
                  style={{ top: '200px', width: 'calc( 100% - 11px )', position: 'absolute' }}
                  offsetTop={224}
                  target={this.getAffixContainer}
                >
                  <Anchor getContainer={this.getAffixContainer} offsetTop={24}>
                    <Link
                      href="#spcm-maintain-detail-contract-header-information"
                      title={intl.get(`spcm.common.view.message.basicInformation`).d('基本信息')}
                    />
                    <Link
                      href="#spcm-maintain-detail-contract-subject"
                      title={intl.get(`spcm.common.view.message.subjectInformation`).d('标的信息')}
                    />
                    <Link
                      href="#spcm-maintain-detail-contract-partner"
                      title={intl.get(`spcm.common.view.message.partnerInformation`).d('伙伴信息')}
                    />
                    {pcHeaderId && !['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(pcKindCode) && (
                      <Link
                        href="#spcm-maintain-detail-contract-business-terms"
                        title={intl
                          .get(`spcm.common.view.message.businessTermsInformation`)
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
                    {configSetting['010601'] === '1' && (
                      <Link
                        href="#spcm-contract-maintain-detail-approve-record"
                        title={intl
                          .get(`spcm.common.view.message.approveRecordInformation`)
                          .d('审批记录')}
                      />
                    )}
                    {pcHeaderId &&
                      editStep === 1 &&
                      !['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(pcKindCode) &&
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
        </Content>
        {fullScreenFlag && (
          <Modal
            wrapClassName={styles['full-modal-wrapper']}
            // bodyStyle={{ height: `${document.body.clientHeight}px` }}
            {...modalProps}
            style={{
              top: 0,
            }}
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
              menuCode={CONTRACT_CONTROL}
              iframeStyle={{
                width: '100%',
                height: `${
                  isPub
                    ? window?.parent?.parent?.document?.body?.clientHeight
                    : document?.body?.clientHeight - 50
                }px`,
              }}
              pcHeaderId={pcHeaderId}
              headerInfo={headerInfo}
              permissionCode={pcStatusCode !== 'PENDING' ? 'VIEW' : undefined}
              fullScreenFlag={fullScreenFlag}
              isOtherPageEdit={['REJECTED', 'SUPPLIER_REJECTED', 'PENDING'].includes(
                headerInfo.pcStatusCode
              )}
            />
          </Modal>
        )}

        {textComparisonVisible && <TextComparisonModal {...textComparisonProps} />}
        <OperationRecordDrawer {...operationRecordProps} />
      </Fragment>
    );
  }
}

const hocFuc = (com) =>
  compose(
    connect(({ contractCommon, contractMaintain }) => ({
      contractCommon,
      contractMaintain,
    })),
    formatterCollections({
      code: [
        'spcm.contractChange',
        'spcm.common',
        'entity.company',
        'entity.business',
        'entity.organization',
        'entity.supplier',
        'entity.roles',
        'hzero.common',
        'spcm.contractSubject',
        'spcm.purchaseRequisitionCreation',
        'spcm.contractControl',
        'sodr.sendOrder',
        'sodr.common',
        'entity.item',
        'entity.attachment',
        'ssrc.inquiryHall',
        'sodr.workspace',
        'spfp.ruleMaintenance',
        'spfp.common',
        'component.docFlow',
        'spcm.workspace',
        'sodr.quotePurchase',
        'spcm.amountStrategy',
      ],
    }),
    WithCustomizeC7N({
      unitCode: [
        'SPCM.PURCHASE_CONTRACT_MAINTAIN.DETAIL.READONLY',
        'SPCM.PURCHASE_CONTRACT_MAINTAIN.SUBJECT.READONLY',
        'SPCM.PURCHASE_CONTRACT_MAINTAIN.STAGE',
        'SPCM.PURCHASE_CONTRACT_MAINTAIN.STAGE.READONLY',
        'SPCM.CONTRACT.CONTROL.TERMINATION',
        'SPCM.CONTRACT.CONTROL.DETAIL.BTN_GROUP',
        'SPCM.PURCHASE_CONTRACT_MAINTAIN.BUSINESSTERMS.BTN_GROUP',
        'SPCM.PURCHASE_CONTRACT_MAINTAIN.SUBJECT.BTN_GROUP',
        'SPCM.PURCHASE_CONTRACT_MAINTAIN.PARTNER.READONLY',
        'SPCM.PURCHASE_CONTRACT_MAINTAIN.PARTNER.BTN_GROUP',
        'SPCM.PURCHASE_CONTRACT_MAINTAIN.REBATE.READONLY',
        'SPCM.PURCHASE_CONTRACT_MAINTAIN.STAGE.READONLY',
        ...Object.values(oldUnitCodeList),
        ...Object.values(newUnitCodeList),
      ],
    }),
    hocRemote(
      {
        code: 'SPCM_CONTRACT_CONTROL_DETAIL',
        name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
      },
      {
        events: {
          // 协议控制字段修改监听 埋点处理
          handleFormUpdate() {},
          // 协议头生命周期 埋点处理
          headerComponentDidMount() {},
          // 协议标的保存后埋点处理
          handleCuxSaveSubject() {},
          // 协议保存后埋点处理
          handleCuxUpdateAll() {},
          // 查询行埋点处理
          handleCuxFetchTableList() {},
        },
      }
    )
  )(com);
export { hocFuc, ContractControlDetail };
export default hocFuc(ContractControlDetail);
