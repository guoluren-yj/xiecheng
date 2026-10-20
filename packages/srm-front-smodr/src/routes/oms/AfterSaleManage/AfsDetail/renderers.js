import React from 'react';
import { Tag, Icon, Tooltip } from 'choerodon-ui';

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
    ['#47B881', 'rgba(71, 184, 129, 0.10)', 'green'],
    ['#F88D10', 'rgba(252, 160, 0, 0.10)', 'yellow'],
    ['rgba(0, 0, 0, 0.65)', 'rgba(0, 0, 0, 0.06)', 'gray'],
    ['#F56349', 'rgba(245, 99, 73, 0.10)', 'red'],
  ];
  const statusMaps = {
    FINISH: { colorInd: 0 },
    APPROVING: { colorInd: 1 },
    WAIT_PROCESS: { colorInd: 1 },
    WAIT_SENT: { colorInd: 1 },
    WAIT_CONFIRM: { colorInd: 1 },
    CANCELED: { colorInd: 2 },
    REJECT: {
      remarkLabel: intl.get('smodr.afterSaleManage.model.nopassResult').d('驳回原因'),
    },
    PRODUCT_REJECT: {
      remarkLabel: intl.get('smodr.afterSaleManage.model.noreceiveResult').d('拒收原因'),
    },
  };
  const { colorInd = 3, remarkLabel } = statusMaps[afterSaleStatus] || {};
  const [fontColor, , type] = colors[colorInd];
  return (
    <>
      <Tag
        color={type}
        style={{ border: 'none' }}
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
  return (
    <div className="sku-info">
      <Image width={40} height={40} value={data.productImagePath} />
      <p className="sku-name" title={data.skuName}>
        {data.skuName}
      </p>
    </div>
  );
};
