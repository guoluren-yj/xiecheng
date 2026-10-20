import { stringify } from 'querystring';
import React, { Fragment, useMemo, useCallback } from 'react';
import { DataSet, Button } from 'choerodon-ui/pro';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { TableMode } from 'choerodon-ui/pro/lib/table/enum';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';
import intl from 'utils/intl';
import SearchBarTable from '_components/SearchBarTable';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { Header, Content } from 'components/Page';
import { flow, throttle } from 'lodash';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import withProps from 'utils/withProps';
import { observer } from 'mobx-react';

// import Create from '../Create';
import { editTemplate, getTemplate, enableTemplate, releaseTemplate } from '../Detail/stores/api';
import type { Operate } from '../utils/type';
import { ListDS } from './indexDS';
import StatusTag from '../components/StatusTag';
import HistoryVersion from '../components/HistoryVersion';
import { ListCustomizeCode, TemplateStatusCode, permissionCodeMap } from '../utils/type';
import styles from '../../PPAPWorkbench/List/components/index.less';
import { formatColumnCommand } from '../components/ColumnBtnGroup';
import { permissionDS } from '../../PPAPWorkbench/Detail/stores/indexDS';


// import styles from '../../common.less';

interface PayTermsCtrlProps {
  history: any;
  customizeTable: (customizeOptions: object | undefined, tableElement: React.ReactNode) => any;
  listDs: DataSet;
}

interface ColumnsProps extends ColumnProps {
  header?: any,
};

const PPAPTemplateList = flow(observer, withCustomize({
  unitCode: [
    ...Object.values(ListCustomizeCode),
  ],
}), withProps(
  (() => {
    const listDs = new DataSet(ListDS());
    return {
      listDs,
    };
  }) as any,
  { cacheState: true },
) as any, formatterCollections({ code: ['sqam.ppap'] }))((props: PayTermsCtrlProps) => {
  const { history, customizeTable, listDs } = props;
   const permissionDs = useMemo<DataSet>(() => new DataSet(permissionDS(permissionCodeMap)), []);
   const permissionMap = permissionDs.current;

  const handleToDetail = useCallback((templateId, operate) => {
    history.push({
      pathname: `/sqam/PPAPTemplate/detail/${templateId}`,
      search: stringify({ operate }),
    });
  }, [history]);

  const handleCreate = useCallback(() => {
    history.push({
      pathname: `/sqam/PPAPTemplate/detail/create`,
    });
  }, [history]);

  // 跳转至详情页
  const handleBrforeToDetail = useCallback(async (record: any, operate: Operate) => {
    const res = operate === 'edit' ? await editTemplate({ templateId: record?.get('templateId') }) : await getTemplate({ templateId: record?.get('templateId') });
    if (!getResponse(res)) return;
    const templateId = res?.templateId;
    handleToDetail(templateId, operate);
  }, [handleToDetail]);

  const handleEnable = useCallback(async (record) => {
    const enableFlag = record?.get('enableFlag');
    const res = getResponse(await enableTemplate({...record?.toData(), enableFlag: enableFlag ? 0 : 1}));
    if (!res) return;
    notification.success({});
    listDs.query();
  }, [listDs]);

  const handleRelease = useCallback(async (record) => {
    const res = getResponse(await releaseTemplate({...record?.toData()}));
    if (!res) return;
    notification.success({});
    listDs.query();
  }, [listDs]);

  const getColumnnsBtns = useCallback((record) => {
    const { versionNumber, displayStatus, snapshotFlag, templateStatus } = record?.get(['versionNumber', 'displayStatus', 'snapshotFlag', 'templateStatus']) || {};
    const btns = [
      {
        name: 'edit',
        text: intl.get('hzero.common.button.edit').d('编辑'),
        onClick: () => handleBrforeToDetail(record, 'edit'),
        showFlag: permissionMap?.get('edit') && Number(snapshotFlag) === 1,
      },
      {
        name: 'enable',
        text: intl.get(`hzero.common.enable`).d('启用'),
        onClick: () => handleEnable(record),
        showFlag: permissionMap?.get('disable') && displayStatus === 'DISABLE',
      },
      {
        name: 'disable',
        text: intl.get('hzero.common.status.disabled').d('禁用'),
        onClick: () => handleEnable(record),
        showFlag: permissionMap?.get('disable') && displayStatus === 'PUBLISHED',
      },
      {
        name: 'release',
        text: intl.get('hzero.common.button.publish').d('发布'),
        onClick: () => handleRelease(record),
        showFlag: permissionMap?.get('publish') && displayStatus === 'UNPUBLISHED',
      },
      {
        name: 'historyRecord',
        group: true,
        text: intl.get('hzero.common.button.historyVerison').d('历史版本'),
        children: (
          <HistoryVersion
            templateNum={record?.get('templateNum')}
            currentTemplateId={record?.get('templateId')}
            history={history}
          />
        ),
        showFlag: versionNumber > 1 && templateStatus === 'PUBLISHED',
      },
    ];
    return formatColumnCommand({ buttons: btns });
  }, [handleBrforeToDetail, handleEnable, history, handleRelease, permissionMap]);

  const columns: ColumnsProps[] = useMemo(() => {
    return [
      {
        name: 'displayStatus',
        header: ({ title }) => <span style={{ paddingLeft: 36 }}>{title}</span>,
        width: 120,
        renderer: ({ value, text }) => (
          <StatusTag value={text} flag color={TemplateStatusCode[value]} />
        ),
      },
      {
        name: 'operation',
        width: 200,
        renderer: ({ record }) => {
          return (<div className={styles['sqam-column-btn-wrapper']}>{getColumnnsBtns(record)}</div>);
        },
      },
      {
        name: 'templateNum',
        width: 260,
        renderer: ({ value, record }) => (
          <a onClick={() => handleBrforeToDetail(record, 'view')}>
            {value}
          </a>
        ),
      },
      {
        name: 'templateName',
        width: 240,
      },
      {
        name: 'versionNumber',
        width: 120,
      },
    ];
  }, [handleBrforeToDetail, getColumnnsBtns]);

  return (
    <Fragment>
      <Header title={intl.get('sqam.ppap.view.title.ppapTemplate').d('PPAP项目模板定义')}>
        {
          permissionMap?.get('create') && (
            <Button
              icon="add"
              onClick={throttle(handleCreate, 1500, { trailing: false })}
              color={ButtonColor.primary}
            >
              {intl.get('hzero.common.button.create').d('新建')}
            </Button>
          )
        }
      </Header>
      <Content>
        <div style={{ height: 'calc(100vh - 200px)' }}>
          {customizeTable(
            { code: ListCustomizeCode.TableCode },
            <SearchBarTable
              cacheState
              mode={TableMode.tree}
              customizable
              dataSet={listDs}
              columns={columns}
              style={{ maxHeight: 'calc(100% - 22px)' }}
              pagination={{ pageSizeOptions: ['10', '20', '50', '100', '500', '1000'] }}
              searchCode={ListCustomizeCode.SearchBarCode}
              searchBarConfig={{
                editorProps: {
                  templateStatus: {
                    optionsFilter: (record) => record.get('value') !== 'INVALID',
                  },
                },
              }}
            />
          )}
        </div>
      </Content>
    </Fragment>
  );
});
export default PPAPTemplateList;
