import React, { useState, useEffect } from 'react';
import { Lov, CheckBox } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import RichTextEditor from 'components/RichTextEditor';
import { PUBLIC_BUCKET } from '_utils/config';

import styles from './index.less';

// 商品介绍富文本
export default (props) => {
  const { skuRecord, refCurrent, dataSet, disabled } = props;
  const { skuId, introduction } = skuRecord.get(['skuId', 'introduction']);
  const [content, setContent] = useState(introduction || '');

  useEffect(() => {
    setContent(introduction);
  }, [introduction]);

  const staticTextProps = {
    content,
    key: skuId,
    data: content,
    ref: refCurrent,
    readOnly: disabled,
    bucketDirectory: 'small-product-publish',
    bucketName: PUBLIC_BUCKET,
    config: {
      allowedContent: true,
      removeButtons:
        'About,Flash,Save,Form,Checkbox,Button,ShowBlocks,NewPage,Print,Language,Templates,CreateDiv,Radio,TextField,Textarea,Select,HiddenField',
    },
    style: { margin: '16px 0 32px 0' },
  };
  return (
    <>
      <Lov
        dataSet={dataSet}
        name="template"
        mode="button"
        clearButton={false}
        funcType="flat"
        icon="archive"
        color="primary"
        disabled={disabled}
        modalProps={{
          drawer: true,
          okFirst: true,
          style: { width: 742 },
          title: intl.get('smpc.product.model.getProductIntroTemplate').d('引用商品介绍模板'),
        }}
        tableProps={{
          customizedCode: 'skuInfo.Intro.template',
          style: { maxHeight: 'calc(100vh - 155px)' },
        }}
        onChange={(item) => {
          if (item) {
            setContent(item.templateContent);
          }
        }}
      >
        {intl.get('smpc.product.model.getProductIntroTemplate').d('引用商品介绍模板')}
      </Lov>
      <div className={styles['sku-info-rich-editor']}>
        <RichTextEditor {...staticTextProps} />
      </div>
      <CheckBox dataSet={dataSet} name="allSkuFlag" disabled={disabled} style={{ marginTop: 8 }}>
        {intl.get('smpc.product.model.setAllSku').d('应用至全部SKU')}
      </CheckBox>
    </>
  );
};
