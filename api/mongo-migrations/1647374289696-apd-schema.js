const logger = require('../logger')('mongoose-migrate/migrate-from-postgres');

/**
 * Update the APD schema to more closely match the front end nav/page sections
 */
async function up () {
  require('../models/apd'); // eslint-disable-line global-require
  
  // Grab all APDs
  const apds = await this('APD').find({}).lean();
  
  const convertContractorResources = contractorResources =>
    contractorResources.map(contractorResource => {
      return {
        ...contractorResource,
        hourly: {
          data: { ...contractorResource.hourly.data }
        },
        useHourly: contractorResource.hourly.useHourly
      };
    });
  
  // Create new object by sections/new schema
  const updatedApds = apds.map(apd => {
    // Add current properties to their respective new parent properties
    console.log('maybe', apd.stateProfile.medicaidDirector);
    return {
      ...apd,
      apdOverview: {
        programOverview: apd.programOverview,
        narrativeHIT: apd.narrativeHIT,
        narrativeHIE: apd.narrativeHIE,
        narrativeMMIS: apd.narrativeMMIS
      },
      keyStatePersonnel: {
        medicaidDirector: apd.stateProfile.medicaidDirector,
        medicaidOffice: apd.stateProfile.medicaidOffice,
        keyPersonnel: apd.keyPersonnel
      },
      previousActivities: {
        previousActivitySummary: apd.previousActivitySummary,
        actualExpenditures: apd.previousActivityExpenses
      },
      // activities: [
      //   ...apd.activities,
      //   contractorResources: convertContractorResources(apd.activities.contractorResources)
      // ],
      proposedBudget: {
        incentivePayments: apd.incentivePayments
      },
      assurancesAndCompliances: apd.federalCitations
    }
  });
  
  console.log("updated apd", updatedApds[0]);
  
  // Save them as new APDs
  try {
    // insert the updated APDs into the mongo database
    const res = apds.forEach( async apd => {
      await this('APD').replaceOne({ _id: apd._id }, { apd });
    });
  } catch (error) {
    logger.error(error);
  }
}

/**
 * Make any changes that UNDO the up function side effects here (if possible)
 */
async function down () {
  // Write migration here
}

module.exports = { up, down };