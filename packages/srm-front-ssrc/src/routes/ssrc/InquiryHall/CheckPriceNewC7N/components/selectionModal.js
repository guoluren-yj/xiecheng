import React, { Fragment, useEffect, useState } from 'react';
import { Button } from 'choerodon-ui/pro';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';

import { ReactComponent as HighIcon } from '@/assets/highestPrice.svg';
import { ReactComponent as PackAll } from '@/assets/packAll.svg';
import { ReactComponent as ItemDemesion } from '@/assets/itemDemesion.svg';
import { ReactComponent as SocreFirst } from '@/assets/socreFirst.svg';
import { ReactComponent as LowestPrice } from '@/assets/lowestPrice.svg';

import RadioButtonCom from './RadioButton';
import { saveMemo } from '../utils/utils';

const promptCode = 'ssrc.inquiryHall';

const helpSessionMap = () => ({
  MAX_PRICE_WIN: {
    ITEM: intl
      .get(`${promptCode}.model.inquiryHall.selectionStrategyHighItem`)
      .d('已为您自动推荐每个物料最高价的供应商, 可以手工修改中标信息'),
    ALL: intl
      .get(`${promptCode}.model.inquiryHall.selectionStrategyHighAll`)
      .d('已为您自动推荐报价总金额最高的供应商, 可以手工修改中标信息'),
  },
  MIN_PRICE_WIN: {
    ITEM: intl
      .get(`${promptCode}.model.inquiryHall.selectionStrategyLowItem`)
      .d('已为您自动推荐每个物料最低价的供应商, 可以手工修改中标信息'),
    ALL: intl
      .get(`${promptCode}.model.inquiryHall.selectionStrategyLowAll`)
      .d('已为您自动推荐报价总金额最低的供应商, 可以手工修改中标信息'),
  },
  FIRST_SCORE_WIN: {
    ITEM: intl
      .get(`${promptCode}.model.inquiryHall.selectionStrategyScore`)
      .d('已为您自动推荐评分第一的供应商，可手工修改中标信息'),
    ALL: intl
      .get(`${promptCode}.model.inquiryHall.selectionStrategyScore`)
      .d('已为您自动推荐评分第一的供应商，可手工修改中标信息'),
  },
  undefined: {},
});

const SelectionModal = (props) => {
  const {
    headerDs,
    shareDs,
    changeStrategyVisible,
    handleSave,
    setInitFlag: setConfigInitFlag,
    rfxHeaderId,
    criteriaConfig,
    dimensionConfig,
    defaultCriteria,
    defaultDimension,
    checkSelectionDimension: demension,
    setSaveOrSubmitLoading,
  } = props || {};

  const {
    checkRecommendationStrategy,
    auctionDirection,
    onlyAllowAllWinBids,
    expertScoreType,
    quotationScope,
    quantityChangeFlag,
  } =
    headerDs.current?.get([
      'checkRecommendationStrategy',
      'auctionDirection',
      'onlyAllowAllWinBids',
      'expertScoreType',
      'quotationScope',
      'quantityChangeFlag',
    ]) || {};

  const [initFlag, setInitFlag] = useState(false);

  // 取消回调
  const handleCancel = () => {
    // 关闭弹框
    changeStrategyVisible();
  };

  // 确认回调
  const handleOk = () => {
    setSaveOrSubmitLoading(true);
    // 关闭弹框
    changeStrategyVisible();
    // 弹框内的选用策略和选用标准
    const checkSelectionDimension = shareDs.current.get('checkSelectionDimension');
    const checkRecommendationStrategyDetail = shareDs.current.get(
      'checkRecommendationStrategyDetail'
    );
    // shareDs.state是外部选用策略和选用标准
    shareDs.setState('checkSelectionDimension', checkSelectionDimension);
    shareDs.setState('checkRecommendationStrategyDetail', checkRecommendationStrategyDetail);
    // 保存用户记忆
    saveMemo({
      lastMemoObj: shareDs.getState('userMemo'),
      value: checkSelectionDimension,
      key: `${rfxHeaderId}checkSelectionDimension`,
    });
    saveMemo({
      lastMemoObj: shareDs.getState('userMemo'),
      value: checkRecommendationStrategyDetail,
      key: `${rfxHeaderId}checkRecommendationStrategyDetail`,
    });
    saveMemo({
      lastMemoObj: shareDs.getState('userMemo'),
      value: checkSelectionDimension,
      key: `${rfxHeaderId}checkPriceSelectionDimension`,
    });
    // 调用推荐策略保存并执行重新查询
    return handleSave('saveAutoData', true);
  };

  // 点击标准按钮回调
  const onChangeCriteria = (value) => {
    shareDs.current.set('checkRecommendationStrategyDetail', value);
  };

  // 点击策略按钮回调
  const onChangeDimension = (value) => {
    shareDs.current.set('checkSelectionDimension', value);
  };

  // 标准选用标准
  const getStdCriteriaConfig = () => {
    return [
      auctionDirection === 'FORWARD' && {
        name: 'maxPriceWin',
        value: 'MAX_PRICE_WIN',
        meaning: intl.get('ssrc.inquiryHall.model.inquiryHall.maxPrice').d('最高价'),
        icon: <HighIcon />,
      },
      auctionDirection !== 'FORWARD' && {
        name: 'minPriceWin',
        value: 'MIN_PRICE_WIN',
        meaning: intl.get('ssrc.inquiryHall.model.inquiryHall.minPrice').d('最低价'),
        icon: <LowestPrice />,
      },
      expertScoreType !== 'NONE' && {
        name: 'firstScoreWin',
        value: 'FIRST_SCORE_WIN',
        meaning: intl.get('ssrc.inquiryHall.model.inquiryHall.scoreFirst').d('评分优先'),
        icon: <SocreFirst />,
      },
    ].filter(Boolean);
  };

  // 标准选用策略
  const getStdDimensionConfig = () => {
    return [
      !onlyAllowAllWinBids && {
        name: 'item',
        value: 'ITEM',
        meaning: intl.get(`${promptCode}.model.inquiryHall.materialDimension`).d('物料维度'),
        icon: <ItemDemesion />,
      },
      ((quotationScope === 'ALL_QUOTATION' && !quantityChangeFlag) || onlyAllowAllWinBids) && {
        name: 'all',
        value: 'ALL',
        meaning: intl.get(`${promptCode}.model.inquiryHall.wholeSingleDimension`).d('整单维度'),
        icon: <PackAll />,
      },
    ];
  };

  useEffect(() => {
    // 先查用户记忆
    if (shareDs.getState('checkSelectionDimension')) {
      defaultDimension.current = shareDs.getState('checkSelectionDimension');
    } else {
      // // 否则走标准逻辑
      // const stdDimensionConfigkeys = getStdDimensionConfig().map((item) => item.name);
      // if (defaultDimension.current && stdDimensionConfigkeys.includes(defaultDimension.current)) {
      //   return;
      // } else if (onlyAllowAllWinBids) {
      //   defaultDimension.current = 'ALL';
      // } else {
      //   defaultDimension.current = 'ITEM';
      // }
      defaultDimension.current = demension;
    }
    // 策略赋值
    shareDs.current.set('checkSelectionDimension', defaultDimension.current);

    // 先查用户记忆
    if (shareDs.getState('checkRecommendationStrategyDetail')) {
      defaultCriteria.current = shareDs.getState('checkRecommendationStrategyDetail');
    } else {
      // 否则走标准逻辑
      const stdCriteriaConfigKeys = getStdCriteriaConfig().map((item) => item.name);
      if (defaultCriteria.current && stdCriteriaConfigKeys.includes(defaultCriteria.current)) {
        return;
      } else if (checkRecommendationStrategy === 'SCORE') {
        defaultCriteria.current = 'FIRST_SCORE_WIN';
      } else if (auctionDirection === 'FORWARD') {
        defaultCriteria.current = 'MAX_PRICE_WIN';
      } else {
        defaultCriteria.current = 'MIN_PRICE_WIN';
      }
    }

    // 标准赋值
    shareDs.current.set('checkRecommendationStrategyDetail', defaultCriteria.current);

    setInitFlag(true);
    setConfigInitFlag(true);
  }, []);

  return (
    initFlag && (
      <Fragment>
        <div style={{ lineHeight: '16px' }}>
          <div className="title">
            {intl.get(`${promptCode}.model.inquiryHall.selectionStrategy`).d('选用策略')}
          </div>
          <div className="title-info">
            {
              helpSessionMap()[shareDs.current?.get('checkRecommendationStrategyDetail')][
                shareDs.current?.get('checkSelectionDimension')
              ]
            }
          </div>
        </div>
        <div>
          <div className="info">
            {intl.get(`${promptCode}.model.template.selectedStandard`).d('选用标准')}
          </div>
          <RadioButtonCom
            onChange={onChangeCriteria}
            defaultActive={defaultCriteria.current}
            stdConfig={getStdCriteriaConfig()}
            custConfig={criteriaConfig.current}
            shareDs={shareDs}
          />
        </div>
        <div>
          <div className="info">
            {intl.get(`${promptCode}.model.template.selectedDimension`).d('选用维度')}
          </div>
          <RadioButtonCom
            onChange={onChangeDimension}
            defaultActive={defaultDimension.current}
            stdConfig={getStdDimensionConfig()}
            custConfig={dimensionConfig.current}
            shareDs={shareDs}
          />
        </div>
        <div className="onOk">
          <Button
            color="primary"
            onClick={handleOk}
            wait={1000}
            waitType="throttle"
            style={{ fontSize: '12px' }}
          >
            <span className="text">{intl.get('hzero.common.button.ok').d('确定')}</span>
          </Button>
        </div>
        <div className="onCancle">
          <Button onClick={handleCancel} color="default" style={{ fontSize: '12px' }}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
        </div>
      </Fragment>
    )
  );
};

export default withCustomize({
  unitCode: [
    'SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.SELECT_DIMENSION',
    'SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.SELECT_DIMENSION',
    'SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.SELECTIONCRITERIA',
    'SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.SELECTIONCRITERIA',
  ],
})(observer(SelectionModal));
