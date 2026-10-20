/* eslint-disable react/jsx-key */
/* eslint-disable react/jsx-filename-extension */
import type { FC } from 'react';
import React, { memo, useRef, Fragment, useCallback, useMemo, useEffect, useImperativeHandle, useState } from 'react';
import {
  DataSet,
  Table,
  Button,
  Form,
  TextField,
  IntlField,
  Lov,
  Select,
  Modal,
  NumberField,
} from 'choerodon-ui/pro';
import { Card, Tag, Alert, Popover, Icon } from 'choerodon-ui';
import { isNil, omit } from 'lodash';
import { observer } from 'mobx-react';
import intl from 'hzero-front/lib/utils/intl';
import { getResponse, getCurrentUser, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import { fetchSupportLanguageList } from 'hzero-front/lib/services/api';
import notification from 'hzero-front/lib/utils/notification';

import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { DataSetStatus, FieldIgnore, RecordStatus, FieldType } from 'choerodon-ui/dataset/data-set/enum';
import { ShowHelp } from 'choerodon-ui/pro/lib/field/enum';

// import { getEnvConfig } from 'hzero-front/lib/utils/iocUtils';
import {
  createPrintReport,
  updatePrintReport,
  createPrintReportTemplate,
  updatePrintReportTemplate,
  savePrintReportTemplate,
  saveWordUploadTemplate,
} from '../../../../services/printTemplateService';
import ReportDesign from './ReportDesign';
import DesignWord from './DesignWord';
import styles from './index.less';
import { getFormDs, getTableDs } from './store';
import TemplateConfig from './TemplateUpload';
import UploadHistory from './TemplateUpload/UploadHistory';

interface IDrawer {
  drawerRef: any;
  docId: number | string;
  isTenant: boolean;
  reportId?: number | string;
  reportUuid?: number | string;
  isPredefined?: boolean;
  tenantNum?: string;
  canEdit: boolean;
}

const Drawer: FC<IDrawer> = observer(({
  drawerRef,
  docId,
  isTenant,
  reportId: originReportId,
  reportUuid: r1,
  isPredefined = false,
  tenantNum,
  canEdit,
}) => {
  const { loginName } = getCurrentUser() || {};
  const isAdmin = loginName === 'admin'; 
  const reportDesignModal: any = useRef();
  const containerRef: any = useRef();
  const [reportId, setReportId] = useState(originReportId);
  const isCreate = useMemo(() => isNil(reportId), [reportId]);
  const formDs = useMemo(() => new DataSet(getFormDs({ reportId, disabled: isPredefined })), [reportId]);
  const tableDs = useMemo(() => new DataSet(getTableDs()), [reportId]);

  useImperativeHandle(drawerRef, () => ({ handleSave }));

  useEffect(() => {
    setReportId(originReportId);
  }, [originReportId]);

  useEffect(() => {
    if (!isCreate) {
      tableDs.setQueryParameter("reportUuid", r1);
      formDs.query();
      tableDs.query();
    }
  }, [reportId, r1]);

  const handleSave = useCallback(async () => {
    if (!isCreate && formDs.updated.length === 0) {
      return true;
    }
    const formValidateFlag = await formDs.validate();
    if (!formValidateFlag || !formDs.current) {
      return false;
    }
    const param = {
      ...formDs.current.toJSONData(),
      docId,
      remark:  formDs.current.get('remark') || '',
    };
    const res = isCreate ? await createPrintReport(param) : await updatePrintReport(param);
    if (getResponse(res)) {
      notification.success({});
      return res;
    } else {
      return false;
    }
  }, [isCreate, formDs]);

  const handleCloseModal = useCallback(() => {
    if (reportDesignModal.current && reportDesignModal.current.close) {
      reportDesignModal.current.close();
    }
  }, []);

  const handleRefresh = useCallback(() => {
    tableDs.loadData([]);
    tableDs.status = DataSetStatus.loading;
    formDs.query().then(r => {
      tableDs.setQueryParameter('reportUuid', r.reportUuid);
      tableDs.query();
    }).catch(() => {
      tableDs.status = DataSetStatus.ready;
    });
  }, [formDs]);

  const refreshReport = useCallback((data) => {
    const { reportId: newReportId } = data || {};
    formDs.setQueryParameter('reportId', newReportId);
  }, [formDs]);

  const handleCopy = useCallback(
    async (record) => {
      let systemLangList: any[] = [];
      const allLangMap = {};
      await fetchSupportLanguageList().then(res => {
        if (getResponse(res)) {
          systemLangList = (res || []).map(i => {
            allLangMap[i.code] = i.meaning;
            return {
              value: i.code,
              meaning: i.meaning,
            };
          }).filter((option) => {
            if (option && tableDs.length > 0) {
              return tableDs.every((r) => r.get('templateLang') !== option.value);
            }
            return true;
          });
        }
      });
      const editFormDs = new DataSet({
        fields: [
          {
            label: intl.get('hrpt.printTemplate.model.reportDefinition.copyFrom').d('复制自'),
            name: 'copyFrom',
            readOnly: true,
            ignore: FieldIgnore.always,
          },
          {
            label: intl.get('hrpt.printTemplate.model.reportDefinition.templateName').d('模板名称'),
            name: 'templateName',
            required: true,
          },
          {
            label: intl.get('hrpt.printTemplate.model.reportDefinition.templateRemark').d('模板描述'),
            name: 'remark',
          },
          {
            label: intl.get('hrpt.printTemplate.model.reportDefinition.templateLang').d('语言'),
            name: 'templateLang',
            lookupCode: 'HPFM.LANGUAGE',
            // lookupUrl: `${getEnvConfig<any>().HZERO_PLATFORM}/v1/${isTenantRoleLevel() ? `${getCurrentOrganizationId()}/languages` : 'languages'}`,
          },
          {
            name: "_templateLang",
            label: intl.get('hrpt.printTemplate.model.reportDefinition.templateLang').d('语言'),
            required: true,
          },
        ],
        data: [
          {
            copyFrom: record.get('templateName'),
            remark: record.get("remark"),
            _tls: record.get("_tls"),
          },
        ],
      });
      (editFormDs.getField("templateLang")!.getOptions() || []).forEach(r => {
        allLangMap[r.get("value")] = r.get("meaning");
      });
      Modal.open({
        title: intl.get('hrpt.printTemplate.view.title.copyTemplate').d('复制模板'),
        children: (
          <Form dataSet={editFormDs} labelLayout={LabelLayout.float}>
            <TextField name='copyFrom' />
            <Select
              name="_templateLang"
              renderer={({ record: r, value: v }) => {
                let _v = v || r && r.get("templateLang");
                return allLangMap[_v];
              }}
            >
              {systemLangList.map(l => (
                <Select.Option value={l.value}>{l.meaning}</Select.Option>
              ))}
            </Select>
            <TextField name='templateName' />
            <IntlField name='remark' />
          </Form>
        ),
        onOk: async () => {
          const flag = await editFormDs.validate();
          if (!flag || !editFormDs.current || !formDs.current) {
            return false;
          }
          const r2 = formDs.current.get('reportUuid');
          const data = editFormDs.current.get(['_templateLang', 'templateName', 'remark']);
          data.templateLang = data._templateLang;
          const res = await createPrintReportTemplate({
            ...omit(record.toData(), ['templateUuid', 'objectVersionNumber', '_token']),
            ...data,
            reportUuid: r2,
          });
          if (res.reportUuid && res.reportUuid !== r2) {
            formDs.current.set("reportUuid", res.reportUuid);
            tableDs.setQueryParameter("reportUuid", res.reportUuid);
          }
          if (getResponse(res)) {
            notification.success({});
            tableDs.query();
            return true;
          }
          return false;
        },
      });
    }, [tableDs, formDs]);

  const handleEnable = useCallback(
    async (record) => {
      if (!formDs.current) {
        return;
      }
      const { reportUuid, reportCode, datasetCode, tenantId } = formDs.current.get([
        'reportUuid',
        'reportCode',
        'datasetCode',
        'tenantId',
      ]);
      const data = {
        ...record.toJSONData(),
        enabledFlag: record.get('enabledFlag') === 1 ? 0 : 1,
        reportUuid,
        reportCode,
        datasetCode,
        tenantId,
      };
      const res = await updatePrintReportTemplate(data);
      if (res && res.reportUuid && res.reportUuid !== reportUuid && formDs.current) {
        formDs.current.set("reportUuid", res.reportUuid);
        tableDs.setQueryParameter("reportUuid", res.reportUuid);
      }
      if (getResponse(res)) {
        notification.success({});
        tableDs.query();
      }
    },
    [formDs, tableDs]
  );

  const handleSaveTemplate = useCallback(async (data) => {
    const formData = formDs.current?.toJSONData();
    const { reportUuid, reportCode, datasetCode, tenantId } = formData;
    const submitData = [{
      ...data,
      reportUuid,
      reportCode,
      datasetCode,
      tenantId,
    }];
    const res = await savePrintReportTemplate(submitData);
    if (res && res.length && res[0].reportUuid && res[0].reportUuid !== reportUuid && formDs.current) {
      formDs.current.set("reportUuid", res[0].reportUuid);
      tableDs.setQueryParameter("reportUuid", res[0].reportUuid);
    }
    if (getResponse(res)) {
      notification.success({});
      tableDs.query();
    }
  }, [formDs, tableDs]);



  const openTplEdit = useCallback(async (createFlag, record) => {
    let data: any = {};
    const ds = new DataSet({
      fields: ([
        {
          name: "_templateLang",
          label: intl.get('hrpt.printTemplate.model.reportDefinition.templateLang').d('语言'),
          required: true,
        },
        {
          label: intl.get('hrpt.printTemplate.model.reportDefinition.templateLang').d('语言'),
          name: 'templateLang',
          lookupCode: 'HPFM.LANGUAGE',
        },
      ] as any[]).concat((getTableDs().fields || []).filter(i => i.name !== 'templateLang')),
    });
    if (!createFlag && record) {
      data = record.toJSONData();
      data._templateLang = data.templateLang;
    }
    ds.loadData([data]);
    ds.forEach(r => r.status = RecordStatus.update);
    let systemLangList: any[] = [];
    const allLangMap = {};
    await fetchSupportLanguageList().then(res => {
      if (getResponse(res)) {
        systemLangList = (res || []).map(i => {
          allLangMap[i.code] = i.meaning;
          return {
            value: i.code,
            meaning: i.meaning,
          };
        }).filter((option) => {
          if (option && tableDs.length > 0) {
            return (
              record && option.value === record.get('templateLang') ||
              tableDs.every((r) => r.get('templateLang') !== option.value)
            );
          }
          return true;
        });
      }
    });
    (ds.getField("templateLang")!.getOptions() || []).forEach(r => {
      allLangMap[r.get("value")] = r.get("meaning");
    });
    Modal.open({
      drawer: true,
      title:
        isPredefined ?
          intl.get("hrpt.printTemplate.view.title.vieweTpl").d("查看模版")
          : createFlag
              ? intl.get("hrpt.printTemplate.view.title.createTpl").d("新增模版")
              : intl.get("hrpt.printTemplate.view.title.editTpl").d("编辑模版"),
      style: {
        width: '380px',
      },
      children: (
        <Form dataSet={ds} labelLayout={LabelLayout.float}>
          <Select
            disabled={!createFlag}
            name="_templateLang"
            renderer={({ record: r, value: v }) => {
              let _v = v || r && r.get("templateLang");
              return allLangMap[_v];
            }}
          >
            {systemLangList.map(l => (
              <Select.Option value={l.value}>{l.meaning}</Select.Option>
            ))}
          </Select>
          <TextField name="templateName" disabled={isPredefined} />
          <IntlField name="remark" disabled={isPredefined} />
        </Form>
      ),
      okText: intl.get('hzero.common.button.save').d('保存'),
      cancelText: isPredefined ? intl.get('hzero.common.button.close').d('关闭') : undefined,
      footer: (okBtn, cancelBtn) => {
        return isPredefined ? cancelBtn : [okBtn, cancelBtn];
      },
      onOk: async() => {
        const flag = await ds.validate();
        if (!flag) {
          return false;
        }
        const data = ds.current!.toJSONData();
        data.templateLang = data._templateLang;
        data.remark = data.remark || '';
        return handleSaveTemplate(data);
      },
    });
  }, [handleSaveTemplate, tableDs, isPredefined]);
  const handleCancleEditTemplate = useCallback((dataSet, record) => {
    if (record.status === 'add') {
      dataSet.remove(record);
    } else {
      record.reset();
      record.setState('isEditing', false);
    }
  }, []);

  const handleDesignTemplate = useCallback(
    (templateId) => {
      const { datasetId, reportType, labelCode } =
      formDs.current ? formDs.current.get(['datasetId', 'reportType', 'labelCode']) : { datasetId: undefined, reportType: undefined, labelCode: undefined };
      const Comp = reportType === 'WORD' ? DesignWord : ReportDesign;
      const modal = Modal.open({
        fullScreen: true,
        className: styles['report-desgin-model'],
        children: (
          <Comp
            onClose={handleCloseModal}
            reportId={reportId}
            datasetId={datasetId}
            reportType={reportType}
            templateId={templateId}
            onRefresh={handleRefresh}
            refreshReport={refreshReport}
            isPredefined={isPredefined}
            labelCode={labelCode}
          />
        ),
        footer: null,
      });
      reportDesignModal.current = modal;
    },
    [reportId, handleCloseModal, handleRefresh, refreshReport, formDs, isPredefined]
  );

  const saveWordTemplate = useCallback(async({ formRecord, templateId, modal }) => {
    const flag = await formRecord.validate();
    if (!flag) {
      return false;
    }
    const attachmentUuid = formRecord.get('templateUrl');
    const attachments = formRecord.getField('templateUrl').getAttachments();
    const file = attachments && attachments[0] ? attachments[0] : undefined;
    if (file) {
      const res = await saveWordUploadTemplate({
        params: {
          fileName: file.fileName,
          fileUrl: file.fileUrl,
          attachmentUUID: attachmentUuid,
          templateId,
        }
      });
      if (getResponse(res)) {
        notification.success({});
        tableDs.setQueryParameter("reportUuid", formDs.current?.get('reportUuid'));
        tableDs.query();
        if (modal && modal.close) {
          modal.close();
        }
      }
    }
  }, [formDs.current, tableDs]);

  const showTemplateUploadHistory = useCallback(() => {
    Modal.open({
      title: intl.get('hrpt.printTemplate.view.button.uploadTemplateHistory').d('模板上传历史'),
      drawer: true,
      style: { width: '1090px' },
      children: <UploadHistory />,
    });
  }, []);

  const handleUploadTemplate = useCallback((record) => {
    const templateId = record.get('templateId');
    const uploadFormDs = new DataSet({
      fields: [
        {
          name: 'templateUrl',
          label: intl.get('hrpt.printTemplate.view.button.uploadTemplateFile').d('模板文件上传'),
          type: FieldType.attachment,
          required: true,
          multiple: false,
          defaultValidationMessages: {
            valueMissing: intl.get('hrpt.printTemplate.view.message.uploadTemplate').d('请上传模板文件'),
          }
        },
      ],
    });
    const uploadFormRecord = uploadFormDs.create();
    Modal.open({
      title: intl.get('hrpt.printTemplate.view.button.uploadTemplate').d('模板上传'),
      drawer: true,
      style: { width: '480px' },
      children: <TemplateConfig record={uploadFormRecord} />,
      footer: (okBtn, cancelBtn, modal) => [
        <Button funcType={FuncType.raised} color={ButtonColor.primary} onClick={() => saveWordTemplate({ formRecord: uploadFormRecord, templateId, modal })}>
          {intl.get('hzero.common.button.save').d('保存')}
        </Button>,
        <Button funcType={FuncType.raised} onClick={() => { modal.close(); }}>
          {intl.get('hzero.common.button.cancel').d('取消')}
        </Button>
      ]
    })
  }, [saveWordTemplate, showTemplateUploadHistory]);

  const columns: any[] = useMemo(
    () => [
      {
        name: 'enabledFlag',
        width: 110,
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
        name: 'templateName',
        width: 240,
        // eslint-disable-next-line react/display-name
        renderer: ({ text, record }) => {
          return (
            <div className={styles['link-edit']} onClick={() => openTplEdit(false, record)}>{text}</div>
          );
        },
      },
      {
        name: 'templateLang',
        width: 130,
        editor: (record, name) => {
          if ((record && record.status === 'add') || record.getState('isEditing')) {
            return (
              <Select
                record={record}
                name={name}
                optionsFilter={(option) => {
                  if (option && tableDs.records.length > 0) {
                    return (
                      option.get('value') === record.get('templateLang') ||
                      tableDs.every((r) => r.get('templateLang') !== option.get('value'))
                    );
                  }
                  return true;
                }}
              />
            );
          } else return false;
        },
      },
      {
        name: 'remark',
        width: 150,
      },
      {
        header: intl.get('hzero.common.button.action').d('操作'),
        key: 'action',
        lock: 'right',
        width: 250,
        renderer: ({ dataSet, record }) => {
          if (!record) {
            return;
          }
          const isEditing = record.getState('isEditing');
          if (isEditing || record.status === 'add') {
            return (
              <Button funcType={FuncType.link} onClick={() => handleCancleEditTemplate(dataSet, record)}>
                {intl.get('hzero.common.button.cancel').d('取消')}
              </Button>
            );
          } else {
            return [
              record.get('canUploadFlag') && !isPredefined && formDs.current?.get("reportType") === 'WORD' ? (
                <Popover
                  placement='bottomLeft'
                  overlayClassName={styles['popver-content']}
                  getPopupContainer={() => containerRef.current}
                  content={(
                    <div>
                      <div className={styles['popver-content-btn']}>
                        <Button funcType={FuncType.link} onClick={() => handleDesignTemplate(record.get('templateId'))}>
                          {intl.get('hrpt.printTemplate.view.button.reportDesign').d('模板设计')}
                        </Button>
                      </div>
                      <div className={styles['popver-content-btn']}>
                        <Button funcType={FuncType.link} onClick={() => handleUploadTemplate(record)}>
                          {intl.get('hrpt.printTemplate.view.button.uploadTemplate').d('模板上传')}
                        </Button>
                      </div>
                    </div>
                  )}
                >
                  <Button funcType={FuncType.link}>
                    {intl.get('hrpt.printTemplate.view.button.reportEdit').d('编辑模板')}
                    <Icon type="arrow_drop_down" style={{ verticalAlign: 'sub' }} />
                  </Button>
                </Popover>
              ) : (
                <Button funcType={FuncType.link} onClick={() => handleDesignTemplate(record.get('templateId'))}>
                  {isPredefined ?
                    intl.get('hrpt.printTemplate.view.button.reportView').d('模板查看')
                    : intl.get('hrpt.printTemplate.view.button.reportDesign').d('模板设计')}
                </Button>
              ),
              !isPredefined && (
                <Button funcType={FuncType.link} onClick={() => handleEnable(record)}>
                  {record && record.get('enabledFlag') === 1
                    ? intl.get('hzero.common.status.disable').d('禁用')
                    : intl.get('hzero.common.status.enable').d('启用')}
                </Button>
              ),
              (isTenantRoleLevel() ? !isPredefined : (isAdmin || (window as any).$$env || {}).HRPT_ADD_FIELD === "true") && (
                <Button funcType={FuncType.link} onClick={() => handleCopy(record)}>
                  {intl.get('hzero.common.button.copy').d('复制')}
                </Button>
              ),
            ].filter(Boolean);
          }
        },
      },
    ],
    [
      isPredefined,
      tableDs,
      handleDesignTemplate,
      handleCopy,
      handleEnable,
      handleCancleEditTemplate,
      handleUploadTemplate,
      formDs.current?.get("reportType")
    ]
  );

  const tableButtons = useMemo(() => {
    if (isPredefined || !canEdit) {
      return undefined;
    }
    return [
      <Button color={ButtonColor.primary} funcType={FuncType.flat} icon="playlist_add" onClick={() => openTplEdit(true, undefined)}>
        {intl.get('hzero.common.button.create').d('新建')}
      </Button>,
    ];
  }, [openTplEdit, isPredefined, canEdit]);

  return (
    <div ref={containerRef}>
      {isPredefined ? (
        <Alert
          type="warning"
          showIcon
          closable
          message={(
            <>
              {intl.get('hzero.common.message.confirm.title').d('提示')}
              <span style={{ marginRight: '4px', display: 'inline-block' }}>:</span>
              {intl.get('hrpt.printTemplate.view.message.predefinedLimit')
                .d('预定义模板仅支持查看，不支持编辑，如需使用预定义模板，可复制预定义模板后再进行设计。')}
            </>
          )}
          className={styles.alert}
        />
      ) : null}
      <Card
        key="report-definition-header"
        bordered={false}
        title={intl.get('hrpt.printTemplate.view.message.templateHeader').d('模板头信息')}
        className={styles.card}
        style={{ marginTop: '-32px' }}
      >
        <Form dataSet={formDs} columns={3} labelLayout={LabelLayout.float}>
          <TextField name="reportCode" restrict="0-9A-Za-z-._" />
          <IntlField name="reportName" />
          <IntlField name="remark" />
          <Lov name="dataset" />
          <Select name='editorType' clearButton={false}>
            <Select.Option value='EXCEL'>Excel</Select.Option>
            {/* <Select.Option value='WORD'>Word</Select.Option> */}
          </Select>
          {formDs.current?.get('editorType') !== 'WORD' && (
            <Select
              name="reportType"
              clearButton={false}
              showHelp={ShowHelp.tooltip}
              help={intl.get('hrpt.printTemplate.view.message.reportType.help').d('此配置界定模板设计器的配置类型与推荐打印文件适配格式，对最终打印文件的实际格式无直接影响，具体打印格式遵循功能端设计标准执行。')}
            >
              <Select.Option value="PDF">PDF</Select.Option>
              <Select.Option value="EXCEL">Excel</Select.Option>
            </Select>
          )}
          {formDs.current?.get('reportType') === 'PDF' && (
            <NumberField name='asyncThreshold' showHelp={ShowHelp.tooltip} />
          )}
          <TextField
            name='reportSource'
            disabled
            hidden={!isTenant}
            renderer={({ value }) => {
              return isCreate || value === 'CUSTOM' ?
                intl.get('hzero.common.custom').d('自定义')
                : intl.get('hzero.common.predefined').d('预定义');
            }}
          />
          <Select name='labelCode' clearButton={false}  showHelp={ShowHelp.tooltip} />
        </Form>
      </Card>
      {!isCreate && (
        <Card
          key="report-definition-template"
          bordered={false}
          title={intl.get('hrpt.printTemplate.view.message.template').d('模板')}
          className={styles.card}
        >
          <Table buttons={tableButtons} dataSet={tableDs} columns={columns} customizedCode='HRPT_PRINT_TEMPLATE_EDIT_TPL' />
        </Card>
      )}
    </div>
  );
});

export default memo(Drawer);
