/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import type { Record } from 'choerodon-ui/dataset';
import type { TableGroup } from 'choerodon-ui/pro/lib/table/Table';
import React, { useMemo, useCallback, useState, useRef } from 'react';
import { isObject, isString, isNil } from 'lodash';
import { observer } from 'mobx-react-lite';
import { toJS } from 'mobx';
import { connect } from 'dva';
import moment from 'moment';
import { DataSet, Button, Modal, DateTimePicker, Form, Select } from 'choerodon-ui/pro';
import { Upload } from 'choerodon-ui';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { TableAutoHeightType } from 'choerodon-ui/pro/lib/table/enum';
import { Header, Content } from 'hzero-front/lib/components/Page';
import intl from 'hzero-front/lib/utils/intl';
import { Button as PermissionButton } from 'hzero-front/lib/components/Permission';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import { isTenantRoleLevel, getResponse, getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import notification from 'hzero-front/lib/utils/notification';
import { downloadFileByAxios, queryUUID } from 'hzero-front/lib/services/api';
import { HZERO_FILE } from 'hzero-front/lib/utils/config';
import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';
import { FieldType } from 'choerodon-ui/dataset/data-set/enum';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import classnames from 'classnames';

import { listTableDS } from '../../stores/translateWorkbenchDs';
import { refreshData, exportData, beforeUploadData, uploadData } from '../../services/translateWorkbenchService';
import styles from './index.less';
import ImportHistory from './ImportHistory';

export function isJSON(str) {
  let result;
  try {
    result = JSON.parse(str);
  } catch (e) {
    return false;
  }
  return isObject(result) && !isString(result);
}

function TranslateWorkench({ supportLanguage }) {
  const batchImportUploadRef = useRef<any>();
  const [state, setState] = useState({
    uploading: undefined,
    batchImportLoading: false,
  });
  const tableDs = useMemo(() => new DataSet(listTableDS()), []);
  const isTenant = useMemo(() => isTenantRoleLevel(), []);
  const currentTenant = useMemo(() => getCurrentOrganizationId(), []);
  const rowHeight = useMemo(() => isTenant ? 48 : undefined, [isTenant]);
  const languageList = useMemo(() => {
    const list: {
      code: string;
      name: string;
    }[] = [];
    if (supportLanguage && supportLanguage.length) {
      supportLanguage.forEach(language => {
        list.push({
          code: language.code,
          name: language.name,
        });
      });
    }
    return list;
  }, [supportLanguage]);

  const exportApi = async (data) => {
    const res = await exportData(data);
    if (res && isString(res)) {
      if (isJSON(res) && JSON.parse(res).failed) {
        notification.error({ description: JSON.parse(res).message });
      } else {
        const api = `${HZERO_FILE}/v1/${isTenant ? `${currentTenant}/` : ''}files/download`;
        const queryParams = [
          { name: 'url', value: encodeURIComponent(res) },
          { name: 'bucketName', value: `${PRIVATE_BUCKET}` },
        ];
        downloadFileByAxios({ requestUrl: api, queryParams, method: 'GET' })
          .then(resp => {
            if (getResponse(resp)) {
              return true;
            }
          });
      }
    } else {
      notification.error({});
    }
    return false;
  };

  const handleExport = useCallback((record: Record, isCustom: boolean = false) => {
    const data: any = {
      translateObjectId: record.get("translateObjectId"),
    };
    if (isTenant) {
      data.tenantId = isCustom ? currentTenant : 0;
    }
    exportApi(data);
  }, [isTenant, currentTenant]);

  const handleUpload = async (file, { id, batch, langs }) => {
    setState(prevState => ({ ...prevState, uploading: id, batchImportLoading: batch }));
    const res = await queryUUID({ tenantId: getCurrentOrganizationId() });
    if (getResponse(res) && res && res.content) {
      const attachmentUUID = res.content;
      const formData = new FormData();
      formData.append('file', file, file.name);
      formData.append('attachmentUUID', attachmentUUID);
      formData.append('bucketName', 'private-bucket');
      formData.append('directory', '/translate-object-upload');
      const res1 = await beforeUploadData(formData);
      if (getResponse(res1) && res1 && res1.fileUrl) {
        const res2 = await uploadData({ langs }, { batch, fileUrl: encodeURIComponent(res1.fileUrl) });
        if (getResponse(res2)) {
          notification.success({});
        }
        setState(prevState => ({ ...prevState, uploading: undefined, batchImportLoading: false }));
      } else {
        setState(prevState => ({ ...prevState, uploading: undefined, batchImportLoading: false }));
      }
    } else {
      setState(prevState => ({ ...prevState, uploading: undefined, batchImportLoading: false }));
    }
  };

  const beforeUpload = async (file: any, { id, batch = false }: { id?: any; batch?: boolean }) => {
    setState(prevState => ({ ...prevState, uploading: id, batchImportLoading: batch }));
    const ds = new DataSet({
      autoCreate: true,
      fields: [{
        name: 'langs',
        multiple: true,
        label: intl.get('hpfm.translateWorkbench.view.title.lang').d('语言'),
        required: true,
      }],
    });
    Modal.open({
      closable: false,
      autoCenter: true,
      title: intl.get('hpfm.translateWorkbench.view.title.chooseLang').d('选择语言'),
      children: (
        <Form dataSet={ds} labelLayout={LabelLayout.float}>
          <Select name='langs'>
            {languageList.map(lang => (
              <Select.Option value={lang.code}>{lang.name}</Select.Option>
            ))}
          </Select>
        </Form>
      ),
      onOk: async() => {
        const record = ds.current;
        const flag = await ds.validate();
        if (!flag || !record) {
          return false;
        }
        const data: any = { id, batch };
        const langs = toJS(record.get('langs'));
        if (langs) {
          data.langs = langs.toString();
        }
        handleUpload(file, data);
      },
    });
    return false;
  };

  const handleRefresh = useCallback(async (record: Record) => {
    const res = await refreshData({
      translateObjectId: record.get("translateObjectId"),
    });
    if (getResponse(res)) {
      notification.success({});
      tableDs.query();
    }
  }, []);

  const dynamicLanguageColumns = useMemo(() => {
    return languageList.map(language => {
      const { code, name } = language;
      return {
        key: code,
        header: name,
        width: 100,
        renderer: ({ record }) => {
          if (!record) {
            return;
          }
          const dataRangeType = record.get('dataRangeType');
          const AllCountList = record.get('countValue') || [];
          const { countValue: selfAlLCount = 0 } = AllCountList.find(c => c.tenantId === currentTenant) || {};
          const { countValue: otherAlLCount = 0 } = AllCountList.find(c => c.tenantId !== currentTenant) || {};
          const langCountList = record.get('langCountList') || [];
          const { countValue: selfLangCount = 0 } = langCountList.find(c => c.lang === code && c.tenantId === currentTenant) || {};
          const { countValue: otherLangCount = 0 } = langCountList.find(c => c.lang === code && c.tenantId !== currentTenant) || {};
          if (!isTenant) {
            return isNil(selfLangCount) ? '-' : (
              <span className={selfAlLCount === selfLangCount ? styles['green-font'] : styles['red-font']}>
                {selfLangCount}
              </span>
            );
          }
          if (dataRangeType === 'P') {
            return (
              <div
                className={styles['group-item']}
                style={{
                  height: '0.48rem',
                  lineHeight: '0.48rem',
                }}
              >
                <label className={styles['group-title']}>
                  {intl.get('hpfm.translateWorkbench.view.title.preDefine').d('预定义')}
                </label>
                {isNil(otherLangCount) ? '-' : (
                  <span className={otherAlLCount === otherLangCount ? styles['green-font'] : styles['red-font']}>
                    {otherLangCount}
                  </span>
                )}
              </div>
            );
          } else if (dataRangeType === 'T') {
            return (
              <div
                className={styles['group-item']}
                style={{
                  height: '0.48rem',
                  lineHeight: '0.48rem',
                }}
              >
                <label className={styles['group-title']}>
                  {intl.get('hpfm.translateWorkbench.view.title.custome').d('自定义')}
                </label>
                {isNil(selfLangCount) ? '-' : (
                  <span className={selfAlLCount === selfLangCount ? styles['green-font'] : styles['red-font']}>
                    {selfLangCount}
                  </span>
                )}
              </div>
            );
          }
          return (
            <div>
              <div className={styles['group-item']}>
                <label className={styles['group-title']}>
                  {intl.get('hpfm.translateWorkbench.view.title.preDefine').d('预定义')}
                </label>
                {isNil(otherLangCount) ? '-' : (
                  <span className={otherAlLCount === otherLangCount ? styles['green-font'] : styles['red-font']}>
                    {otherLangCount}
                  </span>
                )}
              </div>
              <div className={styles['group-item']}>
                <label className={styles['group-title']}>
                  {intl.get('hpfm.translateWorkbench.view.title.custome').d('自定义')}
                </label>
                {isNil(selfLangCount) ? '-' : (
                  <span className={selfAlLCount === selfLangCount ? styles['green-font'] : styles['red-font']}>
                    {selfLangCount}
                  </span>
                )}
              </div>
            </div>
          );
        },
      };
    });
  }, [languageList, currentTenant]);

  const groups = [
    {
      name: 'objectType',
      type: 'column',
      columnProps: {
        lock: 'left',
        width: 100,
        header: () => intl.get('hpfm.translateWorkbench.model.dataConfig.type').d('类型'),
        renderer: ({ record }) => record && record.get('objectTypeMeaning'),
      },
    },
    {
      name: 'translateObjectId',
      type: 'column',
      columnProps: {
        lock: 'left',
        width: 150,
        header: () => intl.get('hpfm.translateWorkbench.model.dataConfig.object').d('对象'),
        renderer: ({ record }) => record && record.get('objectName'),
      },
    },
    {
      name: 'translateObjectId',
      type: 'column',
      columnProps: {
        lock: 'right',
        width: 100,
        header: () => intl.get('hpfm.translateWorkbench.view.title.exportData').d('导出数据'),
        renderer: ({ record }) => {
          if (!record) {
            return '-';
          }
          const dataRangeType = record.get('dataRangeType');
          if (!isTenant) {
            return (
              <Button funcType={FuncType.link} onClick={() => handleExport(record)}>
                {intl.get('hpfm.translateWorkbench.view.button.donwload').d('下载')}
              </Button>
            );
          }
          if (dataRangeType === 'P') {
            return (
              <Button funcType={FuncType.link} onClick={() => handleExport(record)}>
                {intl.get('hpfm.translateWorkbench.view.button.donwloadPreDefine').d('下载预定义')}
              </Button>
            );
          } else if (dataRangeType === 'T') {
            return (
              <Button funcType={FuncType.link} onClick={() => handleExport(record, true)}>
                {intl.get('hpfm.translateWorkbench.view.button.donwloadCustome').d('下载自定义')}
              </Button>
            );
          }
          return (
            <div>
              <div className={styles['group-item']}>
                <Button funcType={FuncType.link} onClick={() => handleExport(record)}>
                  {intl.get('hpfm.translateWorkbench.view.button.donwloadPreDefine').d('下载预定义')}
                </Button>
              </div>
              <div className={styles['group-item']}>
                <Button funcType={FuncType.link} onClick={() => handleExport(record, true)}>
                  {intl.get('hpfm.translateWorkbench.view.button.donwloadCustome').d('下载自定义')}
                </Button>
              </div>
            </div>
          );
        },
      },
    },
    {
      name: 'translateObjectId',
      type: 'column',
      columnProps: {
        lock: 'right',
        header: intl.get('hpfm.translateWorkbench.view.title.translateUpload').d('翻译上传'),
        width: 100,
        renderer: ({ record }) => {
          if (!record) {
            return '-';
          }
          const id = record.get('translateObjectId');
          const dataRangeType = record.get('dataRangeType');
          if (!isTenant) {
            return (
              <Upload
                accept=".xls,.xlsx"
                beforeUpload={(file) => {
                  beforeUpload(file, { id });
                  return false;
                }}
                showUploadList={false}
              >
                <PermissionButton
                  permissionList={[
                    {
                      code: 'hzero.site.translation-workbench.button.upload',
                    },
                  ]}
                  type='c7n-pro'
                  funcType={FuncType.link}
                  loading={state.uploading === id}
                  renderEmpty={() => '-'}
                >
                  {intl.get('hpfm.translateWorkbench.view.button.upload').d('上传')}
                </PermissionButton>
              </Upload>
            );
          }
          if (dataRangeType !== 'P') {
            return (
              <Upload
                accept=".xls,.xlsx"
                beforeUpload={(file) => {
                  beforeUpload(file, { id });
                  return false;
                }}
                showUploadList={false}
              >
                <PermissionButton
                  type='c7n-pro'
                  permissionList={[
                    {
                      code: 'hzero.site.translation-workbench.button.tenant.upload',
                    },
                  ]}
                  funcType={FuncType.link}
                  loading={state.uploading === id}
                  renderEmpty={() => '-'}
                >
                  {intl.get('hpfm.translateWorkbench.view.button.uploadCustom').d('上传自定义')}
                </PermissionButton>
              </Upload>
            );
          }
          return '-';
        },
      },
    },
    !isTenant && {
      name: 'translateObjectId',
      type: 'column',
      columnProps: {
        lock: 'right',
        width: 100,
        header: () => intl.get('hpfm.translateWorkbench.model.dataConfig.dataRange').d('数据范围'),
        renderer: ({ record }) => record && record.get('dataRangeTypeMeaning'),
      },
    },
    {
      name: 'translateObjectId',
      type: 'column',
      columnProps: {
        width: 100,
        lock: 'right',
        header: () => intl.get('hpfm.translateWorkbench.view.title.statistics').d('统计'),
        renderer: ({ record }) => {
          if (!record) {
            return '-';
          }
          return (
            <Button funcType={FuncType.link} onClick={() => handleRefresh(record)}>
              {intl.get('hpfm.translateWorkbench.view.button.recalculate').d('重新统计')}
            </Button>
          );
        },
      },
    },
    {
      name: 'translateObjectId',
      type: 'column',
      columnProps: {
        lock: 'right',
        width: 150,
        header: () => intl.get('hpfm.translateWorkbench.model.dataConfig.lastStatisticalTime').d('最后统计时间'),
        renderer: ({ record }) => record && record.get('lastStatisticsDate') || '-',
      },
    },
  ].filter(Boolean) as TableGroup[];

  const columns = useMemo(() => {
    return [
      // { name: 'objectName' },
      {
        name: 'fieldName',
        // width: 250
      },
      {
        name: 'countValue',
        width: 120,
        renderer: ({ value, record }) => {
          if (!record) return;
          const dataRangeType = record?.get('dataRangeType');
          const AllCountList = value || [];
          const { countValue: selfAlLCount = 0 } = AllCountList.find(c => c.tenantId === currentTenant) || {};
          const { countValue: otherAlLCount = 0 } = AllCountList.find(c => c.tenantId !== currentTenant) || {};
          if (!isTenant) {
            return <span className={styles['green-font']}>{selfAlLCount}</span>;
          }
          if (dataRangeType === 'P') {
            return (
              <div
                className={styles['group-item']}
                style={{
                  height: '0.48rem',
                  lineHeight: '0.48rem',
                }}
              >
                <label className={styles['group-title']}>
                  {intl.get('hpfm.translateWorkbench.view.title.preDefine').d('预定义')}
                </label>
                <span className={styles['green-font']}>{otherAlLCount}</span>
              </div>
            );
          } else if (dataRangeType === 'T') {
            return (
              <div
                className={styles['group-item']}
                style={{
                  height: '0.48rem',
                  lineHeight: '0.48rem',
                }}
              >
                <label className={styles['group-title']}>
                  {intl.get('hpfm.translateWorkbench.view.title.custome').d('自定义')}
                </label>
                <span className={styles['green-font']}>{selfAlLCount}</span>
              </div>
            );
          }
          return (
            <div>
              <div className={styles['group-item']}>
                <label className={styles['group-title']}>
                  {intl.get('hpfm.translateWorkbench.view.title.preDefine').d('预定义')}
                </label>
                <span className={styles['green-font']}>{otherAlLCount}</span>
              </div>
              <div className={styles['group-item']}>
                <label className={styles['group-title']}>
                  {intl.get('hpfm.translateWorkbench.view.title.custome').d('自定义')}
                </label>
                <span className={styles['green-font']}>{selfAlLCount}</span>
              </div>
            </div>
          );
        },
      },
      ...dynamicLanguageColumns,
    ] as ColumnProps[];
  }, [dynamicLanguageColumns, isTenant, currentTenant, handleRefresh]);

  const handleQuery = useCallback(({ params }) => {
    const { creationDate } = params || {};
    const queryParams = params;
    if (creationDate) {
      const [creationDateBefore, creationDateAfter] = creationDate.split(',');
      if (creationDateBefore) {
        queryParams.creationDateBefore = creationDateBefore;
      }
      if (creationDateAfter) {
        queryParams.creationDateAfter = creationDateAfter;
      }
    }
    if (tableDs.queryDataSet) {
      tableDs.queryDataSet.loadData([queryParams]);
      // 解决缓存问题
      tableDs.query(tableDs.currentPage);
    }
  }, [tableDs]);

  const batchExport = useCallback(() => {
    const exportFormDs = new DataSet({
      autoCreate: true,
      forceValidate: true,
      fields: [
        {
          name: 'creationDateAfter',
          label: intl.get('hpfm.translateWorkbench.model.label.creationDateAfter').d('数据创建时间从'),
          type: FieldType.dateTime,
          required: true,
          max: 'creationDateBefore',
        },
        {
          name: 'creationDateBefore',
          label: intl.get('hpfm.translateWorkbench.model.label.creationDateBefore').d('数据创建时间至'),
          type: FieldType.dateTime,
          min: 'creationDateAfter',
        },
      ],
    });
    Modal.open({
      title: intl.get('hzero.common.button.priceExport').d('批量导出'),
      children: (
        <Form dataSet={exportFormDs} columns={1}>
          <DateTimePicker name='creationDateAfter' />
          <DateTimePicker name='creationDateBefore' />
        </Form>
      ),
      onOk: async () => {
        const flag = await exportFormDs.validate();
        if (!flag || !exportFormDs.current) {
          return false;
        }
        const { creationDateAfter, creationDateBefore } =
          exportFormDs.current.get(['creationDateAfter', 'creationDateBefore']);
        const data: any = {
          creationDateAfter: moment(creationDateAfter).format('YYYY-MM-DD HH:mm:ss'),
          batch: true,
        };
        if (creationDateBefore) {
          data.creationDateBefore = moment(creationDateBefore).format('YYYY-MM-DD HH:mm:ss');
        }
        const res = await exportApi(data);
        return res;
      },
    });
  }, []);

  const handleViewImportHistory = useCallback(() => {
    Modal.open({
      title: intl.get('hzero.common.button.import.viewHistory').d('导入记录查看'),
      drawer: true,
      style: { width: '780px' },
      children: <ImportHistory />,
    });
  }, []);

  return (
    <>
      <Header
        title={intl.get('hpfm.translateWorkbench.view.title.translateWorkbench').d('翻译工作台')}
      >
        <Upload
          accept=".xls,.xlsx"
          beforeUpload={(file) => {
            beforeUpload(file, { batch: true });
            return false;
          }}
          style={{
            position: 'relative',
            top: '-1px',
            display: 'inline-block',
            height: '32px',
            lineHeight: '32px',
            marginLeft: '8px',
           }}
          showUploadList={false}
        >
          <Button icon='unarchive' loading={state.batchImportLoading}>
            {intl.get('hzero.common.view.title.batchImport').d('批量导入')}
          </Button>
        </Upload>
        <Button icon='archive' onClick={batchExport}>
          {intl.get('hzero.common.button.priceExport').d('批量导出')}
        </Button>
        {!isTenant && (
          <Button icon='archive' onClick={handleViewImportHistory}>
            {intl.get('hzero.common.button.import.viewHistory').d('导入记录查看')}
          </Button>
        )}
      </Header>
      <Content>
        <div style={{ height: 'calc(100vh - 200px)' }}>
          <FilterBarTable
            dataSet={tableDs}
            groups={groups}
            columns={columns}
            customizable
            customizedCode='hpfm.translateWorkbench.list'
            rowHeight={rowHeight}
            className={classnames(styles.list, {
              [styles['list-with-line-Height']]: isTenant,
            })}
            filterBarConfig={{
              onQuery: handleQuery,
            }}
            autoHeight={{ type: TableAutoHeightType.maxHeight, diff: 0 }}
          />
        </div>
      </Content>
    </>
  );
}

export default connect(
  ({ global }) => ({
    supportLanguage: global.supportLanguage,
  })
)(formatterCollections({ code: ['hpfm.translateWorkbench'] })(observer(TranslateWorkench)));
