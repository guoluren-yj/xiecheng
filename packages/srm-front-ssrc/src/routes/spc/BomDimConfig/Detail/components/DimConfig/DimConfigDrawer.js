import React, { useCallback } from 'react';
import { Form, Button, Modal, Output } from 'choerodon-ui/pro';
import { Badge } from 'choerodon-ui';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';
import { BusinessObject } from '@/routes/spc/BomDimConfig/enum';
import { StatusRender } from '@/routes/spc/FormulaManage/utils';
import { BomDimensionWidgetCode } from '@/routes/spc/BomViewWorkbench/enum';
import { Condition, Related, ComponentList } from '../../modal';
import ConstructForm from '../BasicInfo/ConstructForm';
import styles from './index.less';

const { ItemGroup } = Form;

const FxBadge = ({ dataSet, name, isEdit, bomTemplateId }) => {
  if (!dataSet?.current) return;
  const { hasFx = false, bomDimensionConfigId, bomDimensionCode } =
    dataSet.current.get(['hasFx', 'bomDimensionConfigId', 'bomDimensionCode']) || {};
  const title = isEdit
    ? intl.get(`spc.bomDimConfig.view.title.edit${name}Fx`).d(`编辑条件-必输`)
    : intl.get(`spc.bomDimConfig.view.title.view${name}Fx`).d(`查看条件-必输`);

  const modalProps = {
    isEdit,
    name,
    bomTemplateId,
    bomDimensionCode,
    bomDimensionConfigId,
  };
  const visibleFx = () =>
    Modal.open({
      title,
      destroyOnClose: true,
      style: { width: '742px' },
      drawer: true,
      closable: true,
      children: <Condition {...modalProps} />,
    });
  return (
    <Badge dot={hasFx}>
      <Button
        funcType={FuncType.link}
        color={ButtonColor.primary}
        className={styles.fx}
        onClick={visibleFx}
      >
        fx
      </Button>
    </Badge>
  );
};

const RelatedField = observer(({ dataSet, isEdit, bomTemplateId }) => {
  if (!dataSet?.current) return;
  const { bomDimensionConfigId, bomDimensionWidgetCode, businessObject, bomDimensionCode } =
    dataSet.current.get([
      'bomDimensionConfigId',
      'bomDimensionWidgetCode',
      'businessObject',
      'bomDimensionCode',
    ]) || {};

  const handleOpenRelated = () => {
    const title = isEdit
      ? intl.get('spc.bomDimConfig.view.title.editRelated').d(`编辑映射`)
      : intl.get(`spc.bomDimConfig.view.title.viewRelated`).d(`查看映射`);
    const modalProps = {
      isEdit,
      bomTemplateId,
      bomDimensionConfigId,
      bomDimensionWidgetCode,
      businessObject,
      bomDimensionCode,
    };
    Modal.open({
      title,
      destroyOnClose: true,
      style: { width: '742px' },
      drawer: true,
      closable: true,
      children: <Related {...modalProps} />,
    });
  };
  return (
    <Output
      name="relatedField"
      style={{ fontWeight: 400 }}
      renderer={() => (
        <a disabled={!bomDimensionWidgetCode} onClick={handleOpenRelated}>
          {isEdit
            ? intl.get('hzero.common.button.edit').d('编辑')
            : intl.get(`hzero.common.button.view`).d('查看')}
        </a>
      )}
    />
  );
});

const Index = observer((props) => {
  const { isEdit, dataSet, bomTemplateId } = props;
  const {
    businessObject,
    bomDimensionWidget,
    bomDimensionConfigId,
    bomDimensionCode,
    groupListFlag,
  } =
    dataSet.current?.get([
      'businessObject',
      'bomDimensionWidget',
      'bomDimensionConfigId',
      'bomDimensionCode',
      'groupListFlag',
    ]) || {};
  const isLine = businessObject === BusinessObject.LINE;

  const handleOpenComponentList = useCallback(() => {
    const title = isEdit
      ? intl.get('spc.bomDimConfig.view.title.editComponentList').d(`编辑组件清单映射`)
      : intl.get(`spc.bomDimConfig.view.title.viewComponentList`).d(`查看组件清单映射`);
    const modalProps = {
      isEdit,
      bomDimensionConfigId,
      bomTemplateId,
    };
    Modal.open({
      title,
      destroyOnClose: true,
      style: { width: '742px' },
      drawer: true,
      closable: true,
      children: <ComponentList {...modalProps} />,
    });
  });

  return (
    <Form
      dataSet={dataSet}
      columns={2}
      labelLayout={isEdit ? 'float' : 'vertical'}
      className={isEdit ? styles['float-output'] : 'c7n-pro-vertical-form-display'}
    >
      <ConstructForm
        formType="Lov"
        isEdit={isEdit}
        name="businessObjectLov"
        tableProps={{
          mode: 'tree',
        }}
      />
      <ConstructForm formType="Lov" isEdit={isEdit} name="bomDimensionCode" />
      <ConstructForm formType="IntlField" isEdit={isEdit} name="bomDimensionName" />
      <ConstructForm
        formType="Select"
        isEdit={isEdit}
        disabled
        name="bomDimensionType"
        {...(isEdit
          ? {}
          : {
            renderer: ({ value, record }) =>
              StatusRender(value, record.get('bomDimensionTypeMeaning')),
          })}
      />
      <ItemGroup label={intl.get(`spc.bomDimConfig.model.bomDimensionRequired`).d('是否必输')}>
        <ConstructForm formType="CheckBox" isEdit={isEdit} name="bomDimensionRequired" />
        {isLine && bomDimensionConfigId && <FxBadge name="required" {...props} />}
      </ItemGroup>
      <ConstructForm formType="CheckBox" isEdit={isEdit} name="bomDimensionEditable" />
      <ConstructForm formType="CheckBox" isEdit={isEdit} name="bomDimensionVisible" />
      <ConstructForm formType="CheckBox" isEdit={isEdit} name="isFormula" />
      <ConstructForm formType="TextField" isEdit={isEdit} name="bomDimensionSeq" />
      {isLine && <ConstructForm formType="TextField" isEdit={isEdit} name="bomDimensionWidth" />}
      <ConstructForm
        formType="Select"
        isEdit={isEdit}
        name="bomDimensionWidget"
        clearButton={false}
        optionsFilter={(record) => !['LONG_INPUT', 'UPLOAD'].includes(record.get('value'))}
      />
      <ConstructForm formType="Lov" isEdit={isEdit} name="bomDimensionWidgetCodeLov" />
      {bomDimensionConfigId && bomDimensionWidget === BomDimensionWidgetCode.LOV && (
        <RelatedField {...props} />
      )}
      {bomDimensionCode?.businessObjectFieldCode === 'bomViewItemId' && (
        <ItemGroup label={intl.get(`spc.bomDimConfig.model.groupList`).d('组件清单')}>
          <ConstructForm formType="CheckBox" isEdit={isEdit} name="groupListFlag" />
          <a disabled={!groupListFlag} onClick={handleOpenComponentList}>
            {isEdit
              ? intl.get('hzero.common.button.edit').d('编辑')
              : intl.get(`hzero.common.button.view`).d('查看')}
          </a>
        </ItemGroup>
      )}
    </Form>
  );
});

export default Index;
