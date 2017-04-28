'use strict';

const jsforce = require('jsforce');

/**
 * @class
 * @param {Object} options					The object containing all the connection options.
 * @param {string} options.username	The username for the salesforce service cloud account.
 * @param {string} options.password	The password for the salesforce service cloud account.
 * @param {string} options.loginUrl	The URL to the loginpage of the saleforce instance.
 *
 * @example
 * const ServiceCloud = require('./lib/sfdc.js');
 * const sfdc = new ServiceCloud({
 * 	username: 'some@email.com',
 * 	password: 'secretAndSecurePassword!',
 * 	loginUrl: 'https://login.salesforce.com'
 * });
 */
class ServiceCloud {
	constructor (options) {
		this.username = options.username;
		this.password = options.password;
		this.loginUrl = options.loginUrl;
		this.conn = {};
	}

	/**
	 * Establishes a connection to Salesforce Service Cloud if not already connected.
	 * @param  {Function} cb Function that is called as soon as work is done or an error occurs.
	 * @private
	 */
	_login (cb) {
		const self = this;

		if (typeof self.conn.accessToken === 'undefined') {
			self.conn = new jsforce.Connection({
				loginUrl: self.loginUrl
			});
			self.conn.login(self.username, self.password, (e, info) => {
				if (e)	return cb(e);

				self.conn = new jsforce.Connection({
					instanceUrl: self.conn.instanceUrl,
					accessToken: self.conn.accessToken
				});
				self.conn.bulk.pollTimeout = 60000;
				return cb(undefined);
			});
		} else	return cb(undefined);
	}

	/**
	 * Checks if the session is expired and resets the connection if necessary
	 * @param  {object} e Error object returned by jsforce
	 * @return {boolean}  True if there was a connection error, otherwise false.
	 * @private
	 */
	_checkIfSessionIsExpired (e) {
		const self = this;

		if (e && e.errorCode.indexOf('INVALID_SESSION_ID') >= 0) {
			self.conn = {};
			return true;
		}
		return false;
	}

	/**
	 * Example of how your function handling the Service Cloud API-Call could look like.
	 *
	 * @param  {string}   id The salesforce id of the instance of <INSERT YOUR OBJECT HERE> to query
	 * @param  {Function} cb Function that is called as soon as work is done or an error occurs.
	 */
	retrieveFieldOfObject (id, cb) {
		// Check if valid 15 or 18 digit Salesforce-Id is given.
		if (!/^([a-zA-Z0-9]{15}|[a-zA-Z0-9]{18})$/g.test(id)) return cb(new Error('Invalid Salesforce-Id given.'));

		const self = this;
		const query = 'SELECT <INSERT NAME OF FIELD HERE> FROM <INSERT YOUR OBJECT HERE> WHERE Id = \'' + id + '\'';

		// Login if necessary
		self._login((e) => {
			if (e)	return cb(e);

			// Try the query
			self.conn.query(query, (e, r) => {
				// If there was an error, check if only the session expired
				if (e && self._checkIfSessionIsExpired(e)) {
					// If the session has expired, call this function again, as the connection
					// object has now been reset and another login will be performed next time
					return self.retrieveFieldOfObject(id, cb);
				} else if (e) {
					return cb(e);
				}

				if (r.records.length === 1) {
					return cb(undefined, r.records[0].<INSERT NAME OF FIELD HERE>);
				} else {
					return cb(new Error('No unique result returned.'));
				}
			});
		});
	}
}

module.exports = ServiceCloud;
