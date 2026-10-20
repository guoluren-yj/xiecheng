import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Spin, DataSet, Icon, Button, Form, Row, Col, TextField } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';
import RichTextEditor from 'components/RichTextEditor';
import { PUBLIC_BUCKET } from '_utils/config';
import Card from '@/components/Card';
import FormPro from '@/components/FormPro';
import CropperUpload from './CropperUpload';
import { fetchSku, saveSku } from './api';
import { getSkuDsProps } from './ds';
import styles from './style.less';

const SkuImage = observer(({ dataSet }) => {
  return (
    <div className={styles['sku-image-wrapper']}>
      {dataSet.map((record) => (
        <div key={record.id} className="image-card image-content">
          <img src={record.get('mediaPath')} alt="" />
          <div className="img-btn">
            <a
              href={record.get('mediaPath')}
              target="_blank"
              rel="noopener noreferrer"
              onMouseDown={(e) => {
                e.preventDefault();
              }}
            >
              <Icon type="visibility-o" />
            </a>
            <Icon
              type="delete"
              onClick={() => {
                dataSet.remove(record);
              }}
            />
          </div>
        </div>
      ))}
      <div className="image-card" key="image-upload">
        <CropperUpload
          multiple
          maxSize={{
            storageSize: 30,
            storageUnit: 'MB',
          }}
          onSuccess={(images) => {
            images.forEach((f, i) => {
              dataSet.create({
                mediaType: 0,
                mediaPath: f.imagePath,
                thumbnailPath: f.thumbnailPath,
                orderSeq: dataSet.length + i + 1,
              });
            });
          }}
          title={intl.get('smpc.product.model.productImage').d('商品图片')}
        />
      </div>
    </div>
  );
});

const SkuIntro = observer(({ dataSet, richTextRef }) => {
  const value = dataSet?.current?.get('skuDetail');
  const richTextProps = {
    content: value,
    data: value,
    ref: richTextRef,
    bucketDirectory: 'smkt/sku/media',
    bucketName: PUBLIC_BUCKET,
    config: {
      allowedContent: true,
      removeButtons:
        'About,Flash,Save,Form,Checkbox,Button,ShowBlocks,NewPage,Print,Language,Templates,CreateDiv,Radio,TextField,Textarea,Select,HiddenField',
    },
  };
  return (
    <div style={{ marginBottom: 32 }}>
      <RichTextEditor {...richTextProps} />
    </div>
  );
});

const SkuAttr = observer(({ dataSet }) => {
  return (
    <div className={styles['sku-attr-wrapper']}>
      {dataSet.map((record) => {
        return (
          <Form record={record} labelLayout="float">
            <Row className="spec-attr-row" gutter={16}>
              <Col span={12}>
                <TextField name="attrName" />
              </Col>
              <Col span={11}>
                <TextField name="attrValue" />
              </Col>
              <Col span={1} style={{ lineHeight: '28px' }}>
                <Icon type="delete" onClick={() => dataSet.remove(record)} />
              </Col>
            </Row>
          </Form>
        );
      })}
      <div>
        <Button
          funcType="flat"
          color="primary"
          icon="playlist_add"
          onClick={() => dataSet.create({})}
        >
          {intl.get('smpc.product.model.add').d('新增')}
        </Button>
      </div>
    </div>
  );
});

export default function SkuCreate(props) {
  const { skuId, modal, onSaveSuccess = (e) => e } = props;
  const [loading, setLoading] = useState(false);
  const richTextRef = useRef();
  const skuDataSet = useMemo(() => new DataSet(getSkuDsProps()), []);
  const skuImgDataSet = useMemo(() => new DataSet({}), []);
  const skuAttrDataSet = useMemo(
    () =>
      new DataSet({
        fields: [
          {
            name: 'attrName',
            required: true,
            label: intl.get('smkt.selection.view.spec').d('规格'),
          },
          {
            name: 'attrValue',
            required: true,
            label: intl.get('smkt.selection.view.attrValue').d('属性值'),
          },
        ],
      }),
    []
  );

  useEffect(() => {
    if (skuId) {
      fetchSkuInfo();
    } else {
      skuDataSet.create({});
    }
    modal.handleOk(() => handleSave());
  }, [skuId]);

  async function fetchSkuInfo() {
    setLoading(true);
    const res = getResponse(await fetchSku({ skuId }));
    setLoading(false);
    if (res) {
      skuDataSet.loadData([res]);
      skuImgDataSet.loadData(res.skuMedias);
      skuAttrDataSet.loadData(res.attributes);
    }
  }

  async function handleSave() {
    const flag1 = await skuDataSet.validate();
    const flag2 = await skuAttrDataSet.validate();
    if (flag1 && flag2) {
      const skuInfo = skuDataSet.current.toJSONData();
      const skuMedias = skuImgDataSet
        .toData()
        .map((m, ind) => (ind === 0 ? { ...m, primaryFlag: 1 } : { ...m, primaryFlag: 0 }));
      const attributes = skuAttrDataSet.toData();
      const params = {
        ...skuInfo,
        skuMedias,
        attributes,
        skuDetail: richTextRef.current?.getContent(),
      };
      const res = getResponse(await saveSku(params));
      if (res) {
        onSaveSuccess();
        notification.success();
        return true;
      }
      return false;
    }
    return false;
  }

  function getSkuFields() {
    return [
      { name: 'skuName' },
      { name: 'skuCode' },
      { name: 'catalogLov', _type: 'Lov' },
      { name: 'proposedPrice' },
    ];
  }

  return (
    <Spin spinning={loading}>
      <div className={styles['sku-info-wrapper']}>
        <FormPro dataSet={skuDataSet} columns={2} fields={getSkuFields()} />
      </div>
      <Card title={intl.get('smpc.product.view.skuImage').d('商品图片')}>
        <p className={styles['file-help-info']}>
          {intl.get('smpc.product.view.helpInfo3').d('图片支持PNG、JPG、JPEG格式，且不能大于30M')}
        </p>
        <SkuImage dataSet={skuImgDataSet} />
      </Card>
      <Card title={intl.get('smpc.product.model.productIntro').d('商品介绍')}>
        <SkuIntro richTextRef={richTextRef} dataSet={skuDataSet} />
      </Card>
      <Card title={intl.get('smpc.product.view.specAttr').d('规格属性')}>
        <SkuAttr dataSet={skuAttrDataSet} />
      </Card>
    </Spin>
  );
}
