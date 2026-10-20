import React, { Fragment, useMemo, useContext, useEffect, useCallback } from 'react';
import { Table, Output, Attachment, Icon } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import querystring from 'querystring';
import intl from 'utils/intl';

import CollapseForm from '_components/CollapseForm';
import notification from 'utils/notification';
import { openTab } from 'utils/menuTab';
import { PUBLIC_BUCKET } from '_utils/config';

import { FIlESIZE } from '@/utils/SsrcRegx';
import Store from '../../store/index';

export default observer(function InviteRangeCard(props) {
  const {
    routerParams: { sourceCategory, rfHeaderId },
    commonDs: { createBasicFormDs, supplierTableDs, noticeDs },
    history,
    customizeCollapseForm,
    customizeTable,
  } = useContext(Store);
  const { sslmLifeCycleFlag } = props;
  const { current } = createBasicFormDs;

  useEffect(() => {
    if (current?.get('sourceMethod') === 'INVITE') {
      supplierTableDs.query();
    }
  }, [current?.get('sourceMethod')]);

  // 跳转供应商生命周期管理
  const jumpSupplierLifeManagerDetail = useCallback(
    (record) => {
      const {
        location: { pathname = null, search },
      } = history || {};
      const recordData = record.toData() || {};
      const companyId = createBasicFormDs?.current?.get('companyId');
      const {
        tenantId,
        partnerCompanyId,
        partnerTenantId,
        spfmSupplierCompanyId,
        spfmCompanyId,
        supplierCompanyId,
      } = recordData;

      if (
        !companyId ||
        !partnerCompanyId ||
        !partnerTenantId ||
        !spfmSupplierCompanyId ||
        !supplierCompanyId
      ) {
        return;
      }

      const params = {
        tenantId,
        companyId,
        partnerCompanyId,
        partnerTenantId,
        spfmPartnerCompanyId: spfmSupplierCompanyId,
        spfmCompanyId,
        supplierCompanyId,
      };
      const searchParams = querystring.stringify(params);
      if (sslmLifeCycleFlag) {
        history.push({
          pathname: '/sslm/supplier-detail-new',
          search: searchParams,
          state: {
            historyBack: pathname + search,
            ...params,
          },
        });
      } else {
        history.push({
          pathname: '/sslm/include/supplier-manager/supplier-detail',
          search: searchParams,
          state: {
            historyBack: pathname + search,
            ...params,
          },
        });
      }
    },
    [sslmLifeCycleFlag]
  );

  // 招标公告预览
  const previewNotice = () => {
    const noticeId = noticeDs?.current?.get('noticeId');

    if (!rfHeaderId || !noticeId) {
      notification.warning({
        message: intl
          .get('ssrc.rf.view.warning.saveRfAndNoticeToPreview')
          .d('请先保存征询单和公告信息'),
      });
      return;
    }

    openTab({
      key: `/ssrc/new-inquiry-hall/tender-bid-notice-preview/${sourceCategory}/${createBasicFormDs?.current?.get(
        'tenantId'
      )}/${rfHeaderId}`,
      path: `/ssrc/new-inquiry-hall/tender-bid-notice-preview/${sourceCategory}/${createBasicFormDs?.current?.get(
        'tenantId'
      )}/${rfHeaderId}`,
      // title: intl.get(`ssrc.rf.view.title.tenderBidNotice`).d('招标公告'),
      title: 'srm.common.tab.title.ssrc.tenderNotice',
      closable: true,
    });
  };

  const columns = useMemo(
    () => [
      {
        name: 'supplierCompanyNum',
        width: 150,
        renderer: ({ record, text }) => {
          return record.status === 'add' ? (
            text
          ) : (
            <a onClick={() => jumpSupplierLifeManagerDetail(record)}>{text}</a>
          );
        },
      },
      {
        name: 'supplierCompanyName',
      },
      {
        name: 'stageDescription',
        width: 120,
      },
      {
        name: 'contactName',
        width: 180,
      },
      {
        name: 'contactPhone',
        width: 300,
        renderer: ({ record, text }) =>
          [
            record.getField('internationalTelCode')?.getText(record.get('internationalTelCode')),
            text,
          ]
            .filter(Boolean)
            .join(' | '),
      },
      {
        name: 'contactMail',
        width: 200,
      },
    ],
    [sslmLifeCycleFlag]
  );

  return (
    <Fragment>
      {customizeCollapseForm(
        {
          code: `SSRC.INQUIRY_HALL_RF_DETAIL.INVITE_RANGE_${sourceCategory}`,
          dataSet: createBasicFormDs,
        },
        <CollapseForm
          dataSet={createBasicFormDs}
          columns={3}
          labelLayout="vertical"
          labelAlign="left"
          className="c7n-pro-vertical-form-display"
          useWidthPercent
        >
          <Output name="sourceMethod" />
          <Output name="allowSourceSupplierStages" />
        </CollapseForm>
      )}
      {current?.get('sourceMethod') === 'INVITE' &&
        customizeTable(
          {
            code: `SSRC.INQUIRY_HALL_RF_DETAIL.LINE_SUPPLIER_${sourceCategory}`,
          },
          <Table dataSet={supplierTableDs} columns={columns} style={{ marginTop: '16px' }} />
        )}
      {(current?.get('sourceMethod') === 'OPEN' || current?.get('sourceMethod') === 'ALL_OPEN') &&
        customizeCollapseForm(
          {
            code: `SSRC.INQUIRY_HALL_RF_DETAIL.NOTICES_${sourceCategory}`,
            dataSet: noticeDs,
          },
          <CollapseForm
            dataSet={noticeDs}
            columns={3}
            labelLayout="vertical"
            labelAlign="left"
            className="c7n-pro-vertical-form-display"
            style={{ marginTop: '12px' }}
            useWidthPercent
          >
            <Output name="noticeTitle" clearButton={false} />
            <Output name="noticeDays" />
            <Attachment
              name="noticeAttachmentUuid"
              fileSize={FIlESIZE}
              label={intl.get(`ssrc.rf.model.rf.noticeAttachment`).d('公告附件')}
              bucketName={PUBLIC_BUCKET}
              bucketDirectory="ssrc-rf-tender-notice"
              style={{ paddingLeft: '10px' }}
              newLine
              readOnly
            />
            <Output
              name="noticePreview"
              renderer={() => (
                <a onClick={previewNotice}>
                  <Icon
                    type="find_in_page"
                    style={{ paddingRight: '3px', fontSize: '14px', marginBottom: '2px' }}
                  />
                  {intl.get('ssrc.inquiryHall.model.inquiryHall.noticePreview').d('公告预览')}
                </a>
              )}
            />
          </CollapseForm>
        )}
    </Fragment>
  );
});
