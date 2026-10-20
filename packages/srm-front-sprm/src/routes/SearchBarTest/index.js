import React, { Component, Fragment } from 'react';
import { Button, Modal, DataSet, Form, Lov } from 'choerodon-ui/pro';
import request from 'utils/request';
import { Bind } from 'lodash-decorators';
import { SRM_SPRM, SRM_SSRC, SRM_SPCM } from '_utils/config';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import { routerRedux } from 'dva/router';
import querystring from 'querystring';
import { isEmpty, cloneDeep } from 'lodash';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { lovDefineAxiosConfig } from '_utils/c7nUiConfig';
import SrmUpload from 'srm-front-boot/lib/components/Upload/index';

import {
  checkOrderRule,
  lineCreate,
  checkApplyToInquiry,
  createApplyToInquiry,
} from '@/services/purchaseRequisitionPoolService.js';
import TransferAll from './TransferAll';

const organizationId = getCurrentOrganizationId();
const modalKey = Modal.key();

let templateId = null;

@withCustomize({
  // unitCode: ['SPRM.PURCHASE_REQUISITION_POLL.TAB'],
})
@formatterCollections({
  code: [
    'sprm.common',
    'smdm.common',
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
  ],
})
export default class PartsRecDemandPool extends Component {
  testDs = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'field1',
        type: 'date',
        defaultValue: '2000-01-02',
      },
    ],
  });

  state = {
    // allDate: null,
    // orderDate: null,
    // biddingDate: null,
    // inquiryQuotationDate: null,
    // contractDate: null,
    // quoteApproval: null,
    activeKey: 'all',
    // createLoading: false,
  };

  componentDidMount() {
    // this.initTotalPage();
  }

  @Bind()
  initTotalPage() {
    // Promise.all([
    //   this.handleOrderDate(),
    //   this.handleBiddingDate(),
    //   this.handleSourceDate(),
    //   this.handleContractDate(),
    // ]).then((res) => {
    //   if (res) {
    //     this.setState({
    //       // orderDate: res[0] ? res[0].totalElements : null,
    //       // biddingDate: res[1] ? res[1].totalElements : null,
    //       inquiryQuotationDate: res[2] ? res[2].totalElements : null,
    //       contractDate: res[3] ? res[3].totalElements : null,
    //       quoteApproval: res[1] ? res[1].totalElements : null,
    //     });
    //   }
    // });
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
    // if (this.order) {
    //   this.order.tableDataDs.query();
    // }
    // if (this.inquiryQuotation) {
    //   this.inquiryQuotation.tableDataDs.query();
    // }
    // if (this.bidding) {
    //   this.bidding.tableDataDs.query();
    // }
    // if (this.contract) {
    //   this.contract.tableDataDs.query();
    // }
    // if (this.quoteApproval) {
    //   this.quoteApproval.tableDataDs.query();
    // }
  }

  handleOrderDate() {
    return request(`${SRM_SPRM}/v1/${organizationId}/po-refer-pr/pr-line`, {
      method: 'GET',
      query: {
        erpControlFlag: 1,
      },
    });
  }

  handleBiddingDate() {
    return request(`${SRM_SSRC}/v1/${organizationId}/share/application`, {
      method: 'GET',
    });
  }

  handleContractDate() {
    return request(`${SRM_SPCM}/v1/${organizationId}/prLine/page`, {
      method: 'GET',
      query: { erpControlFlag: 1, tenantId: organizationId },
    });
  }

  handleSourceDate() {
    return request(`${SRM_SSRC}/v1/${organizationId}/share/application`, {
      method: 'GET',
      query: { erpControlFlag: 1 },
    });
  }

  handleChangeTab = newActiveKey => {
    this.setState({ activeKey: newActiveKey });
  };

  @Bind()
  async handleCreate() {
    const { activeKey } = this.state;
    let data = [];
    let prLineIdList = [];
    switch (activeKey) {
      case 'order':
        this.handleOrderCreate();
        break;
      case 'inquiryQuotation':
        data = this.inquiryQuotation.tableDataDs.selected.map(ele => ele.toData());
        prLineIdList = data.map(ele => ele.prLineId);
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
        }).then(res => {
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
        data = this.bidding.tableDataDs.selected.map(ele => ele.toData());
        prLineIdList = data.map(ele => ele.prLineId);
        if (isEmpty(data)) {
          notification.error({
            message: intl.get(`hzero.common.validation.atLeast`).d('请至少选择一条数据'),
          });
          return;
        }
        await request(`${SRM_SSRC}/v1/${organizationId}/share/valid-purchase`, {
          method: 'POST',
          body: { prLineIdList },
        }).then(res => {
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
        data = this.quoteApproval.tableDataDs.selected.map(ele => ele.toData());
        prLineIdList = data.map(ele => ele.prLineId);
        if (isEmpty(data)) {
          notification.error({
            message: intl.get(`hzero.common.validation.atLeast`).d('请至少选择一条数据'),
          });
          return;
        }
        await request(`${SRM_SSRC}/v1/${organizationId}/share/valid-purchase`, {
          method: 'POST',
          body: { prLineIdList },
        }).then(res => {
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
            }
          }
        });
        break;
      case 'contract':
        // eslint-disable-next-line no-case-declarations
        const selectedPurchaseContracts = this.contract.tableDataDs.selected.map(ele =>
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
        }).then(res => {
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
                selectedPurchaseContracts.map(purchaseContract => {
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
            const contractSubjects = cloneDeep(selectedPurchaseContracts).map(_subject => {
              const subject = _subject;
              delete subject.$form;
              subject.deliverDate = subject.neededDate;
              subject.address = subject.location;
              subject.sourceCode = subject.displayPrNum;
              subject.sourceLineNum = subject.lineNum;
              subject.prLineNum = subject.lineNum;
              subject.quantity = subject.availableQuantity;
              subject.specifications = subject.itemModel;
              subject.model = subject.itemSpecs;
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
  handleOrderCreate() {
    const data = this.order.tableDataDs.selected.map(ele => {
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
    checkOrderRule({ sourceCode: 'PURCHASE_REQUEST' }).then(result => {
      if (result === 1) {
        if (data.length > 0) {
          lineCreate(data).then(res => {
            if (res?.failed) {
              notification.error({ message: res.message });
            }
            if (res && res.length > 1) {
              this.props.history.push({
                pathname: `/sodr/purchase-order-maintain/quote-purchase-requisition/tab-line-newCreation`,
                search: `?poHeaderId=${res.map(n => n.poHeaderId)}&cacheKey=${
                  res[0].cacheKey
                }&source=newRequisition&sourcePage=pageRequest`,
              });
            } else if (res && !res.failed && res.length === 1) {
              const { poHeaderId } = res[0];
              this.handleToDetail(poHeaderId, prSourcePlatform);
            }
            notification.success();
          });
        }
      } else if (result === 0) {
        if (data.length > 0) {
          lineCreate(data).then(res => {
            if (res?.failed) {
              notification.error({ message: res.message });
            }
            if (res && !res.failed && res[0]) {
              const { poHeaderId } = res[0];
              this.handleToDetail(poHeaderId, prSourcePlatform);
              notification.success();
            }
          });
        }
      }
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
    if (source === 'ERP' || source === 'SRM' || source === 'SHOP') {
      this.props.history.push({
        pathname: `/sodr/purchase-order-maintain/quote-purchase-requisition/line-newCreation`,
        search: `?poHeaderId=${headerId}&source=newRequisition&sourcePage=pageRequest`,
      });
    } else {
      // 旧版采购申请转订单页面跳转逻辑
      this.props.history.push({
        pathname: `/sodr/purchase-order-maintain/quote-purchase-requisition/line-creation`,
        search: `?poHeaderId=${headerId}&source=requisition&itemKey=${itemKey}`,
      });
    }
  }

  @Bind()
  async handleCreateInquiry() {
    const { activeKey, prLineIdList } = this.state;
    const { dispatch } = this.props;
    if (activeKey === 'inquiryQuotation') {
      await createApplyToInquiry({
        templateId,
        prLineIdList,
        sourceFrom: 'DEMAND_POOL',
        configCenterCode: 'SITE.SSRC.RFX_PURCHASE_MERGE_RULE',
      }).then(res => {
        if (res) {
          if (res.failed) {
            notification.error({ message: res.message });
            return;
          }
          notification.success();
          const { rfxHeader } = res;
          const { rfxHeaderId, expertScoreType, sourceCategory, preQualificationFlag } = rfxHeader;
          let search = {
            expertScoreType,
            sourceCategory,
            preQualificationFlag,
          };
          const { visibleOldPrepareConfigSheet } = this.inquiryQuotation;
          let pathname;
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
        body: { templateId, prLineIdList },
      }).then(res => {
        if (res) {
          notification.success();
          const { bidHeader } = res;
          const { bidHeaderId, bidRuleType, subjectMatterRule } = bidHeader;
          const search = querystring.stringify({
            bidRuleType,
            subjectMatterRule,
          });
          this.queryAll();
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
        body: { prLineIdList },
      }).then(res => {
        if (res) {
          notification.success();
          // this.setState({ visible: false });
          const {
            sourceProject: { sourceProjectId = null },
          } = res;
          const search = querystring.stringify({
            sourceFrom: '',
          });
          this.queryAll();
          dispatch(
            routerRedux.replace({
              pathname: `/ssrc/project-setup/update/${sourceProjectId}`,
              search,
            })
          );
        }
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
          },
          transformRequest: value => value && value.templateId,
          lovDefineAxiosConfig: code => {
            const lovConfig = lovDefineAxiosConfig(code);
            return {
              ...lovConfig,
              transformResponse: [
                ...lovConfig.transformResponse,
                data => {
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
            onChange={record => {
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
      erpEditStatusList, // 值集
      activeKey,
      // visible = false, // 转寻源
    } = this.state;
    return (
      <Fragment>
        <Header title={intl.get('sprm.common.title.purchaseRequisitionPool').d('需求池')}>
          {activeKey !== 'all' && (
            <Button color="primary" onClick={this.handleCreate} key="create">
              {intl.get(`hzero.common.button.creation`).d('创建')}
            </Button>
          )}
          <SrmUpload
            showRemoveIcon
            filePreview
            chunkUpload
            bucketName="private-bucket"
            bucketDirectory="smdm-materiel"
            listType="picture-card"
          />
        </Header>
        <Content>
          <TransferAll
            onRef={node => {
              this.all = node;
            }}
            erpEditStatusList={erpEditStatusList}
            updatePage={this.updatePage}
            activeKey={activeKey}
          />
        </Content>
      </Fragment>
    );
  }
}
