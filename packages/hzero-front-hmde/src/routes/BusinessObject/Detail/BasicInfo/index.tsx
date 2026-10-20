/*
 * @Descripttion: 业务对象详情基础信息维护界面
 * @Date: 2021-08-05 10:10:51
 * @Author: ZHIJIAN.XU@HAND-CHINA.COM
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { getResponse, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import intl from 'srm-front-boot/lib/utils/intl';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import { enableTagRender } from 'hzero-front/lib/utils/renderer';
import { observer } from 'mobx-react-lite';
import {
  Button,
  Form,
  Output,
  IntlField,
  Icon,
  TextField,
  Tooltip,
  CheckBox,
} from 'choerodon-ui/pro';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { ButtonType } from 'choerodon-ui/pro/lib/button/enum';
import { statusTagRender } from '@/utils/render';
import { PublishStatus, SourceType } from '@/businessGlobalData/common';
import styles from '../index.less';

const BaseInfo = ({ dataSet }) => {
  const handleSaveBaseInfo = async () => {
    if ((await dataSet.current.validate()) && dataSet.current.dirty) {
      const res = await dataSet.submit();
      if (getResponse(res)) {
        await dataSet.query();
      }
    }
  };

  const sourceType = dataSet.current?.get('sourceType');

  // 租户看到的平台标准对象禁用
  const tenantDisabled =
    sourceType === SourceType.PREDEFINE ||
    (isTenantRoleLevel() && sourceType === SourceType.PLATFORM);

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}
      >
        <h3 className={styles.title}>
          {intl.get('hmde.common.view.message.baseInfo').d('基础信息')}
        </h3>
        {!isTenantRoleLevel() && [SourceType.PLATFORM, SourceType.TENANT].includes(sourceType) && (
          <Button
            type={ButtonType.submit}
            disabled={!dataSet.dirty}
            onClick={() => handleSaveBaseInfo()}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        )}
      </div>
      <Form labelLayout={LabelLayout.float} dataSet={dataSet} useColon={false} columns={3} disabled={tenantDisabled}>
        {sourceType === SourceType.PREDEFINE ? (
          <Output name="businessObjectName" />
        ) : (
          <IntlField name="businessObjectName" colSpan={1} suffix={<Icon type="language" />} />
        )}
        <TextField disabled name="businessObjectCode" colSpan={1} />
        <TextField disabled name="sourceType" colSpan={1} />
        <TextField disabled name="physicalModelName" colSpan={1} />
        <Output
          name="publishStatus"
          style={{ marginTop: '-8px' }}
          colSpan={1}
          renderer={({ value }) => statusTagRender(value)}
        />
        <Output
          name="enabledFlag"
          colSpan={1}
          style={{ marginTop: '-8px' }}
          renderer={({ value }) => enableTagRender(value ? 1 : 0)}
        />
        {sourceType === SourceType.PREDEFINE ? (
          <Output name="remark" style={{ marginTop: '-8px' }} />
        ) : (
          <IntlField name="remark" style={{ marginTop: '-8px' }} colSpan={2} suffix={<Icon type="language" />} />
        )}
        <TextField
          disabled
          style={{ marginTop: '-8px' }}
          name="businessType"
          label={intl.get('hmde.bo.view.message.header.objectProps').d('对象属性')}
          renderer={({ value }) => {
            const options = {
              SYSTEM_OBJECT: intl.get('hmde.common.view.title.systemObject').d('系统对象'),
              SRM_OBJECT: intl.get('hmde.common.view.title.businessObject').d('业务对象'),
              DATA_OBJECT: intl.get('hmde.common.view.title.dataObject').d('数据对象'),
            };
            return options[value];
          }}
        />
      </Form>
      <h3 className={styles.title} style={{ margin: '32px 0 20px' }}>
        {intl.get('hmde.common.view.message.createInfo').d('创建信息')}
      </h3>
      <Form labelLayout={LabelLayout.float} dataSet={dataSet} useColon={false} columns={3} disabled={tenantDisabled}>
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
      <h3 className={styles.title} style={{ margin: '32px 0 20px' }}>
        {intl.get('hmde.view.config.advanced').d('高级配置')}
      </h3>
      <Form
        dataSet={dataSet}
        useColon={false}
        labelWidth={'auto' as any}
        columns={3}
        labelLayout={LabelLayout.float}
        disabled={tenantDisabled}
      >
        <CheckBox name="autoCreateFlag" colSpan={1} disabled />
        <TextField disabled name="physicalModelName" colSpan={1} />
        <TextField
          name="customPrimaryKeyCode"
          newLine
          colSpan={1}
          disabled={
            dataSet.current?.get('publishStatus') !== PublishStatus.UNPUBLISHED ||
            !dataSet.current?.get('autoCreateFlag')
          }
          labelWidth={110}
          label={
            <span>
              {intl
                .get('hmde.domainOwnBOList.view.message.header.customPrimaryKeyCode')
                .d('自定义主键编码')}
              <Tooltip
                placement="top"
                title={intl
                  .get('hmde.common.view.message.onlySupportSmallHumps')
                  .d('仅支持小驼峰')}
              >
                <Icon type="help_outline" className={styles['help-icon']} />
              </Tooltip>
            </span>
          }
        />
      </Form>
    </>
  );
};

export default formatterCollections({ code: ['hmde.common', 'hzero.common', 'hmde.view', 'hmde.domainOwnBOList'] })(observer(BaseInfo));
