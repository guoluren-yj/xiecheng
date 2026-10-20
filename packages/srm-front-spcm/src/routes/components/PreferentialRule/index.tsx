/*
 * @Description:优惠规则-折扣/返利
 * @Date: 2023-03-15 09:45:02
 * @Author: MYT<yitian.mao@going-link.com>
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */
import React, { useCallback, useMemo } from 'react';
import { Table, Modal, useDataSet } from 'choerodon-ui/pro';
import { TableButtonType } from 'choerodon-ui/pro/lib/table/enum';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import type DataSet from 'choerodon-ui/pro/lib/data-set/DataSet';
import type { TableButtonProps, ColumnProps } from 'choerodon-ui/pro/lib/table/interface';
import formatterCollections from 'utils/intl/formatterCollections';
import { isFunction } from 'lodash';
// @ts-ignore
import RebateCreate from 'srm-front-spfp/lib/routes/RuleMaintenance/Rebate/Create/index';
// @ts-ignore
import DiscountCreate from 'srm-front-spfp/lib/routes/RuleMaintenance/Discount/Create/index';

import { getPreferLabel } from '@/utils/util';
import { tableDS } from './indexDS';
// import Create from './Create';
import styles from './index.less';

export interface StoreValueType {
  ruleListDs: DataSet,
  history,
  // handleToDetail,
  customizeTable,
  editable,
  type: string, // 这个标识主要区别是折扣(discount)还是返利(rebate)
  majorPcNum: string,
  isH0Type: Boolean, // 这个标识主要用来区别是h0还是c7n，不想写两套所以用开关来控制样式。
  changeFlag: Boolean, // 开启这个标识有效期和固定/阶梯表格，适用范围，累计维度可以编辑。
  headerInfo: any,
};

const PreferentialRule = (props: StoreValueType) => {

  const { history, customizeTable, editable, type, majorPcNum, isH0Type, changeFlag, headerInfo } = props;
  const isRebate = type === 'rebate';
  const ruleListDs = useDataSet(() => tableDS({ majorPcNum, editable, isRebate }), []);
  const CreateComponent = isRebate ? RebateCreate : DiscountCreate;

  const columns: ColumnProps[] = useMemo(
    () =>
      [
        {
          name: 'ruleNum',
          width: 150,
          renderer: ({ record, value }) => (
            <a onClick={() => handleRuleDetail(record)}>{value}</a>
          ),
        },
        {
          name: 'ruleName',
          width: 300,
        },
        {
          name: 'scenarioName',
          width: 200,
        },
        {
          name: 'date',
          width: 300,
        },
      ],
    []);

  const handleRuleDetail = useCallback((record) => {
    const { ruleId, step } = record.get(['ruleId', 'step']);
    const initData = isFunction(headerInfo) ? headerInfo() : headerInfo;
    const modalProps = {
      [type === 'rebate' ? 'rebateLineDs' : 'discountLineDs']: ruleListDs,
      majorPcNum,
      history,
      ruleId,
      defaultCurrentStep: editable ? step : 'END',
      editable,
      headerInfo: initData,
      changeFlag,
    };
    Modal.open({
      drawer: true,
      closable: true,
      style: {
        width: 1090,
      },
      title: getPreferLabel(isRebate, changeFlag ? 'change' : editable ? 'edit' : 'detail'),
      className: styles['spcm-large-modal'],
      children: <CreateComponent
        {...modalProps}
      />,
      footer: null,
    });
  }, [ruleListDs, history, editable, type, majorPcNum, headerInfo, changeFlag, isRebate]);

  const handleAdd = () => {
    const initData = isFunction(headerInfo) ? headerInfo() : headerInfo;
    const modalProps = {
      [type === 'rebate' ? 'rebateLineDs' : 'discountLineDs']: ruleListDs,
      majorPcNum,
      editable,
      headerInfo: initData,
    };
    Modal.open({
      drawer: true,
      style: {
        width: 1090,
      },
      title: getPreferLabel(isRebate, 'create'),
      className: styles['spcm-large-modal'],
      children: <CreateComponent {...modalProps} />,
      footer: null,
    });
  };

  const buttons = (): [TableButtonType, TableButtonProps][] => {
    if (editable && isH0Type) {
      return [
        [TableButtonType.delete, { funcType: FuncType.raised, color: ButtonColor.default, icon: '' }],
        [TableButtonType.add, { onClick: handleAdd, funcType: FuncType.raised, icon: '' }],
      ];
    } else if (editable) {
      return [
        [TableButtonType.add, { onClick: handleAdd }],
        [TableButtonType.delete, {}],
      ];
    } else {
      return [];
    }
  };

  return (
    <Table
      className={isH0Type && styles['spcm-rule-list']}
      dataSet={ruleListDs}
      columns={columns}
      buttons={buttons()}
    />
  );
};

export default formatterCollections({ code: ['spfp.ruleMaintenance', 'spfp.common', 'hzero.common'] })(PreferentialRule);
