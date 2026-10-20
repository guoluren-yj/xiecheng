import getConfig from './getConfig';

export default function getPluginConfig(client, pluginName, config) {
  return getConfig(client.config()?.plugins[pluginName], config);
}
