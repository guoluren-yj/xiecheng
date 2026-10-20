import React, { Fragment, useMemo } from 'react';
import { Table, DataSet, Modal, Select } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import { isEmpty, compose, isArray, noop } from 'lodash';

import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import remote from 'hzero-front/lib/utils/remote';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import DynamicButtons from '_components/DynamicButtons';
import MutlTextFieldSearch from '@/routes/ssrc/components/MutlTextFieldSearch';

import {
  releaseTemplate,
  unlockTemplate,
  addMaterial,
  queryAssignCategory,
} from '@/services/quotationTemplateNewService';
import { tableDS, categoryTableDS } from './store.js';
import Material from './Material';
import style from './index.less';

const promptCode = 'ssrc.quotationTemplate';

const Index = (props) => {
  const { customizeTable = noop, history, processRemote } = props;

  const organizationId = getCurrentOrganizationId();

  // 保存品类
  const handleOkCategory = (templateId, templateDimension) => {
    const filterData = categoryTableDs.filter((record) => {
      return record.getState('dirty');
    });
    const quotationDimensionList = filterData?.map((item) => ({
      ...item.toData(),
      deleteFlag: item.isSelected ? 0 : 1,
    }));
    if (isEmpty(quotationDimensionList)) return;
    const params = {
      templateId,
      quotationDimensionType: templateDimension,
      quotationDimensionList,
    };
    return addMaterial(params).then((res) => {
      const result = getResponse(res);
      if (result && !result.failed) {
        categoryTableDs.queryDataSet.current.reset();
        notification.success();
      }
    });
  };

  const tableDs = useMemo(() => new DataSet(tableDS()), []);
  const categoryTableDs = new DataSet(categoryTableDS(handleOkCategory));

  // 保存
  // const handleSave = async () => {
  //   const validateFlag = await tableDs.validate();
  //   if (!validateFlag) {
  //     return false;
  //   }

  //   await tableDs.submit();
  //   tableDs.query();
  // };

  // 发布
  const handleRelease = async (record) => {
    if (await record.validate()) {
      const data = record.toData();
      const param = {
        query: {
          customizeUnitCode: getCustomizeUnitCode('table'),
        },
        data,
      };
      releaseTemplate(param).then((res) => {
        const result = getResponse(res);
        if (result && !result.failed) {
          notification.success();
          tableDs.query();
        }
      });
    }
  };

  // 解锁
  // const handleUnlock = (record) => {
  //   const data = {
  //     templateId: record.get('templateId'),
  //     query: {
  //       customizeUnitCode: getCustomizeUnitCode('table'),
  //     },
  //   };
  //   unlockTemplate(data).then((res) => {
  //     const result = getResponse(res);
  //     if (result && !result.failed) {
  //       history.push({
  //         pathname: `/ssrc/new-quotation-template/detail/${result.templateId}`,
  //       });
  //     }
  //   });
  // };

  // 新增
  const handleAdd = () => {
    // const record = tableDs.create({}, 0);
    // record.setState('editing', true);
    history.push({
      pathname: `/ssrc/new-quotation-template/update`,
    });
  };

  // 详情
  const handleTemplateDetail = (record) => {
    const templateId = record.get('templateId');
    const search = "?viewFlag=1";
    history.push({
      pathname: `/ssrc/new-quotation-template/detail/${templateId}`,
      search,
    });
  };

  // 编辑
  const handleEdit = (record, search = "") => {
    const templateStatus = record.get('templateStatus');
    const templateId = record.get('templateId');
    if (!templateId) {
      return;
    }

    if(templateStatus === 'RELEASED'){
      const data = {
        templateId,
        query: {
          customizeUnitCode: getCustomizeUnitCode('table'),
        },
      };
      unlockTemplate(data).then((res) => {
        const result = getResponse(res);
        if (result && !result.failed) {
          history.push({
            pathname: `/ssrc/new-quotation-template/detail/${result.templateId}`,
            search,
          });
        }
      });
      return;
    }

    history.push({
      pathname: `/ssrc/new-quotation-template/detail/${templateId}`,
      search,
    });
  };

  // 取消编辑
  const handleReset = (record) => {
    record.reset();
    record.setState('editing', false);
  };

  // 新建取消
  const handleCancel = (record) => {
    tableDs.remove(record);
  };

  const changeModuleRule = (value, _, record) => {
    if (record.status !== 'add') {
      if (value !== record.get('moduleRule')) {
        return Modal.confirm({
          title: intl
            .get(`${promptCode}.view.tips.moduleRuleChange`)
            .d('切换模板规则后，将清空原有报价明细列、行配置，是否继续？'),
          onOk: () => true,
          onCancel: () => {
            Modal.destroyAll();
            return false;
          },
        });
      }
    }
  };

  // 异步加载子集数据
  const handleLoadData = ({ record, dataSet }) => {
    const { key, children } = record;
    const params = {
      ...(dataSet?.queryParameter?.params || {}),
      parentItemCategoryId: key,
    };
    return new Promise((resolve) => {
      if (!children) {
        queryAssignCategory(params)
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

  const getCustomizeUnitCode = (type) => {
    if (!type || isEmpty(type)) {
      return null;
    }

    const codeMap = new Map([
      ['table', 'SSRC.QUOTATION_TEMPLATE_LIST.TABLE'], // 报价行表格
      ['tableSearch', 'SSRC.QUOTATION_TEMPLATE_LIST.LINE_FILTER'], // 筛选器
    ]);

    let currentUnitCode = null;

    if (typeof type === 'string') {
      currentUnitCode = codeMap.get(type);
    }

    if (isArray(type)) {
      const codeSet = new Set();
      type.forEach((unitCode) => {
        codeSet.add(codeMap.get(unitCode));
      });

      currentUnitCode = codeSet.size ? [...codeSet].join(',') : null;
    }

    return currentUnitCode;
  };

  // const handleChange = (ds, value) => {
  //   const searchValue = value
  //     ? value.map((ele) => ele.trim().replace(/\s+/g, ',')).join(',')
  //     : undefined;

  //   console.log(
  //     ds.queryDataSet,
  //     value,
  //   );
  //   categoryTableDs.setQueryParameter('multiTemplateNameAndNum', searchValue);
  // };

  // 左边多选框渲染
  const leftInput = (ds) => {
    return (
      <MutlTextFieldSearch
        searchBarDS={ds}
        name="multiTemplateNameAndNum"
        placeholder={intl.get('ssrc.quotationTemplate.model.title.pleaseInputTemplateNumName').d('请输入报价模板编码、名称查询')}
        // onChange={handleChange}
      />
    );
  };

  const clearQueryParameter = () => {
    tableDs.setQueryParameter('multiTemplateNameAndNum', '');
  };

  // 分配适用品类
  const handleAssignCategory = (record) => {
    const categoryProps = {
      templateId: record.get('templateId'),
      templateCode: record.get('templateNum'),
      templateStatus: record.get('templateStatus'),
      templateDimension: record.get('templateDimension'),
      customizeUnitCode: getCustomizeUnitCode('table'),
    };
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
      className: style.table,
      treeLoadData: handleLoadData,
    };
    const tableProps = props.processRemote
      ? props.processRemote.process(
          'SSRC_QUOTATION_TEMPLATE_PROCESS_ASSIGN_TABLE_PROPS',
          preTableProps,
          {}
        )
      : preTableProps;
    Modal.open({
      title: intl.get(`${promptCode}.model.title.assignCategory`).d('分配适用品类'),
      key: Modal.key(),
      children: <Table {...tableProps} />,
      closable: true,
      okProps: {
        disabled: record.get('templateStatus') === 'RELEASED',
      },
      onCancel: () => {
        categoryTableDs.queryDataSet.current.reset();
      },
      onOk: () => handleOkCategory(record.get('templateId'), record.get('templateDimension')),
      afterClose: () => categoryTableDs.loadData([]),
      style: {
        width: '800px',
      },
    });
  };

  // 分配适用物料
  const handleAssignMaterial = (record) => {
    const materialProps = {
      templateId: record.get('templateId'),
      templateCode: record.get('templateNum'),
      templateStatus: record.get('templateStatus'),
      templateDimension: record.get('templateDimension'),
    };
    Modal.open({
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


  // 获取状态标签颜色
  const getTagColor = (record) => {
    const templateStatus = record.get('templateStatus');
    switch (templateStatus) {
      case 'NEW':
      case 'UPDATED':
        return 'yellow';
      case 'RELEASED':
        return 'green';
      default:
        return '';
    }
  };

  const columns = useMemo(
    () => [
      {
        name: 'templateNum',
        width: 140,
        // editor: (record) => record.status === 'add',
        renderer: ({ value, record }) => {
          if (!value) {
            return "";
          }

          return (
            <a onClick={() => handleTemplateDetail(record)}>
              {value}
            </a>
          );
        },
      },
      {
        name: 'templateName',
        // editor: (record) => record.getState('editing'),
      },
      {
        name: 'templateDimension',
        width: 140,
        // editor: (record) => record.getState('editing'),
      },
      {
        name: 'moduleRule',
        width: 140,
        // editor: (record) =>
        //   record.getState('editing') && (
        //     <Select
        //       name="moduleRule"
        //       record={record}
        //       clearButton={false}
        //       onBeforeChange={(value, oldValue) => changeModuleRule(value, oldValue, record)}
        //     />
        //   ),
        editor: false,
        renderer: ({ record }) => {
          const moduleRuleMeaning = record.get('moduleRuleMeaning') || "";
          return moduleRuleMeaning;
        },
      },
      {
        name: 'versionNumber',
        width: 100,
        align: 'right',
      },
      {
        name: 'templateStatusMeaning',
        width: 140,
        renderer: ({ value, record }) => (
          <Tag color={getTagColor(record)} style={{ border: 'none' }}>
            {value}
          </Tag>
        ),
      },
      // {
      //   header: intl.get(`${promptCode}.model.template.assignOperation`).d('分配适用品类或物料'),
      //   name: 'distribute',
      //   width: 140,
      //   renderer: ({ record }) => {
      //     if (record.get('versionNumber')) {
      //       // to do 拿到后台返回的数据并非最新数据
      //       if (record.getPristineValue('templateDimension') === 'ITEM_CATEGORY') {
      //         return (
      //           <a onClick={() => handleAssignCategory(record)}>
      //             {intl.get(`${promptCode}.model.template.assignCategory`).d('分配适用品类')}
      //           </a>
      //         );
      //       } else if (record.getPristineValue('templateDimension')) {
      //         return (
      //           <a onClick={() => handleAssignMaterial(record)}>
      //             {intl.get(`${promptCode}.model.template.assignMaterial`).d('分配适用物料')}
      //           </a>
      //         );
      //       }
      //     }
      //   },
      // },
      // {
      //   header: intl.get(`${promptCode}.model.template.detail`).d('明细'),
      //   width: 80,
      //   name: 'detail',
      //   renderer: ({ record }) =>
      //     record.get('versionNumber') && (
      //       <a onClick={() => handleTemplateDetail(record.get('templateId'))}>
      //         {intl.get(`${promptCode}.model.template.detail`).d('明细')}
      //       </a>
      //     ),
      // },
      {
        header: intl.get('hzero.common.button.action').d('操作'),
        name: 'operate',
        width: 140,
        renderer: ({ record }) => {

          return (
            <Fragment>
              <a style={{ marginRight: 8 }} onClick={() => handleEdit(record)}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
              {/* {templateStatus !== 'RELEASED' && (
                <a style={{ marginRight: 8 }} onClick={() => handleEdit(record)}>
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </a>
              )} */}
              {/* {versionNumber && (
                <a style={{ marginRight: 8 }} onClick={() => handleReset(record)}>
                  {intl.get('hzero.common.button.cancel').d('取消')}
                </a>
              )} */}
              {/* {(templateStatus === 'NEW' ||
                templateStatus === 'UPDATED') && (
                <Fragment>
                  <a onClick={() => handleRelease(record)}>
                    {intl.get('hzero.common.button.release').d('发布')}
                  </a>
                </Fragment>
              )}
              {templateStatus === 'RELEASED' && (
                <Fragment>
                  <a onClick={() => handleUnlock(record)}>
                    {intl.get(`${promptCode}.view.button.unlock`).d('解锁')}
                  </a>
                </Fragment>
              )} */}
              {/* {record.status === 'add' && (
                <a onClick={() => handleCancel(record)}>
                  {intl.get('hzero.common.button.cancel').d('取消')}
                </a>
              )} */}
            </Fragment>
          );
        },
      },
    ],
    []
  );

  // 按钮
  const getHeaderButtons = () => {
    let button = [
      {
        name: 'create',
        btnType: 'c7n-pro',
        child: intl.get('hzero.common.button.create').d('新建'),
        btnProps: {
          color: 'primary',
          icon: 'add',
          onClick: handleAdd,
        },
      },
    ];

    button = processRemote
      ? processRemote.process(
          'SSRC_QUOTATION_TEMPLATE_PROCESS_ASSIGN_HEADER_BUTTONS',
          button,
          {
            pageProps: props,
            categoryTableDs,
            tableDs,
            getCustomizeUnitCode,
          }
        )
      : button;

    

    return button;
  };

  const tableSearchQuery = ({ params }) => {
    tableDs.setQueryParameter('searchBar', params);
    tableDs.query();
  };

  return (
    <Fragment>
      <Header title={intl.get(`${promptCode}.view.title.quoteTemplateDefinen`).d('报价模板定义')}>
        {/* <Button color="primary" icon="add" onClick={handleAdd}>
          {intl.get('hzero.common.button.create').d('新建')}
        </Button> */}
        <DynamicButtons
          trigger="hover"
          // maxNum={7}
          buttons={getHeaderButtons()}
          defaultBtnType="c7n-pro"
        />
        {/* <Button icon="save" funcType="flat" onClick={handleSave}>
          {intl.get('hzero.common.button.save').d('保存')}
        </Button> */}
      </Header>
      <Content>
        {customizeTable(
          { code: getCustomizeUnitCode('table') },
          <SearchBarTable
            searchCode={getCustomizeUnitCode('tableSearch')}
            queryBar="none"
            dataSet={tableDs}
            columns={columns}
            style={{ maxHeight: 'calc(100vh - 200px)' }}
            clearButton
            // searchBarRef={setCurrentSearchBarRef}
            onQuery={tableSearchQuery}
            fieldProps={{}}
            showLoading={false}
            searchBarConfig={{
              autoQuery: true,
              // closeFilterSelector: true, // 不能切换筛选 和新建筛选了
              // defaultExpand: false,
              onQuery: tableSearchQuery,
              // editorProps: {
              //   organizationId: organizationId,
              // },
              left: {
                render: (_, ds) => leftInput(ds),
              },
              onReset: clearQueryParameter,
              onClear: clearQueryParameter,
              fieldProps: {
                multiTemplateNameAndNum: {
                  multiple: ',',
                },
                itemIds: {
                  lovPara: {
                    tenantId: organizationId,
                  },
                },
                itemCategoryIds: {
                  lovPara: {
                    tenantId: organizationId,
                  },
                },
              },
            }}
            virtual
            virtualCell
          />
        )}
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: ['ssrc.quotationTemplate', 'sscux.ssrc'],
  }),
  withCustomize({
    unitCode: ['SSRC.QUOTATION_TEMPLATE_LIST.TABLE', 'SSRC.QUOTATION_TEMPLATE_LIST.LINE_FILTER'],
  }),
  remote({
    code: 'SSRC_QUOTATION_TEMPLATE',
    name: 'processRemote',
  })
)(Index);
