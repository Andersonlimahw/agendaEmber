"use strict";

/* jshint ignore:start */



/* jshint ignore:end */

define('agenda/adapters/application', ['exports', 'ember', 'emberfire/adapters/firebase'], function (exports, _ember, _emberfireAdaptersFirebase) {
  var inject = _ember['default'].inject;
  exports['default'] = _emberfireAdaptersFirebase['default'].extend({
    firebase: inject.service()
  });
});
define('agenda/app', ['exports', 'ember', 'agenda/resolver', 'ember-load-initializers', 'agenda/config/environment'], function (exports, _ember, _agendaResolver, _emberLoadInitializers, _agendaConfigEnvironment) {

  var App = undefined;

  _ember['default'].MODEL_FACTORY_INJECTIONS = true;

  App = _ember['default'].Application.extend({
    modulePrefix: _agendaConfigEnvironment['default'].modulePrefix,
    podModulePrefix: _agendaConfigEnvironment['default'].podModulePrefix,
    Resolver: _agendaResolver['default']
  });

  (0, _emberLoadInitializers['default'])(App, _agendaConfigEnvironment['default'].modulePrefix);

  exports['default'] = App;
});
define('agenda/controllers/todos', ['exports', 'ember'], function (exports, _ember) {
	exports['default'] = _ember['default'].Controller.extend({

		// search todos

		filter: '',
		filteredTodos: (function () {
			var filter = this.get('filter');

			var rx = new RegExp(filter, 'gi');

			var todos = this.model;

			return todos.filter(function (todo) {
				return todo.get('title').match(rx) || todo.get('body').match(rx);
			});
		}).property('arrangedContent', 'filter'),

		sortedProperties: ['date: asc'],
		sortedTodos: _ember['default'].computed.sort('model', 'sortedProperties')

	});
});
define('agenda/controllers/todos/edit', ['exports', 'ember'], function (exports, _ember) {
	exports['default'] = _ember['default'].Controller.extend({
		actions: {
			editTodo: function editTodo(id) {
				var self = this;

				var title = this.get('model.title');
				var body = this.get('model.body');
				var date = this.get('model.date');

				this.store.findRecord('todo', id).then(function (todo) {
					todo.set('title', title);
					todo.set('body', body);
					todo.set('date', new Date(date));
					// Save to FB;

					todo.save();

					self.transitionToRoute('todos');
				});
			},

			deleteTodo: function deleteTodo(id) {
				var self = this;

				this.store.findRecord('todo', id).then(function (todo) {

					todo.deleteRecord();

					// Save to FB;

					todo.save();

					self.transitionToRoute('todos');
				});
			}

		} // fim actions

	});
	// fim export
});
define('agenda/controllers/todos/new', ['exports', 'ember'], function (exports, _ember) {
	exports['default'] = _ember['default'].Controller.extend({
		actions: {
			addTodo: function addTodo() {

				var date = this.get('date');
				var title = this.get('title');
				var body = this.get('body');

				// creat new todo

				var newTodo = this.store.createRecord('todo', {

					title: title,
					body: body,
					date: new Date(date)

				});

				//save To FB

				newTodo.save();

				//clear the form
				this.setProperties({
					title: '',
					body: '',
					date: ''
				});
			}
		}
	});
});
define('agenda/helpers/app-version', ['exports', 'ember', 'agenda/config/environment'], function (exports, _ember, _agendaConfigEnvironment) {
  exports.appVersion = appVersion;
  var version = _agendaConfigEnvironment['default'].APP.version;

  function appVersion() {
    return version;
  }

  exports['default'] = _ember['default'].Helper.helper(appVersion);
});
define('agenda/helpers/format-date', ['exports', 'ember'], function (exports, _ember) {
	exports.formatDate = formatDate;

	function formatDate(params) {
		//return moment(params[0]).fromNow();

		return moment(params[0]).format('DD-MM-YYYY');
	}

	exports['default'] = _ember['default'].Helper.helper(formatDate);
});
define('agenda/helpers/format-markdown', ['exports', 'ember'], function (exports, _ember) {
	exports.formatMarkdown = formatMarkdown;

	function formatMarkdown(params) {
		return _ember['default'].String.htmlSafe(new showdown.Converter().makeHtml(params[0]));
	}

	exports['default'] = _ember['default'].Helper.helper(formatMarkdown);
});
define('agenda/helpers/pluralize', ['exports', 'ember-inflector/lib/helpers/pluralize'], function (exports, _emberInflectorLibHelpersPluralize) {
  exports['default'] = _emberInflectorLibHelpersPluralize['default'];
});
define('agenda/helpers/singularize', ['exports', 'ember-inflector/lib/helpers/singularize'], function (exports, _emberInflectorLibHelpersSingularize) {
  exports['default'] = _emberInflectorLibHelpersSingularize['default'];
});
define('agenda/initializers/app-version', ['exports', 'ember-cli-app-version/initializer-factory', 'agenda/config/environment'], function (exports, _emberCliAppVersionInitializerFactory, _agendaConfigEnvironment) {
  var _config$APP = _agendaConfigEnvironment['default'].APP;
  var name = _config$APP.name;
  var version = _config$APP.version;
  exports['default'] = {
    name: 'App Version',
    initialize: (0, _emberCliAppVersionInitializerFactory['default'])(name, version)
  };
});
define('agenda/initializers/container-debug-adapter', ['exports', 'ember-resolver/container-debug-adapter'], function (exports, _emberResolverContainerDebugAdapter) {
  exports['default'] = {
    name: 'container-debug-adapter',

    initialize: function initialize() {
      var app = arguments[1] || arguments[0];

      app.register('container-debug-adapter:main', _emberResolverContainerDebugAdapter['default']);
      app.inject('container-debug-adapter:main', 'namespace', 'application:main');
    }
  };
});
define('agenda/initializers/data-adapter', ['exports', 'ember'], function (exports, _ember) {

  /*
    This initializer is here to keep backwards compatibility with code depending
    on the `data-adapter` initializer (before Ember Data was an addon).
  
    Should be removed for Ember Data 3.x
  */

  exports['default'] = {
    name: 'data-adapter',
    before: 'store',
    initialize: _ember['default'].K
  };
});
define('agenda/initializers/ember-cli-mirage', ['exports', 'ember-cli-mirage/utils/read-modules', 'agenda/config/environment', 'agenda/mirage/config', 'ember-cli-mirage/server', 'lodash/object/assign'], function (exports, _emberCliMirageUtilsReadModules, _agendaConfigEnvironment, _agendaMirageConfig, _emberCliMirageServer, _lodashObjectAssign) {
  exports.startMirage = startMirage;
  exports['default'] = {
    name: 'ember-cli-mirage',
    initialize: function initialize(application) {
      if (arguments.length > 1) {
        // Ember < 2.1
        var container = arguments[0],
            application = arguments[1];
      }

      if (_shouldUseMirage(_agendaConfigEnvironment['default'].environment, _agendaConfigEnvironment['default']['ember-cli-mirage'])) {
        startMirage(_agendaConfigEnvironment['default']);
      }
    }
  };

  function startMirage() {
    var env = arguments.length <= 0 || arguments[0] === undefined ? _agendaConfigEnvironment['default'] : arguments[0];

    var environment = env.environment;
    var modules = (0, _emberCliMirageUtilsReadModules['default'])(env.modulePrefix);
    var options = (0, _lodashObjectAssign['default'])(modules, { environment: environment, baseConfig: _agendaMirageConfig['default'], testConfig: _agendaMirageConfig.testConfig });

    return new _emberCliMirageServer['default'](options);
  }

  function _shouldUseMirage(env, addonConfig) {
    var userDeclaredEnabled = typeof addonConfig.enabled !== 'undefined';
    var defaultEnabled = _defaultEnabled(env, addonConfig);

    return userDeclaredEnabled ? addonConfig.enabled : defaultEnabled;
  }

  /*
    Returns a boolean specifying the default behavior for whether
    to initialize Mirage.
  */
  function _defaultEnabled(env, addonConfig) {
    var usingInDev = env === 'development' && !addonConfig.usingProxy;
    var usingInTest = env === 'test';

    return usingInDev || usingInTest;
  }
});
define('agenda/initializers/ember-data', ['exports', 'ember-data/setup-container', 'ember-data/-private/core'], function (exports, _emberDataSetupContainer, _emberDataPrivateCore) {

  /*
  
    This code initializes Ember-Data onto an Ember application.
  
    If an Ember.js developer defines a subclass of DS.Store on their application,
    as `App.StoreService` (or via a module system that resolves to `service:store`)
    this code will automatically instantiate it and make it available on the
    router.
  
    Additionally, after an application's controllers have been injected, they will
    each have the store made available to them.
  
    For example, imagine an Ember.js application with the following classes:
  
    App.StoreService = DS.Store.extend({
      adapter: 'custom'
    });
  
    App.PostsController = Ember.Controller.extend({
      // ...
    });
  
    When the application is initialized, `App.ApplicationStore` will automatically be
    instantiated, and the instance of `App.PostsController` will have its `store`
    property set to that instance.
  
    Note that this code will only be run if the `ember-application` package is
    loaded. If Ember Data is being used in an environment other than a
    typical application (e.g., node.js where only `ember-runtime` is available),
    this code will be ignored.
  */

  exports['default'] = {
    name: 'ember-data',
    initialize: _emberDataSetupContainer['default']
  };
});
define('agenda/initializers/emberfire', ['exports', 'emberfire/initializers/emberfire'], function (exports, _emberfireInitializersEmberfire) {
  exports['default'] = _emberfireInitializersEmberfire['default'];
});
define('agenda/initializers/export-application-global', ['exports', 'ember', 'agenda/config/environment'], function (exports, _ember, _agendaConfigEnvironment) {
  exports.initialize = initialize;

  function initialize() {
    var application = arguments[1] || arguments[0];
    if (_agendaConfigEnvironment['default'].exportApplicationGlobal !== false) {
      var theGlobal;
      if (typeof window !== 'undefined') {
        theGlobal = window;
      } else if (typeof global !== 'undefined') {
        theGlobal = global;
      } else if (typeof self !== 'undefined') {
        theGlobal = self;
      } else {
        // no reasonable global, just bail
        return;
      }

      var value = _agendaConfigEnvironment['default'].exportApplicationGlobal;
      var globalName;

      if (typeof value === 'string') {
        globalName = value;
      } else {
        globalName = _ember['default'].String.classify(_agendaConfigEnvironment['default'].modulePrefix);
      }

      if (!theGlobal[globalName]) {
        theGlobal[globalName] = application;

        application.reopen({
          willDestroy: function willDestroy() {
            this._super.apply(this, arguments);
            delete theGlobal[globalName];
          }
        });
      }
    }
  }

  exports['default'] = {
    name: 'export-application-global',

    initialize: initialize
  };
});
define('agenda/initializers/injectStore', ['exports', 'ember'], function (exports, _ember) {

  /*
    This initializer is here to keep backwards compatibility with code depending
    on the `injectStore` initializer (before Ember Data was an addon).
  
    Should be removed for Ember Data 3.x
  */

  exports['default'] = {
    name: 'injectStore',
    before: 'store',
    initialize: _ember['default'].K
  };
});
define('agenda/initializers/store', ['exports', 'ember'], function (exports, _ember) {

  /*
    This initializer is here to keep backwards compatibility with code depending
    on the `store` initializer (before Ember Data was an addon).
  
    Should be removed for Ember Data 3.x
  */

  exports['default'] = {
    name: 'store',
    after: 'ember-data',
    initialize: _ember['default'].K
  };
});
define('agenda/initializers/transforms', ['exports', 'ember'], function (exports, _ember) {

  /*
    This initializer is here to keep backwards compatibility with code depending
    on the `transforms` initializer (before Ember Data was an addon).
  
    Should be removed for Ember Data 3.x
  */

  exports['default'] = {
    name: 'transforms',
    before: 'store',
    initialize: _ember['default'].K
  };
});
define("agenda/instance-initializers/ember-data", ["exports", "ember-data/-private/instance-initializers/initialize-store-service"], function (exports, _emberDataPrivateInstanceInitializersInitializeStoreService) {
  exports["default"] = {
    name: "ember-data",
    initialize: _emberDataPrivateInstanceInitializersInitializeStoreService["default"]
  };
});
define("agenda/mirage/config", ["exports"], function (exports) {
  exports["default"] = function () {

    // These comments are here to help you get started. Feel free to delete them.

    /*
      Config (with defaults).
       Note: these only affect routes defined *after* them!
    */

    // this.urlPrefix = '';    // make this `http://localhost:8080`, for example, if your API is on a different server
    // this.namespace = '';    // make this `api`, for example, if your API is namespaced
    // this.timing = 400;      // delay for each request, automatically set to 0 during testing

    /*
      Shorthand cheatsheet:
       this.get('/posts');
      this.post('/posts');
      this.get('/posts/:id');
      this.put('/posts/:id'); // or this.patch
      this.del('/posts/:id');
       http://www.ember-cli-mirage.com/docs/v0.2.x/shorthands/
    */
  };
});
define("agenda/mirage/scenarios/default", ["exports"], function (exports) {
  exports["default"] = function () /* server */{

    /*
      Seed your development database using your factories.
      This data will not be loaded in your tests.
       Make sure to define a factory for each model you want to create.
    */

    // server.createList('post', 10);
  };
});
define('agenda/mirage/serializers/application', ['exports', 'ember-cli-mirage'], function (exports, _emberCliMirage) {
  exports['default'] = _emberCliMirage.JSONAPISerializer.extend({});
});
define('agenda/models/todo', ['exports', 'ember-data'], function (exports, _emberData) {
	exports['default'] = _emberData['default'].Model.extend({
		title: _emberData['default'].attr('string'),
		body: _emberData['default'].attr('string'),
		date: _emberData['default'].attr('date'),
		created_at: _emberData['default'].attr('string', {
			defaultValue: function defaultValue() {
				return new Date();
			}
		})

	});
});
define('agenda/resolver', ['exports', 'ember-resolver'], function (exports, _emberResolver) {
  exports['default'] = _emberResolver['default'];
});
define('agenda/router', ['exports', 'ember', 'agenda/config/environment'], function (exports, _ember, _agendaConfigEnvironment) {

  var Router = _ember['default'].Router.extend({
    location: _agendaConfigEnvironment['default'].locationType,
    rootURL: _agendaConfigEnvironment['default'].rootURL
  });

  Router.map(function () {
    this.resource('todos', function () {
      this.route('new');
      this.route('edit', { path: '/edit/:todo_id' });
    });
  });

  exports['default'] = Router;
});
define('agenda/routes/todos', ['exports', 'ember'], function (exports, _ember) {
	exports['default'] = _ember['default'].Route.extend({
		model: function model() {
			return this.store.findAll('todo');
		}

	});
});
define('agenda/routes/todos/edit', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({});
});
define('agenda/routes/todos/new', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({});
});
define('agenda/services/ajax', ['exports', 'ember-ajax/services/ajax'], function (exports, _emberAjaxServicesAjax) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberAjaxServicesAjax['default'];
    }
  });
});
define('agenda/services/firebase-app', ['exports', 'emberfire/services/firebase-app'], function (exports, _emberfireServicesFirebaseApp) {
  exports['default'] = _emberfireServicesFirebaseApp['default'];
});
define('agenda/services/firebase', ['exports', 'emberfire/services/firebase'], function (exports, _emberfireServicesFirebase) {
  exports['default'] = _emberfireServicesFirebase['default'];
});
define("agenda/templates/application", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "sFNY9eUO", "block": "{\"statements\":[[\"text\",\" \\n\\n \"],[\"open-element\",\"nav\",[]],[\"static-attr\",\"class\",\"navbar navbar-inverse \"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"container\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"navbar-header\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"class\",\"navbar-toggle collapsed\"],[\"static-attr\",\"data-toggle\",\"collapse\"],[\"static-attr\",\"data-target\",\"#navbar\"],[\"static-attr\",\"aria-expanded\",\"false\"],[\"static-attr\",\"aria-controls\",\"navbar\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"sr-only\"],[\"flush-element\"],[\"text\",\"Toggle navigation\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"icon-bar\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"icon-bar\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"icon-bar\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"class\",\"navbar-brand\"],[\"static-attr\",\"href\",\"#\"],[\"flush-element\"],[\"text\",\"Agenda\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"id\",\"navbar\"],[\"static-attr\",\"class\",\"collapse navbar-collapse\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"ul\",[]],[\"static-attr\",\"class\",\"nav navbar-nav\"],[\"flush-element\"],[\"text\",\"\\n           \\n          \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"comment\",\"/.nav-collapse \"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"container\"],[\"flush-element\"],[\"text\",\"\\n\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12\"],[\"flush-element\"],[\"text\",\"\\n        \\t\"],[\"append\",[\"unknown\",[\"outlet\"]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n\\n    \"],[\"close-element\"],[\"comment\",\" /.container \"],[\"text\",\"\\n\\n\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "agenda/templates/application.hbs" } });
});
define("agenda/templates/index", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "QzEEhd3m", "block": "{\"statements\":[[\"open-element\",\"h1\",[]],[\"static-attr\",\"class\",\"text-center\"],[\"flush-element\"],[\"text\",\"Crie uma lista \"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"open-element\",\"h4\",[]],[\"static-attr\",\"class\",\"text-center\"],[\"flush-element\"],[\"text\",\"\\nEsta aplicação vai o ajudar a organizar a  vida \"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\nclick abaixo para comecar.\\n\"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"text-center\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"link-to\"],[\"todos\"],[[\"class\"],[\"btn  btn-success\"]],0],[\"close-element\"],[\"text\",\"\\t\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"\\tCriar sua primeira lista\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "agenda/templates/index.hbs" } });
});
define("agenda/templates/todos", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "6KguWa00", "block": "{\"statements\":[[\"text\",\"\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\" \\n\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-4\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"link-to\"],[\"todos.new\"],[[\"class\"],[\"btn btn-success\"]],6],[\"text\",\"\\n\\t\"],[\"open-element\",\"hr\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\\t\\t\"],[\"append\",[\"unknown\",[\"outlet\"]],false],[\"text\",\"\\n\\t\"],[\"close-element\"],[\"text\",\"\\n\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-8\"],[\"flush-element\"],[\"text\",\"\\n\\n\\t  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n\\t  \\t\\t \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12\"],[\"flush-element\"],[\"text\",\"\\n\\t  \\t\\t \\t \"],[\"open-element\",\"form\",[]],[\"static-attr\",\"class\",\"form-inline\"],[\"flush-element\"],[\"text\",\"\\n\\n\\t  \\t\\t \\t \\t \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n\\n\\t  \\t\\t \\t \\t  \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"class\",\"value\",\"id\",\"placeholder\"],[\"text\",\"form-control\",[\"get\",[\"filter\"]],\"search\",\"Search a Todos....\"]]],false],[\"text\",\"\\n\\n\\t  \\t\\t \\t \\t \"],[\"close-element\"],[\"text\",\"\\n\\n\\t  \\t\\t \\t \\t \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"submit\"],[\"static-attr\",\"class\",\"btn btn-primary\"],[\"flush-element\"],[\"text\",\" Search \"],[\"close-element\"],[\"text\",\"\\n\\t  \\t\\t \\t \"],[\"close-element\"],[\"text\",\"\\n\\t  \\t\\t \"],[\"close-element\"],[\"text\",\"\\n\\t   \"],[\"close-element\"],[\"text\",\"\\n\\n\\t   \"],[\"open-element\",\"hr\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\" \"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"block\",[\"if\"],[[\"get\",[\"filter\"]]],null,5,2],[\"text\",\"\\n\\t\\t\\n\\n\\t\\t\\n\\t\"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\\n\\n\\n\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"\\t\\t\\t\\t\\t\"],[\"append\",[\"unknown\",[\"todo\",\"title\"]],false],[\"text\",\" \\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"\\t\\t\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"well\"],[\"flush-element\"],[\"text\",\"\\n\\t\\t\\t\\t\"],[\"open-element\",\"h4\",[]],[\"flush-element\"],[\"text\",\"\\n\\n\"],[\"block\",[\"link-to\"],[\"todos.edit\",[\"get\",[\"todo\",\"id\"]]],null,0],[\"text\",\"\\n\\t\\t\\t\\t\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"label label-primary pull-right\"],[\"flush-element\"],[\"append\",[\"helper\",[\"format-date\"],[[\"get\",[\"todo\",\"date\"]]],null],false],[\"close-element\"],[\"text\",\"\\n\\t\\t\\t\\t\"],[\"close-element\"],[\"text\",\"\\n\\n\\t\\t\\t\\t\"],[\"append\",[\"helper\",[\"format-markdown\"],[[\"get\",[\"todo\",\"body\"]]],null],false],[\"text\",\"\\n\\t\\t\\t\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[\"todo\"]},{\"statements\":[[\"block\",[\"each\"],[[\"get\",[\"sortedTodos\"]]],null,1],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"\\t\\t\\t\\t\\t\"],[\"append\",[\"unknown\",[\"todo\",\"title\"]],false],[\"text\",\" \\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"\\t\\t\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"well\"],[\"flush-element\"],[\"text\",\"\\n\\t\\t\\t\\t\"],[\"open-element\",\"h4\",[]],[\"flush-element\"],[\"text\",\"\\n\\n\"],[\"block\",[\"link-to\"],[\"todos.edit\",[\"get\",[\"todo\",\"id\"]]],null,3],[\"text\",\"\\n\\t\\t\\t\\t\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"label label-primary pull-right\"],[\"flush-element\"],[\"append\",[\"helper\",[\"format-date\"],[[\"get\",[\"todo\",\"date\"]]],null],false],[\"close-element\"],[\"text\",\"\\n\\t\\t\\t\\t\"],[\"close-element\"],[\"text\",\"\\n\\n\\t\\t\\t\\t\"],[\"append\",[\"helper\",[\"format-markdown\"],[[\"get\",[\"todo\",\"body\"]]],null],false],[\"text\",\"\\n\\t\\t\\t\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[\"todo\"]},{\"statements\":[[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"filteredTodos\"]]],null,4],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"\\t\\t\\tCreate Todo\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "agenda/templates/todos.hbs" } });
});
define("agenda/templates/todos/edit", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "sqjdVJS8", "block": "{\"statements\":[[\"open-element\",\"form\",[]],[\"static-attr\",\"id\",\"edit-todo-form\"],[\"flush-element\"],[\"text\",\"\\n\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n\\t\\t\"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"Title\"],[\"close-element\"],[\"text\",\"\\n\\t\\t\"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"class\",\"value\",\"placeholder\"],[\"text\",\"form-control\",[\"get\",[\"model\",\"title\"]],\"Add Todo...\"]]],false],[\"text\",\"\\n\\t\"],[\"close-element\"],[\"text\",\"\\n\\n\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n\\t\\t\"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"Due Date\"],[\"close-element\"],[\"text\",\"\\n\\t\\t\"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"class\",\"value\"],[\"date\",\"form-control\",[\"get\",[\"model\",\"date\"]]]]],false],[\"text\",\"\\n\\t\"],[\"close-element\"],[\"text\",\"\\n\\n\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n\\t\\t\"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"Body\"],[\"close-element\"],[\"text\",\"\\n\\t\\t\"],[\"append\",[\"helper\",[\"textarea\"],null,[[\"class\",\"value\",\"placeholder\"],[\"form-control\",[\"get\",[\"model\",\"body\"]],\"Todo Body...\"]]],false],[\"text\",\"\\n\\t\"],[\"close-element\"],[\"text\",\"\\n\\n\\t\"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn btn-info\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"editTodo\",[\"get\",[\"model\",\"id\"]]]],[\"flush-element\"],[\"text\",\"\\n\\t\\tSubmit\\n\\t\"],[\"close-element\"],[\"text\",\"\\n\\n\\t\\n\\n\\t\"],[\"block\",[\"link-to\"],[\"todos\"],[[\"class\"],[\"btn btn-warning\"]],0],[\"text\",\"\\n\\n\\t\"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn btn-danger pull-right\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"deleteTodo\",[\"get\",[\"model\",\"id\"]]]],[\"flush-element\"],[\"text\",\"\\n\\t\\tDelete\\n\\t\"],[\"close-element\"],[\"text\",\"\\n\\t\\n\"],[\"close-element\"],[\"text\",\"\\n\\n\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\" Close \"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "agenda/templates/todos/edit.hbs" } });
});
define("agenda/templates/todos/new", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "wpyZ0gEL", "block": "{\"statements\":[[\"open-element\",\"form\",[]],[\"static-attr\",\"id\",\"new-todo-form\"],[\"flush-element\"],[\"text\",\"\\n\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n\\t\\t\"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"Title\"],[\"close-element\"],[\"text\",\"\\n\\t\\t\"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"class\",\"value\",\"placeholder\"],[\"text\",\"form-control\",[\"get\",[\"title\"]],\"Add Todo...\"]]],false],[\"text\",\"\\n\\t\"],[\"close-element\"],[\"text\",\"\\n\\n\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n\\t\\t\"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"Due Date\"],[\"close-element\"],[\"text\",\"\\n\\t\\t\"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"class\",\"value\"],[\"date\",\"form-control\",[\"get\",[\"date\"]]]]],false],[\"text\",\"\\n\\t\"],[\"close-element\"],[\"text\",\"\\n\\n\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n\\t\\t\"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"Body\"],[\"close-element\"],[\"text\",\"\\n\\t\\t\"],[\"append\",[\"helper\",[\"textarea\"],null,[[\"class\",\"value\",\"placeholder\"],[\"form-control\",[\"get\",[\"body\"]],\"Todo Body...\"]]],false],[\"text\",\"\\n\\t\"],[\"close-element\"],[\"text\",\"\\n\\n\\t\"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn btn-info\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"addTodo\"]],[\"flush-element\"],[\"text\",\"\\n\\t\\tSubmit\\n\\t\"],[\"close-element\"],[\"text\",\"\\n\\t\"],[\"block\",[\"link-to\"],[\"todos\"],[[\"class\"],[\"btn btn-warning\"]],0],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\\n\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\" Close \"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "agenda/templates/todos/new.hbs" } });
});
define('agenda/tests/mirage/mirage/config.jshint.lint-test', ['exports'], function (exports) {
  QUnit.module('JSHint | mirage/config.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(false, 'mirage/config.js should pass jshint.\nmirage/config.js: line 1, col 1, \'export\' is only available in ES6 (use \'esversion: 6\').\n\n1 error');
  });
});
define('agenda/tests/mirage/mirage/scenarios/default.jshint.lint-test', ['exports'], function (exports) {
  QUnit.module('JSHint | mirage/scenarios/default.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(false, 'mirage/scenarios/default.js should pass jshint.\nmirage/scenarios/default.js: line 1, col 1, \'export\' is only available in ES6 (use \'esversion: 6\').\n\n1 error');
  });
});
define('agenda/tests/mirage/mirage/serializers/application.jshint.lint-test', ['exports'], function (exports) {
  QUnit.module('JSHint | mirage/serializers/application.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(false, 'mirage/serializers/application.js should pass jshint.\nmirage/serializers/application.js: line 1, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\nmirage/serializers/application.js: line 3, col 1, \'export\' is only available in ES6 (use \'esversion: 6\').\n\n2 errors');
  });
});
define('agenda/torii-providers/firebase', ['exports', 'emberfire/torii-providers/firebase'], function (exports, _emberfireToriiProvidersFirebase) {
  exports['default'] = _emberfireToriiProvidersFirebase['default'];
});
/* jshint ignore:start */



/* jshint ignore:end */

/* jshint ignore:start */

define('agenda/config/environment', ['ember'], function(Ember) {
  var prefix = 'agenda';
/* jshint ignore:start */

try {
  var metaName = prefix + '/config/environment';
  var rawConfig = document.querySelector('meta[name="' + metaName + '"]').getAttribute('content');
  var config = JSON.parse(unescape(rawConfig));

  var exports = { 'default': config };

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

/* jshint ignore:end */

});

/* jshint ignore:end */

/* jshint ignore:start */

if (!runningTests) {
  require("agenda/app")["default"].create({"name":"agenda","version":"0.0.0+0f09165e"});
}

/* jshint ignore:end */
//# sourceMappingURL=agenda.map
