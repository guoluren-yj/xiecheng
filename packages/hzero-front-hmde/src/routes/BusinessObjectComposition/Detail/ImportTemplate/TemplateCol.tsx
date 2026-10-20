import React, { useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import intl from 'srm-front-boot/lib/utils/intl';
import { DataSet, Table, Button, Modal, CheckBox, Tooltip } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import notification from 'hzero-front/lib/utils/notification';
import {
  getResponse,
  getCurrentOrganizationId,
  isTenantRoleLevel,
} from 'hzero-front/lib/utils/utils';
import { observer } from 'mobx-react-lite';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { ColumnAlign, TableAutoHeightType } from 'choerodon-ui/pro/lib/table/enum';
import { Buttons } from 'choerodon-ui/pro/lib/table/Table';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
// import { treeDS } from '@/stores/BusinessObject/FieldSelectDS';
import { flatTreeDS } from '@/stores/BusinessObjectComposition/ImportTemplateFieldsDS';
import { deleteTemplateCol, saveSheetPage } from '@/services/businessObjectService';
import { queryTemplateEditPermission } from '@/services/businessObjectServices';

import { TemplateColDS } from '@/stores/BusinessObject/TemplateColDS';
import ImportSelectModal from './ImportSelectModal';

interface IProps {
  data?: any;
  businessObjectId: string;
  currentImportId: string;
  tenantId: any;
  refAll?: any;
  sheetDS: DataSet;
  businessObjectImportTemplateSheetId: string;
  [x: string]: any;
  createFlag?: boolean;
}

const isTenant = isTenantRoleLevel();

const TemplateCol = (props: IProps) => {
  const {
    businessObjectId,
    businessObjectImportTemplateSheetId,
    refAll,
    currentImportId,
    tenantId,
    sheetDS,
    allowEdit,
    // createFlag,
  } = props;
  const [templateEditPermission, setTemplateEditPermission] = useState(false);
  refAll[businessObjectImportTemplateSheetId] = useRef();
  const templateColListDS: DataSet = useMemo(
    () => new DataSet(TemplateColDS(false, businessObjectImportTemplateSheetId) as DataSetProps),
    []
  );
  const fieldTreeDS: DataSet = useMemo(() => new DataSet(flatTreeDS()), []);
  useEffect(() => {
    fetchTemplateEditPermission();
    if (businessObjectImportTemplateSheetId) {
      templateColListDS.query();
    }
  }, []);

  useImperativeHandle(refAll[businessObjectImportTemplateSheetId], () => ({
    templateColListDS,
    businessObjectImportTemplateSheetId,
  }));

  const fetchTemplateEditPermission = () => {
    // 租户层可编辑，平台层非dev环境不可编辑，dev环境根据配置维护判断是否可编辑
    if (isTenantRoleLevel()) {
      setTemplateEditPermission(true);
    } else if (window.$$env.ENV_FLAG !== 'dev') {
      setTemplateEditPermission(false);
    } else {
      queryTemplateEditPermission().then((res) => {
        if (res === true) {
          setTemplateEditPermission(true);
        }
      });
    }
  };

  const handleCreateField = () => {
    Modal.open({
      title: intl.get('hmde.boComposition.exportTemplate.button.selectField').d('字段选择'),
      drawer: false,
      style: { width: '800px' },
      closable: true,
      destroyOnClose: true,
      children: (
        <ImportSelectModal
          currentImportId={currentImportId}
          businessObjectId={businessObjectId}
          id={businessObjectImportTemplateSheetId}
          templateColListDS={templateColListDS}
          fieldTreeDS={fieldTreeDS}
          tenantId={tenantId}
        />
      ),
      okText: intl.get('hzero.common.button.sure').d('确定'),
      onOk: async () => {
        const lastRecord = await templateColListDS?.last();
        let index = lastRecord?.get('orderSeq')
          ? 10 * Math.floor(Number(lastRecord?.get('orderSeq')) / 10)
          : 0;
        const data = fieldTreeDS?.selected.map(item => {
          index += 10;
          return {
            ...item?.toJSONData(),
            businessObjectImportTemplateSheetId,
            fieldName: item?.get('businessObjectFieldName'),
            orderSeq: index,
            requiredFlag: false,
            translatableFlag: false,
            enabledFlag: true,
            validatableFlag: false,
            importableFlag: true,
            tenantId: getCurrentOrganizationId(),
          };
        });
        const record = sheetDS?.filter(sheet => {
          return (
            sheet?.get('businessObjectImportTemplateSheetId') ===
            businessObjectImportTemplateSheetId
          );
        })[0];
        const body = [{ ...record?.toJSONData(), importTemplateColumns: data }];
        saveSheetPage({
          body,
        }).then(res => {
          if (getResponse(res)) {
            templateColListDS.query();
            sheetDS.query();
          }
        });
      },
    });
  };

  const handleDelete = () => {
    // eslint-disable-next-line no-unused-expressions
    templateColListDS.selected.length &&
      deleteTemplateCol({
        body: templateColListDS.selected.map(item => {
          return {
            businessObjectImportTemplateColId: item.get('businessObjectImportTemplateColId'),
          };
        }),
      }).then(res => {
        if (getResponse(res)) {
          notification.success({
            message: intl.get('hmde.common.status.success').d('成功'),
            description: intl.get('hzero.common.notification.success.delete').d('删除成功'),
            placement: 'bottomRight',
          });
          templateColListDS.query();
        } else {
          templateColListDS.query();
        }
      });
  };

  const columns = useMemo((): ColumnProps[] => {
    return [
      {
        name: 'orderSeq',
        align: ColumnAlign.left,
        editor: true,
      },
      {
        name: 'fieldName',
        align: ColumnAlign.left,
      },
      {
        name: 'displayName',
        align: ColumnAlign.left,
        editor: templateEditPermission,
      },
      {
        name: 'businessObjectFieldCode',
        align: ColumnAlign.left,
      },
      {
        name: 'aliasName',
        align: ColumnAlign.left,
        editor: record => record?.get('tenantId') === getCurrentOrganizationId(),
      },
      {
        name: 'businessObjectName',
        align: ColumnAlign.left,
      },
      {
        name: 'sampleData',
        align: ColumnAlign.left,
        editor: true,
      },
      {
        name: 'remark',
        align: ColumnAlign.left,
        editor: true,
      },
      {
        name: 'requiredFlag',
        align: ColumnAlign.left,
        editor: (record, name) => {
          if (isTenant && record.get('tenantId') !== getCurrentOrganizationId() && record.get(name) && record.get('platformRequiredFlag')) {
            return false;
          }
          return true;
        },
      },
      {
        name: 'translatableFlag',
        align: ColumnAlign.left,
        renderer: ({ record }) => {
          if (!record) {
            return null;
          }
          const lovCode = record.get('lovCode');
          return (
            <>
              <CheckBox record={record} name='translatableFlag' disabled={!lovCode} />
              {!!lovCode && (
                <Tooltip
                  title={(
                    <div style={{ maxWidth: '360px', overflow: 'hidden', wordBreak: 'break-all' }}>
                      <div>{intl.get('hmde.bo.field.valueList.code').d('值集编码')}: {lovCode}</div>
                      <div>{intl.get('hmde.bo.field.valueList.code.help').d('仅支持独立值集转换，其他类型不支持')}</div>
                    </div>
                  )}
                >
                  <Icon type='help' style={{ color: '#868d9c', fontSize: '14px', marginLeft: '4px' }} />
                </Tooltip>
              )}
            </>
          );
        },
      },
      {
        name: 'enabledFlag',
        align: ColumnAlign.left,
        editor: true,
      },
      {
        name: 'validatableFlag',
        align: ColumnAlign.left,
        editor: true,
      },
      {
        name: 'importableFlag',
        align: ColumnAlign.left,
        editor: true,
        width: 140,
      },
    ];
  }, [templateEditPermission]);

  const DeleteButtons = (dataSet: any) => {
    const deleteArray = dataSet.selected.map(item => {
      return item.get('tenantId') === getCurrentOrganizationId();
    });
    const isDisabled = dataSet.selected.length === 0 || deleteArray.includes(false);
    return (
      <Button
        icon="delete_sweep"
        disabled={isDisabled}
        onClick={() => {
          Modal.confirm({
            title: intl.get('hzero.common.message.confirm.title').d('提示'),
            children: intl.get('hzero.common.view.delete_selected_row_confirm').d('确认删除选中行？'),
            okText: intl.get('hzero.common.button.sure').d('确定'),
            onOk: async () => handleDelete(),
          });
        }}
      >
        {intl.get('hzero.common.button.batchDelete').d('批量删除')}
      </Button>
    );
  };

  const buttons = () => {
    // if (!isTenant && !createFlag) {
    //   return [];
    // }
    if (!allowEdit) {
      return [];
    }
    const arr = [
      <Button
        icon="playlist_add"
        onClick={() => {
          handleCreateField();
        }}
      >
        {intl.get('hmde.boComposition.importTemplate.buttom.createField').d('新增字段')}
      </Button>,
      DeleteButtons(templateColListDS),
    ] as Buttons[];
    return arr;
  };

  return (
    <Table
      dataSet={templateColListDS as DataSet}
      columns={columns}
      buttons={buttons()}
      autoHeight={{ type: TableAutoHeightType.maxHeight, diff: 10 }}
    />
  );
};

export default formatterCollections({
  code: ['hmde.boComposition', 'hmde.common', 'hzero.common'],
})(observer(TemplateCol));
