//这是项目开发阶段需要用到的babel插件
const prodPlugins = []
//如果不是开发模式就去除所有consloe
if (process.env.NODE_ENV === 'production') {
  prodPlugins.push('transform-remove-console')
}
module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    [
      'component',
      {
        libraryName: 'element-ui',
        styleLibraryName: 'theme-chalk'
      }
    ],
    //发布产品时候的插件数组
    ...prodPlugins
  ],

}
