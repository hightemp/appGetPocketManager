<template>
  <div id="q-app" class="row" style="height: 100vh">
    <webview 
      :src="sWebViewURL" 
      class="full-height full-width" 
      disablewebsecurity 
       
      v-if="!bAuthed"
      webpreferences="webSecurity=false, devTools=true"
    /><!-- nodeintegration -->
    <template v-else>
      <div class="col-4 column full-height relative-position">
        <div class="col-auto row">
          <q-input
            dense
            filled
            class="col" 
            v-model="sListFilter" 
            type="text" 
            label="Filter..." 
          />
          <q-btn-toggle
            v-model="bEnableListFilter"
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
            v-model="bReverseSort"
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
            v-model="bShowGrouped"
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
        <div class="col column full-width">
          <q-virtual-scroll
            v-if="bShowGrouped"
            style=""
            class="col full-width"
            :items="aFilteredDomainsList"
            separator
          >
            <template v-slot="{ item, index }">
              <q-item
                :key="index"
                dense
              >
                <q-item-section>
                  <q-item-label>
                    {{ item }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-virtual-scroll>
          <q-virtual-scroll
            v-if="bShowGrouped"
            style=""
            class="col full-width"
            :items="aFilteredGroupedLists"
            separator
          >
            <template v-slot="{ item, index }">
              <q-item
                :key="index"
                dense
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
          <q-virtual-scroll
            v-if="!bShowGrouped"
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
                :active="oSelectedItem==item"
                active-class="bg-primary text-white"
                @click="oSelectedItem=item"
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
        </div>
        <div class="col-auto column bg-grey-2">
          <div class="col-auto q-pa-sm text-grey-9">
            {{ aFilteredList.length }} / {{ aList.length }}
          </div>
          <div class="col">

          </div>
        </div>
        <q-inner-loading :showing="bListIsLoading">
          <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading>
      </div>
      <div class="col-8 full-height">
        <webview 
          v-if="oSelectedItem && oSelectedItem.sURL"
          ref="webview"
          :src="oSelectedItem.sURL" 
          class="full-height full-width"
        ></webview>
      </div>
    </template>
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
const fs = require('fs');
const axios = require('axios');
import Vue from 'vue';

import moment from 'moment'

const getFavicons = require('get-website-favicon')

const { $err, $log } = require('./lib/log');
const { fnSaveToJSONFile } = require('./lib/utils');

const oAPIKeys = require('./config/api_keys.json');

import GetPocketAPI from './lib/get_pocket_api';
 
var config = {
    consumer_key: oAPIKeys["Desktop (other)"],
    redirect_uri: ''
};

var oAPI = null;

import { Notify } from 'quasar'

/**
 * { "item_id": "2886683991", "resolved_id": "2886683991", "given_url": "https://eyegod.info/", "given_title": "", "favorite": "0", "status": "0", "time_added": "1581862949", "time_updated": "1581862951", "time_read": "0", "time_favorited": "0", "sort_id": 7, "resolved_title": "Телеграм бот Глаз Бога.", "resolved_url": "https://eyegod.info/", "excerpt": "Поиск информации Телеграм Бот \"Eye Of God\" поможет найти человека по фото, по номеру телефона найти его владельца, узнать кто является держателем банковской карты и его", "is_article": "0", "is_index": "1", "has_video": "1", "has_image": "1", "word_count": "93", "lang": "", "listen_duration_estimate": 36 }
 */

export default {
  name: 'App',

  data()
  {
    return {
      // oList: {},
      aList: [],
      aDomainsList: [],
      aGroupedLists: [],
      oDomainFavIcons: {},

      sListFilter: "",
      bEnableListFilter: false,
      bReverseSort: false,
      bShowGrouped: false,

      bListIsLoading: false,

      sPreviewURL: "",

      iSelectedDomain: -1,
      // iSelectedIndex: -1,
      oSelectedItem: null,

      bAuthed: false,

      sWebViewURL: "",

      oUser: {
        sUserName: "",
        sPassword: ""
      }
    };
  },

  computed: {
    aFilteredList()
    {
      var oThis = this;

      var aList = oThis.aList.slice();

      if (oThis.bEnableListFilter) {
        aList = aList.filter((v) => !!~v.sTitle.indexOf(oThis.sListFilter) );
      }

      if (oThis.bReverseSort) {
        aList = aList.reverse();
      }

      return aList;
    },
    aFilteredGroupedLists()
    {
      var oThis = this;
      var aGroup = oThis.aGroupedLists[oThis.iSelectedDomain];

      if (!aGroup) {
        return;
      }

      var aGroupedLists = aGroup.slice();

      if (oThis.bEnableListFilter) {
        aGroupedLists = aGroupedLists.filter((v) => !!~v.sTitle.indexOf(oThis.sListFilter) );
      }

      if (oThis.bReverseSort) {
        aGroupedLists = aGroupedLists.reverse();
      }

      return aGroupedLists;
    },
    aFilteredDomainsList()
    {
      var oThis = this;

      var aDomainsList = oThis.aDomainsList.slice();

      if (oThis.bEnableListFilter) {
        aDomainsList = aDomainsList.filter((v) => !!~v.indexOf(oThis.sListFilter) );
      }

      if (oThis.bReverseSort) {
        aDomainsList = aDomainsList.reverse();
      }

      return aDomainsList;
    }
  },

  methods: {
    fnExportListToJSON()
    {
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

      $log('fnUpdateList >> 1');

      if (!oThis.bAuthed) {
        await oThis.fnAuth();
      }

      $log('fnUpdateList >> 2');

      oThis.bListIsLoading = true;

      try {
        var oList = await oAPI.fnGetAll();

        oThis.bListIsLoading = false;
        
        // Vue.set(oThis, 'oList', oList);

        oThis.aList = Object.values(oList).sort((a, b) => b.time_added-a.time_added).map((v) => {
          Object.defineProperty(v, 'sTitle', { 
            get() { return this.resolved_title ? this.resolved_title : this.given_title }
          });

          Object.defineProperty(v, 'sURL', { 
            get() { return this.resolved_url ? this.resolved_url : this.given_url }
          });

          v.sAddedDateTime = moment(v.time_added*1000).format("DD.MM.YYYY HH:mm");

          v.sDomain = v.sURL.replace(/^https?:\/\//, '').replace(/\/.*$/, '');

          return v;
        });

        oThis.aList.forEach((oItem) => {
          var sDomain = oItem.sDomain;

          var iIndex = oThis.aDomainsList.indexOf(sDomain);

          if (!~iIndex) {
            oThis.aDomainsList.push(sDomain);
          }

          if (!oThis.aGroupedLists[iIndex]) {
            oThis.aGroupedLists[iIndex] = [];
          }

          /*
          getFavicons(sDomain).then(data => {
            oThis.oDomainFavIcons[sDomain] = data.icons;
          });
          */

          oThis.aGroupedLists[iIndex].push(oItem);
        })
      } catch (oError) {
        oThis.bListIsLoading = false;
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

            oThis.sWebViewURL = sURL;

            oWebview.addEventListener('console-message', (e) => {
              console.log('oWebview:', e.message, e)
            });

            oWebview.addEventListener('did-finish-load', () => {
              console.log('>> did-finish-load');

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
                      document.querySelector('#feed_id').value = '${oThis.oUser.sUserName}';
                      document.querySelector('#login_password').value = '${oThis.oUser.sPassword}';
                      document.querySelector('.btn-authorize').click();
                    }, 3000);
                  }
                });
                fnReady();
              `);
            });

            oWebview.addEventListener('dom-ready', () => {
              console.log('>> dom-ready');

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
        Object.assign(oThis.$data, JSON.parse(fs.readFileSync('./config.json').toString()));

        oAPI =  new GetPocketAPI({ 
          sUserName: oThis.oUser.sUserName, 
          sPassword: oThis.oUser.sPassword, 
          sAPIKey: oAPIKeys["Desktop (other)"] 
        });
      } catch (oError) {
        console.error(oError);
        oThis.fnSaveConfig();
      }
    },
    fnSaveConfig()
    {
      var oThis = this;

      try {
        fs.writeFileSync('./config.json', JSON.stringify(oThis.$data));
      } catch (oError) {
        console.error(oError);
      }
    }
  },

  created()
  {
    var oThis = this;

    oThis.fnLoadConfig();

    oThis.fnUpdateList();
  }
}
</script>
