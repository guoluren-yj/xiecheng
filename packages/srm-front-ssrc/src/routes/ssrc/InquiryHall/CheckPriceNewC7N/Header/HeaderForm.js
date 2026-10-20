/*
 * @Descripttion: xxxx管理信息--Index
 * @version:
 * @Author: yiping.liu<yiping.liu@going-link.com>
 * @Date: 2023-10-23 09:08:46
 * @LastEditors: yiping.liu
 */
/**
 * 核价信息头表单
 */
import React, { memo, useContext, useMemo } from 'react';
import { TextField, TextArea, Output } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { noop, isNil } from 'lodash';

import { yesOrNoRender } from 'utils/renderer';
import CollapseForm from '_components/CollapseForm';

import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';
import styles from '../index.less';
import { PrefixCls } from '../utils/constant';
import { StoreContext } from '../store/StoreProvider';

const Header = observer(() => {
  const {
    bidFlag,
    detailFlag,
    commonDs: { headerDs, shareDs },
    customizeCollapseForm = noop,
  } = useContext(StoreContext);

  const { current } = headerDs;
  const FormItem = useMemo(() => {
    return detailFlag
      ? [
        <Output name="budgetAmount" />,
        <C7nPrecisionInputNumber name="savingAmount" record={current} financial="currencyCode" />,
        <Output
          name="savingRatio"
          renderer={({ value }) => (!isNil(value) ? `${value}%` : '-')}
        />,
        <C7nPrecisionInputNumber
          name="maxSuggestedAmount"
          record={current}
          financial="currencyCode"
        />,
        <C7nPrecisionInputNumber
          name="minSuggestedAmount"
          record={current}
          financial="currencyCode"
        />,
        <Output name="currencyCode" />,
        <Output
          name="checkRecommendationFlag"
          renderer={() => yesOrNoRender(shareDs.getState('checkRecommendationFlag'))}
        />,
        <Output newLine name="checkRemark" colSpan={2} resize="both" autoSize={{ minRows: 3 }} />,
        ]
      : [
        <TextField name="budgetAmount" />,
        <C7nPrecisionInputNumber name="savingAmount" record={current} financial="currencyCode" />,
        <TextField
          name="savingRatio"
          renderer={({ value }) => (!isNil(value) ? `${value}%` : '')}
        />,
        <C7nPrecisionInputNumber
          name="maxSuggestedAmount"
          record={current}
          financial="currencyCode"
        />,
        <C7nPrecisionInputNumber
          name="minSuggestedAmount"
          record={current}
          financial="currencyCode"
        />,
        <TextField name="currencyCode" />,
        <TextField
          name="checkRecommendationFlag"
          editor={false}
          renderer={() => yesOrNoRender(shareDs.getState('checkRecommendationFlag'))}
        />,
          // <TextField name="checkItemReleaseFlag" />,
        <TextArea
          newLine
          name="checkRemark"
          colSpan={2}
          resize="both"
          autoSize={{ minRows: 3 }}
        />,
        ];
  }, []);

  return (
    <div className={styles[`${PrefixCls}-header-form-container`]}>
      {customizeCollapseForm(
        {
          code: bidFlag
            ? 'SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.BASE_INFO'
            : 'SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.BASE_INFO',
          dataSet: headerDs,
          showLines: 2,
          readOnly: detailFlag,
          labelLayout: detailFlag ? 'vertical' : 'float',
        },
        <CollapseForm
          dataSet={headerDs}
          columns={3}
          labelLayout={detailFlag ? 'vertical' : 'float'}
          showLines={2}
          useWidthPercent
          className={detailFlag ? 'c7n-pro-vertical-form-display' : ''}
        >
          {FormItem.map((item) => item)}
        </CollapseForm>
      )}
    </div>
  );
});

export default memo(Header);
