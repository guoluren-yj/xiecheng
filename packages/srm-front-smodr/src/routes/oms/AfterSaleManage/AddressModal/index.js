import React from 'react';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';
import { DataSet, Form, TextField, Select, CheckBox, Cascader, Lov } from 'choerodon-ui/pro';

import { getCurrentOrganizationId } from 'utils/utils';
import {
  fetchCode,
  fetchCityInfoService,
  fetchCountry,
} from '@/services/oms/afterSaleOrderService';
import { formDs } from './ds';

const organizationId = getCurrentOrganizationId();

export default class AddressModal extends React.Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    const { data } = props;
    this.state = {
      idds: [],
      countryId: undefined,
    };
    this.formDs = new DataSet(formDs());
    if (data) {
      this.formDs.create({ ...data, regionIdList: [data.fullAddress] });
    } else {
      this.formDs.create({ ...data, internationalTelCode: '+86' });
    }
  }

  componentDidMount() {
    fetchCode().then((res) => {
      this.setState({ idds: res });
    });
    fetchCountry().then((res) => {
      if (res) {
        this.setState({ countryId: res?.[0]?.countryId });
        this.optionDs.setQueryParameter('countryId', res?.[0]?.countryId);
        this.optionDs.query();
      }
    });
  }

  /**
   * 地区级联下拉框动态加载数据
   */
  @Bind()
  handleQueryCity(record) {
    const { countryId } = this.state;
    clearTimeout(this.loadCitiseTimer); // 清除定时器
    this.loadCitiseTimer = setTimeout(() => {
      fetchCityInfoService({ countryId, regionCode: record.get('regionCode') }).then((res) => {
        if (res) {
          if (!isEmpty(res?.content)) {
            const { content = [] } = res;
            this.optionDs.appendData(content);
          }
        }
      });
    }, 10);
  }

  optionDs = new DataSet({
    paging: false,
    autoQuery: false,
    idField: 'regionCode',
    parentField: 'parentRegionCode',
    fields: [
      { name: 'regionName', type: 'string' },
      { name: 'regionCode', type: 'string' },
      { name: 'regionId', type: 'string' },
    ],
    transport: {
      read({ data }) {
        const { parentRegionCode: regionCode, ...other } = data;
        return {
          url: `/smal/v1/mall-regions/${organizationId}/Subordinate`,
          method: 'GET',
          data: { page: -1, regionCode, ...other },
        };
      },
    },
  });

  render() {
    const { idds = [] } = this.state;
    return (
      <div>
        <Form dataSet={this.formDs} labelLayout="float">
          <Lov name="supplierCompanyLov" />
          <TextField name="contactName" />
          <div style={{ display: 'flex' }}>
            <div>
              <Select name="internationalTelCode" style={{ width: '150px', marginRight: 8 }}>
                {idds.map((m) => (
                  <Select.Option value={m.value} key={m.value} title={m.meaning}>
                    {m.meaning}
                  </Select.Option>
                ))}
              </Select>
            </div>
            <div>
              <TextField name="mobilePhone" style={{ width: '180px' }} />
            </div>
          </div>
          <TextField name="phone" />
          <Cascader
            async
            changeOnSelect
            name="regionIdList"
            menuMode="single"
            options={this.optionDs}
          />
          <TextField name="address" />
          <TextField name="postCode" />
          <CheckBox name="addressFlag" />
        </Form>
      </div>
    );
  }
}
