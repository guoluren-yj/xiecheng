/*
 * @Descripttion: 创建业务对象弹窗
 * @Date: 2021-08-05 13:34:49
 * @Author: ZHIJIAN.XU@HAND-CHINA.COM
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */
import React, { useMemo, useEffect } from 'react';
import intl from 'srm-front-boot/lib/utils/intl';
import { TagRender } from 'hzero-front/lib/utils/renderer';
import { getResponse, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import { observer } from 'mobx-react-lite';
import {
  DataSet,
  Form,
  TextField,
  Output,
  SelectBox,
  Lov,
  IntlField,
  Icon,
  Tooltip,
  Select,
} from 'choerodon-ui/pro';
import { Collapse } from 'choerodon-ui';
import { isEmpty } from 'lodash';

import BusinessObjectDataSet from '@/stores/BusinessObject/BusinessObjectDS';
import { PublishStatus } from '@/businessGlobalData/common';
import ImgIcon from '@/utils/ImgIcon';
import { enableRender } from '@/utils/render';

import styles from './index.less';

const { Option } = SelectBox;
const { Panel } = Collapse;

const CreateBOModal = ({
  modal,
  dataSet,
  domainId,
  serviceCode,
  domainCode,
  extendTableEnabledFlag,
}) => {
  const boFormDs = useMemo(
    () => new DataSet(BusinessObjectDataSet({ domainId, serviceCode, domainCode })),
    []
  );
  useEffect(() => {
    boFormDs.create({
      businessObjectName: '',
      businessObjectCode: '',
      remark: '',
      sourceType: isTenantRoleLevel() ? 'TENANT' : 'PLATFORM',
      enabledFlag: true,
      publishStatus: PublishStatus.UNPUBLISHED,
      autoCreateFlag: true,
      physicalModelName: '',
    });
  }, []);

  modal.handleOk(async () => {
    if ((await boFormDs.validate()) && boFormDs.current) {
      const { tableName, autoCreateFlag } =
        boFormDs.current.get(['tableName', 'autoCreateFlag']) || {};
      if (!autoCreateFlag && !isEmpty(tableName)) {
        boFormDs.current.set('physicalModelName', tableName.name);
      }
      const res = await boFormDs.submit();
      if (getResponse(res)) {
        await dataSet.query();
      }
      return true;
    } else {
      return false;
    }
  });

  return (
    <>
      <Form dataSet={boFormDs} useColon={false} columns={2}>
        <IntlField name="businessObjectName" colSpan={1} suffix={<Icon type="language" />} />
        <TextField name="businessObjectCode" colSpan={1} addonBefore={`${domainCode}_`} />
        <IntlField
          name="remark"
          colSpan={1}
          style={{ height: '80px' }}
          suffix={<Icon type="language" />}
        />
        <Output name="sourceType" colSpan={1} newLine />
        <Output name="enabledFlag" colSpan={1} renderer={({ value }) => enableRender(value)} />
        <Output
          name="publishStatus"
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
                status: PublishStatus.UNPUBLISHED,
                text: intl.get('hmde.common.status.unpublished').d('未发布'),
              },
            ];
            return TagRender(value, statusList);
          }}
        />
        <Select name="businessType">
          <Select.Option value="SYSTEM_OBJECT">
            {intl.get('hmde.common.view.title.systemObject').d('系统对象')}
          </Select.Option>
          <Select.Option value="SRM_OBJECT">
            {intl.get('hmde.common.view.title.businessObject').d('业务对象')}
          </Select.Option>
          <Select.Option value="DATA_OBJECT">
            {intl.get('hmde.common.view.title.dataObject').d('数据对象')}
          </Select.Option>
        </Select>
      </Form>
      <Collapse ghost expandIconPosition="text-right">
        <Panel
          key="advanced"
          header={
            <span className={styles['modal-title']}>
              {intl.get('hmde.common.view.title.advancedConfig').d('高级配置')}
            </span>
          }
        >
          <Form dataSet={boFormDs} columns={2} useColon={false} labelWidth="auto">
            <SelectBox name="autoCreateFlag" colSpan={1}>
              <Option value={false}>{intl.get('hzero.common.status.yes').d('是')}</Option>
              <Option value>{intl.get('hzero.common.status.no').d('否')}</Option>
            </SelectBox>
            {!boFormDs.current?.get?.('autoCreateFlag') ? (
              <>
                <Lov name="tableName" colSpan={1} />
                {extendTableEnabledFlag && <Lov name="extPhysicalModel" colSpan={1} />}
              </>
            ) : (
                <>
                  <TextField name="physicalModelName" colSpan={1} />
                  {extendTableEnabledFlag && <TextField name="extendsTableName" colSpan={1} />}
                </>
              )}
            {/* {boFormDs.current?.get?.('autoCreateFlag') && (
              <TextField name="physicalModelName" colSpan={1} />
            )} */}

            <TextField
              name="customPrimaryKeyCode"
              colSpan={1}
              labelWidth={110}
              label={
                <span>
                  {intl.get('hmde.bo.view.message.header.customPrimaryKeyCode').d('自定义主键编码')}
                  <Tooltip
                    placement="top"
                    title={intl
                      .get('hmde.common.view.message.onlySupportSmallHumps')
                      .d('仅支持小驼峰')}
                  >
                    <ImgIcon name="help.svg" size={14} />
                  </Tooltip>
                </span>
              }
              disabled={!boFormDs.current?.get?.('autoCreateFlag')}
            />
            {boFormDs.current?.get?.('autoCreateFlag') && (
              <SelectBox name="refExtFieldFlag" colSpan={1}>
                <Option value>{intl.get('hzero.common.status.yes').d('是')}</Option>
                <Option value={false}>{intl.get('hzero.common.status.no').d('否')}</Option>
              </SelectBox>
            )}
          </Form>
        </Panel>
      </Collapse>
    </>
  );
};

export default formatterCollections({ code: ['hmde.common', 'hzero.common', 'hmde.bo'] })(
  observer(CreateBOModal)
);
