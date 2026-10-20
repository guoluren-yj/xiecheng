import React, { Component, Fragment } from 'react';
import { Button, Modal, DataSet, Form, Lov } from 'choerodon-ui/pro';
import { Tabs, Tooltip } from 'choerodon-ui';
import request from 'utils/request';
import { Bind, Debounce, Throttle } from 'lodash-decorators';
import { SRM_SPRM, SRM_SSRC, SRM_SPCM } from '_utils/config';
import { Header, Content } from 'components/Page';
import { Button as PermissionButton } from 'components/Permission';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, getCurrentTenant, getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { routerRedux } from 'dva/router';
import querystring from 'querystring';
import { isEmpty, cloneDeep } from 'lodash';
import { observer } from 'mobx-react-lite';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { lovDefineAxiosConfig } from 'srm-front-boot/lib/utils/c7nUiConfig';
import {
  checkOrderRule,
  lineCreate,
  checkApplyToInquiry,
  createApplyToInquiry,
  fetchOrderConfig,
  backUnassign,
} from '@/services/purchaseRequisitionPoolService.js';
import { fetchConfigRfxUI } from '@/services/purchaseExecutionService';
import { fetchUomControl } from '@/services/purchaseRequisitionCreationService.js';
import { refundedDs } from '../components/refundedModal/refundedDs';
import RefundedModal from '../components/refundedModal';

import TransferOrder from './TransferOrder';
import TransferAll from './TransferAll';
import TransferInquiryQuotation from './TransferInquiryQuotation';
import TransferQuoteApproval from './TransferQuoteApproval';
import TransferBidding from './TransferBidding';
import TransferContract from './TransferContract';
import './index.less';

const { TabPane } = Tabs;
const organizationId = getCurrentOrganizationId();
const modalKey = Modal.key();

let templateId = null;

@withCustomize({
  unitCode: ['SPRM.PURCHASE_REQUISITION_POLL.TAB', 'SPRM.PURCHASE_REQUISITION_POLL.BACK_MODAL'],
})
@formatterCollections({
  code: [
    'sprm.common',
    'smdm.common',
    'sodr.orderType',
    'sodr.quotePurchaseRequisition',
    'sodr.orderMaintenanceEntry',
    'ssrc.inquiryHall',
    'ssrc.common',
    'entity.item',
    'sprm.purchaseReqCreation',
    'sodr.common',
    'ssrc.bidHall',
    'spcm.common',
    'entity.company',
    'entity.business',
    'entity.organization',
    'entity.roles',
    'sprm.purchaseRequisitionAssign',
    'entity.attachment',
    'sodr.quotePurchase',
    'ssrc.priceLibrary',
    'entity.supplier',
    'hzero.common',
    'sodr.workspace',
  ],
})
export default class PartsRecDemandPool extends Component {
  state = {
    isNewRfxDetailUI: false,
    allDate: null,
    orderDate: null,
    biddingDate: null,
    inquiryQuotationDate: null,
    contractDate: null,
    quoteApproval: null,
    activeKey: 'all',
    backUnassignLoading: false,
    doubleUintFlag: {}, // 双单位配置
    // createLoading: false,
  };

  componentDidMount() {
    this.initTotalPage();
    this.getRfxDetailUIConfig();
    this.getDoubleUnitSetting();
  }

  @Bind()
  getDoubleUnitSetting() {
    fetchUomControl().then((res) => {
      const result = getResponse(res);
      if (result) {
        this.setState({
          doubleUintFlag: result || {},
        });
      }
    });
  }

  @Bind()
  getRfxDetailUIConfig() {
    fetchConfigRfxUI({
      organizationId: getCurrentOrganizationId(),
      tenantNum: getCurrentTenant().tenantNum,
    }).then((res) => {
      const result = getResponse(res);
      if (result && !isEmpty(result)) {
        this.setState({ isNewRfxDetailUI: false });
      } else {
        this.setState({ isNewRfxDetailUI: true });
      }
    });
  }

  @Bind()
  initTotalPage() {
    Promise.all([
      this.handleOrderDate(),
      this.handleBiddingDate(),
      this.handleSourceDate(),
      this.handleContractDate(),
    ]).then((res) => {
      if (res) {
        this.setState({
          orderDate: res[0] ? res[0].totalElements : null,
          biddingDate: res[1] ? res[1].totalElements : null,
          inquiryQuotationDate: res[2] ? res[2].totalElements : null,
          contractDate: res[3] ? res[3].totalElements : null,
          quoteApproval: res[1] ? res[1].totalElements : null,
        });
      }
    });
  }

  @Bind()
  updatePage(total, tabsName) {
    this.setState({ [tabsName]: total });
  }

  @Bind()
  queryAll() {
    if (this.all) {
      this.all.tableDataDs.query();
    }
    if (this.order) {
      this.order.tableDataDs.query();
    }
    if (this.inquiryQuotation) {
      this.inquiryQuotation.tableDataDs.query();
    }
    if (this.bidding) {
      this.bidding.tableDataDs.query();
    }
    if (this.contract) {
      this.contract.tableDataDs.query();
    }
    if (this.quoteApproval) {
      this.quoteApproval.tableDataDs.query();
    }
  }

  handleOrderDate() {
    return request(`${SRM_SPRM}/v1/${organizationId}/po-refer-pr/pr-line`, {
      method: 'GET',
      query: {
        erpControlFlag: 1,
        onlyCountFlag: 'Y',
      },
    });
  }

  handleBiddingDate() {
    return request(`${SRM_SSRC}/v1/${organizationId}/share/application`, {
      method: 'GET',
      query: { erpControlFlag: 1, onlyCountFlag: 'Y' },
    });
  }

  handleContractDate() {
    return request(`${SRM_SPCM}/v1/${organizationId}/prLine/page`, {
      method: 'GET',
      query: { erpControlFlag: 1, tenantId: organizationId, onlyCountFlag: 'Y' },
    });
  }

  handleSourceDate() {
    return request(`${SRM_SSRC}/v1/${organizationId}/share/application`, {
      method: 'GET',
      query: { erpControlFlag: 1, onlyCountFlag: 'Y' },
    });
  }

  handleChangeTab = (newActiveKey) => {
    this.setState({ activeKey: newActiveKey });
  };

  @Bind()
  @Throttle(500)
  async handleCreate() {
    const { activeKey } = this.state;
    let data = [];
    let prLineIdList = [];
    switch (activeKey) {
      case 'order':
        await this.handleOrderCreate();
        break;
      case 'inquiryQuotation':
        data = this.inquiryQuotation.tableDataDs.selected.map((ele) => ele.toData());
        prLineIdList = data.map((ele) => ele.prLineId);
        if (isEmpty(data)) {
          notification.error({
            message: intl.get(`hzero.common.validation.atLeast`).d('请至少选择一条数据'),
          });
          return;
        }
        await checkApplyToInquiry({
          prLineIdList,
          sourceFrom: 'DEMAND_POOL',
          configCenterCode: 'SITE.SSRC.RFX_PURCHASE_MERGE_RULE',
        }).then((res) => {
          if (res) {
            if (res.failed) {
              notification.error({ message: res.message });
              return;
            }
            if (res.companyInconsistentFlag === 1) {
              Modal.confirm({
                title: intl
                  .get(`ssrc.inquiryHall.view.message.diffCompany`)
                  .d('并单公司不一致,是否继续?'),
                onOk: () => {
                  this.openModal();
                  this.setState({ prLineIdList });
                },
              });
            } else {
              this.openModal();
              this.setState({ prLineIdList });
            }
          }
        });
        break;
      case 'bidding':
        data = this.bidding.tableDataDs.selected.map((ele) => ele.toData());
        prLineIdList = data.map((ele) => ele.prLineId);
        if (isEmpty(data)) {
          notification.error({
            message: intl.get(`hzero.common.validation.atLeast`).d('请至少选择一条数据'),
          });
          return;
        }
        await request(`${SRM_SSRC}/v1/${organizationId}/share/valid-purchase`, {
          method: 'POST',
          body: {
            prLineIdList,
            sourceDocumentType: 'BID',
            configCenterCode: 'SITE.SSRC.BID_PURCHASE_MERGE_RULE',
          },
        }).then((res) => {
          if (res) {
            if (res.failed) {
              notification.error({ message: res.message });
              return;
            }
            if (res.currencyInconsistentFlag === 1) {
              notification.error({
                content: intl
                  .get('ssrc.bidHall.view.message.notCreate.currency')
                  .d('币种不一致，不能并单创建'),
              });
              return;
            }
            if (res.companyInconsistentFlag === 1 && res.currencyInconsistentFlag === 0) {
              Modal.confirm({
                title: intl
                  .get(`ssrc.inquiryHall.view.message.diffCompany`)
                  .d('并单公司不一致,是否继续?'),
                onOk: () => {
                  this.openModal();
                  this.setState({ prLineIdList });
                },
              });
            } else {
              this.openModal();
              this.setState({ prLineIdList });
            }
          }
        });
        break;
      case 'quoteApproval':
        data = this.quoteApproval.tableDataDs.selected.map((ele) => ele.toData());
        prLineIdList = data.map((ele) => ele.prLineId);
        if (isEmpty(data)) {
          notification.error({
            message: intl.get(`hzero.common.validation.atLeast`).d('请至少选择一条数据'),
          });
          return;
        }
        await request(`${SRM_SSRC}/v1/${organizationId}/share/valid-purchase`, {
          method: 'POST',
          body: {
            prLineIdList,
            sourceDocumentType: 'PROJECT',
            configCenterCode: 'SITE.SSRC.PROJECT_PURCHASE_MERGE_RULE',
          },
        }).then((res) => {
          if (res) {
            if (res.failed) {
              notification.error({ message: res.message });
              return;
            }
            if (res.companyInconsistentFlag === 0 && res.currencyInconsistentFlag === 1) {
              Modal.error({
                content: intl
                  .get('ssrc.inquiryHall.view.message.notCreate.currency')
                  .d('币种不一致，不能并单创建'),
              });
              return;
            }
            if (res.unitInconsistentFlag === 1) {
              Modal.error({
                content: intl
                  .get('ssrc.inquiryHall.view.message.notCreate.depart')
                  .d('部门不一致，不能并单创建'),
              });
              return;
            }
            if (
              res.companyInconsistentFlag === 0 &&
              res.currencyInconsistentFlag === 0 &&
              res.unitInconsistentFlag === 0
            ) {
              this.setState({ prLineIdList }, () => {
                this.handleCreateInquiry();
              });
            }
            if (
              res.companyInconsistentFlag === 1 &&
              res.currencyInconsistentFlag === 0 &&
              res.unitInconsistentFlag === 0
            ) {
              Modal.confirm({
                title: intl
                  .get(`ssrc.inquiryHall.view.message.diffCompany`)
                  .d('并单公司不一致,是否继续?'),
                onOk: () => {
                  this.setState({ prLineIdList }, () => {
                    this.handleCreateInquiry();
                  });
                },
              });
            } else {
              this.setState({ prLineIdList }, () => {
                this.handleCreateInquiry();
              });
            }
          }
        });
        break;
      case 'contract':
        // eslint-disable-next-line no-case-declarations
        const selectedPurchaseContracts = this.contract.tableDataDs.selected.map((ele) =>
          ele.toData()
        );
        if (isEmpty(selectedPurchaseContracts)) {
          notification.error({
            message: intl.get(`hzero.common.validation.atLeast`).d('请至少选择一条数据'),
          });
          return;
        }
        await request(`${SRM_SPCM}/v1/${organizationId}/createPcOrder-verified`, {
          method: 'POST',
          body: selectedPurchaseContracts,
        }).then((res) => {
          if (isEmpty(res)) {
            // 合并头信息
            const headerInfo = [
              'supplierTenantId',
              'supplierCompanyId',
              'supplierCompanyName',
              'supplierId',
              'supplierName',
              'ouId',
              'ouName',
              'purchaseOrgId',
              'purchaseOrgName',
              'purchaseAgentId',
              'purchaseAgentName',
              'companyOrgName',
              'companyOrgId',
              'costAnchDepId',
              'costAnchDepDesc',
              'overseasProcurement',
              'companyId',
              'companyName',
            ].reduce((obj, filedNames) => {
              const [filedName, targetFiledName] = [].concat(filedNames);
              const _headerInfo = obj;
              // 当前字段在选择项中不同值集合
              const diffValues = new Set(
                selectedPurchaseContracts.map((purchaseContract) => {
                  if (purchaseContract[filedName]) {
                    return purchaseContract[filedName];
                  } else {
                    return null;
                  }
                })
              );
              diffValues.delete(null);
              if (diffValues.size === 1) {
                [_headerInfo[targetFiledName || filedName]] = diffValues;
              }
              return _headerInfo;
            }, {});
            headerInfo.pcSourceCodeMeaning = intl
              .get(`spcm.common.model.purchaseDemand`)
              .d('采购需求');
            headerInfo.pcSourceCode = 'PURCHASE_NEED';
            // 合并协议标行
            const contractSubjects = cloneDeep(selectedPurchaseContracts).map((_subject) => {
              const subject = _subject;
              delete subject.$form;
              subject.deliverDate = subject.neededDate;
              subject.address = subject.location;
              subject.sourceCode = subject.prNum;
              subject.sourceLineNum = subject.lineNum;
              subject.prLineNum = subject.lineNum;
              subject.quantity = subject.availableQuantity;
              subject.specifications = subject.itemSpecs;
              subject.sourceDisplayLineNum = subject.displayLineNum;
              subject.model = subject.itemModel;
              return subject;
            });
            const contractMaintain = {
              headerInfo,
              pcSubjectDataSource: contractSubjects,
            };

            const itemKey = `spcm.contractMaintain.${Math.random()}`;
            window.sessionStorage.setItem(itemKey, JSON.stringify(contractMaintain));
            this.props.history.push({
              pathname: '/spcm/contract-maintain/detail',
              search: `?from=purchaseContract&itemKey=${itemKey}`,
            });
          }
        });
        break;
      default:
    }
  }

  @Bind()
  async handleOrderCreate() {
    const data = this.order.tableDataDs.selected.map((ele) => {
      const newDate = ele.toJSONData();
      return { ...newDate };
    });
    if (isEmpty(data)) {
      notification.error({
        message: intl.get(`hzero.common.validation.atLeast`).d('请至少选择一条数据'),
      });
      return;
    }
    const { prSourcePlatform } = data[0];
    return new Promise(async (resolve) => {
      checkOrderRule({ sourceCode: 'PURCHASE_REQUEST' }).then((result) => {
        if (result === 1) {
          if (data.length > 0) {
            lineCreate(data).then((res) => {
              if (res?.failed) {
                notification.error({ message: res.message });
                resolve();
              }
              if (res && res.length > 1) {
                notification.success();
                this.order.tableDataDs.unSelectAll();
                this.order.tableDataDs.clearCachedSelected();
                this.props.history.push({
                  pathname: `/sodr/purchase-order-maintain/quote-purchase-requisition/tab-line-newCreation`,
                  search: `?poHeaderId=${res.map((n) => n.poHeaderId)}&cacheKey=${res[0].cacheKey
                    }&source=newRequisition&sourcePage=pageRequest`,
                });
                resolve();
              } else if (res && !res.failed && res.length === 1) {
                const { poHeaderId } = res[0];
                notification.success();
                this.handleToDetail(poHeaderId, prSourcePlatform);
                resolve();
              }
            });
          }
        } else if (result === 0) {
          if (data.length > 0) {
            lineCreate(data).then((res) => {
              if (res?.failed) {
                notification.error({ message: res.message });
                resolve();
              }
              if (res && !res.failed && res[0]) {
                const { poHeaderId } = res[0];
                this.order.tableDataDs.unSelectAll();
                this.order.tableDataDs.clearCachedSelected();
                this.handleToDetail(poHeaderId, prSourcePlatform);
                resolve();
                notification.success();
              }
            });
          }
        } else {
          getResponse(result);
          resolve();
        }
      });
    });
  }

  /**
   * 跳转到详情页
   * @param {String} headerId
   */
  @Bind()
  handleToDetail(headerId, source) {
    // 存放首次加载价格库查询标识
    const itemKey = `sodr.quotePurchaseRequisition.${Math.random()}`;
    window.sessionStorage.setItem(itemKey, 1);
    // 获取老订单工作台配置表信息
    fetchOrderConfig({
      tenantNum: getCurrentTenant().tenantNum,
    }).then((res) => {
      const result = getResponse(res);
      this.order.tableDataDs.unSelectAll();
      this.order.tableDataDs.clearCachedSelected();
      if (result && !isEmpty(result)) {
        if (source === 'CATALOGUE') {
          this.props.history.push({
            pathname: `/sodr/purchase-order-maintain/quote-purchase-requisition/line-creation`,
            search: `?poHeaderId=${headerId}&source=requisition&itemKey=${itemKey}&poSourcePlatform=${source}`,
          });
        } else if (source === 'SRM' || source === 'ERP' || source === 'SHOP') {
          this.props.history.push({
            pathname: `/sodr/purchase-order-maintain/quote-purchase-requisition/line-newCreation`,
            search: `?poHeaderId=${headerId}&source=newRequisition&sourcePage=pageRequest&poSourcePlatform=${source}`,
          });
        } else if (source === 'E-COMMERCE') {
          this.props.history.push({
            pathname: `/sodr/purchase-order-maintain/quote-purchase-requisition/sheet-creation`,
            search: `?poHeaderId=${headerId}&source=requisition&itemKey=${itemKey}&poSourcePlatform=${source}`,
          });
        }
      } else {
        if (source === 'CATALOGUE') {
          this.props.history.push({
            pathname: `/sodr/order-workspace/detail/catalogue-request/${headerId}`,
          });
        }
        if (source === 'SRM' || source === 'ERP' || source === 'SHOP') {
          this.props.history.push({
            pathname: `/sodr/order-workspace/detail/purchase-request/${headerId}`,
          });
        }
        if (source === 'E-COMMERCE') {
          this.props.history.push({
            pathname: `/sodr/order-workspace/detail/ecommerce-request/${headerId}`,
          });
        }
      }
    });
    // if (source === 'ERP' || source === 'SRM' || source === 'SHOP') {
    //   this.props.history.push({
    //     pathname: `/sodr/purchase-order-maintain/quote-purchase-requisition/line-newCreation`,
    //     search: `?poHeaderId=${headerId}&source=newRequisition&sourcePage=pageRequest`,
    //   });
    // } else {
    //   // 旧版采购申请转订单页面跳转逻辑
    //   this.props.history.push({
    //     pathname: `/sodr/purchase-order-maintain/quote-purchase-requisition/line-creation`,
    //     search: `?poHeaderId=${headerId}&source=requisition&itemKey=${itemKey}`,
    //   });
    // }
  }

  @Bind()
  async handleCreateInquiry() {
    const { activeKey, prLineIdList, isNewRfxDetailUI } = this.state;
    const { dispatch } = this.props;
    if (activeKey === 'inquiryQuotation') {
      await createApplyToInquiry({
        templateId,
        prLineIdList,
        sourceFrom: 'DEMAND_POOL',
        configCenterCode: 'SITE.SSRC.RFX_PURCHASE_MERGE_RULE',
      }).then((res) => {
        if (res) {
          if (res.failed) {
            notification.error({ message: res.message });
            return;
          }
          notification.success();
          const { rfxHeader = {} } = res || {};
          const { rfxHeaderId, expertScoreType, sourceCategory, preQualificationFlag } =
            rfxHeader || {};
          let search = {
            expertScoreType,
            sourceCategory,
            preQualificationFlag,
          };
          const { visibleOldPrepareConfigSheet } = this.inquiryQuotation;
          let pathname;
          // const { activeKey } = this.state;
          if (activeKey === 'inquiryQuotation') {
            this.inquiryQuotation.tableDataDs.unSelectAll();
            this.inquiryQuotation.tableDataDs.clearCachedSelected();
          }
          this.queryAll();
          if (visibleOldPrepareConfigSheet) {
            pathname = `/ssrc/inquiry-hall/rfx-update/${rfxHeaderId}`;
          } else {
            pathname = `/ssrc/new-inquiry-hall/rfx-update-new/${rfxHeaderId}`;
            search = { ...search, current: 'newInquiryHall' };
          }
          dispatch(
            routerRedux.push({
              pathname,
              search: querystring.stringify(search),
            })
          );
        }
      });
    } else if (activeKey === 'bidding') {
      await request(`${SRM_SSRC}/v1/${organizationId}/bid/purchase-requests`, {
        method: 'POST',
        body: {
          templateId,
          prLineIdList,
          sourceDocumentType: 'BID',
          configCenterCode: 'SITE.SSRC.BID_PURCHASE_MERGE_RULE',
        },
      }).then((res) => {
        if (res) {
          if (res.failed) {
            notification.error({ message: res.message });
            return;
          }
          notification.success();
          const { bidHeader } = res;
          const { bidHeaderId, bidRuleType, subjectMatterRule } = bidHeader;
          const search = querystring.stringify({
            bidRuleType,
            subjectMatterRule,
          });
          this.queryAll();
          this.bidding.tableDataDs.unSelectAll();
          this.bidding.tableDataDs.clearCachedSelected();

          dispatch(
            routerRedux.push({
              pathname: `/ssrc/bid-hall/bid-update/${bidHeaderId}`,
              search,
            })
          );
        }
      });
    } else {
      await request(`${SRM_SSRC}/v1/${organizationId}/source-projects/application`, {
        method: 'POST',
        body: {
          prLineIdList,
          configCenterCode: 'SITE.SSRC.PROJECT_PURCHASE_MERGE_RULE',
          sourceDocumentType: 'PROJECT',
        },
      }).then((res) => {
        if (res) {
          if (res.failed) {
            notification.error({ message: res.message });
            return;
          }
          notification.success();
          // this.setState({ visible: false });
          if (activeKey === 'quoteApproval') {
            this.quoteApproval.tableDataDs.unSelectAll();
            this.quoteApproval.tableDataDs.clearCachedSelected();
          }
          const {
            sourceProject: { sourceProjectId = null },
          } = res;
          const search = querystring.stringify({
            sourceFrom: '',
          });
          this.queryAll();
          const menuLeafNodes = window?.dvaApp?._store?.getState()?.global?.menuLeafNode || [];
          if (
            menuLeafNodes.find(
              (node) => node.functionMenuCode === 'srm.ssrc.source.manage.plan.source.project'
            )
          ) {
            dispatch(
              routerRedux.push({
                pathname: `/ssrc/project-setup/update/${sourceProjectId}`,
                search,
              })
            );
          } else if (
            menuLeafNodes.find(
              (node) => node.functionMenuCode === 'srm.ssrc.source.manage.plan.project-inquiry-hall'
            )
          ) {
            dispatch(
              routerRedux.push({
                pathname: `/ssrc/new-project-setup/update/${sourceProjectId}`,
                search,
              })
            );
            if (isNewRfxDetailUI) {
              dispatch(
                routerRedux.push({
                  pathname: `/ssrc/new-project-setup/sp-update/${sourceProjectId}`,
                  search,
                })
              );
            } else {
              dispatch(
                routerRedux.push({
                  pathname: `/ssrc/new-project-setup/update/${sourceProjectId}`,
                  search,
                })
              );
            }
          } else {
            dispatch(
              routerRedux.push({
                pathname: `/ssrc/project-setup/update/${sourceProjectId}`,
                search,
              })
            );
          }
        }
      });
    }
  }

  @Bind()
  @Debounce(500)
  handleReturnToAssign() {
    const selectedRows = this.all.tableDataDs.selected.map((ele) => ({
      ...ele.toData(),
      supplierList: ele.get('supplierList') ? ele.get('supplierList').toJS() : undefined,
    }));
    if (isEmpty(selectedRows)) {
      notification.error({
        message: intl.get(`hzero.common.validation.atLeast`).d('请至少选择一条数据'),
      });
      return;
    }
    const refunded = new DataSet(refundedDs());
    if (
      selectedRows?.every(
        (item) =>
          item?.occupiedQuantity === 0 &&
          item?.orderOccupiedQuantity === 0 &&
          item?.sourceOccupiedQuantity === 0 &&
          item?.executionStatusCode === 'ASSIGNED'
      )
    ) {
      Modal.open({
        key: Modal.key(),
        title: intl.get('sprm.common.modal.refunded.reason').d('退回原因'),
        closable: true,
        maskClosable: true,
        drawer: true,
        movable: false,
        destroyOnClose: true,
        children: (
          <RefundedModal
            ds={refunded}
            code="SPRM.PURCHASE_REQUISITION_POLL.BACK_MODAL"
            refundedLabel={intl.get('sprm.common.modal.refunded.reason').d('退回原因')}
          />
        ),
        onOk: async () => {
          const validateFlag = await refunded.validate();
          const { ...backToUnassignReasonInfo } = refunded.toData()[0];
          if (validateFlag) {
            const params = {
              prLineVOS: selectedRows,
              ...backToUnassignReasonInfo,
            };
            this.setState({
              backUnassignLoading: true,
            });
            backUnassign({ ...params }).then((res) => {
              const result = getResponse(res);
              this.setState({
                backUnassignLoading: false,
              });
              if (result) {
                this.all.tableDataDs.query();
                this.initTotalPage();
                notification.success();
              }
            });
          } else {
            return false;
          }
        },
        onCancel: () => { },
      });
    } else {
      notification.warning({
        message: intl
          .get('sprm.common.view.warning.notAllowReturn')
          .d('仅已分配且执行数量为0的申请，允许退回'),
      });
    }
  }

  openModal = () => {
    const ds = new DataSet({
      fields: [
        {
          name: 'templateId',
          type: 'object',
          label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingTemplate`).d('寻源模板'),
          //   labelWidth: 150,
          required: true,
          lovCode: 'SSRC.TEMPLATE_NAME',
          lovPara: {
            sourceCategory: this.state.activeKey === 'bidding' ? 'BID' : 'RFX',
            organizationId,
            sourceFrom: 'DEMAND_POOL',
          },
          transformRequest: (value) => value && value.templateId,
          lovDefineAxiosConfig: (code) => {
            const lovConfig = lovDefineAxiosConfig(code);
            return {
              ...lovConfig,
              transformResponse: [
                ...lovConfig.transformResponse,
                (data) => {
                  return {
                    ...data,
                    placeholder: '',
                    width: 1000,
                  };
                },
              ],
            };
          },
        },
      ],
    });
    const ModalContent = ({ modal }) => {
      modal.handleCancel(() => {
        modal.close(true);
      });
      return (
        <Form dataSet={ds} style={{ width: 350 }}>
          <Lov
            name="templateId"
            onChange={(record) => {
              if (record) {
                // eslint-disable-next-line prefer-destructuring
                templateId = record.templateId;
              }
            }}
          />
        </Form>
      );
    };
    return Modal.open({
      key: modalKey,
      destroyOnClose: true,
      title: intl.get(`ssrc.inquiryHall.view.message.title.selectSourceTemplate`).d('选择寻源模板'),
      children: <ModalContent />,
      onOk: () => {
        if (templateId) {
          this.handleCreateInquiry();
        } else {
          return false;
        }
      },
    });
  };

  render() {
    const {
      allDate = null,
      orderDate = null,
      biddingDate = null,
      inquiryQuotationDate = null,
      contractDate = null,
      quoteApproval = null,
      erpEditStatusList, // 值集
      activeKey,
      backUnassignLoading = false,
      doubleUintFlag = 0,
      // visible = false, // 转寻源
    } = this.state;
    const { customizeTabPane } = this.props;
    const BackUnassignBtn = observer(() => (
      <Tooltip
        placement="left"
        title={
          !this.all?.tableDataDs.selected.every(
            (item) => item.get('executionStatusCode') === 'ASSIGNED'
          )
            ? intl.get('sprm.common.view.warning.hasUnassigned').d('选中数据中含非已分配的申请')
            : null
        }
        theme="dark"
      >
        <PermissionButton
          onClick={this.handleReturnToAssign}
          key="returnToAssign"
          disabled={
            !this.all?.tableDataDs.selected.every(
              (item) =>
                item.get('occupiedQuantity') === 0 &&
                item.get('orderOccupiedQuantity') === 0 &&
                item.get('sourceOccupiedQuantity') === 0 &&
                item.get('executionStatusCode') === 'ASSIGNED'
            ) || this.all?.tableDataDs.selected.length === 0
          }
          loading={backUnassignLoading}
          type="c7n-pro"
          permissionList={[
            {
              code: `hzero.srm.requirement.prm.pr-pool.ps.returntoassign`,
              type: 'button',
              meaning: '退回至待分配',
            },
          ]}
        >
          {intl.get('sprm.purchaseRequisitionAssign.view.button.returnToAssign').d('退回至待分配')}
        </PermissionButton>
      </Tooltip>
    ));
    return (
      <Fragment>
        <Header title={intl.get('sprm.common.title.purchaseRequisitionPool').d('需求池')}>
          {activeKey !== 'all' && (
            <Button color="primary" onClick={this.handleCreate} key="create">
              {intl.get(`hzero.common.button.creation`).d('创建')}
            </Button>
          )}
          {activeKey === 'all' && <BackUnassignBtn />}
        </Header>
        <Content>
          {customizeTabPane(
            { code: 'SPRM.PURCHASE_REQUISITION_POLL.TAB' },
            <Tabs defaultActiveKey="all" onChange={this.handleChangeTab}>
              <TabPane
                tab={
                  <span style={{ color: '#000', fontWeight: activeKey === 'all' ? '800' : '500' }}>
                    {intl.get(`hzero.common.status.all`).d('全部')}
                    <strong
                      style={{
                        padding: '5px',
                        color: '#29BECE',
                      }}
                    >
                      {allDate}
                    </strong>
                  </span>
                }
                key="all"
              >
                <TransferAll
                  onRef={(node) => {
                    this.all = node;
                  }}
                  doubleUintFlag={doubleUintFlag}
                  erpEditStatusList={erpEditStatusList}
                  updatePage={this.updatePage}
                  activeKey={activeKey}
                />
              </TabPane>
              <TabPane
                tab={
                  <span
                    style={{ color: '#000', fontWeight: activeKey === 'order' ? '800' : '500' }}
                  >
                    {intl.get(`sprm.common.title.toOrder`).d('待转订单')}
                    <strong
                      style={{
                        padding: '5px',
                        color: '#29BECE',
                      }}
                    >
                      {orderDate}
                    </strong>
                  </span>
                }
                key="order"
              >
                <TransferOrder
                  onRef={(node) => {
                    this.order = node;
                  }}
                  doubleUintFlag={doubleUintFlag}
                  updatePage={this.updatePage}
                  activeKey={activeKey}
                />
              </TabPane>
              <TabPane
                tab={
                  <span
                    style={{
                      color: '#000',
                      fontWeight: activeKey === 'inquiryQuotation' ? '800' : '500',
                    }}
                  >
                    {intl.get(`sprm.common.title.toInquiryQuotation`).d('待转询报价')}
                    <strong
                      style={{
                        padding: '5px',
                        color: '#29BECE',
                      }}
                    >
                      {inquiryQuotationDate}
                    </strong>
                  </span>
                }
                key="inquiryQuotation"
              >
                <TransferInquiryQuotation
                  onRef={(node) => {
                    this.inquiryQuotation = node;
                  }}
                  doubleUintFlag={doubleUintFlag}
                  updatePage={this.updatePage}
                  activeKey={activeKey}
                />
              </TabPane>
              <TabPane
                tab={
                  <span
                    style={{ color: '#000', fontWeight: activeKey === 'bidding' ? '800' : '500' }}
                  >
                    {intl.get(`sprm.common.title.toBidding`).d('待转招标')}
                    <strong
                      style={{
                        padding: '5px',
                        color: '#29BECE',
                      }}
                    >
                      {biddingDate}
                    </strong>
                  </span>
                }
                key="bidding"
              >
                <TransferBidding
                  onRef={(node) => {
                    this.bidding = node;
                  }}
                  doubleUintFlag={doubleUintFlag}
                  updatePage={this.updatePage}
                  activeKey={activeKey}
                />
              </TabPane>
              <TabPane
                tab={
                  <span
                    style={{ color: '#000', fontWeight: activeKey === 'contract' ? '800' : '500' }}
                  >
                    {intl.get(`sprm.common.title.toContract`).d('待转协议')}
                    <strong
                      style={{
                        padding: '5px',
                        color: '#29BECE',
                      }}
                    >
                      {contractDate}
                    </strong>
                  </span>
                }
                key="contract"
              >
                <TransferContract
                  onRef={(node) => {
                    this.contract = node;
                  }}
                  doubleUintFlag={doubleUintFlag}
                  updatePage={this.updatePage}
                  activeKey={activeKey}
                />
              </TabPane>
              <TabPane
                tab={
                  <span
                    style={{
                      color: '#000',
                      fontWeight: activeKey === 'quoteApproval' ? '800' : '500',
                    }}
                  >
                    {intl.get(`sprm.common.title.toQuoteApproval`).d('待转寻源立项')}
                    <strong
                      style={{
                        padding: '5px',
                        color: '#29BECE',
                      }}
                    >
                      {quoteApproval}
                    </strong>
                  </span>
                }
                key="quoteApproval"
              >
                <TransferQuoteApproval
                  onRef={(node) => {
                    this.quoteApproval = node;
                  }}
                  doubleUintFlag={doubleUintFlag}
                  updatePage={this.updatePage}
                  activeKey={activeKey}
                />
              </TabPane>
            </Tabs>
          )}
        </Content>
      </Fragment>
    );
  }
}
