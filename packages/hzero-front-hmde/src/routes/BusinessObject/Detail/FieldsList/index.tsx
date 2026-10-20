/* eslint-disable no-unused-vars */
import React, { useMemo, useEffect, useState, useImperativeHandle, ReactElement } from 'react';
import { DataSet, Button, Modal } from 'choerodon-ui/pro';
import intl from 'srm-front-boot/lib/utils/intl';
import { isTenantRoleLevel, getResponse } from 'hzero-front/lib/utils/utils';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import qs from 'querystring';
import notification from 'hzero-front/lib/utils/notification';
import { observer } from 'mobx-react-lite';

import { Operators, SourceType } from '@/businessGlobalData/common';
import { operatorRender, yesOrNoRender } from 'hzero-front/lib/utils/renderer';
import { ColumnAlign, ColumnLock, TableAutoHeightType } from 'choerodon-ui/pro/lib/table/enum';
import { Buttons } from 'choerodon-ui/pro/lib/table/Table';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { DataSetStatus } from 'choerodon-ui/dataset/data-set/enum';
import Record from 'choerodon-ui/pro/lib/data-set/Record';
import { Popconfirm, Tabs } from 'choerodon-ui';
import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';
import { tableDs } from '@/stores/BusinessObject/FieldListDS';
import {
  updateSitBusinessObjectField,
  updateTenantBusinessObjectField,
} from '@/services/businessObjectService';
// import { enableRender, publishRender } from '@/utils/render';
import { FieldSourceType } from './constants/constants';
import sourceStore from '../../store';
import AddAndEditField from './AddAndEditField';
import styles from '../index.less';

interface IProps {
  tableDS: DataSet;
  [x: string]: any;
}

const { TabPane } = Tabs;
const isTenant = isTenantRoleLevel();

// eslint-disable-next-line
enum FieldType {
  // eslint-disable-next-line no-unused-vars
  STANDARD = 'STANDARD', // 标准
  // eslint-disable-next-line no-unused-vars
  EXTEND = 'EXTEND', // 扩展
}

export default observer((props: IProps) => {
  const {
    history,
    match: {
      params: { id: businessObjectId, domainId },
    },
    location: { state: { fieldActiveKey = '' } = {} },
    baseInfoDS,
    // businessObjectCode,
    // boSourceType,
    publishStatus,
    published,
    listRef,
    store,
    sourceType,
    businessObjectName,
    allowEdit,
  } = props;
  const { permissionFlag } = React.useContext<any>(sourceStore as any).store;
  const predefineDisabled = baseInfoDS.current?.get('sourceType') === SourceType.PREDEFINE;

  const [activeKey, setActiveKey] = useState<FieldType | null>(
    isTenant ? null : FieldType.STANDARD
  );

  const tableDS: DataSet = useMemo(
    () => new DataSet(tableDs(isTenant ? null : FieldType.STANDARD) as DataSetProps),
    [businessObjectId]
  );

  const extendTableDS: DataSet = useMemo(
    () => new DataSet(tableDs(FieldType.EXTEND) as DataSetProps),
    [businessObjectId]
  );

  const allHidden =
    !baseInfoDS.current?.get('extendTableEnabledFlag') &&
    !baseInfoDS.current?.get('flexFieldEnabledFlag');

  useImperativeHandle(listRef, () => ({
    tableDS,
    extendTableDS,
    baseInfoDS,
  }));

  useEffect(() => {
    if (fieldActiveKey) {
      setActiveKey(fieldActiveKey);
    }
  }, [fieldActiveKey]);
  useEffect(() => {
    tableDS.setQueryParameter('businessObjectId', businessObjectId);
    tableDS.query();
  }, [tableDS, publishStatus]);

  useEffect(() => {
    if (!isTenant) {
      extendTableDS.setQueryParameter('businessObjectId', businessObjectId);
      extendTableDS.query();
    }
  }, [extendTableDS, publishStatus]);

  const setShowFieldDetail = (type: 'edit' | 'create') => {
    const addAndEditFieldProps = {
      published,
      businessObjectId,
      setShowFieldDetail,
      boSourceType: sourceType,
      ...store.getItem('extendProperty'),
      // fieldType: store?.getItem('fieldType'),
      businessObjectName: baseInfoDS.current?.get('businessObjectName'),
      customPrimaryKeyCode: baseInfoDS.current?.get('customPrimaryKeyCode'),
      fromKey: 'fieldList', // 来源
      sourceStore,
      permissionFlag,
    };
    Modal.open({
      title:
        type === 'edit'
        ? intl.get('hmde.bo.model.fieldEdit').d('字段编辑')
        : intl.get('hmde.bo.model.fieldAdd').d('字段新增'),
      drawer: true,
      className: styles['field-edit-modal'],
      style: { width: '850px' },
      children: (
        <AddAndEditField {...addAndEditFieldProps} onRefresh={refreshList} />
      ),
      footer: null,
    });
  };

  const refreshList = () => {
    if (!isTenant) {
      if (allHidden) {
        tableDS.query(tableDS.currentPage);
      } else if (activeKey === FieldType.STANDARD) {
        tableDS.query(tableDS.currentPage);
      } else if (activeKey === FieldType.EXTEND) {
        extendTableDS.query(extendTableDS.currentPage);
      }
    } else {
      tableDS.query(tableDS.currentPage);
    }
  };

  const handleDetail = (record: Record | null | undefined) => {
    let extendProperty = {};

    if (!isTenant) {
      // 平台
      const platformExtensionFlag = activeKey && activeKey === FieldType.EXTEND;
      extendProperty = {
        businessObjectFieldId: platformExtensionFlag
          ? record?.get('extendFieldId')
          : record?.get('businessObjectFieldId'),
        fieldType: platformExtensionFlag
          ? record?.get('extendCategory')
          : FieldSourceType.StandardField,
      };
    } else {
      // 租户
      extendProperty = {
        inheritFieldId: record?.get('inheritFieldId'),
        businessObjectFieldId: record?.get('businessObjectFieldId'),
        fieldType:
          record?.get('inheritSourceType') === 'STANDARD'
            ? FieldSourceType.StandardField
            : FieldSourceType.ExtensionTableField,
      };
    }

    store.setItem('extendProperty', extendProperty);
    setShowFieldDetail('edit');
    //  跳转到编辑页面
    // history.push({
    //   pathname: `/hmde/business-object/field/edit`,
    //   search: qs.stringify({
    //     published,
    //     businessObjectId,
    //     businessObjectCode,
    //     boSourceType,
    //     businessObjectName: baseInfoDS.current?.get('businessObjectName'),
    //     ...extendProperty,
    //   }),
    // });
  };

  // 字段删除
  const handleDelete = async record => {
    const dataSet = activeKey === FieldType.EXTEND ? extendTableDS : tableDS;
    if ([DataSetStatus.loading, DataSetStatus.submitting].includes(dataSet.status)) {
      return;
    }
    dataSet.setQueryParameter('businessObjectFieldId', record.get('businessObjectFieldId'));
    dataSet.setQueryParameter('businessObjectId', record.get('businessObjectId'));
    const res = await dataSet.delete(record, false);
    if (!res?.failed) {
      baseInfoDS.query();
    }
  };

  // 启用|禁用 平台/租户下的业务对象字段
  const handleEnable = async (record, dataSet) => {
    if ([DataSetStatus.loading, DataSetStatus.submitting].includes(dataSet.status)) {
      return;
    }
    const flag = record.get('enabledFlag');
    // 必输字段不能禁用
    if (flag && record.get('requiredFlag')) {
      notification.error({
        message: intl.get('hmde.common.status.error').d('失败'),
        description: intl.get('hmde.bo.model.cant`t disabled').d('该字段为必输字段，不可禁用'),
        placement: 'bottomRight',
      });
      return false;
    }
    const serviceName = isTenantRoleLevel()
      ? updateTenantBusinessObjectField
      : updateSitBusinessObjectField;
    const body = {
      objectVersionNumber: record.get('objectVersionNumber'),
      enabledFlag: !flag,
    };
    if (isTenant) {
      Object.assign(body, { inheritFieldId: record.get('inheritFieldId') });
    } else {
      Object.assign(body, { businessObjectFieldId: record.get('businessObjectFieldId') });
    }
    const res = await serviceName({
      body,
    });
    if (getResponse(res)) {
      tableDS.query();
    }
  };
  const columns = useMemo((): ColumnProps[] => {
    return [
      (!activeKey || activeKey === FieldType.STANDARD) && {
        name: 'businessObjectFieldCode',
        renderer: ({ value, record }) => <a onClick={() => handleDetail(record)}>{value}</a>,
      },
      (!activeKey || activeKey === FieldType.STANDARD) && {
        name: 'businessObjectFieldName',
      },
      activeKey === FieldType.EXTEND && {
        name: 'extendFieldCode',
        renderer: ({ value, record }) => <a onClick={() => handleDetail(record)}>{value}</a>,
      },
      {
        name: 'componentType',
        renderer: ({ text }) => text,
      },
      // activeKey !== FieldType.EXTEND && // 只要不是平台扩展且已发布就显示
      //   baseInfoDS.current?.get('publishStatus') !== PublishStatus.UNPUBLISHED && {
      //     // 对象未发布之前没有这一列
      //     name: 'enabledFlag',
      //     renderer: ({ value }) => enableRender(value),
      //   },
      // activeKey !== FieldType.EXTEND && {
      //   // 只要不是平台扩展就显示
      //   name: 'publishedFlag',
      //   renderer: ({ value }) => publishRender(value),
      // },
      isTenant && {
        // 字段来源类型
        name: 'inheritSourceType',
        renderer: ({ value }) => {
          const titleMap = {
            STANDARD: intl.get('hmde.bo.view.message.tab.standardField').d('标准字段'),
            EXTEND: intl.get('hmde.bo.view.message.tab.extendField').d('扩展字段'),
          };
          return titleMap[value];
        },
      },
      (!activeKey || activeKey === FieldType.STANDARD) && {
        name: 'requiredFlag',
        renderer: ({ value }) => yesOrNoRender(value),
        align: ColumnAlign.left,
      },
      {
        name: 'remark',
      },
      {
        header: intl.get('hzero.common.table.column.option').d('操作'),
        width: 120,
        renderer: ({ record, dataSet }) => {
          // 平台扩展字段不可以删除 租户看到的平台标准字段不可删除
          const canEdit = activeKey || (!activeKey && record.get('inheritSourceType') === 'EXTEND');
          const list: ReactElement[] = [];
          const operators: ReactElement[] = [
            allowEdit && (
              <Popconfirm
                onConfirm={() => handleDelete(record)}
                placement="top"
                title={intl
                  .get('hmde.bo.field.view.message.deleteConfirm')
                  .d('请确认是否删除该字段，删除字段后会清空当前字段以及该字段的全部数据。')}
              >
                <Button
                  funcType={FuncType.link}
                  disabled={[DataSetStatus.loading, DataSetStatus.submitting].includes(dataSet.status)}
                >
                  {intl.get('hzero.common.button.delete').d('删除')}
                </Button>
              </Popconfirm>
            ),
            <Popconfirm
              onConfirm={() => handleEnable(record, dataSet)}
              placement="top"
              title={intl
                .get('hmde.bo.field.view.message.enableConfirm')
                .d(
                  '请确认是否禁用该字段，禁用字段后不影响已配置内容，但后续将不再能选到该字段。'
                )}
            >
              <a>
                {!record.get('enabledFlag')
                  ? intl.get('hzero.common.button.enable').d('启用')
                  : intl.get('hzero.common.button.disable').d('禁用')}
              </a>
            </Popconfirm>,
          ].filter(Boolean);
          if (!isTenant) {
            // 平台层
            // if (
            //   activeKey !== FieldType.EXTEND && // 扩展字段只显示删除 没有禁用启用
            //   baseInfoDS.current?.get('publishStatus') !== PublishStatus.UNPUBLISHED && // 对象未发布无法禁用启用
            //   !(
            //     baseInfoDS.current?.get('publishStatus') !== PublishStatus.UNPUBLISHED &&
            //     !record.get('publishedFlag')
            //   ) && // 对象已发布 又新增的字段无法启用禁用
            //   !record.get('standardFlag') // 标准字段无法禁用启用
            //   // !(predefineDisabled && !isTenant)
            // ) {
            //   list.push(operators[1]);
            // }
            if (!record.get('standardFlag') && !predefineDisabled && permissionFlag) {
              // 标准字段包含了预置字段
              list.push(operators[0]);
            }
          } else if (isTenant) {
            // 租户层
            // if (
            //   activeKey !== FieldType.EXTEND && // 扩展字段只显示删除 没有禁用启用
            //   baseInfoDS.current?.get('publishStatus') !== PublishStatus.UNPUBLISHED && // 对象未发布无法禁用启用
            //   !(
            //     baseInfoDS.current?.get('publishStatus') !== PublishStatus.UNPUBLISHED &&
            //     !record.get('publishedFlag')
            //   ) && // 对象已发布 又新增的字段无法启用禁用
            //   record.get('inheritSourceType') !== 'STANDARD' // 标准字段无法禁用启用
            // ) {
            //   list.push(operators[1]);
            // }
            if (record.get('inheritSourceType') !== 'STANDARD') {
              // 标准字段包含了预置字段
              list.push(operators[0]);
            }
          }
          /**
           * FIXME: 详细文档查看： https://open.hand-china.com/document-center/doc/product/10137/10227?doc_id=32661&doc_code=32661#operatorRenderoperatorRenderopen&doc-33
           * operatorRender: 操作列渲染函数
           * operators： 操作列的元素
           * record: renderer中的record属性
           * limit： 超出limit显示更多下拉列表
           */
          return canEdit ? list : null;
        },
        lock: ColumnLock.right,
      },
    ].filter(Boolean) as ColumnProps[];
  }, [activeKey, predefineDisabled, allowEdit]);
  /**
   * 跳转到新增字段详情页面
   */
  const handleAddField = fieldType => {
    store.setItem('fieldType', fieldType);
    store.setItem('extendProperty', {
      fieldType,
    });
    setShowFieldDetail('create');
  };

  /**
   * 跳转到字段依赖页面
   */
  const handleRelyField = () => {
    history.push({
      pathname: `/hmde/business-object/field/rely`,
      search: qs.stringify({
        businessObjectId,
        businessObjectName,
        domainId,
      }),
    });
  };

  const platformButtons =
    activeKey === FieldType.STANDARD
      ? [
        <Button
          funcType={FuncType.flat}
          icon="link2"
          onClick={handleRelyField}
          disabled={predefineDisabled}
        >
          {intl.get('hmde.bo.field.rely').d('字段依赖')}
        </Button>,
        <Button
          funcType={FuncType.flat}
          icon="playlist_add"
          onClick={() => handleAddField(FieldSourceType.StandardField)}
          disabled={predefineDisabled}
        >
          {intl.get('hzero.common.button.create').d('新建')}
        </Button>,
      ]
      : [
        <Button
          funcType={FuncType.flat}
          icon="playlist_add"
          hidden={!baseInfoDS.current?.get('flexFieldEnabledFlag')}
          onClick={() => handleAddField(FieldSourceType.ElasticDomainField)}
          disabled={predefineDisabled}
        >
          {intl.get('hmde.bo.field.flexField.add').d('新建弹性域字段')}
        </Button>,
        <Button
          funcType={FuncType.flat}
          icon="playlist_add"
          hidden={!baseInfoDS.current?.get('extendTableEnabledFlag')}
          onClick={() => handleAddField(FieldSourceType.ExtensionTableField)}
          disabled={predefineDisabled}
        >
          {intl.get('hmde.bo.field.extendField.add').d('新建扩展字段')}
        </Button>,
      ].filter(Boolean);

  const buttons = () => {
    if (!allowEdit || predefineDisabled) {
      return [] as Buttons[];
    } else {
      return isTenant
        ? ([
            // 'add',
          <Button
            funcType={FuncType.flat}
            icon="link2"
            onClick={handleRelyField}
            disabled={predefineDisabled}
          >
            {intl.get('hmde.bo.field.rely').d('字段依赖')}
          </Button>,
          <Button
            funcType={FuncType.flat}
            icon="playlist_add"
            onClick={() => handleAddField(FieldSourceType.ExtensionTableField)}
            disabled={predefineDisabled}
          >
            {intl.get('hmde.bo.field.extendField.add').d('新建扩展字段')}
          </Button>,
        ] as Buttons[])
        : permissionFlag
        ? platformButtons
        : [];
    }
  };

  return (
    <>
      {!isTenant ? (
        <>
          {allHidden ? (
            <FilterBarTable
              dataSet={tableDS}
              columns={columns}
              buttons={buttons()}
              autoHeight={{ type: TableAutoHeightType.maxHeight, diff: -60 }}
              filterBarConfig={{
                collpaseble: true,
                collpase: true,
              }}
              customizable
              customizedCode='HMDE.BUSINESS_OBJECT.FIELD_LIST.1'
            />
          ) : (
            <Tabs
              flex
              activeKey={activeKey as any}
              onChange={key => setActiveKey(key as any)}
              style={{ height: '100%', overflow: 'hidden' }}
            >
              <TabPane
                tab={intl.get('hmde.bo.field.view.message.tab.standardField').d('标准字段')}
                key={FieldType.STANDARD}
                forceRender
              >
                <FilterBarTable
                  dataSet={tableDS}
                  columns={columns}
                  buttons={buttons()}
                  autoHeight={{ type: TableAutoHeightType.maxHeight, diff: -60 }}
                  filterBarConfig={{
                    collpaseble: true,
                    collpase: true,
                  }}
                  customizable
                  customizedCode='HMDE.BUSINESS_OBJECT.FIELD_LIST.2'
                />
              </TabPane>
              <TabPane
                tab={intl.get('hmde.bo.field.view.message.tab.extendField').d('扩展字段')}
                key={FieldType.EXTEND}
                forceRender
              >
                <FilterBarTable
                  dataSet={extendTableDS}
                  columns={columns}
                  buttons={buttons()}
                  autoHeight={{ type: TableAutoHeightType.maxHeight, diff: -60 }}
                  filterBarConfig={{
                    collpaseble: true,
                    collpase: true,
                  }}
                  customizable
                  customizedCode='HMDE.BUSINESS_OBJECT.FIELD_LIST.3'
                />
              </TabPane>
            </Tabs>
          )}
        </>
      ) : (
        <FilterBarTable
          dataSet={tableDS}
          columns={columns}
          buttons={buttons()}
          autoHeight={{ type: TableAutoHeightType.maxHeight, diff: -60 }}
          filterBarConfig={{
            collpaseble: true,
            collpase: true,
          }}
          customizable
          customizedCode='HMDE.BUSINESS_OBJECT.FIELD_LIST.4'
        />
      )}
    </>
  );
});
