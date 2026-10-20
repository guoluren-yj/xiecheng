import React, { Fragment, useMemo, useState, useImperativeHandle } from 'react';
import { Table, SelectBox, DataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSRC } from '_utils/config';
import { yesOrNoRender } from 'utils/renderer';

import style from './index.less';

const organizationId = getCurrentOrganizationId();
const { Option } = SelectBox;

/**
 * @description 若要增加传参或者修改请关注下PubPagesEntry/RF/RFLackQuotedIndex文件
 */
export default function RFLackQuotedModal({
  rfHeaderId,
  quotedSupplierCount,
  expertScoreType,
  rFLackQuotedModalRef,
}) {
  // 暴露子组件的api给父组件使用
  useImperativeHandle(rFLackQuotedModalRef, () => ({
    result,
  }));

  const [result, setResult] = useState('timeAdjust');

  const tableDs = useMemo(
    () =>
      new DataSet({
        autoQuery: true,
        selection: false,
        fields: [
          {
            label: intl.get(`ssrc.common.model.common.quotationNum`).d('供应商编码'),
            name: 'supplierCompanyNum',
          },
          {
            label: intl.get(`ssrc.common.model.common.supplierName`).d('供应商名称'),
            name: 'supplierCompanyName',
          },
          {
            name: 'feedbackStatusMeaning',
            label: intl.get(`ssrc.common.model.common.isParticipate`).d('是否参与'),
          },
          {
            name: 'quotationStatusMeaning',
            label: intl.get('ssrc.common.model.common.isReply').d('是否回复'),
          },
          {
            name: 'updatedAttachmentFlag',
            label: intl.get('ssrc.common.model.common.updatedAttachment').d('是否上传头附件'),
            type: 'boolean',
            trueValue: 1,
            falseValue: 0,
          },
        ],
        transport: {
          read: () => ({
            url: `${SRM_SSRC}/v1/${organizationId}/rf/${rfHeaderId}/quotation/detail`,
            method: 'GET',
          }),
        },
      }),
    []
  );

  const columns = useMemo(
    () => [
      {
        name: 'supplierCompanyNum',
        width: 150,
      },
      {
        name: 'supplierCompanyName',
        width: 200,
      },
      {
        name: 'feedbackStatusMeaning',
        width: 100,
      },
      {
        name: 'quotationStatusMeaning',
        width: 100,
      },
      {
        name: 'updatedAttachmentFlag',
        renderer: ({ value }) => yesOrNoRender(value),
      },
    ],
    []
  );

  return (
    <Fragment>
      <h3 style={{ marginBottom: '16px' }}>
        <div className={style.borderLeft} />
        {intl.get('ssrc.common.view.subtitle.supplierResponse').d('供应商响应情况')}
      </h3>
      <Table dataSet={tableDs} columns={columns} customizedCode="SSRC.NEW_INQUIRY_HALL.LIST.RF_LINE_SUPPLIER_RESPONSE" />
      <h3 style={{ marginTop: '32px', marginBottom: '16px' }}>
        <div className={style.borderLeft} />
        {intl.get('ssrc.common.view.subtitle.result').d('执行结果')}
      </h3>
      <SelectBox vertical value={result} onChange={(val) => setResult(val)}>
        <Option style={{ padding: '6px 0' }} value="closeRF">
          {intl.get('ssrc.common.model.common.closeRF').d('关闭征询单')}
        </Option>
        {quotedSupplierCount > 0 ? (
          expertScoreType === 'ONLINE' ? (
            <Option style={{ padding: '6px 0' }} value="expertScore">
              {intl.get('ssrc.common.model.common.expertScore').d('下发专家评分')}
            </Option>
          ) : (
            <Option style={{ padding: '6px 0' }} value="checkSupplier">
              {intl.get('ssrc.common.model.common.checkSupplier').d('开始确定供应商')}
            </Option>
          )
        ) : null}
        <Option style={{ padding: '6px 0' }} value="timeAdjust">
          {intl.get('ssrc.common.model.common.timeAdjust').d('时间调整')}
        </Option>
      </SelectBox>
    </Fragment>
  );
}
