import React, { useMemo, useEffect } from 'react';
import { compose } from 'lodash';
import { Attachment, Table, DataSet } from 'choerodon-ui/pro';
import qs from 'qs';

import RenderForm from '@/routes/components/RenderForm';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import HeadLine from '@/routes/components/HeadLine';
import AlertTips from '@/components/AlertTips';

import { baseDs, tableDs } from './ds';
import { baseDsFields, tableDsFields } from './dataSource';

import styles from './index.less';

const PRIVATE_BUCKET = window.$$env.PRIVATE_BUCKET || 'private-bucket';

function ReadPage(props) {
  const { onFormLoaded } = props;
  const { requestId } = qs.parse(props.history.location.search.substr(1));
  const baseDS = useMemo(() => new DataSet(baseDs()), []);
  const skuDS = useMemo(() => new DataSet(tableDs()), []);
  const renderFields = useMemo(() => baseDsFields().filter(i => i.type !== 'attachment'), []);

  useEffect(() => {
    initData();
  }, []);

  const initData = async () => {
    baseDS.setQueryParameter('requestId', requestId);
    skuDS.setQueryParameter('requestId', requestId);
    await baseDS.query();
    await skuDS.query();
    if (onFormLoaded && baseDS.current) {
      onFormLoaded(true);
    }
  };

  return (
    <>
      <Header title={intl.get('smodr.apply.view.applyDetailApprove').d('商城申请审批')} />
      <AlertTips
        message={intl.get('smodr.apply.view.tips').d('因受商品数量、收货地址、拆单规则等影响，本阶段无法估算准确的附加费金额，故当前总金额不包含此部分，请以转单后订单金额为准')}
      />
      <Content className={styles['apply-detail-approve']}>
        <HeadLine title={intl.get('smodr.apply.view.baseInfo').d('基本信息')} />
        <RenderForm
          columns={3}
          dataSet={baseDS}
          code='SMODR.REQUEST.DETAIL.WORKFLOW'
          fields={renderFields}
          customizeForm={props.customizeForm}
        />
        <HeadLine title={intl.get('smodr.apply.view.skuInfo').d('商品信息')} style={{ marginTop: '32px' }} />
        {props.customizeTable(
          {
            code: 'SMODR.REQUEST.DETAIL.WORKFLOW.SKU.INFO',
            readOnly: true,
          },
          <Table dataSet={skuDS} columns={tableDsFields()} />
        )}
        {/* <HeadLine title={intl.get('smodr.apply.model.attachmentUuid').d('附件')} style={{ marginTop: '32px' }} /> */}
        <div style={{ display: 'flex', marginTop: 32 }}>
          <div style={{ flex: 1, paddingRight: 20 }}>
            <div className="sub-title" id="ACC_INFO">
              {intl.get('smodr.orderDetail.model.accessoryInner').d('内部附件')}
            </div>
            <Attachment
              readOnly
              showHistory
              dataSet={baseDS}
              bucketName={PRIVATE_BUCKET}
              name='attachmentUuid'
              labelLayout='float'
              label={intl.get('smodr.orderDetail.model.purchaseAttachment').d('采购方附件')}
            />
          </div>
          <div style={{ paddingLeft: 16, borderLeft: '1px dashed rgba(0,0,0,0.16)', flex: 1 }}>
            <div className="sub-title" id="ACC_INF_OUT">
              {intl.get('smodr.orderDetail.model.accessoryOutter').d('外部附件')}
            </div>
            <Attachment
              readOnly
              showHistory
              dataSet={baseDS}
              bucketName={PRIVATE_BUCKET}
              name="outerAttachmentUuid"
              labelLayout="float"
              label={intl.get('smodr.orderDetail.model.purchaseAttachment').d('采购方附件')}
            />
          </div>
        </div>
        {/* <div style={{ width: 400 }}>
          <Attachment
            readOnly
            showHistory
            dataSet={baseDS}
            name='attachmentUuid'
            labelLayout='float'
            label={intl.get('smodr.apply.model.attachmentUuid').d('附件')}
          />
        </div> */}
      </Content>
    </>
  );
}

export default compose(
  formatterCollections({
    code: ['smodr.orderDetail', 'smodr.apply', 'smodr.common'],
  }),
  withCustomize({
    unitCode: ['SMODR.REQUEST.DETAIL.WORKFLOW', 'SMODR.REQUEST.DETAIL.WORKFLOW.SKU.INFO'],
  }),
)(ReadPage);
