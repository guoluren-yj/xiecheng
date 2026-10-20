/**
 * 阶梯报价tab页
 * @date: 2021-10-21
 * @author: Goxu<xu.pan01@going-link.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2021, ZhenYun
 */
import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { Table, DataSet, Select } from 'choerodon-ui/pro';
import { Icon, Button } from 'hzero-ui';
import { isNil, isEmpty, map } from 'lodash';

import intl from 'utils/intl';
// import { getResponse } from 'utils/utils';
import DynamicButtons from '_components/DynamicButtons';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import { getResponse } from 'hzero-front/lib/utils/utils';
import { getCurrentOrganizationId } from 'utils/utils';
import styles from './index.less';
import { ladderQuotationDS } from './store/tableDS';

const promptCode = 'ssrc.priceComparison';
const { Option } = Select;

export default function LadderQuotationTab(props) {
  const {
    rfxLineItemId,
    sideBarMenuList = [],
    doubleUnitFlag = false,
    rfxId,
    priceComparisonHeader = {},
    remote,
  } = props;
  const [dynamicColumns, setDynamicColumns] = useState([]);
  const [currentRfxLineItemId, setCurrentRfxLineItemId] = useState(rfxLineItemId);
  const ladderQuotationDs = useMemo(() => new DataSet(ladderQuotationDS()), [currentRfxLineItemId]);

  useEffect(() => {
    setCurrentRfxLineItemId(rfxLineItemId);
  }, [rfxLineItemId]); // 防止接口异步, rfxLineItemId更新后再变更state

  useEffect(() => {
    if (isNil(currentRfxLineItemId)) return;
    initQuery(currentRfxLineItemId);
  }, [currentRfxLineItemId]);

  const columns = useMemo(() => {
    const preColumns = [
      {
        name: 'supplierCompanyNum',
        width: 180,
      },
      {
        name: 'supplierCompanyName',
        width: 230,
      },
      ...dynamicColumns,
    ];
    return remote
      ? remote.process(
          'srm-front-ssrc/priceComparison_PROCESS_LADDER_QUOTATION_COLUMNS',
          preColumns
        )
      : preColumns;
  }, [dynamicColumns]);

  const handleChangeSelect = useCallback((value) => {
    if (isNil(value)) return;
    setCurrentRfxLineItemId(value); // 触发 memo 创建新的ds, 最后才effect
    // initQuery(value);
  }, []);

  const initQuery = async (itemId) => {
    ladderQuotationDs.setQueryParameter('rfxLineItemId', itemId);
    const data = getResponse(await ladderQuotationDs.query());
    if (data && !isEmpty(data.content)) {
      const dynColumns = [];
      const { rfxLadderQuotationList = null } = data.content[0] || {};
      if (isEmpty(rfxLadderQuotationList)) {
        return;
      }

      rfxLadderQuotationList.forEach((item, index) => {
        if (doubleUnitFlag) {
          ladderQuotationDs.addField(`secondaryLadder${item.rfxLadderLineNum}`, {
            name: `ladder${item.rfxLadderLineNum}`,
            label: `${intl.get(`${promptCode}.view.message.ladder`).d('阶梯')}[${
              item.secondaryLadderFrom
            },${isNil(item.secondaryLadderTo) ? '-' : item.secondaryLadderTo})`,
            type: 'number',
          });
          dynColumns.push({
            name: `secondaryLadder${item.rfxLadderLineNum}`,
            // width: 150,
            renderer: ({ record }) => {
              const { benchmarkPriceType } = priceComparisonHeader || {};
              const indexData = record.get('rfxLadderQuotationList')?.[index] || {};
              const {
                validLadderSecPrice,
                validNetLadderSecPrice,
                localValidLadderSecPrice = null,
                localValidNetLadderSecPrice = null,
              } = indexData || {};

              // 本币
              const localPrice = benchmarkPriceType === 'TAX_INCLUDED_PRICE' ? localValidLadderSecPrice : localValidNetLadderSecPrice;

              const validPrice = benchmarkPriceType === 'TAX_INCLUDED_PRICE' ? validLadderSecPrice : validNetLadderSecPrice;

              const currentPrice = !isNil(localPrice) ? localPrice : validPrice;

              return currentPrice;
            },
          });
        }
        ladderQuotationDs.addField(`ladder${item.rfxLadderLineNum}`, {
          name: `ladder${item.rfxLadderLineNum}`,
          label: `${intl.get(`${promptCode}.view.message.basicLadder`).d('基本阶梯')}[${
            item.ladderFrom
          },${isNil(item.ladderTo) ? '-' : item.ladderTo})`,
          type: 'number',
        });
        dynColumns.push({
          name: `ladder${item.rfxLadderLineNum}`,
          // width: 150,
          renderer: ({ record }) => {
            const { benchmarkPriceType } = priceComparisonHeader || {};

            const indexData = record.get('rfxLadderQuotationList')?.[index] || {};
            const {
              validLadderPrice,
              validNetLadderPrice,
              localLadderPrice = null,
              localNetLadderPrice = null,
            } = indexData || {};

            // 本币
            const localPrice = benchmarkPriceType === 'TAX_INCLUDED_PRICE' ? localLadderPrice : localNetLadderPrice;

            const validPrice = benchmarkPriceType === 'TAX_INCLUDED_PRICE' ? validLadderPrice : validNetLadderPrice;

            const currentPrice = !isNil(localPrice) ? localPrice : validPrice;

            return currentPrice;
          },
        });
      });
      setDynamicColumns(dynColumns);
      ladderQuotationDs.loadData(data.content);
    }
  };

  // 按钮组
  const getButtons = () => {
    const tableList = ladderQuotationDs.data || [];
    return [
      {
        name: 'dropdownBtnList',
        group: true,
        child: (
          <Button type="primary" disabled={isEmpty(tableList)}>
            <Icon type="export" />
            {intl.get('hzero.common.button.export').d('导出')}
            <Icon type="down" />
          </Button>
        ),
        children: isEmpty(tableList)
          ? []
          : [
              {
                name: 'exportCurrent',
                btnComp: ExcelExportPro,
                btnProps: {
                  templateCode: 'SRM_C_SRM_SSRC_RFX_QUOTATION_COMPARISON_LADDER',
                  requestUrl: `/ssrc/v1/${getCurrentOrganizationId()}/rfx/bargain-assistant/ladder-price/compare`,
                  queryParams: { rfxHeaderId: rfxId, rfxLineItemId: currentRfxLineItemId },
                  buttonText: intl
                    .get('ssrc.priceComparison.view.button.currentExport')
                    .d('导出当前物料'),
                  otherButtonProps: {
                    icon: '',
                    className: styles.noBtn,
                  },
                },
              },
              {
                name: 'exportAll',
                btnComp: ExcelExportPro,
                btnProps: {
                  templateCode: 'SRM_C_SRM_SSRC_RFX_QUOTATION_COMPARISON_LADDER',
                  requestUrl: `/ssrc/v1/${getCurrentOrganizationId()}/rfx/bargain-assistant/ladder-price/compare`,
                  queryParams: { rfxHeaderId: rfxId },
                  buttonText: intl
                    .get('ssrc.priceComparison.view.button.allExport')
                    .d('导出全部物料'),
                  otherButtonProps: {
                    icon: '',
                    className: styles.noBtn,
                  },
                },
              },
            ],
      },
    ];
  };

  return (
    <div className={styles['ladder-quotation-container']}>
      <div className={styles['search-wrapper']}>
        <Select searchable onChange={handleChangeSelect} value={currentRfxLineItemId}>
          {map(sideBarMenuList, (item) => (
            <Option value={item.rfxLineItemId}>{item.concatName}</Option>
          ))}
        </Select>
        <DynamicButtons buttons={getButtons()} />
      </div>

      <Table
        customizable
        customizedCode="SSRC.COMMON_COMPARISON.LADDER_QUOTATION.LIST"
        dataSet={ladderQuotationDs}
        columns={columns}
      />
    </div>
  );
}
