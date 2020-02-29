<template>
  <div id="q-app" class="row" style="height: 100vh">
    <webview 
      :src="oConfig.sWebViewURL" 
      class="full-height full-width" 
      disablewebsecurity 
       
      v-if="!bAuthed"
      _webpreferences="webSecurity=false, devTools=true"
    /><!-- nodeintegration -->
    <template v-else>
      <q-splitter
        v-model="oConfig.iSplitterSize"
        style=""
        class="full-height full-width"
        vertical
      >
        <template v-slot:before>
          <div class="col column full-height">
          <div class="col-auto row">
            <q-input
              dense
              filled
              class="col" 
              v-model="oConfig.sListFilter" 
              type="text" 
              label="Filter..." 
            />
            <q-btn-toggle
              v-model="oConfig.bEnableListFilter"
              dense
              clearable
              spread
              no-caps
              square
              unelevated
              filled
              toggle-color="primary"
              color="white"
              text-color="black"
              title="Filter"
              :options="[
                {value: true, icon: 'filter_list'},
              ]"
            ></q-btn-toggle>
            <q-btn-toggle
              v-model="oConfig.bReverseSort"
              dense
              clearable
              spread
              no-caps
              square
              unelevated
              filled
              toggle-color="primary"
              color="white"
              text-color="black"
              title="Reverse sort"
              :options="[
                {value: true, icon: 'sort'},
              ]"
            ></q-btn-toggle>
            <q-btn-toggle
              v-model="oConfig.bShowGrouped"
              dense
              clearable
              spread
              no-caps
              square
              unelevated
              filled
              toggle-color="primary"
              color="white"
              text-color="black"
              title="Show grouped"
              :options="[
                {value: true, icon: 'group_work'},
              ]"
            ></q-btn-toggle>
            <q-btn-toggle
              v-model="oConfig.bEnableAutoUpdate"
              dense
              clearable
              spread
              no-caps
              square
              unelevated
              filled
              toggle-color="primary"
              color="white"
              text-color="black"
              title="Show grouped"
              :options="[
                {value: true, icon: 'av_timer'},
              ]"
            ></q-btn-toggle>
            <q-btn
              dense
              flat
              color="" 
              icon="refresh"
              @click="fnUpdateList"
            ></q-btn>
            <q-btn
              dense
              flat
              color="" 
              icon="more_vert"
            >
              <q-menu persistent auto-close>
                <q-list style="min-width: 100px">
                  <q-item clickable @click="fnExportListToJSON">
                    <q-item-section>Export to JSON</q-item-section>
                  </q-item>
                  <q-item clickable @click="fnSaveAllPages">
                    <q-item-section>Save all pages</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>
          <!-- hr class="col-auto" -->
          <div class="col column full-width">
            <!-- Grouped list -->
            <q-virtual-scroll
              v-if="oConfig.bShowGrouped"
              style=""
              class="col full-width"
              :items="aFilteredDomainsList"
              separator
            >
              <template v-slot="{ item, index }">
                <q-item
                  :key="index"
                  clickable 
                  v-ripple
                  dense
                  :active="oConfig.iSelectedDomain==index"
                  active-class="bg-primary text-white"
                  @click="oConfig.iSelectedDomain=index"
                >
                  <q-item-section avatar>
                    <img :src="aFavIconList[index]" width="32">
                  </q-item-section>

                  <q-item-section>
                    <q-item-label>
                      {{ item }}
                    </q-item-label>  
                  </q-item-section>

                  <q-item-section side right>
                    <q-badge color="primary" :label="aGroupedLists[index].length" />
                  </q-item-section>
                </q-item>
              </template>
            </q-virtual-scroll>
            <!--hr class="col-auto"-->
            <q-virtual-scroll
              v-if="oConfig.bShowGrouped && ~oConfig.iSelectedDomain"
              style=""
              class="col full-width"
              :items="aFilteredGroupedLists"
              separator
            >
              <template v-slot="{ item, index }">
                <q-item
                  :key="index"
                  clickable 
                  v-ripple
                  dense
                  :active="oConfig.sSelectedItemID==item.item_id"
                  active-class="bg-primary text-white"
                  @click="fnSelectItem(item)"
                >
                  <q-item-section caption side left>
                    {{ item.sAddedDateTime }}
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>
                      {{ item.sTitle }}
                    </q-item-label>
                    <q-item-label caption>
                      {{ item.sURL }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-virtual-scroll>
            <div 
              v-if="oConfig.bShowGrouped && !~oConfig.iSelectedDomain"
              class="col full-width bg-grey-2"
              style="align-items: center; justify-content: center; justify-items: center;display: flex;color: #555;font-size: 25px;"
            >
              No group selected
            </div>

            <!-- List -->
            <q-virtual-scroll
              v-if="!oConfig.bShowGrouped"
              class="full-height full-width"
              style=""
              :items="aFilteredList"
              bordered 
              separator
            >
              <template v-slot="{ item, index }">
                <q-item
                  :key="index"
                  clickable 
                  v-ripple
                  dense
                  :active="oConfig.sSelectedItemID==item.item_id"
                  active-class="bg-primary text-white"
                  @click="fnSelectItem(item)"
                >
                  <q-item-section caption side left>
                    {{ item.sAddedDateTime }}
                  </q-item-section>
                  <q-item-section avatar>
                    <img :src="item.sFavIcon" width="32">
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>
                      {{ item.sTitle }}
                    </q-item-label>
                    <q-item-label caption>
                      {{ item.sURL }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-virtual-scroll>
          </div>
          <div class="col-auto column bg-grey-2">
            <div class="col-auto q-pa-sm text-grey-9">
              {{ aFilteredList.length }} / {{ aList.length }}
            </div>
            <div class="col">

            </div>
          </div>
          <q-inner-loading :showing="oConfig.bListIsLoading">
            <q-spinner-gears size="50px" color="primary" />
          </q-inner-loading>   
          </div>       
        </template>
        <template v-slot:after>
          <div
            v-if="oSelectedItem && oSelectedItem.sURL" 
            class="col column full-height"
          >
            <div class="col-auto row">
              <q-input
                dense
                v-model="oSelectedItem.sURL" 
                readonly 
                class="col"
                type="text" 
                label="URL" 
              />
              <q-btn
                dense
                flat
                color="" 
                icon="refresh"
                @click="fnReload"
              ></q-btn>
              <q-btn
                dense
                flat
                color="" 
                icon="assignment_returned"
                @click="fnCopyToClipboard(oSelectedItem.sURL)"
              ></q-btn>
            </div>
            
            <webview 
              ref="webview"
              :src="oSelectedItem.sURL" 
              class="col full-height full-width"
            ></webview> 
          </div>
        </template>
      </q-splitter>
    </template>
    <vue-audio
      ref="vue_audio"
      :file="sSoundPath"
    />
  </div>
</template>

<style>
.q-item, .q-item * {
  overflow: hidden;
  text-overflow: ellipsis;
}
.text-white * {
  color: white !important;
}
</style>

<script>
import { clipboard, remote } from 'electron';

const path = require('path');
const fs = require('fs');
const axios = require('axios');
import Vue from 'vue';

import moment from 'moment'

const getFavicons = require('get-website-favicon')

const { $err, $log } = require('./lib/log');
const { fnSaveToJSONFile } = require('./lib/utils');

const oAPIKeys = require('./config/api_keys.json');

import GetPocketAPI from './lib/get_pocket_api';

import VueAudio from './components/VueAudio.vue';
 
var config = {
    consumer_key: oAPIKeys["Desktop (other)"],
    redirect_uri: ''
};

var oAPI = null;

import { Notify } from 'quasar'

import {Howl, Howler} from 'howler';

// import { rootPath } from 'electron-root-path';

const appPath = process.env.NODE_ENV === 'production' ? app.getAppPath() : path.join(__dirname, '..');

// $log("appPath", appPath, [__dirname, '..']);

// fs.readdir(appPath, function (err, files) { $log('files', files); });

var sSoundPath = path.join(appPath, 'src/statics/sounds/Freesound -  320655__rhodesmas__level-up-01.mp3'); 

// $log('__dirname', __dirname);
// $log('appPath', appPath, fs.existsSync(appPath));
// $log('sSoundPath', sSoundPath, fs.existsSync(sSoundPath), appPath, fs.existsSync(appPath));

var oSound = new Howl({
  src: [sSoundPath]
});

// throw new Error();

/**
 * { "item_id": "2886683991", "resolved_id": "2886683991", "given_url": "https://eyegod.info/", "given_title": "", "favorite": "0", "status": "0", "time_added": "1581862949", "time_updated": "1581862951", "time_read": "0", "time_favorited": "0", "sort_id": 7, "resolved_title": "Телеграм бот Глаз Бога.", "resolved_url": "https://eyegod.info/", "excerpt": "Поиск информации Телеграм Бот \"Eye Of God\" поможет найти человека по фото, по номеру телефона найти его владельца, узнать кто является держателем банковской карты и его", "is_article": "0", "is_index": "1", "has_video": "1", "has_image": "1", "word_count": "93", "lang": "", "listen_duration_estimate": 36 }
 */

export default {
  name: 'App',

  components: {
    'vue-audio': VueAudio
  },

  data()
  {
    return {
      // oList: {},
      aList: [],
      aDomainsList: [],
      aGroupedLists: [],
      aFavIconList: [],
      oDomainFavIcons: {},

      sSoundPath,

      bAuthed: false,

      oSelectedItem: null,

      oConfig: {
        iSplitterSize: 30,

        bEnableAutoUpdate: true,

        sListFilter: "",
        bEnableListFilter: false,
        bReverseSort: false,
        bShowGrouped: false,

        bListIsLoading: false,

        iSelectedDomain: -1,
        // iSelectedIndex: -1,
        sSelectedItemID: "",

        sWebViewURL: "",

        oUser: {
          sUserName: "",
          sPassword: ""
        }
      }
    };
  },

  computed: {
    aFilteredList()
    {
      var oThis = this;

      var aList = oThis.aList.slice();

      if (oThis.oConfig.bEnableListFilter) {
        aList = aList.filter((v) => !!~v.sTitle.indexOf(oThis.oConfig.sListFilter) );
      }

      if (oThis.oConfig.bReverseSort) {
        aList = aList.reverse();
      }

      return aList;
    },
    aFilteredGroupedLists()
    {
      var oThis = this;
      var aSelectedGroup = oThis.aGroupedLists[oThis.oConfig.iSelectedDomain];

      if (!aSelectedGroup) {
        return;
      }

      var aGroup = aSelectedGroup.slice();

      if (oThis.oConfig.bEnableListFilter) {
        aGroup = aGroup.filter((v) => !!~v.sTitle.indexOf(oThis.oConfig.sListFilter) );
      }

      if (oThis.oConfig.bReverseSort) {
        aGroup = aGroup.reverse();
      }

      return aGroup;
    },
    aFilteredDomainsList()
    {
      var oThis = this;

      var aDomainsList = oThis.aDomainsList.slice();

      if (oThis.oConfig.bEnableListFilter) {
        aDomainsList = aDomainsList.filter((v) => !!~v.indexOf(oThis.oConfig.sListFilter) );
      }

      if (oThis.oConfig.bReverseSort) {
        aDomainsList = aDomainsList.reverse();
      }

      return aDomainsList;
    }
  },

  watch: {
    oConfig: {
      get() {
        var oThis = this;

        oThis.fnSaveConfig();
      }
    }
  },

  methods: {

    fnPlayAudioSignal()
    {
      $log('fnPlayAudioSignal', oSound);
      // oSound.play();

      var oThis = this;

      oThis.$refs.vue_audio.play();
    },

    fnSelectItem(oItem)
    {
      var oThis = this;

      oThis.oConfig.sSelectedItemID = oItem.item_id;
      oThis.oSelectedItem = oItem;
    },

    fnReload()
    {
      var oThis = this;

      oThis.$refs.webview.reload();
    },

    fnCopyToClipboard(sString)
    {
      var oThis = this;

      clipboard.writeText(sString);

      oTHis.fnShowNotification('URL copied to clipboard');
    },

    async fnAutoUpdate(bOnlyStartAutoUpdate = false)
    {
      $log('fnAutoUpdate', {bOnlyStartAutoUpdate});
      var oThis = this;

      if (oThis.oConfig.bEnableAutoUpdate && !bOnlyStartAutoUpdate) {
        await oThis.fnUpdateList();
        oThis.fnExportListToJSON();
      }

      setTimeout(oThis.fnAutoUpdate, 60000);
    },
   
    fnExportListToJSON()
    {
      $log('fnExportListToJSON');
      var oThis = this;

      fnSaveToJSONFile("list.json", oThis.aFilteredList);

      oThis.fnShowNotification("Saved to list.json");
    },

    fnSaveAllPages()
    {

    },

    async fnUpdateList()
    {
      var oThis = this;

      $log('fnUpdateList >> before auth');

      if (!oThis.bAuthed) {
        await oThis.fnAuth();
      }

      $log('fnUpdateList >> after auth');

      oThis.oConfig.bListIsLoading = true;

      try {
        oThis.oConfig.bListIsLoading = false;

        var { 
          aList,
          aDomainsList,
          aFavIconList,
          aGroupedLists
        } = await oAPI.fnGetAllGrouped();

        var iNewLength = aList.length;
        var iOldLength = oThis.aList.length;

        if (iOldLength != iNewLength) {
          oThis.fnPlayAudioSignal();
        }

        Vue.set(oThis, 'aDomainsList', aDomainsList);
        Vue.set(oThis, 'aFavIconList', aFavIconList);
        Vue.set(oThis, 'aGroupedLists', aGroupedLists);
        Vue.set(oThis, 'aList', aList);   
      } catch (oError) {
        oThis.oConfig.bListIsLoading = false;
        $err(oError);
      }
    },

    async fnAuth()
    {
      var oThis = this;

      return new Promise((fnSuccess, fnFail) => {
        oAPI
          .fnOAuthRequest()
          .then((sURL) => {
            var oWebview = document.querySelector("webview");

            oThis.oConfig.sWebViewURL = sURL;

            oWebview.addEventListener('console-message', (e) => {
              $log('oWebview:', e.message, e)
            });

            oWebview.addEventListener('did-finish-load', () => {
              $log('>> did-finish-load');

              if (oWebview.getURL().indexOf(oAPI.sRedirectURL)==0) {
                $log('fnOAuthAuthorize >> oWebview.getURL().indexOf(oAPI.sRedirectURL)==0');
                oAPI
                  .fnOAuthAuthorize()
                  .then(() => {
                    $log('fnOAuthAuthorize >> bAuthed');
                    oThis.bAuthed = true;
                    fnSuccess();
                  });
                return;
              }

              oWebview.executeJavaScript(`
                var fnReady = (async () => {
                  console.log('URL:', window.location.toString());

                  if (window.location.toString().indexOf('${oAPI.sRedirectURL}')==0) {
                    console.log('>>>>> 3');
                    // const { ipcRenderer } = remote; // require('electron');
                    // await ipcRenderer.sendToHost('success');
                    return;
                  }
                  var oBtn = document.querySelector('.btn-important.btn-authorize');
                  if (oBtn) {
                    setTimeout(() => {
                      console.log('>>>>> 2', oBtn);
                      $(oBtn).click();
                      //oBtn && oBtn.click();
                    }, 3000);
                  } else {
                    setTimeout(() => {
                      console.log('>>>>> 1', document.querySelector('.btn-authorize'));
                      document.querySelector('#feed_id').value = '${oThis.oConfig.oUser.sUserName}';
                      document.querySelector('#login_password').value = '${oThis.oConfig.oUser.sPassword}';
                      document.querySelector('.btn-authorize').click();
                    }, 3000);
                  }
                });
                fnReady();
              `);
            });

            oWebview.addEventListener('dom-ready', () => {
              $log('>> dom-ready');

              // oWebview.openDevTools();
            });
          })
          .catch((oErr) => {
            $err(oErr);
            fnFail(oErr);
          });
      }) 
    },

    fnShowNotification(sMessage, oOptions={})
    {
      Notify.create({
        position: 'top-right',
        message: sMessage,
        ...oOptions
      });
    },

    fnShowError(oError)
    {
      var sError = oError.toString();

      if (oError.response && oError.response.headers['x-error']) {
        sError = oError.response.headers['x-error'];
      }

      oThis.fnShowNotification(sError, { type: 'negative' });

      $err(oError);
    },

    fnLoadConfig()
    {
      var oThis = this;

      try {
        Object.assign(oThis.oConfig, JSON.parse(fs.readFileSync('./config.json').toString()));

        oAPI =  new GetPocketAPI({ 
          sUserName: oThis.oConfig.oUser.sUserName, 
          sPassword: oThis.oConfig.oUser.sPassword, 
          sAPIKey: oAPIKeys["Desktop (other)"] 
        });
      } catch (oError) {
        $err(oError);
        oThis.fnSaveConfig();
      }
    },
    fnSaveConfig()
    {
      $log('fnSaveConfig');
      var oThis = this;

      try {
        fs.writeFileSync('./config.json', JSON.stringify(oThis.oConfig));
        oThis.fnShowNotification("Saved to config.json");
      } catch (oError) {
        $err(oError);
      }
    }
  },

  async created()
  {
    var oThis = this;

    oThis.fnLoadConfig();

    await oThis.fnUpdateList();

    oThis.fnAutoUpdate(true);
  }
}
</script>
