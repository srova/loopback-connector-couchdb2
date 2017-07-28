// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: loopback-connector-couchdb2
// This file is licensed under the Apache License 2.0.
// License text available at https://opensource.org/licenses/Apache-2.0

'use strict';

/*
NOTE: This suite is also used by loopback-connector-cloudant.
To support Optional Test Opt-In/Out, names of tests to be skipped
can be added to skips array. All tests must start with a check to
see if the test should be skipped or not.
The following line can be used to accomplish this:

this.test.pending ? this.skip() : null;
*/

var db, AutoupdateTestFoo, connector;
var util = require('util');

describe.only('CouchDB autoupdate', function() {
  before(function(done) {
    db = getDataSource();
    var testModelDef = {
      properties: {
        email: {type: 'string', index: true},
        age: {type: 'number', index: true},
        firstName: {type: 'string'},
        lastName: {type: 'string'}
      },
      config: {
        indexes: {
          'name_index': {
            keys: {
              firstName: 1,
              lastName: 1,
            },
          },
        },
      }
    };
    AutoupdateTestFoo = db.define('AutoupdateTestFoo', testModelDef.properties,
      testModelDef.config);
    connector = db.connector;
    db.autoupdate(done);
  });

  it('autoupdate creates indexes when model first created', function(done) {
    connector.getIndexes('AutoupdateTestFoo', function(err, result){
      if (err) return done(err);
      // result should contain 'name' 'age' 'email'
      done();
    });
  });

  it('autoupdate drops and adds indexes', function(done){
    // Drop age, name indexes.
    // Add postcode, fullName indexes.
    // Keep email
    var newTestModelDef = {
      properties: {
        email: {type: 'string', index: true},
        age: {type: 'number'},
        postcode: {type: 'string', index: true},
        firstName: {type: 'string'},
        middleName: {type: 'string'},
        lastName: {type: 'string'},
      },
      config: {
        indexes: {
          'fullName_index': {
            keys: {
              firstName: 1,
              midleName: 1,
              lastName: 1,
            },
          },
        },
      }
    };

    db.autoupdate(function(err) {
      if (err) return done(err);
      connector.getIndexes('AutoupdateTestFoo', function(err) {
        if (err) return done(err);
        // result should contain 'email', 'fullName_index'
        // should not contain 'age', 'name_index'
        done();
      });
    });
  });
});