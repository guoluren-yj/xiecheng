import { omit } from 'lodash';
import classNames from 'classnames';
import React, { useState, useMemo, useEffect } from 'react';
import { DataSet, Table, Spin } from 'choerodon-ui/pro';

import { getResponse } from 'utils/utils';
import intl from 'utils/intl';

import GeneralForm from '@/routes/components/GeneralForm';
import { queryQuotaHistory } from '@/services/outsideProjectSetupService';
import { historyColumns } from './utils';
import './index.less';

const TabsChildren = ({
  extSourceReqId,
  supplierCompanyId,
  versionNumber = 0,
  activeTab = 'supplier',
}) => {
  const [activeKey, setActiveKey] = useState(versionNumber);
  const [loading, setLoading] = useState(false);
  const { supplierInfo, itemInfo, lineColumns } = historyColumns();

  const formDs = useMemo(
    () =>
      new DataSet({
        fields: activeTab === 'supplier' ? supplierInfo : itemInfo,
      }),
    []
  );
  const tableDs = useMemo(
    () =>
      new DataSet({
        paging: false,
        selection: false,
        fields: lineColumns,
      }),
    []
  );

  // 生成版本号数组
  const resultArr = Array.from({ length: versionNumber }, (_, i) => versionNumber - i);

  useEffect(() => {
    if (extSourceReqId) {
      query();
    }
  }, [versionNumber, extSourceReqId, supplierCompanyId]);

  /**
   * 切换
   * @param {*} num
   * @returns {string}
   */
  const onChange = key => {
    setActiveKey(key);
    query(key);
  };

  /**
   * 查询
   * @param {*} num
   * @returns {string}
   */
  const query = num => {
    setLoading(true);
    queryQuotaHistory({ versionNumber: num || versionNumber, extSourceReqId, supplierCompanyId })
      .then(res => {
        if (getResponse(res)) {
          const { itemQuatoInfos, ...others } = res || {};
          formDs.loadData([others]);
          tableDs.loadData(itemQuatoInfos);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  /**
   * 将阿拉伯数字转换为中文数字
   * @param {*} num
   * @returns {string}
   */
  const arabicToChinese = num => {
    let result = '';

    let groupIndex = 0;

    const units = ['', '十', '百', '千'];

    const bigUnits = ['', '万', '亿', '万亿'];

    const chineseNumbers = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

    let numStr = num?.toString();

    while (numStr?.length > 0) {
      const group = numStr?.slice(-4);

      numStr = numStr?.slice(0, -4);

      let groupResult = '';

      let zeroFlag = false;

      for (let i = 0; i < group?.length; i++) {
        const digit = parseInt(group[i], 10);

        if (digit === 0) {
          zeroFlag = true;
        } else {
          if (zeroFlag) {
            groupResult += chineseNumbers[0];

            zeroFlag = false;
          }

          groupResult += chineseNumbers[digit] + units[group?.length - i - 1];
        }
      }

      if (groupResult) {
        result = groupResult?.replace(/零+$/, '') + bigUnits[groupIndex] + result;
      } else if (result && groupIndex > 0) {
        result = chineseNumbers[0] + result;
      }

      groupIndex++;
    }

    result = result?.replace(/零+/g, '零').replace(/零$/, '');

    if (result === '') {
      const [zero] = chineseNumbers;

      result = zero;
    }

    return result;
  };

  const formFields = useMemo(() => (activeTab === 'supplier' ? supplierInfo : itemInfo), [
    activeTab,
  ]);

  const formProps = {
    isEdit: false,
    dataSet: formDs,
    fields: formFields.map(field => omit(field, ['label'])),
  };

  return (
    <Spin spinning={loading}>
      <div className="layout-container">
        {/* 左侧tab */}
        <div className="left-panel">
          <ul>
            {(resultArr || [])?.map(item => {
              const number = arabicToChinese(item);
              return (
                <li
                  key={item}
                  className={classNames(activeKey === item ? 'active' : null)}
                  onClick={() => onChange(item)}
                >
                  {intl
                    .get('sslm.outsideProjectSetup.modal.numberHistory', {
                      number: intl
                        .get(`sslm.outsideProjectSetup.model.numberHistory.${item}`)
                        .d(`${number}`),
                    })
                    .d(`第${number}轮报价`)}
                </li>
              );
            })}
          </ul>
        </div>
        {/* 右侧内容区域 */}
        <div className="right-panel">
          <GeneralForm {...formProps} />
          <div style={{ marginTop: '20px' }}>
            <Table
              virtual
              virtualCell
              dataSet={tableDs}
              columns={lineColumns}
              customizedCode="SSLM_OUTSIEDPROJECTSETUP_DETAIL.SUPPLIER_ITEM_TABLE_HISTORY"
            />
          </div>
        </div>
      </div>
    </Spin>
  );
};

export default TabsChildren;
