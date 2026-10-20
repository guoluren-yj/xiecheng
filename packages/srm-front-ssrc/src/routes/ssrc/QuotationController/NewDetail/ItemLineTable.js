import React, { PureComponent } from 'react';
import { Table, DataSet, Select, Button, NumberField } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';
import { numberSeparatorRender } from '@/utils/renderer';

import {
  QuotationRange,
  ComponentDiffRender as BiddingComponentDiffRender,
} from './components/BiddingTime';
import ItemLineTableDS from './ItemLineTableDS';
import { ComponentDiffRender } from './utils';
import styles from './index.less';

@observer
export default class ItemLineTable extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.ItemLineTableDS = new DataSet(
      ItemLineTableDS({ header: props?.header, biddingHallFlag: props?.biddingHallFlag })
    );
  }

  componentDidMount() {
    this.initPageQuery();
  }

  initPageQuery = () => {
    const { rfxId, organizationId, custKey, biddingHallFlag, header } = this.props;
    const queryParameters = {
      adjustRecordId: rfxId,
      organizationId,
      customizeUnitCode: `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.ITEMLINE`,
    };
    const { rfxHeaderBaseInfoAdjustDTO = {} } = header || {};
    const { rfxHeaderBaseInfoDTO = {} } = rfxHeaderBaseInfoAdjustDTO || {};
    this.ItemLineTableDS.setQueryParameter('queryParams', queryParameters);
    this.ItemLineTableDS.setQueryParameter('rfxHeaderBaseInfoDTO', rfxHeaderBaseInfoDTO);
    this.ItemLineTableDS.setQueryParameter('biddingHallFlag', biddingHallFlag);
    this.ItemLineTableDS.query();
  };

  // 是否是单价竞价
  @Bind()
  getIsUnitPriceFlag() {
    const { header = {}, biddingHallFlag } = this.props;
    // 竞价大厅-竞价单标识
    const { rfxHeaderBaseInfoAdjustDTO = {} } = header || {};
    const { rfxHeaderBaseInfoDTO = {} } = rfxHeaderBaseInfoAdjustDTO || {};
    const { secondarySourceCategory, biddingFlag, biddingMode, biddingTarget, biddingStatus } =
      rfxHeaderBaseInfoDTO || {};
    const newBiddingFlag =
      !!biddingHallFlag && secondarySourceCategory === 'RFA' && (biddingFlag === 1 || biddingFlag === '1');

    // 起竞价显示标识 【寻源类别】为【竞价】且【竞价模式】为【英式竞价】且【报价类型】是【单价竞价】，任一不满足时隐藏
    const startingBiddingPriceFlag =
      newBiddingFlag && biddingMode === 'BRITISH_BIDDING' && biddingTarget === 'UNIT_PRICE';

    return {
      newBiddingFlag,
      startingBiddingPriceFlag,
      biddingEndFlag: biddingStatus === 'BIDDING_END',
    };
  }

  // table columns
  getColumns() {
    const {
      header: { editFlag },
    } = this.props;

    const { newBiddingFlag, startingBiddingPriceFlag } = this.getIsUnitPriceFlag() || {};

    const columns = [
      {
        name: 'rfxLineItemNum',
        width: 80,
        align: 'left',
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
      !newBiddingFlag && {
        name: 'floatToType',
        width: 140,
        renderer: ({ record }) => {
          return editFlag ? (
            <ComponentDiffRender
              record={record}
              historyDTO="rfxLineItemDTO"
              name="floatType"
              poverContent={record.get('floatTypeMeaning')}
            >
              <Select
                record={record}
                clearButton={false}
                disabled={!editFlag}
                style={{ width: '100%' }}
                name="floatType"
              />
            </ComponentDiffRender>
          ) : (
            <Select
              record={record}
              clearButton={false}
              disabled={!editFlag}
              style={{ width: '100%' }}
              name="floatType"
            />
          );
        },
      },
      !newBiddingFlag && {
        name: 'quotationRange',
        width: 140,
        renderer: ({ record, value }) => (
          <ComponentDiffRender record={record} historyDTO="rfxLineItemDTO" name="quotationRange">
            {editFlag ? (
              <NumberField
                name="quotationRange"
                onChange={(val) => {
                  record.set('quotationRange', val);
                }}
                value={value}
              />
            ) : (
              <span>{value || '-'}</span>
            )}
          </ComponentDiffRender>
        ),
      },
      !!startingBiddingPriceFlag && {
        // 竞价大厅-竞价单报价幅度字段
        name: 'biddingQuotationRange',
        width: 240,
        minWidth: 240,
        className: 'inquiry-update-itemLine-biddingQuotationRange',
        tooltip: 'none',
        renderer: ({ record }) => {
          return (
            <QuotationRange
              name="biddingQuotationRange"
              historyDTO="rfxLineItemDTO"
              record={record}
              type="unitPrice"
            />
          );
        },
      },
      !!startingBiddingPriceFlag && {
        // 【寻源类别】为【竞价】且【竞价模式】为【英式竞价】且【报价类型】是【单价竞价】，任一不满足时隐藏
        width: 150,
        name: 'safePrice',
        editor: (record) => (
          <C7nPrecisionInputNumber
            name="safePrice"
            record={record}
            currency="currencyCode"
            omitZeroFlag
          />
        ),
        renderer: ({ record, value }) => {
          return (
            <BiddingComponentDiffRender
              record={record}
              historyDTO="rfxLineItemDTO"
              name="safePrice"
            >
              {numberSeparatorRender(value)}
            </BiddingComponentDiffRender>
          );
        },
      },
    ].filter(Boolean);

    return columns;
  }

  @Bind()
  saveButton() {
    this.ItemLineTableDS.submit().then((res) => {
      if (res) {
        this.ItemLineTableDS.query();
      }
    });
  }

  ItemLineTableDStoData() {
    return this.ItemLineTableDS.toData();
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      custKey,
      custLoading,
      customizeTable,
      header: { editFlag },
    } = this.props;
    const { newBiddingFlag, startingBiddingPriceFlag, biddingEndFlag } =
      this.getIsUnitPriceFlag() || {};

    let isShowButtonFlag = editFlag; // 原有逻辑
    if (newBiddingFlag) {
      // 新竞价逻辑 【竞价单状态未结束】&【单价竞价】
      isShowButtonFlag = editFlag && !biddingEndFlag && startingBiddingPriceFlag;
    }

    const buttonShow = isShowButtonFlag ? (
      <Button icon="save" onClick={this.saveButton}>
        {intl.get('hzero.common.button.save').d('保存')}
      </Button>
    ) : null;
    return (
      <div className={styles['line-item-table']}>
        {customizeTable(
          { code: `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.ITEMLINE` },
          <Table
            bordered
            buttons={[buttonShow]}
            custLoading={custLoading}
            dataSet={this.ItemLineTableDS}
            rowKey="rfxLineItemId"
            columns={this.getColumns()}
          />
        )}
      </div>
    );
  }
}
