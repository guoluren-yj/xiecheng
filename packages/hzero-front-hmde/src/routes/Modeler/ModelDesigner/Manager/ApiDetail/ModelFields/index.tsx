/*
 * 模型字段定义table
 * @Author: 汪渊  <yuan.wang07@hand-china.com>
 * @version: 1.0.0
 * @copyright: copyright: HAND ® 2020
 */

import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Icon, Tooltip, Select, NumberField, DataSet } from 'choerodon-ui/pro';
import { upperFirst } from 'lodash';
import { observer } from 'mobx-react-lite';
import {
  TableQueryBarType,
  TableColumnTooltip,
  ColumnAlign,
} from 'choerodon-ui/pro/lib/table/enum';
import { Renderer, RenderProps } from 'choerodon-ui/pro/lib/field/FormField';

import ImgIcon from '@/utils/ImgIcon';
import _store from '@/routes/Modeler/ModelDesigner/stores';
import { searchMatcher } from '@/utils/common';
import globalStyles from '@/lowcodeGlobalStyles/global.less';
import { hasNumberType } from '@/routes/Modeler/ModelDesigner/utils/utils';
import { modelDataTypeList } from '@/routes/Modeler/ModelDesigner/utils/config';

import { isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import styles from '../../ModelDetail/index.less';
import { IModelManagerStore } from '../../../stores/index';
import isFailureResponse from '@/utils/isFailureResponse';

interface IParams {
  handleEditField: (record) => any;
  tableDs: DataSet;
}

const { Column } = Table;
// 静态数据
const { Option } = Select;
export default observer(({ handleEditField = () => {}, tableDs }: IParams) => {
  const modelManagerStore = useContext<IModelManagerStore>(_store as any).store;

  const {
    setRightEditData,
    ref: { listViewRef },
    setDataStore,
    storeData: { modelDetail, apiDetailHeaderEditFlag, apiFileBatchEditFlag },
  }: IModelManagerStore = modelManagerStore; // useContext<IModelManagerStore>(_store as any).store;

  const perHidden =
    (isTenantRoleLevel() || modelManagerStore.storeData.resourceUponRoleHierarchy === 'tenant') &&
    modelManagerStore.storeData.modelType === 'PLATFORM_SHARED';

  const [isEditAll, setIsEditAll] = useState<boolean>(false);

  const init = () => {
    if (!modelDetail.id) return;
    setDataStore('menuLoading', true, true);
    tableDs.query().then(() => {
      setDataStore('menuLoading', false, true);
    });
    setRightEditData('field', tableDs.current);
  };

  useEffect(() => {
    init();
  }, [modelDetail.id]);

  // 0/1转为是否
  function renderBooleanText({ value }: { value: number }) {
    if ([0, 1].includes(value)) {
      return <span>{value === 1 ? '是' : '否'}</span>;
    }
    return <></>;
  }

  const renderDisplayName = ({ record, value }: RenderProps) => (
    <a onClick={() => handleEditField(record)}>
      {record?.get('primaryFlag') === 1 && (
        <Tooltip placement="top" title="主键">
          <Icon
            key="vpn_key"
            type="vpn_key"
            style={{
              fontSize: '0.16rem',
              verticalAlign: 'text-bottom',
              marginRight: '8px',
              transform: 'rotate(-45deg)',
            }}
          />
        </Tooltip>
      )}
      {record?.get('enabledFlag') === 0 && (
        <Tooltip title="已失效">
          <Icon key="report" type="report" className={styles.icon} style={{ color: '#f75e5e' }} />
        </Tooltip>
      )}
      <span>{value}</span>
    </a>
  );
  const renderDataType = ({ value }: RenderProps) => upperFirst(value);

  /**
   * 批量编辑
   */
  const batchEdit = (): void => {
    setIsEditAll(!isEditAll);
    setDataStore('apiFileBatchEditFlag', !apiFileBatchEditFlag);
    if (isEditAll) {
      tableDs.reset();
    }
  };

  // 获取可以操作的按钮
  const getTableButtons = () => {
    const bathEdit = (
      <Button icon="mode_edit" disabled={apiDetailHeaderEditFlag} onClick={batchEdit} key="poEdit">
        批量编辑
      </Button>
    );
    const saveBtn = (
      <Button
        icon="save"
        onClick={async () => {
          const flag = await tableDs.validate();
          if (flag) {
            const res = await tableDs.submit();
            if (isFailureResponse(res)) {
              return false;
            }
            listViewRef.current.handleMenuQueryList({ dataSourceType: 'apiTable' });
            setIsEditAll(false);
            setDataStore('apiFileBatchEditFlag', false);
          }
        }}
        key="save"
      >
        保存
      </Button>
    );
    const bathEditCancel = (
      <Button
        icon="mode_edit"
        disabled={apiDetailHeaderEditFlag}
        onClick={batchEdit}
        key="poEditCancel"
      >
        取消
      </Button>
    );

    const preHiddenButtons = [];
    const buttons = [
      <Button
        icon="playlist_add"
        disabled={apiDetailHeaderEditFlag}
        onClick={() => {
          if (!isEditAll) {
            setIsEditAll(true);
            setDataStore('apiFileBatchEditFlag', true);
          }
          tableDs.create({}, 0);
        }}
        key="edit"
      >
        新增
      </Button>,
      <Button
        disabled={tableDs.selected.length === 0 || apiDetailHeaderEditFlag || apiFileBatchEditFlag}
        onClick={() => tableDs.delete(tableDs.selected)}
        key="delete"
      >
        <ImgIcon name="batch-operation@v4.0.svg" size={16} style={{ marginRight: '5px' }} />
        批量删除
      </Button>,
      bathEdit,
    ];

    if (isEditAll) {
      return [bathEditCancel, saveBtn];
    }

    if (perHidden) {
      return preHiddenButtons;
    } else {
      return buttons;
    }
  };

  return (
    <Table
      dataSet={tableDs}
      queryBar={'none' as TableQueryBarType}
      rowHeight={30}
      className={`${styles.btnFloatRight} ${globalStyles['table-style']}`}
      buttons={getTableButtons()}
    >
      <Column
        tooltip={'overflow' as TableColumnTooltip}
        name="displayName"
        align={'left' as ColumnAlign}
        editor={isEditAll}
        renderer={(!isEditAll && renderDisplayName) as Renderer}
      />
      <Column
        tooltip={'overflow' as TableColumnTooltip}
        name="fieldName"
        align={'left' as ColumnAlign}
        editor={isEditAll}
      />
      <Column
        tooltip={'overflow' as TableColumnTooltip}
        name="dataType"
        align={'left' as ColumnAlign}
        editor={
          isEditAll && (
            <Select name="dataType" searchable searchMatcher={searchMatcher}>
              {modelDataTypeList.map((item) => (
                <Option value={item} key={item}>
                  {item}
                </Option>
              ))}
            </Select>
          )
        }
        renderer={(!isEditAll && renderDataType) as Renderer}
      />
      <Column
        tooltip={'overflow' as TableColumnTooltip}
        name="description"
        align={'left' as ColumnAlign}
        editor={isEditAll}
      />
      <Column
        tooltip={'overflow' as TableColumnTooltip}
        name="dataSize"
        width={100}
        align={'left' as ColumnAlign}
        editor={isEditAll && <NumberField step={1} />}
      />
      <Column
        tooltip={'overflow' as TableColumnTooltip}
        name="requiredFlag"
        width={100}
        align={'left' as ColumnAlign}
        editor={isEditAll}
        renderer={(!isEditAll && renderBooleanText) as Renderer}
      />
      <Column
        width={70}
        name="primaryFlag"
        align={ColumnAlign.center}
        editor={isEditAll}
        renderer={({ value }) => (value === 1 ? '是' : '否')}
      />
      <Column
        name="encryptFlag"
        align={ColumnAlign.center}
        width={100}
        editor={(record) =>
          isEditAll &&
          !['objectVersionNumber'].includes(record?.get('fieldName')) &&
          hasNumberType(record?.get('dataType'))
        }
      />
    </Table>
    // </div>
  );
});
