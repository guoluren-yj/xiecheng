import React, { Component } from 'react';
import { Modal, DataSet, Tooltip, Button } from 'choerodon-ui/pro';
import formatterCollections from 'utils/intl/formatterCollections';
import { isEmpty } from 'lodash';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { Bind } from 'lodash-decorators';
import querystring from 'querystring';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import { routerRedux } from 'dva/router';
import { checkApplyToInquiry, createApplyToBid } from '@/services/purchaseExecutionService';
import ViewFilter from '@/routes/components/ViewFilter';
import MutlTextFieldSearch from '@/routes/components/MutlTextFieldSearch';
import urgentImg from '@/assets/icon-expedited.svg';
import Template from './../components/Template';
import { templateModalDs } from './executionDs/inquiryQuotationDs';

const commonPrompt = 'sprm.common.model.common';
@formatterCollections({
  code: ['sprm.common', 'smdm.common'],
})
export default class TransferBidding extends Component {
  constructor(props) {
    super(props);
    this.props.onRef(this);
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

  @Bind()
  async handleCreate() {
    const { biddingDs, isOldUser, remote } = this.props;
    const data = biddingDs?.selected?.map((ele) => ele.toData());
    const prLineIdList = data?.map((ele) => ele.prLineId);
    if (isEmpty(data)) {
      notification.error({
        message: intl.get(`hzero.common.validation.atLeast`).d('请至少选择一条数据'),
      });
      return;
    }
    if (remote) {
      const beforeCreateCheck = await remote.event.fireEvent('beforeCreateCheck', {
        currentListDs: biddingDs,
        currentPage: 'bidingCheck',
      });
      if (beforeCreateCheck === false) {
        return false;
      }
    }
    await checkApplyToInquiry({
      prLineIdList,
      sourceDocumentType: !isOldUser ? 'BID' : null,
      configCenterCode: 'SITE.SSRC.BID_PURCHASE_MERGE_RULE',
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
              this.openModal();
            },
          });
        } else {
          this.openModal();
        }
      }
    });
  }

  openModal = async () => {
    const ds = new DataSet(templateModalDs({ config: 'BID', sourceFrom: 'DEMAND_POOL' }));
    const { remote } = this.props;
    if (remote) {
      await remote.event.fireEvent('beforeCreateTemplate', { templateDs: ds, tabkey: 'bidding' });
    }
    Modal.open({
      key: Modal.key(),
      destroyOnClose: true,
      title: intl.get(`ssrc.inquiryHall.view.message.title.selectSourceTemplate`).d('选择寻源模板'),
      children: <Template ds={ds} />,
      onOk: async () => {
        const validateFlag = await ds.validate();
        if (validateFlag) {
          const { templateId } = ds.toData() ? ds.toData()[0] : {};
          this.handleCreateBid(templateId);
        } else {
          return false;
        }
      },
    });
  };

  @Bind()
  async handleCreateBid(templateId) {
    const { biddingDs, dispatch, clearSelectAll, changeTabNum, isOldUser } = this.props;
    const data = biddingDs?.selected?.map((ele) => ele.toData());
    const prLineIdList = data?.map((ele) => ele.prLineId);
    const prNumList = data.map((e) => `${e.displayPrNum}-${e.displayLineNum}`).join(',');
    await createApplyToBid({
      templateId,
      prLineIdList,
      configCenterCode: 'SITE.SSRC.BID_PURCHASE_MERGE_RULE',
      sourceDocumentType: !isOldUser ? 'BID' : null,
    }).then((res) => {
      if (res) {
        if (res.failed) {
          notification.error({ message: res.message });
          return;
        }
        biddingDs.query().then(() => {
          changeTabNum({ biddingCount: biddingDs.totalCount });
        });
        notification.success();
        const { bidHeader } = res;
        const { bidHeaderId, bidRuleType, subjectMatterRule } = bidHeader;
        const search = querystring.stringify({
          bidRuleType,
          subjectMatterRule,
        });
        const menuLeafNodes = window?.dvaApp?._store?.getState()?.global?.menuLeafNode || [];
        const linkRouteFlag = menuLeafNodes.some(
          (node) => node.functionMenuCode === 'srm.ssrc.source.manage.bidding.hall'
        );
        if (!linkRouteFlag) {
          notification.warning({
            message: intl
              .get('sprm.common.model.outMenu.errorLink', { prNumList })
              .d(
                `【${prNumList}】单据已创建成功，由于当前角色无对应菜单权限，无法跳转至对应菜单，请添加权限后再操作。`
              ),
          });
        } else {
          dispatch(
            routerRedux.push({
              pathname: `/ssrc/bid-hall/bid-update/${bidHeaderId}`,
              search: querystring.stringify(search),
            })
          );
        }
        clearSelectAll(biddingDs);
      }
    });
  }

  @Bind()
  handleQuery({ params = {} }) {
    const { biddingDs, location = {}, remote } = this.props;
    const { _back } = location?.state || {};
    const { customizeOrderField = undefined } = params;
    const clearParams = {}; // 清理
    const { cuxRfxMutiData = [] } = remote?.props?.process || {};
    const cuxMuliCode = cuxRfxMutiData?.map((ele) => ele.code);
    // eslint-disable-next-line no-unused-expressions
    const dataObj = biddingDs.queryDataSet?.current?.toData() || {};
    if (dataObj) {
      for (const key in dataObj) {
        if (
          !['multiSelectHeaderNums', 'multiSelectHeaderAndLineNums', ...cuxMuliCode].includes(key)
        ) {
          // 排除掉自定义的查询条件
          if (!Object.prototype.hasOwnProperty.call(params, key)) {
            clearParams[key] = undefined;
          }
        }
      }
    }

    biddingDs.setQueryParameter('customizeOrderField', customizeOrderField);
    // eslint-disable-next-line no-unused-expressions
    biddingDs.queryDataSet.current
      ? biddingDs.queryDataSet.current.set({
          ...params,
          ...clearParams,
        })
      : biddingDs.queryDataSet.loadData([
          {
            ...params,
            ...clearParams,
          },
        ]);

    if (_back === -1) {
      biddingDs.query(biddingDs.currentPage);
    } else {
      biddingDs.query();
    }
  }

  @Bind()
  resetQueryDs() {
    const { biddingDs } = this.props;
    // eslint-disable-next-line no-unused-expressions
    biddingDs.queryDataSet?.current?.reset();
  }

  render() {
    const { biddingDs, customizeTable, uomControl, remote } = this.props; // customizeTable
    const { tableDisplay } = this.state;
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
            width: 120,
            name: 'prSourcePlatformMeaning',
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
            width: 100,
            name: 'displayLineNum',
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
            width: 150,
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
            name: 'executorName',
            width: 100,
          },
          {
            name: 'purchaseAgentName',
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
            name: 'remark',
            width: 200,
          },
        ],
      },
      {
        name: 'secondaryQuantity',
        width: 80,
      },
      {
        name: 'secondaryUomName',
        width: 100,
        renderer: ({ record }) => record.get('secondaryUomCodeAndName'),
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
    const { cuxRfxMutiData = [], initCuxPageSize = ['10', '20', '50', '100', '200'] } =
      remote?.props?.process || {};

    return (
      <div style={{ height: 'calc(100vh - 254px)' }}>
        {customizeTable(
          {
            code: 'SPRM.PURCHASE_EXECUTION_ALL.BIDLIST',
          },
          <SearchBarTable
            style={{ maxHeight: 'calc(100% - 22px)' }}
            aggregation={tableDisplay !== 'flat'}
            searchCode="SPRM.PURCHASE_EXECUTION_ALL.BID_FILTER"
            dataSet={biddingDs}
            columns={columns.filter((ele) => !baseUomInfo.includes(ele.name))}
            queryFieldsLimit={3}
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
                  <div>
                    <MutlTextFieldSearch
                      name="multiSelectHeaderAndLineNums"
                      dataSet={biddingDs}
                      placeholder={intl
                        .get('sprm.common.modal.enterPrNumOrLineNum')
                        .d('请输入采购申请单号-行号')}
                    />
                    {cuxRfxMutiData?.map((ele) => (
                      <span style={{ marginLeft: '8px' }}>
                        <MutlTextFieldSearch
                          name={ele?.code}
                          dataSet={biddingDs}
                          style={{ marginLeft: '10px' }}
                          placeholder={ele?.placeholder ? ele?.placeholder() : ''}
                        />
                      </span>
                    ))}
                  </div>
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
