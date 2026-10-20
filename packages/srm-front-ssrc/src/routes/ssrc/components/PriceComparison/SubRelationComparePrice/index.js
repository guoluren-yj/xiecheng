import React, { useMemo, useEffect, useCallback, useState, useRef } from 'react';
import { observer } from 'mobx-react';
import intl from 'utils/intl';
import { isEmpty, isArray, without } from 'lodash';
import { Modal } from 'choerodon-ui/pro';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';

import { underlineToHump } from '@/utils/utils';
import {
  fetchPriceComparisonConfigs,
  savePriceComparisonConfig,
  fetchHeaderInfo,
} from '@/services/priceComparisonService';

import DynamicConfiguration from '../DynamicConfiguration';
import ScrollTable from './components/ScrollTable';

const promptCode = 'ssrc.priceComparison';

const Index = (props) => {
  const { rfxHeaderId, itemSubRelationList = [] } = props;

  // 询价单头数据
  const headerInfoRef = useRef({});
  // 配置
  const [subItemConfig, setSubItemConfig] = useState([]);
  // 配置项-选中/所有
  const subConfigRef = useRef({
    configSelectedItems: [], // 选中
    allConfigItems: [], // 所有
  });
  const modalRef = useRef(null);

  useEffect(() => {
    initData();
  }, []);

  // 初始化数据
  const initData = useCallback(async () => {
    const headerInfo = await getResponse(fetchHeaderInfo({ rfxHeaderId }));
    headerInfoRef.current = headerInfo;
    fetchTableConfig();
  }, [rfxHeaderId]);

  // 查询配置项
  const fetchTableConfig = useCallback(() => {
    if (!rfxHeaderId) return;
    fetchPriceComparisonConfigs({
      configType: 'SUB_RELATION',
      rfxHeaderId,
    }).then((res) => {
      const configRes = { ...res };
      if (configRes && !configRes.failed) {
        if (!res.configId) {
          // 说明未操作过数据 取默认所有
          const configItemSelected = configRes.allConfigItem.split(';');
          const allConfigItemList = dealConfigList(res.allConfigItemList);
          configRes.configItemLists = allConfigItemList;
          configRes.configItemSelected = configItemSelected; // 选中的
          setSubItemConfig(configRes);
        } else {
          const configItemSelected = configRes.configItem?.split(';');
          const configItemLists = configRes.allConfigItemList
            .filter((config) => {
              return configItemSelected.includes(config.key);
            })
            .filter(Boolean);
          configRes.configItemLists = dealConfigList(configItemLists);
          configRes.configItemSelected = configItemSelected; // 选中的
          setSubItemConfig(configRes);
        }
      }
    });
  }, [rfxHeaderId]);

  /**
   * 处理配置项列表 返回对应的含税不含税字段
   * @param {Array} list - 原始配置项数据
   */
  const dealConfigList = useCallback(
    (list = []) => {
      if (isEmpty(list) || !isArray(list) || isEmpty(headerInfoRef.current)) return [];
      const { current = {} } = headerInfoRef;
      const taxIncludePriceKeyObj = judgeIsTaxIncludePrice(current.priceTypeCode);
      const { PriceAggregate, PriceMeaning } = taxIncludePriceKeyObj;
      return list
        .map((config) => {
          if (PriceAggregate.includes(config.key)) {
            return {
              ...config,
              baseInfo: `${config.meaning}${PriceMeaning}`,
              keyCode: taxIncludePriceKeyObj[config.key],
            };
          }
          return {
            ...config,
            baseInfo: config.meaning,
            keyCode: underlineToHump(config.key),
          };
        })
        .filter(Boolean);
    },
    [headerInfoRef]
  );

  /**
   * 判断含税还是未税 priceTypeCode: "TAX_INCLUDED_PRICE"
   * @param {*} value
   */
  const judgeIsTaxIncludePrice = (priceType) => {
    const priceTypeFlag = priceType === 'TAX_INCLUDED_PRICE';
    return {
      // 单价
      PRICE: priceTypeFlag ? 'quotationPrice' : 'netPrice',
      // 最近一次价格
      NEW_PRICE: priceTypeFlag ? 'newQuotationPrice' : 'newNetPrice',
      // 历史最低价
      MIN_PRICE: priceTypeFlag ? 'minQuotationPrice' : 'minNetPrice',
      // 价格key集合
      PriceAggregate: ['PRICE', 'NEW_PRICE', 'MIN_PRICE'],
      // 含税不含税多语言
      PriceMeaning: priceTypeFlag
        ? intl.get(`${promptCode}.model.comparison.subRelation.taxIncludePrice`).d('(含税)')
        : intl.get(`${promptCode}.model.comparison.subRelation.taxNetPrice`).d('(不含税)'),
    };
  };

  // 勾选或者取消配置项
  const changeSelected = useCallback(
    (checked, code) => {
      const { current } = subConfigRef;
      if (isEmpty(current)) return;
      let selectedCodes = current.configSelectedItems;
      if (checked) {
        selectedCodes = [...selectedCodes, code];
      } else {
        selectedCodes = without(selectedCodes, code);
      }
      subConfigRef.current = { ...current, configSelectedItems: selectedCodes };
      handleUpdate();
    },
    [subConfigRef]
  );

  // 获取所有配置项 传给后端用户调整后的顺序
  const getAllConfigItem = useCallback((_, list) => {
    subConfigRef.current.allConfigItems = list;
  }, []);

  // 更新配置项modal
  const handleUpdate = useCallback(() => {
    if (isEmpty(subConfigRef.current)) return;
    const { current: { configSelectedItems = [], allConfigItems = [] } = {} } = subConfigRef;
    modalRef.current.update({
      children: (
        <DynamicConfiguration
          itemConfigSelected={configSelectedItems}
          data={allConfigItems}
          changeSelected={changeSelected}
          getAllConfigItem={getAllConfigItem}
          configType="SUB_RELATION"
        />
      ),
    });
  }, [subItemConfig, subConfigRef]);

  // 展示动态配置
  const showConfigModal = useCallback(
    (configItemSelected = [], allConfigItemList) => {
      if (!subConfigRef.current) return;
      subConfigRef.current = {
        configSelectedItems: configItemSelected,
        allConfigItems: allConfigItemList,
      };

      modalRef.current = Modal.open({
        key: Modal.key(),
        title: intl.get('ssrc.priceComparison.view.title.quoteTitle').d('动态配置项'),
        children: (
          <DynamicConfiguration
            subTitle={intl.get(`${promptCode}.model.comparison.subRelation.baseInfo`).d('基本信息')}
            itemConfigSelected={configItemSelected}
            data={allConfigItemList}
            changeSelected={changeSelected}
            getAllConfigItem={getAllConfigItem}
            configType="SUB_RELATION"
          />
        ),
        onOk: () => {
          const { current: { allConfigItems = [], configSelectedItems = [] } = {} } = subConfigRef;
          savePriceComparisonConfig({
            allConfigItem: allConfigItems.map((config) => config.key).join(';'), // 顺序
            configItem: configSelectedItems.join(';'),
            rfxHeaderId,
            tenantId: getCurrentOrganizationId(),
            configId: subItemConfig.configId,
            configType: 'SUB_RELATION',
            objectVersionNumber: subItemConfig.objectVersionNumber,
          }).then((res) => {
            const response = getResponse(res);
            if (response) {
              fetchTableConfig();
            }
          });
        },
        onCancel: () => {},
      });
    },
    [subConfigRef, subItemConfig, changeSelected, getAllConfigItem, fetchTableConfig]
  );

  // 表格入参
  const scrollTableProps = useMemo(() => {
    return {
      ...props,
      itemSubRelationList,
      subItemConfig,
      showConfigModal,
    };
  }, [props, itemSubRelationList, subItemConfig, showConfigModal]);

  return (
    !isEmpty(itemSubRelationList) &&
    itemSubRelationList.map((itemGroup, index) => (
      <ScrollTable
        key={itemGroup.subRelationId}
        indexKey={index + 1}
        itemGroupData={itemGroup}
        {...scrollTableProps}
      />
    ))
  );
};

export default observer(Index);
