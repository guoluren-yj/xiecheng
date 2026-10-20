import React, { useMemo, useEffect } from 'react';
import { compose } from 'lodash';
import { DataSet, Table } from 'choerodon-ui/pro';
import qs from 'qs';
import { Tag } from 'choerodon-ui';

import formatterCollections from 'utils/intl/formatterCollections';
import HeadLine from '@/routes/components/HeadLine';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import RenderForm from '@/routes/components/RenderForm';
import ImageList from '@/components/ImageList';
import { renderTag } from '@/utils/utils';

import { fetchSaleDetail } from '../AfterSaleManage/api';

function AfterSaleWfp(props) {
  const { onFormLoaded } = props;
  const baseDs = useMemo(() => new DataSet(), []);
  const tableDs = useMemo(() => new DataSet({
    selection: false,
    paging: false,
    fields: [
      {
        name: 'skuCode',
        type: 'string',
        label: intl.get('smodr.afterSaleManage.model.skuCode').d('商品编码'),
      },
      {
        name: 'skuName',
        type: 'string',
        label: intl.get('smodr.afterSaleManage.model.skuName').d('商品名称'),
      },
      {
        name: 'skuTypeMeaning',
        type: 'string',
        label: intl.get('smodr.afterSaleManage.model.skuType').d('商品类型'),
      },
      {
        name: 'applyQuantity',
        type: 'number',
        label: intl.get('smodr.afterSaleManage.model.afsApplyQuantity').d('售后数量'),
      },
    ],
  }), []);
  const columns = useMemo(() => [
    { name: 'skuCode' },
    { name: 'skuName' },
    { name: 'skuTypeMeaning' },
    { name: 'applyQuantity' },
  ], []);
  const colorList=[
    { colorType: 'success', matchList: ['FINISH'] },
    { colorType: 'invalid', matchList: ['CANCELED'] },
    { colorType: 'warning', matchList: ['APPROVING', 'WAIT_PROCESS', 'WAIT_SENT', 'WAIT_CONFIRM', 'INTERNAL_APPROVING'] },
    { colorType: 'failed', matchList: [] },
  ];
  const baseFields = useMemo(() => [
    {
      name: 'afterSaleCode',
      type: 'string',
      label: intl.get('smodr.afterSaleManage.model.afterSaleCode').d('售后申请单编码'),
    },
    {
      name: 'afterSaleStatusMeaning',
      type: 'string',
      label: intl.get('smodr.afterSaleManage.model.stuats').d('状态'),
      renderer: ({ record, value }) => {
        const { color, initStyle } = renderTag(colorList, record?.get('afterSaleStatus'));
        return (
          <Tag color={color} style={initStyle}>
            {value}
          </Tag>
        );
      },
    },
    {
      name: 'afterSaleTypeMeaning',
      type: 'string',
      label: intl.get('smodr.afterSaleManage.model.afterSaleTypeMeaning').d('售后类型'),
    },
    {
      name: 'pickWareTypeMeaning',
      type: 'string',
      label: intl.get('smodr.afterSaleManage.view.detail.afsPickWareType').d('退件方式'),
    },
    {
      name: 'orderCode',
      type: 'string',
      label: intl.get('smodr.afterSaleManage.model.orderCode').d('商城订单编码'),
    },
    {
      name: 'afsReason',
      type: 'string',
      label: intl.get('smodr.afterSaleManage.model.detail.reason').d('售后原因'),
    },
    {
      name: 'ownerName',
      type: 'string',
      label: intl.get('smodr.afterSaleManage.model.ownerName').d('创建人'),
    },
    {
      name: 'ownerPhone',
      type: 'string',
      label: intl.get('smodr.afterSaleManage.model.ownerPhone').d('创建人联系电话'),
    },
    {
      name: 'applyTime',
      type: 'string',
      label: intl.get('smodr.afterSaleManage.model.applyTime').d('创建时间'),
    },
    {
      name: 'reason',
      type: 'string',
      label: intl.get('smodr.afterSaleManage.view.detail.problem').d('问题描述'),
      colSpan: 2,
      newLine: true,
      renderer: ({ text, record }) => {
        if (!record) return text;
        const imageList = record.get('imageList') || [];
        if (imageList.length < 1) return text;
        const newList = imageList.map((i) => ({ fileUrl: i.fileUrl }));
        return (
          <div className="afs-problem">
            <div className="afs-reason">{text}</div>
            <div className="afs-imgs">
              <ImageList list={newList} width={70} height={70} />
            </div>
          </div>
        );
      },
    },
  ], []);
  const linkFields = useMemo(() => [
    {
      name: 'contactName',
      label: intl.get('smodr.afterSaleManage.model.contact').d('联系人'),
    },
    {
      name: 'mobilePhone',
      label: intl.get('smodr.afterSaleManage.model.contactMobile').d('联系电话'),
    },
    {
      name: 'fullAddress',
      label: intl.get('smodr.afterSaleManage.model.contactAddress').d('联系人地址'),
    },
  ], []);

  useEffect(() => {
    initData();
  }, []);
  async function initData() {
    const { afterSaleId = '' } = qs.parse(props.history.location.search.substr(1));
    const res = await fetchSaleDetail(afterSaleId);
    if (res) {
      const {
        pickUpAddress,
        afterSaleEntryList,
        returnReasonMeaning,
        exchangeReasonMeaning,
        afterSaleType,
        afterSaleTypeMeaning,
        remark,
      } = res;
      const otherInfo = afterSaleEntryList?.[0] || {};
      const _data = {
        ...res,
        ...otherInfo,
        remark,
        afterSaleType,
        afterSaleTypeMeaning,
        afsReason: returnReasonMeaning || exchangeReasonMeaning,
        contactName: pickUpAddress?.contactName,
        mobilePhone: pickUpAddress?.mobilePhone,
        fullAddress: `${pickUpAddress?.fullAddress}${pickUpAddress?.address}`,
      };
      tableDs.loadData(afterSaleEntryList);
      baseDs.loadData([_data]);
      if (onFormLoaded) {
        onFormLoaded(true);
      }
    }
  }

  return (
    <>
      <Header title={intl.get('smodr.afterSaleManage.view.wfpTitle').d('商城售后单审批')} />
      <Content>
        <HeadLine title={intl.get('smodr.afterSaleManage.view.baseInfo').d('基本信息')} />
        <RenderForm
          dataSet={baseDs}
          fields={baseFields}
          columns={3}
          style={{
            width: '75%',
          }}
        />
        <HeadLine
          title={intl.get('smodr.afterSaleManage.view.skuInfo').d('商品信息')}
          style={{ marginTop: '32px' }}
        />
        <Table
          dataSet={tableDs}
          columns={columns}
          customizedCode='SMODR.AFTER.SALE.DETAIL.WFP'
        />
        <HeadLine title={intl.get('smodr.afterSaleManage.view.linkmanInfo').d('联系人信息')} style={{ marginTop: '32px' }} />
        <RenderForm
          dataSet={baseDs}
          fields={linkFields}
          columns={3}
          style={{
            width: '75%',
          }}
        />
      </Content>
    </>
  );
}
export default compose(
  formatterCollections({
    code: 'smodr.afterSaleManage',
  }),
)(AfterSaleWfp);