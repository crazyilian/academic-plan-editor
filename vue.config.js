const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: ['vuetify'],
  pluginOptions: {
    electronBuilder: {
      preload: 'src/preload.js',
      builderOptions: {
        appId: 'com.electron.academic-plan-editor',
        productName: "Редактор учебных планов",
        copyright: "Copyright © 2022 Ilian Andrianov",
        win: {
          target: "nsis",
          icon: 'src/assets/icon.png'
        },
        nsis: {
          oneClick: false,
          allowToChangeInstallationDirectory: true,
          allowElevation: false,
          artifactName: "Установщик - ${productName} ${version} ${arch}.${ext}",
          perMachine: false,
        },
        extraResources: [
          {
            "from": "./src/extraResources/",
            "to": "extraResources",
            "filter": [
              "**/*"
            ]
          }
        ],
        fileAssociations: {
          ext: 'planeditor',
          name: 'Проект - Редактор учебных планов',
        }
      }
    }
  }
})
