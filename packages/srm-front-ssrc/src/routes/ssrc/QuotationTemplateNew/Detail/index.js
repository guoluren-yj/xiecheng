import React, {
  Fragment,
  useMemo,
  useState,
  useEffect,
  createContext,
  useRef,
  useCallback,
} from 'react';
import {
  Button,
  Form,
  Output,
  CheckBox,
  DataSet,
  Tabs,
  Modal,
  IntlField,
  TextField,
  Table,
  Attachment,
  Select,
} from 'choerodon-ui/pro';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import { Icon, Popover } from 'choerodon-ui';
import { compose, isEmpty } from 'lodash';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import remoteHoc from 'hzero-front/lib/utils/remote';
import querystring from 'querystring';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
// import { PRIVATE_BUCKET } from '_utils/config';
// import { FIlESIZE, ChunkUploadProps } from '@/utils/SsrcRegx';
import { yesOrNoRender } from 'utils/renderer';

import {
  fetchModuleList,
  deleteModule,
  copyModule,
  saveColumns,
  saveItems,
  copyTemplate,
  addMaterial,
  queryAssignCategory,
  quotationTemplatePublish,
  fetchNewModuleData,
  // unlockTemplate,
} from '@/services/quotationTemplateNewService';

// eslint-disable-next-line import/no-cycle
import ModuleDetail from './ModuleDetail';
import Preview from './Preview';
import {
  formDS,
  moduleFormDS,
  copyTemplateDS,
  copyModuleDS,
  columnTableDS,
  itemTableDS,
} from './indexDS';
import styles from './index.less';
import Style from '../index.less';

import { categoryTableDS } from '../store';
import Material from '../Material';

const { TabPane } = Tabs;
const { Column } = Table;
const promptCode = 'ssrc.quotationTemplate';

const TemplateIdContext = createContext();

const Index = (props) => {
  const {
    customizeForm,
    customizeBtnGroup,
    remote,
    match: { params },
    history,
    location: { search, pathname },
  } = props;

  const { viewFlag = '0' } = querystring.parse(search.substr(1)) || {};
  const pageReadonly = viewFlag === '1';

  const organizationId = getCurrentOrganizationId();
  const templateHeaderRef = useRef();

  const moduleDetailRef = useRef();

  const [activeKey, setActiveKey] = useState();
  const [moduleList, setModuleList] = useState([]);
  const [modelResult, setModelResult] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);

  const formDs = useMemo(() => new DataSet(formDS(params?.templateId, { pageReadonly })), [
    pathname,
  ]);

  const {
    moduleRule,
    templateStatus: currentTemplateStatus,
    // templateDimension: currentTemplateDimension,
  } = formDs?.current ? formDs.current.get(['moduleRule', 'templateStatus']) : {};

  const moduleFormDs = useMemo(
    () =>
      new DataSet(
        remote
          ? remote.process(
              'SSRC_QUOTATION_TEMPLATE_DETAIL_PROCESS_MODULEFORM_DS',
              moduleFormDS(params?.templateId),
              {
                pageProps: props,
              }
            )
          : moduleFormDS(params?.templateId)
      ),
    [pathname, params]
  );

  const columnDs = useMemo(
    () =>
      new DataSet(
        columnTableDS({
          pageReadonly,
          templateId: params?.templateId,
          templateStatus: templateHeaderRef.current?.templateStatus,
        })
      ),
    [templateHeaderRef.current?.templateStatus, pathname, search]
  );
  const itemDs = useMemo(
    () =>
      new DataSet(
        remote
          ? remote.process(
              'SSRC_QUOTATION_TEMPLATE_DETAIL_PROCESS_ITEM_DS',
              itemTableDS({
                pageReadonly,
                templateId: params?.templateId,
                templateStatus: templateHeaderRef.current?.templateStatus,
                pageProps: props,
              }),
              {
                pageReadonly,
                templateId: params?.templateId,
                templateStatus: templateHeaderRef.current?.templateStatus,
                pageProps: props,
                moduleDetailRef,
                activeKey,
                moduleList,
                formDs,
              }
            )
          : itemTableDS({
              pageReadonly,
              templateId: params?.templateId,
              templateStatus: templateHeaderRef.current?.templateStatus,
              pageProps: props,
            })
      ),
    [templateHeaderRef.current?.templateStatus, pathname, search, activeKey, moduleList?.length]
  );
  const copyModuleDs = useMemo(() => new DataSet(copyModuleDS()), [pathname, search]);
  const copyTemplateDs = useMemo(() => new DataSet(copyTemplateDS(params?.templateId)), [
    pathname,
    search,
  ]);

  // 保存品类
  const handleOkCategory = (templateId, templateDimension) => {
    if (currentTemplateStatus === 'RELEASED') {
      return;
    }

    const filterData = categoryTableDs.filter((record) => {
      return record.getState('dirty');
    });
    const quotationDimensionList = filterData?.map((item) => ({
      ...item.toData(),
      deleteFlag: item.isSelected ? 0 : 1,
    }));
    if (isEmpty(quotationDimensionList)) return;
    const data = {
      templateId,
      quotationDimensionType: templateDimension,
      quotationDimensionList,
    };
    return addMaterial(data).then((res) => {
      const result = getResponse(res);
      if (result && !result.failed) {
        categoryTableDs.queryDataSet.current.reset();
        notification.success();
      }
    });
  };

  const categoryTableDs = new DataSet(categoryTableDS(handleOkCategory));

  useEffect(() => {
    init();
    eventManager(); // 挂载全局方法，方便二开调用
    return () => {
      window.refreshQuotationTem = null;
    };
  }, [pathname]);

  // refreshQuotationTem挂载window上，伊品生物个性化按钮调用
  const eventManager = () => {
    window.refreshQuotationTem = { init };
  };

  useEffect(() => {
    if (activeKey) {
      // 切换模块时，如果是在项上，则切回到列
      if (moduleDetailRef.current?.activity === 'item') {
        // eslint-disable-next-line no-unused-expressions
        moduleDetailRef.current?.setActivity('column');
        itemDs.loadData([]);
      }
      columnDs.setQueryParameter('moduleTemplateId', activeKey);
      columnDs.query();
    }
  }, [activeKey, params, pathname, search]);

  const init = async () => {
    if (!formDs) {
      return;
    }

    formDs.setQueryParameter('customizeUnitCode', 'SSRC.QUOTATIONTEMPLATE_UPDATE.BASE_FORM');
    const result = await getResponse(formDs.query());
    if (result && !result.failed) {
      // 设置值
      templateHeaderRef.current = result;
      setModelResult(result);
    }
  };

  useEffect(() => {
    if (!isEmpty(modelResult)) {
      copyTemplateDs.queryDataSet.setState('templateDimension', modelResult.templateDimension);
      if (moduleRule === 'SUB_MODULE') {
        // 查询模块列表
        queryModuleList();
      } else {
        columnDs.query();
        if (moduleDetailRef.current?.activity === 'item') {
          itemDs.query();
        }
      }
    }
  }, [modelResult, moduleRule, pathname, search]);

  // 查询模块列表
  const queryModuleList = async (key) => {
    const param = {
      templateId: params?.templateId,
    };
    fetchModuleList(param).then((res) => {
      const result = getResponse(res);
      if (result && !result.failed) {
        setModuleList(res);
        setActiveKey(key || res[0].templateId);
      }
    });
  };

  const handleKeyChange = (key) => {
    setActiveKey(key);
  };

  // 模块保存
  const handleModuleOk = async () => {
    const validateFlag = await moduleFormDs.validate();
    if (!validateFlag) {
      return false;
    }

    const res = await moduleFormDs.submit();
    if (res && res.success) {
      // 查询模块列表
      queryModuleList(res.content?.[0]?.templateId);
    }
  };

  const handleFetchNewModuledata = async (record) => {
    let data = {};
    const { templateId, } = record || {};

    if (templateId) {
      let newModuleInfo = await fetchNewModuleData({
        templateId,
      });
      data = getResponse(newModuleInfo) || {};
    }

    return data || {};
  };

  // 模块弹框-新增、编辑
  const handleAddModule = async (record = {}) => {
    if (!isEmpty(record)) {
      // 编辑
      const newModuleData = await handleFetchNewModuledata(record);

      moduleFormDs.loadData([
        {
          ...record,
          ...newModuleData,
        },
      ]);
    } else {
      // 新建模块
      moduleFormDs.create({}, 0);
    }

    let formFields = [<TextField name="templateNum" />, <IntlField name="templateName" />];

    formFields = remote
      ? remote.process(
          'SSRC_QUOTATION_TEMPLATE_DETAIL_PROCESS_ADD_MODULE_FORM_FIELDS',
          formFields,
          {
            pageProps: props,
            moduleFormDs,
          }
        )
      : formFields;

    Modal.open({
      title: isEmpty(record)
        ? intl.get(`${promptCode}.view.message.addModule`).d('新增模块')
        : intl.get(`${promptCode}.view.message.editModule`).d('编辑模块'),
      key: Modal.key(),
      destroyOnClose: true,
      drawer: true,
      style: {
        width: '380px',
      },
      children: (
        <Form dataSet={moduleFormDs} labelLayout="float">
          {formFields}
        </Form>
      ),
      onOk: () => handleModuleOk(),
      afterClose: () => {
        moduleFormDs.current?.reset();
        moduleFormDs.loadData();
      },
    });
  };

  // 异步加载子集数据
  const handleLoadData = ({ record, dataSet }) => {
    const { key, children } = record;
    const data = {
      ...(dataSet?.queryParameter?.params || {}),
      parentItemCategoryId: key,
    };
    return new Promise((resolve) => {
      if (!children) {
        queryAssignCategory(data)
          .then((res) => {
            const result = getResponse(res);
            if (result && !result.failed) {
              dataSet.appendData(res.content, record);
              resolve();
            }
            resolve();
          })
          .catch(() => {
            resolve();
          });
      } else {
        resolve();
      }
    });
  };

  // 分配适用品类
  const handleAssignCategory = (record) => {
    const { templateId, templateNum, templateStatus, templateDimension } = record.get([
      'templateId',
      'templateNum',
      'templateStatus',
      'templateDimension',
    ]);
    const categoryProps = {
      templateId,
      templateCode: templateNum,
      templateStatus,
      templateDimension,
      customizeUnitCode: getHeaderCustomizeUnitCode(),
    };

    if (!templateId) {
      return;
    }

    categoryTableDs.setQueryParameter('params', categoryProps);
    categoryTableDs.query();
    const columns = [
      {
        name: 'itemCategoryCode',
      },
      {
        name: 'itemCategoryName',
      },
    ];
    const preTableProps = {
      mode: 'tree',
      dataSet: categoryTableDs,
      columns,
      queryFieldsLimit: 2,
      className: Style.table,
      treeLoadData: handleLoadData,
    };
    const tableProps = remote
      ? remote.process(
          'SSRC_QUOTATION_TEMPLATE_DETAIL_PROCESS_ASSIGN_TABLE_PROPS',
          preTableProps,
          {}
        )
      : preTableProps;
    if (templateStatus === 'RELEASED' || pageReadonly) {
      return Modal.open({
        drawer: true,
        title: intl.get(`${promptCode}.model.title.assignCategory`).d('分配适用品类'),
        key: Modal.key(),
        children: <Table {...tableProps} />,
        closable: true,
        // okProps: {
        //   disabled: templateStatus === 'RELEASED' || pageReadonly,
        // },
        onCancel: () => {
          categoryTableDs.queryDataSet.current.reset();
        },
        onOk: () => handleOkCategory(templateId, templateDimension),
        afterClose: () => categoryTableDs.loadData([]),
        style: {
          width: '800px',
        },
        okButton: false,
        cancelText: intl.get('hzero.common.button.close').d('关闭'),
        cancelProps: { color: 'primary' },
      });
    }
    return Modal.open({
      drawer: true,
      title: intl.get(`${promptCode}.model.title.assignCategory`).d('分配适用品类'),
      key: Modal.key(),
      children: <Table {...tableProps} />,
      closable: true,
      // okProps: {
      //   disabled: templateStatus === 'RELEASED' || pageReadonly,
      // },
      onCancel: () => {
        categoryTableDs.queryDataSet.current.reset();
      },
      onOk: () => handleOkCategory(templateId, templateDimension),
      afterClose: () => categoryTableDs.loadData([]),
      style: {
        width: '800px',
      },
    });
  };

  // 分配适用物料
  const handleAssignMaterial = (record) => {
    const { templateId, templateNum, templateStatus, templateDimension } = record.get([
      'templateId',
      'templateNum',
      'templateStatus',
      'templateDimension',
    ]);
    const materialProps = {
      templateId,
      templateCode: templateNum,
      templateStatus,
      templateDimension,
      pageReadonly,
    };

    if (!templateId) {
      return;
    }

    Modal.open({
      drawer: true,
      title: intl.get(`${promptCode}.model.title.assignMaterial`).d('分配适用物料'),
      key: Modal.key(),
      children: <Material {...materialProps} />,
      style: {
        width: '1300px',
      },
      footer: null,
      closable: true,
    });
  };

  const handleClickMoreHoriz = (e) => {
    // 如果提供了事件对象，则这是一个非IE浏览器
    if (e?.stopPropagation) {
      // 因此它支持W3C的stopPropagation()方法
      e.stopPropagation();
    } else {
      // 否则，我们需要使用IE的方式来取消事件冒泡
      window.event.cancelBubble = true;
    }
  };

  // 删除模块确认
  const handleDeleteModule = (templateId) => {
    Modal.confirm({
      title: intl.get(`${promptCode}.view.message.deleteModule`).d('是否确认删除模块？'),
      onOk: () => confirmDeleteModule(templateId),
    });
  };

  // 删除模块
  const confirmDeleteModule = (templateId) => {
    deleteModule({ templateId }).then((res) => {
      const result = getResponse(res);
      if (result && !result.failed) {
        notification.success();
        // 查询模块列表
        queryModuleList();
      }
    });
  };

  // 复制模块
  const handleCopyModule = (templateId) => {
    copyModuleDs.setQueryParameter('templateId', templateId);
    copyModuleDs.query();

    Modal.open({
      key: Modal.key(),
      children: (
        <Table dataSet={copyModuleDs} queryFieldsLimit={2}>
          <Column name="templateNum" />
          <Column name="templateName" />
        </Table>
      ),
      onOk: () => handleOkCopyModule(templateId),
    });
  };

  // 复制模块-确认回调函数
  const handleOkCopyModule = (templateId) => {
    if (!isEmpty(copyModuleDs.selected)) {
      const data = {
        templateId,
        sourceTemplateId: copyModuleDs.selected[0]?.toData()?.templateId,
      };
      return copyModule(data).then((res) => {
        const result = getResponse(res);
        if (result && !result.failed) {
          notification.success();
          // 查询报价明细列
          columnDs.setQueryParameter('moduleTemplateId', templateId);
          columnDs.query();
          itemDs.query();
        }
      });
    }
  };

  const validateAndIntegration = async () => {
    const { activity } = moduleDetailRef?.current || {};
    let headerValidate = true;
    let lineValidate = true;

    let headerData = {};
    let quotationColumns = [];
    let quotationTplDtls = null;

    const { current } = formDs || {};
    if (!current) {
      return;
    }

    if (activity === 'column') {
      columnDs.forEach((record) => {
        if (!record) {
          return;
        }

        record.set('status', 'update');
      });
      lineValidate = await columnDs.validate();
      quotationColumns = columnDs.toData();
    }

    if (activity === 'item') {
      columnDs.forEach((record) => {
        if (!record) {
          return;
        }

        record.set('status', 'update');
      });
      quotationTplDtls = moduleDetailRef.current?.getUpdateData();
    }

    current.set('status', 'update');

    headerValidate = await formDs.validate();
    headerData = current.toData() || {};

    return {
      ...headerData,
      organizationId,
      validate: headerValidate && lineValidate,
      query: {
        customizeUnitCode: getHeaderCustomizeUnitCode(),
      },
      quotationTplDtls,
      quotationColumns,
      templateId: params?.templateId,
    };
  };

  // 发布
  const handleRelease = async () => {
    const { validate, ...others } = await validateAndIntegration();
    if (!validate) {
      return;
    }

    const data = {
      ...others,
    };

    let result = null;
    setSaveLoading(true);
    try {
      result = await quotationTemplatePublish(data);
      result = getResponse(result);
      setSaveLoading(false);
      if (!result) {
        return;
      }
      notification.success();
      directionToList();
    } catch (e) {
      throw e;
    }
  };

  const directionToList = () => {
    history.push({
      pathname: getHistoryPath(),
    });
  };

  // 大保存
  const handleSave = () => {
    if (moduleDetailRef.current?.activity === 'column') {
      handleSaveColumns();
    } else if (moduleDetailRef.current?.activity === 'item') {
      handleSaveItems();
    }
  };

  // 大保存-报价明细列维度
  const handleSaveColumns = async () => {
    if (await columnDs.validate()) {
      setSaveLoading(true);
      const data = {
        ...formDs.current?.toData(),
        templateId: params?.templateId,
        quotationColumns: columnDs.toData(),
      };
      saveColumns(data)
        .then((res) => {
          const result = getResponse(res);
          if (result && !result.failed) {
            notification.success();
            // 查询
            init();
            columnDs.query();
          }
        })
        .finally(() => setSaveLoading(false));
    }
  };

  // 大保存-报价明细项维度
  const handleSaveItems = async () => {
    if (await itemDs.validate()) {
      setSaveLoading(true);
      const data = {
        ...formDs.current?.toData(),
        templateId: params?.templateId,
        quotationTplDtls: moduleDetailRef.current?.getUpdateData(),
      };
      saveItems(data)
        .then((res) => {
          const result = getResponse(res);
          if (result && !result.failed) {
            notification.success();
            // 查询
            init();
            itemDs.query();
          }
        })
        .finally(() => setSaveLoading(false));
    }
  };

  // 复制已存在模板
  const handleCopyExistTpl = () => {
    copyTemplateDs.query();

    Modal.open({
      key: Modal.key(),
      children: (
        <Table dataSet={copyTemplateDs} queryFieldsLimit={2}>
          <Column
            name="itemCode"
            header={
              templateHeaderRef.current?.templateDimension === 'ITEM'
                ? intl.get(`${promptCode}.model.assignedTempMaterial.code`).d('物料编码')
                : intl.get(`${promptCode}.model.assignedTempCategory.code`).d('品类编码')
            }
          />
          <Column
            name="itemName"
            header={
              templateHeaderRef.current?.templateDimension === 'ITEM'
                ? intl.get(`${promptCode}.model.assignedTempMaterial.name`).d('物料名称')
                : intl.get(`${promptCode}.model.assignedTempCategory.name`).d('品类名称')
            }
          />
          <Column name="templateNum" />
          <Column name="templateName" />
        </Table>
      ),
      style: {
        width: '800px',
      },
      onOk: () => handleOkCopyTemplate(),
      onClose: tplModalClose,
    });
  };

  const tplModalClose = () => {
    const { queryDataSet } = copyTemplateDs || {};
    if (queryDataSet) {
      // queryDataSet.clear();
      queryDataSet.reset();
    }
  };

  // 复制已存在模板-确认回调函数
  const handleOkCopyTemplate = () => {
    if (!isEmpty(copyTemplateDs.selected)) {
      const data = {
        templateId: params?.templateId,
        sourceTemplateId: copyTemplateDs.selected[0]?.toData()?.templateId,
      };
      return copyTemplate(data).then((res) => {
        const result = getResponse(res);
        if (result && !result.failed) {
          notification.success();
          // 查询报价明细列
          // to do 查询
          init();
        }
      });
    }
  };

  // 预览
  const handlePreview = () => {
    const { templateName } = formDs.toData()?.[0];
    const previewProps = {
      templateName,
      moduleRule,
      templateId: params?.templateId,
    };

    let title = intl.get(`${promptCode}.model.template.preview`).d('预览');
    if (templateName) {
      title = `${title}-${templateName}`;
    }

    Modal.open({
      title,
      key: Modal.key(),
      children: <Preview {...previewProps} />,
      drawer: true,
      style: {
        width: '70%',
      },
      okButton: false,
      cancelText: intl.get('hzero.common.button.close').d('关闭'),
      cancelProps: { color: 'primary' },
    });
  };

  const tabsHeader = (
    <React.Fragment>
      {currentTemplateStatus === 'RELEASED' || pageReadonly ? null : (
        <div style={{ display: 'flex' }}>
          <Icon type="playlist_add" />
          <a onClick={() => handleAddModule()} style={{ paddingLeft: '4px' }}>
            {intl.get(`${promptCode}.view.message.addModule`).d('新增模块')}
          </a>
        </div>
      )}
    </React.Fragment>
  );

  const renderModuleList = useCallback(
    (n) => (
      <div className={styles['module-operate']}>
        <p onClick={() => handleDeleteModule(n.templateId)}>
          {intl.get(`${promptCode}.view.button.deleteModule`).d('删除模块')}
        </p>
        <p onClick={() => handleAddModule(n)}>
          {intl.get(`${promptCode}.view.button.updateModule`).d('修改模块信息')}
        </p>
        <p onClick={() => handleCopyModule(n.templateId)}>
          {intl.get(`${promptCode}.view.button.copyModule`).d('复制模块')}
        </p>
      </div>
    ),
    [activeKey, pathname]
  );

  // header form unit code
  const getHeaderCustomizeUnitCode = () => {
    return 'SSRC.QUOTATIONTEMPLATE_UPDATE.BASE_FORM';
  };

  // // 解锁
  // const handleUnlock = () => {
  //   const { current } = formDs || {};
  //   const templateId = current ? current.get('templateId') : {};
  //   if (!templateId) {
  //     return;
  //   }

  //   const data = {
  //     templateId,
  //     query: {
  //       customizeUnitCode: getHeaderCustomizeUnitCode(),
  //     },
  //   };

  //   setSaveLoading(true);
  //   unlockTemplate(data).then((res) => {
  //     setSaveLoading(false);
  //     const result = getResponse(res);
  //     if (result && !result.failed) {
  //       const { templateId: newTemplateId = null } = result || {};
  //       notification.success();
  //       updateUrlId(newTemplateId);
  //     }
  //   });
  // };

  const handleChangeModuleRule = (value) => {
    setModelResult(value);
  };

  // const updateUrlId = (id) => {
  //   if (!id) {
  //     return;
  //   }

  //   history.push({
  //     pathname: `/ssrc/new-quotation-template/detail/${id}`,
  //     search,
  //   });
  // };

  // 编辑
  const handleEdit = () => {
    const { templateId } = params || {};
    if (!templateId) {
      return;
    }

    history.push({
      pathname: `/ssrc/new-quotation-template/detail/${templateId}`,
    });
  };

  const getButtons = () => {
    let buttons = [
      !pageReadonly ? (
        <Button
          onClick={handleRelease}
          color="primary"
          icon="publish2"
          name="publish"
          waitType="debounce"
          wait="400"
          loading={saveLoading}
          disabled={currentTemplateStatus !== 'NEW' && currentTemplateStatus !== 'UPDATED'}
        >
          {intl.get('hzero.common.button.release').d('发布')}
        </Button>
      ) : null,
      !pageReadonly ? (
        <Button
          name="save"
          icon="save"
          waitType="debounce"
          wait={300}
          funcType="flat"
          onClick={handleSave}
          loading={saveLoading}
          disabled={currentTemplateStatus === 'RELEASED'}
        >
          {intl.get('hzero.common.button.save').d('保存')}
        </Button>
      ) : null,
      templateHeaderRef.current?.templateDimension === 'ITEM' && !pageReadonly ? (
        <Button
          name="copyItem"
          onClick={handleCopyExistTpl}
          funcType="flat"
          disabled={currentTemplateStatus === 'RELEASED'}
          icon="application_allocation"
          waitType="debounce"
          wait={300}
        >
          {intl.get(`${promptCode}.model.template.referenceMaterialTemplate`).d('引用物料模板')}
        </Button>
      ) : null,
      templateHeaderRef.current?.templateDimension === 'ITEM_CATEGORY' && !pageReadonly ? (
        <Button
          name="copyCategory"
          onClick={handleCopyExistTpl}
          funcType="flat"
          disabled={currentTemplateStatus === 'RELEASED'}
          icon="application_allocation"
          waitType="debounce"
          wait={300}
        >
          {intl.get(`${promptCode}.model.template.referenceCategoryTemplate`).d('引用品类模板')}
        </Button>
      ) : null,
      <Button
        onClick={handlePreview}
        waitType="debounce"
        wait={300}
        funcType="flat"
        name="preview"
        icon="find_in_page"
      >
        {/* <Icon style={{ paddingRight: '8px', fontSize: '12px', fontWeight: 400 }} type="find_in_page" /> */}
        {intl.get(`${promptCode}.model.template.preview`).d('预览')}
      </Button>,
      // currentTemplateStatus === 'RELEASED' && !pageReadonly ? (
      //   <Button
      //     onClick={handleUnlock}
      //     icon="unlock"
      //     funcType="flat"
      //     name="unlock"
      //     loading={saveLoading}
      //     waitType="debounce"
      //     wait={300}
      //   >
      //     {intl.get(`${promptCode}.view.button.unlock`).d('解锁')}
      //   </Button>
      // ) : null,
      pageReadonly ? (
        <Button
          onClick={handleEdit}
          icon="mode_edit"
          funcType="flat"
          name="editor"
          loading={saveLoading}
          waitType="debounce"
          wait={300}
        >
          {intl.get('hzero.common.button.edit').d('编辑')}
        </Button>
      ) : null,
    ];

    buttons = buttons.filter(Boolean);
    return buttons;
  };

  const getUpdateFormFields = () => {
    const field = [
      <TextField name="templateNum" />,
      <IntlField name="templateName" />,
      <Select name="templateDimension" />,
      <Select name="moduleRule" onChange={handleChangeModuleRule} showHelp="tooltip" />,
      <CheckBox name="allowCreateFlag" />,
      <CheckBox name="attachmentNeedFlag" />,
      <CheckBox name="allowPurCreateFlag" />,
      <Output
        name="distribute"
        renderer={({ record }) => {
          const { templateDimension } = record ? record.get(['templateDimension']) : {};

          if (templateDimension === 'ITEM_CATEGORY') {
            return (
              <a onClick={() => handleAssignCategory(record)}>
                {intl.get(`${promptCode}.model.template.assignCategory`).d('分配适用品类')}
              </a>
            );
          }

          return (
            <a onClick={() => handleAssignMaterial(record)}>
              {intl.get(`${promptCode}.model.template.assignMaterial`).d('分配适用物料')}
            </a>
          );
        }}
      />,
      <Attachment
        name="attachmentUuid"
        className={styles['attachment-button-wrap']}
        viewMode="popup"
        tooltip="overflow"
      />,
    ];

    return field;
  };

  const getViewFormFields = () => {
    const field = [
      <Output name="templateNum" />,
      <Output name="templateName" />,
      <Output
        name="templateDimension"
        renderer={({ record }) => {
          const templateDimensionMeaning = record ? record.get('templateDimensionMeaning') : '';
          return templateDimensionMeaning;
        }}
      />,
      <Output
        name="moduleRule"
        showHelp="label"
        renderer={({ record }) => {
          const moduleRuleMeaning = record ? record.get('moduleRuleMeaning') : '';
          return moduleRuleMeaning;
        }}
      />,
      <Output
        name="allowCreateFlag"
        renderer={({ value }) => {
          return yesOrNoRender(value);
        }}
      />,
      <Output
        name="attachmentNeedFlag"
        renderer={({ value }) => {
          return yesOrNoRender(value);
        }}
      />,
      <Output
        name="allowPurCreateFlag"
        renderer={({ value }) => {
          return yesOrNoRender(value);
        }}
      />,
      <Output
        name="distribute"
        renderer={({ record }) => {
          const { templateDimension } = record ? record.get(['templateDimension']) : {};

          if (templateDimension === 'ITEM_CATEGORY') {
            return (
              <a onClick={() => handleAssignCategory(record)}>
                {intl.get(`${promptCode}.model.template.assignCategory`).d('分配适用品类')}
              </a>
            );
          }

          return (
            <a onClick={() => handleAssignMaterial(record)}>
              {intl.get(`${promptCode}.model.template.assignMaterial`).d('分配适用物料')}
            </a>
          );
        }}
      />,
      <Attachment
        name="attachmentUuid"
        viewMode="popup"
        viewOnly
        funcType="link"
        className={styles['attachment-button-wrap']}
      />,
    ];

    return field;
  };

  const getFormField = () => {
    const field = pageReadonly ? getViewFormFields() : getUpdateFormFields();

    return field.filter(Boolean);
  };

  const getHistoryPath = () => {
    return '/ssrc/new-quotation-template/list';
  };

  return (
    <Fragment>
      <Header
        title={
          pageReadonly
            ? intl.get(`${promptCode}.model.title.detailTemplateView`).d('查看报价模板')
            : intl.get(`${promptCode}.model.title.detailMantain`).d('报价明细维护')
        }
        backPath={getHistoryPath()}
      >
        {customizeBtnGroup(
          {
            code: 'SSRC.QUOTATIONTEMPLATE_UPDATE.HEADER_BUTTONS',
          },
          getButtons()
        )}
      </Header>

      <Content className={styles['content-warp']}>
        <div className={styles['basic-info-warp']}>
          <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>
            {intl.get(`${promptCode}.model.template.basicInfo`).d('基础信息')}
          </h3>

          {customizeForm(
            {
              code: 'SSRC.QUOTATIONTEMPLATE_UPDATE.BASE_FORM',
              dataSet: formDs,
            },
            <Form
              dataSet={formDs}
              columns={3}
              className={!pageReadonly ? styles['form-wrapper'] : 'c7n-pro-vertical-form-display'}
              // disabled={currentTemplateStatus === 'RELEASED'}
              useWidthPercent
              labelLayout={pageReadonly ? 'vertical' : 'float'}
            >
              {getFormField()}
            </Form>
          )}
        </div>
        <div className={styles['tab-info-warp']}>
          <div className={styles['tab-info-title']}>
            {intl.get(`ssrc.inquiryHall.view.title.quoteDetailInfo`).d('报价明细信息')}
          </div>
          {moduleRule === 'SUB_MODULE' && (
            <div className={styles['tabs-tab']}>
              <Tabs
                // tabBarStyle={tabListStyle}
                className={classnames(
                  {
                    [styles['tabs-wrapper']]:
                      modelResult.templateStatus !== 'RELEASED' && !pageReadonly,
                  },
                  {
                    [styles['tabs-wrapper-detail']]:
                      modelResult.templateStatus === 'RELEASED' || pageReadonly,
                  }
                )}
                animated={false}
                tabPosition="left"
                tabBarStyle={{ paddingTop: '16px' }}
                activeKey={activeKey}
                onChange={handleKeyChange}
                tabBarExtraContent={tabsHeader}
              >
                {moduleList?.map?.((item) => (
                  <TabPane
                    tab={
                      <div className={styles['tabs-wrapper-title']}>
                        <div className={styles['tabs-wrapper-title-templateName']}>
                          {item.templateName}
                        </div>
                        <div>
                          {currentTemplateStatus === 'RELEASED' || pageReadonly ? null : (
                            <Popover
                              placement="bottomLeft"
                              content={renderModuleList(item)}
                              trigger="hover"
                            >
                              <Icon
                                onClick={handleClickMoreHoriz}
                                type="more_vert"
                                style={{ color: '#00000082', verticalAlign: 'text-top' }}
                              />
                            </Popover>
                          )}
                        </div>
                      </div>
                    }
                    key={item.templateId}
                  >
                    <TemplateIdContext.Provider value={item.templateId}>
                      <ModuleDetail
                        columnDs={columnDs}
                        itemDs={itemDs}
                        templateStatus={currentTemplateStatus}
                        moduleDetailRef={moduleDetailRef}
                        remote={remote}
                        pageReadonly={pageReadonly}
                        moduleInfo={item}
                        formDs={formDs}
                      />
                    </TemplateIdContext.Provider>
                  </TabPane>
                ))}
              </Tabs>
            </div>
          )}
          {moduleRule === 'NO_DISTINCTION' && (
            <div style={{ paddingLeft: '20px' }}>
              <TemplateIdContext.Provider value={params?.templateId}>
                <ModuleDetail
                  columnDs={columnDs}
                  itemDs={itemDs}
                  templateStatus={currentTemplateStatus}
                  moduleDetailRef={moduleDetailRef}
                  remote={remote}
                  pageReadonly={pageReadonly}
                  formDs={formDs}
                />
              </TemplateIdContext.Provider>
            </div>
          )}
        </div>
      </Content>
    </Fragment>
  );
};

export { TemplateIdContext };
export default compose(
  formatterCollections({
    code: ['ssrc.quotationTemplate', 'ssrc.inquiryHall', 'sscux.ssrc', 'ssrc.common'],
  }),
  observer,
  WithCustomizeC7N({
    unitCode: [
      'SSRC.QUOTATIONTEMPLATE_UPDATE.BASE_FORM',
      'SSRC.QUOTATIONTEMPLATE_UPDATE.HEADER_BUTTONS',
    ],
  }),
  remoteHoc({
    code: 'SSRC_QUOTATION_TEMPLATE_DETAIL',
    name: 'remote',
  })
)(Index);
