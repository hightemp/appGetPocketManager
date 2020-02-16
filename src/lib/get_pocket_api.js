
const axios = require('axios');
// const qs = require('qs');

axios.defaults.headers.post['X-Accept'] = 'application/json';
axios.defaults.headers.post['Content-Type'] = 'application/json';

var { $err, $log } = require('./log');

/**
  General Guidelines

    All calls to the Pocket Authentication API should be done over HTTPS.
    All calls to the Pocket Authentication API should be POST - we do not support GET.
    The Content-Type header indicates the format of your request. This includes the type of data (e.g. JSON or form-urlencoded) and the character set (e.g. UTF8).
        The Pocket Authentication API supports two formats:
            application/x-www-form-urlencoded (DEFAULT)
            application/json
        You must also pass the character set after the format, separated by a semicolon. The HTTP 1.1 specification states the default for this is ISO-8859-1, which is probably not what you want. For example, a full header for UTF8-encoded data would look like one of these:
            Content-Type: application/x-www-form-urlencoded; charset=UTF8
            Content-Type: application/json; charset=UTF8
    The X-Accept header indicates the format you would like to receive the response, the Pocket Authentication API supports two formats:
        application/x-www-form-urlencoded (DEFAULT)
        application/json
 */

export default class GetPocketAPI 
{
    oAPIKeys = null
    sUserName = ""
    sPassword = ""
    sRequestToken = ""
    sAccessToken = ""

    sRedirectURL = 'http://localhost:8080/success' //'appGetPocketManager:fnAuthFinished'

    constructor({ sUserName, sPassword, sAPIKey })
    {
        var oThis = this;

        oThis.sUserName = sUserName;
        oThis.sPassword = sPassword;
        oThis.sAPIKey = sAPIKey;
    }

    fnIsSuccessURL(sURL = window.location.toString())
    {
        var oThis = this;

        return sURL.indexOf(oThis.sRedirectURL) === 0;
    }

    async fnOAuthRequest()
    {
        var oThis = this;

        // https://getpocket.com/v3/oauth/request

        return new Promise((fnSuccess, fnFail) => {
            axios
                .post(
                    'https://getpocket.com/v3/oauth/request',
                    {
                        consumer_key: oThis.sAPIKey,
                        redirect_uri: oThis.sRedirectURL
                    }
                )
                .then((oResponse) => {
                    oThis.sRequestToken = oResponse.data.code;
                    fnSuccess(`https://getpocket.com/auth/authorize?request_token=${oThis.sRequestToken}&redirect_uri=${oThis.sRedirectURL}`);
                })
                .catch((oError) => {
                    $err(oError);
                    fnFail(oError);
                });
        });
    }

    fnOAuthAuthorize()
    {
        var oThis = this;

        // https://getpocket.com/v3/oauth/authorize

        return new Promise((fnSuccess, fnFail) => {
            axios
                .post(
                    'https://getpocket.com/v3/oauth/authorize',
                    {
                        consumer_key: oThis.sAPIKey,
                        code: oThis.sRequestToken
                    }
                )
                .then((oResponse) => {
                    oThis.sAccessToken = oResponse.data.access_token;
                    fnSuccess(oThis.sAccessToken);
                })
                .catch((oError) => {
                    $err(oError);
                    fnFail(oError);
                });
        });
    }

    /**

https://getpocket.com/developer/docs/v3/retrieve

Optional Parameters
state 	string 		See below for valid values
favorite 	0 or 1 		See below for valid values
tag 	string 		See below for valid values
contentType 	string 		See below for valid values
sort 	string 		See below for valid values
detailType 	string 		See below for valid values
search 	string 		Only return items whose title or url contain the search string
domain 	string 		Only return items from a particular domain
since 	timestamp 		Only return items modified since the given since unix timestamp
count 	integer 		Only return count number of items
offset 	integer 		Used only with count; start returning from offset position of results
state

    unread = only return unread items (default)
    archive = only return archived items
    all = return both unread and archived items

favorite

    0 = only return un-favorited items
    1 = only return favorited items

tag

    tag_name = only return items tagged with tag_name
    _untagged_ = only return untagged items

contentType

    article = only return articles
    video = only return videos or articles with embedded videos
    image = only return images

sort

    newest = return items in order of newest to oldest
    oldest = return items in order of oldest to newest
    title = return items in order of title alphabetically
    site = return items in order of url alphabetically

detailType

    simple = return basic information about each item, including title, url, status, and more
    complete = return all data about each item, including tags, images, authors, videos, and more
 
     */

    fnGet(oParams = {})
    {
        var oThis = this;

        // https://getpocket.com/v3/get

        return new Promise((fnSuccess, fnFail) => {
            axios
                .post(
                    'https://getpocket.com/v3/get',
                    {
                        consumer_key: oThis.sAPIKey,
                        access_token: oThis.sAccessToken,
                        ...oParams
                    }
                )
                .then((oResponse) => {
                    fnSuccess(oResponse.data.list);
                })
                .catch((oError) => {
                    $err(oError);
                    fnFail(oError);
                });
        });
    }

    fnGetAll()
    {
        var oThis = this;

        // https://getpocket.com/v3/get

        return oThis.fnGet({ 
            state: 'all'
        });
    }
}