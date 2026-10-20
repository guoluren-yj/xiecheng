/**
 * ApplyToInquiry - 引用申请立项
 * @date: 2019-3-28
 * @author: ZT <tong.zhao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
import { Table, Button, Modal } from 'hzero-ui';
import { connect } from 'dva';
import { Bind, Throttle } from 'lodash-decorators';
import querystring from 'querystring';

import { getActiveTabKey } from 'utils/menuTab';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { isUndefined, isEmpty } from 'lodash';
import {
  getCurrentOrganizationId,
  filterNullValueObject,
  getResponse,
  getCurrentTenant,
} from 'utils/utils';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { routerRedux } from 'dva/router';
import notification from 'utils/notification';
import { yesOrNoRender, dateTimeRender, dateRender } from 'utils/renderer';

import { createQuoteApprovalDetail } from '@/services/projectSetupService';
import { fetchConfigSheet } from '@/services/inquiryHallNewService';

import { numberSeparatorRender } from '@/utils/renderer';
import { queryEnableDoubleUnit } from '@/services/commonService';
import { isText, applyToNotification, getQtyName, getUomName } from '@/utils/utils';

import FilterForm from './FilterForm';
import Style from './index.less';

@withCustomize({
  unitCode: [
    'SSRC.PROJECT_SETUP.APPLY_TO_PROJECT.LIST', // 列表
  ],
})
@connect(({ projectSetup, loading }) => ({
  projectSetup,
  quoteApprovalList: projectSetup.quoteApprovalList,
  quoteApprovalPagination: projectSetup.quoteApprovalPagination,
  loading: loading.effects['projectSetup/fetchQuoteApproval'],
  createLoading: loading.effects['projectSetup/createQuoteApproval'],
  organizationId: getCurrentOrganizationId(),
}))
@formatterCollections({
  code: ['ssrc.inquiryHall', 'ssrc.common', 'ssrc.projectSetup'],
})
export default class ApplyToInquiry extends Component {
  form;

  state = {
    selectedRowKeys: [],
    doubleUnitFlag: false, // 判断是否开启双单位
    projectOldUIFlag: true, // 是否寻源立项老ui
    selectAllPageFlag: undefined, // 跨页全选标识，初始状态为undefined，1为跨页全选，0为取消跨页全选
    unSelectRowKeys: [], // 未勾选行keys
  };

  componentDidMount() {
    this.queryDoubleUnit();
    this.handleSearch();
    this.fetchOldUIConfig();
  }

  // 查询双单位是否开启
  queryDoubleUnit = async () => {
    const res = await queryEnableDoubleUnit({
      businessModule: 'RFX',
    });
    if (isText(res)) {
      this.setState({
        doubleUnitFlag: !!Number(res),
      });
    }
  };

  // 查询新老ui配置
  @Bind()
  async fetchOldUIConfig() {
    try {
      const data = getResponse(
        await fetchConfigSheet({
          organizationId: getCurrentOrganizationId(),
          configCode: 'srm_source_project_old_ui_black_list',
          data: {
            tenantNum: getCurrentTenant().tenantNum,
          },
        })
      );
      if (data && !isEmpty(data)) {
        this.setState({
          projectOldUIFlag: true,
        });
      } else {
        this.setState({
          projectOldUIFlag: false,
        });
      }
    } catch (e) {
      throw e;
    }
  }

  @Bind()
  handleRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  @Bind()
  handleSearch(page = {}) {
    const { dispatch, organizationId, projectSetup } = this.props;
    const { isStandardModelsFlag } = projectSetup || {};
    const erpControlFlag = 1;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    const payload = {
      page,
      ...fieldValues,
      organizationId,
      erpControlFlag,
      ...(isStandardModelsFlag ? { asyncCountFlag: 'DEFAULT' } : null),
      sourceDocumentType: 'PROJECT',
      customizeUnitCode: 'SSRC.PROJECT_SETUP.APPLY_TO_PROJECT.LIST',
    };
    if (isStandardModelsFlag) {
      dispatch({
        type: 'projectSetup/fetchQuoteApproval',
        payload,
      }).then((res) => {
        if (res && res.content) {
          this.handleSelectPageData(res.content);
        }
        if (res && res.needCountFlag === 'Y') {
          dispatch({
            type: 'projectSetup/fetchQuoteApprovalPage',
            payload,
          });
        }
      });
    } else {
      dispatch({
        type: 'projectSetup/fetchQuoteApproval',
        payload,
      }).then((pageRes) => {
        if (pageRes && pageRes.content) {
          this.handleSelectPageData(pageRes.content);
        }
      });
    }
  }

  // 每次查询数据处理勾选数据
  @Bind()
  handleSelectPageData(list) {
    const { selectedRowKeys, unSelectRowKeys, selectAllPageFlag } = this.state;
    if (selectAllPageFlag === 1) {
      // 过滤当前页数据是否在 unSelectRowKeys或者在 selectedRowKeys 中，若都不在则加入勾选项
      const newSelectKeys = [];
      list.forEach((item) => {
        const unSelectIndex = unSelectRowKeys.indexOf(item.prLineId);
        const selectIndex = selectedRowKeys.indexOf(item.prLineId);
        if (unSelectIndex === -1 && selectIndex === -1) {
          newSelectKeys.push(item.prLineId);
        }
      });
      this.setState({
        selectedRowKeys: [...selectedRowKeys, ...newSelectKeys],
      });
    }
  }

  // 在进行了某些操作之后重置勾选数据相关字段
  @Bind()
  resetSelectData() {
    this.setState({
      selectedRowKeys: [],
      unSelectRowKeys: [],
      selectAllPageFlag: undefined,
    });
  }

  @Bind()
  scrollWidth(columns, fixWidth) {
    const total = columns.reduce((prev, current) => prev + (current.width ? current.width : 0), 0);
    return total + fixWidth + 1;
  }

  getNewProjectUpdatePath = (data) => {
    const { sourceProjectId } = data || {};

    if (!sourceProjectId) {
      return;
    }

    const path = `/ssrc/new-project-setup/sp-update/${sourceProjectId}`;
    return path;
  }

  /**
   * 选择数据点击创建
   */
  @Bind()
  async checkBeforeCreateInquiry() {
    const { dispatch, organizationId, location, quoteApprovalPagination } = this.props;
    const { selectedRowKeys, projectOldUIFlag, selectAllPageFlag, unSelectRowKeys } = this.state;
    // const { search } = location || {};
    const { routeFrom, sourceProjectId: sourceProjectIds } = querystring.parse(
      location.search.substr(1)
    );
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    // 跨页全选所需参数
    const selectAllPageParams = selectAllPageFlag
      ? {
          selectAllPageFlag,
          eliminatePrLineIdList: unSelectRowKeys,
          prLineDTO: fieldValues,
          selectAllPageSize: quoteApprovalPagination.total,
        }
      : {};

    const search = querystring.stringify({
      current: routeFrom,
      routeFrom,
      sourceProjectId: sourceProjectIds,
    });
    if (selectedRowKeys.length === 0) {
      Modal.error({
        content: intl
          .get('ssrc.inquiryHall.view.message.notification.oneRowSelect')
          .d('请选择至少一行数据'),
      });
      return;
    }

    // ps: projectSetupUpdate-维护    projectSetupChange-变更；老ui维护变更一套代码不区分，新ui区分
    if (['projectSetupUpdate', 'projectSetupChange'].includes(routeFrom)) {
      const result = getResponse(
        await createQuoteApprovalDetail({
          prLineIdList: selectedRowKeys,
          configCenterCode: 'SITE.SSRC.PROJECT_PURCHASE_MERGE_RULE',
          sourceProject: {
            sourceProjectId: sourceProjectIds,
          },
          ...selectAllPageParams,
        })
      );
      if (result) {
        if (projectOldUIFlag) {
          // 老ui
          dispatch(
            routerRedux.push({
              pathname: `/ssrc/project-setup/update/${sourceProjectIds}`,
              search,
            })
          );
        } else {
          // 新ui
          const prefixPathNew = '/ssrc/new-project-setup';
          const pathname =
            routeFrom === 'projectSetupUpdate'
              ? this.getNewProjectUpdatePath({ sourceProjectId: sourceProjectIds, })
              : `${prefixPathNew}/sp-change/${sourceProjectIds}`;
          dispatch(
            routerRedux.push({
              pathname,
              search,
            })
          );
        }
      }
    } else {
      dispatch({
        type: 'projectSetup/checkApplyToInquiry',
        payload: {
          organizationId,
          prLineIdList: selectedRowKeys,
          customizeUnitCode: 'SSRC.PROJECT_SETUP.APPLY_TO_PROJECT.LIST',
          configCenterCode: 'SITE.SSRC.PROJECT_PURCHASE_MERGE_RULE',
          sourceDocumentType: 'PROJECT',
          ...selectAllPageParams,
        },
      }).then((res) => {
        if (res) {
          // if (res.companyInconsistentFlag === 1 && res.currencyInconsistentFlag === 1) {
          //   Modal.error({
          //     content: intl
          //       .get('ssrc.inquiryHall.view.message.notCreate.companyCurrency')
          //       .d('公司和币种不一致，不能并单创建'),
          //   });
          //   return;
          // }
          // if (res.companyInconsistentFlag === 1 && res.currencyInconsistentFlag === 0) {
          //   Modal.error({
          //     content: intl
          //       .get('ssrc.inquiryHall.view.message.notCreate.company')
          //       .d('公司不一致，不能并单创建'),
          //   });
          //   return;
          // }
          // if (res.companyInconsistentFlag === 0 && res.currencyInconsistentFlag === 1) {
          //   Modal.error({
          //     content: intl
          //       .get('ssrc.inquiryHall.view.message.notCreate.currency')
          //       .d('币种不一致，不能并单创建'),
          //   });
          //   return;
          // }
          // if (res.unitInconsistentFlag === 1) {
          //   Modal.error({
          //     content: intl
          //       .get('ssrc.inquiryHall.view.message.notCreate.depart')
          //       .d('部门不一致，不能并单创建'),
          //   });
          //   return;
          // }
          if (
            res.companyInconsistentFlag === 0 ||
            !res.companyInconsistentFlag
            // &&
            // res.currencyInconsistentFlag === 0 &&
            // res.unitInconsistentFlag === 0
          ) {
            if (res.secondaryUomInconsistentFlag === 1) {
              applyToNotification(res.secondaryUomInconsistentMes);
            }
            dispatch({
              type: 'projectSetup/createQuoteApproval',
              payload: {
                organizationId,
                prLineIdList: selectedRowKeys,
                ...selectAllPageParams,
              },
            }).then((response) => {
              if (response) {
                notification.success();
                this.handleSearch();
                this.resetSelectData();
                const { sourceProject } = response;
                const { sourceProjectId } = sourceProject;
                if (projectOldUIFlag) {
                  // 老ui
                  dispatch(
                    routerRedux.replace({
                      pathname: `/ssrc/${
                        routeFrom === 'newProjectSetup' ? 'new-project-setup' : 'project-setup'
                      }/update/${sourceProjectId}`,
                      search,
                    })
                  );
                } else {
                  // 新ui
                  dispatch(
                    routerRedux.push({
                      pathname: this.getNewProjectUpdatePath({ sourceProjectId }),
                      search,
                    })
                  );
                }
              }
            });
          }
          if (
            res.companyInconsistentFlag === 1
            // &&
            // res.currencyInconsistentFlag === 0 &&
            // res.unitInconsistentFlag === 0
          ) {
            // this.setState({ visible: true });
            Modal.confirm({
              title: intl
                .get(`ssrc.inquiryHall.view.message.diffCompany`)
                .d('并单公司不一致,是否继续?'),
              onOk: () => {
                if (res.secondaryUomInconsistentFlag === 1) {
                  applyToNotification(res.secondaryUomInconsistentMes);
                }
                dispatch({
                  type: 'projectSetup/createQuoteApproval',
                  payload: {
                    organizationId,
                    prLineIdList: selectedRowKeys,
                    ...selectAllPageParams,
                  },
                }).then((response) => {
                  if (response) {
                    notification.success();
                    this.handleSearch();
                    this.resetSelectData();
                    const { sourceProject } = response;
                    const { sourceProjectId } = sourceProject;
                    if (projectOldUIFlag) {
                      // 老ui
                      dispatch(
                        routerRedux.replace({
                          pathname: `/ssrc/${
                            routeFrom === 'newProjectSetup' ? 'new-project-setup' : 'project-setup'
                          }/update/${sourceProjectId}`,
                          search,
                        })
                      );
                    } else {
                      // 新ui
                      dispatch(
                        routerRedux.push({
                          pathname: this.getNewProjectUpdatePath({ sourceProjectId }),
                          search,
                        })
                      );
                    }
                  }
                });
              },
            });
          }
        }
      });
    }
  }

  @Bind()
  onSelectChange(selectedRowKeys) {
    this.setState({ selectedRowKeys });
  }

  // 用户手动选择/取消选择某列的回调
  @Bind()
  handleManualSelectOne(record, selected) {
    const { unSelectRowKeys } = this.state;
    if (!selected) {
      this.setState({
        unSelectRowKeys: [...unSelectRowKeys, record.prLineId],
      });
    }
  }

  // 勾选跨页全选/取消跨页全选
  @Bind()
  @Throttle(1200)
  handleSelectAllManually(selectRowKeys) {
    if (!this.state.selectAllPageFlag) {
      this.setState({
        selectAllPageFlag: 1, // 设置跨页全选标识为1
        selectedRowKeys: selectRowKeys, // 存储当前页数据
      });
      return;
    }
    this.setState({
      selectAllPageFlag: 0, // 设置跨页全选标识为0
      selectedRowKeys: [], // 清空缓存的勾选数据
    });
  }

  render() {
    const {
      loading,
      quoteApprovalList,
      quoteApprovalPagination,
      createLoading,
      location,
      customizeTable,
      organizationId,
    } = this.props;
    const { selectedRowKeys, doubleUnitFlag, selectAllPageFlag } = this.state;
    const { routeFrom, backPath } = querystring.parse(location.search.substr(1));
    const columns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.applicationNum`).d('申请编号'),
        dataIndex: 'displayPrNum',
        fixed: 'left',
        width: 150,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo`).d('行号'),
        dataIndex: 'displayLineNum',
        fixed: 'left',
        width: 80,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 150,
        fixed: 'left',
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemName`).d('物料名称'),
        dataIndex: 'itemName',
        width: 150,
        fixed: 'left',
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.commonName`).d('通用名'),
        dataIndex: 'commonName',
        width: 150,
      },
      {
        title: intl.get(`ssrc.common.goodsSorts`).d('物品分类'),
        dataIndex: 'categoryName',
        width: 100,
      },
      {
        title: intl.get('ssrc.common.company').d('公司'),
        dataIndex: 'companyName',
        width: 150,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.ouName`).d('业务实体'),
        dataIndex: 'ouName',
        width: 150,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.invOrganizationName`).d('库存组织'),
        dataIndex: 'invOrganizationName',
        width: 130,
      },
      doubleUnitFlag
        ? {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quantities`).d('数量'),
            dataIndex: 'secondaryQuantity',
            width: 80,
            render: numberSeparatorRender,
          }
        : null,
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.occupiedQuantity`).d('剩余可占用数量'),
        dataIndex: 'occupiedQuantity',
        width: 140,
        render: (val, record) =>
          doubleUnitFlag
            ? numberSeparatorRender(record.secondaryOccupiedQuantity)
            : numberSeparatorRender(val),
      },
      doubleUnitFlag
        ? {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.unit`).d('单位'),
            dataIndex: 'secondaryUomName',
            width: 80,
          }
        : null,
      {
        title: getQtyName(doubleUnitFlag),
        dataIndex: 'quantity',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: getUomName(doubleUnitFlag),
        dataIndex: 'uomName',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.currency`).d('币种'),
        dataIndex: 'currencyCode',
        width: 80,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.neededDate`).d('需求日期'),
        dataIndex: 'neededDate',
        width: 170,
        render: dateRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.prRequestedName`).d('申请人'),
        dataIndex: 'prRequestedName',
        width: 130,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.demandExecutor`).d('需求执行人'),
        dataIndex: 'executorName',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.purchaseAgentName`).d('采购员'),
        dataIndex: 'purchaseAgentName',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.unitName`).d('需求部门'),
        dataIndex: 'unitName',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.requestDate`).d('申请日期'),
        dataIndex: 'requestDate',
        width: 170,
        render: dateRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.remarks`).d('备注'),
        dataIndex: 'remark',
        width: 200,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.prSourcePlatform`).d('数据来源'),
        dataIndex: 'prSourcePlatformMeaning',
        width: 130,
      },
      // {
      //   title: intl.get(`ssrc.inquiryHall.model.inquiryHall.executorName`).d('分配人'),
      //   dataIndex: 'executorName',
      //   width: 150,
      // },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.assignedDate`).d('最后分配时间'),
        dataIndex: 'assignedDate',
        width: 170,
        render: dateTimeRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.drawingNum`).d('图号'),
        dataIndex: 'drawingNum',
        width: 130,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.drawingVersion`).d('图纸版本'),
        dataIndex: 'drawingVersion',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.surfaceFlag`).d('表面处理'),
        dataIndex: 'surfaceTreatFlag',
        width: 120,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierItemNum`).d('供应商料号'),
        dataIndex: 'supplierItemCode',
        width: 120,
      },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.supplierItemNumDesc`)
          .d('供应商料号描述'),
        dataIndex: 'supplierItemNumDesc',
        width: 120,
      },
    ].filter(Boolean);
    const scrollWidth = this.scrollWidth(columns, 0);
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
      onSelect: this.handleManualSelectOne,
      hideDefaultSelections: true,
      selections: [
        {
          key: 'all-data',
          text: !selectAllPageFlag
            ? intl.get('ssrc.common.view.button.selectAllManually').d('跨页全选')
            : intl.get('ssrc.common.view.button.unselectAllManually').d('取消跨页全选'),
          onSelect: this.handleSelectAllManually,
        },
      ],
    };
    const filterFormProps = {
      loading,
      onRef: this.handleRef,
      onSearch: this.handleSearch,
      organizationId,
      resetSelectData: this.resetSelectData,
    };
    return (
      <React.Fragment>
        <Header
          backPath={
            backPath ||
            (routeFrom === 'newProjectSetup'
              ? '/ssrc/new-project-setup/list'
              : '/ssrc/project-setup/list')
          }
          title={intl.get('ssrc.projectSetup.view.button.quoteApproval').d('引用申请立项')}
        >
          <Button
            icon="plus"
            type="primary"
            loading={createLoading}
            onClick={() => this.checkBeforeCreateInquiry()}
          >
            {intl.get('hzero.common.create').d('创建')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterFormProps} />
          </div>
          {customizeTable(
            { code: 'SSRC.PROJECT_SETUP.APPLY_TO_PROJECT.LIST' },
            <Table
              scroll={{ x: scrollWidth }}
              dataSource={quoteApprovalList}
              rowSelection={rowSelection}
              pagination={quoteApprovalPagination}
              onChange={this.handleSearch}
              loading={loading}
              columns={columns}
              bordered
              rowKey="prLineId"
              className={Style['ssrc-project-setup-quote-approval-list']}
            />
          )}
        </Content>
      </React.Fragment>
    );
  }
}
