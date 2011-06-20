//    dotiw.js 0.1.0
//    Copyright (c) 2011 Andrew Chung, 3Bengals Inc.
//    Last modified: 2011-06-19
//    dotiw is freely distributable under the MIT license. (http://www.opensource.org/licenses/mit-license.php)
//    Portions of dotiw are inspired or borrowed from Rails and
//    Ryan Bigg's dotiw Gem (https://github.com/radar/dotiw)
//
//    Full MIT License:
//    Permission is hereby granted, free of charge, to any person obtaining a
//    copy of this software and associated documentation files
//    (the "Software"), to deal in the Software without restriction, including
//    without limitation the rights to use, copy, modify, merge, publish,
//    distribute, sublicense, and/or sell copies of the Software, and to
//    permit persons to whom the Software is furnished to do so, subject to
//    the following conditions:
//
//    The above copyright notice and this permission notice shall be included
//    in all copies or substantial portions of the Software.
//
//    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
//    OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
//    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
//    IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
//    CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
//    TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
//    SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
var DOTIW = {
  version: '0.1.0',
  locale: {
    'en-US': {
      half_a_minute: 'half a minute',
      less_than_x_seconds: {
        one: 'less than 1 second',
        other: 'less than %{count} seconds'
      },
      x_seconds: {
        one: '1 second',
        other: '%{count} seconds'
      },
      less_than_x_minutes: {
        one: 'less than a minute',
        other: 'less than %{count} minutes'
      },
      x_minutes: {
        one: '1 minute',
        couple: 'a couple of minutes',
        other: '%{count} minutes'
      },
      about_x_hours: {
        one: 'about 1 hour',
        other: 'about %{count} hours'
      },
      x_hours: {
        one: '1 hour',
        other: '%{count} hours'
      },
      x_days: {
        one: '1 day',
        other: '%{count} days'
      },
      x_months: {
        one: '1 month',
        other: '%{count} months'
      },
      about_x_years: {
        one: 'about 1 year',
        other: 'about %{count} years'
      },
      over_x_years: {
        one: 'over 1 year',
        other: 'over %{count} years'
      },
      almost_x_years: {
        one: 'almost 1 year',
        other: 'almost %{count} years'
      },
      x_years: {
        one: '1 year',
        other: '%{count} years'
      },
      words_connector: ', ',
      two_words_connector: ' and ',
      last_word_connector: ', and '
    }
  },
  load_locale: function(lang, translation) {
    if (typeof (translation[lang]) == 'undefined') {
      // Assume we are just given a straight hash
      this.locale[lang] = translation;
    }
    else {
      // Assume the has we are given has the actual locale string as a key
      this.locale[lang] = translation[lang];
    }
  },
  distance_of_time_in_words_hash: function(start, end, show_seconds, ops_hash) {
    var time_hash  = this._parse_time(start, end, show_seconds, ops_hash);
    delete time_hash['order'];
    return time_hash;
  },
  distance_of_time: function(seconds, ops_hash) {
    return distance_of_time_in_words(0, seconds, ops_hash);
  },
  // Not implemented
  //distance_of_time_in_percent: function(start, now, end, ops_hash) {
  //},
  distance_of_time_in_words: function (start, end, show_seconds, ops_hash) {
    var time_hash = this._parse_time(start, end, show_seconds, ops_hash);
    var time_arr  = [];
    var time_str;

    // Pull into an array all the hash values according to the order array
    for (var i = 0; i < time_hash.order.length; i++) {
      time_arr.push(time_hash[time_hash.order[i]]);
    }
    // Output text here by joning the array parts
    if (time_arr.length == 2) {
      time_str  = time_arr.join(this._locale.two_words_connector);
    }
    else {
      time_str  = time_arr.join(this._locale.words_connector);
      time_str  = time_str.replace(
        new RegExp("(.*)" + this._locale.words_connector),
        '$1' + this._locale.last_word_connector);
    }
    return time_str;
  },
  _parse_time: function(start, end, show_seconds, ops_hash) {
    if (typeof(show_seconds) == 'undefined') {
      show_seconds  = false;
    }
    else if (typeof(show_seconds) == 'object') {
      ops_hash      = show_seconds;
      show_seconds  = false;
    }
    var ops = jQuery.extend({
      locale: 'en-US',
      vague: false,       // Not implemented
      accumulate_on: null,// Not implemented
      only: null,
      except: null,
      words_connector: null,
      two_words_connector: null,
      last_word_connector: null,
      highest_measure_only: false
    }, ops_hash);

    // Fix up the ops hash to reasonable values
    if (!typeof(start) == 'number') {
      start = start.getTime();
    }
    if (!typeof(end) == 'number') {
      end   = end.getTime();
    }
    this._locale = this._build_locale(ops);
    // Fix up only and except params if necessary
    if (ops.only != null && typeof(ops.only) == 'string') {
      ops.only    = [ops.only];
    }
    if (ops.except != null && typeof(ops.except) == 'string') {
      ops.except  = [ops.except];
    }
    // Create an inline locale from the passed in hash and use it
    if (typeof(ops.locale) != 'string') {
      this._build_locale('inline', ops.locale);
      ops.locale  = 'inline';
    }

    var years, months, days, hours, minutes, seconds;
    var time_hash = {
      order: []
    };
    var skip      = false;
    var neg_time  = start > end;
    var diff      = neg_time ? start - end : end - start;

    if (!skip) {
      days    = Math.floor(diff/86400);
      diff    -= days*86400;
      if (days > 0 && this._only('days', ops) && this._except('days', ops)) {
        time_hash.days  = this._time_string('x_days', days);
        time_hash.order.push('days');
      }
      skip    = ops.highest_measure_only;
    }
    if (!skip) {
      hours   = Math.floor(diff/3600);
      diff    -= hours*3600;
      if (hours > 0 && this._only('hours', ops) && this._except('hours', ops)) {
        time_hash.hours  = this._time_string('x_hours', hours);
        time_hash.order.push('hours');
      }
      skip    = ops.highest_measure_only;
    }
    if (!skip) {
      minutes = Math.floor(diff/60);
      diff    -= minutes*60;
      if (minutes > 0 && this._only('minutes', ops) && this._except('minutes', ops)) {
        time_hash.minutes = this._time_string('x_minutes', minutes);
        time_hash.order.push('minutes');
      }
      skip    = ops.highest_measure_only;
    }
    if (!skip) {
      seconds = diff;
      if (show_seconds && this._only('seconds', ops) && this._except('seconds', ops)) {
        time_hash.seconds = this._time_string('x_seconds', seconds);
        time_hash.order.push('seconds');
      }
    }

    if (time_hash.order.length == 0) {
      time_hash.order.push(this._time_string('x_seconds', 1));
    }
    return time_hash;
  },
  _build_locale: function(ops_hash) {
    var locale  = this.locale['en-US'];
    if (ops_hash.locale != 'en-US') {
      locale    = jQuery.extend(locale, this.locale[ops_hash.locale]);
    }
    if (ops_hash.words_connector) {
      locale.words_connector      = ops_hash.words_connector;
    }
    if (ops_hash.two_words_connector) {
      locale.two_words_connector  = ops_hash.two_words_connector;
    }
    if (ops_hash.last_word_connector) {
      locale.last_word_connector  = ops_hash.last_word_connector;
    }
    return locale;
  },
  _time_string: function(type, time) {
    // This relies on the fact that the this._locale has already been set
    var key = null;
    if (jQuery.isFunction(this._locale.pluralization)) {
      key = this._locale.pluralization(time);
    }
    if (jQuery.isFunction(this._locale[type].pluralization)) {
      key = this._locale[type].pluralization(time);
    }
    else if (key == null) {
      if (time == 1) {
        key = 'one';
      }
      else {
        key = 'other';
      }
    }
    // In case the pluralization gives us a key that does not exist we will
    // default to key 'other'
    if (typeof (this._locale[type][key]) == 'undefined') {
      key = 'other';
    }
    return (this._locale[type][key]).replace(/%{count}/, time);
  },
  _only: function(type, ops_hash) {
    if (ops_hash.only == null) {
      return true;
    }
    if (jQuery.inArray(type, ops_hash.only) != -1) {
      return true;
    }
    return false;
  },
  _except: function(type, ops_hash) {
    if (ops_hash.except == null) {
      return true;
    }
    if (jQuery.inArray(type, ops_hash.except) != -1) {
      return false;
    }
    return true;
  }
}
