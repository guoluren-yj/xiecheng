/* eslint-disable eqeqeq */
import React from 'react';
import {
  Form,
  TextField,
  Select,
  Lov,
  DataSet,
  DatePicker,
  Button,
  Modal,
  IntlField,
  Dropdown,
  Menu,
  Icon,
} from 'choerodon-ui/pro';
import moment from 'moment';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import { DATETIME_MAX, DATETIME_MIN } from 'utils/constants';
import { observer } from 'mobx-react-lite';

import { Button as PermissionButton } from 'components/Permission';
import { useModal } from 'components/Import';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
import SearchBarTable from '_components/SearchBarTable';
import formatterCollections from 'utils/intl/formatterCollections';
import { openCatalogTree } from '@/components/UnitTreeModal';
import {
  saveProductGroup,
  fetchProductRange,
  setProductTopping,
} from '@/services/productRecommendedService';
import tagA from '@/assets/MallHomeConfig/tagA.png';
import tagB from '@/assets/MallHomeConfig/tagB.png';
import tagC from '@/assets/MallHomeConfig/tagC.png';
import { openImport } from '@/utils/c7nModal';
import { openSkuSelect } from '@/modals';

import QuickAdd from './QuickAdd';
// import MultipleSelectionLov from './MultipleSelectionLov';
import ColorConfig from './ColorConfig';

import { modalDs, skuDs } from './modalDs';
import styles from './index.less';

const CurrentTable = observer(({ dataSet, skuTableDs, isEdit, path, handleAddProducts }) => {

  const handleTopping = record => {
    setProductTopping(record?.data).then(() => {
      skuTableDs.query();
    });
    // skuTableDs.save(record);
  };

  const columns = [
    // { name: 'serialNumber' },
    { name: 'productNum' },
    { name: 'productName' },
    { name: 'supplierCompanyName' },
    {
      name: 'operation',
      width: 100,
      renderer: ({ record: recordData }) =>
        recordData?.status !== 'add' &&
          +dataSet?.get('orderType') === 4 ? (
          <Button funcType="link" color="primary" onClick={() => handleTopping(recordData)}>
            {intl.get('small.ProRecommend.view.toTop').d('置顶')}
          </Button>
        ) : '-',
    },
  ];

  const fetchProductList = (params = {}) => {
    skuTableDs.setQueryParameter('groupType', '0');
    skuTableDs.setQueryParameter('groupId', dataSet.get('groupId'));
    skuTableDs.setQueryParameter('filterParams', { ...params });
    skuTableDs.setQueryParameter('customizeUnitCode', 'SMAL.PRODUCT_GROUP_ASSIGN.SEARCH_BAR');
    if (isEdit) {
      skuTableDs.query(undefined, undefined, true);
    }
  };

  // 快速添加
  const openQuickAdd = () => {
    Modal.open({
      destroyOnClose: true,
      title: intl.get('small.ProRecommend.model.quickAdd').d('快速添加'),
      mask: true,
      closable: true,
      drawer: true,
      style: {
        width: 380,
      },
      children: <QuickAdd groupId={dataSet.get('groupId')} handleOk={() => fetchProductList()} />,
    });
  };

  /**
   * 通用导入
   */
  function handleImport() {
    openImport(
      {
        afterClose: () => skuTableDs.query(),
      },
      {
        key: '/small/data-import/SMAL.PRODUCT_GROUP_IMPORT',
        code: 'SMAL.PRODUCT_GROUP_IMPORT',
        args: { groupId: dataSet.get('groupId') },
      }
    );
  }

  // 批量删除
  function handleDeleteProducts() {
    const addFlag = skuTableDs.selected.every(r => r.status === 'add');
    if (addFlag) {
      skuTableDs.remove(skuTableDs.selected);
    } else {
      skuTableDs.delete(skuTableDs.selected, {
        title: intl.get('small.common.model.tips').d('提示'),
        children: intl.get('hzero.c7nProUI.DataSet.delete_selected_row_confirm').d("确认删除选中行？"),
      });
    }
  }

  const menu = (
    <Menu>
      {isEdit && (
        <Menu.Item className="recommend-import">
          <PermissionButton
            type="text"
            funcType="link"
            permissionList={[
              {
                code: `small.product-recommended.list.button.import`,
                type: 'button',
                meaning: '商品推荐列表自由组合商品-导入',
              },
            ]}
            onClick={() => handleImport()}
          >
            {intl.get('small.common.button.import').d('导入')}
          </PermissionButton>
        </Menu.Item>
      )}
      {isEdit && (
        <Menu.Item className="recommend-import">
          <PermissionButton
            type="text"
            funcType="link"
            permissionList={[
              {
                code: `${path}.button.import-new`,
                type: 'button',
                meaning: '商品推荐列表-(新)导入',
              },
            ]}
            onClick={() => {
              const modal = useModal().openModal({
                businessObjectTemplateCode: 'SMAL.PRODUCT_GROUP_IMPORT',
                refreshButton: true,
                prefixPatch: '/smal',
                successCallBack: () => {
                  skuTableDs.query();
                  modal.close();
                },
                args: { groupId: dataSet.get('groupId') },
                buttonProps: {
                  icon: '',
                  funcType: 'flat',
                  type: 'text',
                },
              });
            }}
          >
            {intl.get('small.common.button.importNew').d('(新)导入')}
          </PermissionButton>
        </Menu.Item>
      )}
      {isEdit && (
        <Menu.Item onClick={() => openQuickAdd()}>
          {intl.get('small.ProRecommend.model.quickAdd').d('快速添加')}
        </Menu.Item>
      )}
      <Menu.Item
        onClick={() =>
          openSkuSelect({
            onOk: handleAddProducts,
            queryParams: {
              channel: dataSet.get('groupAttribute') === '1' ? 'PERSONAL' : 'ENTERPRISE',
            },
          })
        }
      >
        {intl.get('small.ProRecommend.model.Add').d('添加')}
      </Menu.Item>
    </Menu>
  );
  const buttons = [
    <Dropdown overlay={isEdit ? menu : null}>
      <Button
        funcType="flat"
        color="primary"
        icon="playlist_add"
        onClick={() => {
          if (isEdit) return;
          openSkuSelect({
            onOk: handleAddProducts,
            queryParams: {
              channel: dataSet.get('groupAttribute') === '1' ? 'PERSONAL' : 'ENTERPRISE',
            },
          });
        }}
      >
        <span>
          {isEdit
            ? intl.get('hzero.common.button.add').d('新增')
            : intl.get('small.ProRecommend.model.Add').d('添加')}
        </span>
        {isEdit && <Icon style={{ fontSize: 18 }} type="expand_more" />}
      </Button>
    </Dropdown>,
    <Button
      icon="delete_sweep"
      color="primary"
      funcType="flat"
      disabled={skuTableDs.selected.length < 1}
      onClick={() => handleDeleteProducts()}
    >
      {intl.get('hzero.common.button.batchDelete').d('批量删除')}
    </Button>,
  ];
  return (
    <>
      {dataSet?.get('groupType') === '0' && (
        <>
          <div className="modal-sku-info">
            {intl.get('small.ProRecommend.model.skuInfo').d('商品信息')}
          </div>
          <SearchBarTable
            dataSet={skuTableDs}
            columns={columns}
            queryBar="none"
            searchCode="SMAL.PRODUCT_GROUP_ASSIGN.SEARCH_BAR"
            searchBarConfig={{
              closeFilterSelector: true,
              onQuery: params => fetchProductList(params),
            }}
            buttons={buttons}
            style={{ maxHeight: 552 }}
          />
        </>
      )}
    </>
  );
});

const CurrentForm = observer(({ dataSet, currenModalDs }) => {
  if (dataSet?.get('groupType') === '4') {
    return (
      <>
        <div className="modal-sku-info">
          {intl.get('small.ProRecommend.model.ruleSet').d('规则设置')}
        </div>
        <Form dataSet={currenModalDs} labelLayout="float" columns={2}>
          <Select
            name="orderType"
            optionsFilter={r => {
              if ([4].includes(+r.get('value'))) {
                if (+dataSet?.get('groupType') === 0) {
                  return true;
                } else {
                  return false;
                }
              } else {
                return true;
              }
            }}
          />
          <Select name="tagFlag" />
          {+dataSet.get('tagFlag') === 1 && (
            <>
              <TextField name="tagName" />
              <Select
                name="tagStyle"
                showHelp="tooltip"
                help={(
                  <div style={{ display: 'flex' }}>
                    <div style={{ marginRight: 20 }}>
                      <p>{intl.get('small.common.view.all.juzhong').d('顶部居中')}</p>
                      <img style={{ width: 48, height: 70, display: 'initial' }} src={tagA} alt="" />
                    </div>
                    <div style={{ marginRight: 20 }}>
                      <p>{intl.get('small.common.view.icon.juzuo').d('顶部居左')}</p>
                      <img style={{ width: 48, height: 70, display: 'initial' }} src={tagB} alt="" />
                    </div>
                    <div>
                      <p>{intl.get('small.common.view.icon.dibu').d('底部对齐')}</p>
                      <img style={{ width: 48, height: 70, display: 'initial' }} src={tagC} alt="" />
                    </div>
                  </div>
                )}
              />
            </>
          )}
        </Form>
        {+dataSet.get('tagFlag') === 1 && (
          <>
            <div className="modal-tag-color">
              {intl.get('small.ProRecommend.model.tagColor').d('标签颜色')}
            </div>
            <ColorConfig
              colorCode={dataSet.get('tagColor')}
              changeColor={code => dataSet.set('tagColor', code)}
            />
          </>
        )}
      </>
    );
  } else if ([0, 1, 2, 5, 6, 7, 8].includes(+dataSet?.get('groupType'))) {
    return (
      <>
        <div className="modal-sku-info">
          {intl.get('small.ProRecommend.model.ruleSet').d('规则设置')}
        </div>
        <Form dataSet={currenModalDs} labelLayout="float" columns={2}>
          <Select
            name="orderType"
            optionsFilter={r => {
              if ([4].includes(+r.get('value'))) {
                if (+dataSet?.get('groupType') === 0) {
                  return true;
                } else {
                  return false;
                }
              } else {
                return true;
              }
            }}
          />
        </Form>
      </>
    );
  }
});

const AllFrom = observer(({ dataSet, groupType, productRecommendedRemote }) => {
  const typeMappingOrigin = {
    0: 'skuRange',
    1: 'suppiler',
    2: 'catalog',
    3: 'salesRank',
    4: 'active',
    5: 'active',
    6: 'active',
    7: 'active',
    8: 'label',
  };
  const typeMapping = productRecommendedRemote?.process('SMAll_PRODUCT-RECOMMENDED_CUXTYPEMAP', typeMappingOrigin, { typeMappingOrigin, dataSet, groupType });
  return (
    <Form dataSet={dataSet} labelLayout="float" columns={2}>
      <IntlField name="groupName" />
      <Select name="groupAttribute" onChange={() => dataSet.current.set('groupType', '')} />
      <Select
        name="groupType"
        onChange={() => {
          dataSet.current.set('tagFlag', null);
          dataSet.current.set('tagStyle', null);
          dataSet.current.set('orderType', null);
          dataSet.current.set('active', null);
        }}
      >
        {(dataSet.current.get('groupAttribute') == '0'
          ? groupType?.filter(p => ![4].includes(+p.value))
          : groupType?.filter(p => ![5, 6, 7].includes(+p.value))
        )?.map(g => {
          return <Select.Option value={g.value}>{g.meaning}</Select.Option>;
        })}
      </Select>
      {dataSet.current.get('groupType') == 3 ? (
        <Select name={typeMapping[dataSet.current.get('groupType')]} />
      ) : (
        <Lov
          noCache
          name={
            dataSet.current.get('groupType')
              ? typeMapping[dataSet.current.get('groupType')]
              : 'skuRange'
          }
          onClick={() => {
            if (typeMapping[dataSet.current.get('groupType')] === 'catalog') {
              openCatalogTree({
                name: 'catalog',
                record: dataSet.current,
                whole: false,
                title: intl.get('small.common.model.selectCatalog').d('选择目录'),
              });
            }
          }}
        />
      )}
      <DatePicker name="validityDate" />
      {dataSet.current.get('groupType') && dataSet.current.get('groupType') != 3 && (
        <Select name="includeNoStockFlag" />
      )}
    </Form>
  );
});

// const ProductModal = observer(({ groupAttribute, onRef, handleAddProducts, visible, setVisible = e => e }) => {
//   return (
//     <>
//       <MultipleSelectionLov
//         rowKey="skuId"
//         onRef={onRef}
//         visible={visible}
//         setVisible={setVisible}
//         handleAddProducts={products => handleAddProducts(products)}
//         groupAttribute={groupAttribute.get('groupAttribute') === '1' ? 'PERSONAL' : 'ENTERPRISE'}
//       />
//     </>
//   );
// });

@formatterCollections({
  code: ['small.ProRecommend'],
})
@connect(({ productRecommended }) => ({ productRecommended }))
export default class ListModal extends React.PureComponent {
  initData(allData, ds) {
    const data = allData;
    if (
      data.endDate &&
      this.props.resetFlag &&
      moment(data.endDate).isBefore(moment().format('YYYY-MM-DD'))
    ) {
      data.endDate = '';
      data.enabledFlag = 1;
    }
    ds.loadData([
      {
        ...data,
      },
    ]);
  }

  constructor(props) {
    super(props);
    const { record, modal } = props;
    this.modalDs = new DataSet(modalDs({ isEdit: !!props.record }));
    this.skuDs = new DataSet(skuDs());
    this.state = {
      isCreate: !record,
      // visible: false,
    };
    if (record) {
      this.initData(record.toData(), this.modalDs);
    } else {
      this.modalDs.create({ enabledFlag: 1 });
    }
    modal.handleOk(() => {
      return this.handleOk();
    });
    modal.update({
      footer: (_, cancelBtn) => {
        return (
          <>
            <Button
              color="primary"
              waitType="throttle"
              wait={500}
              onClick={() => this.handleOk()}
            >
              {intl.get('small.common.modal.button.save').d('保存')}
            </Button>
            <Button
              waitType="throttle"
              wait={500}
              onClick={() => this.handleOk(true)}
            >
              {intl.get('small.common.modal.button.saveAndClose').d('保存并关闭')}
            </Button>
            {cancelBtn}
          </>
        );
      },
    });
  }

  mtpLovRecord;

  componentDidMount() {
    if (this.props.record && this.props.record?.get('groupType') !== '0') {
      this.getProductRange();
    }
  }

  @Bind()
  async getProductRange() {
    const groupType = this.modalDs.current.get('groupType');
    this.skuDs.setQueryParameter('groupId', this.modalDs.current.get('groupId'));
    const res = getResponse(
      await fetchProductRange({
        groupType,
        groupId: this.modalDs.current.get('groupId'),
        page: -1,
      })
    );
    if (groupType == 1) {
      // 供应商
      this.modalDs.current.set(
        'suppiler',
        res?.content?.map(p => ({
          ...p,
          supplierId: p.supplierCompanyId,
          supplierName: p.supplierCompanyName,
        })) || []
      );
    } else if (groupType == 2) {
      // 目录
      this.modalDs.current.set('catalog', res?.content || []);
    } else if (groupType == 3) {
      this.modalDs.current.set('salesRank', res?.content?.find(p => !!p.salesRank)?.salesRank);
    } else if ([4, 5, 6, 7].includes(+groupType)) {
      this.modalDs.current.set(
        'active',
        res?.content?.map(p => {
          if (+groupType === 4) {
            return {
              ...p,
              agreementHeaderId: p.activityId,
              agreementHeaderName: p.activityName,
            };
          } else {
            return {
              ...p,
              agreementHeaderId: p.agreementId,
              agreementHeaderName: p.agreementName,
            };
          }
        }) || []
      );
    } else if (groupType == 8) {
      // 标签
      this.modalDs.current.set('label', res?.content || []);
    }
  }

  @Bind()
  async handleOk(close = false) {
    const flag = await this.modalDs.validate();
    if (flag) {
      const originData = this.modalDs.current.toData() || {};
      const data = {
        ...originData,
        endDate: originData.endDate ? moment(originData.endDate).format(DATETIME_MAX) : null,
        startDate: moment(originData.startDate).format(DATETIME_MIN),
      };
      const { belongType, unitId, okCallBack = e => e } = this.props;
      const saveData = {
        ...data,
        belongType,
        unitId,
        includeNoStockFlag: data.groupType === 3 ? 1 : data.includeNoStockFlag,
      };
      if (data.groupType === '2') {
        saveData.productGroupAssignList = (data.catalog || []).map(cata => {
          return { catalogId: cata.catalogId };
        });
      } else if (data.groupType === '1') {
        saveData.productGroupAssignList = (data.suppiler || []).map(s => {
          return { supplierCompanyId: s.supplierId || s.supplierCompanyId, supplierTenantId: s.supplierTenantId };
        });
      } else if (data.groupType === '3') {
        saveData.productGroupAssignList = [{ salesRank: data.salesRank }];
      } else if (data.groupType === '0') {
        saveData.productGroupAssignList = this.skuDs.toData();
      } else if ([4, 5, 6, 7].includes(+data.groupType)) {
        saveData.productGroupAssignList = (data.active || []).map(s => {
          return +data.groupType === 4
            ? { activityId: s.agreementHeaderId }
            : { agreementId: s.agreementHeaderId, agreementNum: s.agreementHeaderNum };
        });
      } else if (data.groupType === '8') {
        saveData.productGroupAssignList = (data.label || []).map(n => {
          const { labelId, labelName, labelCode } = n;
          return { labelId, labelName, labelCode };
        });
      }
      const res = getResponse(await saveProductGroup(saveData));
      if (res) {
        this.skuDs.paging = true;
        this.initData(res, this.modalDs);
        if (data.groupType === '0') {
          this.skuDs.loadData(res.productGroupAssignList);
        }
        this.setState({
          isCreate: false,
        });
        if (data.groupType !== '0') {
          await this.getProductRange();
        }
        okCallBack();
        notification.success();
      }
      if (res ? close : false) {
        this.props.modal.close();
      }
    } else {
      const data = this.modalDs.current.toData();
      if (!data.startDate) {
        notification.warning({
          message: intl.get('small.common.view.inputValidateFrom').d('请输入有效期从'),
        });
      }
    }
  }

  @Bind()
  handleDelete() { }

  @Bind()
  handleAddProducts(products) {
    const content = this.skuDs.toData();
    const skuIds = products.map(n => n.skuId);
    const repeatFlag = content.some(n => skuIds.includes(n.skuId || n.productId));
    if (repeatFlag) {
      notification.warning({
        message: intl.get('small.common.view.message.repeatAdd').d('请勿重复添加'),
      });
      return false;
    } else {
      products.forEach(product => {
        this.skuDs.create({
          ...product,
          productId: product.skuId,
          productNum: product.skuCode,
          productName: product.skuName,
        }, 0);
      });
    }
  }

  render() {
    const {
      productRecommended: {
        lovBatch: { groupType },
      },
      productRecommendedRemote,
    } = this.props;
    return (
      <div className={styles['list-modal-content']}>
        <AllFrom dataSet={this.modalDs} groupType={groupType} productRecommendedRemote={productRecommendedRemote} />
        <CurrentTable
          path={this.props.path}
          isEdit={!!this.props.record || !this.state.isCreate}
          dataSet={this.modalDs.current}
          skuTableDs={this.skuDs}
          mtpLovRecord={this.mtpLovRecord}
          handleAddProducts={this.handleAddProducts}
        />
        <CurrentForm
          groupType={groupType}
          dataSet={this.modalDs.current}
          currenModalDs={this.modalDs}
        />
        {/* <ProductModal
          groupAttribute={this.modalDs.current}
          onRef={(ref = {}) => {
            this.mtpLovRecord = ref;
          }}
          visible={this.state.visible}
          setVisible={vis => this.setState({ visible: vis })}
          handleAddProducts={products => this.handleAddProducts(products)}
        /> */}
        {/* <MultipleSelectionLov
          rowKey="skuId"
          onRef={(ref = {}) => {
            this.mtpLovRecord = ref;
          }}
          handleAddProducts={products => this.handleAddProducts(products)}
          dataSet={this.modalDs.current}
        /> */}
      </div>
    );
  }
}
