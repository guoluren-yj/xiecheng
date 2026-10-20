/**
 * Address - 地址
 * @date: 2022-03-26
 * @author: 杨一昊 <yihao.yang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import { Cascader } from 'choerodon-ui';
import { isEmpty, last, isArray } from 'lodash';
import React, {
  useState,
  useCallback,
  useEffect,
  forwardRef,
  useImperativeHandle,
  Fragment,
} from 'react';
import { Table, TextField, Icon } from 'choerodon-ui/pro';

import { getResponse } from 'utils/utils';
import { yesOrNoRender } from 'utils/renderer';
import intl from 'utils/intl';

import { loadCityData } from '@/services/supplierEntryService';
import { fetchLovData } from '@/services/commonService';
import styles from './index.less';

const AddressInfo = forwardRef(
  (
    {
      dataSet,
      isEdit: editFlag,
      companyBaseInfo = {},
      businessInfoDs,
      custLoading,
      customizeUnitCode = '',
      customizeTable = () => {},
      disabledObj,
    },
    ref
  ) => {
    const { allDisabled } = disabledObj;
    const isEdit = editFlag && !allDisabled;
    // 存储省市区
    const [cityData, setCityData] = useState([]);
    const {
      registeredCountryCode,
      registeredCountryId,
      registeredCountryName,
      regionPathName: companyRegionPathName,
      registeredRegionId,
      addressDetail: companyAddressDetail,
      domesticForeignRelation,
    } = companyBaseInfo;

    const [addressData, setAddressData] = useState({});
    const domesticFg = Number(domesticForeignRelation);
    const handleQueryCityAddress = domesticFlag => {
      // 境内个人需默认带值中国
      let firstData = {};
      fetchLovData().then(lovData => {
        if (getResponse(lovData)) {
          if (lovData && isArray(lovData.content)) {
            const content = lovData.content[0] || {};
            firstData = {
              countryCode: content.countryCode,
              countryId: content.countryId,
              countryName: content.countryName,
            };
            // 新注册带出注册时的企业信息
            setAddressData(domesticFlag ? firstData : {});
          }
        }
      });
    };
    // 初始化查询地区第一级
    const fetchProvinceCity = record => {
      setCityData([]);
      const countryId = record.get('countryId');
      loadCityData({ countryId }).then(response => {
        const res = getResponse(response);
        if (res) {
          const newCityData = res.map(n => {
            const { regionId, regionName } = n;
            return {
              ...n,
              label: regionName,
              value: regionId,
              isLeaf: false,
            };
          });
          setCityData(newCityData);
        }
      });
    };

    // 地区级联下拉框动态加载数据
    const handleQueryCity = useCallback(
      selectedOptions => {
        const lastOption = selectedOptions[selectedOptions.length - 1] || [];
        const { countryId, regionId } = lastOption;
        lastOption.loading = true;
        loadCityData({ countryId, regionId }).then(response => {
          const res = getResponse(response);
          if (res) {
            lastOption.loading = false;
            // 是否是最后一级地区
            if (!isEmpty(res)) {
              const newCityData = res.map(n => {
                const { regionId: newRegionId, regionName } = n;
                const isLeaf = !!Number(n.isLeaf);
                return {
                  ...n,
                  label: regionName,
                  value: newRegionId,
                  isLeaf,
                };
              });
              lastOption.children = newCityData;
            }
            setCityData(preCityData => [...preCityData]);
          }
        });
      },
      [cityData]
    );

    // 选择地区拼接
    const handleSelectRegion = (value = [], selectedOptions = [], record) => {
      const regionList = selectedOptions.map(region => {
        const { regionName } = region;
        return regionName;
      });
      const region = regionList.join('|');
      const regionId = last(value);
      const lastRecord = last(selectedOptions);
      const { isLeaf } = lastRecord || {};
      record.set('isLeaf', isLeaf);
      record.set('regionId', regionId);
      record.set('regionPathName', region);
    };

    // 省市区级联后缀
    const handleCascader = (record, disabledProp) => {
      return (
        <Cascader
          onClick={() => fetchProvinceCity(record)}
          changeOnSelect
          showSearch={false}
          style={{ width: '100%' }}
          options={cityData}
          disabled={disabledProp}
          onChange={(value, selectedOptions) => handleSelectRegion(value, selectedOptions, record)}
          loadData={selectedOptions => handleQueryCity(selectedOptions)}
        >
          <Icon type="expand_more" className="regist-icon" />
        </Cascader>
      );
    };

    const handleQuery = useCallback(() => {
      return dataSet.query().then(res => {
        if (isEmpty(res)) {
          dataSet.loadData([]);
          // 可变可编辑时并且没有合作伙伴关系才默认新建一行
          if (isEdit) {
            // 区分个人和其他注册方式
            if (businessInfoDs && isEmpty(businessInfoDs.current?.get('serviceType'))) {
              dataSet.create({
                countryId: registeredCountryId,
                countryCode: registeredCountryCode,
                countryName: registeredCountryName,
                regionId: registeredRegionId,
                regionPathName: companyRegionPathName,
                addressDetail: companyAddressDetail,
              });
            }
          }
        }
      });
    }, [dataSet, companyBaseInfo, businessInfoDs]);

    useImperativeHandle(ref, () => ({
      handleQuery,
    }));

    useEffect(() => {
      handleQueryCityAddress(domesticFg);
      handleQuery();
    }, [dataSet, domesticFg]);

    const columns = [
      {
        name: 'countryObj',
        width: 150,
        editor: isEdit,
      },
      {
        name: 'regionPathName',
        width: 240,
        className: styles['region-td'],
        // eslint-disable-next-line no-shadow
        renderer: ({ record, dataSet }) => {
          const {
            data: { regionPathName },
          } = record;
          const disabledProp = dataSet.getField('regionPathName')?.disabled || false;
          return isEdit ? (
            <TextField
              value={regionPathName}
              readOnly
              disabled={disabledProp}
              addonAfter={handleCascader(record, disabledProp)}
            />
          ) : (
            regionPathName
          );
        },
      },
      {
        name: 'addressDetail',
        editor: isEdit,
      },
      {
        name: 'postCode',
        width: 150,
        // editor: isEdit && <TextField restrict="0-9" maxLength={6} />,
        editor: isEdit && <TextField />,
      },
      {
        name: 'description',
        width: 200,
        editor: isEdit,
      },
      {
        name: 'enabledFlag',
        width: 100,
        editor: isEdit,
        renderer: ({ value }) => yesOrNoRender(value),
      },
    ];
    const buttons = isEdit
      ? [
          [
            'add',
            {
              afterClick: () => {
                const obj = {
                  ...addressData,
                  enabledFlag: 1,
                };

                if (domesticFg === 1) {
                  dataSet.current.set(obj);
                }
              },
            },
          ],
          [
            'delete',
            {
              onClick: () =>
                dataSet.delete(dataSet.selected, {
                  title: intl.get('hzero.common.message.confirm.title').d('提示'),
                  children: intl
                    .get('spfm.supplierRegister.view.message.deleteConfirm')
                    .d('确认删除选中行？'),
                }),
            },
          ],
        ]
      : [];
    return (
      <Fragment>
        {customizeTable(
          {
            code: customizeUnitCode,
          },
          <Table
            custLoading={custLoading}
            dataSet={dataSet}
            columns={columns}
            buttons={buttons}
            selectionMode={isEdit ? 'rowbox' : 'click'}
          />
        )}
      </Fragment>
    );
  }
);

export default AddressInfo;
