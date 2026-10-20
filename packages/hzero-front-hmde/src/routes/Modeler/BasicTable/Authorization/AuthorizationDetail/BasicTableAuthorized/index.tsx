import React, { useMemo, useState, useEffect, useRef, useContext } from 'react';
import { DataSet, Form, TextField, Button } from 'choerodon-ui/pro';
import { Collapse, Spin, Tooltip, Icon } from 'choerodon-ui';
import { Content } from 'components/Page';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { LabelLayoutType } from 'choerodon-ui/pro/lib/form/Form.d';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import notification from 'utils/notification';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';

import { EAuthorization } from '@/globalData/modelManager';
import Store, { IBaseTableList } from '@/routes/Modeler/BasicTable/stores';
import {
  queryBasicTableAuthorized,
  saveDataSourceAuthorization,
} from '@/services/modelBaseService';
import ImgIcon from '@/utils/ImgIcon';

import DataSourceRow from './DataSourceRow';

import styles from '../index.less';

const { Panel } = Collapse;

interface IIndex {
  tabVal: string;
}
export default function Index({ tabVal }: IIndex) {
  const {
    storeData: { tenantId },
  }: IBaseTableList = useContext<IBaseTableList>(Store as any).store;
  const [loading, setLoading] = useState<boolean>(false);
  const [activeKey, setActiveKey] = useState<string | string[]>([]);
  const [dataSource, setDataSource] = useState<any[]>([]);
  const dataSourceRef: any = useRef();

  useEffect(() => {
    if (tabVal === EAuthorization.BASIC_TABLE) {
      init({});
    }
  }, [tenantId]);

  // 初始化
  const init = async (param = {}) => {
    setLoading(true);
    const params = {
      tenantId,
      ...param,
    };
    const res: model.BasicTableAuthorized[] = await queryBasicTableAuthorized(params);
    if (
      !res ||
      (res && ((res as any).failed || (res as any).requestStatus === 'PERMISSION_MISMATCH'))
    ) {
      notification.error({
        message: '错误',
        description: (res as any)?.message,
      });
      return false;
    }
    const newRes = Object.entries(res);
    setDataSource(newRes);
    dataSourceRef.current = newRes;
    setLoading(false);
  };

  const queryDs = useMemo(
    () =>
      new DataSet({
        fields: [
          {
            label: '服务名称',
            name: 'filterName',
            type: 'string' as FieldType,
            labelWidth: 20 as any,
          },
        ],
        events: {
          update: ({ value }) => {
            handleSearch(value);
          },
        },
      } as DataSetProps),
    []
  );

  // 搜索过滤
  const handleSearch = async (val: string) => {
    init({ serviceCode: val });
  };

  // 是否创建表onChange
  const checkBoxOnChange = async (record, fieldName, e) => {
    Object.assign(record, { [fieldName]: e.target.checked ? 1 : 0, tenantId });
    setLoading(true);
    const res = await saveDataSourceAuthorization({ query: { tenantId }, body: record });
    setLoading(false);
    if (!res || res.failed) {
      notification.error({ message: '错误', description: res.message });
      return false;
    }
    const newDataSource = dataSource.map((item) => {
      if (item[0] === record.serviceCode) {
        // eslint-disable-next-line no-unused-expressions
        const newChildren = item?.[1]?.map?.((child) => {
          if (child?.id === record?.id) {
            return res;
          }
          return child;
        });
        return [item[0], newChildren];
      }
      return item;
    });
    setDataSource(newDataSource);
    dataSourceRef.current = newDataSource;
    notification.success({ message: '提示', description: '操作成功' });
  };

  const handelExpendAll = () => {
    const arr = dataSource.map((item) => item[0]);
    setActiveKey(arr);
  };
  const handelCloseAll = () => {
    setActiveKey([]);
  };

  const dataSourceRowProps = {
    init,
    checkBoxOnChange,
  };

  return (
    <React.Fragment>
      <div className={styles['search-wrapper']}>
        <Form labelLayout={'horizontal' as LabelLayoutType} dataSet={queryDs}>
          <TextField
            name="filterName"
            placeholder="搜索服务名称"
            // onInput={(e: any) => handleSearch(e.target.value)}
            // suffix={<Icon className={styles['master-model-input-icon']} type="search" />}
          />
        </Form>
        <div className={styles['search-button-wrapper']}>
          <Button
            color={ButtonColor.primary}
            onClick={() => handleSearch(queryDs.current?.get('filterName'))}
          >
            查询
          </Button>
        </div>
      </div>
      <Content className={styles['content-wrapper']}>
        <Spin spinning={loading}>
          <tr className={styles['basic-table-header']}>
            <td style={{ width: '35%' }} />
            <td style={{ width: '25%', textAlign: 'center' }}>
              <Tooltip
                placement="top"
                title="数据源配置创建表权限，即该租户的租户角色有权限在该服务-数据源下正向建表"
              >
                创建表权限
                <ImgIcon name="help.svg" size={14} style={{ margin: '0px 2px', marginBottom: 2 }} />
              </Tooltip>
            </td>
            <td style={{ width: '25%', textAlign: 'center' }}>
              <Tooltip
                placement="top"
                title={
                  <React.Fragment>
                    <div>全部授权：可支持授权该租户对应数据源下全部基础表的使用权限；</div>
                    <div>权限分配：支持授权该租户对应数据源下勾选的基础表</div>
                  </React.Fragment>
                }
              >
                基础表授权
                <ImgIcon name="help.svg" size={14} style={{ margin: '0px 2px', marginBottom: 2 }} />
              </Tooltip>
            </td>
            <td style={{ width: '15%', textAlign: 'center' }} className={styles['expend-close']}>
              <a onClick={handelExpendAll}>
                <Icon type="add_box" />
                展开
              </a>
              <a onClick={handelCloseAll}>
                <Icon type="short_text" />
                收起
              </a>
            </td>
          </tr>
          <Collapse
            bordered={false}
            activeKey={activeKey}
            onChange={(val) => {
              setActiveKey(val);
            }}
          >
            {dataSource.map((item) => (
              <Panel header={item[0]} key={item[0]}>
                {item[1].map((child) => (
                  <DataSourceRow {...child} serviceCode={item[0]} {...dataSourceRowProps} />
                ))}
              </Panel>
            ))}
          </Collapse>
        </Spin>
      </Content>
    </React.Fragment>
  );
}
