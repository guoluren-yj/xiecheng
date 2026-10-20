/**
 * index - RFx明细页
 * @date: 2018-12-29
 * @author: njq <jiangqi.nan@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import {
  Button,
  Form,
  Col,
  Row,
  Input,
  Spin,
  Tabs,
  Modal,
  Collapse,
  Icon,
  Tag,
  Popover,
} from 'hzero-ui';
import { connect } from 'dva';
import { Bind, Throttle } from 'lodash-decorators';
import { routerRedux } from 'dva/router';
import { isUndefined, isEmpty, noop } from 'lodash';
// import moment from 'moment';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import querystring from 'querystring';

import { Header, Content } from 'components/Page';
import Checkbox from 'components/Checkbox';
import Upload from 'srm-front-boot/lib/components/Upload';
import remote from 'hzero-front/lib/utils/remote';
import EditTable from 'components/EditTable';
import notification from 'utils/notification';
import { yesOrNoRender, dateTimeRender, dateRender } from 'utils/renderer';
import { HZERO_FILE } from 'utils/config';
import intl from 'utils/intl';
import { getActiveTabKey } from 'utils/menuTab';
import { getCurrentOrganizationId, getCurrentUserId, getResponse } from 'utils/utils';
import { EDIT_FORM_ITEM_LAYOUT, FORM_COL_3_LAYOUT } from 'utils/constants';
import QuotationDirectLable from '@/utils/constants';
import { isText, getQtyName, getUomName } from '@/utils/utils';
import { queryFileList } from 'services/api';
import formatterCollections from 'utils/intl/formatterCollections';
import classnames from 'classnames';
import UploadButton from 'srm-front-boot/lib/components/Upload/UploadButton';
import { PRIVATE_BUCKET } from '_utils/config';

import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';
import { numberSeparatorRender } from '@/utils/renderer';
import SectionPanel from '@/routes/components/SectionPanel';
import {
  BID,
  getDocumentTypeName,
  getCategoryCode,
  getQuotationName,
} from '@/utils/globalVariable';
import BatchEmptySelectedModal from '@/routes/components/SectionPanel/BatchEmptySelectedModal';
import OperateSectionPromptModal from '@/routes/components/SectionPanel/OperateSectionPromptModal';
import { validatorConfirmModal } from '@/routes/components/ConfirmModal';
import {
  batchParticipateSupplier,
  supplierAbandonBatch,
  participateWithValidate,
} from '@/services/supplierQutationService';
import { fetchRfxDetailLayout } from '@/services/inquiryHallService';
import { queryEnableDoubleUnit } from '@/services/commonService';
import LadderLevelModal from './LadderLevelModal';

import styles from './index.less';

const { TextArea } = Input;
const FormItem = Form.Item;
const { TabPane } = Tabs;
const { Panel } = Collapse;

class Detail extends PureComponent {
  constructor(props) {
    super(props);

    this.SectionRef = {};
    this.BatchEmptySectionRef = {};

    this.state = {
      fileList: [],
      businessAttachments: [], // 商务附件
      techAttachments: [], // 技术附件
      previewVisible: false,
      previewFileName: '',
      previewImage: '',
      giveUpVisible: false, // 放弃理由弹框
      viewLadderLevelVisible: false, // 阶梯报价模态框
      LadderLevelHeaderData: {}, // 阶梯报价头部数据
      fileLength: 0, // 资格预审文件个数，用于付费情况下只读展示
      collapseKeys: ['baseInfos', 'otherInfo', 'preQualification'], // 打开的折叠面板key
      isBatchMaintainSection: false, // 是否选批量操作标段
      batchEmptySelectSectionFlag: false, // 批量操作分标段是否需要弹窗
      noWarningBatchSectionFlag: true, // 参与时候批量不再提示未勾选数据
      userConfig: {}, // 用户配置
      operateSectionPromptFlag: false, // 批量操作分标段提示-modal
      operateSectionData: null, // // 批量操作分标段提示数据
      operationLoading: false, // 操作loading
      doubleUnitFlag: false, // 判断是否开启双单位
    };
    this.activeTabKey = getActiveTabKey();
    this.bidFlag = props.sourceKey === BID;
    this.documentTypeName = getDocumentTypeName(this.bidFlag);
    this.categoryCode = getCategoryCode(this.bidFlag);
    this.quotationName = getQuotationName(this.bidFlag);
    this.custkey = this.bidFlag ? 'BID_' : '';
  }

  form;

  getSnapshotBeforeUpdate(prevProps = {}) {
    const {
      match: { params: prevParams },
    } = prevProps;
    const {
      match: { params = {} },
    } = this.props || {};
    const { rfxId: prevId = null, companyId: prevCompanyId = null } = prevParams;
    const { rfxId = null, companyId = null } = params;
    const RefreshFlag = (rfxId && prevId !== rfxId) || (companyId && prevCompanyId !== companyId);

    return RefreshFlag;
  }

  componentDidUpdate(...params) {
    if (params[2]) {
      this.querySupplier();
    }
  }

  componentDidMount() {
    this.fetchPages();
    this.fetchUserConfig();
  }

  // 查询双单位是否开启
  queryDoubleUnit = async (tenantId) => {
    const {
      location: { pathname },
    } = this.props;
    const replyFlag = pathname.indexOf('supplier-reply') > -1;
    // 本页面为供应商报价-参与页和供应商回复-明细页，判断仅在供应商回复页面查询双单位
    if (replyFlag) {
      const res = await queryEnableDoubleUnit({
        businessModule: 'RFX',
        tenantId,
      });
      if (isText(res)) {
        this.setState({
          doubleUnitFlag: !!Number(res),
        });
      }
    }
  };

  fetchPages() {
    const BidSectionFlag = this.getBidSectionFlag(); // 是否分标段
    if (BidSectionFlag) {
      return;
    }

    this.querySupplier();
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps(nextProps) {
    const { modelName = 'supplierQuotation' } = this.props;
    const {
      [modelName]: {
        supplierHolderList: { prequalAttachmentUuid },
      },
      organizationId,
    } = nextProps;
    const pre =
      this.props.supplierHolderList && this.props.supplierHolderList.prequalAttachmentUuid;
    if (prequalAttachmentUuid && prequalAttachmentUuid !== pre) {
      queryFileList({
        organizationId,
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-prequal',
        attachmentUUID: prequalAttachmentUuid,
      }).then((fileList) => {
        if (getResponse(fileList)) {
          this.setState({
            fileLength: fileList?.length || 0,
          });
        }
      });
    }
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

  @Bind()
  querySupplier(queryParam = {}) {
    const {
      dispatch,
      organizationId,
      match: { params },
      modelName = 'supplierQuotation',
    } = this.props;
    const { rfxId, companyId } = params;
    const { quotationHeaderId } = querystring.parse(this.props.location.search.substr(1));
    dispatch({
      type: `${modelName}/fetchHeadDataList`,
      payload: {
        organizationId,
        rfxHeaderId: rfxId,
        supplierCompanyId: companyId,
        customizeUnitCode: `SSRC.${this.custkey}SUPPLIER_PARTICIPATE.BASE_FORM,SSRC.${this.custkey}SUPPLIER_PARTICIPATE.OTHERS_FORM,SSRC.${this.custkey}SUPPLIER_PARTICIPATE.PRELIMINARY_QUALIFICATION`,
        quotationHeaderId: quotationHeaderId !== 'null' ? quotationHeaderId : undefined,
        ...queryParam,
      },
    }).then(() => {
      const {
        [modelName]: { supplierHolderList = {} },
      } = this.props;
      this.queryDoubleUnit(supplierHolderList.tenantId);
      // 商务附件
      if (supplierHolderList.businessAttachmentUuid) {
        dispatch({
          type: `${modelName}/fetchAttachment`,
          payload: {
            bucketName: PRIVATE_BUCKET,
            bucketDirectory: 'ssrc-rfx-rfxheader',
            attachmentUUID: supplierHolderList.businessAttachmentUuid,
          },
        }).then((response) => {
          if (response && response.length) {
            this.setState({
              businessAttachments: response.map((item, index) => ({
                uid: index,
                name: item.fileName,
                type: item.fileType,
                status: 'done',
                size: item.fileSize,
                response: item.fileUrl,
                url: item.fileUrl,
              })),
            });
          }
        });
      }
      // 技术附件
      if (supplierHolderList.techAttachmentUuid) {
        dispatch({
          type: `${modelName}/fetchAttachment`,
          payload: {
            bucketName: PRIVATE_BUCKET,
            bucketDirectory: 'ssrc-rfx-rfxheader',
            attachmentUUID: supplierHolderList.techAttachmentUuid,
          },
        }).then((response) => {
          if (response && response.length) {
            this.setState({
              techAttachments: response.map((item, index) => ({
                uid: index,
                name: item.fileName,
                type: item.fileType,
                status: 'done',
                size: item.fileSize,
                response: item.fileUrl,
                url: item.fileUrl,
              })),
            });
          }
        });
      }
    });

    this.fetchItemLine({}, queryParam);
  }

  /**
   * 查询物品明细
   *
   * @param {*} [page={}]
   * @memberof Detail
   */
  fetchItemLine(page = {}, queryParam = {}) {
    const {
      dispatch,
      organizationId,
      match: { params },
      modelName = 'supplierQuotation',
    } = this.props;
    const { rfxId, companyId } = params;

    dispatch({
      type: `${modelName}/fetchItemsDataList`,
      payload: {
        organizationId,
        rfxHeaderId: rfxId,
        supplierCompanyId: companyId,
        page,
        ...queryParam,
        customizeUnitCode: `SSRC.${this.custkey}SUPPLIER_PARTICIPATE.ITEM_LINE`,
      },
    });
  }

  syncOperationLoading = null;

  // 页面操作loading 切换
  toggleOperationLoading = (loading = false) => {
    this.syncOperationLoading = loading;
    this.setState({ operationLoading: loading });
  };

  // 跳转到列表页
  directionList = () => {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: this.isPubNowPage()
          ? `/pub/ssrc/supplier-quotation/list`
          : `${this.activeTabKey}/list`,
      })
    );
  };

  /**
   * 图片预览
   * @param {*} file
   */
  @Bind()
  handlePreview(file) {
    this.setState({
      previewFileName: file.name,
      previewImage: file.url || file.thumbUrl,
      previewVisible: true,
    });
  }

  /**
   * 图片预览取消
   */
  @Bind()
  handlePreviewCancel() {
    this.setState({
      previewFileName: '',
      previewImage: '',
      previewVisible: false,
    });
  }

  /**
   * 删除附件
   * @param {Object} file
   * */
  @Bind()
  removeFile(file, fileType) {
    const {
      dispatch,
      inquiryHall: { header = {} },
    } = this.props;
    const { fileList } = this.state;
    let attachmentUUID;
    if (fileType === 'bussiness') {
      attachmentUUID = header.businessAttachmentUuid;
    } else {
      attachmentUUID = header.techAttachmentUuid;
    }
    dispatch({
      type: 'inquiryHall/removeAttachment',
      payload: {
        attachmentUUID,
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-rfxheader',
        urls: [file.response],
      },
    }).then((res) => {
      if (res) {
        this.setState({
          fileList: fileList.filter((o) => o.uid !== file.uid),
        });
      }
    });
  }

  /**
   * 打开阶梯报价模态框
   */
  @Bind()
  viewLadderLevelModal(record = {}) {
    const { itemCode, itemName, supplierCompanyName, rfxLineItemId, quotationLineStatus } = record;
    this.setState({
      viewLadderLevelVisible: true,
      LadderLevelHeaderData: {
        itemCode,
        itemName,
        rfxLineItemId,
        supplierCompanyName,
        quotationLineStatus,
      },
    });
    const { dispatch, organizationId, modelName = 'supplierQuotation' } = this.props;
    dispatch({
      type: `${modelName}/fetchLadderLevelyTable`,
      payload: { rfxLineItemId, organizationId },
    });
  }

  /**
   * hideLadderLevelModal - 关闭阶梯报价弹窗
   */
  @Bind()
  hideLadderLevelModal() {
    const { modelName = 'supplierQuotation', dispatch } = this.props;
    this.setState({ viewLadderLevelVisible: false });
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        ladderLevelData: [],
      },
    });
  }

  // 查询用户配置
  async fetchUserConfig() {
    const { organizationId } = this.props;
    let data = {};

    try {
      data = await fetchRfxDetailLayout({
        organizationId,
        userId: getCurrentUserId(),
        configKey: 'sectionSupplierParticipate',
      });
      data = getResponse(data);
      if (!data) {
        return;
      }

      let visible = false;
      let config = {};

      if (isEmpty(data)) {
        config = {
          configKey: 'sectionSupplierParticipate',
          configDesc: 'sectionSupplierParticipate',
          userId: getCurrentUserId(),
          enabledFlag: 1,
        };
        visible = true;
      } else {
        const { configValue = null } = data || {};
        config = {
          configKey: 'sectionSupplierParticipate',
          configDesc: 'sectionSupplierParticipate',
          ...data,
        };
        visible = !configValue || configValue === 'display';
      }

      this.setState({
        userConfig: config,
        noWarningBatchSectionFlag: visible,
      });
    } catch (e) {
      throw e;
    }

    return data;
  }

  /**
   * 参与
   */
  @Throttle(1200)
  @Bind()
  onParticipate() {
    const { modelName = 'supplierQuotation' } = this.props;
    const {
      [modelName]: { supplierHolderList },
      match: { params },
    } = this.props;
    const { rfxId, companyId } = params;
    const { isBatchMaintainSection = false, noWarningBatchSectionFlag = false } = this.state;
    const { getCurrentSection = noop, getCheckedSectionList = noop, isSectionListEmpty = noop } =
      this.SectionRef || {};
    const { roundNumber, objectVersionNumber } = supplierHolderList;

    let data = {};

    // 不区分标段 or 标段为空
    const participateSingle = () => {
      data = {
        rfxHeaderId: rfxId,
        roundNumber,
        objectVersionNumber,
        supplierCompanyId: companyId,
      };
      this.handleParticipate(data);
    };

    const sectionFlag = this.getBidSectionFlag();
    const sectionListEmptyFlag = isSectionListEmpty();
    if (!sectionFlag || sectionListEmptyFlag) {
      participateSingle();
      return;
    }

    const integrationSectionItem = (sectionItem = {}) => {
      if (!sectionItem) {
        return;
      }

      const {
        sourceHeaderId = null,
        sourceRoundNumber = null,
        sourceObjectVersionNumber = null,
      } = sectionItem;
      return {
        ...sectionItem,
        roundNumber: sourceRoundNumber,
        objectVersionNumber: sourceObjectVersionNumber,
        rfxHeaderId: sourceHeaderId,
      };
    };

    const currentData = getCurrentSection();
    if (isBatchMaintainSection) {
      // 区分标段, 批量勾选
      const checkedList = getCheckedSectionList();
      if (!isEmpty(checkedList)) {
        data = checkedList.map((item = {}) => {
          return integrationSectionItem(item);
        });
        this.handleParticipateBatch(data);
      } else if (noWarningBatchSectionFlag) {
        this.setState({
          batchEmptySelectSectionFlag: true,
        });
      } else {
        participateSingle();
      }
    } else if (noWarningBatchSectionFlag) {
      this.setState({
        batchEmptySelectSectionFlag: true,
      });
    } else {
      // 分标段，单一操作
      data = integrationSectionItem(currentData);
      this.handleParticipateBatch([data]);
    }
  }

  // 批量-参与
  async handleParticipateBatch(data = {}) {
    if (isEmpty(data)) {
      return;
    }

    const {
      organizationId,
      dispatch,
      location: { pathname },
      remote: remoteFunc,
    } = this.props;

    if (this.syncOperationLoading) {
      return;
    }

    let cuxFlag = true;
    if (remoteFunc?.event) {
      // 给state中设置二开的值
      cuxFlag = await remoteFunc.event.fireEvent('remoteBeforeHandleParticipateBatch', {
        that: this,
        data,
      });

      if (cuxFlag === false) {
        return false;
      }
    }

    this.toggleOperationLoading(true);
    batchParticipateSupplier({
      organizationId,
      list: data,
    }).then((res) => {
      const result = getResponse(res);
      this.toggleOperationLoading();

      if (isEmpty(result)) {
        notification.success();
        const replyFlag = pathname.indexOf('supplier-reply') > -1;

        if (replyFlag) {
          if (result?.jumpQuoteFlag) {
            const { quotationHeaderId, subjectMatterRule, roundFlag, projectLineSectionId } =
              result || {};
            const search = querystring.stringify({
              sectionFlag: subjectMatterRule === 'PACK' ? 1 : 0,
              roundFlag,
              projectLineSectionId,
            });
            dispatch(
              routerRedux.push({
                pathname: `${this.activeTabKey}/inquiry-price/${quotationHeaderId}`,
                search,
              })
            );
          } else {
            dispatch(
              routerRedux.push({
                pathname: `${this.activeTabKey}/list`,
                search: querystring.stringify({ tab: 'onGoing' }),
              })
            );
          }
        } else {
          dispatch(
            routerRedux.push({
              pathname: this.isPubNowPage()
                ? '/pub/ssrc/supplier-quotation/list'
                : `${getActiveTabKey()}/list`,
            })
          );
        }
      } else {
        this.setState({
          operateSectionData: result,
          operateSectionPromptFlag: true,
        });
      }
    });
  }

  // 参与
  @Throttle(1000)
  async handleParticipate(data = {}) {
    if (isEmpty(data)) {
      return;
    }
    const { modelName = 'supplierQuotation' } = this.props;

    const {
      dispatch,
      // organizationId,
      form,
      [modelName]: { supplierHolderList = {} },
      location: { pathname },
    } = this.props;
    const { sourceCategory, rfxHeaderId } = supplierHolderList || {};
    if (this.syncOperationLoading) {
      return;
    }

    // 参与接口参数
    const participateParams = { ...form.getFieldsValue(), ...data };

    this.toggleOperationLoading(true);

    // 参与之后的逻辑
    const afterParticipateOperate = (res) => {
      if (res) {
        notification.success();
        const replyFlag = pathname.indexOf('supplier-reply') > -1;
        const QuotationPriceFlag = pathname.indexOf('/supplier-quotation/') > 1; // 报价明细

        if (replyFlag) {
          if (res.jumpQuoteFlag) {
            const { quotationHeaderId, subjectMatterRule, roundFlag, projectLineSectionId } = res;
            const search = querystring.stringify({
              sectionFlag: subjectMatterRule === 'PACK' ? 1 : 0,
              roundFlag,
              projectLineSectionId,
              rfxHeaderId,
            });
            const PATHURL =
              sourceCategory === 'RFA'
                ? `${getActiveTabKey()}/bidding-offer/${quotationHeaderId}`
                : `${getActiveTabKey()}/inquiry-price/${quotationHeaderId}`;

            dispatch(
              routerRedux.push({
                pathname: PATHURL,
                search,
              })
            );
          } else {
            dispatch(
              routerRedux.push({
                pathname: `${getActiveTabKey()}/list`,
                search: querystring.stringify({ tab: 'onGoing' }),
              })
            );
          }
        } else if (QuotationPriceFlag) {
          this.afterParticipateDirectQuotationPrice(res);
        } else {
          dispatch(
            routerRedux.push({
              pathname: this.isPubNowPage()
                ? '/pub/ssrc/supplier-quotation/list'
                : `${getActiveTabKey()}/list`,
            })
          );
        }
      }
    };

    // 二次确认参与
    const confirmParticipate = () => {
      participateWithValidate(
        { ...participateParams, ignoreWeakCheckFlag: 1 } // ignoreWeakCheckFlag=1 跳过弱校验
      ).then((res) => {
        this.toggleOperationLoading();
        const result = getResponse(res);
        afterParticipateOperate(result);
      });
    };

    // 首次校验参与
    try {
      const ValidateResult = getResponse(await participateWithValidate(participateParams));
      if (!ValidateResult) {
        this.toggleOperationLoading();
        return;
      }

      const validateRes = validatorConfirmModal({
        response: ValidateResult,
        validatorType: 'highestValidatorType',
        validatorArrName: 'validateResults',
        onOk: confirmParticipate,
        onCancel: () => this.toggleOperationLoading(),
        errorOk: () => this.toggleOperationLoading(),
      });

      // highestValidatorType 返回结果为空或是不存在这个字段 走正常逻辑
      if (validateRes && !validateRes.highestValidatorType) {
        afterParticipateOperate(ValidateResult);
        return;
      }
    } catch (e) {
      this.toggleOperationLoading();
      throw e;
    }
  }

  // 参与后判断跳转页面
  afterParticipateDirectQuotationPrice = (result = {}) => {
    const { modelName = 'supplierQuotation' } = this.props;
    const {
      dispatch,
      [modelName]: { supplierHolderList = {} },
      match: { params },
    } = this.props;
    const { companyId = null } = params;

    const {
      sourceCategory,
      roundFlag,
      subjectMatterRule,
      projectLineSectionId = null,
      rfxHeaderId,
    } = supplierHolderList || {};
    const { jumpQuoteFlag = 0, quotationHeaderId = null } = result || {};

    if (!quotationHeaderId) {
      return;
    }

    if (jumpQuoteFlag) {
      const search = {
        roundFlag,
        rfxHeaderId,
      };

      if (companyId) {
        search.supplierCompanyId = companyId;
      }
      if (subjectMatterRule === 'PACK') {
        search.sectionFlag = 1;
        search.projectLineSectionId = projectLineSectionId;
      }

      const SearchStr = querystring.stringify(search);
      const PATHURL =
        (this.isPubNowPage() ? '/pub/ssrc/supplier-quotation' : `${getActiveTabKey()}`) +
        (sourceCategory === 'RFA'
          ? `/bidding-offer/${quotationHeaderId}`
          : `/inquiry-price/${quotationHeaderId}`);
      dispatch(
        routerRedux.push({
          pathname: PATHURL,
          search: SearchStr,
        })
      );
      return;
    }

    this.directionList();
  };

  /**
   * 确认放弃？
   */
  @Bind()
  onConfirmWaiver() {
    const { form } = this.props;
    form.validateFields((err) => {
      if (isEmpty(err)) {
        this.onConfirm();
      }
    });
  }

  /**
   * 确认
   */
  @Bind()
  onConfirm() {
    const { modelName = 'supplierQuotation' } = this.props;
    const {
      [modelName]: { supplierHolderList },
      match: { params },
      form,
    } = this.props;
    const { rfxId, companyId } = params;
    const { isBatchMaintainSection = false } = this.state;
    const { getCurrentSection = noop, getCheckedSectionList = noop, isSectionListEmpty = noop } =
      this.SectionRef || {};
    const { roundNumber, objectVersionNumber } = supplierHolderList;
    const headerData = form.getFieldsValue();
    const { abandonRemark } = headerData;

    let data = null;
    const sectionFlag = this.getBidSectionFlag();
    const sectionListEmptyFlag = isSectionListEmpty();
    if (!sectionFlag || sectionListEmptyFlag) {
      // 不区分标段 or 标段为空
      data = {
        rfxHeaderId: rfxId,
        roundNumber,
        objectVersionNumber,
        supplierCompanyId: companyId,
        abandonRemark,
      };
      this.abandonBatch(data);
      return;
    }

    const integrationSectionItem = (sectionItem = {}) => {
      if (!sectionItem) {
        return;
      }

      const {
        sourceHeaderId = null,
        sourceRoundNumber = null,
        sourceObjectVersionNumber = null,
      } = sectionItem;
      return {
        ...sectionItem,
        roundNumber: sourceRoundNumber,
        objectVersionNumber: sourceObjectVersionNumber,
        rfxHeaderId: sourceHeaderId,
        abandonRemark,
      };
    };

    const checkedList = getCheckedSectionList();
    const currentData = getCurrentSection();
    if (isBatchMaintainSection && !isEmpty(checkedList)) {
      // 区分标段, 批量勾选
      data = checkedList.map((item = {}) => {
        return integrationSectionItem(item);
      });
      this.supplierAbandonBatch(data);
      return;
    }

    data = integrationSectionItem(currentData);
    this.supplierAbandonBatch([data]);
  }

  // 放弃
  abandonBatch = (data = []) => {
    const { dispatch, organizationId, modelName = 'supplierQuotation' } = this.props;

    dispatch({
      type: `${modelName}/fatchAbandon`,
      payload: {
        organizationId,
        rfxHeader: data,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.directionList();
      } else {
        this.setState({
          giveUpVisible: false,
        });
      }
    });
  };

  // 放弃 - 分标段批量
  supplierAbandonBatch(data = []) {
    const { organizationId } = this.props;
    this.toggleOperationLoading(true);

    supplierAbandonBatch({
      organizationId,
      list: data,
    }).then((res) => {
      const result = getResponse(res);
      this.toggleOperationLoading();

      if (result) {
        notification.success();
        this.directionList();
      } else {
        this.setState({
          giveUpVisible: false,
        });
      }
    });
  }

  /**
   * 关闭放弃弹框
   */
  @Bind()
  handleConfirmWaiver() {
    this.setState({
      giveUpVisible: false,
    });
  }

  /**
   * 放弃
   */
  @Throttle(1000)
  @Bind()
  onAbandon() {
    this.setState({
      giveUpVisible: true,
    });
  }

  // 选择标段
  @Bind()
  selectBidSection() {
    this.setState((prev) => {
      return {
        isBatchMaintainSection: !prev.isBatchMaintainSection,
      };
    });
    this.resetSectionChecked();
  }

  @Bind()
  scrollWidth(columns, fixWidth) {
    const total = columns.reduce((prev, current) => prev + (current.width ? current.width : 0), 0);
    return total + fixWidth + 1;
  }

  /**
   * 物品明细 点击分页
   *
   * @param {*} [page={}]
   * @memberof Detail
   */
  @Bind()
  itemLinePageChange(page = {}) {
    this.fetchItemLine(page);
  }

  @Bind()
  linktoPrNumDetail(record) {
    const { dispatch } = this.props;
    const { prSourcePlatform, prHeaderId } = record;
    dispatch(
      routerRedux.push({
        pathname:
          prSourcePlatform && prSourcePlatform.toLowerCase() === 'erp'
            ? `/sprm/purchase-requisition-inquiry/erp-detail/${prHeaderId}`
            : `/sprm/purchase-requisition-inquiry/not-erp-detail/${prHeaderId}`,
      })
    );
  }

  // 当前供应商分类表格
  categoryTable() {
    const { modelName = 'supplierQuotation' } = this.props;
    const {
      organizationId,
      form,
      customizeTable,
      fetchItemLineLoading,
      [modelName]: {
        supplierHolderList = {},
        supplierItemsList = [],
        supplierItemsPagination = {},
      },
    } = this.props;
    const { doubleUnitFlag } = this.state;
    const { getFieldDecorator = (e) => e } = form;
    const columns = [
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.lineNo`).d('行号'),
        dataIndex: 'rfxLineItemNum',
        width: 60,
      },
      {
        title: intl.get('ssrc.common.startTime').d('开始时间'),
        dataIndex: 'quotationStartDate',
        width: 150,
        render: (val) => {
          return dateTimeRender(val);
        },
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.quotationsEndDate`).d('结束时间'),
        dataIndex: 'quotationEndDate',
        width: 150,
        render: (val) => {
          return dateTimeRender(val);
        },
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.businessUnit`).d('业务实体'),
        dataIndex: 'ouName',
        width: 120,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.inventoryOrg`).d('库存组织'),
        dataIndex: 'invOrganizationName',
        width: 150,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemName`).d('物料描述'),
        dataIndex: 'itemName',
        width: 150,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.commonName`).d('通用名'),
        dataIndex: 'commonName',
        width: 100,
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.itemCategory`).d('物品分类'),
        dataIndex: 'itemCategoryName',
        width: 100,
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.specs`).d('规格'),
        dataIndex: 'specs',
        width: 100,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.model`).d('型号'),
        dataIndex: 'model',
        width: 100,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.itemRemark`).d('物品说明'),
        dataIndex: 'itemRemark',
        width: 100,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.quotationDetails`).d('报价明细'),
        width: 100,
        dataIndex: 'quotationDetailFlag',
        render: (val, record) => (
          <QuotationDetail
            rowData={record}
            sourceFrom="RFX"
            detailFrom="SUP_QUOTATION" // 针对一些子模块的情况
            allowSupplierViewFlag
            bidFlag={this.bidFlag}
            rfxStatus={supplierHolderList.rfxStatus}
          />
        ),
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.deliveryAddress`).d('送货地址'),
        dataIndex: 'deliveryAddress',
        width: 100,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      doubleUnitFlag
        ? {
            title: intl.get(`ssrc.supplierQuotation.model.supQuo.rfxQuantity`).d('需求数量'),
            dataIndex: 'secondaryQuantity',
            width: 100,
            render: numberSeparatorRender,
          }
        : null,
      doubleUnitFlag
        ? {
            title: intl.get(`ssrc.supplierQuotation.model.supQuo.unit`).d('单位'),
            dataIndex: 'secondaryUomName',
            width: 80,
          }
        : null,
      {
        title: getQtyName(doubleUnitFlag),
        dataIndex: 'rfxQuantity',
        width: 120,
        render: numberSeparatorRender,
      },
      {
        title: getUomName(doubleUnitFlag),
        dataIndex: 'uomName',
        width: 120,
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.priceQuantity`).d('价格批量'),
        dataIndex: 'batchPrice',
        align: 'right',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.taxInclude`).d('是否含税'),
        dataIndex: 'taxIncludedFlag',
        width: 100,
        render: (val) => (
          <FormItem>
            {getFieldDecorator('taxIncludedFlag', {
              initialValue: val,
            })(<Checkbox disabled />)}
          </FormItem>
        ),
      },
      {
        title: <span>{intl.get(`ssrc.supplierQuotation.model.supQuo.taxRate`).d('税率')}</span>,
        dataIndex: 'taxRate',
        width: 100,
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.quotationRange`).d('报价幅度'),
        align: 'right',
        dataIndex: 'quotationRange',
        width: 100,
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.minLimitPrice`).d('最低限价'),
        dataIndex: 'minLimitPrice',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.maxLimitPrice`).d('最高限价'),
        dataIndex: 'maxLimitPrice',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.sampleRequestedFlag`).d('需要样品'),
        dataIndex: 'sampleRequestedFlag',
        width: 80,
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.includingFreight`).d('是否含运费'),
        dataIndex: 'freightIncludedFlag',
        width: 100,
        render: (val) => (
          <FormItem>
            {getFieldDecorator('freightIncludedFlag', {
              initialValue: val,
            })(<Checkbox disabled />)}
          </FormItem>
        ),
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.demandDate`).d('需求日期'),
        dataIndex: 'demandDate',
        width: 100,
        render: (val) => {
          return dateRender(val);
        },
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.startLadderLevel`).d('启用阶梯报价'),
        dataIndex: 'ladderInquiryFlag',
        width: 120,
        render: (val) => (
          <FormItem>
            {getFieldDecorator('ladderInquiryFlag', {
              initialValue: val,
            })(<Checkbox disabled />)}
          </FormItem>
        ),
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.ladderLevel`).d('阶梯报价'),
        dataIndex: 'ladderInquiry',
        width: 100,
        render: (_, record) =>
          record.ladderInquiryFlag === 1 ? (
            <a onClick={() => this.viewLadderLevelModal(record)}>
              {intl.get(`ssrc.supplierQuotation.view.message.button.ladderLevel`).d('阶梯报价')}
            </a>
          ) : null,
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.prNum`).d('采购申请号'),
        dataIndex: 'prNum',
        width: 100,
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.prLineNum`).d('采购申请行号'),
        dataIndex: 'prLineNum',
        width: 100,
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.drawingNum`).d('图号'),
        dataIndex: 'drawingNum',
        width: 100,
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.drawingVersionNumber`).d('图纸版本'),
        dataIndex: 'drawingVersionNumber',
        width: 80,
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.surfaceFlag`).d('表面处理标识'),
        dataIndex: 'surfaceFlag',
        width: 80,
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.supplierItemNum`).d('供应商料号'),
        dataIndex: 'supplierItemNum',
        width: 120,
      },
      {
        title: intl
          .get(`ssrc.supplierQuotation.model.supQuo.supplierItemNumDesc`)
          .d('供应商料号描述'),
        dataIndex: 'supplierItemNumDesc',
        width: 120,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.lineItemRemark`).d('物料行备注'),
        dataIndex: 'lineItemRemark',
        width: 120,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl
          .get(`ssrc.supplierQuotation.model.supQuo.commonInquiryAttachment`, {
            documentTypeName: this.documentTypeName,
          })
          .d('{documentTypeName}附件'),
        width: 180,
        dataIndex: 'attachmentUuid',
        render: (_, record) => (
          <Upload
            filePreview
            icon="download"
            bucketName={PRIVATE_BUCKET}
            bucketDirectory="ssrc-rfx-rfxitem"
            attachmentUUID={record.attachmentUuid}
            tenantId={organizationId}
            viewOnly
          />
        ),
      },
    ].filter(Boolean);
    const scrollWidth = this.scrollWidth(columns, 0);
    return customizeTable(
      {
        code: `SSRC.${this.custkey}SUPPLIER_PARTICIPATE.ITEM_LINE`,
        readOnly: true,
      },
      <EditTable
        bordered
        scroll={{ x: scrollWidth, y: 450 }}
        rowKey="categoryId"
        columns={columns}
        loading={fetchItemLineLoading}
        dataSource={supplierItemsList}
        pagination={supplierItemsPagination}
        onChange={(page) => this.itemLinePageChange(page)}
      />
    );
  }

  /**
   * 基本信息
   * @param {*} supplierHolderList
   */
  renderHeaderForm(supplierHolderList) {
    const {
      customizeForm,
      form: { getFieldDecorator },
    } = this.props;
    return customizeForm(
      {
        code: `SSRC.${this.custkey}SUPPLIER_PARTICIPATE.BASE_FORM`,
        form: this.props.form,
        dataSource: supplierHolderList,
      },
      <Form>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.supplierQuotation.model.supQuo.commonRFXNo`, {
                  categoryCode: this.categoryCode,
                })
                .d('{categoryCode}单号')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('rfxNum', {
                initialValue: supplierHolderList.rfxNum,
              })(<span>{supplierHolderList.rfxNum}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.supplierQuotation.model.supQuo.commonInquiryTitle`, {
                  documentTypeName: this.documentTypeName,
                })
                .d('{documentTypeName}标题')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('rfxTitle', {
                initialValue: supplierHolderList.rfxTitle,
              })(<span>{supplierHolderList.rfxTitle}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.supplierQuotation.model.supQuo.companyName`).d('客户')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('companyName', {
                initialValue: supplierHolderList.companyName,
              })(<span>{supplierHolderList.companyName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.supplierQuotation.model.supQuo.sourcingCategory`).d('寻源类别')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('sourceCategoryMeaning', {
                initialValue: supplierHolderList.sourceCategoryMeaning,
              })(
                <span>
                  {supplierHolderList.secondarySourceCategoryMeaning ||
                    supplierHolderList.sourceCategoryMeaning}
                </span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.supplierQuotation.model.supQuo.currency`).d('币种')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('currencyCode', {
                initialValue: supplierHolderList.currencyCode,
              })(<span>{supplierHolderList.currencyCode}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={<QuotationDirectLable />} {...EDIT_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('auctionDirectionMeaning', {
                initialValue: supplierHolderList.auctionDirectionMeaning,
              })(<span>{supplierHolderList.auctionDirectionMeaning}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.supplierQuotation.model.supQuo.commonQuotationStartsDate`, {
                  quotationName: this.quotationName,
                })
                .d('{quotationName}开始时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('quotationStartDate', {
                initialValue: supplierHolderList.quotationStartDate,
              })(<span>{dateTimeRender(supplierHolderList.quotationStartDate)}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.supplierQuotation.model.supQuo.commonQuotationEndDate`, {
                  quotationName: this.quotationName,
                })
                .d('{quotationName}截止时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('quotationEndDate', {
                initialValue: supplierHolderList.quotationEndDate,
              })(<span>{dateTimeRender(supplierHolderList.quotationEndDate)}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get(`hzero.common.remark`).d('备注')} {...EDIT_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('rfxRemark', {
                initialValue: supplierHolderList.rfxRemark,
              })(<span>{supplierHolderList.rfxRemark}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          {supplierHolderList && supplierHolderList.sourceFrom === 'PROJECT' && (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl
                  .get(`ssrc.supplierQuotation.model.supplierQuotation.sourceProjectNum`)
                  .d('寻源项目编号')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('sourceProjectNum', {
                  initialValue: supplierHolderList.sourceProjectNum,
                })(<span>{supplierHolderList.sourceProjectNum}</span>)}
              </FormItem>
            </Col>
          )}
          {supplierHolderList && supplierHolderList.sourceFrom === 'PROJECT' && (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl
                  .get(`ssrc.supplierQuotation.model.inquiryHall.sourceProjectName`)
                  .d('寻源项目名称')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('sourceProjectName', {
                  initialValue: supplierHolderList.sourceProjectName,
                })(<span>{supplierHolderList.sourceProjectName}</span>)}
              </FormItem>
            </Col>
          )}
          {supplierHolderList &&
            supplierHolderList.sourceFrom === 'PROJECT' &&
            supplierHolderList.subjectMatterRule === 'PACK' && (
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`ssrc.inquiryHall.model.inquiryHall.sectionName`).d('标段名称')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('sectionName', {
                    initialValue: supplierHolderList.sectionName,
                  })(<span>{supplierHolderList.sectionName}</span>)}
                </FormItem>
              </Col>
            )}
        </Row>
      </Form>
    );
  }

  /**
   * 其他信息
   * @param {*} supplierHolderList
   */
  renderOtherInfosForm(supplierHolderList = {}) {
    const { form = {}, customizeForm = () => {}, remote: remoteFunc } = this.props;
    const { getFieldDecorator = () => {} } = form;

    return (
      <React.Fragment>
        {customizeForm(
          {
            code: `SSRC.${this.custkey}SUPPLIER_PARTICIPATE.OTHERS_FORM`,
            form,
            dataSource: supplierHolderList,
            readOnly: true,
          },
          <Form>
            <Row gutter={48} className="read-row">
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl
                    .get(`ssrc.supplierQuotation.model.supQuo.sealedQuotation`)
                    .d('密封报价')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('sealedQuotationFlag', {
                    initialValue: supplierHolderList.sealedQuotationFlag,
                  })(<span>{yesOrNoRender(supplierHolderList.sealedQuotationFlag)}</span>)}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`ssrc.supplierQuotation.model.supQuo.sourcingType`).d('寻源类型')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('sourceTypeMeaning', {
                    initialValue: supplierHolderList.sourceTypeMeaning,
                  })(<span>{supplierHolderList.sourceTypeMeaning}</span>)}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl
                    .get(`ssrc.supplierQuotation.model.supQuo.priceCategory`)
                    .d('价格类型')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('priceCategoryMeaning', {
                    initialValue: supplierHolderList.priceCategoryMeaning,
                  })(<span>{supplierHolderList.priceCategoryMeaning}</span>)}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={48} className="read-row">
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`ssrc.supplierQuotation.model.supQuo.paymentTerms`).d('付款方式')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('paymentTypeName', {
                    initialValue: supplierHolderList.paymentTypeName,
                  })(<span>{supplierHolderList.paymentTypeName}</span>)}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`ssrc.common.model.common.termsOfPayment`).d('付款条款')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('paymentTermName', {
                    initialValue: supplierHolderList.paymentTermName,
                  })(<span>{supplierHolderList.paymentTermName}</span>)}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get('ssrc.inquiryHall.model.inquiryHall.bidBondYuan').d('保证金(元)')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('bidBond', {
                    initialValue: supplierHolderList.bidBond,
                  })(
                    <span>
                      {supplierHolderList.bidBond === 0 || supplierHolderList.bidBond === null
                        ? intl.get('ssrc.common.view.gratis').d('免费')
                        : numberSeparatorRender(supplierHolderList.bidBond) || null}
                    </span>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={48} className="read-row">
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`ssrc.supplierQuotation.model.supQuo.round`).d('轮次')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('roundNumber', {
                    initialValue: supplierHolderList.quotationRoundNumber,
                  })(<span>{supplierHolderList.quotationRoundNumber}</span>)}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={48} className="read-row">
              <Col {...FORM_COL_3_LAYOUT}>
                {remoteFunc
                  ? remoteFunc.render('SSRC_SUPPLIER_QUOTATION_DETAIL_RENDER_OTHER_FORM', <></>, {
                      getFieldDecorator,
                      supplierHolderList,
                      bidFlag: this.bidFlag,
                    })
                  : null}
              </Col>
            </Row>
          </Form>
        )}
      </React.Fragment>
    );
  }

  /**
   * 资格预审
   */
  renderPreQualificationForm(supplierHolderList) {
    const {
      organizationId,
      customizeForm,
      form: { getFieldDecorator },
    } = this.props;
    const { fileLength } = this.state;
    return customizeForm(
      {
        code: `SSRC.${this.custkey}SUPPLIER_PARTICIPATE.PRELIMINARY_QUALIFICATION`,
        form: this.props.form,
        dataSource: supplierHolderList,
        readOnly: true,
      },
      <Form>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.supplierQuotation.model.supQuo.prequalEndDate`)
                .d('预审申请截止时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('prequalEndDate', {
                initialValue: supplierHolderList.prequalEndDate,
              })(<span>{dateTimeRender(supplierHolderList.prequalEndDate)}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.supplierQuotation.model.supQuo.reviewMethod`).d('审查方式')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('reviewMethodMeaning', {
                initialValue: supplierHolderList.reviewMethodMeaning,
              })(<span>{supplierHolderList.reviewMethodMeaning}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.supplierQuotation.model.supQuo.qualifiedLimit`).d('合格上限')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('qualifiedLimit', {
                initialValue: supplierHolderList.qualifiedLimit,
              })(<span>{supplierHolderList.qualifiedLimit}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          {/* <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.supplierQuotation.model.supQuo.fileFreeFlag`).d('预审文件免费')}
              value={yesOrNoRender(supplierHolderList.fileFreeFlag)}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl
                .get(`ssrc.supplierQuotation.model.supQuo.prequalFileExpense`)
                .d('预审文件费')}
              value={
                supplierHolderList.fileFreeFlag === 1 ? 0 : supplierHolderList.prequalFileExpense
              }
            />
          </Col> */}
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.supplierQuotation.model.supQuo.prequalUser`).d('审查员')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('realName', {
                initialValue: supplierHolderList.realName,
              })(<span>{supplierHolderList.realName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.supplierQuotation.model.supQuo.prequalLocation`)
                .d('申请提交地点')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('prequalLocation', {
                initialValue: supplierHolderList.prequalLocation,
              })(<span>{supplierHolderList.prequalLocation}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.supplierQuotation.model.supQuo.enableScoreFlag`)
                .d('启用评分细项')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('enableScoreFlag', {
                initialValue: supplierHolderList.enableScoreFlag,
              })(<span>{yesOrNoRender(supplierHolderList.enableScoreFlag)}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            {/* <UEDDisplayFormItem
              label={intl
                .get(`ssrc.supplierQuotation.model.supQuo.enableScoreFile`)
                .d('资格预审文件')}
              value={
                supplierHolderList.fileFreeFlag === 0 ? (
                  <React.Fragment>
                    <a onClick={this.openUploadModal} style={{ pointerEvents: 'none' }} disabled>
                      <Icon type="download" />
                      {intl.get('hzero.common.upload.view').d('查看附件')}
                    </a>
                    {fileLength > 0 ? (
                      <Tag
                        color="#108ee9"
                        style={{ height: 'auto', lineHeight: '15px', marginLeft: '4px' }}
                      >
                        {fileLength}
                      </Tag>
                    ) : null}
                  </React.Fragment>
                ) : (
                  <Upload
                    filePreview
                    bucketName={PRIVATE_BUCKET}
                    bucketDirectory="ssrc-rfx-prequal"
                    attachmentUUID={supplierHolderList.prequalAttachmentUuid}
                    tenantId={organizationId}
                    viewOnly
                    icon="download"
                  />
                )
              }
            /> */}
            <FormItem
              label={intl
                .get(`ssrc.supplierQuotation.model.supQuo.enableScoreFile`)
                .d('资格预审文件')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('prequalAttachmentUuid', {
                initialValue: supplierHolderList.prequalAttachmentUuid,
              })(
                supplierHolderList.fileFreeFlag === 0 ? (
                  <React.Fragment>
                    <a onClick={this.openUploadModal} style={{ pointerEvents: 'none' }} disabled>
                      <Icon type="download" />
                      {intl.get('hzero.common.upload.view').d('查看附件')}
                    </a>
                    {fileLength > 0 ? (
                      <Tag
                        color="#108ee9"
                        style={{ height: 'auto', lineHeight: '15px', marginLeft: '4px' }}
                      >
                        {fileLength}
                      </Tag>
                    ) : null}
                  </React.Fragment>
                ) : (
                  <Upload
                    filePreview
                    bucketName="private-bucket"
                    bucketDirectory="ssrc-rfx-prequal"
                    attachmentUUID={supplierHolderList.prequalAttachmentUuid}
                    tenantId={organizationId}
                    viewOnly
                    icon="download"
                  />
                )
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.supplierQuotation.model.supQuo.prequalRemark`)
                .d('资格预审备注')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('prequalRemark', {
                initialValue: supplierHolderList.prequalRemark,
              })(<span>{supplierHolderList.prequalRemark}</span>)}
            </FormItem>
          </Col>
        </Row>
        {/* <Row gutter={48} className="read-row">
        </Row> */}
      </Form>
    );
  }

  batchEmptySectionRef = (ref = {}) => {
    this.BatchEmptySectionRef = ref;
  };

  // 批量操作标段不再提示modal ok
  batchOperateSections = () => {
    const { SectionRef, BatchEmptySectionRef = {} } = this;
    const { userConfig = {} } = this.state;
    if (isEmpty(BatchEmptySectionRef) || isEmpty(SectionRef)) {
      return;
    }

    try {
      this.BatchEmptySectionRef.saveUserConfigBatch({
        configKey: 'sectionSupplierParticipate',
        configDesc: 'sectionSupplierParticipateBatchMaintain',
        ...userConfig,
      });

      let data = SectionRef.getCurrentSection();
      const {
        sourceHeaderId = null,
        sourceRoundNumber = null,
        sourceObjectVersionNumber = null,
      } = data;
      data = {
        ...data,
        roundNumber: sourceRoundNumber,
        objectVersionNumber: sourceObjectVersionNumber,
        rfxHeaderId: sourceHeaderId,
      };
      this.handleParticipate(data);
    } catch (e) {
      throw e;
    } finally {
      this.batchOperateSectionsCancel();
      this.resetSectionChecked();
    }
  };

  // 批量操作标段不再提示modal cancel
  batchOperateSectionsCancel = () => {
    this.setState({
      batchEmptySelectSectionFlag: false,
    });
    this.resetSectionChecked();
  };

  // 分标段-清除勾选
  resetSectionChecked = () => {
    const { SectionRef } = this;
    if (isEmpty(SectionRef)) {
      return;
    }

    SectionRef.resetItemChecked();
  };

  // 是否显示批量操作按钮
  isBidSectionData() {
    const flag = this.getBidSectionFlag();

    if (isEmpty(this.SectionRef)) {
      return false;
    }

    const { isSectionListEmpty } = this.SectionRef;

    const notEmptyFlag = isSectionListEmpty();
    return !notEmptyFlag && flag;
  }

  // 获取分标段表示
  getBidSectionFlag() {
    let flag = false;

    const sectionFlag = this.getRouterSearch('sectionFlag');
    if (sectionFlag && sectionFlag === '1') {
      flag = true;
    }
    return flag;
  }

  // 获取路由location -> search -> [key]: value
  getRouterSearch = (key = null) => {
    if (!key || typeof key !== 'string') {
      return;
    }

    const {
      location: { search },
    } = this.props;
    const { [key]: s = null } = querystring.parse(search.substr(1));
    return s;
  };

  // 分标段提示弹框-ok
  handleOkSectionOperatePrompt = () => {
    this.handleCancellSectionOperatePrompt();
  };

  // 分标段提示弹框-cancel
  handleCancellSectionOperatePrompt = () => {
    const { operateSectionData = [] } = this.state;
    const { SectionRef } = this;
    if (!isEmpty(SectionRef) && !isEmpty(operateSectionData)) {
      const { activeItemOne = () => {} } = SectionRef;
      const { validateKey = null } = operateSectionData[0] || {};
      activeItemOne(validateKey);
    }

    this.setState({
      operateSectionData: [],
      operateSectionPromptFlag: false,
    });
  };

  // 切换标段定位到当前路由
  locatedCurrentUrl = (data = {}) => {
    const {
      history,
      location: { search },
    } = this.props;
    const { sourceHeaderId = null, supplierCompanyId = null, projectLineSectionId = null } = data;
    if (!sourceHeaderId || !supplierCompanyId) {
      return;
    }

    let newSearch = querystring.parse(search.substr(1));
    newSearch = querystring.stringify({
      ...newSearch,
      projectLineSectionId,
    });

    history.push({
      pathname: this.isPubNowPage()
        ? `/pub/ssrc/supplier-quotation/detail/${sourceHeaderId}/${supplierCompanyId}/operation`
        : `${this.activeTabKey}/detail/${sourceHeaderId}/${supplierCompanyId}/operation`,
      search: newSearch,
    });
  };

  // 判断是否/pub 页面
  isPubNowPage = () => {
    const {
      match: { path = null },
    } = this.props;
    const IsPublic = path && path.includes('/pub'); // /pub/ssrc/inquiry-hall/rfx-detail/:rfxId
    return IsPublic;
  };

  render() {
    const { modelName = 'supplierQuotation' } = this.props;
    const {
      [modelName]: { supplierHolderList = {}, ladderLevelData = [] },
      form: { getFieldDecorator },
      match: { params },
      organizationId,
      ParticipateLoading,
      abandonLoading,
      headerLoding,
      fetchLadderLevelTableLoading,
      fetchItemLineLoading,
    } = this.props;
    const { type = null, rfxId = null, companyId = null } = params;
    const {
      businessAttachments,
      techAttachments,
      previewVisible,
      previewFileName,
      previewImage,
      giveUpVisible,
      doubleUnitFlag,
      viewLadderLevelVisible,
      LadderLevelHeaderData,
      collapseKeys = [],
      isBatchMaintainSection = false,
      batchEmptySelectSectionFlag = false,
      operateSectionData = [],
      operateSectionPromptFlag = true,
      operationLoading = false,
    } = this.state;
    const ladderLevelModalProps = {
      visible: viewLadderLevelVisible,
      hideModal: this.hideLadderLevelModal,
      ladderLevelData,
      doubleUnitFlag,
      LadderLevelHeaderData,
      fetchLadderLevelLoading: fetchLadderLevelTableLoading,
    };
    const previewModalStyle = {
      maxWidth: '50vw',
      maxHeight: '50vh',
    };
    const previewImageStyle = {
      maxWidth: '100%',
      maxHeight: '100%',
    };

    const { techAttachmentFlag, businessAttachmentFlag } = supplierHolderList;
    const BidSectionFlag = this.getBidSectionFlag(); // 是否分标段
    const isBidSectionData = this.isBidSectionData();

    const SectionPanelProps = {
      locatedCurrentUrl: this.locatedCurrentUrl,
      parentPage: {
        name: 'participation',
        queryParams: {
          sectionBatchMaintainType: 'PARTICIPATE',
          rfxHeaderId: rfxId,
          supplierCompanyId: companyId,
          // customizeUnitCode: `SSRC.${this.custkey}SUPPLIER_PARTICIPATE.BASE_FORM,SSRC.${this.custkey}SUPPLIER_PARTICIPATE.OTHERS_FORM`,
        },
      },
      projectLineSectionId: this.getRouterSearch('projectLineSectionId'),
      paramKeys: ['sourceHeaderId', 'supplierCompanyId'],
      queryMain: this.querySupplier,
      isSection: BidSectionFlag,
      isBatchMaintainSection,
    };

    // 批量处理标段时候未勾选标段数据提示框
    const BatchProps = {
      parentPage: {
        name: 'participation',
        queryParams: {
          sectionBatchMaintainType: 'PARTICIPATE',
          rfxHeaderId: rfxId,
        },
      },
      visible: batchEmptySelectSectionFlag,
      handleOk: this.batchOperateSections,
      handleCancel: this.batchOperateSectionsCancel,
      onRef: this.batchEmptySectionRef,
      projectLineSectionId: this.getRouterSearch('projectLineSectionId'),
    };

    // 分标段操作提示modal
    const operateSectionPrompt = {
      dataList: operateSectionData,
      visible: operateSectionPromptFlag,
      handleOk: this.handleOkSectionOperatePrompt,
      handleCancel: this.handleCancellSectionOperatePrompt,
    };

    // Content
    const ContentMain = (
      <Content>
        <Spin
          spinning={!BidSectionFlag ? headerLoding : operationLoading || headerLoding}
          wrapperClassName={classnames(styles['page-content'], 'ued-detail-wrapper')}
        >
          <Collapse
            className="form-collapse"
            onChange={this.onCollapseChange}
            defaultActiveKey={['baseInfos', 'otherInfo', 'preQualification']}
          >
            <Panel
              showArrow={false}
              header={
                <Fragment>
                  <h3>
                    {intl
                      .get(`ssrc.supplierQuotation.view.message.panel.basicInformation`)
                      .d('基本信息')}
                  </h3>
                  <a>
                    {collapseKeys.includes('baseInfos')
                      ? intl.get(`hzero.common.button.up`).d('收起')
                      : intl.get(`hzero.common.button.expand`).d('展开')}
                  </a>
                  <Icon type={collapseKeys.includes('baseInfos') ? 'up' : 'down'} />
                </Fragment>
              }
              key="baseInfos"
            >
              {this.renderHeaderForm(supplierHolderList)}
            </Panel>
            <Panel
              showArrow={false}
              header={
                <Fragment>
                  <h3>
                    {intl.get(`ssrc.supplierQuotation.view.message.panel.otherInfos`).d('其他信息')}
                  </h3>
                  <a>
                    {collapseKeys.includes('otherInfo')
                      ? intl.get(`hzero.common.button.up`).d('收起')
                      : intl.get(`hzero.common.button.expand`).d('展开')}
                  </a>
                  <Icon type={collapseKeys.includes('otherInfo') ? 'up' : 'down'} />
                </Fragment>
              }
              key="otherInfo"
            >
              {this.renderOtherInfosForm(supplierHolderList)}
            </Panel>
            {supplierHolderList.preQualificationFlag && (
              <Panel
                showArrow={false}
                header={
                  <Fragment>
                    <h3>
                      {intl
                        .get(`ssrc.supplierQuotation.view.message.panel.preQualification`)
                        .d('资格预审')}
                    </h3>
                    <a>
                      {collapseKeys.includes('preQualification')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('preQualification') ? 'up' : 'down'} />
                  </Fragment>
                }
                key="preQualification"
              >
                {this.renderPreQualificationForm(supplierHolderList)}
              </Panel>
            )}
          </Collapse>
          <Tabs defaultActiveKey="1" animated={false}>
            <TabPane
              tab={intl.get(`ssrc.supplierQuotation.view.message.tab.itemDetails`).d('物品明细')}
              key="1"
            >
              {this.categoryTable()}
            </TabPane>
            <TabPane
              tab={intl.get(`ssrc.supplierQuotation.view.message.tab.attachmentInfo`).d('附件列表')}
              key="2"
            >
              {supplierHolderList.tenderFeeFlag ? (
                <div className={styles['no-pay-container']}>
                  <div className={styles['no-pay-tip']}>
                    <Icon type="info-circle" style={{ color: '#faad14', paddingRight: '4px' }} />
                    {intl
                      .get('ssrc.supplierQuotation.view.message.beforePayTenderFee')
                      .d('缴纳招标文件费后可下载附件')}
                  </div>
                </div>
              ) : (
                <Row>
                  <Col span={11}>
                    <p>
                      {intl
                        .get(`ssrc.supplierQuotation.model.supQuo.businessAttachments`)
                        .d('商务附件')}
                      ：
                    </p>
                    {businessAttachmentFlag ? (
                      <UploadButton
                        filePreview
                        viewOnly
                        multiple
                        listType="picture-card"
                        fileList={businessAttachments}
                        onPreview={this.handlePreview}
                        bucketName={PRIVATE_BUCKET}
                        bucketDirectory="ssrc-rfx-rfxheader"
                        onRef={this.onRef}
                        uploadData={(e) => this.uploadData(e, 'bussiness')}
                        tenantId={organizationId}
                        action={`${HZERO_FILE}/v1${
                          isUndefined(organizationId) ? '/' : `/${organizationId}/`
                        }files/attachment/multipart`}
                        onRemove={(e) => this.removeFile(e, 'bussiness')}
                        onUploadSuccess={this.onUploadSuccess}
                      />
                    ) : (
                      <span>
                        <img src={require('@/assets/attachs.png')} alt="" />
                      </span>
                    )}
                  </Col>
                  <Col span={11}>
                    <p>
                      {intl
                        .get(`ssrc.supplierQuotation.model.supQuo.techAttachments`)
                        .d('技术附件')}
                      ：
                    </p>
                    {techAttachmentFlag ? (
                      <UploadButton
                        filePreview
                        viewOnly
                        multiple
                        listType="picture-card"
                        fileList={techAttachments}
                        onPreview={this.handlePreview}
                        bucketName={PRIVATE_BUCKET}
                        bucketDirectory="ssrc-rfx-rfxheader"
                        onRef={this.onRef}
                        uploadData={this.uploadData}
                        tenantId={organizationId}
                        action={`${HZERO_FILE}/v1${
                          isUndefined(organizationId) ? '/' : `/${organizationId}/`
                        }files/attachment/multipart`}
                        onRemove={this.removeFile}
                        onUploadSuccess={this.onUploadSuccess}
                      />
                    ) : (
                      <span>
                        <img src={require('@/assets/attachs.png')} alt="" />
                      </span>
                    )}
                  </Col>
                </Row>
              )}
            </TabPane>
          </Tabs>
        </Spin>
      </Content>
    );

    return (
      <React.Fragment>
        <Header
          backPath={
            this.isPubNowPage() ? `/pub/ssrc/supplier-quotation/list` : `${this.activeTabKey}/list`
          }
          title={intl
            .get(`ssrc.supplierQuotation.view.message.title.commonRFxDetail`, {
              categoryCode: this.categoryCode,
            })
            .d('{categoryCode}明细')}
        >
          {type === 'operation' && !supplierHolderList.quotationHeaderId && (
            <React.Fragment>
              <Button
                type="primary"
                loading={
                  ParticipateLoading || operationLoading || fetchItemLineLoading || headerLoding
                }
                onClick={this.onParticipate}
              >
                <Icon type="person_pin" />
                {intl.get(`ssrc.supplierQuotation.view.message.button.participate`).d('参与')}
              </Button>
              <Button
                type="default"
                loading={
                  ParticipateLoading || operationLoading || fetchItemLineLoading || headerLoding
                }
                onClick={() => this.onAbandon()}
              >
                <Icon type="cancel" />
                {intl.get(`ssrc.supplierQuotation.view.message.giveUp`).d('放弃')}
              </Button>
              {isBidSectionData ? (
                <Button onClick={this.selectBidSection}>
                  {!isBatchMaintainSection ? <Icon type="auto_complete" /> : <Icon type="cancel" />}
                  {!isBatchMaintainSection
                    ? intl.get(`ssrc.common.view.button.selectBidSectionBtn`).d('选择标段')
                    : intl.get(`ssrc.common.view.button.cancelSelect`).d('取消选择')}
                </Button>
              ) : null}
            </React.Fragment>
          )}
        </Header>

        <SectionPanel
          {...SectionPanelProps}
          onRef={(node) => {
            this.SectionRef = node;
          }}
        >
          {ContentMain}
        </SectionPanel>

        <Modal
          visible={previewVisible}
          footer={null}
          onCancel={this.handlePreviewCancel}
          style={previewModalStyle}
        >
          <img alt={previewFileName} style={previewImageStyle} src={previewImage} />
        </Modal>
        <Modal
          visible={giveUpVisible}
          title={intl
            .get(`ssrc.supplierQuotation.view.message.title.waiverOfQuotation`)
            .d('放弃报价')}
          footer={null}
          onCancel={this.handleConfirmWaiver}
          style={previewModalStyle}
        >
          <Fragment>
            <Form>
              <FormItem
                label={intl.get(`ssrc.supplierQuotation.model.supQuo.giveUpReason`).d('放弃理由')}
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 20 }}
              >
                {getFieldDecorator('abandonRemark', {
                  initialValue: supplierHolderList.abandonRemark,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`ssrc.supplierQuotation.model.supQuo.giveUpReason`)
                          .d('放弃理由'),
                      }),
                    },
                  ],
                })(<TextArea style={{ height: 65 }} />)}
              </FormItem>
            </Form>
            <Button
              icon="save"
              type="primary"
              style={{ marginLeft: 394, marginTop: 0 }}
              onClick={this.onConfirmWaiver}
              loading={abandonLoading}
            >
              {intl.get(`ssrc.supplierQuotation.view.message.button.confirm`).d('确认')}
            </Button>
          </Fragment>
        </Modal>
        {viewLadderLevelVisible && <LadderLevelModal {...ladderLevelModalProps} />}

        {batchEmptySelectSectionFlag && <BatchEmptySelectedModal {...BatchProps} />}
        {operateSectionPromptFlag && <OperateSectionPromptModal {...operateSectionPrompt} />}
      </React.Fragment>
    );
  }
}

const hocComponent = (NewComponent) => {
  return withCustomize({
    unitCode: [
      'SSRC.SUPPLIER_PARTICIPATE.ITEM_LINE',
      'SSRC.SUPPLIER_PARTICIPATE.BASE_FORM',
      'SSRC.SUPPLIER_PARTICIPATE.OTHERS_FORM',
      'SSRC.SUPPLIER_PARTICIPATE.PRELIMINARY_QUALIFICATION',
    ],
  })(
    formatterCollections({
      code: [
        'ssrc.supplierQuotation',
        'ssrc.bidHall',
        'ssrc.common',
        'ssrc.inquiryHall',
        'ssrc.offlineResultEntry',
      ],
    })(
      connect(({ inquiryHall, supplierQuotation, loading }) => ({
        inquiryHall,
        supplierQuotation,
        modelName: 'supplierQuotation',
        organizationId: getCurrentOrganizationId(),
        headerLoding: loading.effects['supplierQuotation/fetchHeadDataList'],
        ParticipateLoading: loading.effects['supplierQuotation/fatchParticipate'],
        abandonLoading: loading.effects['supplierQuotation/fatchAbandon'],
        fetchLadderLevelTableLoading: loading.effects['supplierQuotation/fetchLadderLevelyTable'],
        fetchItemLineLoading: loading.effects['supplierQuotation/fetchItemsDataList'],
      }))(
        Form.create({ fieldNameProp: null })(
          remote(
            {
              code: 'SSRC_SUPPLIER_QUOTATION_DETAIL',
              name: 'remote',
            },
            {
              events: {
                remoteBeforeHandleParticipateBatch() {},
              },
            }
          )(NewComponent)
        )
      )
    )
  );
};

export default hocComponent(Detail);

export { Detail, hocComponent };
