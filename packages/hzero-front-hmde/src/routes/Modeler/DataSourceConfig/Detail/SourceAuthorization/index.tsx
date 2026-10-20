import React, { useMemo, useEffect, useState, useContext, useRef } from 'react';
import { Form, Table, DataSet, Radio, Icon, Button } from 'choerodon-ui/pro';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { isEmpty } from 'lodash';
import { getResponse } from 'utils/utils';
import { FuncType, ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { observer, Observer } from 'mobx-react-lite';
import {
  ColumnAlign,
  SelectionMode,
  TableColumnTooltip,
  TableQueryBarType,
} from 'choerodon-ui/pro/lib/table/enum';
import notification from 'utils/notification';

import ImgIcon from '@/utils/ImgIcon';
import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';
import Lov from '@/components/LowcodeLov';
import Modal from '@/components/LowcodeModal';
import _store, { ISourceManagerStore } from '@/routes/Modeler/DataSourceConfig/stores';
import { saveBatchAuthorization } from '@/services/modelDataSourceService';
import globalStyles from '@/lowcodeGlobalStyles/global.less';

import styles from '../index.less';

const Index = () => {
  const {
    // ref: { listViewRef },
    setDataObject,
    dataObject: {
      dataObjParams,
      dataObjectDetailType,
      dataObjectDetail,
      dataObjectDetail: { dataObjectCode, dataObjectName, assignPattern, dataObjectOwnerType },
    },
  } = useContext<ISourceManagerStore>(_store as any).store;
  const [editor, setEditor] = useState(dataObjectDetailType !== 'see');
  const removeTenantIdsRef: any = useRef([]);

  const tableDsObj: any = {
    pageSize: 20,
    autoQuery: false,
    primaryKey: 'tenantNum',
    transport: {
      read: {
        url: `${lowcodeOrganizationURL({
          route: HZERO_HMDE,
        })}/data-assigns/${dataObjectCode}/page`,
        method: 'get',
        data: {},
      },
    },
    fields: [
      {
        name: 'tenantNum',
        type: FieldType.string,
        label: '租户编号',
      },
      {
        name: 'tenantName',
        type: FieldType.string,
        label: '租户名称',
      },
    ],
    events: {
      load: ({ dataSet }) => {
        if (
          (dataSet?.queryParameter as any).originAssignPattern !==
          (dataSet?.queryParameter as any).assignPattern
        ) {
          dataSet.setQueryParameter('currentPage', dataSet.currentPage);
          dataSet.setQueryParameter('pageSize', dataSet.pageSize);
        }
      },
    },
  };

  // 白名单table ds实例
  const allowTableDs: DataSet = useMemo(() => new DataSet(tableDsObj), [dataObjectCode]);
  // 白名单table ds实例
  const blockTableDs: DataSet = useMemo(() => new DataSet(tableDsObj), [dataObjectCode]);

  const formDs = useMemo(
    () =>
      new DataSet({
        data: [{ assignPattern }],
        autoCreate: true,
        fields: [
          {
            name: 'assignPattern',
          },
        ],
        events: {
          update: ({ value, dataSet }) => {
            const tableDs =
              formDs.current?.get('assignPattern') === 'ALLOW_LIST' ? allowTableDs : blockTableDs;
            tableDs.setQueryParameter('assignPattern', value);
            // const { tenantList, assignPattern: ap } = dataSet?.queryParameter as any;
            const { assignPattern: ap } = dataSet?.queryParameter as any;
            const { currentPage, pageSize } = tableDs?.queryParameter as any;
            if (ap !== value) {
              // tableDs.loadData([]);
              // tableDs.currentPage = 1;
            } else {
              tableDs.currentPage = currentPage;
              tableDs.pageSize = pageSize;
              // tableDs.loadData(tenantList);
            }
          },
        },
      }),
    [assignPattern, allowTableDs, blockTableDs]
  );

  // 选择租户lov ds
  const ds: DataSet = useMemo(
    () =>
      new DataSet({
        autoCreate: true,
        fields: [
          {
            name: 'tenant',
            type: FieldType.object,
            required: false,
            lovCode: 'HPFM.TENANT',
            multiple: true,
            dynamicProps: {
              lovQueryAxiosConfig: function lovQueryAxiosConfig() {
                return {
                  url: `${lowcodeOrganizationURL({
                    route: HZERO_HMDE,
                  })}/data-assigns/${dataObjectCode}/tenants/assignable`,
                  method: 'GET',
                };
              },
              lovPara: () => ({ assignPattern: formDs.current?.get('assignPattern') }),
            },
          },
        ],
        events: {
          update: async (args) => {
            const { value, dataSet } = args;
            const tableDs =
              formDs.current?.get('assignPattern') === 'ALLOW_LIST' ? allowTableDs : blockTableDs;
            const TableDsDataAlready = tableDs.toData() as any[];
            value.forEach((item) => {
              if (
                !TableDsDataAlready.some((row) => {
                  return row.tenantNum === item.tenantNum;
                })
              ) {
                tableDs.create({ ...item, status: 'create' }, 0);
              }
              // addTenantIdsRef.current.push(item.tenantId);
            });
            dataSet.reset();
          },
        },
      }),
    [allowTableDs, blockTableDs, formDs]
  );

  useEffect(() => setDataObject('sourceDetailType', editor ? 'edit' : 'see'), [editor]);

  useEffect(() => {
    init();
  }, [dataObjectCode]);

  useEffect(() => {
    const tableDs =
      formDs.current?.get('assignPattern') === 'ALLOW_LIST' ? allowTableDs : blockTableDs;
    formDs.setQueryParameter('assignPattern', assignPattern);
    tableDs.setQueryParameter('originAssignPattern', assignPattern);
  }, [assignPattern]);

  // 初始化
  const init = async () => {
    // 设置头
    // eslint-disable-next-line no-unused-expressions
    formDs.current?.set('assignPattern', assignPattern);
    const tableDs = assignPattern === 'ALLOW_LIST' ? allowTableDs : blockTableDs;
    // 设置行
    if (dataObjectCode) {
      setEditor(false);
      tableDs.query().then((res) => {
        if (getResponse(res)) {
          tableDs.setQueryParameter('assignPattern', assignPattern);
          formDs.setQueryParameter('tenantList', res?.content || []);
        }
      });
    }
  };

  const columns = [
    {
      name: 'tenantNum',
      align: ColumnAlign.center,
      tooltip: TableColumnTooltip.overflow,
    },
    {
      name: 'tenantName',
      align: ColumnAlign.center,
      tooltip: TableColumnTooltip.overflow,
    },
  ];

  const buttons: JSX.Element[] = [
    editor ? <p className={styles['table-title']}>授权租户</p> : <></>,
    <Observer>
      {() => (
        <Button
          funcType={FuncType.flat}
          color={ButtonColor.primary}
          icon="delete"
          disabled={
            (formDs.current?.get('assignPattern') === 'ALLOW_LIST' ? allowTableDs : blockTableDs)
              .selected.length === 0
          }
          onClick={() => handleDelete()}
        >
          删除租户
        </Button>
      )}
    </Observer>,
    <Lov dataSet={ds} name="tenant" mode="button" clearButton={false} noCache>
      <Icon type="playlist_add" />
      新增租户
    </Lov>,
  ];

  // 删除租户
  const handleDelete = async (): Promise<void> => {
    const tableDs =
      formDs.current?.get('assignPattern') === 'ALLOW_LIST' ? allowTableDs : blockTableDs;
    if (!isEmpty(tableDs.selected)) {
      Modal.confirm({
        lowcodeSize: 'small',
        children: <p>该操作将会取消所选租户已分发共享的所有模型信息，您确定要删除该租户吗？</p>,
      }).then(() => {
        removeTenantIdsRef.current = tableDs.selected.map((item: any) => item.data.tenantId);
        // 更新新增id
        // addTenantIdsRef.current = addTenantIdsRef.current.filter(
        //   (item) => ![removeTenantIdsRef.current].includes(item.tenantId)
        // );
        const arr = tableDs.toData().filter((item: any) => {
          if (!removeTenantIdsRef.current.includes(item.tenantId)) {
            return true;
          }
          return false;
        });
        tableDs.loadData(arr);
        ds.reset();
      });
    }
  };

  // 保存
  const handleSaveData = async () => {
    const tableDs =
      formDs.current?.get('assignPattern') === 'ALLOW_LIST' ? allowTableDs : blockTableDs;
    const unTableDs =
      formDs.current?.get('assignPattern') === 'ALLOW_LIST' ? blockTableDs : allowTableDs;
    const flag: boolean = await formDs?.validate();
    if (flag) {
      const params = {
        dataObjectCodes: [dataObjectCode], // 数据对象Code
        assignPattern: formDs.current && formDs.current.get('assignPattern'), // 黑白名单模式
        // addTenantIds: addTenantIdsRef.current, // 新增了哪些租户ID
        addTenantIds: tableDs
          .toData()
          .filter((item: any) => item.status === 'create')
          .map((item: any) => item.tenantId), // 新增了哪些租户ID
        removeTenantIds: removeTenantIdsRef.current,
      };
      const res = await saveBatchAuthorization(params);
      if (res && res.failed) {
        notification.error({ message: '错误', description: res.message });
        return false;
      }
      setDataObject('dataObjectDetail', {
        ...dataObjectDetail,
        assignPattern: params.assignPattern,
      });
      setDataObject('dataObjParams', {
        ...dataObjParams,
        dataObjectOwnerTypeList: 'PLATFORM_SHARED',
      });
      notification.success({ message: '提示', description: '保存成功' });
      ds.reset();
      tableDs.query();
      unTableDs.loadData([]);
      removeTenantIdsRef.current = [];
      setEditor(false);
    }
    return false;
  };

  const handelCancel = () => {
    formDs.reset();
    const tableDs =
      formDs.current?.get('assignPattern') === 'ALLOW_LIST' ? allowTableDs : blockTableDs;
    const unTableDs =
      formDs.current?.get('assignPattern') === 'ALLOW_LIST' ? blockTableDs : allowTableDs;
    unTableDs.loadData([]);
    tableDs.query();
    removeTenantIdsRef.current = [];
    setEditor(false);
  };

  return (
    <div className={styles['source-authorization']}>
      <div className={styles['top-wrapper']}>
        <div className={styles['source-title']}>
          {dataObjectName}
          <span>
            {dataObjectOwnerType === 'PLATFORM_SHARED' && (
              <ImgIcon name="platformsharing.svg" size={12} style={{ margin: '0 4px' }} />
            )}
            {dataObjectOwnerType === 'PLATFORM' && (
              <ImgIcon name="platformcustomization.svg" size={12} style={{ margin: '0 4px' }} />
            )}
            {dataObjectOwnerType === 'TENANT' && (
              <ImgIcon name="tenantccustomization.svg" size={12} style={{ margin: '0 4px' }} />
            )}
            平台共享
          </span>
        </div>
        <span>
          {editor ? (
            <span>
              <Button onClick={handelCancel}>取消</Button>
              <Button color={ButtonColor.primary} onClick={handleSaveData}>
                保存
              </Button>
            </span>
          ) : (
            <Button color={ButtonColor.primary} onClick={() => setEditor(true)}>
              编辑
            </Button>
          )}
        </span>
      </div>
      <div className={styles['source-title']}>数据对象授权租户信息</div>
      <div className={styles['form-wrapper']}>
        {editor ? (
          <React.Fragment>
            <div className={styles['form-label']}>
              <i>*</i>共享模式：
            </div>
            <Form dataSet={formDs} columns={4}>
              <Radio name="assignPattern" value="ALLOW_LIST">
                白名单模式
              </Radio>
              <Radio name="assignPattern" value="BLOCK_LIST">
                黑名单模式
              </Radio>
            </Form>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <div className={styles['form-label']}>共享模式：</div>
            {formDs.current?.get('assignPattern') === 'ALLOW_LIST' ? '白名单' : '黑名单'}
          </React.Fragment>
        )}
      </div>
      {editor && (
        <article className={styles['article-text']}>
          {formDs?.current?.get('assignPattern') === 'ALLOW_LIST' && (
            <p>白名单模式允许选择的租户查看指定数据对象；</p>
          )}
          {formDs?.current?.get('assignPattern') === 'BLOCK_LIST' && (
            <p>黑名单模式限制选择的租户不可查看指定数据对象；</p>
          )}
        </article>
      )}
      {/* {editor && <p className={styles['table-title']}>授权租户</p>} */}
      <Table
        dataSet={
          formDs.current?.get('assignPattern') === 'ALLOW_LIST' ? allowTableDs : blockTableDs
        }
        queryBar={TableQueryBarType.none}
        className={`${globalStyles['table-style']} ${styles['source-authority-table']}`}
        columns={columns}
        buttons={editor ? buttons : []}
        selectionMode={editor ? SelectionMode.rowbox : SelectionMode.none}
      />
    </div>
  );
};
export default observer(Index);
