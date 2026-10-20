import React, { memo, useMemo, useState, useEffect } from 'react';
import { DataSet, Table, Select, Spin } from 'choerodon-ui/pro';
import { toJS } from 'mobx';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';

import Card from '@/components/Card';
import FormPro from '@/components/FormPro';
import {
  fetchSaveDimension,
  fetchDimension,
  fetchHasDimension,
} from '@/services/PurchaseManageNewService';
import Sort from '../component/Sort';
import { dimensionDS, elmDS, baseConfigDS } from './ds';

import style from './index.less';

const { Option } = Select;

export default memo(props => {
  // BUSINESS_UNIT - 业务组织 UNIT - 组织架构 PUR_ORGANIZATION - 采购组织
  const {
    modal,
    tenantExist,
    baseConfig: { sourceType, level = '' },
    query = e => e,
  } = props;
  const [loading, setLoading] = useState(false);

  const baseConfigDs = useMemo(() => new DataSet(baseConfigDS()), []);
  const dimensionDs = useMemo(() => new DataSet(dimensionDS(tenantExist)), []);
  const elmDs = useMemo(() => new DataSet(elmDS()), []);
  useEffect(() => {
    initConfig();
  }, []);

  useEffect(() => {
    modal.handleOk(() => {
      return handleSave();
    });
  }, [loading]);

  const handleSave = async () => {
    const flag = await dimensionDs.validate();
    if (flag) {
      const saveEleData = elmDs.filter(f => f.get('orderSeq')).map(m => m.toData());
      setLoading(true);
      const res = await fetchSaveDimension({
        unitDimensionList: dimensionDs.filter(m => m.dirty).map(m => m.toData()),
        unitShowList: saveEleData,
      });
      if (getResponse(res)) {
        setLoading(false);
        notification.success();
        // tableDs.query(tableDs.currentPage);
        query();
        return true;
      }
      setLoading(false);
      notification.error({ message: res.message });
      return false;
    }
    return false;
  };

  const getConfigStr = () => {
    const sourceTypeMap = {
      BUSINESS_UNIT: intl.get('sagm.purchaseManageNew.view.sourceType.businessUnit').d('业务组织'),
      UNIT: intl.get('sagm.purchaseManageNew.view.sourceType.HrUnit').d('HR组织'),
      PUR_ORGANIZATION: intl.get('sagm.purchaseManageNew.model.purchaseUnit').d('采购组织'),
    };
    const levelMap = {
      COMPANY: intl.get('sagm.common.model.company').d('公司'),
      OU: intl.get('sagm.common.view.ou').d('业务实体'),
      INV_ORGANIZATION: intl.get('sagm.common.model.inventory.organization').d('库存组织'),
    };
    const _level = level ? ` - ${levelMap[level]}` : '';
    return `${sourceTypeMap[sourceType]}${_level}`;
  };

  const initConfig = async () => {
    const codeArr = ['COMPANY_NAME', 'BUSINESS_ENTITY_NAME', 'INVENTORY_ORGANIZATION_NAME'];
    // 请求维度 和 需 展示的元素
    setLoading(true);
    const res = await fetchDimension();
    if (getResponse(res)) {
      const { unitDimensionList = [], unitShowList } = res || {};
      const data = unitDimensionList.map((m, idx) => {
        // 公司维度是下拉
        if ('unitDimensionList' in m) {
          return {
            dimensionCode: 'COMPANY',
            orderSeq: idx + 1,
            unitDimensionList: m.unitDimensionList || [],
          };
        }
        return { ...m, orderSeq: idx + 1 };
      });
      // 获取自定义维度字符串
      const customStr = data
        .filter(i => i.dimensionType === 'CUSTOM')
        .map(m => m.customDimensionName)
        .join('、');
      const baseData = {
        orgSource: getConfigStr(),
        customDimension: customStr,
      };
      baseConfigDs.loadData([baseData]);

      // 请求已配置数据
      const saveData = await fetchHasDimension();
      setLoading(false);
      if (getResponse(saveData)) {
        const { unitDimensionList: dimensionData = [], unitShowList: showData = [] } =
          saveData || {};
        //  没有维护过数据
        if (dimensionData.length === 0) {
          data.forEach(i => {
            dimensionDs.create(i);
          });
        }
        if (dimensionData.length > 0) {
          // 公司维度
          const companyInitValue =
            dimensionData.find(f =>
              ['COMPANY', 'BUSINESS_ENTITY', 'INVENTORY_ORGANIZATION'].includes(f.dimensionCode)
            ) || {};
          data.forEach(i => {
            if ('unitDimensionList' in i) {
              dimensionDs.create({
                ...i,
                ...companyInitValue,
              });
            } else {
              dimensionDs.create({
                ...i,
                ...(dimensionData.find(f => f.dimensionCode === i.dimensionCode) || {}),
              });
            }
          });
        }
        const companyDimensionValue = dimensionDs
          .find(f => f.get('unitDimensionList'))
          ?.get('dimensionCode');
        if (showData.length > 0) {
          const initData =
            unitShowList.map(m => {
              if ('unitShowList' in m) {
                return (
                  {
                    ...m,
                    ...m.unitShowList.find(f => f.elementCode.includes(companyDimensionValue)), // 为维护该值， 取公司配置下的对应元素
                    orderSeq: 0, //  未维护该值，给默认值
                    ...showData.find(f => codeArr.includes(f.elementCode)), // 维护值了, 找到对应元素
                  } || {}
                );
              }
              return {
                ...m,
                orderSeq: m.orderSeq || 0,
                ...(showData.find(f => f.elementCode === m.elementCode) || {}),
              };
            }) || [];
          elmDs.loadData(initData);
        }
        if (showData.length === 0) {
          elmDs.loadData(
            unitShowList.map(m => {
              if ('unitShowList' in m) {
                return {
                  ...m,
                  ...m.unitShowList.find(f => f.elementCode.includes(companyDimensionValue)),
                  orderSeq: 0,
                };
              }
              return { ...m, orderSeq: 0 };
            })
          );
        }
      }
    }
  };

  const dimensionDColumns = useMemo(
    () => [
      {
        name: 'dimensionCode',
        title: intl.get('sagm.purchaseManageNew.model.dimensionName').d('维度名称'),
        width: 170,
        renderer: ({ record, value }) => {
          const { dimensionCodeMeaning, customDimensionName } = record.get([
            'dimensionCodeMeaning',
            'customDimensionName',
          ]);
          const unitDimensionList = record.get('unitDimensionList') || [];
          // COMPANY ||  BUSINESS_ENTITY || INVENTORY_ORGANIZATION （公司、业务实体、库存组织）
          return unitDimensionList.length > 0 && !tenantExist ? (
            <Select
              value={value}
              disabled={tenantExist}
              placeholder={intl.get('sagm.common.view.pleaseChoose').d('请选择')}
              onChange={val => handleCompanyChange(val, record)}
            >
              {unitDimensionList.map(m => (
                <Option value={m.dimensionCode}>{m.dimensionCodeMeaning}</Option>
              ))}
            </Select>
          ) : (
            customDimensionName || dimensionCodeMeaning
          );
        },
      },
      {
        name: 'showFlag',
        width: 140,
        editor: true,
      },
      {
        name: 'editFlag',
        width: 140,
        editor: true,
      },
      {
        name: 'orderSeq',
        width: 170,
        editor: true,
      },
    ],
    [tenantExist]
  );

  const handleCompanyChange = (val, record) => {
    record.set('dimensionCode', val);
    // 切换公司，除公司还有其他元素显示，公司元素置0， 比之大的减一
    // 记录切换前元素
    const oldElem = elmDs.toData();
    // 找到公司元素
    const companyEleRecord = elmDs.find(r => r.get('unitShowList'));
    const unitShowList = toJS(companyEleRecord.get('unitShowList'));
    const companyOrderSeq = companyEleRecord.get('orderSeq');
    const onlyCompanyElm =
      oldElem.filter(f => !f.unitShowList && f.orderSeq).length === 0 && companyOrderSeq;
    const newElem = oldElem.map(m => {
      if ('unitShowList' in m) {
        return {
          ...m,
          ...unitShowList.find(f => f.elementCode.includes(val)),
          orderSeq: onlyCompanyElm ? companyOrderSeq : 0,
          unitShowList,
        };
      }
      if (companyOrderSeq && m.orderSeq > companyOrderSeq) {
        return { ...m, orderSeq: m.orderSeq - 1 };
      }
      return m;
    });
    elmDs.loadData(newElem);
  };

  return (
    <Spin spinning={loading}>
      <Card title={intl.get('sagm.purchaseManageNew.view.card.initialConfig').d('初始配置')}>
        <FormPro
          readOnly
          dataSet={baseConfigDs}
          columns={3}
          fields={[
            { name: 'orgSource' },
            {
              name: 'customDimension',
              colSpan: 2,
              show: ({ record }) => record && record.get('customDimension'),
            },
          ]}
        />
      </Card>
      <Card title={intl.get('sagm.purchaseManageNew.view.card.dimensionConfigure').d('维度配置')}>
        <p className={style['dimension-table-title']}>
          {intl
            .get('sagm.purchaseManageNew.view.card.dimensionCfgInfo')
            .d('可对主站采买身份选择的维度是否显示、是否可编辑以及维度顺序进行配置')}
        </p>
        <Table
          dataSet={dimensionDs}
          columns={dimensionDColumns}
          className={style['dimension-table']}
        />
      </Card>
      <Card
        title={intl.get('sagm.purchaseManageNew.view.card.viewConfigure').d('显示配置')}
        cardBodyStyle={{ paddingTop: 8 }}
      >
        <Sort dimensionDs={dimensionDs} elmDs={elmDs} />
      </Card>
    </Spin>
  );
});
