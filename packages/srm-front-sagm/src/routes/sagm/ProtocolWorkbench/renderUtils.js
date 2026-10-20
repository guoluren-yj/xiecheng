import React from 'react';

import intl from 'utils/intl';
import { isNull, isFunction } from 'lodash';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import { DataSet, Modal } from 'choerodon-ui/pro';

import c7nModal from '@/utils/c7nModal';
import { precisionRender } from '@/utils/precision';
import { lineAddProduct, lineDeleteProduct } from '@/services/mallProtocolManagementService';
import { changeProduct } from '@/services/mallReceivedAgreementService';
import StatusTag from './component/StatusTag';
import { openLadderPrice } from './drawer/priceDrawer';
import ProductModal from './Modal/ProductModal';
import Transfer from './Modal/TransferModal';
import { openSaleArea, openOrganizations, openOtherInfo } from './drawer/viewDrawer';
import RecordTimeLine from './Detail/Record';
import lineRender from './Detail/Record/agmHeader';
import { productTransferDs } from './Modal/modalDs';

const organizationId = getCurrentOrganizationId();

/**
 * 协议状态
 * 新建（NEW）待审批（SUBMITTED） 工作流审批中(APPROVING) 审批通过（APPROVED）审批拒绝（REJECT）
 * 已失效（DISABLED）已发布（PUBLISHED） 已终止（TERMINATED） 已删除（DELETED）
 */
const agreementStatusRender = ({ text, record }) => {
  const status = record.get('agreementStatus');
  const rejectRemark = record.get('rejectRemark');
  const submitErrorMessageMeaning = record.get('submitErrorMessageMeaning');
  const color = ['NEW', 'SUBMITTED', 'APPROVING'].includes(status)
    ? 'yellow'
    : ['APPROVED', 'PUBLISHED'].includes(status)
    ? 'green'
    : ['REJECT'].includes(status)
    ? 'red'
    : 'gray';
  // 防止闪现
  return status ? (
    <StatusTag text={text} color={color} message={rejectRemark || submitErrorMessageMeaning} />
  ) : (
    ''
  );
};

/**
 * 商品状态
 * 自动下架（0）已上架（1） 手工下架（2） 上架失败（3）待上架（4）
 * 新建（5） 已生效（7） 上架中（8） 下架中（9）审批通过（4）
 */
const productStatusRender = ({ text, record }) => {
  const { shelfFlag, agreementDetailStatusMeaning } = record.get([
    'shelfFlag',
    'agreementDetailStatusMeaning',
  ]);

  let agreementDetailStatus = record.get('agreementDetailStatus');
  if (!isNull(shelfFlag)) {
    agreementDetailStatus = undefined;
  }

  const remark = record.get('remark');
  const remarkMeaning = record.get('remarkMeaning');
  const color =
    [4, 5, 8].includes(shelfFlag) || ['WAITING', 'NEW'].includes(agreementDetailStatus)
      ? 'yellow'
      : [1, 4, 7].includes(shelfFlag) || ['APPROVED', 'VALID'].includes(agreementDetailStatus)
      ? 'green'
      : [3].includes(shelfFlag) || ['REJECT'].includes(agreementDetailStatus)
      ? 'red'
      : 'gray';
  return (
    <StatusTag
      text={text || agreementDetailStatusMeaning}
      color={color}
      message={remarkMeaning || remark}
    />
  );
  // const agreementDetailStatusMeaning = record.get('agreementDetailStatusMeaning');
  // return text || agreementDetailStatusMeaning;
};

/**
 * 协议行状态： 失效（-1） 生效（0） 待生效（1）
 */
const effectiveFlagRender = ({ text, record }) => {
  const status = Number(record.get('effectiveFlag'));
  const color = status === -1 ? 'gray' : status === 0 ? 'green' : 'yellow';

  return <StatusTag text={text} color={color} />;
};

const taxPriceRender = ({ record }) => {
  return record.get('ladderFlag') ? (
    <a
      onClick={() =>
        openLadderPrice({
          data: record.get('agreementLadders') || [],
          readOnly: true,
        })
      }
    >
      {intl.get('sagm.common.view.modal.ladderPrice').d('阶梯价格')}
    </a>
  ) : (
    precisionRender({ record, name: 'taxPrice' })
  );
};

const regionRender = ({ record }) => {
  if (record.get('allRegionFlag') === 1) {
    return intl.get('sagm.common.model.allAreas').d('所有区域');
  } else {
    const list = record.get('agreementRegionDTOList') || [];
    return list.length === 1 ? (
      list[0].regionName
    ) : (
      <a
        onClick={() =>
          openSaleArea({
            data: list || [],
            readOnly: true,
          })
        }
      >
        {intl.get('hzero.common.button.look').d('查看')}
      </a>
    );
  }
};

const buyOrganizationRender = ({ record }) => {
  if (record.get('allUnitFlag') === 1) {
    return intl.get('sagm.common.model.allOrganizations').d('所有组织');
  } else {
    const list = record.get('agreementUnitDTOList') || [];
    return list.length === 1 ? (
      list[0].unitName
    ) : (
      <a
        onClick={() =>
          openOrganizations({
            data: list || [],
            readOnly: true,
          })
        }
      >
        {intl.get('hzero.common.button.look').d('查看')}
      </a>
    );
  }
};

const otherInfoRender = ({ record }) => {
  return (
    <a
      onClick={() =>
        openOtherInfo({
          data: record.toData(),
          readOnly: true,
        })
      }
    >
      {intl.get('hzero.common.button.look').d('查看')}
    </a>
  );
};

/**
 * 追加商品
 * @param {*} records 模态框选中记录
 * @param {*} agreementLineId 商品明细行id
 * @param {*} dataSet 商品明细ds
 * @param {*} type 操作类型 add (追加商品) replace(替换商品)
 * @param {*} record 当行商品明细记录
 */
async function onOk(records, agreementLineId, dataSet, type, record) {
  let res;
  const list = records.map((i) => i.toData());
  if (type === 'add') {
    res = getResponse(
      await lineAddProduct({
        agreementLineId,
        agreementDetailsDTOS: list,
      })
    );
  }
  // 更换商品
  else {
    const skuIds = list.map((n) => n.skuId);
    res = getResponse(
      await changeProduct({
        ...record,
        skuIds,
      })
    );
  }
  if (res) {
    notification.success();
    dataSet.query(dataSet.currentPage);
  }
}

const openProductModal = (record, dataSet, type) => {
  const { supplierTenantId, agreementLineId } = record;
  const ds = new DataSet(
    productTransferDs({
      // 参数是否正确
      supplierTenantId,
      agreementLineId,
    })
  );
  c7nModal({
    style: { width: 742 },
    // footer: readOnly ? null : undefined,
    title: intl.get('small.common.model.productInfo').d('商品信息'),
    children: (
      <ProductModal
        dataSet={ds}
        onOk={(records) => onOk(records, agreementLineId, dataSet, type, record)}
      />
    ),
  });
};

const openTransferModal = (record, backPath, callBack = (e) => e, skuApprove, readOnly = false) => {
  const { supplierTenantId, supplierCompanyId, agreementLineId, catalogId } = record;
  // const flag = !['TERMINATED', 'DISABLED'].includes(agreementStatus) && effectiveFlag !== -1;
  let hasSku = false;
  c7nModal({
    style: { width: 1090 },
    movable: true,
    okCancel: false,
    okText: intl.get('hzero.common.button.close').d('关闭'),
    title: intl.get('small.common.model.productInfo').d('商品信息'),
    children: (
      <Transfer
        agreementLineId={agreementLineId}
        readOnly={readOnly}
        // showQuickCreate={flag}
        catalogId={catalogId}
        agreementLineList={[record]}
        backPath={backPath}
        // callBack={callBack}
        onSkuChange={(_, __, isUpdate) => {
          hasSku = isUpdate;
        }}
        skuApprove={skuApprove}
        leftInfo={{
          url: `/sagm/v1/${organizationId}/agreement-details/${agreementLineId}/off-line`,
          params: { supplierTenantId, supplierCompanyId },
        }}
        rightInfo={{
          url: `/sagm/v1/${organizationId}/agreement-details/${agreementLineId}`,
        }}
        queryDs={
          new DataSet({
            queryFields: [
              {
                name: 'skuName',
                label: intl.get('sagm.common.model.product').d('商品'),
                display: true,
              },
              {
                name: 'categoryId',
                label: intl.get('sagm.common.model.platformCategory').d('平台分类'),
                type: 'object',
                display: true,
                textField: 'categoryName',
                valueField: 'categoryId',
                lovCode: 'SMPC.CATEGORY',
                ignore: 'always',
                lovPara: {
                  tenantId: organizationId,
                },
              },
            ],
          })
        }
        onJoin={lineAddProduct}
        onDelete={lineDeleteProduct}
      />
    ),
    afterClose: () => {
      if (hasSku) {
        hasSku = false;
        if (isFunction(callBack)) {
          callBack();
        }
      }
    },
  });
};

const viewHistory = (record, callBack) => {
  if (!record) return;
  const { agreementId = '' } = record.toData();
  const ds = new DataSet({
    autoQuery: false,
    paging: false,
    transport: {
      read: {
        url: `/sagm/v1/${organizationId}/agreements/agreement-his-list/${agreementId}`,
        method: 'GET',
      },
    },
  });
  ds.query();
  Modal.open({
    title: intl.get('hzero.common.button.historyVersion').d('历史版本'),
    drawer: true,
    style: { width: 742 },
    okText: intl.get('hzero.common.button.close').d('关闭'),
    okCancel: false,
    children: (
      <RecordTimeLine dataSet={ds} renderer={(args, modal) => lineRender(args, modal, callBack)} />
    ),
  });
};

export {
  agreementStatusRender,
  effectiveFlagRender,
  taxPriceRender,
  regionRender,
  buyOrganizationRender,
  otherInfoRender,
  productStatusRender,
  openProductModal,
  openTransferModal,
  viewHistory,
};
