import React, { useEffect } from 'react';
import intl from 'srm-front-boot/lib/utils/intl';
import {
  getResponse,
  isTenantRoleLevel,
  getCurrentOrganizationId,
} from 'hzero-front/lib/utils/utils';
import { observer } from 'mobx-react-lite';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import { Button, Form, IntlField, Output, Icon, TextField } from 'choerodon-ui/pro';
import notification from 'hzero-front/lib/utils/notification';
import { ButtonType } from 'choerodon-ui/pro/lib/button/enum';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { getCompositionDetail, updateBoComposition } from '@/services/businessObjectService';
import { PublishStatus, SourceType } from '@/businessGlobalData/common';
import { TagRender } from '@/utils/render';
import styles from '../index.less';

const BaseInfo = ({ businessObjectCombineId, boCompositionDS }) => {
  useEffect(() => {
    getCompositionDetail(businessObjectCombineId).then(res => {
      if (getResponse(res)) {
        boCompositionDS.loadData([res]);
      }
    });
  }, []);

  const sourceType = boCompositionDS.current?.get('sourceType');
  const tenantId = boCompositionDS.current?.get('tenantId');

  // 租户看到的平台标准对象禁用
  const tenantDisabled =
    sourceType === SourceType.PREDEFINE ||
    (isTenantRoleLevel() && sourceType === SourceType.PLATFORM);

  const handleSave = async () => {
    if (await boCompositionDS.validate()) {
      updateBoComposition({ body: boCompositionDS.current?.toJSONData() }).then(data => {
        if (getResponse(data)) {
          boCompositionDS.deleteAll(false);
          getCompositionDetail(businessObjectCombineId).then(res => {
            if (getResponse(res)) {
              notification.success({
                message: intl.get('hmde.common.status.success').d('成功'),
                description: intl.get('hzero.common.notification.success.save').d('保存成功'),
              });
              boCompositionDS.loadData([res]);
            }
          });
        } else {
          // eslint-disable-next-line no-unused-expressions
          boCompositionDS?.current.reset();
        }
      });
    }
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}
      >
        <h3 className={styles.title}>
          {intl.get('hmde.common.view.message.baseInfo').d('基础信息')}
        </h3>
        {getCurrentOrganizationId() === tenantId &&
          [SourceType.PLATFORM, SourceType.TENANT].includes(sourceType) && (
            <Button
              type={ButtonType.submit}
              onClick={() => {
                handleSave();
              }}
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
          )}
      </div>
      <Form labelLayout={LabelLayout.float} dataSet={boCompositionDS} useColon={false} columns={3} disabled={tenantDisabled}>
        <IntlField name="businessObjectName" colSpan={1} suffix={<Icon type="language" />} />
        <TextField name="businessObjectCode" colSpan={1} disabled />
        <TextField name="sourceType" colSpan={1} disabled />
        <TextField name="masterBusinessObjectName" colSpan={1} disabled />
        <TextField name="masterBusinessObjectCode" colSpan={1} disabled />
        <Output
          name="publishStatus"
          colSpan={1}
          style={{ marginTop: '-8px' }}
          renderer={({ value }) => {
            const statusList = [
              {
                status: PublishStatus.PUBLISHED,
                color: 'green',
                text: intl.get('hmde.common.status.published').d('已发布'),
              },
              {
                status: PublishStatus.MODIFIED,
                color: 'yellow',
                text: intl.get('hmde.common.status.modified').d('已修改'),
              },
              {
                color: 'gray',
                status: PublishStatus.UNPUBLISHED,
                text: intl.get('hmde.common.status.unpublished').d('未发布'),
              },
            ];
            return TagRender(value, statusList);
          }}
        />
        <Output
          name="enabledFlag"
          style={{ marginTop: '-16px' }}
          colSpan={1}
          renderer={({ value }) => {
            const enableList = [
              {
                status: true,
                color: 'green',
                text: intl.get('hzero.common.status.enable').d('启用'),
              },
              {
                status: false,
                color: 'red',
                text: intl.get('hzero.common.status.disable').d('禁用'),
              },
            ];
            return TagRender(value, enableList);
          }}
        />
        <Output
          name="standardFlag"
          colSpan={1}
          style={{ marginTop: '-16px' }}
          renderer={({ value }) => {
            const enableList = [
              {
                status: true,
                color: 'green',
                text: intl.get('hzero.common.status.yes').d('是'),
              },
              {
                status: false,
                color: 'red',
                text: intl.get('hzero.common.status.no').d('否'),
              },
            ];
            return TagRender(value, enableList);
          }}
        />
      </Form>
      <h3 className={styles.title} style={{ margin: '18px 0 10px' }}>
        {intl.get('hmde.common.view.message.createInfo').d('创建信息')}
      </h3>
      <Form
        dataSet={boCompositionDS}
        useColon={false}
        columns={3}
        labelLayout={LabelLayout.float}
      >
        <TextField
          disabled
          label={intl.get('hmde.common.date.creator').d('创建人')}
          renderer={({ record }) => record?.get('createName')}
          colSpan={1}
        />
        <TextField
          disabled
          label={intl.get('hmde.common.date.creation').d('创建时间')}
          renderer={({ record }) => record?.get('creationDate')}
          colSpan={1}
        />
        <TextField
          disabled
          label={intl.get('hmde.common.date.lastUpdatedBy').d('更新人')}
          renderer={({ record }) => record?.get('updateName')}
          colSpan={1}
          newLine
        />
        <TextField
          disabled
          label={intl.get('hmde.common.date.lastUpdateDate').d('更新时间')}
          renderer={({ record }) => record?.get('lastUpdateDate')}
          colSpan={1}
        />
      </Form>
    </div>
  );
};

export default formatterCollections({
  code: ['hmde.boComposition', 'hmde.common', 'hzero.common'],
})(observer(BaseInfo));
