import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { Card, Tabs } from 'choerodon-ui';
import { DataSet, IntlField, TextField, Select, Lov, Button, Form } from 'choerodon-ui/pro';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';
// import { TableButtonType, TableCommandType } from 'choerodon-ui/pro/lib/table/enum';
import { observer } from 'mobx-react';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { RecordStatus } from 'choerodon-ui/dataset/data-set/enum';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';

import intl from 'utils/intl';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';

import { reflexHeaderAddDS, reflexRelationDS, lovReflexDS, lovParamsDS } from '../stores/indexDS';
import ReflexRelationLine from './ReflexLine';

const { TabPane } = Tabs;

const isPlat = !isTenantRoleLevel();

const OperationBtn = observer(({ record }) =>
{
  return record?.status === RecordStatus.sync ? (
    <Button
      funcType={FuncType.link}
      color={ButtonColor.primary}
      onClick={() =>
      {
        if (record)
        {
          record.status = RecordStatus.update;
        }
      }}
    >
      {intl.get(`hzero.common.button.editable`).d('编辑')}
    </Button>
  ) : record?.status === RecordStatus.update ? (
    <Button
      funcType={FuncType.link}
      color={ButtonColor.primary}
      onClick={() =>
      {
        if (record)
        {
          record.status = RecordStatus.sync;
        }
      }}
    >
      {intl.get(`hzero.common.button.cancel`).d('取消')}
    </Button>
  ) : null;

});

const AddDimensionReflexModal = (props) =>
{

  const [isLov, setIsLov] = useState(false);
  const { type, dimensionDefinitionId, modal, onOk } = props;

  const initLov = useCallback(
    (value, dataSet) =>
    {
      if (value === 'LOV')
      {
        // 获取字段的值集
        dataSet.getField('lovCodeLov').set('lovCode', 'HPFM.LOV.VIEW.ORG');
        dataSet.getField('lovCodeLov').set('lovQueryAxiosConfig', {
          url: `/hpfm/v1/${isPlat ? '' : `${getCurrentOrganizationId()}/`}lov-view-headers`,
          method: 'GET',
        },
        );
      } else
      {
        // 清除属性
        dataSet.getField('lovCodeLov').reset();
        // 清除lov字段内容
        dataSet.current.set('lovCodeLov', null);
      }

    },
    [],
  );

  const reflexRelationDs = useMemo(() => new DataSet({
    ...reflexRelationDS(),
    events: {
      update: ({ record, name }) =>
      {
        if (name === 'sourceDocumentCodeLov')
        {
          const sourceDocumentCodeLov = record.get('sourceDocumentCodeLov');
          // 字段选择 发生变化，改变别名
          record.set('sourceFieldName', `${sourceDocumentCodeLov?.documentCode}-${sourceDocumentCodeLov?.displayFieldName}`);
        }
      },
    },
  }), []);
  const lovReflexDs = useMemo(() => new DataSet(lovReflexDS()), []);
  const lovParamsDs = useMemo(() => new DataSet(lovParamsDS()), []);

  const reflexHeaderAddDs = useMemo(() => new DataSet({
    ...reflexHeaderAddDS(),
    children: {
      baseDimensionMappingList: reflexRelationDs,
      baseDimensionLovMappingList: lovReflexDs,
      baseDimensionLovParamList: lovParamsDs,
    },
    events: {
      update: ({ value, name, dataSet }) =>
      {
        if (name === 'componentType')
        {
          setIsLov(value === 'LOV');
          initLov(value, dataSet);
        }
      },
    },
  }), [reflexRelationDs, setIsLov, initLov, lovReflexDs, lovParamsDs]);




  useEffect(() =>
  {
    // 这个只能走一遍，不能添加依赖项
    if (dimensionDefinitionId)
    {
      // 编辑
      reflexHeaderAddDs
        .setState('dimensionDefinitionId', dimensionDefinitionId)
        .query().then(res =>
        {
          // const { content } = res || {}
          setIsLov(res?.componentType === 'LOV');
          if (res?.componentType === 'LOV')
          {
            // 获取字段的值集
            // eslint-disable-next-line no-unused-expressions, comma-spacing
            reflexHeaderAddDs?.getField('lovCodeLov')?.set('lovCode', 'HPFM.LOV.VIEW.ORG',);
            // eslint-disable-next-line no-unused-expressions
            reflexHeaderAddDs?.getField('lovCodeLov')?.set('lovQueryAxiosConfig', {
              url: `/hpfm/v1/${isPlat ? '' : `${getCurrentOrganizationId()}/`}lov-view-headers`,
              method: 'GET',
            },
            );
          } else
          {
            // 清除属性
            // eslint-disable-next-line no-unused-expressions
            reflexHeaderAddDs?.getField('lovCodeLov')?.reset();
            // 清除lov字段内容
            // eslint-disable-next-line no-unused-expressions
            reflexHeaderAddDs?.current?.set('lovCodeLov', null);
          }

        });
      // 查询行信息
      reflexRelationDs.query();
      lovReflexDs.query();
      lovParamsDs.query();

    } else
    {
      // 新建
      reflexHeaderAddDs.create({});
    }
  }, [dimensionDefinitionId, reflexHeaderAddDs, reflexRelationDs, lovReflexDs, lovParamsDs]);

  const handleOk = useCallback(
    async () =>
    {
      const validateFlag = await reflexHeaderAddDs.validate();
      if (!validateFlag) return false;
      const res = await reflexHeaderAddDs.submit();
      if (res)
      {
        // 重新刷新维度映射列表
        if (onOk) onOk();
      }
    },
    [reflexHeaderAddDs, onOk]
  );

  useEffect(() =>
  {
    modal.handleOk(handleOk);
  }, [modal, handleOk]);

  const isEditRecord = useCallback(
    (record) =>
    {
      return ['add', 'update'].includes(record.status);

    },
    [],
  );

  const relationColumns: ColumnProps[] = useMemo(() =>
  {
    return [
      {
        name: 'sourceDocumentCodeLov',
        width: 150,
        editor: isEditRecord,
      },
      {
        name: 'combineBusinessObjectName',
        width: 150,
      },
      {
        name: 'sourceFieldCode',
        width: 150,
        editor: isEditRecord,
      },
      {
        name: 'sourceFieldName',
        editor: isEditRecord,
      },
      type === 'update' && {
        name: 'action',
        renderer: ({ record }) => record.status !== 'add' ? <OperationBtn record={record} /> : null,
      } as any,
    ].filter(item => item);
  }, [type, isEditRecord]);

  const lovReflexColumns: ColumnProps[] = useMemo(() =>
  {
    return [
      {
        name: 'targetDimensionCodeLov',
        width: 150,
        editor: isEditRecord,
      },
      {
        name: 'fieldType',
        width: 150,
        editor: isEditRecord,
      },
      {
        name: 'fieldName',
        editor: isEditRecord,
        width: 150,
      },
      {
        name: 'fieldCode',
        editor: isEditRecord,
        width: 250,
      },
      {
        name: 'displayFieldCode',
        editor: isEditRecord,
        width: 250,
      },
      type === 'update' && {
        name: 'action',
        renderer: ({ record }) => record.status !== 'add' ? <OperationBtn record={record} /> : null,
      } as any,
    ].filter(item => item);
  }, [type, isEditRecord]);

  const lovParamsColumns: ColumnProps[] = useMemo(() =>
  {
    return [
      {
        name: 'paramName',
        width: 150,
        editor: isEditRecord,
      },
      {
        name: 'paramType',
        width: 150,
        editor: isEditRecord,
      },
      {
        name: 'paramCode',
        width: 150,
        editor: isEditRecord,
      },
      {
        name: 'applyQueryFlag',
        width: 150,
        editor: isEditRecord,
      },
      type === 'update' && {
        name: 'action',
        renderer: ({ record }) => record.status !== 'add' ? <OperationBtn record={record} /> : null,
      } as any,
    ].filter(item => item);
  }, [type, isEditRecord]);

  const paneList = useMemo(() => [

    {
      key: 'relation',
      tab: intl.get('spfp.basicConfiguration.title.relation').d('映射关系'),
      content: <ReflexRelationLine dataSet={reflexRelationDs} columns={relationColumns} />,
    },
    isLov && {
      key: 'lovReflex',
      tab: intl.get('spfp.basicConfiguration.title.lovReflex').d('值集映射'),
      content: <ReflexRelationLine dataSet={lovReflexDs} columns={lovReflexColumns} />,
    } as any,
    isLov && {
      key: 'lovParams',
      tab: intl.get('spfp.basicConfiguration.title.lovParams').d('值集参数'),
      content: <ReflexRelationLine dataSet={lovParamsDs} columns={lovParamsColumns} />,
    } as any,
  ].filter(item => item),
    [
      reflexRelationDs,
      relationColumns,
      isLov,
      lovReflexColumns,
      lovReflexDs,
      lovParamsDs,
      lovParamsColumns]);


  return (
    <div>
      <Card
        bordered={false}
        className={DETAIL_CARD_CLASSNAME}
        title={intl.get('spfp.basicConfiguration.title.dimensionConfig').d('维度配置')}>
        <Form columns={2} dataSet={reflexHeaderAddDs} labelLayout={LabelLayout.float}>
          <TextField name='dimensionCode' disabled={type === 'update'} />
          <IntlField name='dimensionName' />
          <Select name='codeType' />
          <Select name='componentType' />
          {
            isLov && <Lov name='lovCodeLov' />
          }
        </Form>

      </Card>
      <Card
        bordered={false}
        className={DETAIL_CARD_CLASSNAME}
        title={intl.get('spfp.basicConfiguration.title.reflexConfig').d('映射配置')}>
        <Tabs>
          {
            paneList.map(pane =>
            {
              const { content, ...otherProps } = pane;
              return <TabPane {...otherProps}>{content}</TabPane>;
            })
          }
        </Tabs>

      </Card>
    </div>
  );
};

export default observer(AddDimensionReflexModal);