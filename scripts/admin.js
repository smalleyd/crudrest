var AdminApp = new TabTemplate();

AdminApp.TABS = [ { id: 'doClients', caption: 'Clients' }, { id: 'doJobs', caption: 'Jobs' },
	{ id: 'doUsers', caption: 'Users' }, { id: 'doApplications', caption: 'Applications' },
	{ id: 'doDocuments', caption: 'Documents' },
	{ id: 'doLanguages', caption: 'Languages' }, { id: 'doMailTemplates', caption: 'Mail Templates' } ];

AdminApp.doClients = function(body) { ClientsHandler.init(body); }
AdminApp.doJobs = function(body) { JobsHandler.init(body); }
AdminApp.doUsers = function(body) { UsersHandler.init(body); }
AdminApp.doApplications = function(body) { ApplicationsHandler.init(body); }
AdminApp.doDocuments = function(body) { DocumentsHandler.init(body); }
AdminApp.doLanguages = function(body) { LanguagesHandler.init(body); }
AdminApp.doMailTemplates = function(body) { MailTemplatesHandler.init(body); }

var ClientsHandler = new ListTemplate({
	NAME: 'client',
	SINGULAR: 'Client',
	PLURAL: 'Clients',
	RESOURCE: 'clients',
	IDENTIFIER: 'code',
	CAN_ADD: true,
	CAN_EDIT: true,
	COLUMNS: [ new TextColumn('id', 'ID', undefined, true),
		new EditColumn('code', 'Code'), new EditColumn('name', 'Name'),
		new TextColumn('emailPrefix', 'Email Prefix'), new TextColumn('responseHost', 'Response Host'),
		new TextColumn('active', 'Active'),
		new TextColumn('createdAt', 'Created At', 'toDateTime'),
		new TextColumn('updatedAt', 'Updated At', 'toDateTime') ],
	FIELDS: [ new TextField('id', 'ID'),
	    new EditField('code', 'Code', true, false, 64, 50),
		new EditField('name', 'Name', true, false, 128, 50),
		new EditField('emailPrefix', 'Email Prefix', true, false, 32, 30),
		new EditField('responseHost', 'Response Host', true, false, 128, 50),
		new EditField('resumeMinSize', 'Resume Min Size', true, false, 19, 10),
		new EditField('resumeMaxSize', 'Resume Max Size', true, false, 19, 10),
		new BoolField('resumeRequiresExtension', 'Resume Requires Extension?', true),
		new EditField('resumeLocale', 'Resume Locale', true, false, 5, 5),
		new BoolField('answerPurgerEnabled', 'Answer Purger Enabled?', true),
		new BoolField('knockoutChangeAnswersEnabled', 'Can Change Knocked Out Answers?', true),
		new BoolField('autoSubmitCompletedApps', 'Auto Submit Completed Apps?', true),
		new BoolField('autoSubmitKnockedoutApps', 'Auto Submit Knockedout Apps?', true),
		new EditField('careersEmailAddress', 'Careers Email Address', false, false, 255, 50),
		new DropField('defaultLanguageId', 'Select Default Language', true, 'languages', 'defaultLanguageName'),
		new TextField('defaultLanguageName', 'Selected Default Language', undefined, undefined, true),
		new MultiField('documentMimeTypes', 'Document MIME Types', true, 60, 5),
		new MultiField('textResumeSources', 'Text Resume Sources', true, 60, 5),
		new BoolField('active', 'Is Active?', true),
		new TextField('createdAt', 'Created At', 'toDateTime'),
		new TextField('updatedAt', 'Updated At', 'toDateTime') ],
	SEARCH: {
		NAME: 'client',
		SINGULAR: 'Client',
		PLURAL: 'Clients',
		RESOURCE: 'clients',
		FIELDS: [ new EditField('id', 'ID', false, false, 20, 10),
	  	    new EditField('code', 'Code', false, false, 64, 50),
			new EditField('name', 'Name', false, false, 128, 50),
			new EditField('emailPrefix', 'Email Prefix', false, false, 32, 30),
			new EditField('responseHost', 'Response Host', false, false, 128, 50),
			new RangeField('resumeMinSize', 'Resume Min Size', false, 19, 10),
			new RangeField('resumeMaxSize', 'Resume Max Size', false, 19, 10),
			new ListField('resumeRequiresExtension', 'Resume Requires Extension?', false, 'yesNoOptions', undefined, 'No Search'),
			new EditField('resumeLocale', 'Resume Locale', false, false, 5, 5),
			new ListField('answerPurgerEnabled', 'Answer Purger Enabled?', false, 'yesNoOptions', undefined, 'No Search'),
			new ListField('knockoutChangeAnswersEnabled', 'Can Change Knocked Out Answers?', false, 'yesNoOptions', undefined, 'No Search'),
			new ListField('autoSubmitCompletedApps', 'Auto Submit Completed Apps?', false, 'yesNoOptions', undefined, 'No Search'),
			new ListField('autoSubmitKnockedoutApps', 'Auto Submit Knockedout Apps?', false, 'yesNoOptions', undefined, 'No Search'),
			new EditField('careersEmailAddress', 'Careers Email Address', false, false, 255, 50),
			new DropField('defaultLanguageId', 'Select Default Language', true, 'languages', 'defaultLanguageName'),
			new TextField('defaultLanguageName', 'Selected Default Language', undefined, undefined, true),
			new ListField('active', 'Is Active?', false, 'yesNoOptions', undefined, 'No Search'),
			new DatesField('createdAt', 'Created At'),
			new DatesField('updatedAt', 'Updated At'),
			new ListField('pageSize', 'Page Size', false, 'pageSizeOptions', 'Number of records on the page', 'Default') ]
	}
});

var JobsHandler = new ListTemplate({
	NAME: 'job',
	SINGULAR: 'Job',
	PLURAL: 'Jobs',
	RESOURCE: 'jobs',
	CAN_ADD: true,
	CAN_EDIT: true,

	ROW_ACTIONS: [ new RowAction('openApplications', 'Applications') ],
	openApplications: function(c, e) { ApplicationsHandler.filter({ userId: e.myRecord.identifier }); },

	COLUMNS: [ new TextColumn('id', 'ID', undefined, true),
	           new TextColumn('clientCode', 'Client'),
	           new EditColumn('slug', 'Slug'),
	           new TextColumn('localeId', 'Locale'),
	           new EditColumn('source', 'Source'),
	           new EditColumn('title', 'Title'),
	           new TextColumn('active', 'Active?'),
	           new TextColumn('postedAt', 'Posted At', 'toDateTime'),
	           new TextColumn('createdAt', 'Created At', 'toDateTime'),
	           new TextColumn('updatedAt', 'Updated At', 'toDateTime') ],
	FIELDS: [ new TextField('id', 'ID'),
	          new DropField('clientId', 'Select Client', true, 'clients', 'clientCode'),
	          new TextField('clientCode', 'Selected Client', undefined, undefined, true),
	          new EditField('slug', 'Slug', true, false, 128, 50),
	          new EditField('localeId', 'Locale', true, false, 5, 5),
	          new EditField('reqId', 'Requisition ID', false, false, 128, 50),
	          new EditField('source', 'Source', false, false, 128, 50),
	          new EditField('brand', 'Brand', false, false, 64, 50),
	          new EditField('title', 'Title', true, false, 128, 50),
	          new EditField('description', 'Description', true, true, 60, 15),
	          new EditField('address1', 'Address 1', false, false, 128, 50),
	          new EditField('city', 'City', false, false, 64, 50),
	          new EditField('state', 'State', false, false, 64, 50),
	          new EditField('country', 'Country', false, false, 64, 50),
	          new EditField('latitude', 'Latitude', false, false, 12, 10),
	          new EditField('longitude', 'Longitude', false, false, 12, 10),
	          new EditField('applyUrl', 'Apply URL', false, false, 255, 50),
	          new BoolField('active', 'Is Active?', true),
	          new MultiField('categories', 'Categories', false, 60, 5),
	          new MultiField('tags', 'Tags', false, 60, 5),
	          new StampField('postedAt', 'Posted At', false),
	          new TextField('hasQuestions', 'Has Questions?'),
	          new TextField('questionVersion', 'Question Version'),
	          new TextField('createdAt', 'Created At', 'toDateTime'),
	          new TextField('updatedAt', 'Updated At', 'toDateTime') ],
	SEARCH: {
		NAME: 'job',
		SINGULAR: 'Job',
		PLURAL: 'Jobs',
		RESOURCE: 'jobs',
		FIELDS: [ new EditField('id', 'ID', false, false, 20, 10),
		          new DropField('clientId', 'Select Client', false, 'clients', 'clientName'),
		          new TextField('clientName', 'Selected Client', undefined, undefined, true),
		          new EditField('slug', 'Slug', false, false, 128, 50),
		          new EditField('localeId', 'Locale', false, false, 5, 5),
		          new EditField('reqId', 'Requisition ID', false, false, 128, 50),
		          new EditField('source', 'Source', false, false, 128, 50),
		          new EditField('brand', 'Brand', false, false, 64, 50),
		          new EditField('title', 'Title', false, false, 128, 50),
		          new EditField('description', 'Description', false, false, 128, 50),
		          new EditField('address1', 'Address 1', false, false, 128, 50),
		          new EditField('city', 'City', false, false, 64, 50),
		          new EditField('state', 'State', false, false, 64, 50),
		          new EditField('country', 'Country', false, false, 64, 50),
		          new RangeField('latitude', 'Latitude', false, 12, 10),
		          new RangeField('longitude', 'Longitude', false, 12, 10),
		          new EditField('applyUrl', 'Apply URL', false, false, 255, 50),
		          new ListField('active', 'Is Active?', false, 'yesNoOptions', undefined, 'No Search'),
		          new MultiField('includeCategories', 'Include Categories', false, 60, 5),
		          new MultiField('excludeCategories', 'Exclude Categories', false, 60, 5),
		          new MultiField('includeTags', 'Include Tags', false, 60, 5),
		          new MultiField('excludeTags', 'Exclude Tags', false, 60, 5),
		          new DatesField('postedAt', 'Posted At', false),
		          new DatesField('createdAt', 'Created At', false),
		          new DatesField('updatedAt', 'Updated At', false) ]
	}
});

var UsersHandler = new ListTemplate({
	NAME: 'user',
	SINGULAR: 'User',
	PLURAL: 'Users',
	RESOURCE: 'users',
	CAN_ADD: true,
	CAN_EDIT: true,

	ROW_ACTIONS: [ new RowAction('openApplications', 'Applications'),
	               new RowAction('openDocuments', 'Documents') ],

	openApplications: function(c, e) { ApplicationsHandler.filter({ userId: e.myRecord.identifier }); },
	openDocuments: function(c, e) { DocumentsHandler.filter({ userId: e.myRecord.identifier }); },

	COLUMNS: [ new TextColumn('identifier', 'ID', undefined, true),
	    new TextColumn('clientName', 'Client'),
		new EditColumn('id', 'Login ID'), new EditColumn('ats_username', 'ATS User Name'),
		new EditColumn('first_name', 'First Name'), new EditColumn('last_name', 'Last Name'),
		new TextColumn('createdAt', 'Created At', 'toDateTime', true), new TextColumn('updatedAt', 'Updated At', 'toDateTime') ],
	FIELDS: [ new TextField('identifier', 'ID'),
	    new DropField('clientId', 'Select Client', true, 'clients', 'clientName'),
	    new TextField('clientName', 'Selected Client', undefined, undefined, true),
		new EditField('id', 'Login ID', true, false, 128, 50),
		new EditField('ats_username', 'ATS User Name', true, false, 128, 50),
		new PassField('ats_password', 'ATS Password', true, false, 64, 50),
		new EditField('email', 'Email Address', false, false, 128, 50),
		new EditField('first_name', 'First Name', false, false, 100, 20),
		new EditField('last_name', 'Last Name', false, false, 100, 25),
		new EditField('address_1', 'Address 1', false, false, 100, 50),
		new EditField('address_2', 'Address 2', false, false, 100, 50),
		new EditField('city', 'City', false, false, 100, 50),
		new EditField('zip', 'Postal Code', false, false, 10, 10),
		new EditField('cellNumber', 'Cell Number', false, false, 25, 20),
		new EditField('homeNumber', 'Home Number', false, false, 25, 20),
		new EditField('webSite', 'Web Site', false, false, 255, 50),
		new TextField('createdAt', 'Created At', 'toDateTime'),
		new TextField('updatedAt', 'Updated At', 'toDateTime') ],
	SEARCH: {
		NAME: 'user',
		SINGULAR: 'User',
		PLURAL: 'Users',
		RESOURCE: 'users',
		FIELDS: [ new EditField('identifier', 'ID', false, false, 32, 32),
			new DropField('clientId', 'Select Client', true, 'clients', 'clientName'),
			new TextField('clientName', 'Selected Client', undefined, undefined, true),
			new EditField('id', 'Login ID', false, false, 128, 50),
			new EditField('ats_username', 'ATS User Name', false, false, 128, 50),
			new PassField('ats_password', 'ATS Password', false, false, 64, 50),
			new EditField('email', 'Email Address', false, false, 128, 50),
			new EditField('first_name', 'First Name', false, false, 100, 20),
			new EditField('last_name', 'Last Name', false, false, 100, 25),
			new EditField('address_1', 'Address 1', false, false, 100, 50),
			new EditField('address_2', 'Address 2', false, false, 100, 50),
			new EditField('city', 'City', false, false, 100, 50),
			new EditField('zip', 'Postal Code', false, false, 10, 10),
			new EditField('cellNumber', 'Cell Number', false, false, 25, 20),
			new EditField('homeNumber', 'Home Number', false, false, 25, 20),
			new EditField('webSite', 'Web Site', false, false, 255, 50),
			new DatesField('createdAt', 'Created At'),
			new DatesField('updatedAt', 'Updated At'),
			new ListField('pageSize', 'Page Size', false, 'pageSizes', 'Number of records on the page') ]
	}
});

var ApplicationsHandler = new ListTemplate({
	NAME: 'application',
	SINGULAR: 'Application',
	PLURAL: 'Applications',
	RESOURCE: 'applications',
	CAN_EDIT: true,

	ROW_ACTIONS: [ new RowAction('openDocuments', 'Documents') ],

	openDocuments: function(criteria, elem) {
		DocumentsHandler.filter({ applicationId: elem.myRecord.id });
	},

	// Can't update application so disable the checkboxes on the list.
	onListPostLoad: function(criteria) {
		$('input[type=checkbox]', criteria.body).attr('disabled', true);
	},

	COLUMNS: [ new TextColumn('id', 'ID', undefined, true),
	           new TextColumn('clientName', 'Client'),
	           new TextColumn('user_id', 'User'),
	           new TextColumn('slug', 'Job'),
	           new TextColumn('completed', 'Completed'),
	           new TextColumn('submitted', 'Submitted'),
	           new TextColumn('knockedout', 'Knockedout'),
	           new TextColumn('startedDate', 'Started At', 'toDateTime'),
	           new TextColumn('completedDate', 'Completed At', 'toDateTime') ],
	FIELDS: [ new TextField('id', 'ID'),
	          new TextField('clientName', 'Client'),
	          new TextField('user_id', 'User'),
	          new TextField('slug', 'Job'),
	          new TextField('status', 'Status'),
	          new TextField('responseEmail', 'Response Email'),
	          new TextField('biSessionId', 'BI Session ID'),
	          new TextField('source', 'Source'),
	          new TextField('completed', 'Completed?'),
	          new TextField('submitted', 'Submitted?'),
	          new TextField('knockedout', 'Knockedout?'),
	          new TextField('currentQuestionId', 'Current Question'),
	          new TextField('currentQuestionState', 'Current Question State'),
	          new TextField('applicationState', 'Stage'),
	          new TextField('metadataSource', 'Metadata Source'),
	          new TextField('completedDate', 'Completed At', 'toDateTime'),
	          new TextField('lastAnswerDate', 'Last Answer At', 'toDateTime'),
	          new TextField('startedDate', 'Created At', 'toDateTime'),
	          new TextField('updatedAt', 'Updated At', 'toDateTime') ],
	SEARCH: {
		NAME: 'application',
		SINGULAR: 'Application',
		PLURAL: 'Applications',
		RESOURCE: 'applications',
		FIELDS: [ new EditField('id', 'ID', false, false, 20, 10),
		          new DropField('clientId', 'Select Client', false, 'clients', 'clientName'),
		          new TextField('clientName', 'Selected Client', undefined, undefined, true),
		          new EditField('loginId', 'User', false, false, 128, 50),
		          new EditField('slug', 'Job', false, false, 128, 50),
		          new EditField('status', 'Status', false, false, 255, 50),
		          new EditField('responseEmail', 'Response Email', false, false, 255, 50),
		          new EditField('biSessionId', 'BI Session ID', false, false, 255, 50),
		          new EditField('source', 'Source', false, false, 255, 50),
		          new ListField('completed', 'Completed?', false, 'yesNoOptions', undefined, 'No Search'),
		          new ListField('submitted', 'Submitted?', false, 'yesNoOptions', undefined, 'No Search'),
		          new ListField('knockedout', 'Knockedout?', false, 'yesNoOptions', undefined, 'No Search'),
		          new EditField('currentQuestionAtsId', 'Current Question', false, false, 255, 50),
		          new ListField('currentQuestionStateId', 'Current Question State', false, 'questionStates', undefined, 'No Search'),
		          new ListField('stageId', 'Stage', false, 'stages', undefined, 'No Search'),
		          new EditField('metadataSource', 'Metadata Source', false, false, 255, 50),
		          new DatesField('completedAt', 'Completed At'),
		          new DatesField('lastAnswerAt', 'Last Answer At'),
		          new DatesField('createdAt', 'Created At'),
		          new DatesField('updatedAt', 'Updated At'),
		          new ListField('pageSize', 'Page Size', false, 'pageSizes', 'Number of records on the page') ]
	}
});

var DocumentsHandler = new ListTemplate({
	NAME: 'document',
	SINGULAR: 'Document',
	PLURAL: 'Documents',
	RESOURCE: 'documents',
	CAN_EDIT: true,
	EDIT_METHOD: 'put',

	// Can't update application so disable the checkboxes on the list.
	onListPostLoad: function(criteria) {
		$('input[type=checkbox]', criteria.body).attr('disabled', true);
	},

	COLUMNS: [ new TextColumn('id', 'ID', undefined, true),
	           new TextColumn('userId', 'User'),
	           new TextColumn('file_name', 'File'),
	           new TextColumn('type', 'Type'),
	           new TextColumn('emailIdentifier', 'Email'),
	           new TextColumn('source', 'Source'),
	           new TextColumn('mimeType', 'MIME Type'),
	           new TextColumn('size', 'Size', 'toSize'),
	           new TextColumn('uploaded', 'Uploaded?'),
	           new TextColumn('uploadedAt', 'Uploaded At', 'toDateTime'),
	           new TextColumn('createdAt', 'Created At', 'toDateTime') ],
	FIELDS: [ new TextField('id', 'ID'),
	          new TextField('userId', 'User ID'),
	          new EditField('file_name', 'File Name', true, false, 512, 50),
	          new ListField('type', 'Type', true, 'documentTypesX'),
	          new EditField('emailIdentifier', 'Email Identifier', false, false, 255, 50),
	          new DropField('languageId', 'Select Language', false, 'languages', 'languageName'),
	          new TextField('languageName', 'Selected Language', undefined, undefined, true),
	          new ListField('source', 'Source', true, 'documentSources'),
	          new EditField('mimeType', 'MIME Type', false, false, 255, 50),
	          new EditField('size', 'Size', false, false, 20, 10),
	          new BoolField('uploaded', 'Is Uploaded?', true),
	          new TextField('uploadedAt', 'Uploaded At', 'toDateTime'),
	          new TextField('createdAt', 'Created At', 'toDateTime'),
	          new TextField('updatedAt', 'Updated At', 'toDateTime') ],
	SEARCH: {
		NAME: 'document',
		SINGULAR: 'Document',
		PLURAL: 'Documents',
		RESOURCE: 'documents',
		FIELDS: [ new EditField('id', 'ID', false, false, 20, 10),
		          new DropField('clientId', 'Select Client', false, 'clients', 'clientName'),
		          new TextField('clientName', 'Selected Client', undefined, undefined, true),
		          new DropField('userId', 'Select User', false, function(c) {
		        	  var id = c.extra.form.clientId.value;
		        	  if ('' == id)
		        	  {
		        		  window.alert('Please select a client first.');
		        		  DropdownList.focus(c.extra.form, 'clientId');
		        		  return;
		        	  }

		        	  Template.get('clients/' + id + '/users/find', { name: c.field.value }, function(data) {
		        		  c.caller.fill(c, data);
		        	  });
		          }, 'userName'),
		          new TextField('userName', 'Selected User', undefined, undefined, true),
		          new DropField('jobId', 'Select Job', false, function(c) {
		        	  var id = c.extra.form.clientId.value;
		        	  if ('' == id)
		        	  {
		        		  window.alert('Please select a client first.');
		        		  DropdownList.focus(c.extra.form, 'clientId');
		        		  return;
		        	  }

		        	  Template.get('clients/' + id + '/jobs/find', { name: c.field.value }, function(data) {
		        		  c.caller.fill(c, data);
		        	  });
		          }, 'jobName'),
		          new TextField('jobName', 'Selected Job', undefined, undefined, true),
		          new EditField('fileName', 'File Name', false, false, 255, 50),
		          new ListField('typeId', 'Type', false, 'documentTypes', undefined, 'No Search'),
		          new EditField('emailIdentifier', 'Email Identifier', false, false, 255, 50),
		          new DropField('languageId', 'Select Language', false, 'languages', 'languageName'),
		          new TextField('languageName', 'Selected Language', undefined, undefined, true),
		          new ListField('source', 'Source', false, 'documentSources', undefined, 'No Search'),
		          new EditField('mimeType', 'MIME Type', false, false, 255, 50),
		          new RangeField('size', 'Size', false, 20, 10),
		          new ListField('uploaded', 'Is Uploaded?', false, 'yesNoOptions', undefined, 'No Search'),
		          new DatesField('uploadedAt', 'Uploaded At'),
		          new DatesField('createdAt', 'Created At'),
		          new DatesField('updatedAt', 'Updated At'),
		          new ListField('pageSize', 'Page Size', false, 'pageSizes', 'Number of records on the page') ]
	}
});

var LanguagesHandler = new ListTemplate({
	NAME: 'language',
	SINGULAR: 'Language',
	PLURAL: 'Languages',
	RESOURCE: 'languages',
	CAN_ADD: true,
	CAN_EDIT: true,
	COLUMNS: [ new TextColumn('id', 'ID', undefined, true),
	           new EditColumn('name', 'Name'),
	           new TextColumn('active', 'Active?') ],
	FIELDS: [ new EditField('id', 'ID', true, false, 5, 5),
	          new EditField('name', 'Name', true, false, 64, 50),
	          new BoolField('active', 'Is Active?', true) ] /*,
	SEARCH: {
		NAME: 'language',
		SINGULAR: 'Language',
		PLURAL: 'Languages',
		RESOURCE: 'languages',
		FIELDS: []
	} */
});

var MailTemplatesHandler = new ListTemplate({
	NAME: 'mailTemplate',
	SINGULAR: 'Mail Template',
	PLURAL: 'Mail Templates',
	RESOURCE: 'mailTemplates',
	CAN_ADD: true,
	CAN_EDIT: true,
	COLUMNS: [ new TextColumn('id', 'ID', undefined, true),
	           new TextColumn('clientName', 'Client'),
	           new EditColumn('name', 'Name'),
	           new TextColumn('languageName', 'Language'),
	           new TextColumn('active', 'Active?'),
	           new TextColumn('createdAt', 'Created At', 'toDateTime'),
	           new TextColumn('updatedAt', 'Updated At', 'toDateTime') ],
	FIELDS: [ new TextField('id', 'ID'),
	          new DropField('clientId', 'Select Client', true, 'clients', 'clientName'),
	          new TextField('clientName', 'Selected Client', undefined, undefined, true),
	          new EditField('name', 'Name', true, false, 64, 50),
	          new DropField('languageId', 'Select Language', true, 'languages', 'languageName'),
	          new TextField('languageName', 'Selected Language', undefined, undefined, true),
	          new EditField('subject', 'Subject', false, false, 255, 50),
	          new EditField('body', 'Body', false, true, 60, 10),
	          new BoolField('active', 'Is Active?', true),
	          new TextField('createdAt', 'Created At', 'toDateTime'),
	          new TextField('updatedAt', 'Updated At', 'toDateTime') ],
	SEARCH: {
		NAME: 'mailTemplate',
		SINGULAR: 'Mail Template',
		PLURAL: 'Mail Templates',
		RESOURCE: 'mailTemplates',
		FIELDS: [ new EditField('id', 'ID', false, false, 20, 10),
		          new DropField('clientId', 'Select Client', false, 'clients', 'clientName'),
		          new TextField('clientName', 'Selected Client', undefined, undefined, true),
		          new EditField('name', 'Name', false, false, 64, 50),
		          new DropField('languageId', 'Select Language', false, 'languages', 'languageName'),
		          new TextField('languageName', 'Selected Language', undefined, undefined, true),
		          new EditField('subject', 'Subject', false, false, 255, 50),
		          new EditField('body', 'Body', false, false, 255, 50),
		          new ListField('active', 'Is Active?', false, 'yesNoOptions', undefined, 'No Search'),
		          new DatesField('createdAt', 'Created At'),
		          new DatesField('updatedAt', 'Updated At'),
		          new ListField('pageSize', 'Page Size', false, 'pageSizes', 'Number of records on the page') ]
	}
});
