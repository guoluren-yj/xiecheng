import React, { PureComponent } from 'react';
import { Table, DataSet, Select } from 'choerodon-ui/pro';
import { Badge, Popover } from 'choerodon-ui';
import { observer } from 'mobx-react';
import intl from 'utils/intl';
import { noop } from 'lodash';

import { numberSeparatorRender } from '@/utils/renderer';

import ItemLineTableDS from './ItemLineTableDS';
import { QuotationRange } from '../../InquiryHallNew/Update/Components';

@observer
export default class ItemLineTable extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    const { currentMode, quotationName, judgeNewBiddingFlag = noop } = props;
    this.ItemLineTableDS = new DataSet(
      ItemLineTableDS({
        currentMode,
        quotationName,
        judgeNewBiddingFlag,
      })
    );
  }

  // 依据id判断页面是否刷新
  isPageRefresh(prevProps) {
    const {
      match: { params: prevParams },
    } = prevProps;
    const {
      match: { params = {} },
    } = this.props || {};
    const prevId = prevParams.rfxId || null;
    const id = params.rfxId || null;
    return id && prevId !== id;
  }

  // getSnapshotBeforeUpdate(prevProps = {}) {
  //   return this.isPageRefresh(prevProps);
  // }

  componentDidMount() {
    this.initPageQuery();
  }

  // componentDidUpdate() {
  //   this.initPageQuery();
  // }

  initPageQuery = () => {
    const { rfxId, organizationId, custKey, currentMode } = this.props;
    const queryParameters = {
      adjustRecordId: rfxId,
      organizationId,
      customizeUnitCode:
        currentMode === 'history'
          ? `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.ITEMLINE_HIS`
          : `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.ITEMLINE_ONLYRED`,
    };
    this.ItemLineTableDS.setQueryParameter('queryParams', queryParameters);
    this.ItemLineTableDS.query();
  };

  // table columns
  getColumns = () => {
    const { currentMode = null, header, judgeNewBiddingFlag = noop } = this.props;
    const showDiff = currentMode === 'current' || currentMode === 'history';

    const { rfxHeaderBaseInfoAdjustDTO } = header || {};
    const { biddingMode, biddingTarget } = rfxHeaderBaseInfoAdjustDTO || {};
    // 竞价大厅标识 sourceCategory === 'RFA' && (biddingFlag === 1 || biddingFlag === '1') 为竞价大厅
    const newBiddingFlag = judgeNewBiddingFlag();

    // 报价幅度、安全价 显示标识 【寻源类别】为【竞价】且【竞价模式】为【英式竞价】且【报价类型】是【单价竞价】，任一不满足时隐藏
    const startingBiddingPriceFlag =
      newBiddingFlag && biddingMode === 'BRITISH_BIDDING' && biddingTarget === 'UNIT_PRICE';

    const columns = [
      {
        name: 'rfxLineItemNum',
        width: 80,
        align: 'left',
        renderer: ({ record = {} }) => (
          <div>
            {showDiff && record.get('addFlag') ? (
              <Popover
                content={intl.get('ssrc.inquiryHall.model.inquiryHall.newLine').d('新增行')}
                placement="bottom"
              >
                <span>
                  {currentMode === 'history' ? (
                    <Badge status="error" />
                  ) : (
                    <Badge status="success" />
                  )}
                </span>
              </Popover>
            ) : (
              ''
            )}
            {showDiff && record.get('updateFlag') ? (
              <Popover
                content={intl.get('ssrc.inquiryHall.model.inquiryHall.infoChange').d('信息更改')}
                placement="bottom"
              >
                <span>
                  {currentMode === 'history' ? (
                    <Badge status="error" />
                  ) : (
                    <Badge status="success" />
                  )}
                </span>
              </Popover>
            ) : (
              ''
            )}
            {record.get('supplierCompanyNum')}
          </div>
        ),
      },
      {
        name: 'ouName',
        width: 150,
      },
      {
        name: 'invOrganizationName',
        width: 150,
      },
      {
        name: 'itemCode',
        width: 150,
      },
      {
        name: 'itemName',
      },
      !startingBiddingPriceFlag
        ? {
            name: 'floatToType',
            width: 140,
            renderer: ({ record }) => {
              return (
                <Select
                  record={record}
                  clearButton={false}
                  disabled
                  style={{ width: '100%' }}
                  name="floatType"
                />
              );
            },
          }
        : null,
      !startingBiddingPriceFlag
        ? {
            name: 'quotationRange',
            width: 140,
          }
        : null,
      startingBiddingPriceFlag
        ? {
            name: 'biddingQuotationRange',
            width: 240,
            minWidth: 240,
            className: 'quotation-controller-itemLine-biddingQuotationRange',
            renderer: ({ record }) => {
              return <QuotationRange name="biddingQuotationRange" record={record} />;
            },
          }
        : null,
      startingBiddingPriceFlag
        ? {
            // 【寻源类别】为【竞价】且【竞价模式】为【英式竞价】且【报价类型】是【单价竞价】，任一不满足时隐藏
            width: 150,
            name: 'safePrice',
            align: 'left',
            renderer: ({ value }) => numberSeparatorRender(value),
          }
        : null,
    ].filter(Boolean);

    return columns;
  };

  /**
   * render
   * @returns React.element
   */
  render() {
    const { custLoading, customizeTable, custKey, currentMode } = this.props;

    return (
      <>
        {customizeTable(
          {
            code:
              currentMode === 'history'
                ? `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.ITEMLINE_HIS`
                : `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.ITEMLINE_ONLYRED`,
          },
          <Table
            bordered
            custLoading={custLoading}
            dataSet={this.ItemLineTableDS}
            rowKey="rfxLineItemId"
            columns={this.getColumns()}
          />
        )}
      </>
    );
  }
}
