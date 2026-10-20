import React from 'react';
import { Tag, Icon, Tooltip } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';

import ImageList from '@/components/ImageList';

import intl from 'utils/intl';
import Image from '@/components/Image';

export const afsStatusRenderer = ({ record, text }) => {
  if (!record) return text;
  const { remark, afterSaleStatus, afterSaleStatusMeaning } = record.get([
    'remark',
    'afterSaleStatus',
    'afterSaleStatusMeaning',
  ]);
  const colors = [
    ['#47B881', 'rgba(71, 184, 129, 0.10)'],
    ['#F88D10', 'rgba(252, 160, 0, 0.10)'],
    ['rgba(0, 0, 0, 0.65)', 'rgba(0, 0, 0, 0.06)'],
    ['#F56349', 'rgba(245, 99, 73, 0.10)'],
  ];
  const statusMaps = {
    FINISH: { colorInd: 0 },
    APPROVING: { colorInd: 1 },
    WAIT_PROCESS: { colorInd: 1 },
    WAIT_SENT: { colorInd: 1 },
    WAIT_CONFIRM: { colorInd: 1 },
    CANCELED: { colorInd: 2 },
    INTERNAL_APPROVING: { colorInd: 1 },
    REJECT: {
      remarkLabel: intl.get('smodr.afterSaleManage.model.nopassResult').d('驳回原因'),
    },
    PRODUCT_REJECT: {
      remarkLabel: intl.get('smodr.afterSaleManage.model.noreceiveResult').d('拒收原因'),
    },
  };
  const { colorInd = 3, remarkLabel } = statusMaps[afterSaleStatus] || {};
  const [fontColor, bgColor] = colors[colorInd];
  return (
    <>
      <Tag
        color={bgColor}
        style={{ color: fontColor, padding: '2px 4px', borderRadius: '2px', lineHeight: '18px' }}
      >
        {afterSaleStatusMeaning}
      </Tag>
      {remark && remarkLabel && (
        <Tooltip
          title={
            <span>
              {remarkLabel}：{remark}
            </span>
          }
        >
          <Icon type="info" style={{ color: fontColor, marginTop: -4 }} />
        </Tooltip>
      )}
    </>
  );
};

export const afsProblemRenderer = ({ text, record }) => {
  if (!record) return text;
  const imageList = record.get('imageList') || [];
  if (imageList.length < 1) return text;
  const newList = imageList.map((i) => ({ fileUrl: i.fileUrl }));
  return (
    <div className="afs-problem">
      <div className="afs-reason">{text}</div>
      <div className="afs-imgs">
        <ImageList list={newList} width={70} height={70} />
        {/* {imageList.map((m) => (
          <Image value={m.fileUrl} width={70} height={70} />
        ))} */}
      </div>
    </div>
  );
};

export const orderSkuRenderer = (data) => {
  const { afterSaleEntryExtras } = data;
  return (
    <>
      <div className="sku-info">
        <Image width={58} height={58} value={data.productImagePath} />
        <div>
          <p className="sku-name" title={data.skuName}>
            {data.skuName}
          </p>
          <p className="sku-code">
            <span style={{ marginRight: '8px' }}>{intl.get('smodr.afterSaleManage.model.productNum').d('商品编码')}</span>
            <span>{data.skuCode}</span>
          </p>
        </div>
      </div>
      {
        afterSaleEntryExtras?.length > 0 && (
          <div className='gift'>
            {/* <div className='gift-line' style={{ height: `${36 + (56 * (afterSaleEntryExtras?.length - 1))}px` }} /> */}
            {afterSaleEntryExtras.map((i, index) => (
              <div className='gift-content'>
                {i.orderTypeCode === 'CATA' ? (
                  <div className='gift-info'>
                    <p>
                      <img src={i?.primaryUrl} alt='' />
                    </p>
                  </div>
                ) : (
                  <div className='gift-info' dangerouslySetInnerHTML={{ __html: i?.primaryUrl }} />
                )}
                <div className='gift-box'>
                  <div>
                    <span className='gift-label'>{intl.get('smodr.afterSaleManage.model.giftSku').d('赠品')}{afterSaleEntryExtras?.length > 1 ? index + 1 : null}</span>
                    <span>{i.skuName}</span>
                  </div>
                  <div className='gift-code'>
                    <span style={{ marginRight: '8px' }}>{intl.get('smodr.afterSaleManage.model.productNum').d('商品编码')}</span>
                    <span>{i.skuCode}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      }
    </>
  );
};
