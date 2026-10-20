import React, { PureComponent } from 'react';
import { observer } from 'mobx-react-lite';
import { Tooltip } from 'choerodon-ui';
import { Table, Button } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { WithCustomizeC7N } from 'srm-front-cuz';

import ViewLadder from '@/components/ViewLadder';
import PopoverList from '@/components/PopoverList';
import { precisionRender } from '@/utils/precision';
import { withCustomDimension, getCustDimColumns } from '@/utils/customDimension';

@withCustomDimension()
@WithCustomizeC7N({
  unitCode: [
    'SMAL.AGREEMENT_MANAGEMENT.IMPORT_MANUAL_NEW',
    'SMAL.AGREEMENT_MANAGEMENT.IMOIRT_PRICE_LIB_NEW',
  ],
})
export default class TableInfo extends PureComponent {
  @Bind()
  renderRegion(record) {
    if (record.allRegionFlag === 1) {
      return intl.get('small.common.model.allAreas').d('所有区域');
    } else {
      const list = record.agreementRegionDTOList || [];
      const columns = [
        {
          title: intl.get('small.common.model.regionCode').d('区域编码'),
          dataIndex: 'regionCode',
          width: 120,
        },
        {
          title: intl.get('small.common.model.regionName').d('区域名称'),
          dataIndex: 'regionName',
          render: (text, data) => {
            const valid = data.regionEnableFlag === 0; // 失效
            return (
              <Tooltip
                title={
                  valid
                    ? intl
                        .get('sagm.common.model.skuSalesRegions.validator')
                        .d('地址库已升级，该地址已经不存在，请重新编辑。')
                    : ''
                }
              >
                <span style={{ color: valid ? 'red' : '#000' }}>{text}</span>
              </Tooltip>
            );
          },
        },
      ];
      return list.length === 1 ? (
        list[0].regionName
      ) : (
        <PopoverList
          dataSource={list}
          columns={columns}
          text={intl.get('hzero.common.button.more').d('更多')}
        />
      );
    }
  }

  @Bind()
  renderCompany(record) {
    if (record.allUnitFlag === 1) {
      return intl.get('small.common.model.allOrganization').d('所有组织');
    } else {
      const list = record.agreementUnitDTOList || [];
      const columns = [
        {
          title: intl.get('small.common.model.organizationCode').d('组织编码'),
          dataIndex: 'unitCode',
          width: 120,
        },
        {
          title: intl.get('small.common.model.organizationName').d('组织名称'),
          dataIndex: 'unitName',
        },
      ];

      return list.length === 1 ? (
        list[0].unitName
      ) : (
        <PopoverList
          dataSource={list}
          columns={columns}
          text={intl.get('hzero.common.button.more').d('更多')}
        />
      );
    }
  }

  @Bind()
  getColumns() {
    const { onShowTransfer = (e) => e, initData, tableDs, custDimensions } = this.props;
    const custDimColumns = getCustDimColumns(tableDs, custDimensions, {
      readOnly: true,
      sort: 26,
    });
    const columns = [
      {
        name: 'lineNum',
        width: 100,
        lock: 'left',
      },
      {
        name: 'itemLov',
        width: 150,
        lock: 'left',
        renderer: ({ record }) => record.get('itemCode'),
      },
      {
        name: 'itemName',
        width: 150,
      },
      {
        name: 'itemCategoryLov',
        width: 150,
        renderer: ({ record }) => record.get('itemCategoryName'),
      },
      {
        name: 'catalogLov',
        width: 150,
        renderer: ({ record }) => record.get('catalogName'),
      },
      {
        name: 'effectiveFlag',
        width: 100,
        renderer: ({ record }) => record.get('effectiveFlagMeaning'),
      },
      {
        width: 160,
        name: 'validDateFrom',
      },
      {
        width: 160,
        name: 'validDateTo',
      },
      {
        name: 'uomLov',
        width: 140,
        renderer: ({ record }) => record.get('uomName'),
      },
      {
        name: 'taxLov',
        width: 140,
        align: 'left',
        renderer: ({ record }) => record.get('tax') && Number(record.get('tax')),
      },
      {
        name: 'currencyLov',
        width: 140,
        renderer: ({ record }) => record.get('currencyName'),
      },
      {
        name: 'priceType',
        width: 150,
        renderer: ({ record }) => record.get('priceTypeMeaning'),
      },
      {
        name: 'unitPrice',
        width: 150,
        renderer: precisionRender,
      },
      {
        name: 'taxPrice',
        width: 150,
        renderer: precisionRender,
      },
      {
        name: 'priceBatchQuantity',
        width: 120,
      },
      {
        name: 'ladderFlag',
        width: 160,
        renderer: ({ record }) =>
          record.get('priceType') === 'LADDER_PRICE' ? (
            <ViewLadder dataSource={record.get('agreementLadders') || []} />
          ) : (
            ''
          ),
      },
      {
        name: 'priceHiddenFlag',
        width: 160,
        renderer: ({ record }) => record.get('priceHiddenFlagMeaning'),
        help: intl
          .get('small.common.view.hiddenPriceHelp')
          .d('开启隐藏价格则主站商品价格显示为***'),
      },
      {
        name: 'postageLov',
        width: 150,
        renderer: ({ record }) => {
          const { postage, postageId } = record.get(['postage', 'postageId']);
          return postage
            ? postage.postageName
            : postageId === -1
            ? intl.get('small.common.view.free').d('包邮')
            : '-';
        },
      },
      {
        name: 'installLov',
        width: 150,
        renderer: ({ record }) => (record.get('install') ? record.get('install').postageName : '-'),
      },
      {
        name: 'agreementQuantity',
        width: 150,
        renderer: precisionRender,
      },
      {
        name: 'orderQuantity',
        width: 150,
        renderer: precisionRender,
      },
      {
        name: 'minPackageQuantity',
        width: 150,
        renderer: precisionRender,
      },
      {
        name: 'purchaseQuantityLimit',
        width: 150,
        renderer: precisionRender,
      },
      {
        name: 'purchaseAmountLimit',
        width: 150,
        renderer: precisionRender,
      },
      {
        width: 220,
        name: 'deliverRegionLov',
        renderer: ({ record }) => this.renderRegion(record.toData()),
      },
      {
        width: 220,
        name: 'buyOrganizationLov',
        renderer: ({ record }) => this.renderCompany(record.toData()),
      },
      {
        name: 'priceSourceFromNum',
        width: 130,
      },
      {
        name: 'priceSourceFromLnNum',
        width: 130,
      },
      ...custDimColumns,
      {
        name: 'deliveryDay',
        width: 150,
      },
      {
        name: 'guaranteeDay',
        width: 150,
      },
      initData.sourceFrom === 'PRICE'
        ? {
            title: intl.get('small.common.model.priceFromNum').d('价格编号'),
            name: 'priceLibNumber',
            width: 150,
          }
        : '',
      {
        name: 'remark',
        width: 150,
        renderer: ({ value, record }) => record.get('remarkMeaning') || value,
      },
      {
        width: 120,
        lock: 'right',
        name: 'operation',
        renderer: ({ record }) => (
          <a onClick={() => onShowTransfer(record.toData())}>
            {intl.get('small.common.model.product').d('商品')}({record.get('detailsFlag')})
          </a>
        ),
      },
    ];
    return columns;
  }

  render() {
    const { tableDs, initData, skuApprove, customizeTable, onBatchCreateProduct } = this.props;
    const BatchButton = observer(({ dataSet }) => {
      return (
        <Button
          funcType="flat"
          color="primary"
          icon="library_add-o"
          disabled={dataSet.selected.length === 0}
          onClick={() => onBatchCreateProduct(dataSet.selected.map((e) => e.toData()))}
        >
          {intl.get('small.common.model.batchCreateProducts').d('批量创建商品')}
        </Button>
      );
    });
    return (
      <React.Fragment>
        {customizeTable(
          {
            code:
              initData.sourceFrom === 'PRICE'
                ? 'SMAL.AGREEMENT_MANAGEMENT.IMOIRT_PRICE_LIB_NEW'
                : 'SMAL.AGREEMENT_MANAGEMENT.IMPORT_MANUAL_NEW',
          },
          <Table
            bordered
            dataSet={tableDs}
            columns={this.getColumns()}
            buttons={[skuApprove && <BatchButton dataSet={tableDs} />]}
          />
        )}
      </React.Fragment>
    );
  }
}
