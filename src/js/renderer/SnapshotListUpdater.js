'use strict';

const request = require('request');
const semver = require('semver');
const validateJSON = require('jsonschema').validate;

class UpdateError extends Error {
    constructor(errorCode, cause, ...params) {
        // Pass remaining arguments (including vendor specific ones) to parent constructor
        super(...params);

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, SnapshotListUpdater.UpdateError);
        }

        // Custom debugging information
        this.errorCode = errorCode;
        this.cause = cause;
    }
}

// error codes
UpdateError.ERROR_DOWNLOAD_FAILED = 1;
UpdateError.ERROR_VERSION_MISMATCH = 2;
UpdateError.ERROR_VALIDATION_FAILED = 3;

async function update(updateUrl) {
    return new Promise((resolve,reject) => {
        request.get({
            url: updateUrl,
        }, (err, res, body) => {
            if (err) {
                reject(new UpdateError(UpdateError.ERROR_DOWNLOAD_FAILED, err));
            } else if (res.statusCode !== 200) {
                reject(new UpdateError(UpdateError.ERROR_DOWNLOAD_FAILED, `Unexpected HTTP status code ${res.statusCode}`));
            } else {
                const json = JSON.parse(body);
                if (json.version && !semver.satisfies(json.version, expectedSemVer)) {
                    reject(new UpdateError(UpdateError.ERROR_VERSION_MISMATCH, `Expected: ${expectedSemVer}\nSupplied: ${json.version}`));
                } else {
                    const validationResult = validateJSON(json, schema);
                    if (validationResult.valid)
                        resolve(json);
                    else
                        reject(new UpdateError(UpdateError.ERROR_VALIDATION_FAILED, validationResult.errors));
                }
            }
        });
    });
}

const expectedSemVer = '^1.0.0';
const schema = {
    type: "object",
    properties: {
        "version": {
            type: "string",
            required: true
        },
        "snapshots": {
            type: "array",
            required: true,
            items: {
                type: "object",
                properties: {
                    "title": {
                        type: "string",
                        required: true
                    },
                    "url": {
                        type: "string",
                        required: true,
                        format: "uri"
                    },
                    "url_short": {
                        type: "string",
                        required: true,
                        format: "uri"
                    },
                    "pdf": {
                        type: "string",
                        required: true,
                        format: "uri"
                    },
                    "sha256": {
                        type: "string",
                        required: true,
                        pattern: /^[0-9a-f]{64}$/
                    },
                    "authors": {
                        type: "array",
                        required: true,
                        items: {
                            type: "string"
                        }
                    },
                    "doi": {
                        type: "string",
                        required: true,
                        pattern: new RegExp('^(10[.][0-9]{4,}(?:[.][0-9]+)*/(?:(?![%"#? ])\\S)+)$')
                    }
                }
            }
        }
    }
};

module.exports = {
    UpdateError: UpdateError,
    update: update,
};