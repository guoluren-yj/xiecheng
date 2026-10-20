import React from 'react';
import intl from 'utils/intl';
import FormPro from './FormPro';
import ImageList from './ImageList';
import renderCompare from './renderCompare';
import customStore from './customStore';

export default function SpuInfo(props) {
  const {
    id,
    title,
    dataSet,
    currentSpu,
    type = 'vertical',
    isHistory,
    showHistory,
    keyList,
  } = props;
  const { customizeForm } = customStore.getCustFuncs();
  const isReceive = customStore.getState('isReceive');
  const spuCustCode = customStore.getCustomCode('SPU_INFO');
  const spuHisCustCode = customStore.getCustomCode('SPU_INFO_2');
  const { primaryImagePath, largePrimaryImagePath, primaryVideoPath } = currentSpu || {};
  const spuImgList = [];
  if (primaryVideoPath) spuImgList.push({ fileUrl: primaryVideoPath, type: 'video' });
  if (primaryImagePath) {
    spuImgList.push({
      fileUrl: largePrimaryImagePath || primaryImagePath,
      minUrl: primaryImagePath,
    });
  }

  const fieldsRenderer = ({ value, name }) =>
    renderCompare({ value, name, isHistory, showHistory, keyList });

  const getFields = () => {
    if (type === 'vertical') {
      return [
        { name: 'categoryNamePath' },
        { name: 'catalogName' },
        { name: 'supplierCompanyName', show: !isReceive },
        { name: 'companyName', show: !isReceive },
      ].filter((f) => f.show !== false);
    }
    return [
      { name: 'spuName', renderer: fieldsRenderer },
      { name: 'spuCode' },
      {
        name: 'primaryImagePath',
        rowSpan: 3,
        renderer: () => <ImageList imgList={spuImgList} width={72} height={72} />,
      },
      { name: 'categoryNamePath' },
      { name: 'catalogName', renderer: fieldsRenderer },
      { name: 'supplierCompanyName', show: !isReceive },
      { name: 'companyName', show: !isReceive },
    ].filter((f) => f.show !== false);
  };

  return (
    <div className="spu-info-wrapper" id={id}>
      <div className="sku-card-title">
        {title || intl.get('smpc.product.view.title.spuInfo').d('商品组信息')}
      </div>
      {type === 'vertical' && (
        <div className="spu-content">
          <ImageList imgList={spuImgList} width={60} height={60} />
          <div className="spu-info">
            <div className="spu-name">{currentSpu?.spuName || '-'}</div>
            <div className="spu-code">{currentSpu?.spuCode}</div>
          </div>
        </div>
      )}
      <FormPro
        readOnly
        dataSet={dataSet}
        columns={type === 'vertical' ? 1 : 3}
        fields={getFields()}
        customizeForm={customizeForm}
        customizeCode={showHistory ? spuHisCustCode : spuCustCode}
      />
    </div>
  );
}
