/*
 * @Description: 结算策略详情-取价模式弹框
 * @Date: 2022-01-20 14:44:10
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React, { useEffect, useMemo, useState, useContext, memo, useCallback, Fragment } from 'react';
import { Table, Switch, Select, DataSet, Lov, Icon, Tooltip } from 'choerodon-ui/pro';
import { Tabs } from 'choerodon-ui';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import {
  pricingModelTableDS,
  pricingModelFromDS,
  pricingModelLimitDS,
  priceToSettleAutoFillTemplateDS,
} from '@/stores/SettleStrategyDS';
import EditorForm from '@/routes/Components/EditorForm';
import { getPricingModel, savePricingModel } from '@/services/settleStrategyServices';
import { Store } from '../StoreProvider';
import { getSelectedNegActConfirmMsg } from '@/utils/utils';

const commonPrompt = 'ssta.settleStrategy.model.settleStrategy';
const { TabPane } = Tabs;

/**
 * @description: 取价模式弹窗
 * @param {Object} props
 * @return {ReactNode}
 */
export default memo(({ modal }) => {
  const { headerDs, editFlag, settleConfigId, platModalFlag, emitChangeModals } = useContext(Store);

  const [tabKey, setTabKey] = useState('point');

  const pricingModelTableDs = useMemo(() => new DataSet(pricingModelTableDS(editFlag)), [editFlag]);

  const pricingModelFromDs = useMemo(() => new DataSet(pricingModelFromDS()), []);

  const pricingModelLimitDs = useMemo(() => new DataSet(pricingModelLimitDS()), []);

  const priceToSettleAutoFillTemplateDs = useMemo(
    () => new DataSet(priceToSettleAutoFillTemplateDS()),
    []
  );

  const templateColumns = useMemo(() => {
    return [{ name: 'libPriceAutoTemplate', editor: Lov }];
  }, []);

  useEffect(() => {
    if (settleConfigId !== 'create') {
      init();
    }
    modal.handleOk(handleLoadPricingInfo);
  }, [settleConfigId, init, modal, handleLoadPricingInfo]);

  const handleLoadPricingInfo = useCallback(async () => {
    emitChangeModals('priceSource');
    const pricingModelFromFlag = await pricingModelFromDs.validate();
    const pricingModelLimitDsFlag = await pricingModelLimitDs.validate();
    const priceToSettleAutoFillTemplateDsFlag = await priceToSettleAutoFillTemplateDs.validate();
    if (!pricingModelFromFlag) {
      onTabChange('sever');
      return false;
    }
    if (!pricingModelLimitDsFlag) {
      onTabChange('limit');
      return false;
    }
    if (!priceToSettleAutoFillTemplateDsFlag) {
      onTabChange('template');
      return false;
    }
    if (pricingModelFromFlag && pricingModelLimitDsFlag && priceToSettleAutoFillTemplateDsFlag) {
      const priceSource = 'PRICE_LIB';
      const libPriceAutoTemplate = priceToSettleAutoFillTemplateDs.current?.get(
        'libPriceAutoTemplate'
      );
      const body = {
        priceSource,
        settleConfigId,
        libPriceAutoTemplate,
        priceActionList: pricingModelTableDs.toJSONData(),
        priceDimensionList: pricingModelLimitDs.toJSONData(),
        priceServiceList: pricingModelFromDs.toJSONData(),
      };
      const res = getResponse(await savePricingModel(body, settleConfigId));
      if (res) {
        headerDs.current.set({
          priceSource,
          libPriceAutoTemplate,
          objectVersionNumber: res.configObjectVersionNumber,
        });
        return true;
      } else {
        return false;
      }
    }
  }, [
    emitChangeModals,
    headerDs,
    priceToSettleAutoFillTemplateDs,
    pricingModelFromDs,
    pricingModelLimitDs,
    pricingModelTableDs,
    settleConfigId,
  ]);

  const init = useCallback(async () => {
    const res = getResponse(await getPricingModel(settleConfigId, platModalFlag));
    if (res) {
      const { priceServiceList, priceActionList, priceDimensionList, libPriceAutoTemplate } = res;
      if (priceServiceList.length === 0) {
        priceServiceList.push({
          serviceName: null,
          serviceCode: null,
        });
      }
      priceToSettleAutoFillTemplateDs.loadData([{ libPriceAutoTemplate }]);
      pricingModelTableDs.loadData(priceActionList);
      pricingModelFromDs.loadData(priceServiceList);
      await pricingModelLimitDs.loadData(priceDimensionList);
      for (const record of pricingModelLimitDs.records) {
        record.selectable = isRecordEdit(record);
      }
    }
  }, [
    platModalFlag,
    priceToSettleAutoFillTemplateDs,
    pricingModelFromDs,
    pricingModelLimitDs,
    pricingModelTableDs,
    settleConfigId,
  ]);

  // 并单规则下面默认值不可编辑
  const isRecordEdit = (record) => {
    if (
      record.get('priceDimensionId') &&
      record.get('dimensionType') === 'DOC_MERGE' &&
      (record.get('dimension') === 'companyId' || record.get('dimension') === 'supplierCompanyId')
    ) {
      return false;
    } else {
      return true;
    }
  };

  const optionsFilters = (option, record) =>
    record.get('dimensionType') === 'VALIDATE_RULE' ? option.get('value') !== 'BILL_NUM' : true;

  const isRecordEditType = (record) => {
    if (
      record.get('dimensionType') === 'DOC_MERGE' ||
      record.get('dimensionType') === 'SPLITE' ||
      record.get('dimensionType') === 'VALIDATE_RULE'
    ) {
      return false;
    } else {
      return true;
    }
  };

  const onTabChange = (key) => {
    setTabKey(key);
  };

  const columns = useMemo(
    () => [
      {
        name: 'action',
        width: 300,
        editor: (record) =>
          editFlag && !record?.get('priceActionId') ? (
            <Select
              optionsFilter={(option) => {
                return !['SETTLE_ACCESS'].includes(option?.get('value'));
              }}
            />
          ) : (
            false
          ),
      },
      {
        name: 'enableFlag',
        width: 300,
        editor: editFlag && <Switch />,
      },
    ],
    [editFlag]
  );

  const limitColumns = useMemo(
    () => [
      {
        name: 'dimensionType',
        width: 300,
        editor: (record) => editFlag && isRecordEdit(record) && isRecordEditType(record),
      },
      {
        name: 'dimension',
        width: 300,
        editor: (record) =>
          editFlag && isRecordEdit(record) ? (
            <Select optionsFilter={(option) => optionsFilters(option, record)} />
          ) : (
            false
          ),
      },
    ],
    [editFlag]
  );

  const serviceColumns = useMemo(
    () => [
      {
        name: 'serviceLov',
        width: 300,
        editor: editFlag,
        renderer: ({ record }) => record.toData().serviceCode,
      },
      {
        name: 'serviceName',
        width: 300,
      },
    ],
    [editFlag]
  );

  const handleDelete = async () => {
    pricingModelLimitDs.setQueryParameter('settleConfigId', settleConfigId);
    const res = await pricingModelLimitDs.delete(
      pricingModelLimitDs.selected,
      getSelectedNegActConfirmMsg('delete', pricingModelLimitDs)
    );
    if (res && res.success) {
      const res1 = getResponse(await getPricingModel(settleConfigId));
      if (res1) {
        await pricingModelLimitDs.loadData(res1.priceDimensionList);
        for (const record of pricingModelLimitDs.records) {
          record.selectable = isRecordEdit(record);
        }
      }
    }
  };

  const buttons = () => {
    if (editFlag) {
      return [
        'add',
        [
          'delete',
          {
            icon: 'delete_sweep',
            onClick: handleDelete,
            children: intl.get('hzero.common.button.batchDelete').d('批量删除'),
          },
        ],
      ];
    }
  };

  const priceButtons = useMemo(() => {
    if (editFlag) {
      return ['add'];
    }
  }, [editFlag]);

  return (
    <Tabs activeKey={tabKey} animated={false} onChange={onTabChange}>
      <TabPane tab={intl.get(`${commonPrompt}.pricePoint`).d('取价时点')} key="point">
        <Table
          dataSet={pricingModelTableDs}
          buttons={priceButtons}
          columns={columns}
          pagination={false}
          customizedCode="SSTA_STRATEGY_DETAIL.PRICE_MODE_POINT"
          style={{ maxHeight: 'calc(100vh - 280px)' }}
        />
      </TabPane>
      <TabPane tab={intl.get(`${commonPrompt}.priceSever`).d('价格服务')} key="sever">
        <Table
          dataSet={pricingModelFromDs}
          columns={serviceColumns}
          pagination={false}
          customizedCode="SSTA_STRATEGY_DETAIL.PRICE_MODE_SERVICE"
        />
      </TabPane>
      <TabPane
        tab={
          <Fragment>
            {intl.get(`${commonPrompt}.priceLimit`).d('取价维度限制')}
            <Tooltip
              title={intl
                  .get(`${commonPrompt}.priceLimittTips`)
                  .d(
                    '取价时系统会默认根据公司、供应商维度进行数据分组调用，但支持结算池取价时选择多个公司/供应商结算事务'
                  )}
            >
              <Icon type="help" className="select-card-label-help" />
            </Tooltip>
          </Fragment>
        }
        key="limit"
      >
        <Table
          dataSet={pricingModelLimitDs}
          columns={limitColumns}
          pagination={false}
          selectionMode={!editFlag ? 'none' : 'rowbox'}
          buttons={buttons()}
          customizedCode="SSTA_STRATEGY_DETAIL.PRICE_MODE_DIMENSION"
          style={{ maxHeight: 'calc(100vh - 280px)' }}
        />
      </TabPane>
      <TabPane
        tab={intl
          .get(`${commonPrompt}.priceToSettleAutoFillTemplate`)
          .d('价格库转结算池自动填单模板配置')}
        key="template"
      >
        <EditorForm
          columns={2}
          useColon={false}
          editorFlag={editFlag}
          editorColumns={templateColumns}
          dataSet={priceToSettleAutoFillTemplateDs}
        />
      </TabPane>
    </Tabs>
  );
});
