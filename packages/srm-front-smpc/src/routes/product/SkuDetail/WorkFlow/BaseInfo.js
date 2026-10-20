import React, { useMemo, useContext, useEffect, useCallback } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { toJS } from 'mobx';

import intl from 'utils/intl';
import { Content } from 'components/Page';
import c7nModal from '@/utils/c7nModal';
// import OverflowTip from '@/components/OverflowTip';
import FormPro from '.././FormPro';
import ImageList from '.././ImageList';
import Detail from '../../CustomTemplate/Detail';
import { SkuLabels } from '../../SkuPreview/SkuInfo';
import { renderFlowCompare } from '../renderCompare';
import SkuContext from '../skuContext';
import { baseInfoDs } from './ds';

export default function BaseInfo(props) {
  const {
    title,
    id,
    spuId,
    skuDataSets,
    spuDataSets,
    keyList = [],
    changeFlag,
    // primaryImagePath,
    onViewIntro = (e) => e,
  } = props;

  const [skuDataSet] = skuDataSets;
  const [spuDataSet] = spuDataSets;
  const { onlyShowUpdateItem } = useContext(SkuContext);

  const dataSet = useMemo(() => new DataSet(baseInfoDs()), []);
  // const { customizeForm } = customStore.getCustFuncs();
  // const skuCustCode = customStore.getCustomCode('SKU_INFO');
  // const skuHisCustCode = customStore.getCustomCode('SKU_INFO_2');

  useEffect(() => {
    const { supplierCompanyName, categoryNamePath, catalogName } = spuDataSet?.current
      ? spuDataSet.current.toData()
      : {};
    const spuBase = { supplierCompanyName, categoryNamePath, catalogName };
    const skuInfo = skuDataSet?.current ? skuDataSet.current.toData() : {};
    dataSet.loadData([{ ...skuInfo, ...spuBase }]);
  }, [skuDataSet?.current, spuDataSet?.current]);

  const fieldsRenderer = ({ value, name }) => {
    return renderFlowCompare({
      value,
      name,
      keyList,
      getLastVersionValue() {
        if (changeFlag) {
          const oldSkuInfo = skuDataSets[1]?.current;
          // const oldSpuInfo = spuDataSet?.[1]?.toData();
          if (keyList.includes(name)) {
            return oldSkuInfo?.get(name);
          }
        }
        return '';
      },
    });
  };

  function handleViewCustomAttr() {
    const _title = intl.get('smpc.product.view.customInfo').d('定制品信息');
    c7nModal({
      title: _title,
      style: { width: 1090 },
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      children: <Detail readOnly spuId={spuId} entrance="spu" />,
    });
  }

  const renderImage = ({ record }) => {
    const initList = toJS(record.get('skuImageList')) || [];
    const imgList =
      initList?.map((m) => ({
        ...m,
        fileUrl: m.largeImagePath || m.mediaPath,
        minUrl: m.mediaPath,
      })) || [];
    return <ImageList width={100} height={100} imgList={imgList} />;
  };

  const filterFields = useCallback(
    (fields) => {
      const dom = document.getElementById(id);
      if (!onlyShowUpdateItem) {
        if (dom && dom.hasAttribute('hidden')) {
          dom.removeAttribute('hidden');
        }
        return fields;
      }
      const _fields = fields.filter((f) => keyList.includes(f.name));
      // 没有变更项
      if (!_fields.length) {
        if (dom) {
          dom.setAttribute('hidden', true);
        }
      }
      return _fields;
    },
    [onlyShowUpdateItem, keyList]
  );
  return (
    <Content>
      <div className="sku-info-wrapper">
        <div className="part-title">{title}</div>
        {/* 商品映射信息 目录品类不记录变更 */}
        <FormPro
          readOnly
          dataSet={dataSet}
          columns={3}
          // customizeForm={customizeForm}
          // customizeCode={showHistory ? skuHisCustCode : skuCustCode}
          fields={filterFields([
            { name: 'skuTitle', colSpan: 2, renderer: fieldsRenderer },
            { name: 'primaryImagePath', rowSpan: 2, renderer: renderImage },

            { name: 'supplierCompanyName' },
            { name: 'categoryNamePath' },
            {
              name: 'catalogName',
            },
            {
              name: 'labels',
              renderer: ({ value = [] }) => (value.length > 0 ? <SkuLabels labels={value} /> : '-'),
              colSpan: 2,
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
              name: 'customFlag',
              renderer: ({ value }) =>
                value ? (
                  <a onClick={handleViewCustomAttr}>
                    {intl.get('hzero.common.button.look').d('查看')}
                  </a>
                ) : (
                  '-'
                ),
            },
          ])}
        />
      </div>
    </Content>
  );
}

export function ItemInfo({ dataSet, title, spuKeyList = [] }) {
  const { onlyShowUpdateItem } = useContext(SkuContext);

  const filterFields = useCallback(
    (fields) => {
      if (!onlyShowUpdateItem) {
        return fields;
      }
      return fields.filter((f) => {
        if (f.name === 'itemCategoryCode') {
          return spuKeyList.includes('itemCategoryId');
        }
        return spuKeyList.includes(f.name);
      });
    },
    [onlyShowUpdateItem, spuKeyList]
  );
  return (
    <Content>
      <div className="item-info">
        <div className="part-title">{title}</div>
        {/* 商品映射信息 目录品类不记录变更 */}
        <FormPro
          readOnly
          dataSet={dataSet}
          columns={3}
          // customizeForm={customizeForm}
          // customizeCode={showHistory ? skuHisCustCode : skuCustCode}
          fields={filterFields([
            { name: 'itemCode' },
            { name: 'itemName' },

            { name: 'itemCategoryCode' },
            { name: 'itemCategoryName' },
          ])}
        />
      </div>
    </Content>
  );
}
