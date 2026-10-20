import React, { Component } from 'react';
import { Modal, Tooltip, Button } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import formatterCollections from 'utils/intl/formatterCollections';
import { yesOrNoRender } from 'utils/renderer';
import { isEmpty } from 'lodash';
import notification from 'utils/notification';
import { checkApplyToInquiry, createProject } from '@/services/purchaseExecutionService';
import intl from 'utils/intl';
import querystring from 'querystring';
import { routerRedux } from 'dva/router';
import ViewFilter from '@/routes/components/ViewFilter';
import MutlTextFieldSearch from '@/routes/components/MutlTextFieldSearch';
import urgentImg from '@/assets/icon-expedited.svg';

const commonPrompt = 'sprm.common.model.common';
@formatterCollections({
  code: ['sprm.common', 'smdm.common'],
})
export default class PartsRecDemandPool extends Component {
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

  // shouldComponentUpdate(nextProps) {
  //   return nextProps.activeKey === 'order';
  // }

  @Bind()
  async handleCreate() {
    const { remote, quoteApprovalDs } = this.props; // isOldUser
    const data = quoteApprovalDs.selected?.map((ele) => ele.toData());
    const prLineIdList = data?.map((ele) => ele.prLineId);
    if (isEmpty(data)) {
      notification.error({
        message: intl.get(`hzero.common.validation.atLeast`).d('请至少选择一条数据'),
      });
      return;
    }
    if (remote) {
      const beforeCreateCheck = await remote.event.fireEvent('beforeCreateCheck', {
        currentListDs: quoteApprovalDs,
        currentPage: 'projectCheck',
      });
      if (beforeCreateCheck === false) {
        return false;
      }
    }
    await checkApplyToInquiry({
      prLineIdList,
      sourceDocumentType: 'PROJECT',
      configCenterCode: 'SITE.SSRC.PROJECT_PURCHASE_MERGE_RULE',
    }).then(async (res) => {
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
          await this.handleCreateQuoteAppoval();
        }
        if (
          res.companyInconsistentFlag === 1 &&
          res.currencyInconsistentFlag === 0 &&
          res.unitInconsistentFlag === 0
        ) {
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
            onOk: async () => {
              await this.handleCreateQuoteAppoval();
            },
          });
        } else {
          await this.handleCreateQuoteAppoval();
        }
      }
    });
  }

  @Bind()
  async handleCreateQuoteAppoval() {
    const {
      quoteApprovalDs,
      dispatch,
      clearSelectAll,
      changeTabNum,
      isOldUser,
      isNewRfxDetailUI,
    } = this.props;
    const data = quoteApprovalDs?.selected?.map((ele) => ele.toData()) || [];
    const prLineIdList = data?.map((ele) => ele.prLineId);
    const prNumList = data?.map((e) => `${e.displayPrNum}-${e.displayLineNum}`).join(',');
    await createProject({
      prLineIdList,
      configCenterCode: 'SITE.SSRC.PROJECT_PURCHASE_MERGE_RULE',
      sourceDocumentType: !isOldUser ? 'PROJECT' : null,
    }).then((res) => {
      if (res && !res.failed) {
        notification.success();
        quoteApprovalDs.query().then(() => {
          changeTabNum({ quoteApprovalCount: quoteApprovalDs.totalCount });
        });
        // console.log(dvaApp, props);
        const menuLeafNodes = window?.dvaApp?._store?.getState()?.global?.menuLeafNode || [];
        // this.setState({ visible: false });
        const {
          sourceProject: { sourceProjectId = null },
        } = res;
        const search = querystring.stringify({
          sourceFrom: '',
        });
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
          notification.warning({
            message: intl
              .get('sprm.common.model.outMenu.errorLink', { prNumList })
              .d(
                `【${prNumList}】单据已创建成功，由于当前角色无对应菜单权限，无法跳转至对应菜单，请添加权限后再操作。`
              ),
          });
          // dispatch(
          //   routerRedux.push({
          //     pathname: `/ssrc/project-setup/update/${sourceProjectId}`,
          //     search,
          //   })
          // );
        }
        clearSelectAll(quoteApprovalDs);
      } else if (res && res.failed) {
        notification.error({ message: res.message });
      }
    });
  }

  @Bind()
  handleQuery({ params = {} }) {
    const { quoteApprovalDs, location = {} } = this.props;
    const { _back } = location?.state || {};
    const { customizeOrderField = undefined } = params;
    const clearParams = {}; // 清理
    // eslint-disable-next-line no-unused-expressions
    const dataObj = quoteApprovalDs.queryDataSet?.current?.toData() || {};
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

    quoteApprovalDs.setQueryParameter('customizeOrderField', customizeOrderField);
    // eslint-disable-next-line no-unused-expressions
    quoteApprovalDs.queryDataSet.current
      ? quoteApprovalDs.queryDataSet.current.set({
          ...params,
          ...clearParams,
        })
      : quoteApprovalDs.queryDataSet.loadData([
          {
            ...params,
            ...clearParams,
          },
        ]);
    if (_back === -1) {
      quoteApprovalDs.query(quoteApprovalDs.currentPage);
    } else {
      quoteApprovalDs.query();
    }
  }

  @Bind()
  resetQueryDs() {
    const { quoteApprovalDs } = this.props;
    // eslint-disable-next-line no-unused-expressions
    quoteApprovalDs.queryDataSet?.current?.reset();
  }

  render() {
    const { customizeTable, quoteApprovalDs, uomControl, remote } = this.props;
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
            name: 'secondaryUomName',
            renderer: ({ record }) => record.get('secondaryUomCodeAndName'),
          },
          { name: 'secondaryQuantity' },
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
          {
            width: 120,
            name: 'projectTaskId',
          },
        ],
      },
    ];

    const baseUomInfo =
      uomControl?.SPRM === 1 || uomControl?.RFX === 1
        ? []
        : ['secondaryUomName', 'secondaryTaxInUnitPrice', 'secondaryQuantity'];
    const { initCuxPageSize = ['10', '20', '50', '100', '200'] } = remote?.props?.process || {};
    return (
      <div style={{ height: 'calc(100vh - 254px)' }}>
        {customizeTable(
          {
            code: 'SPRM.PURCHASE_EXECUTION_ALL.PROJECT_LIST',
          },
          <SearchBarTable
            style={{ maxHeight: 'calc(100% - 22px)' }}
            aggregation={tableDisplay !== 'flat'}
            searchCode="SPRM.PURCHASE_EXECUTION_ALL.PROJECT_FILTER"
            dataSet={quoteApprovalDs}
            columns={columns.filter((ele) => !baseUomInfo.includes(ele.name))}
            cacheState
            virtual
            virtualCell
            virtualSpin
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
                    dataSet={quoteApprovalDs}
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
