import React, { useMemo, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { DataSet, Button } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import c7nModal from '@/utils/c7nModal';
import OverflowTip from '@/components/OverflowTip';
import FormPro from './FormPro';
import ImageList from './ImageList';
import Detail from '../CustomTemplate/Detail';
import { SkuLabels } from '../SkuPreview/SkuInfo';
import { rendererStatus } from '../SkuWorkbench/tableColumns';
import renderCompare from './renderCompare';
import SkuContext from './skuContext';
import { precisionRender } from '../utilsApi/precision';
import customStore from './customStore';

const SkuContent = observer(({ dataSet, options, primaryImagePath }) => {
  const { hiddenSku, showHistory, onSkuChange } = useContext(SkuContext);
  const { skuName, skuTitle, labels, skuImageList } = dataSet?.current
    ? dataSet.current.toData()
    : {};
  const initList = skuImageList || [];
  const imgList = initList
    .filter((f) => {
      return !(f.mediaType === 1 || (f.largeImagePath || f.mediaPath) === primaryImagePath);
    })
    .map((m) => ({ ...m, fileUrl: m.largeImagePath || m.mediaPath, minUrl: m.mediaPath }));
  return (
    <div className="sku-content">
      <ImageList width={70} height={70} imgList={imgList} />
      <div className="sku-infos">
        <div className="sku-top">
          <p className="sku-name">
            <OverflowTip>{skuName}</OverflowTip>
          </p>
          {dataSet?.current && !showHistory && (
            <div className="sku-status">{rendererStatus({ record: dataSet?.current })}</div>
          )}
        </div>
        {skuTitle && <div className="sku-title">{skuTitle}</div>}
        <div className="sku-price">
          {/* <span className="sku-price-value">{marketPriceMeaning || marketPrice || '-'}</span>
            <span className="sku-price-label">
              ({intl.get('smpc.product.model.marketPrice').d('市场价')})
            </span> */}
          <SkuLabels labels={labels} />
        </div>
      </div>
      {!showHistory && hiddenSku !== 'y' && (
        <FormPro
          dataSet={dataSet}
          style={{ width: 160, marginLeft: 46 }}
          fields={[
            {
              name: 'skuId',
              _type: 'Select',
              clearButton: false,
              options,
              onChange: onSkuChange,
              style: { width: 150, height: 28 },
            },
          ]}
        />
      )}
    </div>
  );
});

export default function SkuInfo(props) {
  const {
    id,
    spuId,
    dataSet,
    skuList,
    keyList,
    isHistory,
    showHistory,
    primaryImagePath,
    onViewIntro = (e) => e,
    onViewGiftRule = (e) => e,
  } = props;
  const { customizeForm } = customStore.getCustFuncs();
  const skuCustCode = customStore.getCustomCode('SKU_INFO');
  const skuHisCustCode = customStore.getCustomCode('SKU_INFO_2');
  const isReceive = customStore.getState('isReceive');

  const options = useMemo(() => new DataSet({ paging: false, data: skuList }), [skuList]);

  const fieldsRenderer = ({ value, name }) =>
    renderCompare({ value, name, isHistory, showHistory, keyList });

  function handleViewCustomAttr() {
    const title = intl.get('smpc.product.view.customInfo').d('定制品信息');
    c7nModal({
      title,
      style: { width: 1090 },
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      children: <Detail readOnly spuId={spuId} entrance="spu" />,
    });
  }
  return (
    <div className="sku-info-wrapper" id={id}>
      <SkuContent dataSet={dataSet} options={options} primaryImagePath={primaryImagePath} />
      <FormPro
        readOnly
        dataSet={dataSet}
        columns={3}
        customizeForm={customizeForm}
        customizeCode={showHistory ? skuHisCustCode : skuCustCode}
        fields={[
          { name: 'skuCode' },
          { name: 'thirdSkuCode', renderer: fieldsRenderer },
          {
            name: 'marketPrice',
            renderer: ({ record, name }) => {
              if (record) {
                return fieldsRenderer({ value: precisionRender({ record, name }), name });
              }
            },
          },
          {
            name: 'skuStock',
            show: !isReceive,
            renderer: ({ record, value, name }) => {
              if (record) {
                const totalStock = record.get('totalStock');
                const stockText =
                  totalStock === -1 || isNaN(totalStock)
                    ? intl.get('smpc.product.model.noLimitStock').d('无限库存')
                    : value;
                return fieldsRenderer({ value: stockText, name });
              }
            },
          },
          { name: 'itemCode', renderer: fieldsRenderer },
          { name: 'itemName', renderer: fieldsRenderer },
          { name: 'itemCategoryName', renderer: fieldsRenderer },
          {
            name: 'customFlag',
            show: !isReceive,
            renderer: ({ value }) =>
              value ? (
                <a onClick={handleViewCustomAttr}>
                  {intl.get('hzero.common.button.look').d('查看')}
                </a>
              ) : (
                '-'
              ),
          },
          {
            name: 'introductions',
            renderer: ({ record }) => {
              if (record) {
                const intro = record.get('introduction');
                if (!intro) return '-';
                return (
                  <a onClick={() => onViewIntro(intro)}>
                    {intl.get('hzero.common.button.look').d('查看')}
                  </a>
                );
              }
            },
          },
          {
            name: 'giveawayFlag',
            show: !isReceive,
            renderer: ({ value }) =>
              value
                ? intl.get('hzero.common.status.yes').d('是')
                : intl.get('hzero.common.status.no').d('否'),
          },
          {
            name: 'giveawayRuleList',
            show: !isReceive,
            renderer: ({ record }) => {
              const giveawayRuleList = record?.get('giveawayRuleList');
              if (isEmpty(giveawayRuleList)) return '-';
              return (
                <Button
                  funcType="link"
                  style={{ height: 18 }}
                  onClick={() => onViewGiftRule(giveawayRuleList)}
                >
                  {intl.get('hzero.common.button.look').d('查看')}
                </Button>
              );
            },
          },
        ]}
      />
    </div>
  );
}
