import React, { useMemo, useEffect } from 'react';
import notification from 'utils/notification';
import { observer, Observer } from 'mobx-react-lite';
import { connect } from 'dva';
import defaultImg from '@/assets/sku_default.svg';

import intl from 'utils/intl';
import { openImport } from '@/utils/c7nModal';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import {
  DataSet,
  Form,
  DatePicker,
  Lov,
  Button,
  Output,
  NumberField,
  IntlField,
  Picture,
} from 'choerodon-ui/pro';

import ImportButton from 'components/Import';
import { openUnitTree } from '@/components/UnitTreeModal';
import { getCurrentOrganizationId } from 'utils/utils';
import { Icon, Tooltip } from 'choerodon-ui';
import { openSkuSelect } from '@/modals';
import moment from 'moment';
import { comboDs, productDs } from './ds';
import styles from './index.less';
import UploadCrop from '../MallHomeConfig/common/UploadCrop/index';

const tenantId = getCurrentOrganizationId();

const ComboModal = props => {
  const shoppingBarId = props.record?.get('shoppingBarId');
  const { modal, tableds, type, dispatch, path } = props;

  const comboDS = useMemo(() => {
    return new DataSet(comboDs(shoppingBarId));
  }, []);

  const productDS = useMemo(() => {
    return new DataSet(productDs(shoppingBarId, type));
  }, []);

  useEffect(() => {
    if (type !== 'create') {
      comboDS.query();
    }
  }, []);

  /* 添加商品 */
  const handleAddProducts = (data) => {
    const content = productDS.toData();
    const repeatFlag = content.some(c=> data.some(d=>d.skuId === c.productId));

    if (repeatFlag) {
      notification.warning({
        message: intl.get('small.packages.view.message.repeatAdd').d('请勿重复添加'),
      });
      return false;
    } else {
      /* 需要根据不同场景自行修改新建的字段 */
      data.forEach(p => {
        productDS.create({
          sourceType: p.sourceFrom,
          productNum: p.skuCode,
          productName: p.skuName,
          purchaseNumber: 1,
          supplierCompanyName: p.supplierCompanyName,
          supplierCompanyId: p.supplierCompanyId,
          productId: p.skuId,
        });
      });
    }
  };

  /* 商品信息columns渲染 */
  const renderColumns = () => {
    const columns = [
      {
        name: 'sourceType',
        renderer: ({ record }) =>
          record.get('sourceType') === 'CATA'
            ? intl.get('small.packages.modal.product.type').d('目录化')
            : intl.get('small.packages.modal.product.Ecommerce').d('电商'),
      },
      { name: 'supplierCompanyName' },
      { name: 'productNum' },
      { name: 'productName' },
      {
        name: 'purchaseNumber',
        align: 'left',
      },
    ];
    if (type !== 'readOnly') {
      columns.push({
        name: 'edit',
        align: 'center',
        renderer: ({ record }) => (
          <Button
            funcType="link"
            onClick={() =>
              record.status === 'add' ? productDS.remove(record) : productDS.delete(record)
            }
          >
            {intl.get('small.packages.table.edit.delete').d('删除')}
          </Button>
        ),
      });
      columns.splice(columns.findIndex(i => i.name === 'purchaseNumber'), 1, {
        name: 'purchaseNumber',
        editor: () => <NumberField name="purchaseNumber" />,
        align: 'left',
      });
    }
    return columns;
  };

  /* 保存信息 */
  modal.handleOk(async () => {
    const flag = await comboDS.validate();
    const productData = productDS.toData();
    if (flag) {
      for (let i = 0; i < productData.length; i++) {
        productData[i].shoppingBarId = shoppingBarId;
      }
      const data = comboDS.current.toData();
      dispatch({
        type: 'mallHomePlateManage/savePackage',
        payload: {
          ...data,
          startDate: data.startDate && moment(data.startDate).format('YYYY-MM-DD 00:00:00'),
          endDate: data.endDate && moment(data.endDate).format('YYYY-MM-DD 23:59:59'),
          tenantId,
          groupAttribute: 0,
          enabledFlag: type === 'create' ? 1 : 0,
          shoppingBarLineList: productData || [],
        },
      }).then(res => {
        if (res && !res.failed) {
          notification.success();
          tableds.query();
        }
      });
    } else {
      return false;
    }
  });

  /**
   * 通用导入
   */
  const handleImport = () => {
    openImport(
      {
        afterClose: () => productDS.query(),
      },
      {
        key: '/small/data-import/SMAL.SHOPPING_BAR_IMPORT',
        code: 'SMAL.SHOPPING_BAR_IMPORT',
        args: { shoppingBarId },
      }
    );
  };

  /* 商品信息删除 */
  const DeleteBtn = observer(({ dataSet }) => {
    const disabled = dataSet.selected.length === 0;
    return (
      <Button
        color="default"
        icon="delete"
        funcType="flat"
        onClick={() => productDS.delete(productDS.selected)}
        disabled={disabled}
      >
        {intl.get('small.packages.button.delete').d('删除')}
      </Button>
    );
  });

  const imageLabel = (
    <>
      <span className='attachment-label'>{intl.get('small.packages.view.packageImage').d('采购套餐主图')}</span>
      <Tooltip title={intl.get('small.packages.view.packageImageHelp').d('若需要套餐主图在标题栏展示，则可上传主图')}>
        <Icon type='help' className='attachment-help' style={{ fontSize: 14}} />
      </Tooltip>
    </>
  );
  const RenderUpload = observer(({ dataSet }) => {
    return (
      <UploadCrop
        name="imagePath"
        title={intl.get('small.packages.view.packageImage').d('采购套餐主图')}
        help={intl.get('small.packages.view.packageImageHelp').d('若需要套餐主图在标题栏展示，则可上传主图')}
        showHelp='tooltip'
        required={false}
        width={800}
        height={800}
        imgUrl={dataSet?.current.get('imagePath')}
        handleOk={(data) => {
          dataSet.current.set('imagePath', data?.url);
        }}
        className="upload-crop"
      />
    );
  });

  return (
    <div className={styles['combo-info']}>
      <div className="basic-info">
        <div className="info-tab">
          <div className="divider" />
          <span className="desc">
            {intl.get('small.packages.create.modal.basic.info').d('基本信息')}
          </span>
        </div>
        <Observer>
          {()=>(
            <Form
              dataSet={comboDS}
              columns={3}
              labelLayout={type !== 'readOnly' ? 'float' : 'vertical'}
              className={type === 'readOnly' ? 'c7n-pro-vertical-form-display' : ''}
            >
              {type !== 'readOnly' ? (
                <>
                  <IntlField name="shoppingBarName" />
                  <DatePicker name="validityDate" />
                  <RenderUpload dataSet={comboDS} rowSpan={4} />
                  <Lov
                    name="pageConfigAuthList"
                    colSpan={2}
                    onClick={() => {
                    openUnitTree({
                      record: comboDS?.current,
                      name: 'pageConfigAuthList',
                      siggle: false,
                    });
                  }}
                  />
                  <IntlField colSpan={2} name="description" resize="vertival" type="multipleLine" />
                </>
            ) : (
              <>
                <Output name="shoppingBarName" />
                <Output name="validityDate" />
                <Picture label={imageLabel} name="imagePath" src={comboDS?.current?.get('imagePath') || defaultImg} width={74} height={74} rowSpan={4} />
                <Output name="pageConfigAuthList" />
                <Output name="description" />
              </>
            )}
            </Form>
          )}
        </Observer>
      </div>
      <div className="product-info">
        <div className="info-tab">
          <div className="divider" />
          <span className="desc">
            {intl.get('small.packages.create.modal.product.info').d('商品信息')}
          </span>
        </div>
        <div style={{ height: 'calc(100vh - 260px)' }}>
          <SearchBarTable
            columns={renderColumns()}
            dataSet={productDS}
            searchCode="SMAL_PACKAGE_MANAGE.SEARCH_BAR"
            searchBarConfig={{
              closeFilterSelector: true,
            }}
            buttons={[
              <Button
                color="primary"
                funcType="flat"
                icon="archive-o"
                onClick={() => handleImport()}
                disabled={type === 'create'}
              >
                {intl.get('small.common.button.import').d('导入')}
              </Button>,
              <ImportButton
                businessObjectTemplateCode="SMAL.SHOPPING_BAR_IMPORT"
                refreshButton
                buttonText={intl.get('small.common.button.importNew').d('(新)导入')}
                prefixPatch="/smal"
                args={{ shoppingBarId }}
                successCallBack={() => productDS.query()}
                buttonProps={{
                  icon: 'archive',
                  color: 'primary',
                  funcType: 'flat',
                  permissionList: [
                    {
                      code: `${path}.button.import-new`,
                      type: 'button',
                      meaning: '采购套餐管理-(新)导入',
                    },
                  ],
                }}
              />,
              <Button
                color="primary"
                funcType="flat"
                icon="playlist_add"
                onClick={() => openSkuSelect({ onOk: handleAddProducts, queryParams: { purSkuStatus: 1, shelfFlag: null } })}
              >
                {intl.get('small.packages.button.new.create').d('新增')}
              </Button>,
              <DeleteBtn dataSet={productDS} />,
            ]}
            style={{ maxHeight: `calc(100% - 22px)` }}
          />
        </div>
      </div>
    </div>
  );
};

export default connect(({ mallHomelateManage }) => ({
  mallHomelateManage,
}))(ComboModal);
