import React, { useState, useEffect, useMemo } from 'react';
import intl from 'srm-front-boot/lib/utils/intl';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import {
  getResponse,
  getCurrentOrganizationId,
  isTenantRoleLevel,
  getCurrentUser,
} from 'hzero-front/lib/utils/utils';
import { observer } from 'mobx-react-lite';
import { Header, Content } from 'hzero-front/lib/components/Page';
import qs from 'querystring';
import { Form, DataSet, Table, Button, Modal, IntlField, TextField } from 'choerodon-ui/pro';
import { Buttons } from 'choerodon-ui/pro/lib/table/Table';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { FieldType } from 'choerodon-ui/dataset/data-set/enum';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { ColumnAlign, TableMode, TableAutoHeightType } from 'choerodon-ui/pro/lib/table/enum';
import { isEmpty } from 'lodash';
// import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { saveFieldList, getCompositionDetail } from '@/services/businessObjectService';
// import { usePublicBusinessObjects } from '@/routes/BusinessObjectComposition/Detail';
// import { treeDS } from '@/stores/BusinessObject/FieldSelectDS';
import { tableDS, flatTreeDS } from '@/stores/BusinessObjectComposition/ExportTemplateFieldsDS';
import { queryTemplateEditPermission } from '@/services/businessObjectServices';
import FieldSelectModal from './FieldSelectModal';
import { valueList } from '../FieldInformation/enums';
// import ImgIcon from '@/utils/ImgIcon';

// const isTenant = isTenantRoleLevel();
const { MASTER } = valueList;
const Index = props => {
  let _search = props?.location?.search.split('?')?.[1];
  _search = qs.parse(_search);
  const { businessObjectId, boExportTplId, tenantId, masterBusinessObjectId, businessObjectName, businessObjectCombineId } =
    _search || {};
  // const { handlePublicObject } = usePublicBusinessObjects({ queryParams: true });
  // const [loading, setLoading] = useState(false);
  const { loginName } = getCurrentUser() || {};
  const isAdmin = loginName === 'admin';
  const allowEdit = isAdmin || isTenantRoleLevel() || (window.$$env || {}).HMDE_ADD_FIELD === "true";
  const fieldTableDS: DataSet = useMemo(() => new DataSet(tableDS()), []);
  const fieldTreeDS: DataSet = useMemo(() => new DataSet(flatTreeDS()), []);
  // const [permissionFlag, setPermissionFlag] = useState(false);
  const [templateEditPermission, setTemplateEditPermission] = useState(false);
  const [standardFlag, setStandardFlag] = useState(false);
  useEffect(() => {
    // fetchImportCreatePermission();
    fetchTemplateEditPermission();
    fetchCompositionDetail();
  }, []);

  const fetchCompositionDetail = () => {
    if (!isEmpty(businessObjectCombineId)) {
      getCompositionDetail(businessObjectCombineId).then(res => {
        if (getResponse(res) && res) {
          setStandardFlag(res.standardFlag);
        }
      });
    }
  };

  // const fetchImportCreatePermission = () => {
  //   queryImportCreatePermission().then((res) => {
  //     if (res === true) {
  //       setPermissionFlag(true);
  //     }
  //   });
  // };

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

  useEffect(() => {
    if (boExportTplId) {
      fieldTableDS.setQueryParameter('businessObjectExportTemplateId', boExportTplId);
      fieldTableDS.setQueryParameter('selectedFlag', true);
      fieldTableDS.query();
    }
  }, [boExportTplId]);

  const fieldSelect = () => {
    Modal.open({
      title: intl.get('hmde.boComposition.exportTemplate.button.selectField').d('字段选择'),
      style: { width: '800px' },
      closable: true,
      destroyOnClose: true,
      children: (
        <FieldSelectModal
          fieldTreeDS={fieldTreeDS}
          businessObjectId={businessObjectId}
          businessObjectExportTemplateId={boExportTplId}
          tenantId={tenantId}
        />
      ),
      onOk: () => {
        const data = fieldTreeDS.selected.map(item => {
          return { ...item.toData(), businessObjectExportTemplateId: boExportTplId };
        });
        saveFieldList({
          body: data,
          query: {
            businessObjectExportTemplateId: boExportTplId,
            tenantId: getCurrentOrganizationId(),
          },
        }).then(res => {
          if (getResponse(res)) {
            fieldTableDS.query();
          }
        });
      },
      okText: intl.get('hzero.common.button.sure').d('确定'),
    });
  };

  const addVirtualField = () => {
    const formDs = new DataSet({
      fields: [
        {
          name: 'displayName',
          label: intl.get('hmde.bo.field.name').d('字段名称'),
          required: true,
          type: FieldType.intl,
        },
        {
          name: 'businessObjectFieldCode',
          label: intl.get('hmde.bo.field.code').d('字段编码'),
          required: true,
          validator: value => {
            if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(value)) {
              return intl.get('hmde.bo.field.code.pattern').d(
                '支持大小写字母及数字，必须以字母开头，可包含"_"'
              );
            }
          },
        },
      ],
    });
    const record = formDs.create();
    Modal.open({
      title: intl.get('hmde.boComposition.exportTemplate.button.addVirtualField').d('添加虚拟字段'),
      style: { width: '3.8rem' },
      closable: true,
      drawer: true,
      destroyOnClose: true,
      children: (
        <Form columns={1} record={record} labelLayout={LabelLayout.float}>
          <IntlField name='displayName' />
          <TextField name='businessObjectFieldCode' />
        </Form>
      ),
      onOk: async() => {
        const flag = await record.validate();
        if (!flag) {
          return false;
        }
        const data = [{
          ...record.toData(),
          businessObjectExportTemplateId: boExportTplId,
          businessObjectCode: '_$_FORMULA_OBJECT_$_',
        }];
        saveFieldList({
          body: data,
          query: {
            businessObjectExportTemplateId: boExportTplId,
            tenantId: getCurrentOrganizationId(),
          },
        }).then(res => {
          if (getResponse(res)) {
            fieldTableDS.query();
          }
        });
      },
    });
  };

  // const codeRender = record => {
  //   if (record.get('relateType') !== MASTER) {
  //     if (record.get('relateType')) {
  //       return record.get('businessObjectFieldCode');
  //     }
  //     return record.get('businessObjectFieldCode');
  //   }
  //   return null;
  // };

  const columns = [
    {
      name: 'businessObjectName',
      renderer: ({ text, record }) => {
        return record && record.get('businessObjectCode') === '_$_FORMULA_OBJECT_$_' ?
          intl.get('hmde.common.field.virtual').d('虚拟字段') : text;
      },
    },
    {
      name: 'orderSeq',
      align: 'left',
      editor: record => fieldTableDS.getState('editor') && record?.get('relateType') !== MASTER,
    },
    {
      name: 'businessObjectFieldName',
      renderer: ({ record, text }) => {
        if (!record) {
          return '-';
        }
        return record.get('businessObjectCode') === '_$_FORMULA_OBJECT_$_' ? record.get('displayName') : text;
      },
    },
    {
      name: 'displayName',
      editor: record =>
        fieldTableDS.getState('editor') && templateEditPermission && record?.get('relateType') !== MASTER,
    },
    {
      name: 'businessObjectFieldCode',
      editor: (record) => fieldTableDS.getState('editor') && record.get('businessObjectCode') === '_$_FORMULA_OBJECT_$_',
      // renderer: ({ record }) => codeRender(record),
    },
    {
      name: 'aliasName',
      editor: record =>
        fieldTableDS.getState('editor') &&
        record.get('businessObjectCode') !== '_$_FORMULA_OBJECT_$_' &&
        record?.get('tenantId') === getCurrentOrganizationId() &&
        record?.get('relateType') !== MASTER,
    },
    // { name: 'remark' },
    {
      name: 'enabledFlag',
      editor: record =>
        fieldTableDS.getState('editor') &&
        record?.get('relateType') !== MASTER,
    },
    {
      name: 'defaultExportFlag',
      align: ColumnAlign.left,
      editor: record => fieldTableDS.getState('editor') && record?.get('relateType') !== MASTER,
    },
  ] as ColumnProps[];

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
          dataSet.delete(dataSet.selected);
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
      <Button onClick={fieldSelect} icon="playlist_add">
        {intl.get('hmde.boComposition.exportTemplate.button.addField').d('添加字段')}
      </Button>,
      DeleteButtons(fieldTableDS),
    ] as Buttons[];
    if (standardFlag) {
      arr.push(
        <Button onClick={addVirtualField} icon="playlist_add">
          {intl.get('hmde.boComposition.exportTemplate.button.addVirtualField').d('添加虚拟字段')}
        </Button>
      );
    }
    if (fieldTableDS.getState('editor')) {
      arr.push(
        <Button
          icon="save"
          onClick={async () => {
            if (await fieldTableDS.validate()) {
              fieldTableDS.submit().then(() => {
                fieldTableDS.setState('editor', false);
                fieldTableDS.query();
              });
            }
          }}
        >
          {intl.get('hzero.common.button.save').d('保存')}
        </Button>
      );
      arr.push(
        <Button
          icon="cancel"
          onClick={() => {
            fieldTableDS.reset();
            fieldTableDS.setState('editor', false);
          }}
        >
          {intl.get('hzero.common.button.cancel').d('取消')}
        </Button>
      );
    } else {
      arr.push(
        <Button
          icon="mode_edit"
          disabled={fieldTableDS.length === 0}
          onClick={() => fieldTableDS.setState('editor', true)}
        >
          {intl.get('hmde.common.button.batchEdit').d('批量编辑')}
        </Button>
      );
    }
    return arr;
  };

  // const publicObject = () => {
  //   setLoading(true);
  //   handlePublicObject(businessObjectId).then(() => {
  //     setLoading(false);
  //   });
  // };

  return (
    <>
      <Header
        backPath={`/hmde/business-object-composition/detail/${businessObjectId}?masterBusinessObjectId=${masterBusinessObjectId}&businessObjectName=${businessObjectName}&businessObjectCombineId=${businessObjectId}&originKey=exportTemplate`}
        title={intl.get('hmde.boComposition.exportTemplate.field').d('导出模板字段')}
      >
        {/* <Button
          color={ButtonColor.primary}
          onClick={() => {
            Modal.confirm({
              children: (
                <span>
                  {intl
                    .get('hmde.boComposition.view.message.releaseConfirm')
                    .d('请确认是否发布该组合业务对象？')}
                </span>
              ),
              okText: intl.get('hzero.common.button.sure').d('确定'),
              onOk: () => {
                publicObject();
              },
            });
          }}
          loading={loading}
        >
          <ImgIcon name="send_publish.svg" size={14} style={{ marginRight: 10 }} />
          {intl.get('hzero.common.button.release').d('发布')}
        </Button> */}
      </Header>
      <Content>
        <Table
          mode={TableMode.tree}
          // selectionMode={'treebox' as any}
          dataSet={fieldTableDS}
          columns={columns}
          autoHeight={{ type: TableAutoHeightType.maxHeight, diff: 10 }}
          buttons={buttons()}
          virtual
          useMouseBatchChoose
          defaultRowExpanded
        />
      </Content>
    </>
  );
};
export default formatterCollections({
  code: ['hmde.boComposition', 'hmde.common', 'hzero.common', 'hmde.bo'],
})(observer(Index));
