import React, { Fragment, useCallback } from 'react'; // useEffect
import { compose } from 'lodash';
import { connect } from 'dva';

import { Header, Content } from 'components/Page';
import { DataSet, Table, Modal, Form, TextField, Lov, Select, NumberField, Switch, Button } from 'choerodon-ui/pro';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import intl from 'utils/intl';
import withProps from 'utils/withProps';
import formatterCollections from 'utils/intl/formatterCollections';
import { ColumnAlign } from 'choerodon-ui/pro/lib/table/enum';
import { statusRender } from '@/routes/utils';
import { operatorRender, TagRender } from 'hzero-front/lib/utils/renderer';
import notification from 'utils/notification';
import { isTenantRoleLevel } from 'utils/utils';
import { fieldMapHeaderSave, copyPlatformData } from '@/services/roleCardFieldMapService';
import qs from 'querystring';
import { listDS, formDs } from './store';

// const organizationId = getCurrentOrganizationId();
const Index = ({ history, dispatch, tableDs, fieldMapFromDs }) => {
  const FieldMapFrom = (props) => {
    const { fieldMapFromDs } = props;
    return (
      <Form dataSet={fieldMapFromDs}>
        {/* {!isTenant && <Lov name="tenantId" />} */}
        <Lov name="combineCode" />
        <TextField name="combineName" />
        <Select name="scene" />
        {/* <Select name="cardTypeLov" /> */}
        <Lov name="cardCode" />
        <Switch name="enabledFlag" />
      </Form>
    );
  };

  const handleCopyPlatformData = async () => {
    // const res = await copyPlatformData();
    // if (!res) return;
    // tableDs.query();
    const modalTableDs = new DataSet(listDS('quote'));
    const columns = [
      {
        name: 'combineCode',
      },
      {
        name: 'combineName',
      },
      {
        name: 'scene',
      },

      {
        name: 'cardName',
      },
    ];
    // modalTableDs.query();
    const title = intl.get('swbh.common.button.copyPlatformData').d('引用平台级映射关系');
    Modal.open({
      title,
      key: Modal.key(),
      drawer: true,
      closable: true,
      width: '742px',
      destroyOnClose: true,
      children: <Table style={{ maxHeight: 'calc(100vh - 220px)' }} dataSet={modalTableDs} columns={columns} />,
      // okText: intl.get('hzero.common.button.save').d('保存'),
      cancelText: intl.get('hzero.common.button.close').d('关闭'),
      // footer: (okBtn, cancelBtn) => (status !== 'view' ? [okBtn, cancelBtn] : cancelBtn),
      // onOk: async () => {},
      onOk: async () => {
        return new Promise((resolve) => {
          const { selected } = modalTableDs;
          if (selected?.length === 0) {
            return resolve();
          }
          const templateIds = selected?.map((ele) => {
            const data = ele?.toData();
            return data?.templateId;
          });
          copyPlatformData({ templateIds }).then((res) => {
            if (res && !res?.failed) {
              tableDs.query();
              resolve();
            } else {
              notification.error({ message: res?.message });
              resolve();
            }
          });
        });
      },
      onCancel: () => {
        // dynamicDefineFormDs.reset();
        // dynamicDefineFormDs.loadData([]);
      },
    });
  };
  /**
   * 新建/编辑动态定义
   *
   */
  const handleEdit = useCallback(
    (record, title) => {
      // debugger;
      if (record) {
        fieldMapFromDs.loadData([
          {
            ...record.data,
          },
        ]);
      } else {
        fieldMapFromDs.create({});
      }
      Modal.open({
        title,
        key: Modal.key(),
        drawer: true,
        closable: true,
        width: 300,
        destroyOnClose: true,
        children: <FieldMapFrom fieldMapFromDs={fieldMapFromDs} />,
        okText: intl.get('hzero.common.button.save').d('保存'),
        cancelText: intl.get('hzero.common.button.close').d('关闭'),
        // footer: (okBtn, cancelBtn) => (status !== 'view' ? [okBtn, cancelBtn] : cancelBtn),
        onOk: async () => {
          const validate = await fieldMapFromDs.current?.validate();
          const data = fieldMapFromDs?.current.toData();
          if (validate) {
            // fieldMapFromDs.submit();

            fieldMapHeaderSave(data).then((res) => {
              if (res && !res?.failed) {
                tableDs.query();
              } else {
                notification.error({
                  message: (res && res?.message) ?? '',
                });
              }
            });
          } else {
            return false;
          }
        },
        onCancel: () => {
          fieldMapFromDs.reset();
          fieldMapFromDs.loadData([]);
        },
      });
    },
    [fieldMapFromDs, tableDs]
  );

  const lineColumns = [
    {
      name: 'combineCode',
      // align: ColumnAlign.left,
    },
    {
      name: 'combineName',
      // align: ColumnAlign.left,
    },
    {
      name: 'scene',
      // align: ColumnAlign.left,
    },
    // {
    //   name: 'cardType',
    //   // align: ColumnAlign.left,
    //   renderer: ({ record }) => record?.get('cardTypeMeaning') ?? '',
    // },
    {
      name: 'cardName',
      // align: ColumnAlign.left,
      // renderer: ({ record }) => record?.get('cardTypeMeaning') ?? '',
    },
    {
      name: 'enabledFlag',
      // align: ColumnAlign.center,
      renderer: ({ value }) => {
        const statusList = [
          {
            text: intl.get('hzero.common.button.enabled').d('启用'),
            value: 1,
            status: 'success',
          },
          {
            text: intl.get('hzero.common.button.disable').d('禁用'),
            value: 0,
            status: 'warning',
          },
        ];
        return statusRender(value, statusList);
      },
    },
    {
      name: 'operation',
      renderer: ({ record }) => {
        const operators = [
          {
            key: 'edit',
            ele: (
              <a onClick={() => handleEdit(record, intl.get('hzero.common.view.button.edit').d('编辑'))}>
                {intl.get('hzero.common.view.button.edit').d('编辑')}
              </a>
            ),
            len: 2,
            title: intl.get('hzero.common.view.button.edit').d('编辑'),
          },
          {
            key: 'fieldMap',
            ele: (
              <a
                style={{ width: '125px' }}
                onClick={() => {
                  const templateId = record?.get('templateId');
                  const combineCode = record?.get('combineCode');
                  if (!templateId) {
                    return;
                  }
                  history.push({
                    pathname: isTenantRoleLevel()
                      ? `/swbh/role-card-field-map/detail/${templateId}`
                      : `/swbh/platform/role-card-field-map/detail/${templateId}`,
                    search: qs.stringify({
                      combineCode,
                    }),
                  });
                }}
              >
                {intl.get('swbh.common.view.button.fieldMap').d('字段映射')}
              </a>
            ),
            len: 4,
            title: intl.get('swbh.common.view.button.fieldMap').d('字段映射'),
          },
        ];
        return operatorRender(operators, record, { limit: 2 });
      },
      // align: ColumnAlign.left,
    },
  ];

  const isTenant = isTenantRoleLevel();
  return (
    <Fragment>
      <Header title={intl.get('swbh.common.title.roleCardFieldMap').d('单据字段映射')}>
        {/* <HeaderBtn currentDs={lineDs} /> */}
        <Button
          icon="add"
          color="primary"
          onClick={() => handleEdit(null, intl.get('hzero.common.button.create').d('新建'))}
        >
          {intl.get('hzero.common.button.create').d('新建')}
        </Button>
        {isTenant && (
          <Button style={{ marginRight: 10 }} icon="filter_none" onClick={() => handleCopyPlatformData()}>
            {intl.get('swbh.common.button.copyPlatformData').d('引用平台级映射关系')}
          </Button>
        )}
      </Header>
      <Content>
        <Table dataSet={tableDs} columns={lineColumns} />
      </Content>
    </Fragment>
  );
};

export default compose(
  connect(),
  formatterCollections({
    code: ['swbh.common', 'hzero.common'],
  }),
  withCustomize({
    // unitCode: ['SRPM.RP_CONFIG_LIST.TABLE'],
  }),
  withProps(
    () => {
      const tableDs = new DataSet(listDS());
      const fieldMapFromDs = new DataSet(formDs());
      return {
        tableDs,
        fieldMapFromDs,
      };
    },
    { cacheState: true }
  )
)(Index);
