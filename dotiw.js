//    dotiw.js 0.2.4
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
  version: '0.2.4',
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
  days: function(num) {
    return num*86400;
  },
  hours: function(num) {
    return num*3600;
  },
  minutes: function(num) {
    return num*60;
  },
  seconds: function(num) {
    return num;
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
    return this.distance_of_time_in_words(0, seconds, ops_hash);
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
    // Output text here by joining the array parts
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
      vague: false,
      accumulate_on: null,
      only: null,
      except: null,
      words_connector: null,
      two_words_connector: null,
      last_word_connector: null,
      highest_measure_only: false
    }, ops_hash);

    // Fix up the ops hash to reasonable values
    if (start.getTime) {
      start = Math.floor(start.getTime()/1000);
    }
    if (end.getTime) {
      end   = Math.floor(end.getTime()/1000);
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
    var acc       = typeof(ops.accumulate_on) == 'string' ? true : false;
    var neg_time  = start > end;
    var diff      = neg_time ? start - end : end - start;

    if (ops.vague) {
      // The traditional Rails distance_of_time_in_words processing is this branch
      minutes = Math.round(diff/60.0);
      if (minutes >= 0 && minutes < 2) {
        if (show_seconds) {
          if (diff < 5) {
            time_hash.seconds = this._time_string('less_than_x_seconds', 5);
            time_hash.order.push('seconds');
          }
          else if (diff < 10) {
            time_hash.seconds = this._time_string('less_than_x_seconds', 10);
            time_hash.order.push('seconds');
          }
          else if (diff < 20) {
            time_hash.seconds = this._time_string('less_than_x_seconds', 20);
            time_hash.order.push('seconds');
          }
          else if (diff < 40) {
            time_hash.seconds = this._time_string('half_a_minute', 1);
            time_hash.order.push('minutes');
          }
          else if (diff < 60) {
            time_hash.minutes = this._time_string('less_than_x_minutes', 1);
            time_hash.order.push('minutes');
          }
          else {
            time_hash.minutes = this._time_string('x_minutes', 1);
            time_hash.order.push('minutes');
          }
        }
        else {
          time_hash.minutes = this._time_string((minutes == 0) ? 'less_than_x_minutes' : 'x_minutes', 1);
          time_hash.order.push('minutes');
        }
      }
      else if (minutes > 1 && minutes < 45) {
        time_hash.minutes = this._time_string('x_minutes', minutes);
        time_hash.order.push('minutes');
      }
      else if (minutes > 44 && minutes < 90) {
        time_hash.hours  = this._time_string('about_x_hours', 1);
        time_hash.order.push('hours');
      }
      else if (minutes > 89 && minutes < 1440) {
        time_hash.hours  = this._time_string('about_x_hours', Math.round(minutes/60.0));
        time_hash.order.push('hours');
      }
      else if (minutes > 1439 && minutes < 2530) {
        time_hash.days  = this._time_string('x_days', 1);
        time_hash.order.push('days');
      }
      else if (minutes > 2529 && minutes < 43200) {
        time_hash.days  = this._time_string('x_days', Math.round(minutes/1440.0));
        time_hash.order.push('days');
      }
      else if (minutes > 43199 && minutes < 86400) {
        time_hash.days  = this._time_string('about_x_months', 1);
        time_hash.order.push('months');
      }
      else if (minutes > 86399 && minutes < 525600) {
        time_hash.days  = this._time_string('x_months', Math.round(minutes/43200.0));
        time_hash.order.push('months');
      }
      else {
        years = Math.floor(minutes/525600);
        var leap_offset = (years/4)*1440;
        var remainder   = (minutes - leap_offset)%525600;
        if (remainder < 131400) {
          time_hash.years = this._time_string('about_x_years', years);
        }
        else if (remainder < 394200) {
          time_hash.years = this._time_string('over_x_years', years);
        }
        else {
          time_hash.years = this._time_string('almost_x_years', years + 1);
        }
        time_hash.order.push('years');
      }
    }
    else {
      // The newer precise processing based on dotiw on Github is this branch
      if (!skip && !(acc && ops.accumulate_on != 'days')) {
        days    = Math.floor(diff/86400);
        diff    -= days*86400;
        if (days > 0 && this._only('days', ops) && this._except('days', ops)) {
          time_hash.days  = this._time_string('x_days', days);
          time_hash.order.push('days');
        }
        skip    = ops.highest_measure_only && days > 0 ? true : false;
        acc     = false;
      }
      if (!skip && !(acc && ops.accumulate_on != 'hours')) {
        hours   = Math.floor(diff/3600);
        diff    -= hours*3600;
        if (hours > 0 && this._only('hours', ops) && this._except('hours', ops)) {
          time_hash.hours  = this._time_string('x_hours', hours);
          time_hash.order.push('hours');
        }
        skip    = ops.highest_measure_only && hours > 0 ? true : false;
        acc     = false;
      }
      if (!skip && !(acc && ops.accumulate_on != 'minutes')) {
        minutes = Math.floor(diff/60);
        diff    -= minutes*60;
        if (minutes > 0 && this._only('minutes', ops) && this._except('minutes', ops)) {
          time_hash.minutes = this._time_string('x_minutes', minutes);
          time_hash.order.push('minutes');
        }
        skip    = ops.highest_measure_only && minutes > 0 ? true : false;
        acc     = false;
      }
      if (!skip && !(acc && ops.accumulate_on != 'seconds')) {
        seconds = diff;
        if (show_seconds && this._only('seconds', ops) && this._except('seconds', ops)) {
          time_hash.seconds = this._time_string('x_seconds', seconds);
          time_hash.order.push('seconds');
        }
      }

      if (time_hash.order.length == 0) {
        time_hash.order.push(this._time_string('x_seconds', 1));
      }
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

    if (typeof(this._locale[type]) == 'string') {
      return (this._locale[type].replace(/%{count}/, time));
    }
    // In case the pluralization gives us a key that does not exist we will
    // default to key 'other'
    if (typeof(this._locale[type][key]) == 'undefined') {
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
