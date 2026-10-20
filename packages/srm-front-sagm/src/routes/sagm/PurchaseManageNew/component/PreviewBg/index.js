import React from 'react';
import { Button, Icon, Form, Select, DataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import bg from '@/assets/bg_setting.png';
import styles from './index.less';

export default function PreviewBg(props) {
  const { type = '' } = props;
  const virtualDs = new DataSet({
    data: [
      {
        purchaseOrg: intl.get('sagm.purchaseManageNew.model.purchaseOrgValue').d('某某采购部门'),
        company: intl.get('sagm.purchaseManageNew.model.companyValue').d('某某科技有限公司'),
        customDemission: intl.get('sagm.purchaseManageNew.model.demissionValue').d('自定义维度值'),
      },
    ],
    fields: [
      {
        name: 'purchaseOrg',
        required: true,
        label: intl.get('sagm.purchaseManageNew.model.purchaseOrg').d('采买组织'),
      },
      {
        name: 'company',
        required: true,
        label: intl.get('sagm.purchaseManageNew.model.companyName').d('公司'),
      },
      {
        name: 'customDemission',
        required: true,
        label: intl.get('sagm.purchaseManageNew.model.customDemission').d('自定义维度名称'),
      },
    ],
  });
  return (
    <div className={styles['preview-warp']}>
      <div className={styles['preview-warp-position']}>
        <img src={bg} alt="img" className={styles['setting-preview-img']} />
        <p className={styles['company-area']}>
          <span>
            {intl.get('sagm.purchaseManageNew.view.preview.company').d('上海甄云信息科技有限公司-')}
          </span>
          <Icon type="arrow_drop_down" />
        </p>
        <div className={styles['modal-area']}>
          <p className={styles['modal-area-title']}>
            {intl.get('sagm.purchaseManageNew.view.preview.formModal.title').d('采买身份选择')}
          </p>
          <div className={styles['modal-area-content']}>
            <Form labelLayout="float" dataSet={virtualDs}>
              <Select name="purchaseOrg" disabled />
              {type !== 'BUSINESS_UNIT' && <Select name="company" disabled />}
              <Select name="customDemission" disabled />
            </Form>
          </div>
          <div className={styles['modal-area-footer']}>
            <Button
              style={{ backgroundColor: '#FF5533', color: '#fff', borderColor: 'transparent' }}
            >
              {intl.get('hzero.common.button.ok').d('确定')}
            </Button>
            <Button style={{ color: '#1d2129', borderColor: 'rgba(0,0,0,.2)' }}>
              {intl.get('hzero.common.button.cancel').d('取消')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
