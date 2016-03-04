// Licensed to Cloudera, Inc. under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  Cloudera, Inc. licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
define([
  'knockout',
  'desktop/js/autocomplete/sql',
  'desktop/spec/autocompleterTestUtils'
], function(ko, sql, testUtils) {

  describe("sql.js", function() {
    var subject;

    beforeAll(function() {
      sql.yy.parseError = function (msg) {
        throw Error(msg);
      };
      jasmine.addMatchers(testUtils.autocompleteMatcher);
    });

    beforeEach(function () {
    });

    var assertAutoComplete = function(testDefinition) {
      var result = sql.parse(testDefinition.beforeCursor + ' |CURSOR| ' + testDefinition.afterCursor);
      expect(result).toEqualAutocompleteValues(testDefinition.expectedSuggestions);
    };

    it("should suggest keywords for empty statement", function() {
      assertAutoComplete({
        beforeCursor: '',
        afterCursor: '',
        expectedSuggestions: [ 'SELECT', 'USE' ]
      });
    });

    it("should suggest keywords for partial statement", function() {
      assertAutoComplete({
        beforeCursor: 'se',
        afterCursor: '',
        expectedSuggestions: [ 'select' ]
      });
    });

    describe("table completion", function() {
      it("should suggest tables after SELECT", function () {
        sql.yy.callbacks = {
          tableLister: function (options) {
            if (options.prependQuestionMark && options.prependFrom) {
              return [{value: '? FROM table_one', meta: 'table'}, {value: '? FROM table_two', meta: 'table'}];
            }
          }
        };
        assertAutoComplete({
          beforeCursor: 'SELECT ',
          afterCursor: '',
          expectedSuggestions: ['? FROM table_one', '? FROM table_two']
        });
      });

      it("should follow keyword case for table name completion", function() {
        sql.yy.callbacks = {
          tableLister: function (options) {
            if (options.prependQuestionMark && options.prependFrom && options.lowerCase) {
              return [{value: '? from table_one', meta: 'table'}, {value: '? from table_two', meta: 'table'}];
            }
          }
        };
        assertAutoComplete({
          beforeCursor: 'select ',
          afterCursor: '',
          expectedSuggestions: ['? from table_one', '? from table_two']
        });
      });
    });
  });
});