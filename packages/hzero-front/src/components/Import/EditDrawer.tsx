import * as React from 'react';
import { Table, DataSet, Button, Spin, Select, Form } from 'choerodon-ui/pro';
import { ColumnLock, TableColumnTooltip, TableQueryBarType } from 'choerodon-ui/pro/lib/table/enum';
import { Tabs } from 'choerodon-ui';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { isEmpty, set, orderBy } from 'lodash';
import axios from 'axios';
import { observer, useComputed } from 'mobx-react-lite';
// import { Button } from 'components/Permission';

import intl from 'utils/intl';
import { TagRender } from 'utils/renderer';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';

interface ImportProps {
  [propName: string]: any;
}

const Drawer: React.FC<ImportProps> = ({ dataSource, modal, onReimport }) => {
  const {
    templateTargetList,
    batch,
    templateCode,
    tenantId,
    prefixPatch,
    businessObjectTemplates,
    dsMap,
    importType,
    actualTemplateCode = templateCode,
    bindTemplateCode,
  } = dataSource;

  const [dsArr, setDsArr] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  // const [disabled, setDisabled] = React.useState(false);

  const disabled = useComputed(() => {
    if (dsArr.length > 0) {
      return !dsArr.some((ds: DataSet) => ds.dirty);
    }
  }, [dsArr]);

  React.useEffect(() => {
    const arr = dsMap.get(actualTemplateCode) || [];
    if (importType === 'templateCode') {
      // FIXME: 改成第一次切进来查询？
      const dsArray = arr.map((ds, index) => {
        const tableDs = new DataSet(ds);
        tableDs.setQueryParameter('importType', importType);
        tableDs.setQueryParameter('tenantId', tenantId);
        tableDs.setQueryParameter('prefixPatch', prefixPatch);
        tableDs.setQueryParameter('batch', batch);
        tableDs.setQueryParameter('templateCode', actualTemplateCode);
        tableDs.setQueryParameter('sheetIndex', templateTargetList.slice()[index].sheetIndex);
        if (bindTemplateCode) {
          tableDs.setQueryParameter('bindTemplateCode', bindTemplateCode);
        }
        tableDs.query();
        return tableDs;
      });

      setDsArr(dsArray);
    } else {
      const dsArray = arr.map((ds, index) => {
        const obj = businessObjectTemplates
          .slice()
          .find(item => item.templateCode === actualTemplateCode);
        const tableDs = new DataSet(ds);
        tableDs.setQueryParameter('importType', importType);
        tableDs.setQueryParameter('tenantId', tenantId);
        tableDs.setQueryParameter('prefixPatch', prefixPatch);
        tableDs.setQueryParameter('batch', batch);
        tableDs.setQueryParameter('templateCode', actualTemplateCode);
        tableDs.setQueryParameter('sheetIndex', obj?.importTemplateSheets?.[index]?.sheetIndex);
        if (bindTemplateCode) {
          tableDs.setQueryParameter('bindTemplateCode', bindTemplateCode);
        }
        tableDs.query();
        return tableDs;
      });

      setDsArr(dsArray);
    }
  }, []);

  const handleSave = React.useCallback(() => {
    const allData = [];

    dsArr.forEach((ds: any) => {
      const arr: any[] = ds?.toJSONData().map(item => {
        let obj = {};
        if (item.__time_zone_convert_column__) {
          set(obj, '__time_zone_convert_column__', item.__time_zone_convert_column__);
        }
        if (item._metadata) {
          set(obj, '_metadata', item._metadata);
        }
        Object.keys(item).forEach(key => {
          if (!key.startsWith('_') && key !== 'errorMsg') {
            set(obj, key, item[key]);
          }
        });
        try {
          obj = JSON.stringify(obj);
        } catch (e) {
          return e;
        }
        return { ...item, _data: obj };
      });

      // @ts-ignore
      allData.push(...arr);
    });

    setLoading(true);
    if (allData.length > 0) {
      return axios({
        url: `${prefixPatch}/v1/${tenantId}/import/data${importType === 'templateCode' ? '' : '/model'
          }/batch`,
        method: 'PUT',
        data: allData,
      }).then(res => {
        if (getResponse(res)) {
          notification.success({});
        }
      });
    } else {
      return new Promise(resolve => {
        resolve(0);
      });
    }
    // .finally(() => {
    //   setLoading(false);
    //   dsArr.forEach((ds: any) => {
    //     ds.query();
    //   });
    // });
  }, [dsArr]);

  const handleChange = React.useCallback((ds: DataSet) => {
    ds.query();
  }, []);

  React.useEffect(() => {
    if (actualTemplateCode) {
      modal.update({
        footer: (
          <div style={{ textAlign: 'left' }}>
            <Button
              onClick={() => {
                modal.close();
                const request = handleSave();
                request.finally(() => {
                  onReimport();
                });
              }}
              color={ButtonColor.primary}
            >
              {intl.get('hzero.common.components.import.reImport').d('重新导入')}
            </Button>
            <Button
              onClick={() => {
                const request = handleSave();
                request.finally(() => {
                  setLoading(false);
                  dsArr.forEach((ds: any) => {
                    ds.query();
                  });
                });
              }}
              disabled={loading || disabled}
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
            <Button
              onClick={() => {
                modal.close();
              }}
            >
              {intl.get('hzero.common.button.close').d('关闭')}
            </Button>
          </div>
        ),
      });
    }
  }, [dsArr, actualTemplateCode, loading, disabled]);

  const renderTag = React.useCallback(({ value, text }) => {
    const statusList = [
      { status: 'NEW', color: 'blue' /* , text: 'Excel导入' */ },
      { status: 'VALID_SUCCESS', color: 'green' /* , text: '验证成功' */ },
      { status: 'VALID_FAILED', color: 'red' /* , text: '验证失败' */ },
      { status: 'IMPORT_SUCCESS', color: 'green' /* , text: '导入成功' */ },
      { status: 'IMPORT_FAILED', color: 'red' /* , text: '导入失败' */ },
      { status: 'ERROR', color: 'red' /* , text: '数据异常' */ },
    ];
    const tagItem = statusList.find(t => t.status === value) || ({} as any);
    return (
      <div className="common-import-status-tag">
        {TagRender(value, [
          {
            status: value,
            text,
            color: tagItem?.color,
          },
        ])}
      </div>
    );
  }, []);

  const beforeColumns = React.useMemo(
    () => (
      <>
        <Table.Column name="_dataStatus" width={120} lock={ColumnLock.left} renderer={renderTag} />
        <Table.Column
          name="_info"
          lock={ColumnLock.left}
          tooltip={TableColumnTooltip.overflow}
          width={120}
        />
      </>
    ),
    []
  );

  return (
    <Spin spinning={loading}>
      <Tabs>
        {!isEmpty(dsArr) && importType === 'templateCode'
          ? templateTargetList.slice().map((item, index) => {
            const ds = dsArr[index];
            return ds ? (
              // eslint-disable-next-line react/no-array-index-key
              <Tabs.TabPane key={`${index}-${item.id}`} tab={item.sheetName}>
                <Table dataSet={ds}>
                  {beforeColumns}
                  {(item.templateLineList || []).map(temp => {
                    return (
                      <Table.Column
                        name={temp.columnCode}
                        width={(temp.columnName?.length || 0) * 16 + 32}
                        editor={record => {
                          return record.get('_dataStatus') !== 'IMPORT_SUCCESS'
                        }}
                      />
                    );
                  })}
                </Table>
              </Tabs.TabPane>
            ) : null;
          })
          : (
            businessObjectTemplates
              .slice()
              .find(item => item.templateCode === actualTemplateCode)
              ?.importTemplateSheets?.slice() || []
          ).map((item, index) => {
            const ds: DataSet = dsArr[index];
            return ds ? (
              // eslint-disable-next-line react/no-array-index-key
              <Tabs.TabPane key={`${index}-${item.id}`} tab={item.sheetName}>
                <Form
                  dataSet={ds.queryDataSet}
                  labelLayout={LabelLayout.float}
                  columns={4}
                  style={{ padding: '4px 0 16px' }}
                >
                  <Select name="status" onChange={() => handleChange(ds)} />
                </Form>
                <Table dataSet={ds} queryBar={TableQueryBarType.none}>
                  {beforeColumns}
                  {orderBy(item.importTemplateColumns || [], 'orderSeq')
                    .filter(i => i.enabledFlag && i.fieldName)
                    .map(temp => {
                      return (
                        <Table.Column
                          name={temp.fieldCode}
                          width={temp.fieldName.length * 16 + 32}
                          editor={record => {
                            return record.get('_dataStatus') !== 'IMPORT_SUCCESS'
                          }}
                        />
                      );
                    })}
                </Table>
              </Tabs.TabPane>
            ) : null;
          })}
      </Tabs>
    </Spin>
  );
};

export default observer(Drawer);
