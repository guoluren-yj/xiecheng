/**
 * AttachmentInfo - 附件信息
 * @date: 2021-11-18
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { useEffect } from 'react';
import moment from 'moment';
import { Table, Attachment, Cascader } from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
import { PRIVATE_BUCKET } from '_utils/config';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import intl from 'utils/intl';
import { Content } from 'components/Page';
import styles from '../../index.less';

const AttachmentInfo = ({
  dataSet,
  isEdit,
  changeReqId,
  attachmentInfo = {},
  showAllTab = true,
  remoteHiddenTips = false,
}) => {
  const { remark, atLeastFlag: atLeast = 1, enableFieldList = [] } = attachmentInfo;
  const showTips = isEdit && !showAllTab && !!atLeast && !remoteHiddenTips;

  useEffect(() => {
    if (changeReqId) {
      dataSet.setQueryParameter('changeReqId', changeReqId);
      dataSet.query();
    }
  }, [changeReqId]);

  /**
   * 设置最新更新时间
   * @param {object} record 行数据
   */
  const setLastUploadTime = record => {
    const time = moment();
    record.set(`uploadDate`, time.format(DEFAULT_DATETIME_FORMAT));
  };

  const columns = [
    {
      name: 'attachmentTypeMerge',
      width: 220,
      tooltip: 'none',
      editor: record => {
        return (
          isEdit && (
            <Cascader
              style={{ width: '100%' }}
              onChange={data => {
                if (data && data.length) {
                  record.set('attachmentType', data[0]);
                  record.set('subAttachment', data[1]);
                } else {
                  record.set('attachmentType', null);
                  record.set('subAttachment', null);
                }
              }}
              expandTrigger="hover"
              placeholder=""
            />
          )
        );
      },
    },
    {
      name: 'description',
      width: 180,
      editor: isEdit,
    },
    {
      name: 'endDate',
      width: 180,
      editor: isEdit,
    },
    {
      name: 'longEffectiveFlag',
      width: 120,
      editor: isEdit,
    },
    {
      name: 'uploadDate',
      width: 180,
    },
    {
      name: 'attachmentUuid',
      width: 150,
      editor: record => (
        <Attachment
          name="attachmentUuid"
          bucketName={PRIVATE_BUCKET}
          bucketDirectory="spfm-comp"
          funcType="link"
          viewMode="popup"
          readOnly={!isEdit}
          onAttachmentsChange={() => setLastUploadTime(record)}
        />
      ),
    },
    {
      name: 'remark',
      width: 200,
      editor: isEdit,
    },
  ].filter(item => {
    return enableFieldList.includes(item.name);
  });
  const buttons = isEdit
    ? [
        'add',
        [
          'delete',
          {
            onClick: () =>
              dataSet.delete(dataSet.selected, {
                title: intl.get('hzero.common.message.confirm.title').d('提示'),
                children: intl
                  .get('spfm.supplierRegister.view.message.deleteConfirm')
                  .d('确认删除选中行？'),
              }),
          },
        ],
      ]
    : [];
  return (
    <Content>
      <div className={styles['certification-title']} id="spfm_company_attachment">
        {intl.get(`spfm.supplierRegister.view.title.attachmentInfo`).d('附件信息')}
        {showTips && (
          <span className={styles['certification-title-tips']}>
            {intl
              .get('spfm.enterpriseCertification.view.register.attachmentAtLast', {
                atLeast,
              })
              .d(`请至少填写${atLeast}条附件信息`)}
          </span>
        )}
      </div>
      {remark && <Alert showIcon type="info" message={remark} style={{ marginBottom: 8 }} />}
      <Table
        dataSet={dataSet}
        columns={columns}
        buttons={buttons}
        selectionMode={isEdit ? 'rowbox' : 'click'}
        virtualCell={false}
      />
    </Content>
  );
};
export default AttachmentInfo;
