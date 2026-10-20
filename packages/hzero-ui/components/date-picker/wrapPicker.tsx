import * as React from 'react';
import enUS from 'choerodon-ui/lib/date-picker/locale/en_US';
import LocaleReceiver from '../locale-provider/LocaleReceiver';

export default function wrapPicker(Picker: React.ComponentClass<any>): any {
  return class PickerWrapper extends React.Component<any, any> {
    static defaultProps = {
      locale: {},
    };

    getDefaultLocale = () => {
      const result = {
        ...enUS,
        ...this.props.locale,
      };
      result.lang = {
        ...result.lang,
        ...(this.props.locale || {}).lang,
      };
      return result;
    };

    renderPicker = (locale: any, localeCode: string) => {
      const { props } = this;

      return (
        <Picker
          {...props}
          locale={locale}
          localeCode={localeCode}
        />
      );
    };

    render() {
      return (
        <LocaleReceiver
          componentName="DatePicker"
          defaultLocale={this.getDefaultLocale}
        >
          {this.renderPicker}
        </LocaleReceiver>
      );
    }
  };
}
