const mongoose = require('mongoose');
const { applyPatch } = require('fast-json-patch');
const jsonpointer = require('jsonpointer');
const { deepCopy, calculateBudget } = require('@cms-eapd/common');
const logger = require('../logger')('db/apds');
const { updateStateProfile } = require('./states');
const { validateApd } = require('../schemas');

const createAPD = async (apd, { APD = mongoose.model('APD') } = {}) => {
  let newApd = new APD(apd);

  newApd = await newApd.save();
  return newApd._id.toString(); // eslint-disable-line no-underscore-dangle
};

const deleteAPDByID = async (id, { APD = mongoose.model('APD') } = {}) =>
  APD.updateOne({ _id: id }, { status: 'archived' }).exec();

const getAllAPDsByState = async (
  stateId,
  { APD = mongoose.model('APD') } = {}
) =>
  APD.find(
    { stateId, status: 'draft' },
    '_id id createdAt updatedAt stateId status name years'
  ).lean();

const getAPDByID = async (id, { APD = mongoose.model('APD') } = {}) =>
  APD.findById(id).lean();

const getAPDByIDAndState = (
  id,
  stateId,
  { APD = mongoose.model('APD') } = {}
) => APD.findOne({ _id: id, stateId }).lean();

// Apply the patches to the APD document
const patchAPD = async (
  id,
  stateId,
  apdDoc,
  patch,
  { APD = mongoose.model('APD') }
) => {
  // duplicate the apdDoc so that dates will be converted to strings
  const apdJSON = deepCopy(apdDoc);
  // apply the patches to the apd
  const { newDocument } = applyPatch(apdJSON, patch);
  // update the apd in the database
  await APD.replaceOne({ _id: id, stateId }, newDocument, {
    multipleCastError: true,
    runValidators: true
  });
  // return the updated apd
  return newDocument;
};

const updateAPDBudget = async (
  id,
  stateId,
  patch,
  { APD = mongoose.model('APD') }
) => {
  let updatedBudget;
  let errors;

  try {
    const apdDoc = await APD.findOne({ _id: id, stateId }).lean();
    const updatedDoc = await patchAPD(id, stateId, apdDoc, patch, { APD });
    updatedBudget = calculateBudget(updatedDoc);
  } catch (e) {
    errors = e;
  }

  return { updatedBudget, errors };
};

const updateAPDDocument = async (
  id,
  stateId,
  patch,
  {
    APD = mongoose.model('APD'),
    updateProfile = updateStateProfile,
    validate = validateApd
  } = {}
) => {
  // Get the updated apd json
  const apdDoc = await APD.findOne({ _id: id, stateId }).lean();
  if (patch.length > 0) {
    let updatedDoc;
    const updateErrors = {};
    let updated = [...patch];
    // Add updatedAt timestamp to the patch
    patch.push({
      op: 'replace',
      path: '/updatedAt',
      value: new Date().toISOString()
    });
    try {
      updatedDoc = await patchAPD(id, stateId, apdDoc, patch, { APD });
    } catch (err) {
      logger.error(`Error patching APD ${id}: ${JSON.stringify(err)}`);

      // convert patch array to a map to make it easier to update the error cases
      const updatedPatch = {};
      patch.forEach(({ op, path, value }) => {
        updatedPatch[path] = { op, path, value };
      });

      if (err?.errors) {
        Object.keys(err.errors).forEach(key => {
          const { name, message, stringValue, value, kind, valueType } =
            err.errors[key];

          // convert error path from mongo style to json patch style
          const dataPath = `/${key.replace(/\./g, '/')}`;
          // Add error to updateErrors map
          updateErrors[dataPath] = {
            dataPath,
            name,
            message,
            valueType,
            stringValue,
            kind,
            errorValue: value,
            newValue: null
          };

          // update the updatePatch to set the value to null instead of the invalid value
          updatedPatch[dataPath] = {
            op: 'replace',
            path: dataPath,
            value: null
          };
        });
      }

      // If there are errors, nothing was saved, so we need to try to update again
      const validPatches = Object.keys(updatedPatch).map(
        key => updatedPatch[key]
      );
      updatedDoc = await patchAPD(id, stateId, apdDoc, validPatches, { APD });

      // convert updatedPatch map to an array and set it to updated
      updated = Object.keys(updatedPatch).map(key => updatedPatch[key]);
    }

    // Determine if state profile needs to be updated in postgres
    const stateUpdated = patch.find(({ path }) =>
      path.includes('/keyStatePersonnel')
    );
    if (stateUpdated) {
      await updateProfile(stateId, updatedDoc.keyStatePersonnel);
    }

    // Will probably eventually switch to apd.validate
    const validationErrors = {};
    const valid = validate(deepCopy(updatedDoc));
    if (!valid) {
      // Rather than send back the full error from the validator, pull out just the relevant bits
      // and fetch the value that's causing the error.
      validate.errors.forEach(({ instancePath, message }) => {
        validationErrors[instancePath] = {
          dataPath: instancePath,
          message,
          value: jsonpointer.get(updatedDoc, instancePath)
        };
      });
    }

    return {
      errors: { ...updateErrors, ...validationErrors },
      apd: updatedDoc,
      stateUpdated,
      updated
    };
  }
  // If there are no patches, return the original APD
  return {
    apd: apdDoc,
    errors: {},
    stateUpdated: false,
    updated: []
  };
};

module.exports = {
  createAPD,
  deleteAPDByID,
  getAllAPDsByState,
  getAPDByID,
  getAPDByIDAndState,
  updateAPDBudget,
  updateAPDDocument
};
