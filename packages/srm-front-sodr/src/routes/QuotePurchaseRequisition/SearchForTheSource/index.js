import { connect } from 'dva';
import React, { Component, Fragment } from 'react';
import { Button } from 'hzero-ui';
import intl from 'utils/intl';
import querystring from 'querystring';
import { routerRedux } from 'dva/router';
import { isUndefined, isEmpty, uniqBy } from 'lodash';
import { Header, Content } from 'components/Page';
import {
  getCurrentOrganizationId,
  filterNullValueObject,
  createPagination,
  getEditTableData,
} from 'utils/utils';
import { Bind, Throttle } from 'lodash-decorators';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { math } from 'choerodon-ui/dataset';
import BigNumber from 'bignumber.js';
import Search from './Search';
import List from './List';
import LadderLevelModal from './LadderLevelModal';
import { parseAumont, queryCommonDoubleUomConfig } from '@/routes/components/utils';
import { THROTTLE_TIME } from '@/routes/components/utils/constant';
@formatterCollections({
  code: [
    'sodr.common',
    'sodr.orderMaintain',
    'entity.company',
    'entity.supplier',
    'entity.roles',
    'ssrc.inquiryHall',
    'sodr.order',
  ],
})
@withCustomize({
  unitCode: ['SODR.PURCHASE_SOURCE_LIST.LINE', 'SODR.PURCHASE_SOURCE_LIST.FILTER'],
})
@connect(({ quotePurchaseRequisition, loading }) => ({
  quotePurchaseRequisition,
  fetchListLoading: loading.effects['quotePurchaseRequisition/fetchList'],
  checkLoading: loading.effects['quotePurchaseRequisition/check'],
  createLoading: loading.effects['quotePurchaseRequisition/createOrder'],
  createCombineOrdering: loading.effects['quotePurchaseRequisition/createCombineOrder'],
  pendingFlagLoading: loading.effects['quotePurchaseRequisition/pendingFlag'],
}))
export default class SourceFromOrder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      selectedRows: [],
      peddingSelectedRows: [],
      dataList: [],
      dataPagination: {},
      visible: false,
      doubleUnitEnabled: 0,
    };
  }

  componentDidMount() {
    this.queryDoubleUomConfig();
  }

  componentDidUpdate(prevProps) {
    const { custLoading } = this.props;
    if (!custLoading && prevProps.custLoading !== custLoading) {
      this.fetchEnum();
      this.handleSearch();
    }
  }

  /**
   * 查询值集
   */
  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({
      type: 'quotePurchaseRequisition/fetchEnum',
    });
  }

  /**
   * 查询双单位配置
   */
  @Bind()
  async queryDoubleUomConfig() {
    const result = await queryCommonDoubleUomConfig();
    this.setState({
      doubleUnitEnabled: result || 0,
    });
  }

  // 查询
  @Bind()
  handleSearch(page = {}, buttonFlag) {
    const {
      dispatch,
      quotePurchaseRequisition: { searchForTheSourcePagination = {} },
    } = this.props;
    const { pageSize, total } = searchForTheSourcePagination;
    if (buttonFlag) {
      this.setState({ selectedRowKeys: [], peddingSelectedRows: [] });
    }
    const { selectedRowKeys, selectedRows, dataList } = this.state;
    let filterValues = {};
    const dataListSelectedRows = dataList.filter((n) => selectedRowKeys.includes(n.resultId));
    // 翻页数据校验
    if (this.validateFieldsWhenPaging(dataListSelectedRows, buttonFlag)) {
      return;
    }
    // 翻页时获得当前页选中行数据
    const newSelectedRows = [];
    if (selectedRowKeys.length > 0) {
      // dataListSelectedRows.map((n) => newSelectedRows.push(n));
      newSelectedRows.push(...getEditTableData(dataListSelectedRows));
      const newSelectedKeys = newSelectedRows.map((n) => n.resultId);
      selectedRows.map((n) => {
        if (!newSelectedKeys.includes(n.resultId) && selectedRowKeys.includes(n.resultId)) {
          newSelectedRows.push(n);
        }
        return n;
      });
    }

    if (!isUndefined(this.Search)) {
      const formValue = this.Search.getFieldsValue();
      const values = {
        ...formValue,
        creatDateFrom: formValue.creatDateFrom
          ? formValue.creatDateFrom.format(DATETIME_MIN)
          : undefined,
        creatDateTo: formValue.creatDateTo ? formValue.creatDateTo.format(DATETIME_MAX) : undefined,
      };
      filterValues = filterNullValueObject(values);
    }
    dispatch({
      type: 'quotePurchaseRequisition/fetchList',
      payload: {
        page: { pageSize, ...page },
        ...filterValues,
        asyncCountFlag: 'DEFAULT',
        oldTotalElements: buttonFlag ? undefined : total,
        customizeUnitCode: 'SODR.PURCHASE_SOURCE_LIST.LINE,SODR.PURCHASE_SOURCE_LIST.FILTER',
      },
    }).then((res) => {
      if (res) {
        if (res && res.needCountFlag === 'Y') {
          dispatch({
            type: 'quotePurchaseRequisition/fetchListPage',
            payload: {
              page: { pageSize, ...page },
              ...filterValues,
              asyncCountFlag: 'DEFAULT',
              customizeUnitCode: 'SODR.PURCHASE_SOURCE_LIST.LINE,SODR.PURCHASE_SOURCE_LIST.FILTER',
            },
          }).then((result) => {
            if (result && !result.failed) {
              this.setState({
                dataPagination: createPagination(result),
              });
            }
          });
        } else {
          this.setState({
            dataPagination: createPagination(res),
          });
        }
        const newSelectedRowsKeys = newSelectedRows.map((n) => n.resultId);
        const newDataList =
          res?.content?.map((n) => {
            if (newSelectedRowsKeys.includes(n.resultId)) {
              const _selectedRows = newSelectedRows.filter((m) => m.resultId === n.resultId);
              // 此处selectedRows的信息为缓存，需要最新的数据从结果中取
              const _obj = res?.content?.find((t) => t.resultId === _selectedRows[0].resultId);
              const {
                poSourceContractConfigObjectVersionNumber,
                pendingFlag,
                sourceContractConfigId,
              } = _obj;
              return {
                ..._selectedRows[0],
                poSourceContractConfigObjectVersionNumber,
                sourceContractConfigId,
                pendingFlag,
                _status: 'update',
              };
              // return {
              //   ...newSelectedRows.filter((m) => m.resultId === n.resultId)[0],
              //   _status: 'update',
              // };
            } else {
              return { ...n, receiptsOrderQuantity: n.changeQuantity, _status: 'update' };
            }
          }) || [];
        this.setState({
          dataList: newDataList,
          // dataPagination: createPagination(res),
          selectedRows: newSelectedRows,
        });
      }
    });
  }

  /**
   * 翻页数据校验
   * @param {Object} dataListSelectedRows
   */
  @Bind()
  validateFieldsWhenPaging(dataListSelectedRows, buttonFlag) {
    let errorFlag = false;
    if (buttonFlag) return errorFlag;
    dataListSelectedRows.map((record) => {
      record.$form.validateFields((err, values) => {
        if (err && 'receiptsOrderQuantity' in err) {
          if (values.receiptsOrderQuantity === undefined || values.receiptsOrderQuantity === null) {
            notification.error({
              message: intl
                .get(`sodr.orderMaintain.model.quotePurchase.notNullError`)
                .d('当前页勾选数据信息有必输信息未维护，请检查'),
            });
            errorFlag = true;
          } else if (values.receiptsOrderQuantity <= 0) {
            notification.error({
              message: intl
                .get(`sodr.orderMaintain.model.quotePurchase.notZeroError`)
                .d('勾选行创建订单数量必须大于零，请检查'),
            });
            errorFlag = true;
          } else if (values.receiptsOrderQuantity > record.remainQuantity) {
            notification.error({
              message: intl
                .get(`sodr.orderMaintain.model.quotePurchase.notGreaterError`)
                .d('勾选行创建订单数量不可大于可创建订单数量，请检查'),
            });
            errorFlag = true;
          }
        }
      });
      return record;
    });
    return errorFlag;
  }

  @Bind()
  toSourceDetail(record) {
    const { dispatch } = this.props;
    const { sourceHeaderId, sourceFrom } = record;
    if (sourceFrom === 'RFX') {
      dispatch(
        routerRedux.push({
          pathname: `/sodr/purchase-order-maintain/source-from-requisition/query-rfq/${sourceHeaderId}`,
          search: querystring.stringify({
            libFlag: `order`,
            rfxStatus: record.subjectMatterRule,
            sourcePage: 'order',
          }),
        })
      );
    } else {
      dispatch(
        routerRedux.push({
          pathname: `/sodr/purchase-order-maintain/source-from-requisition/bid-event-query/${sourceHeaderId}`,
          // search: `?source=NONE `,
          search: querystring.stringify({ source: record.subjectMatterRule }),
        })
      );
    }
  }

  @Bind()
  showLadderInquiry(record) {
    const { dispatch } = this.props;

    dispatch({
      type: 'quotePurchaseRequisition/showLadderInquiry',
      payload: {
        sourceLineItemId: record.sourceLineItemId,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          visible: true,
          LadderRes: res.content,
          LadderLevelHeaderData: {
            itemCode: record.itemCode,
            itemName: record.itemName,
            supplierCompanyName: record.supplierCompanyName,
          },
        });
      }
    });
  }

  /**
   * 数据行选择操作
   */
  @Bind()
  handleSelectRow(selectedRowKeys, row) {
    const selctRow = uniqBy(row, 'resultId');
    // const selctRow = [].concat(peddingSelectedRows, row).filter((item) => {
    //   return selectedRowKeys.some((k) => {
    //     return item.resultId === k;
    //   });
    // });
    this.setState({ selectedRowKeys, peddingSelectedRows: selctRow });
  }

  @Bind()
  queryTargetDom() {
    const targetDom = document.querySelector(`.ant-table-row-level-0 > td:nth-child(13)`) || null;
    if (targetDom) targetDom.scrollIntoView(false);
  }

  // 创建寻源订单
  @Throttle(THROTTLE_TIME, { trailing: false })
  @Bind
  createOrder() {
    const { dispatch } = this.props;
    const { selectedRowKeys, selectedRows, dataList, doubleUnitEnabled } = this.state;

    const lines = dataList.filter((n) => selectedRowKeys.includes(n.resultId));

    // if (lines.filter((n) => !n.changeQuantity || n.changeQuantity < 0).length > 0) {
    //   notification.error({
    //     message: intl
    //       .get(`sodr.orderMaintain.model.quotePurchase.thisOrderQuantityNotNullAndZero`)
    //       .d('本次下单数量必须大于零，请检查'),
    //   });
    //   return;
    // }

    const overFlag = lines
      .map((item) => {
        const { receiptsOrderQuantity, remainQuantity } = item;
        return receiptsOrderQuantity > remainQuantity;
      })
      .includes(true);
    if (overFlag) {
      notification.warning({
        message: intl
          .get('sodr.sourceFrom.view.message.overQuantity')
          .d('下单数量应小于可下单数量'),
      });
      return false;
    }

    const newSelectedRows = [];
    // lines.map((n) => newSelectedRows.push(n));
    const _editTableData = (getEditTableData(lines) || []).map((i) => ({
      ...i,
      uomCodeTemp: doubleUnitEnabled ? i.secondaryUomCode : i.uomCode,
    }));
    newSelectedRows.push(..._editTableData);
    const newSelectedKeys = newSelectedRows.map((n) => n.resultId);
    selectedRows.map((n) => {
      if (!newSelectedKeys.includes(n.resultId) && selectedRowKeys.includes(n.resultId)) {
        newSelectedRows.push(n);
      }
      return n;
    });

    const newSelectedRowsForNew = newSelectedRows.map((item) => {
      const newUniPrice =
        item.unitPrice && !math.isZero(item.unitPrice)
          ? new BigNumber(parseAumont(item.unitPrice, item.defaultPrecision))
          : item.unitPrice;
      const newTaxPrice =
        item.taxprice && !math.isZero(item.taxprice)
          ? new BigNumber(parseAumont(item.taxprice, item.defaultPrecision))
          : item.taxPrice;
      return { ...item, unitPrice: newUniPrice, taxPrice: newTaxPrice };
    });
    this.setState({ selectedRows: newSelectedRows });
    dispatch({
      type: 'quotePurchaseRequisition/check',
      payload: {
        sourceCode: 'SOURCE',
      },
    }).then((rec) => {
      if (rec === 1) {
        if (newSelectedRowsForNew.length > 0) {
          dispatch({
            type: 'quotePurchaseRequisition/createCombineOrder',
            payload: newSelectedRowsForNew,
          }).then((res) => {
            if (res && !res.failed && res.length > 1) {
              dispatch(
                routerRedux.push({
                  pathname: `/sodr/purchase-order-maintain/source-from-requisition/tab-line-newCreation`,
                  search: `?poHeaderId=${res.map((n) => n.poHeaderId)}&cacheKey=${
                    res[0].cacheKey
                  }&source=newRequisition&sourcePage=pageSource`,
                })
              );
              notification.success();
            } else if (res && !res.failed && res.length === 1) {
              const poHeaderId = res.map((n) => n.poHeaderId);
              dispatch(
                routerRedux.push({
                  pathname: `/sodr/purchase-order-maintain/source-from-requisition/detail/${poHeaderId}`,
                  search: `?poHeaderId=${poHeaderId}&source=newRequisition&sourcePage=pageSource`,
                })
              );
            }
          });
        }
      } else if (rec === 0) {
        if (newSelectedRowsForNew.length > 0) {
          dispatch({
            type: 'quotePurchaseRequisition/createOrder',
            payload: newSelectedRowsForNew,
          }).then((res) => {
            if (res && !res.failed) {
              const { poHeaderId } = res;
              dispatch(
                routerRedux.push({
                  pathname: `/sodr/purchase-order-maintain/source-from-requisition/detail/${poHeaderId}`,
                  search: `?poHeaderId=${poHeaderId}&source=newRequisition&sourcePage=pageSource`,
                })
              );
            }
          });
        }
      }
      this.queryTargetDom();
    });
  }

  // 点击暂挂
  @Throttle(THROTTLE_TIME, { trailing: false })
  @Bind()
  handleHold() {
    const { dispatch } = this.props;
    const { peddingSelectedRows } = this.state;
    const one = peddingSelectedRows.every((item) => item.pendingFlag === 1);
    const zero = peddingSelectedRows.every((item) => item.pendingFlag === 0);
    if (!one && !zero) {
      return notification.warning({
        message: intl
          .get('sodr.sourceFrom.view.message.checkMark')
          .d('勾选行暂挂标识不一致,请检查!'),
      });
    }
    const resultList = peddingSelectedRows.map((n) => {
      return {
        tenantId: n.tenantId,
        pendingFlag: n.pendingFlag === 1 ? 0 : 1,
        type: 'SOURCE',
        executeType: 'PO',
        resultId: n.resultId,
        sourceContractConfigId: n.sourceContractConfigId,
        poSourceContractConfigObjectVersionNumber: n.poSourceContractConfigObjectVersionNumber,
      };
    });
    dispatch({
      type: `quotePurchaseRequisition/${zero ? 'pendingFlag' : 'pendingCancelFlag'}`,
      payload: resultList,
    }).then((res) => {
      if (res) {
        this.handleSearch({}, true);
      }
    });
  }

  //   收起更多查询
  @Bind()
  searchMore(type) {
    const { dispatch } = this.props;
    dispatch({
      type: 'quotePurchaseRequisition/updateState',
      payload: { collapse: type },
    });
  }

  /**
   * hideOperationRecord - 关闭筛选供应商弹窗
   */
  @Bind()
  hideOperationRecord() {
    const { visible } = this.state;
    this.setState({ visible: !visible });
  }

  /**
   * 本次下单数量失去焦点触发事件
   * @param {Object} item
   * @param {Object} record
   */
  // @Bind()
  // changeQuantityChange(item, record) {
  //   const { dataList = [] } = this.state;
  //   const dataListRows = dataList?.map((n) => {
  //     if (n.resultId && n.resultId === record.resultId) {
  //       return {
  //         ...n,
  //         receiptsOrderQuantity: parseFloat(item.target.value.replace(',', '')),
  //       };
  //     } else {
  //       return n;
  //     }
  //   });
  //   this.setState({ dataList: dataListRows });
  // }

  render() {
    const {
      quotePurchaseRequisition: { collapse = false, enumMap = {} },
      fetchListLoading = false,
      checkLoading,
      createLoading,
      createCombineOrdering,
      customizeTable,
      customizeFilterForm,
      pendingFlagLoading,
    } = this.props;
    const {
      selectedRowKeys = [],
      // selectedRows = [],
      dataList = [],
      dataPagination = {},
      visible,
      LadderRes,
      doubleUnitEnabled,
      // LadderPagination,
      LadderLevelHeaderData,
      peddingSelectedRows = [],
    } = this.state;
    const tenantId = getCurrentOrganizationId();
    const searchProps = {
      enumMap,
      tenantId,
      collapse,
      customizeFilterForm,
      ref: (ref) => {
        this.Search = ref;
      },
      onSearch: this.handleSearch,
      searchMore: this.searchMore,
    };
    const listProps = {
      tenantId,
      dataList,
      customizeTable,
      toSourceDetail: this.toSourceDetail,
      dataPagination,
      loading: fetchListLoading || createCombineOrdering || createLoading,
      onChange: this.handleSearch,
      selectedRowKeys,
      doubleUnitEnabled,
      onSelectRow: this.handleSelectRow,
      showLadderInquiry: this.showLadderInquiry,
      // changeQuantityChange: this.changeQuantityChange,
    };
    const ladderLevelModalProps = {
      visible,
      hideModal: this.hideOperationRecord,
      ladderLevelData: LadderRes,
      LadderLevelHeaderData,
      // fetchLadderLevelLoading,
    };
    const headerBtnLoading =
      createLoading || createCombineOrdering || checkLoading || pendingFlagLoading;
    return (
      <Fragment>
        <Header
          title={intl.get(`sodr.orderMaintain.sourceFrom.title`).d('引用寻源结果')}
          backPath="/sodr/purchase-order-maintain/list"
        >
          <Button
            type="primary"
            icon="plus"
            loading={headerBtnLoading}
            disabled={selectedRowKeys.length === 0}
            onClick={this.createOrder}
          >
            {intl.get(`sodr.orderMaintain.sourceFrom.createButton`).d('创建')}
          </Button>
          {peddingSelectedRows.every((item) => item.pendingFlag === 1) &&
          !isEmpty(selectedRowKeys) ? (
            <Button
              loading={headerBtnLoading}
              disabled={selectedRowKeys.length === 0}
              onClick={this.handleHold}
              icon="unlock"
            >
              {intl.get(`sodr.orderMaintain.sourceFrom.cancelHold`).d('取消暂挂')}
            </Button>
          ) : (
            <Button
              loading={headerBtnLoading}
              disabled={selectedRowKeys.length === 0}
              onClick={this.handleHold}
              icon="lock"
            >
              {intl.get(`sodr.orderMaintain.sourceFrom.hold`).d('暂挂')}
            </Button>
          )}
        </Header>
        <Content>
          <Search {...searchProps} />
          <List {...listProps} />
          {visible && <LadderLevelModal {...ladderLevelModalProps} />}
        </Content>
      </Fragment>
    );
  }
}
