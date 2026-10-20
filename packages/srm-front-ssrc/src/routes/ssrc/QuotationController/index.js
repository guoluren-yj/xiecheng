/**
 * quotationController - 寻源服务/寻源过程控制
 * @date: 2018-12-25
 * @author: CJ <juan.chen01@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isUndefined } from 'lodash';
import querystring from 'querystring';
import { Modal, Spin, message } from 'choerodon-ui/pro';

import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import {
  filterNullValueObject,
  getCurrentOrganizationId,
  getResponse,
  getCurrentTenant,
} from 'utils/utils';
import {
  createBeforeDirectController,
  validateBeforeDirectController,
} from '@/services/inquiryHallNewService';
import { fetchOldControllerConfig } from '@/services/inquiryHallService';
import { BID, getDocumentTypeName, getSourceName } from '@/utils/globalVariable';
import notification from 'utils/notification';
import { asyncPageFetchList } from '@/utils/utils';

import FilterForm from './FilterForm';
import TableList from './TableList';

const promptCode = 'ssrc.quoController';

class QuotationController extends Component {
  form;

  state = {
    allLoading: false,
  };

  bidFlag = this.props.sourceKey === BID;

  custKey = this.bidFlag ? 'BID_' : '';

  documentTypeName = getDocumentTypeName(this.bidFlag);

  /**
   * render()调用后获取数据
   */
  componentDidMount() {
    const {
      dispatch,
      quotationController: { pagination = {} },
    } = this.props;
    this.handleSearch(pagination);
    const lovCodes = {
      sourceMethod: 'SSRC.SOURCE_METHOD', // 寻源方式
      rfxStatus: this.bidFlag ? 'SSRC.NEW_BID_STATUS' : 'SSRC.RFX_STATUS', // 询价单状态
      auctionDirection: 'SSRC.SOURCE_AUCTION_DIRECTION', // 报价方向
      sourceCategory: 'SSRC.SOURCE_CATEGORY', // 寻源类别
    };
    dispatch({
      type: 'quotationController/batchCode',
      payload: { lovCodes },
    });
  }

  /**
   * 查询
   * @param {object} fields - 查询参数
   * @param { Boolean } pageChangeFlag - 是否来源于翻页查询
   */
  @Bind()
  async handleSearch(page = {}, pageChangeFlag = false) {
    const {
      dispatch,
      organizationId,
      match: { path = null },
      quotationController: { oldTotalElements },
    } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    const commonPayload = {
      page,
      ...fieldValues,
      organizationId,
      path,
      secondarySourceCategory: this.bidFlag ? 'NEW_BID' : null,
      customizeUnitCode: `SSRC.${this.bidFlag ? 'BID_' : ''}QUOTATION_CONTROLLER.LIST,SSRC.${
        this.bidFlag ? 'BID_' : ''
      }QUOTATION_CONTROLLER.FILTER.FORM`,
    };

    const fetchDataList = (payload) => {
      return dispatch({
        type: 'quotationController/fetchDataList',
        payload,
      });
    };
    // 异步分页
    await asyncPageFetchList({
      pageChangeFlag,
      commonPayload,
      oldTotalElements,
      fetchDataList,
    });
  }

  /**
   * 设置Form
   * @param {object} ref - FilterForm组件引用
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 设置开标Form
   * @param {object} ref - FilterForm组件引用
   */
  @Bind()
  onRef(ref = {}) {
    this.openingBidForm = (ref.props || {}).form;
  }

  // 寻源过程控制
  // TODO 过程控制会跳用用三个接口，其中最后一个时间最长(几秒到几十秒)，且存在交互，防抖等手段页无法处理多次掉用，故采用同步判断
  controlApiSyncFlag = 0;

  /**
   * 跳转到明细页面
   */
  @Bind()
  async inquiryDetail(record) {
    const { history, organizationId } = this.props;
    const { rfxHeaderId, projectLineSectionId } = record || {};
    const searchObj = {};
    if (projectLineSectionId) {
      searchObj.projectLineSectionId = projectLineSectionId;
    }
    const search = querystring.stringify(searchObj);

    this.setState({
      allLoading: true,
    });

    try {
      const res = getResponse(
        await fetchOldControllerConfig({
          organizationId,
          tenant: getCurrentTenant().tenantNum,
        })
      );
      if (!res) {
        notification.warning();
        return;
      }
      if (!res.length) {
        const result = getResponse(
          await validateBeforeDirectController({
            organizationId,
            sourceHeaderId: rfxHeaderId,
            sourceFrom: 'RFX',
          })
        );
        if (result) {
          const onOk = async () => {
            if (this.controlApiSyncFlag === 1) {
              return;
            }

            this.controlApiSyncFlag = 1;
            const createRes = await createBeforeDirectController({
              organizationId,
              sourceHeaderId: rfxHeaderId,
              sourceFrom: 'RFX',
            });
            this.controlApiSyncFlag = 0;
            if (createRes && !createRes.failed) {
              const url = `/ssrc/${this.bidFlag ? 'bid-' : ''}quotation-controller/new-rfx-detail/${
                createRes.adjustRecordId
              }`;
              history.push({
                pathname: url,
                search,
              });
            } else {
              message.warning(createRes?.message);
            }
          };
          if (result.validateResult === 'createAdjustAgain') {
            Modal.confirm({
              key: Modal.key(),
              title: intl
                .get(`ssrc.inquiryHall.view.message.title.newCreateAdjustgain`)
                .d('寻源单已变更，是否重新进入寻源过程控制界面？'),
              onOk: () => onOk(),
            });
          } else if (result.validateResult === 'createAdjust') {
            onOk();
          } else if (result.validateResult === 'openAdjust') {
            const url = `/ssrc/${this.bidFlag ? 'bid-' : ''}quotation-controller/new-rfx-detail/${
              result.adjustRecordId
            }`;
            history.push({
              pathname: url,
              search,
            });
          }
        }
      } else {
        history.push({
          pathname: `/ssrc/${
            this.bidFlag ? 'bid-' : ''
          }quotation-controller/rfx-detail/${rfxHeaderId}`,
          search,
        });
      }
    } catch (error) {
      throw error;
    } finally {
      this.setState({
        allLoading: false,
      });
      this.controlApiSyncFlag = 0;
    }
  }

  render() {
    const {
      fetchDataLoading,
      customizeTable,
      customizeFilterForm,
      quotationController: {
        list = [],
        pagination = {},
        code: { sourceMethod = [], rfxStatus = [], auctionDirection = [], sourceCategory = [] },
      },
      match: { path = null },
    } = this.props;
    const formProps = {
      customizeFilterForm,
      sourceMethod,
      rfxStatus,
      auctionDirection,
      sourceCategory,
      custKey: this.custKey,
      bidFlag: this.bidFlag,
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
      documentTypeName: this.getDocumentTypeName,
    };
    const tableProps = {
      path,
      customizeTable,
      sourceMethod,
      rfxStatus,
      auctionDirection,
      dataSource: list,
      pagination,
      loading: fetchDataLoading,
      custKey: this.custKey,
      bidFlag: this.bidFlag,
      onChange: this.handleSearch,
      onInquiryDetail: this.inquiryDetail,
      documentTypeName: this.getDocumentTypeName,
    };

    return (
      <React.Fragment>
        <Spin spinning={this.state.allLoading}>
          <Header
            title={intl
              .get(`${promptCode}.view.message.title.commonRFxProcessControl`, {
                sourceCategoryName: getSourceName(this.bidFlag),
              })
              .d('{sourceCategoryName}过程控制')}
          />
          <Content>
            <div className="table-list-search">
              <FilterForm {...formProps} />
            </div>
            <TableList {...tableProps} />
          </Content>
        </Spin>
      </React.Fragment>
    );
  }
}

// 引用类型函数
const hocComponent = (NewComponent) => {
  return withCustomize({
    unitCode: [
      'SSRC.QUOTATION_CONTROLLER.LIST', // 寻源过程控制列表code
      'SSRC.QUOTATION_CONTROLLER.FILTER.FORM', // 寻源过程控制查询表单
    ],
  })(
    connect(({ quotationController, loading }) => ({
      quotationController,
      fetchDataLoading: loading.effects['quotationController/fetchDataList'],
      organizationId: getCurrentOrganizationId(),
    }))(
      formatterCollections({
        code: ['ssrc.quoController', 'ssrc.common', 'srm.rfx'],
      })(NewComponent)
    )
  );
};

export default hocComponent(QuotationController);

export { QuotationController };
