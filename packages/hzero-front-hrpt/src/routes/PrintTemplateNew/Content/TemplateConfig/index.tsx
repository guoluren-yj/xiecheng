/* eslint-disable react/jsx-key */
/* eslint-disable react/display-name */
import React, { memo, useRef, useMemo, useCallback, useEffect, useContext } from 'react';
import { DataSet, Form, TextField, IntlField, Button, Modal, Select } from 'choerodon-ui/pro';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import type { Record } from 'choerodon-ui/dataset';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { FieldIgnore, FieldType } from 'choerodon-ui/dataset/data-set/enum';
import { observer } from 'mobx-react';
import intl from 'hzero-front/lib/utils/intl';
import { getResponse } from 'hzero-front/lib/utils/utils';
import notification from 'hzero-front/lib/utils/notification';
import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';
import { ShowHelp } from 'choerodon-ui/pro/lib/field/enum';

import { copyPrintReport, updatePrintReport } from '@/services/printTemplateService';
import { Tag } from 'choerodon-ui';
import type { IStore } from '../../store';
import Store, { getTemplateTableDsConfig } from '../../store';
import styles from './index.less';
import Drawer from './Drawer';

const TemplateConfig = observer(() => {
  const { tenantNum, isTenant, currentDocument: { docId } = {}, canEdit, autoOpenModal, setAutoOpenModal, currentTemplate }: IStore = useContext<any>(Store).store;
  const createDrawerRef: any = useRef(); // 新建模板弹窗ref
  const createDraweContentrRef: any = useRef(); // 新建模板弹窗内容ref
  const editDrawerContentRef: any = useRef(); // 编辑模板弹窗内容ref

  const tableDs = useMemo(() => {
    return new DataSet(getTemplateTableDsConfig(docId));
  }, [docId]);

  useEffect(() => {
    tableDs.query();
    tableDs.queryDataSet = undefined;
  }, [docId]);

  useEffect(() => {
    if (autoOpenModal && currentTemplate) {
      setAutoOpenModal(false);
      handleEditTemplate(currentTemplate);
    }
  }, []);

  const enabledFlagChange = useCallback(async (record) => {
    if (!record) {
      return true;
    }
    let flag = record.get("enabledFlag");
    if (flag) flag = 0;
    else flag = 1;
    const formValidateFlag = await record.validate();
    if (!formValidateFlag) {
      return false;
    }
    const param = {
      ...record.toJSONData(),
      enabledFlag: flag,
      docId,
    };
    const res = await updatePrintReport(param);
    if (getResponse(res)) {
      notification.success({});
      tableDs.query();
      return res;
    } else {
      return false;
    }
  }, []);
  const handleDrawerOk = useCallback(async (type: 'create' | 'update') => {
    if (type === 'create' && createDraweContentrRef.current && createDraweContentrRef.current.handleSave) {
      const res = await createDraweContentrRef.current.handleSave();
      if (!res) {
        return false;
      }
      tableDs.query();
      const { reportId, reportUuid } = res;
      if (createDrawerRef.current && createDrawerRef.current.update) {
        createDrawerRef.current.update({
          children: (
            <Drawer isTenant={isTenant} docId={docId} drawerRef={editDrawerContentRef} reportId={reportId} reportUuid={reportUuid} canEdit={canEdit} />
          ),
        });
      }
      return false;
    } else if (editDrawerContentRef.current && editDrawerContentRef.current.handleSave) {
      const res = await editDrawerContentRef.current.handleSave();
      if (!res) {
        return false;
      }
      tableDs.query();
      return true;
    }
  }, [isTenant, docId, canEdit]);

  const handleEditTemplate = useCallback((record: Record) => {
    const { reportId, reportUuid } = record.get(['reportId', 'reportUuid']);
    const isPredefined = isPredefinedTemplate(record);
    createDrawerRef.current = Modal.open({
      title:
        isPredefined ?
          intl.get('hrpt.printTemplate.view.title.viewTemplate').d('查看打印模板')
          : intl.get('hrpt.printTemplate.view.title.editTemplate').d('编辑打印模板'),
      drawer: true,
      style: {
        width: '1090px',
      },
      children: (
        <Drawer
          isTenant={isTenant}
          docId={docId}
          drawerRef={editDrawerContentRef}
          reportId={reportId}
          reportUuid={reportUuid}
          isPredefined={isPredefined}
          tenantNum={tenantNum}
          canEdit={canEdit}
        />
      ),
      okText: intl.get('hzero.common.button.save').d('保存'),
      cancelText: isPredefined ? intl.get('hzero.common.button.close').d('关闭') : undefined,
      onOk: () => handleDrawerOk('update'),
      footer: (okBtn, cancelBtn) => {
        return isPredefined ? cancelBtn : [okBtn, cancelBtn];
      },
    });
  }, [isTenant, docId, canEdit]);

  const handleCopyTemplate = useCallback((record: Record) => {
    const editFormDs = new DataSet({
      fields: [
        {
          label: intl.get('hrpt.printTemplate.report.reportCode').d('模板编码'),
          name: 'reportCode',
          required: true,
          validator: (value) => {
            if (value && value.length > 35) {
              return intl.get('hrpt.printTemplate.view.message.reportCodeLength').d('模板编码长度不能超过35');
            }
            return true;
          }
        },
        {
          label: intl.get('hrpt.printTemplate.report.reportName').d('模板名称'),
          name: 'reportName',
          required: true,
          type: FieldType.intl,
        },
        {
          label: intl.get('hrpt.printTemplate.model.reportDefinition.reportRemake').d('模板描述'),
          name: 'remark',
          type: FieldType.intl,
        },
        {
          label: intl.get('hrpt.printTemplate.model.reportDefinition.copyFrom').d('复制自'),
          name: 'copyFromTemplate',
          readOnly: true,
          ignore: FieldIgnore.always,
        },
        {
          label: intl.get('hrpt.printTemplate.model.reportDefinition.labelCode').d('模板使用方'),
          name: 'labelCode',
          type: FieldType.string,
          lookupCode: 'AUTH_LABEL',
          required: true,
          help: intl.get('hrpt.printTemplate.model.reportDefinition.labelCode.help').d('请根据实际模板使用方维护，采购方：内部用户(如采购员等)使用；供应方：供应商用户切换到当前租户下可使用的模板；全部：不限制，供应商和采购方都可用的模板'),
        },
      ],
    });
    editFormDs.create({
      reportId: record.get('reportId'),
      copyFromTemplate: record.get('reportName'),
      labelCode: record.get('labelCode'),
    });
    Modal.open({
      title: intl.get('hrpt.printTemplate.view.title.copyTemplate').d('复制打印模板'),
      children: (
        <Form dataSet={editFormDs} labelLayout={LabelLayout.float}>
          <TextField name='copyFromTemplate' />
          <TextField name='reportCode' restrict="0-9A-Za-z-._" />
          <IntlField name='reportName' />
          <IntlField name='remark' />
          <Select name='labelCode' clearButton={false} showHelp={ShowHelp.tooltip} />
        </Form>
      ),
      onOk: async () => {
        const flag = await editFormDs.validate();
        if (!flag || !editFormDs.current) {
          return false;
        }
        const data = editFormDs.current.get(['reportId', 'reportCode', 'reportName', 'remark', 'labelCode']);
        const res = await copyPrintReport(data);
        if (getResponse(res)) {
          notification.success({});
          tableDs.query();
          return true;
        }
        return false;
      },
    });
  }, []);

  const isPredefinedTemplate = template => {
    return isTenant && template.get('reportSource') === 'PREDEFINED';
  };

  const handleCreate = useCallback(() => {
    createDrawerRef.current = Modal.open({
      title: intl.get('hrpt.printTemplate.view.title.createTemplate').d('新建打印模板'),
      drawer: true,
      style: {
        width: '1000px',
      },
      children: (
        <Drawer isTenant={isTenant} docId={docId} drawerRef={createDraweContentrRef} canEdit={canEdit} />
      ),
      okText: intl.get('hzero.common.button.save').d('保存'),
      onOk: () => handleDrawerOk('create'),
    });
  }, [isTenant, docId, canEdit]);

  const columns: ColumnProps[] = useMemo(
    () => [
      {
        name: 'enabledFlag',
        width: 100,
        renderer: ({ value }) => {
          const commonProps = { border: false };
          if (value) {
            return <Tag color='green' {...commonProps}>{intl.get("hzero.common.status.enabled").d("启用")}</Tag>;
          } else {
            return <Tag color='red' {...commonProps}>{intl.get("hzero.common.status.disabled").d("禁用")}</Tag>;
          }
        },
      },
      {
        name: 'reportCode',
        renderer: ({ record }) => {
          if (!record) {
            return;
          }
          return (
            <div className={styles['link-edit']} onClick={() => handleEditTemplate(record)}>{record.get('reportCode')}</div>
          );
        },
      },
      {
        name: 'reportName',
      },
      {
        name: 'remark',
      },
      {
        name: 'reportType',
        width: 240,
      },
      {
        name: 'labelCode',
        width: 150,
      },
      {
        name: 'datasetName',
      },
      isTenant && {
        key: 'source',
        width: 150,
        header: intl.get('hzero.common.source').d('来源'),
        renderer: ({ record }) => {
          if (!record) {
            return;
          }
          return isPredefinedTemplate(record) ? (
            <Tag color="orange">{intl.get('hzero.common.predefined').d('预定义')}</Tag>
            ) : (
              <Tag color="green">{intl.get('hzero.common.custom').d('自定义')}</Tag>
            );
        },
      },
      {
        name: 'operation',
        width: 120,
        lock: 'right',
        header: intl.get('hrpt.printTemplate.view.title.operation').d('操作'),
        renderer: ({ record }) => {
          if (!record) {
            return;
          }
          return (
            <>
              {canEdit && (
                <Button funcType={FuncType.link} onClick={() => handleCopyTemplate(record)}>
                  {intl.get('hzero.common.button.copy').d('复制')}
                </Button>
              )}
              {(!isTenant || !isPredefinedTemplate(record)) && (
                <Button funcType={FuncType.link} onClick={() => enabledFlagChange(record)}>
                  {
                    record.get("enabledFlag")
                    ? intl.get("hzero.common.status.disabled").d("禁用")
                    : intl.get("hzero.common.status.enabled").d("启用")
                  }
                </Button>
              )}
            </>
          );
        },
      },
    ].filter(Boolean) as ColumnProps[],
    [handleEditTemplate, handleCopyTemplate]
  );
  const filterBarConfig = useMemo(() => ({
    fields: [
      {
        name: 'reportName',
        label: intl.get('hrpt.printTemplate.model.reportDefinition.templateName').d('模板名称'),
        lock: true,
      },
      {
        name: 'reportCode',
        label: intl.get('hrpt.printTemplate.report.reportCode').d('模板编码'),
        lock: true,
      },
      {
        name: 'enabledFlag',
        label: intl.get('hrpt.printTemplate.model.reportDefinition.status').d('状态'),
        lookupCode: 'HPFM.ENABLED_FLAG',
        lock: true,
      },
      isTenant && {
        name: 'reportSourceFlag',
        label: intl.get('hzero.common.source').d('来源'),
        optionsData: [
          { value: 'PREDEFINED', meaning: intl.get('hzero.common.predefined').d('预定义') },
          { value: 'CUSTOM', meaning: intl.get('hzero.common.custom').d('自定义') },
        ],
        lock: true,
      },
    ].filter(Boolean) as any,
    collpaseble: true,
    defaultCollpase: true,
  }), []);

  return (
    <div style={{ height: "100%" }}>
      <FilterBarTable
        buttons={[
          <Button color={ButtonColor.primary} onClick={handleCreate} icon="playlist_add" hidden={!canEdit}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button> 
        ]}
        dataSet={tableDs}
        columns={columns}
        cacheState
        customizedCode='HRPT_PRINT_TEMPLATE_TPL_TABLE'
        filterBarConfig={filterBarConfig}
        style={{ maxHeight: "100%" }}
      />
    </div>
  );
});

export default memo(TemplateConfig);