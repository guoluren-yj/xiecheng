import React, { useMemo, useState, useCallback } from 'react';
import { Header, Content } from 'components/Page';
import { DataSet, Button, Modal, Spin } from 'choerodon-ui/pro';
import { Tag, Alert } from 'choerodon-ui';
import SearchBarTable from '_components/SearchBarTable';
import { compose, isNil, isEmpty, isBoolean } from 'lodash';
import formatterCollections from 'utils/intl/formatterCollections';
import DynamicButtons from '_components/DynamicButtons';
import {
  queryCurrentSupplierCtgIsEnabled,
  disableSupplierCategory,
  enableSupplierCategory,
} from '@/services/supplierCategoryService';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { yesOrNoRender } from 'utils/renderer';
import CommonImport from 'components/Import';
import { SRM_SSLM } from '_utils/config';
import MultipleTextField from '@/routes/components/MultipleTextField';
import { getSupplierCategoryDS, getSupplierCategoryModalDS } from './stores/getSupplierCategoryDS';
import SupplierCategoryModal from './SupplierCategoryModal';
import './index.less';

const { confirm } = Modal;

const organizationId = getCurrentOrganizationId();

let searchBarRef = null;

const Index = ({ customizeTable, customizeForm, customizeBtnGroup }) => {
  const supplierCategoryDs = useMemo(() => new DataSet(getSupplierCategoryDS()), []);

  const [loading, setLoading] = useState(false);

  // 禁用供应商分类
  const handleDisableSupplierCategory = async record => {
    const categoryId = record.get('categoryId');
    const params = {
      categoryId,
    };
    queryCurrentSupplierCtgIsEnabled(params).then(checked => {
      const result = getResponse(checked);
      const isShow = result === false;
      if (isBoolean(result)) {
        confirm({
          title: intl.get('sslm.supplierCategory.view.title.info').d('提示'),
          className: 'confirmModal',
          children: (
            <div>
              {isShow && (
                <Alert
                  message={intl
                    .get('sslm.supplierCategory.view.title.supplerCtgCheckTip')
                    .d('仍有供应商启用该分类，请确认是否要禁用')}
                  type="warning"
                  iconType="info"
                  className="catefory-alert"
                  style={{
                    color: '#F06200',
                    marginBottom: 20,
                    border: 'none',
                    fontSize: 14,
                    fontWeight: 400,
                    width: '4.74rem',
                  }}
                  showIcon
                />
              )}
              <span style={{ fontSize: 12, fontWeight: 400, color: '#1d2129' }}>
                {intl
                  .get('sslm.supplierCategory.view.title.confirmDisable')
                  .d('禁用时，会将此分类及其下级分类一同禁用，确定禁用分类吗？')}
              </span>
            </div>
          ),
          onOk() {
            return disableSupplierCategory(params).then(res => {
              if (getResponse(res)) {
                supplierCategoryDs.query();
              }
            });
          },
        });
      }
    });
  };

  const handleEnableSupplierCategory = record => {
    const categoryId = record.get('categoryId');
    const params = {
      categoryId,
    };
    confirm({
      title: intl.get('sslm.supplierCategory.view.title.info').d('提示'),
      children: intl
        .get('sslm.supplierCategory.view.title.confirmEnable')
        .d('启用时，会将此分类及其下级分类一同启用，确定启用分类吗？'),
      onOk() {
        return enableSupplierCategory(params).then(() => {
          supplierCategoryDs.query();
        });
      },
    });
  };

  const operationCategory = (record, type, categoryDescription) => {
    const ModalDs = new DataSet(getSupplierCategoryModalDS(type));
    const title =
      type === 'newTop'
        ? intl.get('sslm.supplierCategory.view.button.addParentCategory').d('新建顶级分类')
        : type === 'edit'
        ? intl.get('sslm.supplierCategory.view.button.eidtParentCategory').d('编辑分类')
        : intl
            .get('sslm.supplierCategory.view.button.addLowerCategory', {
              categoryDescription,
            })
            .d(`新建【${categoryDescription}】下级分类`);
    ModalDs.create({
      ...record.toData(),
      tenantId: organizationId,
      parentCategoryId: record.get('parentCategoryId') || 0,
    });
    Modal.open({
      title,
      drawer: true,
      style: { width: 380 },
      okText: intl.get('hzero.common.button.sure').d('确定'),
      children: (
        <SupplierCategoryModal dataSet={ModalDs} customizeForm={customizeForm} type={type} />
      ),
      onOk: async () => {
        const flag = await ModalDs.current?.validate();
        if (!flag) {
          return false;
        }
        setLoading(true);
        return ModalDs.submit()
          .then(res => {
            if (getResponse(res)) {
              supplierCategoryDs.query();
            }
          })
          .finally(() => {
            setLoading(false);
          });
      },
      onCancel: () => {
        return type !== 'edit' ? supplierCategoryDs.delete(record, false) : true;
      },
    });
  };

  const columns = [
    {
      name: 'enabledFlag',
      renderer: ({ value }) =>
        !isNil(value) ? (
          <Tag style={{ border: 'none' }} color={+value === 1 ? 'green' : 'red'}>
            {+value === 1
              ? intl.get('sslm.supplierCategory.view.title.enable').d('启用')
              : intl.get('sslm.supplierCategory.view.title.disabled').d('禁用')}
          </Tag>
        ) : (
          '-'
        ),
    },
    {
      name: 'operation',
      title: intl.get('hzero.common.button.action').d('操作'),
      renderer: ({ record }) => {
        const { enabledFlag, doEnabledFlag } = record.get(['enabledFlag', 'doEnabledFlag']);
        return (
          <span className="action-link">
            {+enabledFlag === 1 && (
              <React.Fragment>
                <Button
                  funcType="link"
                  style={{ marginRight: 8 }}
                  onClick={() => operationCategory(record, 'edit')}
                >
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </Button>
                <Button
                  funcType="link"
                  style={{ marginRight: 8 }}
                  onClick={() =>
                    operationCategory(
                      supplierCategoryDs.create({
                        parentCategoryId: record.get('categoryId'),
                      }),
                      'newLower',
                      record.get('categoryDescription')
                    )
                  }
                  disabled={!record.get('childrenFlag')}
                >
                  {intl.get('sslm.supplierCategory.view.button.addChildren').d('新增下级')}
                </Button>
                <Button funcType="link" onClick={() => handleDisableSupplierCategory(record)}>
                  {intl.get('sslm.supplierCategory.view.button.disable').d('禁用')}
                </Button>
              </React.Fragment>
            )}
            {+enabledFlag === 0 &&
              (+doEnabledFlag === 1 ? (
                <Button funcType="link" onClick={() => handleEnableSupplierCategory(record)}>
                  {intl.get('sslm.supplierCategory.view.button.enable').d('启用')}
                </Button>
              ) : (
                '-'
              ))}
          </span>
        );
      },
    },
    {
      name: 'categoryCode',
    },
    {
      name: 'categoryDescription',
    },
    {
      name: 'multiFlag',
      renderer: ({ value, record }) =>
        !isNil(value) && +record.get('parentCategoryId') === 0 ? yesOrNoRender(value) : '-',
    },
    {
      name: 'introCategoryFlag',
      renderer: ({ value }) => (!isNil(value) ? yesOrNoRender(value) : '-'),
    },
    {
      name: 'synergyFlag',
      renderer: ({ value }) => (!isNil(value) ? yesOrNoRender(value) : '-'),
    },
  ];

  // 筛选器左侧渲染
  const renderLeftSearchBar = useCallback(queryDataSet => {
    return (
      <MultipleTextField
        dataSet={queryDataSet}
        name="categoryQuery"
        placeholder={intl
          .get('sslm.common.modal.sample.categoryQuery')
          .d('请输入供应商分类编码、供应商分类描述查询')}
      />
    );
  }, []);

  const handleQuery = ({ params }) => {
    if (supplierCategoryDs.queryDataSet?.current) {
      const clearParams = {}; // 清理
      const dataObj = supplierCategoryDs.queryDataSet.current.toData();
      if (dataObj) {
        for (const key in dataObj) {
          if (!['categoryQuery'].includes(key)) {
            // 排除掉自定义的查询条件
            if (!Object.prototype.hasOwnProperty.call(params, key)) {
              clearParams[key] = undefined;
            }
          }
        }
      }
      // 处理多单号
      const reqList = params.categoryQuery;
      clearParams.categoryQuery = isEmpty(reqList) ? null : reqList.join(',');
      supplierCategoryDs.queryDataSet.current.set({
        ...params,
        ...clearParams,
      });
      supplierCategoryDs.query();
    } else {
      searchBarRef.handleQuery(true); // 处理筛选器默认值不生效
    }
  };

  const buttons = [
    {
      btnComp: Button,
      name: 'newTop',
      btnProps: {
        icon: 'add',
        type: 'c7n-pro',
        color: 'primary',
        loading,
        onClick: () => {
          operationCategory(supplierCategoryDs.create({}, 0), 'newTop');
        },
      },
      child: intl.get('sslm.supplierCategory.view.button.addParentCategory').d('新建顶级分类'),
    },
    {
      btnComp: CommonImport,
      name: 'import',
      btnProps: {
        businessObjectTemplateCode: 'SRM_C_SRM_SSLM_SUPPLIER_CATEGORY_IMPORT',
        prefixPatch: SRM_SSLM,
        refreshButton: true,
        arg: { organizationId: getCurrentOrganizationId() },
        buttonText: intl.get('hzero.common.button.Import').d('导入'),
        successCallBack: () => {
          supplierCategoryDs.query();
        },
        buttonProps: {
          funcType: 'flat',
          permissionList: [
            {
              code: 'srm.partner.suplier-classify.define.new.api.improt.supplier.cate',
              type: 'button',
              meaning: '供应商分类配置-批量导入',
            },
          ],
        },
      },
    },
  ];

  return (
    <React.Fragment>
      <Header
        title={intl.get('sslm.supplierCategory.view.title.supplierAllocation').d('供应商分类配置')}
      >
        {customizeBtnGroup(
          {
            code: 'SSLM.SUPPLIER_CATEGORY_LIST_NEW.BTN_GROUP',
            pro: true,
          },
          <DynamicButtons buttons={buttons} />
        )}
      </Header>
      <Content className="supplierCategory-list">
        <Spin spinning={loading}>
          {customizeTable(
            {
              code: 'SSLM.SUPPLIER_CATEGORY_LIST_NEW.TABLE',
            },
            <SearchBarTable
              searchCode="SSLM.SUPPLIER_CATEGORY_LIST_NEW.SEARCH_TABLE"
              dataSet={supplierCategoryDs}
              mode="tree"
              defaultRowExpanded
              columns={columns}
              searchBarRef={ref => {
                searchBarRef = ref;
              }}
              searchBarConfig={{
                autoQuery: true,
                onQuery: handleQuery,
                left: {
                  render: (_, queryDataSet) => renderLeftSearchBar(queryDataSet),
                },
              }}
              style={{
                maxHeight: `calc(100vh - 186px)`,
              }}
            />
          )}
        </Spin>
      </Content>
    </React.Fragment>
  );
};

export default compose(
  formatterCollections({
    code: ['sslm.supplierCategory', 'sslm.common'],
  }),
  withCustomize({
    unitCode: [
      'SSLM.SUPPLIER_CATEGORY_LIST_NEW.SEARCH_TABLE',
      'SSLM.SUPPLIER_CATEGORY_LIST_NEW.TABLE',
      'SSLM.SUPPLIER_CATEGORY_LIST_NEW.BTN_GROUP',
      'SSLM.SUPPLIER_CATEGORY_LIST_NEW.MODAL_FORM',
    ],
  })
)(Index);
