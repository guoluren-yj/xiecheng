import React, { Component } from 'react';
import { Modal, DataSet, Tooltip, Button } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
// import querystring from 'querystring';
import formatterCollections from 'utils/intl/formatterCollections';
import { yesOrNoRender } from 'utils/renderer';
import { getCurrentOrganizationId, getCurrentTenant, getResponse } from 'utils/utils';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import { isEmpty } from 'lodash';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { routerRedux } from 'dva/router';
import {
  checkApplyToInquiry,
  fetchConfigSheetRfxPrepare,
  createApplyToInquiry,
} from '@/services/purchaseExecutionService';
import ViewFilter from '@/routes/components/ViewFilter';
import urgentImg from '@/assets/icon-expedited.svg';
import MutlTextFieldSearch from '@/routes/components/MutlTextFieldSearch';
import { templateModalDs } from './executionDs/inquiryQuotationDs';
import Template from '../components/Template';

const commonPrompt = 'sprm.common.model.common';
const organizationId = getCurrentOrganizationId();
@formatterCollections({
  code: ['sprm.common', 'smdm.common'],
})
export default class TransferNewBidding extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.visibleOldPrepareConfigSheet = false;
    this.state = {
      tableDisplay: 'flat',
    };
  }

  @Bind()
  setDisplayStatus(tableDisplay) {
    this.setState({
      tableDisplay,
    });
  }

  // 渲染状态列
  @Bind()
  isEnabledRender({ value }) {
    const btns = [];
    btns.push(yesOrNoRender(Number(value)));
    return btns;
  }

  // shouldComponentUpdate(nextProps) {
  //   return nextProps.activeKey === 'inquiryQuotation';
  // }

  @Bind()
  async handleCreate() {
    const { newBiddingDs, isOldUser, remote } = this.props;
    const data = newBiddingDs?.selected?.map((ele) => ele.toData());
    const prLineIdList = data?.map((ele) => ele.prLineId);
    if (isEmpty(data)) {
      notification.error({
        message: intl.get(`hzero.common.validation.atLeast`).d('请至少选择一条数据'),
      });
      return;
    }
    if (remote) {
      const beforeCreateCheck = await remote.event.fireEvent('beforeCreateCheck', {
        currentListDs: newBiddingDs,
        currentPage: 'newBiddingCheck',
        handleCreateNewBidding: this.handleCreateNewBidding,
      });
      if (beforeCreateCheck === false) {
        return false;
      }
    }
    await checkApplyToInquiry({
      prLineIdList,
      // sourceFrom: 'DEMAND_POOL',
      configCenterCode: !isOldUser
        ? 'SITE.SSRC.RFX_PURCHASE_MERGE_RULE'
        : 'SITE.SSRC.BID_PURCHASE_MERGE_RULE',
      sourceDocumentType: !isOldUser ? 'NEW_BID' : null,
    }).then((res) => {
      if (res) {
        if (res.failed) {
          notification.error({ message: res.message });
          return;
        }
        if (res.companyInconsistentFlag === 1) {
          Modal.confirm({
            bodyStyle: { padding: '20px' },
            children: (
              <p>
                {intl
                  .get(`ssrc.inquiryHall.view.message.diffCompany`)
                  .d('并单公司不一致,是否继续?')}
              </p>
            ),
            title: intl.get('hzero.common.message.confirm.title').d('提示'),
            onOk: () => {
              this.openModal(res);
            },
          });
        } else {
          this.openModal(res);
        }
      }
    });
  }

  openModal = (res) => {
    const ds = new DataSet(
      templateModalDs(
        { config: 'RFX', sourceFrom: 'DEMAND_POOL' },
        { secondarySourceCategory: 'NEW_BID' }
      )
    );
    Modal.open({
      key: Modal.key(),
      destroyOnClose: true,
      title: intl.get(`ssrc.inquiryHall.view.message.title.selectSourceTemplate`).d('选择寻源模板'),
      children: <Template ds={ds} />,
      onOk: async () => {
        const validateFlag = await ds.validate();
        if (validateFlag) {
          const { templateId } = ds.toData() ? ds.toData()[0] : {};
          await this.handleCreateNewBidding(templateId, res);
        } else {
          return false;
        }
      },
    });
  };

  // 配置表配置显示寻源准备节点新老内容
  @Bind()
  fetchConfigSheetRfxPrepare() {
    fetchConfigSheetRfxPrepare({
      organizationId,
      tenant: getCurrentTenant().tenantNum,
    }).then((res) => {
      const result = getResponse(res);
      if (!result) {
        return;
      }
      this.visibleOldPrepareConfigSheet = result && !isEmpty(result);
    });
  }

  @Bind()
  async handleCreateNewBidding(templateId, resp) {
    const { newBiddingDs, dispatch, clearSelectAll, changeTabNum, isOldUser, remote } = this.props;
    const data = newBiddingDs?.selected?.map((ele) => ele.toData());
    const prLineIdList = data?.map((ele) => ele.prLineId);
    const prNumList = data.map((e) => `${e.displayPrNum}-${e.displayLineNum}`).join(',');
    const cuxParams = remote
      ? remote.process('SPRM_PURCHASE_EXECUTION_NEWBIDLIST_CREATE_PARAMS', {}, { resp })
      : {};
    await createApplyToInquiry({
      templateId,
      prLineIdList,
      sourceFrom: 'DEMAND_POOL',
      configCenterCode: !isOldUser
        ? 'SITE.SSRC.RFX_PURCHASE_MERGE_RULE'
        : 'SITE.SSRC.BID_PURCHASE_MERGE_RULE',
      sourceDocumentType: !isOldUser ? 'NEW_BID' : null,
      ...cuxParams,
    }).then((res) => {
      if (getResponse(res)) {
        newBiddingDs.query().then(() => {
          changeTabNum({ biddingCount: newBiddingDs.totalCount });
        });
        notification.success();
        const { rfxHeader } = res || {};
        const { rfxHeaderId } = rfxHeader || {};
        // const search = querystring.stringify({
        //   bidRuleType,
        //   subjectMatterRule,
        // });
        const menuLeafNodes = window?.dvaApp?._store?.getState()?.global?.menuLeafNode || [];
        const linkRouteFlag = menuLeafNodes.some(
          (node) => node.functionMenuCode === 'srm.ssrc.source.manage.new-bidding.bid-inquiry-hall'
        );
        if (linkRouteFlag) {
          dispatch(
            routerRedux.push({
              pathname: `/ssrc/new-bid-hall/bid-update/${rfxHeaderId}`,
              // search: querystring.stringify(search),
            })
          );
        } else {
          notification.warning({
            message: intl
              .get('sprm.common.model.outMenu.errorLink', { prNumList })
              .d(
                `【${prNumList}】单据已创建成功，由于当前角色无对应菜单权限，无法跳转至对应菜单，请添加权限后再操作。`
              ),
          });
        }
        clearSelectAll(newBiddingDs);
      }
    });
  }

  componentDidMount() {
    this.fetchConfigSheetRfxPrepare();
  }

  @Bind()
  handleQuery({ params = {} }) {
    const { newBiddingDs, location = {} } = this.props;
    const { _back } = location?.state || {};
    const { customizeOrderField = undefined } = params;
    const clearParams = {}; // 清理

    // eslint-disable-next-line no-unused-expressions
    const dataObj = newBiddingDs.queryDataSet?.current?.toData() || {};
    if (dataObj) {
      for (const key in dataObj) {
        if (!['multiSelectHeaderNums', 'multiSelectHeaderAndLineNums'].includes(key)) {
          // 排除掉自定义的查询条件
          if (!Object.prototype.hasOwnProperty.call(params, key)) {
            clearParams[key] = undefined;
          }
        }
      }
    }
    newBiddingDs.setQueryParameter('customizeOrderField', customizeOrderField);
    // eslint-disable-next-line no-unused-expressions
    newBiddingDs.queryDataSet.current
      ? newBiddingDs.queryDataSet.current.set({
          ...params,
          ...clearParams,
        })
      : newBiddingDs.queryDataSet.loadData([
          {
            ...params,
            ...clearParams,
          },
        ]);

    if (_back === -1) {
      newBiddingDs.query(newBiddingDs.currentPage);
    } else {
      newBiddingDs.query();
    }
  }

  @Bind()
  resetQueryDs() {
    const { newBiddingDs } = this.props;
    // eslint-disable-next-line no-unused-expressions
    newBiddingDs.queryDataSet?.current?.reset();
  }

  render() {
    const { customizeTable, newBiddingDs, uomControl, remote, productPlaceConfig } = this.props;
    console.log(remote);
    const { tableDisplay } = this.state;
    // console.log(newBiddingDs);
    const columns = [
      {
        name: 'docInfoGroup',
        header: intl.get(`sprm.common.model.common.docInfoGroup`).d('采购申请单号信息'),
        aggregation: true,
        align: 'left',
        children: [
          {
            name: 'displayPrNum',
            width: 160,
            renderer: ({ value, record }) => (
              <div className="row-agent-column">
                {`${value}-${record.get('displayLineNum')}`}
                {record.get('urgentFlag') === 1 ? (
                  <Tooltip title={intl.get(`${commonPrompt}.urgent`).d('申请加急')}>
                    <img src={urgentImg} alt="img" />
                  </Tooltip>
                ) : null}
              </div>
            ),
          },
          {
            name: 'prNumLink',
            width: 180,
            title: intl.get(`${commonPrompt}.prNum`).d('采购申请编号'),
            renderer: ({ record }) => {
              const menuLeafNodes = window?.dvaApp?._store?.getState()?.global?.menuLeafNode || [];
              const disabledBtnFlag = menuLeafNodes.findIndex(
                (node) => node.functionMenuCode === 'hzero.srm.requirement.prm.pr-platform'
              );
              const { dispatch } = this.props;
              return (
                <Button
                  onClick={() => {
                    dispatch(
                      routerRedux.push({
                        pathname: `/sprm/purchase-platform/noerp-detail/${record.get(
                          'prHeaderId'
                        )}`,
                      })
                    );
                  }}
                  funcType="link"
                  color="primary"
                  disabled={disabledBtnFlag === -1}
                >
                  {`${record.get('displayPrNum')}`}
                </Button>
              );
            },
          },
          {
            name: 'prTypeName',
            width: 150,
          },
          {
            name: 'prRequestedName',
            width: 130,
            renderer: ({ value, record }) =>
              record.get('prRequestedNum') ? `${record.get('prRequestedNum')}-${value}` : value,
          },
          {
            name: 'unitName',
            width: 120,
          },
          {
            name: 'prSourcePlatformMeaning',
            width: 130,
          },
          {
            name: 'requestDate',
            width: 170,
          },
        ],
      },
      {
        name: 'purInfoGroup',
        header: intl.get(`sprm.common.model.common.purInfoGroup`).d('采买组织信息'),
        aggregation: true,
        align: 'left',
        children: [
          {
            name: 'companyName',
            width: 200,
          },
          {
            name: 'ouName',
            width: 200,
          },
          {
            name: 'invOrganizationName',
            width: 200,
          },
        ],
      },
      {
        name: 'lineInfoGroup',
        header: intl.get(`sprm.common.model.common.lineInfoGroup`).d('行信息'),
        aggregation: true,
        align: 'left',
        width: 180,
        children: [
          {
            name: 'displayLineNum',
            width: 100,
          },
          {
            name: 'quantity',
            width: 80,
          },
          {
            name: 'uomName',
            width: 80,
            renderer: ({ record }) => record.get('uomCodeAndName'),
          },

          {
            name: 'neededDate',
            width: 170,
          },
          {
            name: 'currencyCode',
            width: 80,
          },
        ],
      },
      {
        name: 'productInfoGroup',
        header: intl.get(`sprm.common.model.common.productInfoGroup`).d('物料/商品信息'),
        aggregation: true,
        align: 'left',
        children: [
          {
            name: 'itemCode',
            width: 120,
          },
          {
            name: 'itemName',
            width: 120,
          },
          {
            name: 'categoryName',
            width: 100,
          },
          {
            name: 'supplierItemCode',
            width: 120,
          },
          {
            name: 'supplierItemNumDesc',
            width: 120,
          },
        ],
      },
      {
        name: 'orderInfoGroup',
        header: intl.get(`sprm.common.model.common.orderInfoGroup`).d('下单信息'),
        aggregation: true,
        align: 'left',
        children: [
          {
            name: 'occupiedQuantity',
            width: 140,
          },
        ],
      },
      {
        name: 'executionInfoGroup',
        header: intl.get(`sprm.common.model.common.executionInfoGroup`).d('执行信息'),
        aggregation: true,
        align: 'left',
        width: 180,
        children: [
          {
            name: 'purchaseAgentName',
            width: 100,
          },
          {
            name: 'executorName',
            width: 100,
          },
          {
            name: 'assignedDate',
            width: 170,
          },
        ],
      },
      {
        name: 'otherInfoGroup',
        header: intl.get(`sprm.common.model.common.otherInfoGroup`).d('其他信息'),
        aggregation: true,
        align: 'left',
        children: [
          {
            name: 'commonName',
            width: 150,
          },
          {
            name: 'remark',
            width: 200,
          },
          // {
          //   name: 'drawingNum',
          //   width: 130,
          // },
          // {
          //   name: 'drawingVersion',
          //   width: 120,
          // },
          {
            name: 'surfaceTreatFlag',
            width: 100,
            renderer: ({ value }) => (value ? yesOrNoRender(value) : null),
          },
          {
            name: 'projectCategoryMeaning',
            width: 150,
          },
          {
            name: 'attachmentUuid',
            width: 140,
          },
        ],
      },
      {
        name: 'secondaryUomName',
        width: 120,
        renderer: ({ record }) => record.get('secondaryUomCodeAndName'),
      },
      {
        name: 'secondaryQuantity',
        width: 80,
      },
      {
        width: 120,
        name: 'projectTaskId',
      },
    ];

    const baseUomInfo =
      uomControl?.SPRM === 1 || uomControl?.RFX === 1
        ? []
        : ['secondaryUomName', 'secondaryTaxInUnitPrice', 'secondaryQuantity'];
    const { initCuxPageSize = ['10', '20', '50', '100', '200'] } = remote?.props?.process || {};

    const cuxColumns = remote.process(
      'SPRM_PURCHASE_EXECUTION_ALL_NEWBIDLIST_COLUMNS',
      columns.filter((ele) => !baseUomInfo.includes(ele.name)),
      { columns, productPlaceConfig, customizeTable }
    );

    return (
      <div style={{ height: 'calc(100vh - 254px)' }}>
        {customizeTable(
          {
            code: 'SPRM.PURCHASE_EXECUTION_ALL.NEWBIDLIST',
          },
          <SearchBarTable
            style={{ maxHeight: 'calc(100% - 22px)' }}
            aggregation={tableDisplay !== 'flat'}
            searchCode="SPRM.PURCHASE_EXECUTION_ALL.NEWBID_FILTER"
            dataSet={newBiddingDs}
            columns={cuxColumns}
            cacheState
            pagination={{
              pageSizeOptions: initCuxPageSize || ['10', '20', '50', '100', '200'],
            }}
            searchBarConfig={{
              right: {
                render: () => (
                  <ViewFilter
                    tableDisplay={tableDisplay}
                    setDisplayStatus={this.setDisplayStatus}
                  />
                ),
              },
              left: {
                render: () => (
                  <MutlTextFieldSearch
                    name="multiSelectHeaderAndLineNums"
                    dataSet={newBiddingDs}
                    placeholder={intl
                      .get('sprm.common.modal.enterPrNumOrLineNum')
                      .d('请输入采购申请单号-行号')}
                  />
                ),
              },
              onQuery: this.handleQuery,
              onClear: this.resetQueryDs,
              onReset: this.resetQueryDs,
            }}
            onAggregationChange={(_aggregation) => this.setDisplayStatus(_aggregation)}
          />
        )}
      </div>
    );
  }
}
