/*
 * @Date: 2022-12-21 18:08:19
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useMemo, useEffect } from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import { isReview, reviewFile, downLoadFile } from '@/routes/components/utils';
import { fetchSupplierBasicInfo } from '@/services/supplierInformCompareService';
import { getAttachmentModalDS } from '@/routes/SupplierInformNew/stores/getSupplyAbilityDS';
import styles from '../../styles.less';

const AttachmentModal = ({ abilityLineId, custLoading, customizeTable }) => {
  const newDs = new DataSet(getAttachmentModalDS(false, abilityLineId, true));
  const oldDs = new DataSet(getAttachmentModalDS(false, abilityLineId, true));

  useEffect(() => {
    fetchSupplierBasicInfo({
      key: 'supChangeAbilityLnAtts',
      abilityLineId,
      compareFlag: 2,
    }).then(response => {
      const res = getResponse(response);
      if (res) {
        const { newSupChangeAbilityLnAtts, oldSupChangeAbilityLnAtts } = res;
        newDs.loadData(newSupChangeAbilityLnAtts);
        oldDs.loadData(oldSupChangeAbilityLnAtts);
      }
    });
  }, [abilityLineId]);

  const columns = useMemo(
    () => [
      {
        name: 'attachmentDesc',
        width: 150,
        renderer: ({ value, record }) => {
          const { attachmentDesc, attachmentUrl } = record.get(['attachmentDesc', 'attachmentUrl']);
          return isReview(attachmentDesc) && attachmentUrl ? (
            <a
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => reviewFile(attachmentDesc, attachmentUrl)}
            >
              {value}
            </a>
          ) : (
            value
          );
        },
      },
      {
        name: 'attachmentSize',
        width: 120,
        renderer: ({ value }) => {
          if (value) {
            const size = `${value / (1024 * 1024)}`;
            return size.substring(0, 5);
          } else {
            return 0;
          }
        },
      },
      {
        name: 'uploadUserName',
        width: 120,
      },
      {
        name: 'uploadDate',
        width: 150,
      },
      {
        name: 'attachmentType',
        width: 150,
      },
      {
        name: 'dueDate',
        width: 180,
      },
      {
        name: 'remark',
        width: 150,
      },
      {
        name: 'option',
        width: 80,
        renderer: ({ record }) => {
          const { tenantId, attachmentUrl } = record.get(['tenantId', 'attachmentUrl']);
          return (
            attachmentUrl && (
              <a
                href={downLoadFile({ tenantId, attachmentUrl })}
                target="_blank"
                rel="noopener noreferrer"
              >
                {intl.get('hzero.common.button.download').d('下载')}
              </a>
            )
          );
        },
      },
    ],
    []
  );

  return (
    <div className={styles['compare-container']} style={{ height: '100%' }}>
      <div className={styles['compare-header']}>
        <div style={{ paddingLeft: 20 }}>
          {intl.get('sslm.common.view.compare.currentVersion').d('当前版本')}
        </div>
        <div>{intl.get('sslm.common.view.compare.historyVersion').d('历史版本')}</div>
      </div>
      <div className={styles['compare-content']}>
        <div>
          <div className={styles['compare-content-detail']}>
            {customizeTable(
              {
                code: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.ABILITY_LINE_ATTACHMENT',
                readOnly: true,
              },
              <Table
                dataSet={newDs}
                columns={columns}
                custLoading={custLoading}
                style={{ maxHeight: 430, padding: '20px 0' }}
              />
            )}
          </div>
        </div>
        <div>
          {customizeTable(
            {
              code: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.ABILITY_LINE_ATTACHMENT',
              readOnly: true,
            },
            <Table
              dataSet={oldDs}
              columns={columns}
              custLoading={custLoading}
              style={{ maxHeight: 430, padding: '20px 0' }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AttachmentModal;
