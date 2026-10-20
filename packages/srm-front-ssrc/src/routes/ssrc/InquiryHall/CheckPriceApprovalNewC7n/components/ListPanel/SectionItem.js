import React, { useCallback } from 'react';
import { observer } from 'mobx-react';
import { useComputed } from 'mobx-react-lite';
import { Icon, Tooltip } from 'choerodon-ui/pro';
import { isNil } from 'lodash';
import classnames from 'classnames';
import intl from 'utils/intl';
import SVGIcon from '@/routes/components/SvgIcon';
import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';
import { numberSeparatorRender } from '@/utils/renderer';
import styles from './index.less';

const SectionItem = (props = {}) => {
  const {
    data = {},
    afterClick = () => {},
    sourceId = '',
    viewType = 'supplier',
    headerInfo = {},
  } = props;
  const {
    supplierCompanyName = '',
    suggestedLineCount = 0,
    suggestedFlag = 0,
    itemName = '',
    itemCode = '',
    quotationRank = 0,
    savingRatio = 0,
    itemLineCount = 0,
    suggestedSupplierCount = 0,
    allSupCount = 0,
  } = data;

  const id = useComputed(() => {
    const { rfxLineSupplierId = '', rfxLineItemId = '' } = data || {};
    return viewType === 'supplier' ? rfxLineSupplierId : rfxLineItemId;
  }, [viewType, data]);

  const price = useComputed(() => {
    const { localSuggestedQtnNetAmount = 0, localSuggestedQtnTotalAmount = 0 } = data || {};
    return headerInfo?.priceTypeCode === 'NET_PRICE'
      ? localSuggestedQtnNetAmount
      : localSuggestedQtnTotalAmount;
  }, [headerInfo, data]);

  const getRankStyle = useCallback((rank = 0) => {
    let rankStyle = '';
    switch (rank) {
      case 1:
        rankStyle = 'section-item-right-rank-one';
        break;
      case 2:
        rankStyle = 'section-item-right-rank-two';
        break;
      case 3:
        rankStyle = 'section-item-right-rank-three';
        break;
      default:
        rankStyle = 'section-item-right-rank-other';
        break;
    }
    return rankStyle;
  }, []);

  return (
    <div
      className={styles['section-item']}
      onClick={() => afterClick(id, viewType)}
      style={{
        borderRight: id === sourceId ? '3px solid #00B8CC' : '',
        opacity: suggestedFlag === 1 ? '1' : '0.5',
      }}
    >
      <div className={styles['section-item-left']}>
        <div
          className={classnames(styles['section-item-supplier-name'], {
            [styles['section-item-supplier-name-choose']]: id === sourceId,
          })}
        >
          <Tooltip
            title={
              viewType === 'supplier'
                ? supplierCompanyName
                : itemCode
                ? `${itemCode}-${itemName}`
                : itemName
            }
          >
            {viewType === 'supplier'
              ? supplierCompanyName
              : itemCode
              ? `${itemCode}-${itemName}`
              : itemName}
          </Tooltip>
        </div>
        <div className={styles['section-item-supplier-price']}>
          <div className={styles['section-item-supplier-price-left']}>
            <Tooltip title={intl.get('ssrc.inquiryHall.model.inquiryHall.benchmarkLocalSugQtnAmount').d('中标总金额')}>
              <span style={{ marginRight: '8px', marginTop: '1px' }}>
                <SVGIcon
                  path={require('@/assets/check-count.svg')}
                  className={styles['link-color']}
                />
              </span>
            </Tooltip>
            <>
              <Tooltip title={price ? numberSeparatorRender(price) : ''}>
                <div className={styles['section-item-supplier-price-box']}>
                  {!isNil(price) ? (
                    <PrecisionInputNumber
                      value={price}
                      financial={headerInfo?.currencyCode}
                      type="c7n"
                      readOnly
                    />
                  ) : (
                    '-'
                  )}
                </div>
              </Tooltip>
              &nbsp;
              <div
                style={{
                  color: savingRatio > 0 ? '#179454' : savingRatio < 0 ? 'red' : '',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {!isNil(savingRatio) && savingRatio !== 0 && (
                  <>
                    {savingRatio !== 0 && (
                      <Icon
                        type={savingRatio > 0 ? 'arrow_downward' : 'arrow_upward'}
                        style={{ fontSize: '14px', height: '16px' }}
                      />
                    )}
                    {savingRatio}%
                  </>
                )}
              </div>
            </>
          </div>
          <div style={{ color: '#E5E7EC', margin: '0 8px' }}>|</div>
          <div className={styles['section-item-supplier-price-right']}>
            <Tooltip title={
              viewType === 'supplier' ?
              intl.get('ssrc.inquiryHall.model.inquiryHall.winningBidOrTotal').d('中标标的数/总标的数') :
              intl.get('ssrc.inquiryHall.model.inquiryHall.winningItemNum').d('中标项数')
            }
            >
              <span>
                {viewType === 'supplier' ? (
                  <SVGIcon
                    path={require('@/assets/check-item.svg')}
                    className={styles['link-color']}
                    style={{ marginRight: '8px', marginTop: '1px' }}
                  />
                ) : (
                  <SVGIcon
                    path={require('@/assets/check-item-down.svg')}
                    className={styles['link-color']}
                    style={{ marginRight: '8px', marginTop: '1px' }}
                  />
                )}
              </span>
            </Tooltip>
            <div>
              {viewType === 'supplier'
                ? `${suggestedLineCount}/${itemLineCount}`
                : `${suggestedSupplierCount}/${allSupCount}`}
            </div>
          </div>
        </div>
      </div>
      {viewType === 'supplier' && (
        <div className={styles['section-item-right']}>
          <div
            className={styles['section-item-right-icon']}
            style={{ marginLeft: id === sourceId ? '4px' : '0px' }}
          >
            {!isNil(quotationRank) && (
              <div className={styles[getRankStyle(quotationRank)]}>{quotationRank}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default observer(SectionItem);
