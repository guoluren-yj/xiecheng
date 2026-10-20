import React from 'react';
import {
  Modal,
  Tooltip,
  Icon,
  Progress,
} from 'choerodon-ui/pro';
import { FormField, FormFieldProps } from 'choerodon-ui/pro/lib/field/FormField';
import EmbedPage from 'srm-front-boot/lib/components/EmbedPage';
import { getAttachmentUrl } from 'hzero-front/lib/utils/utils';
import intl from 'hzero-front/lib/utils/intl';
import 'choerodon-ui/pro/lib/number-field/style';
import { observer } from 'mobx-react';
import { computed, observable } from 'mobx';
import { getConfig } from 'choerodon-ui';
import { CtxParams } from '../../interfaces';
import { Cache } from '../../Customize';
import { ProgressType } from 'choerodon-ui/lib/progress/enum';
import { Size } from 'choerodon-ui/lib/_util/enum';
import { replace } from '../common';

type FlexLinkProps = {
  linkTitle?: string;
  linkHref?: string;
  linkNewWindow?: number | string;
  linkType?: string;
  modalWidth?: number;
  disabled?: boolean;
  ctxParams: CtxParams;
  bucketName?: string;
  unitCode?: string;
  onClick?: (e, setLoading: Function) => void;
  cache: { [x: string]: Cache };
};

@observer
export class FlexLink extends FormField<FlexLinkProps & FormFieldProps> {
  // eslint-disable-next-line camelcase
  static __IS_IN_CELL_EDITOR = true;

  static displayName = 'FlexLink';

  @observable
  loading = false;

  @computed
  get help() {
    return this.getProp('help');
  }

  @computed
  get custRecord() {
    if (this.record) return this.record;
    if (this.dataSet && this.dataSet.current) return this.dataSet.current;
    return undefined;
  }

  cacheBtnClickEvent?: { eventCode: string; callback: Function };

  modalOnClick = () => {
    const { linkHref, linkType = 'none', modalWidth = 600, ctxParams } = this.props;
    const pageData = { ctxParams, record: this.custRecord, dataSet: this.dataSet };
    let newHref = linkHref || '';
    const mappings = newHref.match(/{([^{}]*)}/g);

    if (mappings) {
      newHref = replace(mappings, newHref, ctxParams.ctx, this.custRecord);
    }

    Modal.open({
      closable: true,
      movable: false,
      drawer: linkType === 'drawer',
      key: Modal.key(),
      style: { width: modalWidth },
      footer: null,
      children: <EmbedPage href={newHref} pageData={pageData} />,
    });
  };

  innerClick = () => {
    const { linkHref, ctxParams } = this.props;
    let newHref = linkHref || '';
    const mappings = newHref.match(/{([^{}]*)}/g);
    if (mappings) {
      newHref = replace(mappings, newHref, ctxParams.ctx, this.custRecord);
    }
    const [uri, search] = newHref.split('?');
    (window as any).dvaApp._store.dispatch(
      (window as any).routerRedux.push({
        pathname: uri,
        search: search ? `?${search}` : undefined,
      })
    );
  };

  btnClick = () => {
    const setLoading = (loadingData = {}) => {
      this.loading = !!loadingData[this.name || ""];
    }
    if (this.cacheBtnClickEvent) {
      this.cacheBtnClickEvent.callback.call(
        undefined,
        this.props.cache,
        this.props.ctxParams,
        undefined,
        this.custRecord,
        {setLoading},
      );
    } else {
      const { unitCode = '', name } = this.props;
      const globalEventCollection = (window as any).CUSTEVENTCOLLECTION;
      if (globalEventCollection && globalEventCollection[unitCode]) {
        this.cacheBtnClickEvent = globalEventCollection[unitCode].find(
          (event) => event.eventCode === name
        );
        this.cacheBtnClickEvent &&
          this.cacheBtnClickEvent.callback.call(
            undefined,
            this.props.cache,
            this.props.ctxParams,
            undefined,
            this.custRecord,
            {setLoading}
          );
      }
    }
  };

  normalBtnClick = (e) => {
    const setLoading = (flag) => {
      this.loading = flag;
    }
    if (this.props.onClick) this.props.onClick(e, setLoading);
  }

  attachmentWarning = () => {
    Modal.warning(intl.get('hpfm.customize.common.noAttachmentUrl').d('附件URL不存在'));
  };

  render() {
    const { help } = this;
    const { ctxParams, bucketName, ...options } = this.props;
    const { linkTitle, linkHref, linkNewWindow, linkType = 'none' } = options;
    let newHref = linkHref || '';
    let newTitle = linkTitle || '';
    const mappings = newHref.match(/{([^{}]*)}/g);
    const titleMappings = newTitle.match(/{([^{}]*)}/g);

    if (mappings) {
      newHref = replace(mappings, newHref, ctxParams.ctx, this.custRecord);
    }
    if (titleMappings) {
      newTitle = replace(titleMappings, newTitle, ctxParams.ctx, this.custRecord);
    }
    const linkProps: any = {
      disabled: this.isDisabled() || this.loading,
      rel: 'noopener noreferrer',
      // eslint-disable-next-line no-script-url
      href: 'javascript:void(0)',
    };
    switch (linkType) {
      case 'drawer':
      case 'modal':
        linkProps.onClick = this.modalOnClick;
        break;
      case 'inner':
        linkProps.onClick = this.innerClick;
        break;
      case 'btn':
        linkProps.onClick = this.btnClick;
        break;
      case 'attachment':
        linkProps.target = '_blank';
        linkProps.download = true;
        if (!newHref) linkProps.onClick = this.attachmentWarning;
        else {
          linkProps.href = getAttachmentUrl(
            newHref,
            bucketName,
            ctxParams.ctx.organizationId,
            undefined,
            undefined
          );
        }
        break;
      case "normal-btn":
        linkProps.onClick = this.normalBtnClick;
        break;
      default:
        linkProps.target = linkNewWindow ? '_blank' : '_self';
        linkProps.href = newHref;
    }

    return (
      <>
        {this.loading && <Progress style={{ marginRight: 4 }} type={ProgressType.loading} size={Size.small} />}
        <a {...linkProps}>{newTitle}</a>
        {help && (
          <Tooltip
            title={help}
            openClassName={`${getConfig('proPrefixCls')}-tooltip-popup-help`}
            placement="bottom"
          >
            <Icon type="help" style={{ fontSize: '15px', verticalAlign: 'text-bottom' }} />
          </Tooltip>
        )}
      </>
    );
  }
}