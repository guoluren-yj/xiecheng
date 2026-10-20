import React, { useMemo } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import SearchBarTable from '_components/SearchBarTable';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import ImportButton from 'components/Import';

import c7nModal from '@/utils/c7nModal';
import { DropdownMenuBtns, DropdownBtn } from '@/components/CommonButtons';
import { getStrategyListDs } from '../Stores/strategyDs';
import {
  strategyAdjustRenderer,
  strategyDimensionColumn,
  overlinePriceRenderer,
} from '../renderers';
import Detail from '../../PriceStrategy/Detail';
import { unLock } from '../../PriceStrategy/api';

const searchBarCode = 'SAGM.SALE_WORKBENCH.STRATEGY.SEARCH_BAR';

export function handleEditStrategy(type, detailProps = {}) {
  const { readOnly = false } = detailProps;
  const title =
    type === 'create'
      ? intl.get('sagm.common.view.title.createStrategy').d('新增策略')
      : readOnly
      ? intl.get('sagm.priceStrategy	view.strategyDetail').d('策略明细')
      : intl.get('sagm.common.view.title.updateStrategy').d('编辑策略');
  c7nModal({
    style: { width: 742 },
    footer: readOnly ? null : undefined,
    title,
    children: (
      <Detail
        type={type}
        readOnly={readOnly}
        {...detailProps}
        onSuccess={res => {
          if (type === 'create' && typeof detailProps.handleSuccess === 'function') {
            detailProps.handleSuccess(res);
          }
        }}
      />
    ),
  });
}

export default function StrategyList(props) {
  const {
    agreementHeaderId,
    viewSkuBackPath,
    strategyCodes = [],
    permissionList = [],
    modal,
    onOk = e => e,
  } = props;
  const dataSet = useMemo(() => {
    const ds = new DataSet(getStrategyListDs());
    ds.setQueryParameter('saleAgreementHeaderId', agreementHeaderId);
    ds.setQueryParameter('customizeUnitCode', searchBarCode);
    ds.setQueryParameter('newPriceStrategyCodes', strategyCodes.join(','));
    ds.setQueryParameter('isAddSelected', 1);
    // ds.query();
    return ds;
  }, [agreementHeaderId]);

  modal.handleOk(() => {
    if (dataSet.selected.length > 0) {
      const data = dataSet.selected.map(m => {
        const priceStrategy = m.toData();
        return { priceStrategy, ...priceStrategy };
      });
      return onOk(data);
    }
  });

  function handleSuccess({ priceStrategyId }) {
    dataSet.setState('priceStrategyId', priceStrategyId);
  }

  async function handleUnlock(record) {
    const { enableFlag, priceStrategyId } = record.get([
      'enableFlag',
      'priceStrategyId',
      'priceStrategyLineId',
    ]);
    if (enableFlag === 1) {
      dataSet.status = 'loading';
      const res = getResponse(await unLock({ priceStrategyId }));
      dataSet.status = 'ready';
      if (res && res.priceStrategyId) {
        record.init('priceStrategyId', res.priceStrategyId);
        handleEdit(res.priceStrategyId);
      }
    } else {
      handleEdit(priceStrategyId);
    }
  }

  function handleEdit(type) {
    handleEditStrategy(type, {
      handleSuccess,
      viewSkuBackPath,
      permissionList,
      onFetchList: () => dataSet.query(dataSet.currentPage),
    });
  }

  const columns = useMemo(
    () => [
      {
        name: 'strategyCode',
        width: 150,
      },
      {
        name: 'action',
        width: 80,
        header: intl.get('hzero.common.action').d('操作'),
        renderer: ({ record }) => (
          <a onClick={() => handleUnlock(record)}>
            {intl.get('hzero.common.button.edit').d('编辑')}
          </a>
        ),
      },
      {
        name: 'strategyName',
        width: 200,
      },
      {
        name: 'adjustDetailsMeaning',
        width: 220,
        renderer: ({ record }) => strategyAdjustRenderer(record.toData()),
      },
      {
        name: 'overlinePriceEnableMeaning',
        width: 120,
        renderer: ({ record }) => {
          return overlinePriceRenderer({
            record: {
              get: () => record.toData(),
            },
          });
        },
      },
      strategyDimensionColumn(),
      {
        name: 'creationDate',
        width: 200,
        label: intl.get('sagm.common.view.creationDate').d('创建时间'),
      },
      {
        name: 'realName',
        width: 180,
        label: intl.get('sagm.common.view.creator').d('创建人'),
      },
      { name: 'remark', width: 100 },
    ],
    []
  );
  return (
    <>
      <SearchBarTable
        dataSet={dataSet}
        columns={columns}
        searchCode={searchBarCode}
        searchBarConfig={{
          defaultExpand: false,
          closeFilterSelector: true,
        }}
        style={{ maxHeight: 'calc(100vh - 160px)' }}
        customizedCode="SAGM.SALE_AGREEMENT_WORKBENCH.DETAIL.STRATEGY_LIST"
        buttons={[
          <DropdownMenuBtns
            width={120}
            menus={[
              {
                text: intl.get('sagm.common.button.manualCreate').d('手工新增'),
                onClick: () => handleEdit('create'),
                funcType: 'link',
              },
              {
                childRef: (
                  <ImportButton
                    businessObjectTemplateCode="SRM_C_STANDARD_SAGM_PRICE_STRATEGY_SALE_IMPORT"
                    refreshButton
                    changeServicePrefix
                    buttonText={intl.get('sagm.common.button.importNew').d('导入')}
                    prefixPatch="/sagm"
                    successCallBack={() => dataSet.query()}
                    buttonProps={{
                      icon: '',
                      style: { marginLeft: 0 },
                      funcType: 'link',
                      permissionList: [
                        {
                          code:
                            'srm.mall.tenant.sale-agreement.workbench.button.price-strategy.import',
                          type: 'button',
                          meaning: '销售协议工作台-价格策略导入',
                        },
                      ],
                    }}
                  />
                ),
              },
            ]}
          >
            <DropdownBtn
              text={intl.get('hzero.common.button.add').d('新增')}
              icon="playlist_add"
              funcType="flat"
            />
          </DropdownMenuBtns>,
        ]}
      />
    </>
  );
}
