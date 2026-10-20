/**
 * 副标题
 */
import React, { useContext, memo, Fragment } from 'react';
import { Tag } from 'choerodon-ui';
import { Tooltip } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';

import { numberSeparatorRender } from '@/utils/renderer';
import { getCheckPriceName } from '@/utils/globalVariable';

import { getComputedTagStyle } from '../utils/utils';
import { PrefixCls } from '../utils/constant';
import { StoreContext } from '../store/StoreProvider';
import styles from '../index.less';

const promptCode = 'ssrc.inquiryHall';

const SubTitle = observer((props) => {
  const {
    commonDs: { headerDs, shareDs },
    remote,
  } = useContext(StoreContext);
  const { renderHeaderButton, bidFlag, sectionFlag } = props;
  const { current } = headerDs;
  const { rfxNum, rfxTitle, sourceCategoryMeaning, secondarySourceCategoryMeaning } =
    (current &&
      current.get([
        'rfxNum',
        'rfxTitle',
        'companyName',
        'benchmarkPriceType',
        'sourceCategoryMeaning',
        'secondarySourceCategoryMeaning',
      ])) ||
    {};
  const totalPrice = shareDs.getState('totalPrice');
  return (
    <div className={styles[`${PrefixCls}-sub-title-content`]}>
      {sectionFlag ? (
        <Fragment>
          <div>
            <h4>
              <div style={{ display: 'flex' }}>
                <span className={styles[`${PrefixCls}-sub-title-rfx-title`]}>
                  <Tooltip title={`${rfxNum ?? ''}-${rfxTitle ?? ''}`} placement="topLeft">
                    {`${rfxNum ?? ''}-${rfxTitle ?? ''}`}
                  </Tooltip>{' '}
                </span>
                <Tag style={getComputedTagStyle('itemCategoryName')}>
                  {secondarySourceCategoryMeaning || sourceCategoryMeaning}
                </Tag>
              </div>
            </h4>
            <span className={styles[`${PrefixCls}-sub-title-content-form-item`]}>
              <span>
                {intl
                  .get(`${promptCode}.model.inquiryHall.commonTotalPrice`, {
                    checkPriceName: getCheckPriceName(bidFlag),
                  })
                  .d('{checkPriceName}总金额')}
              </span>
              <span className={styles[`${PrefixCls}-sub-title-content-form-item-price`]}>
                {numberSeparatorRender(totalPrice) ?? '-'}
              </span>
            </span>
            {/* <span className={styles[`${PrefixCls}-sub-title-content-form-item-section`]}>
              <span>{intl.get(`${promptCode}.model.inquiryHall.company`).d('公司')}</span>
              <span className={styles[`${PrefixCls}-sub-title-content-form-item-company`]}>
                {companyName ?? '-'}
              </span>
            </span> */}
          </div>
          <div className={styles[`button-groups`]}>{renderHeaderButton()}</div>
        </Fragment>
      ) : (
        <Fragment>
          <h4>
            <div style={{ display: 'flex' }}>
              <span className={styles[`${PrefixCls}-sub-title-rfx-title`]}>
                <Tooltip title={`${rfxNum ?? ''}-${rfxTitle ?? ''}`} placement="topLeft">
                  {`${rfxNum ?? ''}-${rfxTitle ?? ''}`}
                </Tooltip>{' '}
              </span>
              <Tag style={getComputedTagStyle('itemCategoryName')}>
                {secondarySourceCategoryMeaning || sourceCategoryMeaning}
              </Tag>
            </div>
          </h4>
          <div className={styles[`${PrefixCls}-sub-title-content-form`]}>
            {remote
            ? remote.render('SSRC_CHECK_PRICE_NEW_C7N_RENDER_SUB_TITLE_RIGHT_NODE', null, { headerDs, PrefixCls, styles, bidFlag })
            : null}
            <span className={styles[`${PrefixCls}-sub-title-content-form-item`]}>
              <span>
                {intl
                  .get(`${promptCode}.model.inquiryHall.commonTotalPrice`, {
                    checkPriceName: getCheckPriceName(bidFlag),
                  })
                  .d('{checkPriceName}总金额')}
              </span>
              <span className={styles[`${PrefixCls}-sub-title-content-form-item-price`]}>
                {numberSeparatorRender(totalPrice) ?? '-'}
              </span>
            </span>
            {/* <span className={styles[`${PrefixCls}-sub-title-content-form-item`]}>
              <span>{intl.get(`${promptCode}.model.inquiryHall.company`).d('公司')}</span>
              <span className={styles[`${PrefixCls}-sub-title-content-form-item-company`]}>
                {companyName ?? '-'}
              </span>
            </span> */}
          </div>
        </Fragment>
      )}
    </div>
  );
});

export default memo(SubTitle);
