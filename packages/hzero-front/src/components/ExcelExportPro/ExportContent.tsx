import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import {
  Spin,
  Form,
  NumberField,
  Select,
  TextField,
  Tree,
  Button,
  DataSet,
  Modal,
  Tooltip,
} from 'choerodon-ui/pro';
import { Icon, Card, Text, Popover } from 'choerodon-ui';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { FormLayout, LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import type { NodeRenderer } from 'choerodon-ui/pro/lib/tree/util';
import { ShowHelp } from 'choerodon-ui/pro/lib/field/enum';
import type { Renderer } from 'choerodon-ui/pro/lib/field/FormField';
import { RecordStatus } from 'choerodon-ui/pro/lib/data-set/enum';
// import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { observer } from 'mobx-react-lite';
import { isUndefined, isEmpty, isArray } from 'lodash';
// import { isEmpty } from 'lodash';
import intl from 'utils/intl';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import notification from 'utils/notification';
import { isTenantRoleLevel, getCurrentOrganizationId, getResponse, getCurrentUser, getCurrentUserId } from 'utils/utils';
import { getEnvConfig } from 'utils/iocUtils';
import { ExportTypeEnum, ExportTemplateTypeEnum } from './util';
import request from 'utils/request';
import OptionMenu from './OptionMenu';
import RenameModal from './RenameModal';
import './index.less';

const { Option, OptGroup } = Select;

const { HZERO_HMDE } = getEnvConfig();
const organizationId = getCurrentOrganizationId();
const {
  additionInfo: { enableExcelWatermark = false } = {},
} = getCurrentUser();
// const isTenant = isTenantRoleLevel();

const ExportContent: React.FC<any> = observer(props => {
  const {
    queryArea,
    treeArea,
    // exportAsync,
    queryFormItem,
    templateCode,
    modal,
    handleExport,
    formData = {},
    title,
  } = props;

  const data = useMemo(() => ({ formData: undefined }), []);
  data.formData = formData;

  const defaultData = {
    templateCode: 'default',
    templateType: ExportTemplateTypeEnum.DEFAULT,
    singleExcelMaxSheetNum: 5,
  };
  const [templateList, setTemplateList] = useState<any>([defaultData]);
  const [currentTemplate, setCurrentTemplate] = useState<any>(defaultData);
  const [showMore, setShowMore] = useState<boolean>(false);
  const [selectValue, setSelectValue] = useState<String>('default');

  const treeParams = queryArea.getState('treeParams');
  const openFlag = treeArea.getState('openFlag');
  // const enableAsync = !!treeParams?.enableAsync || false;
  const showAsync = isUndefined(treeParams?.defaultRequestMode) || true;
  const exportType = treeParams?.type || ExportTypeEnum.Class;
  const changeFlag = treeArea.getState('changeFlag');

  const nodeRenderer: NodeRenderer = ({ record }) => {
    return <span style={{ fontWeight: record?.children ? 600 : 400 }}>{record?.get('title')}</span>;
  };

  useEffect(() => {
    if (!templateCode && !isEmpty(data.formData)) {
      setDefaultValue();
    }
    if (templateCode && openFlag) {
      queryTemplateList(true);
    }
  }, [templateCode, openFlag]);

  useEffect(() => {
    if (openFlag) {
      modal.update({
        footer: (
          <>
            <Button
              color={ButtonColor.primary}
              onClick={async () => {
                const flag = await handleExport();
                if (flag) {
                  modal.close();
                }
              }}
            >
              {intl.get('hzero.common.button.confirm.export').d('导出')}
            </Button>
            <Button
              onClick={() => {
                modal.close();
              }}
            >
              {intl.get('hzero.common.button.close').d('关闭')}
            </Button>
          </>
        ),
      });
    }
  }, [openFlag]);

  const setDefaultValue = () => {
    const queryData = {
      singleExcelMaxSheetNum: 5,
      fillerType: 'single-sheet',
      ...(data.formData || {}),
      async: 'true',
    };
    queryArea.loadData([queryData]);
  }

  const queryTemplateList = useCallback((initFlag = false) => {
    axios({
      url: `${HZERO_HMDE}/v1/${organizationId}/business-objects-user-export-templates/list-with-predefined`,
      method: 'GET',
      params: {
        templateCode,
      },
    })
      .then((res: any) => {
        if (getResponse(res)) {
          if (modal) {
            const predefiendTemplate: any = isArray(res) ? res.find(i => (i as any).templateType === ExportTemplateTypeEnum.PREDEFINED) : undefined;
            if (predefiendTemplate) {
              modal.update({
                title: (
                  <>
                    {title}
                    <Popover
                      overlayClassName='common-export-modal-title-popver'
                      placement='bottomLeft'
                      content={(
                        <div>
                          <div className='common-export-modal-title-popver-item'>
                            <div>{intl.get('hzero.common.model.exportTemplate.code').d('导出模板编码')}:</div>
                            <div>{templateCode}</div>
                          </div>
                          <div className='common-export-modal-title-popver-item'>
                            <div>{intl.get('hzero.common.model.exportTemplate.name').d('导出模板名称')}:</div>
                            <div>{predefiendTemplate.templateName}</div>
                          </div>
                          <div className='common-export-modal-title-popver-item'>
                            <div>{intl.get('hzero.common.model.businessCombine.code').d('组合业务对象编码')}:</div>
                            <div>{predefiendTemplate.businessObjectCode}</div>
                          </div>
                          <div className='common-export-modal-title-popver-item'>
                            <div>{intl.get('hzero.common.model.businessCombine.name').d('组合业务对象名称')}:</div>
                            <div>{predefiendTemplate.businessObjectName}</div>
                          </div>
                        </div>
                      )}
                    >
                      <Icon type="wysiwyg" style={{ color: '#c8cdd4', marginLeft: '8px', verticalAlign: 'text-top' }} />
                    </Popover>
                  </>
                )
              });
            }
          }
          setTimeout(() => {
            setTemplateList([...res, defaultData]);
          }, 0);
          let first = res.filter(i => i.defaultFlag);
          if (!first.length) {
            first = res.filter(i => i.templateType === ExportTemplateTypeEnum.PREDEFINED);
            if (first[0]) {
              first[0].defaultFlag = true;
            }
          }
          if (first?.length > 0) {
            setSelectValue(first[0].templateCode);
            setCurrentTemplate(first[0]);
            resetTreeArea();
            treeArea.setState('templateName', first[0].templateName);
            treeArea.setQueryParameter('templateType', first[0].templateType);
            treeArea.setQueryParameter('templateCode', first[0].templateCode);
            treeArea.query();
            let queryData = {
              fillerType: first[0].exportType,
              maxDataCount: first[0].maxDataCount,
              singleExcelMaxSheetNum: first[0].maxSheetCount,
              // 配置和水印都开启时，文件类型只能为excel 2007
              fileType: enableExcelWatermark && first[0].enabledWatermark ? 'EXCEL2007' : first[0].fileType,
              async: 'true',
              enabledWatermark: first[0].enabledWatermark,
              encryptPassword: first[0].encryptPassword || '',
            };
            if (initFlag && !isEmpty(data.formData)) {
              queryData = {
                ...(data.formData || {}),
                ...queryData,
              };
            }
            queryArea.loadData([queryData]);
          }
        }
      })
      .catch(err => {
        notification.error({
          message: err.message,
        });
      });
  }, []);

  const handleSave = (templateName?: string, isAs?: boolean): void => {
    const columnList: any = [];
    const treeData = treeArea.toData();
    treeData.forEach(i => {
      if (i.businessObjectFieldCode) {
        const lineData = {
          businessObjectFieldCode: i.businessObjectFieldCode,
          businessObjectCode: i.businessObjectCode,
          defaultExportFlag: i.checked,
        };
        columnList.push(lineData);
      }
    });
    axios({
      url: `${HZERO_HMDE}/v1/${organizationId}/business-objects-user-export-templates`,
      method: isAs ? 'POST' : 'PUT',
      data: {
        templateName: isAs ? templateName : currentTemplate.templateName,
        businessObjectExportTemplateId:
          currentTemplate.templateId || currentTemplate.businessObjectExportTemplateId,
        businessObjectUserExportTemplateId: isAs
          ? ''
          : currentTemplate.userTemplateId || currentTemplate.businessObjectUserExportTemplateId,
        columnList,
      },
    })
      .then((res: any) => {
        if (getResponse(res)) {
          if (isAs) {
            // eslint-disable-next-line no-shadow
            const { columnList, ...other } = res;
            templateList.push(other);
            setTemplateList(templateList);
            // queryTemplateList();
            setSelectValue(res.templateCode);
            changeTemplate(res.templateCode);
          } else {
            treeArea.query({
              templateCode: currentTemplate.templateCode,
              templateType: currentTemplate.templateType,
            });
          }
          resetTreeArea();
          notification.success({});
        }
      })
      .catch(err => {
        notification.error({
          message: err.message,
        });
      });
  };

  const handleChangeDefault = async(defaultTemplate) => {
    let res;
    if (defaultTemplate.templateType === 'PREDEFINED') {
      res = await resetCustomeTemplateDefault(defaultTemplate.templateId || defaultTemplate.businessObjectExportTemplateId);
    } else {
      res = await request(`${HZERO_HMDE}/v1/${organizationId}/business-objects-user-export-templates`, {
        method: 'PUT',
        body: {
          ...defaultTemplate,
          businessObjectExportTemplateId: defaultTemplate.templateId || defaultTemplate.businessObjectExportTemplateId,
          businessObjectUserExportTemplateId: defaultTemplate.userTemplateId || defaultTemplate.businessObjectUserExportTemplateId,
          defaultFlag: true,  
        },
      });
    }
    if (getResponse(res)) {
      notification.success({});
      const newTemplateList = templateList.map(i => ({ ...i, defaultFlag: i.templateCode === defaultTemplate.templateCode }));
      setTemplateList(newTemplateList);
    }
  };

  const resetCustomeTemplateDefault = (templateId) => {
    return request(`${HZERO_HMDE}/v1/${isTenantRoleLevel() ? `${organizationId}/` : ''}business-objects-user-export-templates/reset`,{
      method: 'PUT',
      body: {
        businessObjectExportTemplateId: templateId,
        userId: getCurrentUserId(),
        tenantId: organizationId,
      },
    })
  };

  const handleRename = (templateName: string, template) => {
    axios({
      url: `${HZERO_HMDE}/v1/${organizationId}/business-objects-user-export-templates`,
      method: 'PUT',
      data: {
        templateName,
        businessObjectExportTemplateId: template.businessObjectExportTemplateId || template.templateId,
        businessObjectUserExportTemplateId: template.businessObjectUserExportTemplateId || template.userTemplateId,
      },
    }).then((res: any) => {
      if (getResponse(res)) {
        queryTemplateList();
        notification.success({});
      }
    });
  };

  const handleDelete = template => {
    axios({
      url: `${HZERO_HMDE}/v1/${organizationId}/business-objects-user-export-templates`,
      method: 'DELETE',
      data: {
        businessObjectUserExportTemplateId: template.businessObjectUserExportTemplateId || template.userTemplateId,
      },
    }).then((res: any) => {
      if (!res?.failed) {
        queryTemplateList();
        notification.success({});
      }
    });
  };

  const handleSaveAs = () => {
    const formDS = new DataSet({
      autoCreate: true,
      fields: [
        {
          name: 'templateName',
          required: true,
          label: intl.get('hzero.common.components.export.v.hd.rename.template').d('模板名称'),
          validator: (value) => {
            if (value && value.length > 31) {
              return intl.get('hzero.common.components.export.v.hd.rename.template.tooLong').d('名称不多于31个字符');
            }
            if (value && /[:\\\/?*\[\]]/.test(value)) {
              return intl.get('hzero.common.components.export.v.hd.rename.template.invalidChart').d('名称不能包含以下字符：: \\ / ? * [ 或 ]');
            }
            if (value && (value[0] === '\'' || value[value.length - 1] === '\'')) {
              return intl.get('hzero.common.components.export.v.hd.rename.template.invalidDot').d('名称不能以单引号开头或结尾');
            }
          },  
        },
      ],
    });
    Modal.open({
      key: 'saveAs',
      className: 'save-modal',
      title: intl.get('hzero.common.components.export.v.hd.saveAs').d('保存导出列模板'),
      children: <RenameModal dataSet={formDS} />,
      onOk: async () => {
        if (!formDS.current) {
          formDS.create();
        }
        if (formDS.current!.status !== RecordStatus.update) {
          formDS.current!.status = RecordStatus.update;
        }
        const flag = await formDS.validate();
        if (!flag) {
          return false;
        }
        const saveData: any = formDS.toData()[0];
        handleSave(saveData?.templateName, true);
      },
      onCancel: () => {
        formDS.reset();
      },
      onClose: () => {
        formDS.reset();
      },
    });
  };

  const renderOption = item => {
    return (
      <Option className="export-select-option" value={item.templateCode} key={item.templateCode}>
        <Text style={{ maxWidth: '220px' }}>{item.templateName}</Text>
        {item.templateType === ExportTemplateTypeEnum.PREDEFINED && (
          <Tooltip
            placement="top"
            title={intl
              .get('hzero.common.components.export.icon.tooltip')
              .d('由管理员预定义的模版')}
          >
            <Icon className="export-select-option-icon" type="help" />
          </Tooltip>
        )}
        {item.defaultFlag && (
          <span className="export-select-option-default">{intl.get('hzero.common.button.default').d('默认')}</span>
        )}
        <span
          className="export-select-option-menu"
          onClick={event => {
            event.stopPropagation();
          }}
        >
          <OptionMenu data={item} onRename={handleRename} onDelete={handleDelete} onChangeDefault={handleChangeDefault} />
        </span>
      </Option>
    );
  };

  const renderer: Renderer = ({ text }) => {
    return (
      <div style={{ width: '100%' }}>
        <Text style={{ maxWidth: '220px' }}>{text}</Text>
        {changeFlag && currentTemplate?.templateType !== ExportTemplateTypeEnum.DEFAULT && (
          <span className="export-select-selected-has-changed">
            {intl.get('hzero.common.view.title.alreadyEdited').d('已修改')}
          </span>
        )}
      </div>
    );
  };

  const changeTemplate = useCallback(
    (value: string) => {
      const template = templateList.find(i => i.templateCode === value);
      if (template || value === 'default') {
        setSelectValue(value);
        setCurrentTemplate(template);
        resetTreeArea();
        treeArea.setState('templateName', template.templateName);
        treeArea.setQueryParameter('templateType', template.templateType);
        treeArea.setQueryParameter(
          'templateCode',
          value === 'default' ? templateCode : template.templateCode
        );
        treeArea.query();
        const queryData = {
          fillerType: template.exportType,
          maxDataCount: template.maxDataCount,
          singleExcelMaxSheetNum: template.maxSheetCount,
          fileType: template.fileType,
          async: 'true',
        };
        queryArea.loadData([queryData]);
      }
    },
    [templateList]
  );

  const resetTreeArea = () => {
    treeArea.reset();
    treeArea.setState('changeFlag', false);
  };

  return (
    <Spin dataSet={treeArea}>
      <Card
        bordered={false}
        className={DETAIL_CARD_CLASSNAME}
        title={intl.get('hzero.common.view.baseInfo').d('基本信息')}
      >
        <Form
          dataSet={queryArea}
          columns={2}
          className="export-search-form"
          labelLayout={LabelLayout.float}
        >
          <TextField name="fileName" />
          <Select name="fileType" />
          {showMore && (
            <>
              <Select name="fillerType" />
              <NumberField
                name="singleExcelMaxSheetNum"
                help={intl
                  .get('hzero.common.components.export.maxSheetTip')
                  .d(
                    '限制单个excel的sheet页数量，当数据量超过一个excel时，会分片成多个excel，以压缩包形式导出。'
                  )}
                showHelp={ShowHelp.tooltip}
              />
              {showAsync && <Select name="async" disabled />}
              {!templateCode && (
                <NumberField
                  name="singleSheetMaxRow"
                  help={intl
                    .get('hzero.common.components.export.singleSheetTip')
                    .d(
                      '限制excel中单个sheet页的数据量，当数据量超过单sheet页最大数量时，会自动分片到下一个sheet页。'
                    )}
                  showHelp={ShowHelp.tooltip}
                />
              )}
            </>
          )}
        </Form>
        <a onClick={() => setShowMore(!showMore)}>
          {showMore
            ? intl.get('hzero.common.button.export.collected').d('收起')
            : intl.get(`hzero.common.button.export.more`).d('更多选项')}
          {showMore ? <Icon type="expand_less" /> : <Icon type="expand_more" />}
        </a>
      </Card>
      {exportType === ExportTypeEnum.Class && (
        <>
          {queryFormItem && (
            <Card
              bordered={false}
              className={DETAIL_CARD_CLASSNAME}
              title={intl.get('hzero.common.view.otherInfo').d('其他信息')}
            >
              {queryFormItem}
            </Card>
          )}
          <Card
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            title={intl.get('hzero.common.components.export.choose.column').d('选择要导出的列')}
          >
            {templateCode && (
              <div className="export-template">
                <Form
                  layout={FormLayout.none}
                  className="export-template-form"
                  labelLayout={LabelLayout.float}
                  columns={6}
                >
                  <Select
                    label={intl
                      .get('hzero.common.components.export.choose.column')
                      .d('选择导出列模版')}
                    className="export-select"
                    onChange={changeTemplate}
                    value={selectValue}
                    clearButton={false}
                    popupCls="export-select-popup"
                    renderer={renderer}
                  >
                    <Option value="default" key="default">
                      {intl.get('hzero.common.button.default').d('默认')}
                    </Option>
                    {templateList
                      .filter(i => i.templateType === ExportTemplateTypeEnum.PREDEFINED)
                      .map(item => renderOption(item))}
                    <OptGroup
                      label={intl
                        .get('hzero.common.components.export.custom.template')
                        .d('自定义模板')}
                    >
                      {templateList
                        .filter(i => i.templateType === ExportTemplateTypeEnum.CUSTOM)
                        .map(item => renderOption(item))}
                    </OptGroup>
                  </Select>
                </Form>
                {changeFlag && currentTemplate?.templateType !== ExportTemplateTypeEnum.DEFAULT && (
                  <div className="export-template-buttons">
                    <Button onClick={handleSaveAs}>
                      {intl.get('hzero.common.button.saveAs').d('另存为')}
                    </Button>
                    {currentTemplate.templateType === ExportTemplateTypeEnum.CUSTOM && (
                      <Button onClick={() => handleSave('', false)}>
                        {intl.get('hzero.common.button.save').d('保存')}
                      </Button>
                    )}
                    <Button onClick={resetTreeArea}>
                      {intl.get('hzero.common.button.reset').d('重置')}
                    </Button>
                  </div>
                )}
              </div>
            )}
            {openFlag && (
              <Tree
                dataSet={treeArea}
                showLine={{
                  showLeafIcon: false,
                }}
                showIcon={false}
                checkable
                selectable={false}
                defaultExpandedKeys={[`${treeParams?.id}`]}
                renderer={nodeRenderer}
              />
            )}
          </Card>
        </>
      )}
    </Spin>
  );
});

export default ExportContent;
