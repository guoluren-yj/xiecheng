import React, { Fragment, useMemo } from 'react';
import {
  Button,
  DataSet,
  Table,
  Modal,
  TextField,
  IntlField,
  NumberField,
  Form,
} from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { MEMBER_MANAGE } from '@/utils/config';
import { CODE } from 'utils/regExp';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

import RecordTime from '@/components/RecordTime';
import { validateUseBySaleProtocol, fetchSubmit } from '@/services/integralTypeManage';
import { confirm } from '@/utils/c7nModal';
import { code } from '@/utils/codeConfig';
import { recordLineRender } from './render';

import style from './styles.less';

const { isEnabled } = code.memberCentre;

function IntegralTypeManage() {
  const exchangeRateHelp = intl
    .get('sigl.integral.view.message.exchangeRate')
    .d('积分-现金的转换比例，如100为100积分对应1现金');
  const organizationId = useMemo(() => getCurrentOrganizationId(), []);

  const dataSet = useMemo(
    () =>
      new DataSet({
        autoQuery: true,
        selection: false,
        pageSize: 20,
        fields: [
          {
            name: 'enableFlag',
            label: intl.get('hzero.common.button.status').d('状态'),
            lookupCode: isEnabled,
          },
          {
            name: 'pointsTypeCode',
            label: intl.get('sigl.integral.view.integralType.code').d('积分类型编码'),
            pattern: CODE,
            maxLength: 30,
            required: true,
            defaultValidationMessages: {
              patternMismatch: intl
                .get('hzero.common.validation.code')
                .d('大小写及数字，必须以字母、数字开头，可包含“-”、“_”、“.”、“/”'),
            },
            computedProps: {
              disabled: ({ record }) => record.get('pointsTypeId'),
            },
          },
          {
            name: 'pointsTypeName',
            label: intl.get('sigl.integral.view.integralType.name').d('积分类型名称'),
            maxLength: 6,
            required: true,
          },
          {
            name: 'exchangeRate',
            label: intl.get('sigl.integral.view.integralExchangeRate').d('积分汇率'),
            type: 'number',
            required: true,
            max: 9999999999,
            // precision: 10,
            step: 1,
            min: 0,
            computedProps: {
              disabled: ({ record }) => record.get('pointsTypeId'),
            },
          },
        ],
        transport: {
          read: {
            url: `/sigl/v1/${organizationId}/points-types`,
            method: 'GET',
          },
        },
      }),
    []
  );

  const saveEnableChange = async (record) => {
    const enableFlag = record.get('enableFlag');
    await fetchSubmit([{ ...record.toJSONData(), enableFlag: Number(!enableFlag) }]);
    await dataSet.query();
  };

  const handleEnable = async (record) => {
    const enableFlag = record.get('enableFlag');
    // 禁用先校验
    if (enableFlag) {
      const res = await validateUseBySaleProtocol(record.toData());
      // 结果非0, 提示
      if (getResponse(res)) {
        confirm({
          content: intl
            .get('sigl.integral.view.modal.enableIntegralTypeMsg')
            .d('该操作将会导致使用此积分类型的销售协议失效'),
          onOk: () => saveEnableChange(record),
        });
      } else {
        saveEnableChange(record);
      }
    } else {
      saveEnableChange(record);
    }
  };

  const openRecordModal = (record) => {
    const { pointsTypeId, pointsTypeName } = record.get(['pointsTypeId', 'pointsTypeName']);
    const ds = new DataSet({
      autoQuery: false,
      paging: false,
      transport: {
        read: ({ data }) => ({
          url: `${MEMBER_MANAGE}/v1/${organizationId}/points-types/operation-record`,
          method: 'GET',
          data: { ...data, pointsTypeId: record.get('pointsTypeId') },
        }),
      },
    });
    ds.setQueryParameter('pointsTypeId', pointsTypeId);
    ds.query();
    const title = intl.get('hzero.common.view.message.operateHistory').d('操作记录');
    Modal.open({
      title,
      drawer: true,
      style: { width: 742 },
      okText: intl.get('hzero.common.button.close').d('关闭'),
      okCancel: false,
      children: (
        <RecordTime dataSet={ds} renderer={(args) => recordLineRender(args, pointsTypeName)} />
      ),
    });
  };

  const openEditModal = (outRecord = null) => {
    const ds = new DataSet({
      autoQuery: false,
      fields: [
        {
          name: 'pointsTypeCode',
          label: intl.get('sigl.integral.view.integralType.code').d('积分类型编码'),
          pattern: CODE,
          maxLength: 30,
          required: true,
          defaultValidationMessages: {
            patternMismatch: intl
              .get('hzero.common.validation.code')
              .d('大小写及数字，必须以字母、数字开头，可包含“-”、“_”、“.”、“/”'),
          },
          computedProps: {
            disabled: ({ record }) => record.get('pointsTypeId'),
          },
        },
        {
          name: 'pointsTypeName',
          type: 'intl',
          label: intl.get('sigl.integral.view.integralType.name').d('积分类型名称'),
          maxLength: 6,
          required: true,
        },
        {
          name: 'exchangeRate',
          label: intl.get('sigl.integral.view.integralExchangeRate').d('积分汇率'),
          type: 'number',
          required: true,
          max: 9999999999,
          step: 1,
          min: 0,
          computedProps: {
            disabled: ({ record }) => record.get('pointsTypeId'),
          },
        },
      ],
      transport: {
        submit: {
          url: `/sigl/v1/${organizationId}/points-types`,
          method: 'POST',
        },
      },
    });
    ds.loadData([outRecord ? outRecord.toData() : { tenantId: organizationId }]);
    return Modal.open({
      drawer: true,
      style: { width: 380 },
      children: (
        <Form labelLayout="float" dataSet={ds}>
          <TextField name="pointsTypeCode" />
          <IntlField name="pointsTypeName" />
          <NumberField name="exchangeRate" help={exchangeRateHelp} showHelp="tooltip" />
        </Form>
      ),
      title: outRecord
        ? intl.get('sigl.integral.view.editPotinsType').d('编辑积分类型')
        : intl.get('sigl.integral.view.newPotinsType').d('新建积分类型'),
      onOk: async () => {
        const flag = await ds.validate();
        if (flag) {
          await ds.submit();
          dataSet.query();
        }
      },
    });
  };

  const columns = useMemo(
    () => [
      {
        name: 'enableFlag',
        renderer: ({ record }) => (
          <Tag color={!record.get('enableFlag') ? 'red' : 'green'} border={false}>
            {record.get('enableFlagMeaning')}
          </Tag>
        ),
      },
      {
        name: 'pointsTypeCode',
        renderer: ({ record }) => {
          return (
            <span>
              <a onClick={() => openEditModal(record)}>{record.get('pointsTypeCode')}</a>
            </span>
          );
        },
      },
      { name: 'pointsTypeName' },
      {
        name: 'exchangeRate',
        help: exchangeRateHelp,
      },
      {
        name: 'action',
        width: 200,
        header: intl.get('hzero.common.action').d('操作'),
        renderer: ({ record }) => {
          const enableFlag = record.get('enableFlag');
          return (
            <span className={style['action-link']}>
              <>
                <Button funcType="link" onClick={() => handleEnable(record)}>
                  {enableFlag
                    ? intl.get('hzero.common.button.unEnabled').d('禁用')
                    : intl.get('hzero.common.button.enable').d('启用')}
                </Button>
                <Button funcType="link" onClick={() => openRecordModal(record)}>
                  {intl.get('hzero.common.button.operation').d('操作记录')}
                </Button>
              </>
            </span>
          );
        },
      },
    ],
    []
  );

  return (
    <Fragment>
      <Header title={intl.get('sigl.integral.view.title.integralTypeManage').d('积分类型管理')}>
        <Button color="primary" icon="add" onClick={() => openEditModal()}>
          {intl.get('hzero.common.button.new').d('新建')}
        </Button>
      </Header>
      <Content>
        <Table
          dataSet={dataSet}
          customizedCode="customized"
          columns={columns}
          editMode="inline"
          style={{ maxHeight: 'calc(100vh - 234px)' }}
        />
      </Content>
    </Fragment>
  );
}

export default formatterCollections({
  code: ['sigl.integral', 'sagm.common'],
})(IntegralTypeManage);
