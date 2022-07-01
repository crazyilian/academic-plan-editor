const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: ['vuetify'],
  pluginOptions: {
    electronBuilder: {
      preload: 'src/preload.js',
      builderOptions: {
        appId: 'com.electron.academic-plan-editor',
        productName: "Редактор учебных планов",
        win: {
          target: "nsis",
          // icon: 'public/favicon.ico'
        },
        nsis: {
          oneClick: false,
          allowToChangeInstallationDirectory: true,
          allowElevation: false,
          artifactName: "Установщик - ${productName}.${ext}"
        },
        extraResources: [
          {
            "from": "./src/extraResources/",
            "to": "extraResources",
            "filter": [
              "**/*"
            ]
          }
        ]
      }
    }
  }
})