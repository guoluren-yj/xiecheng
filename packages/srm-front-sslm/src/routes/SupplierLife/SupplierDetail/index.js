/**
 * SupplierDetail - 供应商360度查询
 * @date: 2018-08-20
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { connect } from 'dva';
import SupplierDetail from '../../SupplierDetail/SupplierDetail';

/**
 * 供应商360度查询
 * @extends {Component} - React.Component
 * @reactProps {Object} supplierDetail - 数据源
 * @reactProps {Object} [history={}]
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@connect(({ supplierDetailByManage, loading }) => ({
  supplierDetailByManage,
  modelName: 'supplierDetailByManage',
  detailByManageLoading:
    loading.effects[`supplierDetailByManage/fetchCompanyInfo`] ||
    loading.effects[`supplierDetailByManage/fetchSupplierInfo`] ||
    loading.effects[`supplierDetailByManage/fetchSupplierLifeCycle`] ||
    loading.effects[`supplierDetailByManage/fetchCatalog`] ||
    loading.effects[`supplierDetailByManage/editedInfo`] ||
    loading.effects[`supplierDetailByManage/fetchPurchaseList`] ||
    loading.effects[`supplierDetailByManage/fetchAddressList`],
  detailByManageOuListLoading: loading.effects[`supplierDetailByManage/fetchOuList`],
  buttonLoading: loading.effects[`supplierDetailByManage/fetchPurchaseFormList`],
  queryOtherLoading: loading.effects[`supplierDetailByManage/fetchOtherInfo`],
  fetchCompanyIdReserveLoading: loading.effects[`supplierDetailByManage/fetchCompanyIdReserve`],
  printLoading: loading.effects[`supplierDetailByManage/handlePrint`],
}))
export default class Main extends SupplierDetail {}
